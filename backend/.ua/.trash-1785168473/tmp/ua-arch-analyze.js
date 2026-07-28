const fs = require('fs');
const path = require('path');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function normPath(p) {
  return String(p || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function commonDirectoryPrefix(paths) {
  const split = paths
    .map(normPath)
    .filter(Boolean)
    .map((p) => p.split('/').slice(0, -1));
  if (!split.length) return [];
  let prefix = split[0];
  for (const parts of split.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < parts.length && prefix[i] === parts[i]) i++;
    prefix = prefix.slice(0, i);
  }
  return prefix;
}

function extensionGroup(filePath, name) {
  const base = name || path.posix.basename(normPath(filePath));
  if (/(\.test\.|\.spec\.|Test\.java$|_test\.go$|_spec\.rb$|Tests\.cs$)/i.test(base)) return 'test';
  if (/\.(config|properties|ya?ml|json|xml|toml)$/i.test(base) || ['pom.xml', 'Dockerfile'].includes(base)) return 'config';
  if (/\.(md|rst)$/i.test(base)) return 'documentation';
  if (/\.sql$/i.test(base)) return 'data';
  return path.posix.extname(base).replace(/^\./, '') || 'root';
}

function directoryGroup(node, prefix, flat) {
  const p = normPath(node.filePath || node.name || node.id);
  const parts = p.split('/').filter(Boolean);
  if (flat) return extensionGroup(p, node.name);
  let remaining = parts;
  if (prefix.length && prefix.every((part, i) => parts[i] === part)) {
    remaining = parts.slice(prefix.length);
  }
  return remaining.length > 1 ? remaining[0] : 'root';
}

function patternFor(group, nodes) {
  const g = group.toLowerCase();
  const dirPatterns = [
    [/^(routes|api|controllers?|endpoints|handlers|serializers|routers|blueprints)$/, 'api'],
    [/^(services?|core|lib|domain|logic|internal|signals|mailers|jobs|channels|composables)$/, 'service'],
    [/^(models?|db|data|persistence|repositories?|repository|entities|entity|migrations|sql|database|schema)$/, 'data'],
    [/^(components|views|pages|ui|layouts|screens)$/, 'ui'],
    [/^(middleware|plugins|interceptors|guards)$/, 'middleware'],
    [/^(utils|helpers|common|shared|tools|pkg|templatetags)$/, 'utility'],
    [/^(config|constants|env|settings|management|commands)$/, 'config'],
    [/^(__tests__|test|tests|spec|specs)$/, 'test'],
    [/^(types|interfaces|schemas|contracts|dtos?|request|response)$/, 'types'],
    [/^hooks$/, 'hooks'],
    [/^(store|state|reducers|actions|slices)$/, 'state'],
    [/^(assets|static|public)$/, 'assets'],
    [/^(cmd|bin)$/, 'entry'],
    [/^(docs|documentation|wiki)$/, 'documentation'],
    [/^(\.github|\.gitlab|\.circleci)$/, 'ci-cd'],
    [/^(deploy|deployment|infra|infrastructure|k8s|kubernetes|helm|charts|terraform|tf|docker)$/, 'infrastructure']
  ];
  for (const [re, label] of dirPatterns) if (re.test(g)) return label;
  const labels = new Map();
  for (const n of nodes) {
    const fp = normPath(n.filePath || n.name);
    const base = path.posix.basename(fp);
    let label = null;
    if (/(\.test\.|\.spec\.|Test\.java$|_test\.go$|_spec\.rb$|Test\.php$|Tests\.cs$)/i.test(base)) label = 'test';
    else if (/\.d\.ts$/i.test(base) || /\.(graphql|gql|proto)$/i.test(base)) label = 'types';
    else if (/Application\.java$|Program\.cs$/i.test(base) || (/^(index\.(ts|js)|__init__\.py)$/i.test(base))) label = 'entry';
    else if (/^(pom\.xml|build\.gradle|Cargo\.toml|go\.mod|Gemfile|composer\.json)$/i.test(base) || /\.(ya?ml|properties|xml|json|toml)$/i.test(base)) label = 'config';
    else if (/^(Dockerfile|docker-compose\..*|docker-compose)$/i.test(base) || /\.(tf|tfvars)$/i.test(base) || /(^|\/)\.github\/workflows\//.test(fp)) label = 'infrastructure';
    else if (/\.sql$/i.test(base)) label = 'data';
    else if (/\.(md|rst)$/i.test(base)) label = 'documentation';
    else if (/^Makefile$/i.test(base)) label = 'infrastructure';
    if (label) labels.set(label, (labels.get(label) || 0) + 1);
  }
  return [...labels.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
}

function main() {
  try {
    const [inputPath, outputPath] = process.argv.slice(2);
    if (!inputPath || !outputPath) throw new Error('Usage: node ua-arch-analyze.js input.json output.json');
    const input = readJson(inputPath);
    const fileNodes = input.fileNodes || [];
    const byId = new Map(fileNodes.map((n) => [n.id, n]));
    const fileIds = new Set(byId.keys());
    const filePaths = fileNodes.map((n) => normPath(n.filePath || n.name));
    const prefix = commonDirectoryPrefix(filePaths);
    const flat = filePaths.every((p) => p.split('/').length <= 1);

    const directoryGroups = {};
    const groupById = {};
    for (const node of fileNodes) {
      const group = directoryGroup(node, prefix, flat);
      groupById[node.id] = group;
      (directoryGroups[group] ||= []).push(node.id);
    }

    const nodeTypeGroups = {};
    for (const node of fileNodes) (nodeTypeGroups[node.type] ||= []).push(node.id);

    const fanIn = Object.fromEntries(fileNodes.map((n) => [n.id, 0]));
    const fanOut = Object.fromEntries(fileNodes.map((n) => [n.id, 0]));
    const inter = new Map();
    const groupImportsFrom = {};
    const groupImportedBy = {};
    const internalEdges = {};
    const totalGroupEdges = {};

    for (const edge of input.importEdges || []) {
      if (!fileIds.has(edge.source) || !fileIds.has(edge.target)) continue;
      fanOut[edge.source]++;
      fanIn[edge.target]++;
      const from = groupById[edge.source];
      const to = groupById[edge.target];
      (groupImportsFrom[from] ||= new Set()).add(to);
      (groupImportedBy[to] ||= new Set()).add(from);
      totalGroupEdges[from] = (totalGroupEdges[from] || 0) + 1;
      if (from !== to) totalGroupEdges[to] = (totalGroupEdges[to] || 0) + 1;
      if (from === to) internalEdges[from] = (internalEdges[from] || 0) + 1;
      const key = `${from}\u0000${to}`;
      inter.set(key, (inter.get(key) || 0) + 1);
    }

    const cross = new Map();
    const nonCodeConnections = [];
    for (const edge of input.allEdges || []) {
      if (!fileIds.has(edge.source) || !fileIds.has(edge.target)) continue;
      const s = byId.get(edge.source);
      const t = byId.get(edge.target);
      const key = `${s.type}\u0000${t.type}\u0000${edge.type}`;
      cross.set(key, (cross.get(key) || 0) + 1);
      if (s.type !== 'file' || t.type !== 'file') nonCodeConnections.push(edge);
    }

    const interGroupImports = [...inter.entries()].map(([key, count]) => {
      const [from, to] = key.split('\u0000');
      return { from, to, count };
    }).sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));

    const intraGroupDensity = {};
    for (const group of Object.keys(directoryGroups)) {
      const total = totalGroupEdges[group] || 0;
      const internal = internalEdges[group] || 0;
      intraGroupDensity[group] = { internalEdges: internal, totalEdges: total, density: total ? internal / total : 0 };
    }

    const patternMatches = {};
    for (const [group, ids] of Object.entries(directoryGroups)) {
      patternMatches[group] = patternFor(group, ids.map((id) => byId.get(id)));
    }

    const infraFiles = fileNodes.filter((n) => {
      const fp = normPath(n.filePath || n.name);
      const base = path.posix.basename(fp);
      return /(^|\/)(Dockerfile|docker-compose(\..*)?|Jenkinsfile|Makefile)$/i.test(fp)
        || /(^|\/)(\.github\/workflows|\.gitlab-ci\.yml|\.circleci)\//i.test(fp)
        || /\.(tf|tfvars)$/i.test(base)
        || /(^|\/)(k8s|kubernetes|helm|charts|docker|deploy|deployment|infra|infrastructure)(\/|$)/i.test(fp)
        || ['service', 'pipeline', 'resource'].includes(n.type);
    }).map((n) => n.filePath || n.name);

    const dataPipeline = {
      schemaFiles: fileNodes.filter((n) => ['schema', 'table'].includes(n.type) || /\.(graphql|gql|proto|sql)$/i.test(n.filePath || n.name)).map((n) => n.filePath || n.name),
      migrationFiles: fileNodes.filter((n) => /migrations?.*\.sql$/i.test(normPath(n.filePath || n.name))).map((n) => n.filePath || n.name),
      dataModelFiles: fileNodes.filter((n) => /(model|entity|repository|persistence)/i.test(n.filePath || '')).map((n) => n.filePath || n.name),
      apiHandlerFiles: fileNodes.filter((n) => /(controller|route|endpoint|handler)/i.test(n.filePath || '') || (n.tags || []).includes('api-handler')).map((n) => n.filePath || n.name)
    };

    const docGroups = new Set();
    for (const node of fileNodes) {
      if (node.type === 'document' || /\.(md|rst)$/i.test(node.filePath || node.name)) docGroups.add(groupById[node.id]);
    }
    const totalGroups = Object.keys(directoryGroups).length;
    const undocumentedGroups = Object.keys(directoryGroups).filter((g) => !docGroups.has(g));

    const dependencyDirection = [];
    const seenPairs = new Set();
    for (const item of interGroupImports) {
      if (item.from === item.to) continue;
      const pair = [item.from, item.to].sort().join('\u0000');
      if (seenPairs.has(pair)) continue;
      seenPairs.add(pair);
      const reverse = inter.get(`${item.to}\u0000${item.from}`) || 0;
      if (item.count > reverse) dependencyDirection.push({ dependent: item.from, dependsOn: item.to });
      else if (reverse > item.count) dependencyDirection.push({ dependent: item.to, dependsOn: item.from });
    }

    writeJson(outputPath, {
      scriptCompleted: true,
      directoryGroups,
      nodeTypeGroups,
      crossCategoryEdges: [...cross.entries()].map(([key, count]) => {
        const [fromType, toType, edgeType] = key.split('\u0000');
        return { fromType, toType, edgeType, count };
      }),
      nonCodeConnections,
      interGroupImports,
      intraGroupDensity,
      patternMatches,
      deploymentTopology: {
        hasDockerfile: infraFiles.some((f) => /(^|\/)Dockerfile$/i.test(normPath(f))),
        hasCompose: infraFiles.some((f) => /docker-compose/i.test(f)),
        hasK8s: infraFiles.some((f) => /(^|\/)(k8s|kubernetes|helm|charts)(\/|$)/i.test(normPath(f))),
        hasTerraform: infraFiles.some((f) => /\.(tf|tfvars)$/i.test(f)),
        hasCI: infraFiles.some((f) => /(^|\/)(\.github\/workflows|\.gitlab-ci\.yml|Jenkinsfile|\.circleci)/i.test(normPath(f))),
        infraFiles
      },
      dataPipeline,
      docCoverage: {
        groupsWithDocs: docGroups.size,
        totalGroups,
        coverageRatio: totalGroups ? docGroups.size / totalGroups : 0,
        undocumentedGroups
      },
      dependencyDirection,
      fileStats: {
        totalFileNodes: fileNodes.length,
        filesPerGroup: Object.fromEntries(Object.entries(directoryGroups).map(([k, v]) => [k, v.length])),
        nodeTypeCounts: Object.fromEntries(Object.entries(nodeTypeGroups).map(([k, v]) => [k, v.length]))
      },
      fileFanIn: fanIn,
      fileFanOut: fanOut
    });
  } catch (err) {
    console.error(err && err.stack ? err.stack : String(err));
    process.exit(1);
  }
}

main();

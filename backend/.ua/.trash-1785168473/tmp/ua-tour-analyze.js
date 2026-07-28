const fs = require('fs');

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function percentileSet(items, countKey, topFraction) {
  const sorted = [...items].sort((a, b) => b[countKey] - a[countKey]);
  const size = Math.max(1, Math.ceil(sorted.length * topFraction));
  return new Set(sorted.slice(0, size).map((item) => item.id));
}

function bottomPercentileSet(items, countKey, bottomFraction) {
  const sorted = [...items].sort((a, b) => a[countKey] - b[countKey]);
  const size = Math.max(1, Math.ceil(sorted.length * bottomFraction));
  return new Set(sorted.slice(0, size).map((item) => item.id));
}

function fileName(pathOrName) {
  return String(pathOrName || '').replace(/\\/g, '/').split('/').pop() || '';
}

function isShallow(pathOrName) {
  const parts = String(pathOrName || '').replace(/\\/g, '/').split('/').filter(Boolean);
  return parts.length <= 2;
}

function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    throw new Error('Usage: node ua-tour-analyze.js <input.json> <output.json>');
  }

  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, ''));
  const nodes = normalizeList(input.nodes);
  const edges = normalizeList(input.edges);
  const layers = normalizeList(input.layers);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  const fanIn = new Map(nodes.map((node) => [node.id, 0]));
  const fanOut = new Map(nodes.map((node) => [node.id, 0]));
  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  const relationKeys = new Set();

  for (const edge of edges) {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) continue;
    fanOut.set(edge.source, (fanOut.get(edge.source) || 0) + 1);
    fanIn.set(edge.target, (fanIn.get(edge.target) || 0) + 1);
    adjacency.get(edge.source).push(edge);
    relationKeys.add(`${edge.source}\u0000${edge.target}\u0000${edge.type || ''}`);
  }

  const rankBase = nodes.map((node) => ({
    id: node.id,
    name: node.name || fileName(node.filePath || node.id),
    fanIn: fanIn.get(node.id) || 0,
    fanOut: fanOut.get(node.id) || 0
  }));

  const fanInRanking = [...rankBase]
    .sort((a, b) => b.fanIn - a.fanIn || a.id.localeCompare(b.id))
    .slice(0, 20)
    .map(({ id, fanIn, name }) => ({ id, fanIn, name }));

  const fanOutRanking = [...rankBase]
    .sort((a, b) => b.fanOut - a.fanOut || a.id.localeCompare(b.id))
    .slice(0, 20)
    .map(({ id, fanOut, name }) => ({ id, fanOut, name }));

  const highFanOut = percentileSet(rankBase, 'fanOut', 0.10);
  const lowFanIn = bottomPercentileSet(rankBase, 'fanIn', 0.25);
  const entryNames = new Set([
    'index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js',
    'server.ts', 'server.js', 'mod.rs', 'main.go', 'main.py', 'main.rs',
    'manage.py', 'app.py', 'wsgi.py', 'asgi.py', 'run.py', '__main__.py',
    'Application.java', 'Main.java', 'Program.cs', 'config.ru', 'index.php',
    'App.swift', 'Application.kt', 'main.cpp', 'main.c'
  ]);

  const entryPointCandidates = nodes.map((node) => {
    let score = 0;
    const name = node.name || fileName(node.filePath || node.id);
    const path = node.filePath || name;
    if (node.type === 'file') {
      if (entryNames.has(name) || /Application\.java$/.test(name)) score += 3;
      if (isShallow(path)) score += 1;
      if (highFanOut.has(node.id)) score += 1;
      if (lowFanIn.has(node.id)) score += 1;
    }
    if (node.type === 'document') {
      const normalized = String(path).replace(/\\/g, '/');
      if (normalized === 'README.md') score += 5;
      else if (!normalized.includes('/') && normalized.endsWith('.md')) score += 2;
    }
    return {
      id: node.id,
      score,
      name,
      summary: node.summary || ''
    };
  }).filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 5);

  const topCodeEntry = entryPointCandidates.find((candidate) => {
    const node = nodeById.get(candidate.id);
    return node && node.type === 'file';
  }) || nodes.find((node) => node.id === 'file:src/main/java/org/akira/ladux/LaduxApplication.java');

  const bfsTraversal = {
    startNode: topCodeEntry ? topCodeEntry.id : null,
    order: [],
    depthMap: {},
    byDepth: {}
  };

  if (topCodeEntry) {
    const queue = [topCodeEntry.id];
    bfsTraversal.depthMap[topCodeEntry.id] = 0;
    while (queue.length) {
      const current = queue.shift();
      const depth = bfsTraversal.depthMap[current];
      bfsTraversal.order.push(current);
      bfsTraversal.byDepth[depth] = bfsTraversal.byDepth[depth] || [];
      bfsTraversal.byDepth[depth].push(current);
      for (const edge of adjacency.get(current) || []) {
        if (!['imports', 'calls'].includes(edge.type)) continue;
        if (bfsTraversal.depthMap[edge.target] !== undefined) continue;
        bfsTraversal.depthMap[edge.target] = depth + 1;
        queue.push(edge.target);
      }
    }
  }

  const nonCodeFiles = {
    documentation: [],
    infrastructure: [],
    data: [],
    config: []
  };

  for (const node of nodes) {
    const item = {
      id: node.id,
      name: node.name || fileName(node.filePath || node.id),
      type: node.type,
      summary: node.summary || ''
    };
    if (node.type === 'document') nonCodeFiles.documentation.push(item);
    if (['service', 'pipeline', 'resource'].includes(node.type)) nonCodeFiles.infrastructure.push(item);
    if (['table', 'schema', 'endpoint'].includes(node.type)) nonCodeFiles.data.push(item);
    if (node.type === 'config') nonCodeFiles.config.push(item);
  }

  const clusters = [];
  const seenPairs = new Set();
  for (const edge of edges) {
    if (!['imports', 'calls'].includes(edge.type) || !nodeById.has(edge.source) || !nodeById.has(edge.target)) continue;
    const reverse = `${edge.target}\u0000${edge.source}\u0000${edge.type}`;
    if (!relationKeys.has(reverse)) continue;
    const pair = [edge.source, edge.target].sort();
    const pairKey = pair.join('\u0000');
    if (seenPairs.has(pairKey)) continue;
    seenPairs.add(pairKey);
    const cluster = new Set(pair);
    let changed = true;
    while (changed && cluster.size < 5) {
      changed = false;
      for (const node of nodes) {
        if (cluster.has(node.id)) continue;
        let links = 0;
        for (const member of cluster) {
          const forward = (adjacency.get(node.id) || []).some((e) => e.target === member);
          const backward = (adjacency.get(member) || []).some((e) => e.target === node.id);
          if (forward || backward) links += 1;
        }
        if (links >= 2) {
          cluster.add(node.id);
          changed = true;
          if (cluster.size >= 5) break;
        }
      }
    }
    let edgeCount = 0;
    const ids = [...cluster];
    for (const e of edges) {
      if (ids.includes(e.source) && ids.includes(e.target)) edgeCount += 1;
    }
    clusters.push({ nodes: ids, edgeCount });
  }

  const nodeSummaryIndex = {};
  for (const node of nodes) {
    nodeSummaryIndex[node.id] = {
      name: node.name || fileName(node.filePath || node.id),
      type: node.type,
      summary: node.summary || ''
    };
  }

  const output = {
    scriptCompleted: true,
    entryPointCandidates,
    fanInRanking,
    fanOutRanking,
    bfsTraversal,
    nonCodeFiles,
    clusters: clusters.sort((a, b) => b.edgeCount - a.edgeCount).slice(0, 10),
    layers: {
      count: layers.length,
      list: layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        description: layer.description
      }))
    },
    nodeSummaryIndex,
    totalNodes: nodes.length,
    totalEdges: edges.length
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
}

try {
  main();
  process.exit(0);
} catch (error) {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

const [inputPath, resultsPath, outputPath] = process.argv.slice(2);
if (!inputPath || !resultsPath || !outputPath) {
  console.error('Usage: node ua-arch-assign-layers.js input.json results.json layers.json');
  process.exit(1);
}

const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

const layerDefs = [
  {
    id: 'layer:api',
    name: 'API Layer',
    description: 'Spring MVC controllers expose Ladux admin and user REST endpoints for authentication, catalog, order, payment, inventory, and account workflows.',
    nodeIds: []
  },
  {
    id: 'layer:service',
    name: 'Service Layer',
    description: 'Business services and implementations coordinate Ladux domain rules for shopping, inventory, payments, coupons, notifications, reviews, and users.',
    nodeIds: []
  },
  {
    id: 'layer:data',
    name: 'Data Layer',
    description: 'JPA entities, repositories, enums, SQL migrations, seed data, and schema nodes define Ladux persistence over PostgreSQL.',
    nodeIds: []
  },
  {
    id: 'layer:types',
    name: 'DTO And Contract Layer',
    description: 'Request, response, and transfer objects define the payload contracts exchanged between Ladux controllers, services, and clients.',
    nodeIds: []
  },
  {
    id: 'layer:config',
    name: 'Configuration And Security',
    description: 'Spring Boot configuration, JWT and OAuth security components, exception handling, application entry point, and project build settings configure Ladux runtime behavior.',
    nodeIds: []
  },
  {
    id: 'layer:utility',
    name: 'Utility Layer',
    description: 'Shared helper classes provide reusable SKU, slug, and security support used across Ladux application code.',
    nodeIds: []
  },
  {
    id: 'layer:test',
    name: 'Test Layer',
    description: 'JUnit and Spring integration tests verify Ladux controllers, repositories, services, persistence, storage, pricing, and business flows.',
    nodeIds: []
  },
  {
    id: 'layer:infrastructure',
    name: 'Infrastructure',
    description: 'Docker and compose assets describe how the Ladux backend and its dependent services are built and deployed.',
    nodeIds: []
  },
  {
    id: 'layer:documentation',
    name: 'Documentation',
    description: 'Markdown documentation captures Ladux project guidance, operational notes, and API or development references.',
    nodeIds: []
  }
];

const layers = Object.fromEntries(layerDefs.map((layer) => [layer.id, layer]));

function normalize(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function layerFor(node) {
  const p = normalize(node.filePath || node.name || node.id);
  const base = path.posix.basename(p);

  if (node.type === 'document' || /\.(md|rst)$/i.test(base)) return 'layer:documentation';
  if (node.type === 'pipeline' || node.type === 'service' || node.type === 'resource') return 'layer:infrastructure';
  if (/^(Dockerfile|docker-compose(\..*)?|Makefile|Jenkinsfile)$/i.test(base) || /\.(tf|tfvars)$/i.test(base) || /(^|\/)(\.github\/workflows|docker|deploy|deployment|infra|infrastructure|k8s|kubernetes|helm|charts)(\/|$)/i.test(p)) return 'layer:infrastructure';
  if (node.type === 'table' || node.type === 'schema' || node.type === 'endpoint') return 'layer:data';
  if (/\.sql$/i.test(base) || /(^|\/)src\/main\/resources\/db\/migration\//i.test(p)) return 'layer:data';
  if (/src\/test\//i.test(p) || /Test\.java$/i.test(base)) return 'layer:test';
  if (/\/controller\//i.test(p)) return 'layer:api';
  if (/\/service\//i.test(p)) return 'layer:service';
  if (/\/repository\//i.test(p) || /\/model\//i.test(p)) return 'layer:data';
  if (/\/dto\//i.test(p)) return 'layer:types';
  if (/\/utils?\//i.test(p)) return 'layer:utility';
  if (node.type === 'config' || /\/config\//i.test(p) || /\/exception\//i.test(p) || /Application\.java$/i.test(base) || /\.(properties|ya?ml|json|xml|toml)$/i.test(base) || /^pom\.xml$/i.test(base)) return 'layer:config';
  return 'layer:config';
}

for (const node of input.fileNodes) {
  layers[layerFor(node)].nodeIds.push(node.id);
}

const output = layerDefs.filter((layer) => layer.nodeIds.length > 0);
const seen = new Set();
const duplicates = [];
for (const layer of output) {
  layer.nodeIds.sort();
  for (const id of layer.nodeIds) {
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
  }
}

const expected = new Set(input.fileNodes.map((node) => node.id));
const missing = [...expected].filter((id) => !seen.has(id));
const extra = [...seen].filter((id) => !expected.has(id));
if (duplicates.length || missing.length || extra.length || seen.size !== results.fileStats.totalFileNodes) {
  console.error(JSON.stringify({ duplicates, missing, extra, assigned: seen.size, expected: results.fileStats.totalFileNodes }, null, 2));
  process.exit(1);
}

if (output.length < 3 || output.length > 10) {
  console.error(`Invalid layer count: ${output.length}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(JSON.stringify(output.map((layer) => ({ name: layer.name, count: layer.nodeIds.length })), null, 2));

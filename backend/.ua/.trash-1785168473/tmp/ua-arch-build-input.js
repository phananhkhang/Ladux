const fs = require('fs');
const path = require('path');

function main() {
  const [graphPath, outputPath] = process.argv.slice(2);
  if (!graphPath || !outputPath) {
    console.error('Usage: node ua-arch-build-input.js assembled-graph.json output.json');
    process.exit(1);
  }

  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8').replace(/^\uFEFF/, ''));
  const allowedTypes = new Set(['file', 'config', 'document', 'service', 'pipeline', 'table', 'schema', 'resource', 'endpoint']);
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];

  const fileNodes = nodes
    .filter((node) => allowedTypes.has(node.type) && (node.filePath || node.name || node.id))
    .map((node) => ({
      id: node.id,
      type: node.type,
      name: node.name,
      filePath: node.filePath || node.name || node.id.replace(/^[^:]+:/, ''),
      summary: node.summary || '',
      tags: Array.isArray(node.tags) ? node.tags : []
    }));

  const fileIds = new Set(fileNodes.map((node) => node.id));
  const fileLevelEdges = edges.filter((edge) => fileIds.has(edge.source) && fileIds.has(edge.target));
  const importEdges = fileLevelEdges.filter((edge) => edge.type === 'imports');
  const allEdges = fileLevelEdges.filter((edge) => edge.type !== 'contains');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({ fileNodes, importEdges, allEdges }, null, 2));
}

main();

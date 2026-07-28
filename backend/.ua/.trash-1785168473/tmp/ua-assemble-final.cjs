const fs = require('fs');
const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const graph = readJson('.ua/intermediate/assembled-graph.json');
const scan = readJson('.ua/intermediate/scan-result.json');
const layers = readJson('.ua/intermediate/layers.json');
const tour = readJson('.ua/intermediate/tour.json');
const finalGraph = {
  version: '1.0.0',
  project: {
    name: scan.name,
    languages: scan.languages,
    frameworks: scan.frameworks,
    description: scan.description,
    analyzedAt: new Date().toISOString(),
    gitCommitHash: 'f67a53e86f6dfc92fc1537f30627b0ab450132fa'
  },
  nodes: graph.nodes || [],
  edges: graph.edges || [],
  layers: Array.isArray(layers) ? layers : (layers.layers || []),
  tour: Array.isArray(tour) ? tour : (tour.steps || [])
};
fs.writeFileSync('.ua/intermediate/assembled-graph.json', JSON.stringify(finalGraph, null, 2));
console.log(`nodes=${finalGraph.nodes.length} edges=${finalGraph.edges.length} layers=${finalGraph.layers.length} tour=${finalGraph.tour.length}`);
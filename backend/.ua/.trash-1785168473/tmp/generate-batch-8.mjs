import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ua = fs.existsSync(path.join(root, '.understand-anything')) ? '.understand-anything' : '.ua';
const batches = JSON.parse(fs.readFileSync(path.join(root, ua, 'intermediate', 'batches.json'), 'utf8'));
const batch = batches.batches.find((b) => b.batchIndex === 8);
const extract = JSON.parse(fs.readFileSync(path.join(root, ua, 'tmp', 'ua-file-extract-results-8.json'), 'utf8'));

const fileSummaries = {
  'src/main/java/org/akira/ladux/controller/admin/AdminOrderItemController.java': {
    summary: 'Exposes admin-only order item endpoints for paginated listing, lookup by item id, and lookup by order id through the order item service.',
    tags: ['api-handler', 'admin-api', 'order-items', 'pagination'],
  },
  'src/main/java/org/akira/ladux/controller/admin/AdminProductImageController.java': {
    summary: 'Exposes admin product image endpoints for adding image URLs, uploading multipart image files, and deleting images for a product.',
    tags: ['api-handler', 'admin-api', 'product-images', 'upload'],
  },
  'src/main/java/org/akira/ladux/controller/user/ProductImageController.java': {
    summary: 'Provides the public product image endpoint that returns all images associated with a product.',
    tags: ['api-handler', 'public-api', 'product-images', 'catalog'],
  },
  'src/main/java/org/akira/ladux/dto/response/OrderItemResponse.java': {
    summary: 'Defines the serializable order item response projection and maps order item entities into API-safe response records.',
    tags: ['data-transfer', 'serialization', 'order-items', 'mapper'],
  },
  'src/main/java/org/akira/ladux/dto/response/ProductImageResponse.java': {
    summary: 'Defines the serializable product image response projection and maps product image entities to id and image URL values.',
    tags: ['data-transfer', 'serialization', 'product-images', 'mapper'],
  },
  'src/main/java/org/akira/ladux/exception/ResourceNotFoundException.java': {
    summary: 'Defines the shared runtime exception used when requested domain resources cannot be found.',
    tags: ['exception', 'error-handling', 'domain-error', 'shared'],
  },
  'src/main/java/org/akira/ladux/model/OrderItem.java': {
    summary: 'Models the order_items JPA entity with lazy links to an order and product variant plus purchase quantity and captured price.',
    tags: ['data-model', 'jpa-entity', 'order-items', 'database'],
  },
  'src/main/java/org/akira/ladux/model/ProductImage.java': {
    summary: 'Models secondary product images as a JPA entity linked to products, with lifecycle hooks forcing image records to non-primary status.',
    tags: ['data-model', 'jpa-entity', 'product-images', 'lifecycle-hook'],
  },
  'src/main/java/org/akira/ladux/repository/OrderItemRepository.java': {
    summary: 'Provides Spring Data JPA access to order items with entity graphs for eager order and product loading in list, lookup, and order-scoped queries.',
    tags: ['repository', 'spring-data', 'order-items', 'persistence'],
  },
  'src/main/java/org/akira/ladux/repository/ProductImageRepository.java': {
    summary: 'Provides Spring Data JPA access to product image records, including lookup by owning product id.',
    tags: ['repository', 'spring-data', 'product-images', 'persistence'],
  },
  'src/main/java/org/akira/ladux/service/OrderItemService.java': {
    summary: 'Declares the order item service contract for paginated admin listing, single item lookup, and order-scoped lookup.',
    tags: ['service-contract', 'order-items', 'pagination', 'api-boundary'],
  },
  'src/main/java/org/akira/ladux/service/ProductImageService.java': {
    summary: 'Declares the product image service contract for reading, adding URL-based images, uploading files, and deleting product images.',
    tags: ['service-contract', 'product-images', 'upload', 'api-boundary'],
  },
  'src/main/java/org/akira/ladux/service/impl/OrderItemServiceImpl.java': {
    summary: 'Implements cached read-only order item queries, mapping repository results to order item response DTOs and raising not-found errors for missing ids.',
    tags: ['service', 'order-items', 'caching', 'pagination'],
  },
  'src/main/java/org/akira/ladux/service/impl/ProductImageServiceImpl.java': {
    summary: 'Implements product image reads and mutations with cache eviction, product validation, file storage integration, thumbnail assignment, and local-file cleanup on deletion.',
    tags: ['service', 'product-images', 'upload', 'caching', 'file-storage'],
    complexity: 'moderate',
    languageNotes: 'Uses Spring caching annotations with transactional service methods and a value-injected upload directory.',
  },
};

const classSummaries = {
  AdminOrderItemController: 'Handles admin REST requests for order item listing and lookup operations.',
  AdminProductImageController: 'Handles admin REST requests for creating, uploading, and deleting product image resources.',
  ProductImageController: 'Handles public REST requests for retrieving product images by product id.',
  OrderItemResponse: 'Serializable response record representing the exposed order item fields returned by APIs.',
  ProductImageResponse: 'Serializable response record representing a product image id and URL.',
  ResourceNotFoundException: 'Runtime exception class for missing resources in service-layer workflows.',
  OrderItem: 'JPA entity class for persisted order line items and their relationships to orders and product variants.',
  ProductImage: 'JPA entity class for secondary product image records associated with products.',
  OrderItemRepository: 'Spring Data repository interface for order item persistence and entity-graph-backed queries.',
  ProductImageRepository: 'Spring Data repository interface for product image persistence and product-scoped lookup.',
  OrderItemService: 'Service contract for order item retrieval operations.',
  ProductImageService: 'Service contract for product image retrieval and mutation operations.',
  OrderItemServiceImpl: 'Service implementation for cached order item retrieval and DTO mapping.',
  ProductImageServiceImpl: 'Service implementation for product image storage, upload handling, deletion, and cache invalidation.',
};

const functionSummaries = {
  getAllOrderItems: 'Returns a paginated collection of order item response DTOs.',
  getOrderItemById: 'Returns one order item response by id or raises a not-found exception.',
  getOrderItemsByOrderId: 'Returns paginated order item responses for a specific order id.',
  addSecondaryImages: 'Adds secondary product image URLs for a product through the admin API.',
  uploadProductImage: 'Uploads multipart product image files and returns created image responses.',
  deleteProductImageById: 'Deletes a product image for a product and returns an empty success response.',
  getProductImagesByProductId: 'Returns all image responses associated with a product id.',
  fromEntity: 'Maps a domain entity instance into its response record representation.',
  ResourceNotFoundException: 'Constructs a not-found exception with the supplied message.',
  findAll: 'Loads paginated order items with the repository entity graph.',
  findById: 'Loads one order item by id with the repository entity graph.',
  findByOrderId: 'Loads paginated order items filtered by order id.',
  findByProductId: 'Loads product image records for a product id.',
  addImages: 'Creates secondary product image records from supplied image URLs.',
  uploadImage: 'Stores uploaded image files, persists image records, and assigns the first thumbnail when needed.',
  forceSecondaryImage: 'Forces persisted product image records to remain secondary images.',
};

function baseName(filePath) {
  return filePath.split('/').pop();
}

function nodeIdForFile(filePath) {
  return `file:${filePath}`;
}

function complexityFor(result) {
  if (fileSummaries[result.path]?.complexity) return fileSummaries[result.path].complexity;
  if (result.nonEmptyLines > 200) return 'complex';
  if (result.nonEmptyLines >= 50 || result.metrics?.functionCount > 5 || result.metrics?.classCount > 2) return 'moderate';
  return 'simple';
}

function lineCount(item) {
  if (Number.isInteger(item.startLine) && Number.isInteger(item.endLine)) return item.endLine - item.startLine + 1;
  return 0;
}

const nodes = [];
const edges = [];
const nodeIds = new Set();

function addNode(node) {
  if (nodeIds.has(node.id)) return false;
  nodeIds.add(node.id);
  nodes.push(node);
  return true;
}

function addEdge(edge) {
  if (edge.source === edge.target) return;
  const key = `${edge.source}|${edge.target}|${edge.type}`;
  if (edges.some((e) => `${e.source}|${e.target}|${e.type}` === key)) return;
  edges.push({ ...edge, direction: 'forward' });
}

for (const result of extract.results) {
  const meta = fileSummaries[result.path];
  addNode({
    id: nodeIdForFile(result.path),
    type: 'file',
    name: baseName(result.path),
    filePath: result.path,
    summary: meta.summary,
    tags: meta.tags,
    complexity: complexityFor(result),
    ...(meta.languageNotes ? { languageNotes: meta.languageNotes } : {}),
  });
}

const exportedByPath = new Map(extract.results.map((r) => [r.path, new Set((r.exports || []).map((e) => e.name))]));

for (const result of extract.results) {
  const exported = exportedByPath.get(result.path) || new Set();
  for (const cls of result.classes || []) {
    const significant = (cls.methods?.length || 0) >= 2 || lineCount(cls) >= 20 || exported.has(cls.name);
    if (!significant) continue;
    const id = `class:${result.path}:${cls.name}`;
    addNode({
      id,
      type: 'class',
      name: cls.name,
      filePath: result.path,
      lineRange: [cls.startLine, cls.endLine],
      summary: classSummaries[cls.name] || `Defines the ${cls.name} Java type used by this package.`,
      tags: result.path.includes('/controller/') ? ['api-handler', 'spring-web', 'controller'] :
        result.path.includes('/repository/') ? ['repository', 'spring-data', 'persistence'] :
        result.path.includes('/service/impl/') ? ['service', 'implementation', 'business-logic'] :
        result.path.includes('/service/') ? ['service-contract', 'interface', 'api-boundary'] :
        result.path.includes('/model/') ? ['data-model', 'jpa-entity', 'persistence'] :
        result.path.includes('/dto/') ? ['data-transfer', 'serialization', 'record'] :
        result.path.includes('/exception/') ? ['exception', 'error-handling', 'runtime'] :
        ['java', 'type-definition', 'application'],
      complexity: lineCount(cls) >= 80 ? 'moderate' : 'simple',
    });
    addEdge({ source: nodeIdForFile(result.path), target: id, type: 'contains', weight: 1.0 });
    if (exported.has(cls.name)) addEdge({ source: nodeIdForFile(result.path), target: id, type: 'exports', weight: 0.8 });
  }

  for (const fn of result.functions || []) {
    const significant = lineCount(fn) >= 10 || exported.has(fn.name);
    if (!significant) continue;
    const id = `function:${result.path}:${fn.name}`;
    addNode({
      id,
      type: 'function',
      name: fn.name,
      filePath: result.path,
      lineRange: [fn.startLine, fn.endLine],
      summary: functionSummaries[fn.name] || `Implements the ${fn.name} operation for this file.`,
      tags: result.path.includes('/controller/') ? ['endpoint-method', 'spring-web', 'api-handler'] :
        result.path.includes('/repository/') ? ['repository-query', 'spring-data', 'persistence'] :
        result.path.includes('/service/impl/') ? ['service-method', 'business-logic', 'transactional'] :
        result.path.includes('/service/') ? ['service-contract', 'interface-method', 'api-boundary'] :
        result.path.includes('/dto/') ? ['mapper', 'serialization', 'data-transfer'] :
        result.path.includes('/model/') ? ['entity-hook', 'jpa-entity', 'persistence'] :
        result.path.includes('/exception/') ? ['constructor', 'exception', 'error-handling'] :
        ['java', 'function', 'application'],
      complexity: lineCount(fn) >= 30 ? 'moderate' : 'simple',
    });
    addEdge({ source: nodeIdForFile(result.path), target: id, type: 'contains', weight: 1.0 });
    if (exported.has(fn.name)) addEdge({ source: nodeIdForFile(result.path), target: id, type: 'exports', weight: 0.8 });
  }
}

for (const [sourcePath, targets] of Object.entries(batch.batchImportData)) {
  for (const targetPath of targets) {
    addEdge({
      source: nodeIdForFile(sourcePath),
      target: nodeIdForFile(targetPath),
      type: 'imports',
      weight: 0.7,
    });
  }
}

const implementsEdges = [
  ['src/main/java/org/akira/ladux/service/impl/OrderItemServiceImpl.java', 'OrderItemServiceImpl', 'src/main/java/org/akira/ladux/service/OrderItemService.java', 'OrderItemService'],
  ['src/main/java/org/akira/ladux/service/impl/ProductImageServiceImpl.java', 'ProductImageServiceImpl', 'src/main/java/org/akira/ladux/service/ProductImageService.java', 'ProductImageService'],
];
for (const [srcPath, srcClass, targetPath, targetClass] of implementsEdges) {
  addEdge({
    source: `class:${srcPath}:${srcClass}`,
    target: `class:${targetPath}:${targetClass}`,
    type: 'implements',
    weight: 0.9,
  });
}

const callEdges = [
  ['function:src/main/java/org/akira/ladux/controller/admin/AdminOrderItemController.java:getAllOrderItems', 'function:src/main/java/org/akira/ladux/service/OrderItemService.java:getAllOrderItems'],
  ['function:src/main/java/org/akira/ladux/controller/admin/AdminOrderItemController.java:getOrderItemById', 'function:src/main/java/org/akira/ladux/service/OrderItemService.java:getOrderItemById'],
  ['function:src/main/java/org/akira/ladux/controller/admin/AdminOrderItemController.java:getOrderItemsByOrderId', 'function:src/main/java/org/akira/ladux/service/OrderItemService.java:getOrderItemsByOrderId'],
  ['function:src/main/java/org/akira/ladux/controller/admin/AdminProductImageController.java:addSecondaryImages', 'function:src/main/java/org/akira/ladux/service/ProductImageService.java:addImages'],
  ['function:src/main/java/org/akira/ladux/controller/admin/AdminProductImageController.java:uploadProductImage', 'function:src/main/java/org/akira/ladux/service/ProductImageService.java:uploadImage'],
  ['function:src/main/java/org/akira/ladux/controller/admin/AdminProductImageController.java:deleteProductImageById', 'function:src/main/java/org/akira/ladux/service/ProductImageService.java:deleteProductImageById'],
  ['function:src/main/java/org/akira/ladux/controller/user/ProductImageController.java:getProductImagesByProductId', 'function:src/main/java/org/akira/ladux/service/ProductImageService.java:getProductImagesByProductId'],
  ['function:src/main/java/org/akira/ladux/service/impl/OrderItemServiceImpl.java:getAllOrderItems', 'function:src/main/java/org/akira/ladux/dto/response/OrderItemResponse.java:fromEntity'],
  ['function:src/main/java/org/akira/ladux/service/impl/OrderItemServiceImpl.java:getOrderItemById', 'function:src/main/java/org/akira/ladux/dto/response/OrderItemResponse.java:fromEntity'],
  ['function:src/main/java/org/akira/ladux/service/impl/OrderItemServiceImpl.java:getOrderItemsByOrderId', 'function:src/main/java/org/akira/ladux/dto/response/OrderItemResponse.java:fromEntity'],
  ['function:src/main/java/org/akira/ladux/service/impl/ProductImageServiceImpl.java:getProductImagesByProductId', 'function:src/main/java/org/akira/ladux/dto/response/ProductImageResponse.java:fromEntity'],
  ['function:src/main/java/org/akira/ladux/service/impl/ProductImageServiceImpl.java:addImages', 'function:src/main/java/org/akira/ladux/dto/response/ProductImageResponse.java:fromEntity'],
  ['function:src/main/java/org/akira/ladux/service/impl/ProductImageServiceImpl.java:uploadImage', 'function:src/main/java/org/akira/ladux/dto/response/ProductImageResponse.java:fromEntity'],
];
for (const [source, target] of callEdges) {
  if (nodeIds.has(source) && nodeIds.has(target)) addEdge({ source, target, type: 'calls', weight: 0.8 });
}

const importEdgeCount = edges.filter((e) => e.type === 'imports').length;
const expectedImports = Object.values(batch.batchImportData).reduce((sum, arr) => sum + arr.length, 0);
if (importEdgeCount !== expectedImports) {
  throw new Error(`Expected ${expectedImports} import edges, emitted ${importEdgeCount}`);
}

for (const node of nodes) {
  for (const field of ['id', 'type', 'name', 'summary', 'tags', 'complexity']) {
    if (!(field in node)) throw new Error(`Node ${node.id} missing ${field}`);
  }
  if (!Array.isArray(node.tags) || node.tags.length === 0) throw new Error(`Node ${node.id} has no tags`);
}

for (const edge of edges) {
  for (const field of ['source', 'target', 'type', 'direction', 'weight']) {
    if (!(field in edge)) throw new Error(`Edge missing ${field}: ${JSON.stringify(edge)}`);
  }
  const sourceOk = nodeIds.has(edge.source);
  const targetOk = nodeIds.has(edge.target) || edge.target.startsWith('file:');
  if (!sourceOk || !targetOk) throw new Error(`Invalid edge endpoint: ${JSON.stringify(edge)}`);
}

const output = { nodes, edges };
const outPath = path.join(root, ua, 'intermediate', 'batch-8.json');
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
JSON.parse(fs.readFileSync(outPath, 'utf8'));
console.log(JSON.stringify({ outPath, nodes: nodes.length, edges: edges.length, skipped: extract.filesSkipped || [] }));

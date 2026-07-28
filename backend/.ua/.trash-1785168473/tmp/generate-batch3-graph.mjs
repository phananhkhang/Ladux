import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const batchIndex = 3;
const batch = JSON.parse(fs.readFileSync(path.join(root, ".ua/intermediate/batches.json"), "utf8"))
  .batches.find((item) => item.batchIndex === batchIndex);
const extracted = JSON.parse(fs.readFileSync(path.join(root, ".ua/tmp/ua-file-extract-results-3.json"), "utf8"));

const batchFiles = new Map(batch.files.map((file) => [file.path, file]));
const importData = batch.batchImportData;
const exportedByPath = new Map(extracted.results.map((file) => [
  file.path,
  new Set((file.exports || []).map((entry) => entry.name)),
]));

const nodes = [];
const edges = [];
const nodeIds = new Set();

function baseName(filePath) {
  return filePath.split(/[\\/]/).pop();
}

function addNode(node) {
  if (nodeIds.has(node.id)) return;
  nodeIds.add(node.id);
  nodes.push(node);
}

function addEdge(edge) {
  if (edge.source === edge.target) return;
  edges.push({ ...edge, direction: "forward" });
}

function complexity(nonEmptyLines, result) {
  const definitionCount = (result.classes?.length || 0) + (result.functions?.length || 0);
  if (nonEmptyLines > 200 || definitionCount > 12) return "complex";
  if (nonEmptyLines >= 50 || definitionCount >= 3) return "moderate";
  return "simple";
}

function fileTags(filePath) {
  if (filePath.includes("/controller/")) return ["api-handler", "admin-api", "rest-controller", "inventory"];
  if (filePath.includes("/dto/request/")) return ["data-transfer", "validation", "request-model", "inventory"];
  if (filePath.includes("/dto/response/")) return ["data-transfer", "serialization", "response-model", "inventory"];
  if (filePath.includes("/exception/")) return ["error-handling", "domain-exception", "validation", "inventory"];
  if (filePath.includes("/model/enums/")) return ["data-model", "enum", "domain-state", "inventory"];
  if (filePath.includes("/model/")) return ["data-model", "jpa-entity", "database", "inventory"];
  if (filePath.includes("/repository/")) return ["repository", "database", "spring-data", "inventory"];
  if (filePath.includes("/service/impl/")) return ["service", "business-logic", "transactional", "inventory"];
  if (filePath.includes("/service/")) return ["service", "business-logic", "domain-workflow", "inventory"];
  if (filePath.includes("/src/test/")) return ["test", "integration-test", "inventory", "stock-movement"];
  return ["code", "java", "backend"];
}

function fileSummary(filePath) {
  const name = baseName(filePath).replace(".java", "");
  if (name === "AdminPurchaseOrderController") return "Exposes admin REST endpoints for listing, creating, updating, and receiving purchase orders. It delegates purchase-order workflows to the service layer and accepts authenticated user context for auditable actions.";
  if (name === "AdminStockMovementController") return "Exposes admin REST endpoints for stock movement browsing and manual stock adjustments. It routes pagination, product filtering, and authenticated adjustment requests into the stock movement service.";
  if (name === "PurchaseOrderCreateRequest") return "Defines the request payload for creating purchase orders, including supplier selection and line items. Bean validation annotations constrain the required purchase-order input.";
  if (name === "PurchaseOrderItemRequest") return "Defines a validated line-item request for purchase orders with product, quantity, and unit cost fields. It is embedded by purchase-order creation and receiving payloads.";
  if (name === "PurchaseOrderReceiveRequest") return "Defines the payload used when receiving goods against a purchase order. It captures received quantities per line and optional receiving notes for the inventory workflow.";
  if (name === "PurchaseOrderStatusUpdateRequest") return "Defines the request body for changing a purchase order status. The payload is intentionally small and centers on the target purchase-order state.";
  if (name === "StockMovementRequest") return "Defines the validated request body for manual stock adjustments. It captures product, quantity, movement type, and explanatory note data used by admin inventory operations.";
  if (name === "PurchaseOrderItemResponse") return "Serializes purchase-order line items for API responses. Its mapper flattens product details, ordered quantities, received quantities, and unit costs from the entity model.";
  if (name === "PurchaseOrderResponse") return "Serializes purchase orders into detailed and summary API response records. It maps supplier, status, totals, item lines, and audit timestamps from purchase-order entities.";
  if (name === "StockMovementResponse") return "Serializes stock movement ledger entries for API responses. The mapper exposes product, signed quantity, movement type, reference, note, actor, and timestamp data.";
  if (name === "InsufficientStockException") return "Provides a domain exception for stock checks that fail because available inventory cannot satisfy a requested operation.";
  if (name === "PurchaseOrder") return "Models a supplier purchase order as a JPA entity with status, totals, received counts, audit users, and owned line items. It anchors the inbound inventory replenishment workflow.";
  if (name === "PurchaseOrderItem") return "Models an individual product line within a purchase order. It stores ordered quantity, received quantity, unit cost, and the parent purchase-order relationship.";
  if (name === "StockMovement") return "Models a stock ledger entry recording signed inventory quantity changes. It tracks the product, movement type, reference type, reference id, note, creator, and creation timestamp.";
  if (name === "PurchaseOrderStatus") return "Enumerates the lifecycle states used by purchase orders from draft through ordered, partially received, received, and cancelled.";
  if (name === "StockMovementType") return "Enumerates stock movement categories used by the inventory ledger, covering sales, returns, purchase receipts, adjustments, damage, and corrections.";
  if (name === "StockReferenceType") return "Enumerates the source object types that can be attached to stock movement records, such as orders, purchase orders, and manual adjustments.";
  if (name === "ProductRepository") return "Defines Spring Data queries for product lookup, filtering, search, category checks, and pessimistic locking. Inventory services use its locked product query for stock-safe updates.";
  if (name === "PurchaseOrderItemRepository") return "Defines Spring Data access for purchase-order line items, including lookup by parent purchase order id.";
  if (name === "PurchaseOrderRepository") return "Defines Spring Data access patterns for purchase orders, including status and supplier filters plus eager item loading for update workflows.";
  if (name === "StockMovementRepository") return "Defines stock movement ledger queries for product-specific history and paginated global movement browsing.";
  if (name === "OrderLifecycleService") return "Coordinates order payment confirmation and cancellation side effects, including status transitions, stock movement records, inventory restoration, and coupon rollback.";
  if (name === "PurchaseOrderService") return "Declares the purchase-order service contract for admin purchase-order management, including creation, lookup, status changes, and goods receipt.";
  if (name === "StockMovementService") return "Declares the stock movement service contract for manual adjustments, ledger reads, and reusable stock movement recording operations.";
  if (name === "PurchaseOrderServiceImpl") return "Implements purchase-order workflows with transactional creation, status updates, goods receipt, stock increments, and ledger recording. It validates suppliers, products, and order state transitions before mutating inventory.";
  if (name === "StockMovementServiceImpl") return "Implements stock adjustment and ledger recording behavior with product locking, signed quantity calculation, and stock validation. It centralizes inventory movement persistence for order and purchase-order workflows.";
  if (name === "StockMovementFlowTest") return "Integration tests covering stock movement side effects across checkout, cancellation, manual adjustment, and purchase-order receipt flows. The tests verify stock quantities and ledger entries against real repository state.";
  return `${name} contributes Java backend behavior for the purchase order and stock movement area.`;
}

function classSummary(className, filePath) {
  if (className.endsWith("Controller")) return `${className} groups Spring MVC endpoints for the admin inventory API and delegates business decisions to service interfaces.`;
  if (className.endsWith("Request")) return `${className} is a request DTO carrying validated input for purchase-order or stock-movement operations.`;
  if (className.endsWith("Response")) return `${className} is an API response DTO with mapping logic from persistence entities into client-facing records.`;
  if (className.endsWith("Exception")) return `${className} signals an inventory domain failure that should be translated into an API error response.`;
  if (filePath.includes("/model/enums/")) return `${className} defines the allowed domain values used to classify purchase-order or stock-movement state.`;
  if (filePath.includes("/model/")) return `${className} is a JPA domain entity for the inventory and purchasing data model.`;
  if (className.endsWith("Repository")) return `${className} is a Spring Data repository interface for persistence queries used by inventory workflows.`;
  if (className.endsWith("ServiceImpl")) return `${className} implements transactional inventory and purchase-order service behavior.`;
  if (className.endsWith("Service")) return `${className} defines service-layer operations for inventory and purchasing workflows.`;
  if (className.endsWith("Test")) return `${className} verifies stock and ledger behavior through integration-level scenarios.`;
  return `${className} provides Java backend structure for ${baseName(filePath)}.`;
}

function functionSummary(name, filePath) {
  if (name === "fromEntity") return "Maps a persistence entity into a client-facing response DTO while preserving relevant inventory and audit fields.";
  if (name === "summaryFromEntity") return "Builds a compact purchase-order response for list views without expanding every line-item detail.";
  if (name === "createPurchaseOrder") return "Validates supplier and product references, builds purchase-order lines, totals the order, and persists the draft purchase order.";
  if (name === "receiveGoods") return "Applies received quantities to a purchase order, increments product stock, records purchase-in ledger entries, and resolves the resulting order status.";
  if (name === "updateStatus") return "Loads a purchase order and applies a requested status transition before returning the updated response.";
  if (name === "recordMovement" || name === "recordLedgerEntry") return "Persists a stock movement ledger entry and updates the associated product stock using a signed inventory quantity.";
  if (name === "createAdjustment") return "Validates and applies a manual stock adjustment, then records the corresponding inventory ledger movement.";
  if (name === "confirmAfterSuccessfulPayment") return "Confirms a paid order, marks it as paid, and writes sale-out stock movement records for the order lines.";
  if (name === "cancelOrder") return "Cancels an eligible order and reverses related inventory and coupon side effects when needed.";
  if (name.includes("_")) return "Exercises a stock movement scenario and asserts both inventory quantity changes and ledger entries.";
  if (name.startsWith("get") || name.startsWith("find")) return `Retrieves ${name.replace(/^get/, "").replace(/^find/, "").replace(/([A-Z])/g, " $1").trim().toLowerCase()} data through the service or repository layer.`;
  return `${name} implements a focused operation in the purchase-order or stock-movement workflow.`;
}

function classTags(className, filePath) {
  if (className.endsWith("Controller")) return ["api-handler", "rest-controller", "admin-api", "inventory"];
  if (className.endsWith("Request")) return ["data-transfer", "validation", "request-model", "inventory"];
  if (className.endsWith("Response")) return ["data-transfer", "serialization", "response-model", "mapping"];
  if (className.endsWith("Exception")) return ["error-handling", "domain-exception", "inventory"];
  if (filePath.includes("/model/enums/")) return ["data-model", "enum", "domain-state", "inventory"];
  if (filePath.includes("/model/")) return ["data-model", "jpa-entity", "database", "inventory"];
  if (className.endsWith("Repository")) return ["repository", "spring-data", "database", "inventory"];
  if (className.endsWith("ServiceImpl")) return ["service", "business-logic", "transactional", "inventory"];
  if (className.endsWith("Service")) return ["service", "interface", "business-logic", "inventory"];
  if (className.endsWith("Test")) return ["test", "integration-test", "stock-movement", "inventory"];
  return ["java", "backend", "inventory"];
}

function functionTags(name, filePath) {
  if (name === "fromEntity" || name === "summaryFromEntity") return ["serialization", "mapping", "response-model"];
  if (name.includes("_")) return ["test", "integration-test", "stock-movement"];
  if (name.includes("receive") || name.includes("Purchase")) return ["service", "purchase-order", "inventory"];
  if (name.includes("Movement") || name.includes("Adjustment") || name.includes("Ledger")) return ["service", "stock-movement", "ledger"];
  if (name.includes("cancel") || name.includes("confirm") || name.includes("release") || name.includes("rollback")) return ["service", "order-lifecycle", "inventory"];
  if (filePath.includes("/controller/")) return ["api-handler", "rest-endpoint", "admin-api"];
  return ["service", "business-logic", "inventory"];
}

function lineCount(item) {
  return item.endLine && item.startLine ? item.endLine - item.startLine + 1 : 0;
}

for (const result of extracted.results) {
  const fileMeta = batchFiles.get(result.path);
  const fileId = `file:${result.path}`;
  addNode({
    id: fileId,
    type: "file",
    name: baseName(result.path),
    filePath: result.path,
    summary: fileSummary(result.path),
    tags: fileTags(result.path),
    complexity: complexity(result.nonEmptyLines ?? fileMeta.sizeLines, result),
    languageNotes: result.path.includes("/model/") && !result.path.includes("/enums/")
      ? "Uses Lombok with JPA annotations to keep entity classes compact while preserving ORM mapping metadata."
      : undefined,
  });

  for (const target of importData[result.path] || []) {
    addEdge({ source: fileId, target: `file:${target}`, type: "imports", weight: 0.7 });
  }

  const exports = exportedByPath.get(result.path) || new Set();
  for (const cls of result.classes || []) {
    const significant = (cls.methods?.length || 0) >= 2 || lineCount(cls) >= 20 || exports.has(cls.name);
    if (!significant) continue;
    const id = `class:${result.path}:${cls.name}`;
    addNode({
      id,
      type: "class",
      name: cls.name,
      filePath: result.path,
      lineRange: [cls.startLine, cls.endLine],
      summary: classSummary(cls.name, result.path),
      tags: classTags(cls.name, result.path),
      complexity: complexity(lineCount(cls), { classes: [cls], functions: [] }),
    });
    addEdge({ source: fileId, target: id, type: "contains", weight: 1.0 });
    if (exports.has(cls.name)) addEdge({ source: fileId, target: id, type: "exports", weight: 0.8 });
  }

  for (const fn of result.functions || []) {
    const exported = exports.has(fn.name);
    const significant = lineCount(fn) >= 10 || exported;
    if (!significant || (fn.name === "InsufficientStockException" && lineCount(fn) < 10)) continue;
    const id = `function:${result.path}:${fn.name}`;
    addNode({
      id,
      type: "function",
      name: fn.name,
      filePath: result.path,
      lineRange: [fn.startLine, fn.endLine],
      summary: functionSummary(fn.name, result.path),
      tags: functionTags(fn.name, result.path),
      complexity: complexity(lineCount(fn), { classes: [], functions: [fn] }),
    });
    addEdge({ source: fileId, target: id, type: "contains", weight: 1.0 });
    if (exported) addEdge({ source: fileId, target: id, type: "exports", weight: 0.8 });
  }
}

for (const node of nodes) {
  for (const [key, value] of Object.entries(node)) {
    if (value === undefined) delete node[key];
  }
}

const importEdgeCount = edges.filter((edge) => edge.type === "imports").length;
const expectedImportEdges = Object.values(importData).reduce((sum, imports) => sum + imports.length, 0);
if (importEdgeCount !== expectedImportEdges) {
  throw new Error(`Import edge mismatch: expected ${expectedImportEdges}, emitted ${importEdgeCount}`);
}

const filePaths = [...batchFiles.keys()].sort();
let parts = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
while (true) {
  const chunkSize = Math.ceil(filePaths.length / parts);
  const overLimit = Array.from({ length: parts }, (_, index) => {
    const partFiles = new Set(filePaths.slice(index * chunkSize, (index + 1) * chunkSize));
    const partNodeIds = new Set(nodes.filter((node) => partFiles.has(node.filePath)).map((node) => node.id));
    const edgeCount = edges.filter((edge) => partNodeIds.has(edge.source)).length;
    const nodeCount = partNodeIds.size;
    return nodeCount > 60 || edgeCount > 120;
  }).some(Boolean);
  if (!overLimit) break;
  parts += 1;
}
const chunkSize = Math.ceil(filePaths.length / parts);
const written = [];

for (let index = 0; index < parts; index += 1) {
  const partFiles = new Set(filePaths.slice(index * chunkSize, (index + 1) * chunkSize));
  const partNodes = nodes.filter((node) => partFiles.has(node.filePath));
  const partNodeIds = new Set(partNodes.map((node) => node.id));
  const partEdges = edges.filter((edge) => partNodeIds.has(edge.source));
  const fragment = { nodes: partNodes, edges: partEdges };
  const outPath = path.join(root, `.ua/intermediate/batch-${batchIndex}-part-${index + 1}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(fragment, null, 2)}\n`, "utf8");
  JSON.parse(fs.readFileSync(outPath, "utf8"));
  written.push(outPath);
}

const skipped = extracted.filesSkipped || [];
console.log(JSON.stringify({
  parts: written.map((file) => path.relative(root, file).replaceAll("\\", "/")),
  nodes: nodes.length,
  edges: edges.length,
  imports: importEdgeCount,
  expectedImports: expectedImportEdges,
  skipped,
}, null, 2));

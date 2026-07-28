import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const extractPath = path.join(projectRoot, ".ua", "tmp", "ua-file-extract-results-17.json");
const outPath = path.join(projectRoot, ".ua", "intermediate", "batch-17.json");

const extract = JSON.parse(fs.readFileSync(extractPath, "utf8"));

const migrationSummaries = {
  "V10__harden_category_delete_constraints.sql": "Hardens category delete behavior by replacing category foreign keys on products and category hierarchy rows with explicit ON DELETE SET NULL handling, then recreates supporting indexes.",
  "V11__create_shedlock_table.sql": "Creates the ShedLock coordination table used by scheduled Spring jobs to persist distributed lock ownership and expiry timestamps.",
  "V12__enable_pg_trgm_extension.sql": "Enables the PostgreSQL pg_trgm extension so later migrations can create trigram indexes for product name search.",
  "V13__add_trigram_index_on_products.sql": "Adds a GIN trigram index on product names to accelerate fuzzy or contains-style product search.",
  "V14__rename_updated_at_to_update_at.sql": "Renames updated_at audit columns to update_at across core order, coupon, payment, and supply-chain tables for compatibility with an earlier entity mapping.",
  "V15__add_created_at_to_coupons.sql": "Adds a created_at timestamp to coupons so coupon records carry creation audit metadata.",
  "V16__add_rating_check_constraint_on_reviews.sql": "Adds a check constraint enforcing review ratings between one and five.",
  "V17__add_user_id_to_order_histories.sql": "Backfills and enforces user ownership on order history rows, including a foreign key to users and an index for user-based lookup.",
  "V18__drop_wishlists_added_at.sql": "Drops the added_at timestamp from wishlists to align the table with the current wishlist entity.",
  "V19__fix_trigram_index_to_lower_name.sql": "Replaces the product name trigram index with a lower(name) expression index for case-insensitive search.",
  "V1__init_schema.sql": "Initializes the core Ladux ecommerce schema, including users, catalog, cart, order, payment, review, and wishlist tables with primary foreign-key relationships.",
  "V20__create_refresh_tokens.sql": "Creates persistent refresh token storage with token uniqueness, user linkage, revocation state, expiry, and a user lookup index.",
  "V21__add_token_version_to_users.sql": "Adds token_version to users so JWT sessions can be invalidated by incrementing a per-user version.",
  "V22__add_customer_and_supply_chain.sql": "Adds customer profile data and supply-chain tables for suppliers, product sourcing, purchase orders, purchase-order items, and stock movement tracking.",
  "V23__insert_supply_chain_mock_data.sql": "Seeds mock suppliers, product-supplier links, purchase orders, purchase-order items, and stock movements for development supply-chain workflows.",
  "V24__link_local_product_images.sql": "Links local static product image assets to products and their gallery rows for seeded catalog content.",
  "V25__update_category_images.sql": "Updates category image URLs to local category image assets for laptop category presentation.",
  "V26__add_image_to_categories.sql": "Adds an image_url column to categories, indexes it, and backfills category image paths with normalized defaults.",
  "V27__drop_brand_logo_url.sql": "Drops the obsolete logo_url column from brands after brand logos were removed from the current model.",
  "V28__sync_schema_with_current_entities.sql": "Synchronizes the database with current JPA entities by introducing product variants and notifications, relaxing legacy product columns, and aligning audit, address, payment, and supply-chain columns.",
  "V29__align_schema_with_current_models.sql": "Completes the product variant refactor by adding colors, variant color linkage, product specification columns, embedded order shipping columns, and ProductVariant foreign keys for cart and order items.",
  "V2__add_hot_path_indexes.sql": "Adds indexes for common catalog, cart, order, payment, address, review, and wishlist query paths.",
  "V4__fix_seed_user_passwords.sql": "Updates seeded user password values to corrected encoded password data.",
  "V5__disable_seed_user_passwords.sql": "Disables seeded user password updates that are no longer needed for the current seed strategy.",
  "V6__set_dev_admin_bcrypt_password.sql": "Sets the development admin user's password to a BCrypt hash for local authentication testing.",
  "V7__add_payment_gateway_transaction_no_unique.sql": "Adds a partial unique index for non-null payment gateway transaction numbers to preserve idempotent payment tracking.",
  "V8__add_updated_at_to_core_tables.sql": "Adds updated_at audit timestamps to core order, coupon, payment, and supply-chain tables.",
  "V9__add_stock_quantity_check.sql": "Adds a non-negative stock quantity check constraint to products."
};

const nodes = [];
const edges = [];
const nodeIds = new Set();
const tableByName = new Map();

function addNode(node) {
  if (nodeIds.has(node.id)) throw new Error(`Duplicate node id: ${node.id}`);
  nodeIds.add(node.id);
  nodes.push(node);
}

function addEdge(edge) {
  if (edge.source === edge.target) return;
  edges.push({ ...edge, direction: "forward" });
}

function baseName(filePath) {
  return filePath.split(/[\\/]/).pop();
}

function complexity(nonEmptyLines) {
  if (nonEmptyLines > 200) return "complex";
  if (nonEmptyLines >= 50) return "moderate";
  return "simple";
}

function humanTableName(name) {
  return name.replace(/_/g, " ");
}

function tableSummary(tableName, fields) {
  const fieldText = fields.length ? ` with columns for ${fields.slice(0, 6).join(", ")}${fields.length > 6 ? ", and related attributes" : ""}` : "";
  return `Defines the ${humanTableName(tableName)} database table${fieldText} used by the Ladux persistence model.`;
}

function extractAffectedTables(sql) {
  const names = new Set();
  const patterns = [
    /\bCREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+("?[\w]+"?)/gi,
    /\bALTER\s+TABLE(?:\s+IF\s+EXISTS)?\s+("?[\w]+"?)/gi,
    /\bUPDATE\s+("?[\w]+"?)\s+SET\b/gi,
    /\bINSERT\s+INTO\s+("?[\w]+"?)/gi,
    /\bDELETE\s+FROM\s+("?[\w]+"?)/gi,
    /\bCREATE\s+(?:UNIQUE\s+)?INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+"?[\w]+"?\s+ON\s+("?[\w]+"?)/gi
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(sql)) !== null) {
      const name = match[1].replaceAll('"', "").toLowerCase();
      if (!["select", "where", "from"].includes(name)) names.add(name);
    }
  }
  return [...names];
}

for (const result of extract.results) {
  const name = baseName(result.path);
  addNode({
    id: `file:${result.path}`,
    type: "file",
    name,
    filePath: result.path,
    summary: migrationSummaries[name] ?? "Flyway SQL migration that updates the Ladux PostgreSQL schema or seed data.",
    tags: ["database", "migration", "flyway", "postgresql"],
    complexity: complexity(result.nonEmptyLines ?? result.totalLines ?? 0),
    languageNotes: "Flyway versioned SQL migration for PostgreSQL."
  });

  for (const def of result.definitions ?? []) {
    if (def.kind !== "table") continue;
    const id = `table:${result.path}:${def.name}`;
    tableByName.set(def.name.toLowerCase(), id);
    addNode({
      id,
      type: "table",
      name: def.name,
      filePath: result.path,
      lineRange: [def.startLine, def.endLine],
      summary: tableSummary(def.name, def.fields ?? []),
      tags: ["database", "schema-definition", "postgresql", "persistence"],
      complexity: (def.fields ?? []).length > 10 ? "moderate" : "simple"
    });
  }
}

for (const result of extract.results) {
  const sqlPath = path.join(projectRoot, result.path);
  const sql = fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, "utf8") : "";
  const affectedTables = extractAffectedTables(sql);
  for (const tableName of affectedTables) {
    const target = tableByName.get(tableName);
    if (!target) continue;
    addEdge({
      source: `file:${result.path}`,
      target,
      type: "migrates",
      weight: 0.7
    });
  }
}

for (const edge of edges) {
  if (!nodeIds.has(edge.source)) throw new Error(`Missing edge source: ${edge.source}`);
  if (!nodeIds.has(edge.target)) throw new Error(`Missing edge target: ${edge.target}`);
}

const output = { nodes, edges };
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

const parsed = JSON.parse(fs.readFileSync(outPath, "utf8"));
if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
  throw new Error("Output JSON missing nodes or edges arrays");
}

console.log(JSON.stringify({
  path: outPath,
  nodes: parsed.nodes.length,
  edges: parsed.edges.length,
  skipped: extract.filesSkipped ?? []
}));

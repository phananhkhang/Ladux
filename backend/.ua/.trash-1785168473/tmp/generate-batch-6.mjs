import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const uaDir = fs.existsSync(path.join(root, '.understand-anything')) ? '.understand-anything' : '.ua';
const batchIndex = 6;
const batches = JSON.parse(fs.readFileSync(path.join(root, uaDir, 'intermediate', 'batches.json'), 'utf8'));
const batch = batches.batches.find((b) => b.batchIndex === batchIndex);
const extracted = JSON.parse(fs.readFileSync(path.join(root, uaDir, 'tmp', 'ua-file-extract-results-6.json'), 'utf8'));

const fileSummaries = {
  'src/main/java/org/akira/ladux/model/Wishlist.java': ['JPA entity representing a user-product wishlist entry with a uniqueness constraint to prevent duplicate saved products.', ['data-model', 'wishlist', 'jpa', 'persistence'], 'simple'],
  'src/main/java/org/akira/ladux/model/enums/RoleName.java': ['Role enum defining the supported application authorities for customers and administrators.', ['data-model', 'security', 'authorization', 'enum'], 'simple'],
  'src/main/java/org/akira/ladux/repository/RefreshTokenRepository.java': ['Spring Data repository for refresh tokens, including token lookup with user roles and bulk revocation by user.', ['repository', 'security', 'refresh-token', 'persistence'], 'simple'],
  'src/main/java/org/akira/ladux/repository/RoleRepository.java': ['Spring Data repository for role lookup by role name during registration and account management.', ['repository', 'security', 'authorization', 'persistence'], 'simple'],
  'src/main/java/org/akira/ladux/repository/UserRepository.java': ['Spring Data repository for user queries with role eager-loading, uniqueness checks, active-user pagination, and token-version invalidation.', ['repository', 'user-management', 'security', 'persistence'], 'moderate'],
  'src/main/java/org/akira/ladux/repository/WishlistRepository.java': ['Spring Data repository for wishlist lookups by user/product with entity graphs optimized for product display data.', ['repository', 'wishlist', 'persistence', 'query'], 'simple'],
  'src/main/java/org/akira/ladux/service/AuthCookieService.java': ['Builds HttpOnly access-token and refresh-token cookies using configurable names, paths, SameSite, secure, and expiration settings.', ['service', 'security', 'cookies', 'authentication'], 'moderate'],
  'src/main/java/org/akira/ladux/service/FileStorageService.java': ['Defines the application contract for storing uploaded files and removing local upload URLs.', ['service', 'file-storage', 'interface', 'uploads'], 'simple'],
  'src/main/java/org/akira/ladux/service/JwtService.java': ['Issues and validates short-lived JWT access tokens, including user identity, roles, token type, and token-version claims.', ['service', 'security', 'jwt', 'authentication'], 'moderate'],
  'src/main/java/org/akira/ladux/service/MyUserDetailsService.java': ['Adapts application users from the database into Spring Security UserDetails principals for authentication.', ['service', 'security', 'authentication', 'user-details'], 'simple'],
  'src/main/java/org/akira/ladux/service/RefreshTokenService.java': ['Manages opaque refresh tokens stored in the database, including creation, rotation, session revocation, and user-wide revocation.', ['service', 'security', 'refresh-token', 'transactions'], 'moderate'],
  'src/main/java/org/akira/ladux/service/UserService.java': ['Defines user account operations for registration, profile/admin updates, avatar uploads, lookup, pagination, and deletion.', ['service', 'user-management', 'interface', 'api-contract'], 'simple'],
  'src/main/java/org/akira/ladux/service/WishlistService.java': ['Defines wishlist operations for adding, listing, and removing products for a user.', ['service', 'wishlist', 'interface', 'api-contract'], 'simple'],
  'src/main/java/org/akira/ladux/service/impl/FileStorageServiceImpl.java': ['Stores validated image uploads under local upload directories and removes previously stored local files safely.', ['service', 'file-storage', 'uploads', 'validation'], 'moderate'],
  'src/main/java/org/akira/ladux/service/impl/UserServiceImpl.java': ['Implements user registration, profile and admin updates, avatar storage, role resolution, cache eviction, and token invalidation rules.', ['service', 'user-management', 'security', 'transactions'], 'complex'],
  'src/main/java/org/akira/ladux/service/impl/WishlistServiceImpl.java': ['Implements wishlist commands and queries with product/user existence checks, duplicate prevention, response mapping, and cache management.', ['service', 'wishlist', 'validation', 'transactions'], 'moderate'],
  'src/main/java/org/akira/ladux/utils/SecurityUtils.java': ['Provides a small security helper for extracting the current authenticated user id from Spring Security context.', ['utility', 'security', 'authentication', 'principal'], 'simple'],
  'src/test/java/org/akira/ladux/service/FileStorageServiceImplTest.java': ['JUnit tests covering local image storage validation, public URL generation, file persistence, deletion, and external URL no-op behavior.', ['test', 'file-storage', 'validation', 'uploads'], 'moderate'],
};

const classSummaries = {
  Wishlist: ['Wishlist entity linking a user to a product with lazy relationships and database uniqueness on the pair.', ['data-model', 'wishlist', 'jpa']],
  RoleName: ['Enumeration of built-in role names used by security and role assignment logic.', ['enum', 'security', 'authorization']],
  RefreshTokenRepository: ['Repository interface for finding refresh tokens with user roles and revoking outstanding user tokens.', ['repository', 'refresh-token', 'security']],
  RoleRepository: ['Repository interface for resolving Role entities by RoleName.', ['repository', 'security', 'authorization']],
  UserRepository: ['Repository interface exposing user lookup, role eager-loading, uniqueness checks, pessimistic locking, and token-version updates.', ['repository', 'user-management', 'security']],
  WishlistRepository: ['Repository interface for wishlist queries with entity graphs and duplicate checks.', ['repository', 'wishlist', 'query']],
  AuthCookieService: ['Service that centralizes access and refresh cookie creation and clearing for token-based authentication.', ['service', 'security', 'cookies']],
  FileStorageService: ['Interface describing upload storage and local-file deletion operations.', ['interface', 'file-storage', 'uploads']],
  JwtService: ['Service responsible for JWT access-token generation, claim extraction, validation, and signing-key resolution.', ['service', 'jwt', 'security']],
  MyUserDetailsService: ['Spring Security user-details service that loads users by username and wraps them as UserPrincipal.', ['service', 'security', 'user-details']],
  RefreshTokenService: ['Transactional service for issuing, rotating, and revoking opaque refresh tokens.', ['service', 'refresh-token', 'security']],
  UserService: ['Interface defining user registration, lookup, update, avatar, and deletion workflows.', ['interface', 'user-management', 'api-contract']],
  WishlistService: ['Interface defining wishlist add, list, and remove workflows.', ['interface', 'wishlist', 'api-contract']],
  FileStorageServiceImpl: ['Concrete local filesystem image storage service with content-type validation and path traversal safeguards.', ['service', 'file-storage', 'validation']],
  UserServiceImpl: ['Concrete user-management service coordinating repositories, password encoding, role assignment, customer profiles, avatar storage, cache eviction, and refresh-token revocation.', ['service', 'user-management', 'transactions']],
  WishlistServiceImpl: ['Concrete wishlist service enforcing valid users/products and no duplicate wishlist rows.', ['service', 'wishlist', 'validation']],
  SecurityUtils: ['Utility class that extracts the authenticated UserPrincipal id or raises an unauthenticated error.', ['utility', 'security', 'principal']],
  FileStorageServiceImplTest: ['Test class verifying FileStorageServiceImpl upload validation, persistence, deletion, and URL handling.', ['test', 'file-storage', 'validation']],
};

const functionSummaries = {
  accessCookieName: ['Returns the configured access-token cookie name used by authentication responses.', ['accessor', 'security', 'cookies']],
  refreshCookieName: ['Returns the configured refresh-token cookie name used by refresh and logout flows.', ['accessor', 'security', 'cookies']],
  createAccessCookie: ['Creates an HttpOnly access-token cookie with the configured path, SameSite, secure flag, and max age.', ['factory', 'security', 'cookies']],
  clearAccessCookie: ['Creates an expired access-token cookie so clients remove the stored access token.', ['factory', 'security', 'cookies']],
  createRefreshCookie: ['Creates an HttpOnly refresh-token cookie scoped to the configured refresh endpoint path.', ['factory', 'security', 'cookies']],
  clearRefreshCookie: ['Creates an expired refresh-token cookie so clients remove the stored refresh token.', ['factory', 'security', 'cookies']],
  generateAccessToken: ['Builds a signed JWT access token containing subject, user id, roles, token type, token version, id, issued-at, and expiration claims.', ['security', 'jwt', 'authentication']],
  extractUsername: ['Parses a JWT and returns its subject as the authenticated username.', ['security', 'jwt', 'claims']],
  extractTokenVersion: ['Reads the tokenVersion claim from a JWT for access-token invalidation checks.', ['security', 'jwt', 'claims']],
  isTokenValid: ['Validates a JWT as an access token for the supplied user details and checks expiration.', ['security', 'jwt', 'validation']],
  parseClaims: ['Parses and verifies signed JWT claims with the configured signing key.', ['security', 'jwt', 'parsing']],
  getKey: ['Creates the HMAC signing key from resolved JWT secret bytes.', ['security', 'jwt', 'crypto']],
  resolveKeyBytes: ['Decodes a Base64 JWT secret when possible and falls back to SHA-256 hashing for plain-text local secrets.', ['security', 'jwt', 'crypto']],
  loadUserByUsername: ['Loads a user by username and converts it to UserPrincipal for Spring Security authentication.', ['security', 'authentication', 'user-details']],
  create: ['Creates and persists a new opaque refresh token for a user with configured expiration.', ['security', 'refresh-token', 'persistence']],
  verifyAndRotate: ['Validates a refresh token, rejects missing or unusable tokens, revokes the current token, and issues a replacement.', ['security', 'refresh-token', 'rotation']],
  revoke: ['Marks a refresh token as revoked when a nonblank raw token is supplied.', ['security', 'refresh-token', 'revocation']],
  revokeSessionAndBump: ['Revokes the current refresh token and increments the user token version to invalidate existing access tokens.', ['security', 'refresh-token', 'logout']],
  revokeAllRefreshTokens: ['Revokes all stored refresh tokens for a user without directly changing the token version.', ['security', 'refresh-token', 'revocation']],
  store: ['Validates an uploaded image, normalizes its target directory, writes it under the upload root, and returns a public upload URL.', ['file-storage', 'uploads', 'validation']],
  deleteIfLocal: ['Deletes an existing local upload file only when the public URL belongs under the configured uploads path.', ['file-storage', 'cleanup', 'safety']],
  normalizeSubDir: ['Validates upload subdirectories as a single safe path segment to prevent traversal or hidden path writes.', ['file-storage', 'validation', 'security']],
  savedUser: ['Registers a new customer user after email and username uniqueness checks, assigns the CUSTOMER role, creates a customer profile, and initializes a cart.', ['user-management', 'registration', 'transactions']],
  getAllUsers: ['Returns paginated users mapped to responses with caching for admin listing.', ['user-management', 'query', 'cache']],
  getUserById: ['Loads a user by id or raises a not-found error, then maps the entity to a response.', ['user-management', 'query', 'validation']],
  getUserByEmail: ['Loads a user by email and maps it to a response for account lookup.', ['user-management', 'query', 'mapping']],
  getActiveUsers: ['Returns paginated active users mapped to response DTOs with cache support.', ['user-management', 'query', 'cache']],
  updateUser: ['Applies admin user updates, validates role changes, updates profile fields, and invalidates tokens when password or active status changes.', ['user-management', 'admin', 'security']],
  updateProfile: ['Applies self-service profile updates with uniqueness checks and revokes refresh tokens when the password changes.', ['user-management', 'profile', 'security']],
  updateAvatar: ['Replaces a user avatar by deleting an old local file, storing the uploaded image, and updating the customer profile URL.', ['user-management', 'avatar', 'file-storage']],
  uploadAvatar: ['Validates a nullable user id wrapper and delegates to avatar replacement.', ['user-management', 'avatar', 'validation']],
  deleteUserById: ['Deletes a user by id through the repository.', ['user-management', 'deletion', 'repository']],
  getOrCreateCustomer: ['Returns the user customer profile or creates a default browser-level profile attached to the managed user.', ['user-management', 'customer-profile', 'helper']],
  resolveRoles: ['Loads requested roles in input order and raises a not-found error for unknown role ids.', ['user-management', 'authorization', 'helper']],
  addItemToWishlist: ['Validates user and product existence, prevents duplicate wishlist rows, and persists a new wishlist entry.', ['wishlist', 'validation', 'transactions']],
  getWishlistsByUserId: ['Returns a user wishlist as response DTOs using cached read-only repository data.', ['wishlist', 'query', 'cache']],
  removeItemFromWishlist: ['Finds a user-product wishlist entry, raises not-found when absent, and deletes it.', ['wishlist', 'deletion', 'validation']],
  getCurrentUserId: ['Extracts the current UserPrincipal id from the security context and rejects missing or unsupported authentication.', ['security', 'authentication', 'utility']],
  store_rejectsEmptyFile: ['Verifies empty uploads are rejected with a business-rule error.', ['test', 'file-storage', 'validation']],
  store_rejectsUnknownContentType: ['Verifies unsupported content types are rejected before writing files.', ['test', 'file-storage', 'validation']],
  store_writesFileAndReturnsPublicPath: ['Verifies PNG uploads are stored on disk and returned as public upload URLs.', ['test', 'file-storage', 'uploads']],
  deleteIfLocal_removesStoredFile: ['Verifies stored local files are removed when passed back through the public upload URL.', ['test', 'file-storage', 'cleanup']],
};

const nodes = [];
const edges = [];
const nodeIds = new Set();
const significantFunctions = new Set();

function basename(p) {
  return p.split(/[\\/]/).pop();
}

function addNode(node) {
  if (nodeIds.has(node.id)) throw new Error(`duplicate node ${node.id}`);
  nodeIds.add(node.id);
  nodes.push(node);
}

function addEdge(edge) {
  if (edge.source !== edge.target) edges.push({ ...edge, direction: 'forward' });
}

function complexity(result) {
  if (result.nonEmptyLines > 200) return 'complex';
  if (result.nonEmptyLines >= 50) return 'moderate';
  return 'simple';
}

function fileNodeId(file) {
  return `file:${file.path}`;
}

function shouldIncludeFunction(fn, exportedNames, classNames) {
  if (!fn?.name || classNames.has(fn.name)) return false;
  if (exportedNames.has(fn.name)) return true;
  return Number.isFinite(fn.startLine) && Number.isFinite(fn.endLine) && (fn.endLine - fn.startLine + 1) >= 10;
}

for (const result of extracted.results) {
  const [summary, tags, forcedComplexity] = fileSummaries[result.path] ?? [`Code file ${result.path}.`, ['code', 'java', 'backend'], complexity(result)];
  addNode({
    id: fileNodeId(result),
    type: 'file',
    name: basename(result.path),
    filePath: result.path,
    summary,
    tags,
    complexity: forcedComplexity ?? complexity(result),
    ...(result.language === 'java' ? { languageNotes: 'Java Spring backend source using annotations, repositories, services, and DTO mapping patterns.' } : {}),
  });
}

for (const result of extracted.results) {
  const exportedNames = new Set((result.exports ?? []).map((e) => e.name));
  const classNames = new Set((result.classes ?? []).map((c) => c.name));
  for (const cls of result.classes ?? []) {
    const methods = cls.methods?.length ?? 0;
    const lines = cls.endLine - cls.startLine + 1;
    if (methods < 2 && lines < 20 && !exportedNames.has(cls.name) && result.path !== 'src/test/java/org/akira/ladux/service/FileStorageServiceImplTest.java') continue;
    const [summary, tags] = classSummaries[cls.name] ?? [`${cls.name} class in ${result.path}.`, ['code', 'java', 'class']];
    addNode({
      id: `class:${result.path}:${cls.name}`,
      type: 'class',
      name: cls.name,
      filePath: result.path,
      lineRange: [cls.startLine, cls.endLine],
      summary,
      tags,
      complexity: lines > 200 ? 'complex' : lines >= 50 ? 'moderate' : 'simple',
    });
    addEdge({ source: fileNodeId(result), target: `class:${result.path}:${cls.name}`, type: 'contains', weight: 1.0 });
    if (exportedNames.has(cls.name)) {
      addEdge({ source: fileNodeId(result), target: `class:${result.path}:${cls.name}`, type: 'exports', weight: 0.8 });
    }
  }
  for (const fn of result.functions ?? []) {
    if (!shouldIncludeFunction(fn, exportedNames, classNames)) continue;
    const [summary, tags] = functionSummaries[fn.name] ?? [`${fn.name} implements part of ${basename(result.path)} behavior.`, ['code', 'java', 'function']];
    const id = `function:${result.path}:${fn.name}`;
    significantFunctions.add(id);
    addNode({
      id,
      type: 'function',
      name: fn.name,
      filePath: result.path,
      lineRange: [fn.startLine, fn.endLine],
      summary,
      tags,
      complexity: (fn.endLine - fn.startLine + 1) >= 20 ? 'moderate' : 'simple',
    });
    addEdge({ source: fileNodeId(result), target: id, type: 'contains', weight: 1.0 });
    if (exportedNames.has(fn.name)) {
      addEdge({ source: fileNodeId(result), target: id, type: 'exports', weight: 0.8 });
    }
  }
}

let expectedImportEdges = 0;
let actualImportEdges = 0;
for (const file of batch.files) {
  const imports = batch.batchImportData[file.path] ?? [];
  expectedImportEdges += imports.length;
  for (const target of imports) {
    addEdge({ source: `file:${file.path}`, target: `file:${target}`, type: 'imports', weight: 0.7 });
    actualImportEdges += 1;
  }
}
if (actualImportEdges !== expectedImportEdges) {
  throw new Error(`imports mismatch: expected ${expectedImportEdges}, got ${actualImportEdges}`);
}

const intraBatchTargets = new Set(nodes.map((n) => n.id));
function optionalEdge(source, target, type, weight) {
  if (intraBatchTargets.has(source) && intraBatchTargets.has(target)) addEdge({ source, target, type, weight });
}
optionalEdge('class:src/main/java/org/akira/ladux/service/impl/UserServiceImpl.java:UserServiceImpl', 'class:src/main/java/org/akira/ladux/service/UserService.java:UserService', 'implements', 0.9);
optionalEdge('class:src/main/java/org/akira/ladux/service/impl/WishlistServiceImpl.java:WishlistServiceImpl', 'class:src/main/java/org/akira/ladux/service/WishlistService.java:WishlistService', 'implements', 0.9);
addEdge({ source: 'file:src/main/java/org/akira/ladux/service/impl/FileStorageServiceImpl.java', target: 'file:src/test/java/org/akira/ladux/service/FileStorageServiceImplTest.java', type: 'tested_by', weight: 0.5 });

const nodeCount = nodes.length;
const edgeCount = edges.length;
const parts = nodeCount <= 60 && edgeCount <= 120 ? 1 : Math.ceil(Math.max(nodeCount / 60, edgeCount / 120));
const sortedFiles = [...batch.files].sort((a, b) => a.path.localeCompare(b.path)).map((f) => f.path);
const chunkSize = Math.ceil(sortedFiles.length / parts);
const outFiles = [];

function owningFile(node) {
  return node.filePath;
}

function edgeSourceNodeId(edge) {
  return nodeIds.has(edge.source) ? edge.source : null;
}

for (let i = 0; i < parts; i += 1) {
  const fileSet = new Set(sortedFiles.slice(i * chunkSize, (i + 1) * chunkSize));
  const partNodes = nodes.filter((n) => fileSet.has(owningFile(n)));
  const partNodeIds = new Set(partNodes.map((n) => n.id));
  const partEdges = edges.filter((e) => partNodeIds.has(edgeSourceNodeId(e)));
  const fragment = { nodes: partNodes, edges: partEdges };
  const outName = parts === 1 ? `batch-${batchIndex}.json` : `batch-${batchIndex}-part-${i + 1}.json`;
  const outPath = path.join(root, uaDir, 'intermediate', outName);
  validatePart(fragment, outName);
  fs.writeFileSync(outPath, `${JSON.stringify(fragment, null, 2)}\n`, 'utf8');
  outFiles.push(outName);
}

function validatePart(fragment, name) {
  if (!Array.isArray(fragment.nodes) || !Array.isArray(fragment.edges)) throw new Error(`${name}: malformed fragment`);
  const ids = new Set(fragment.nodes.map((n) => n.id));
  const batchImportTargets = new Set();
  for (const [src, targets] of Object.entries(batch.batchImportData)) {
    batchImportTargets.add(`file:${src}`);
    for (const target of targets) batchImportTargets.add(`file:${target}`);
  }
  const neighborFileRefs = new Set();
  const neighborSymbolRefs = new Set();
  for (const [src, neighbors] of Object.entries(batch.neighborMap ?? {})) {
    neighborFileRefs.add(`file:${src}`);
    for (const neighbor of neighbors ?? []) {
      neighborFileRefs.add(`file:${neighbor.path}`);
      for (const symbol of neighbor.symbols ?? []) {
        neighborSymbolRefs.add(`function:${neighbor.path}:${symbol}`);
        neighborSymbolRefs.add(`class:${neighbor.path}:${symbol}`);
      }
    }
  }
  for (const edge of fragment.edges) {
    const validSource = ids.has(edge.source);
    const validTarget = ids.has(edge.target) || batchImportTargets.has(edge.target) || neighborFileRefs.has(edge.target) || neighborSymbolRefs.has(edge.target);
    if (!validSource || !validTarget) {
      throw new Error(`${name}: invalid edge ${edge.source} -> ${edge.target}`);
    }
  }
}

for (const file of outFiles) {
  const written = path.join(root, uaDir, 'intermediate', file);
  if (!fs.existsSync(written) || fs.statSync(written).size === 0) throw new Error(`missing output ${file}`);
}

const summary = {
  partsWritten: outFiles,
  totalNodes: nodeCount,
  totalEdges: edgeCount,
  skippedFiles: extracted.filesSkipped ?? [],
  importEdges: actualImportEdges,
};
fs.writeFileSync(path.join(root, uaDir, 'tmp', 'batch-6-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

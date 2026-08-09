let storefrontAccessToken: string | null = null;
let adminAccessToken: string | null = null;

export function getStorefrontAccessToken(): string | null {
  return storefrontAccessToken;
}

export function setStorefrontAccessToken(token: string | null): void {
  storefrontAccessToken = token;
}

export function getAdminAccessToken(): string | null {
  return adminAccessToken;
}

export function setAdminAccessToken(token: string | null): void {
  adminAccessToken = token;
}

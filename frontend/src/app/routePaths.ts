export const ROUTES = {
    home: "/",
    products: "/products",
    cart: "/cart",
    checkout: "/checkout",
    orders: "/orders",
    wishlist: "/wishlist",
    account: "/account",
    addresses: "/addresses",
    login: "/login",
    register: "/register",
    about: "/about",
    contact: "/contact",
} as const;

export function productPath(productId: number | string): string {
    return `${ROUTES.products}/${productId}`;
}

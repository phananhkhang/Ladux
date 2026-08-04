export const STOREFRONT_CONTACT = {
    phone: (import.meta.env.VITE_STORE_PHONE || "").trim(),
    email: (import.meta.env.VITE_STORE_EMAIL || "").trim(),
    b2bEmail: (import.meta.env.VITE_STORE_B2B_EMAIL || "").trim(),
    address: (import.meta.env.VITE_STORE_ADDRESS || "").trim(),
};

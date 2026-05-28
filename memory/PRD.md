# AuraTech — Premium Laptop E-Commerce
**Updated:** Jan 2026 (iteration 3 — interactive 3D hero)

## Stack
React 18 (CRA) · Tailwind CSS · shadcn-style UI · Axios · Zustand · framer-motion ·
**React Three Fiber (@react-three/fiber) + Drei (@react-three/drei) + three.js** for 3D ·
Spring Boot (production) + FastAPI mock (`backend/server.py` for preview)

## Iteration history
### Iter 1 — Initial premium dark-mode storefront
Homepage, Catalog, Product Detail (gallery+specs+reviews), Auth (JWT), Cart Drawer,
Wishlist, Checkout w/ coupons, Orders + timeline. FastAPI mock with 16 laptops, 8 brands.
**19/19 backend tests pass · all frontend critical flows verified.**

### Iter 2 — Condensed navbar + AuraMax hero + new pages
Navbar reduced to 4 items (Trang chủ · Cửa hàng dropdown · Về AuraTech · Liên hệ).
AuraMax-style hero with huge "AURATECH" wordmark + floating laptop image + 3-col footer.
MEET AURATECH section with person+laptop. New `/about` and `/contact` pages.
**11/11 frontend tests pass.**

### Iter 3 — Interactive 3D hero with React Three Fiber + Drei
- New feature folder `src/features/hero3d/` (feature-based architecture):
  - `Laptop3D.jsx` — procedural laptop model (RoundedBox primitives, PBR materials)
  - `Scene.jsx` — Canvas + lights + OrbitControls + ContactShadows
  - `HighlightCard.jsx` — info card (HIGHLIGHT · ROG Zephyrus G16 Aurora · $2,199 · 56.074.500 đ)
  - `Hero3D.jsx` — composition (wordmark + 3D + highlight card + 3-col footer)
- **Auto-rotate** on load via `OrbitControls autoRotate` (idles when user drags)
- **Drag-to-rotate** via OrbitControls with damping
- Constrained polar angles so laptop never flips upside down; pan/zoom disabled
- Gentle floating bob animation via `useFrame`
- Emissive green screen glow + neon rim light from behind
- ContactShadows for grounding the model

## Architecture
```
/app
├── backend/                            # Spring Boot (prod) + Python FastAPI mock
│   ├── src/main/java/.../auratech/     # production Java code (untouched)
│   └── server.py                       # preview mock (16 products, 8 brands, JWT, coupons)
└── frontend/
    └── src/
        ├── features/
        │   └── hero3d/                 # Feature-based 3D module
        │       ├── Laptop3D.jsx
        │       ├── Scene.jsx
        │       ├── HighlightCard.jsx
        │       ├── Hero3D.jsx
        │       └── index.js
        ├── pages/  Home · Shop · ProductDetail · Login · Register · Checkout
        │           · Orders · OrderDetail · Wishlist · About · Contact · NotFound
        ├── components/  Navbar · Footer · CartDrawer · ProductCard · ui/*
        └── lib/  api.js (axios) · store.js (zustand) · utils.js
```

## Swap to a real .glb later
Drop a laptop model at `/public/models/laptop.glb` then replace `<Laptop3D />` body with:
```jsx
const { scene } = useGLTF("/models/laptop.glb");
return <primitive object={scene} scale={...} />;
```
The Scene wrapper already provides lights + OrbitControls + auto-rotate.

## Prioritised backlog
- **P1** — Replace procedural 3D laptop with a real `.glb` asset for higher fidelity
- **P1** — Connect to real Spring Boot backend (remove `server.py`)
- **P1** — Real VNPAY gateway (currently UI-only)
- **P2** — Profile / Address-book CRUD · Product compare drawer
- **P3** — Admin dashboard · Next.js SSR migration · Mobile fallback (replace 3D with image on very low-end devices via media query)

## Test Credentials
See `/app/memory/test_credentials.md`. (customer/customer1234, admin/admin1234)

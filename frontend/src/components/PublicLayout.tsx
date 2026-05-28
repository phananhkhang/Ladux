import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

/** Public storefront chrome (navbar/footer/cart drawer). Admin routes opt out of this. */
export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pt-16 md:pt-20 min-h-[60vh]" data-testid="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

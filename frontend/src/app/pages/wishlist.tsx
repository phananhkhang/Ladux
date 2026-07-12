import { Link } from "react-router";
import { Heart, Loader2 } from "lucide-react";
import { useStore } from "../data/store";
import { ProductCard } from "../components/product-card";
import { PageShell } from "../components/storefront-layout";
import { Button } from "../components/ui/button";

export function WishlistPage() {
  const { wishlist, wishlistLoading, isAuthenticated, authLoading } = useStore();

  if (authLoading || wishlistLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
        <Heart size={40} className="mb-4 text-muted-foreground" />
        <h3>Sign in to view wishlist</h3>
        <Button asChild className="mt-6">
          <Link to="/login?redirect=/wishlist">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
        <Heart size={40} className="mb-4 text-muted-foreground" />
        <h3>Your wishlist is empty</h3>
        <p className="mt-1 text-sm text-muted-foreground">Save laptops you love for later.</p>
        <Button asChild className="mt-6">
          <Link to="/products">Browse laptops</Link>
        </Button>
      </div>
    );
  }

  return (
    <PageShell title="Wishlist" subtitle={`${wishlist.length} saved`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {wishlist.map((w) => (
          <ProductCard key={w.id} product={w.product} />
        ))}
      </div>
    </PageShell>
  );
}

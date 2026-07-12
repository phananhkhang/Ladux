import { Link, useNavigate } from "react-router";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStore, getApiErrorMessage } from "../data/store";
import { formatPrice, productImages, shortSpecFromSpecs } from "@/lib/format";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { PageShell } from "../components/storefront-layout";

export function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartLoading,
    isAuthenticated,
    authLoading,
  } = useStore();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
        <ShoppingCart size={40} className="mb-4 text-muted-foreground" />
        <h3>Sign in to view your cart</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your cart is stored on the server for this account.
        </p>
        <Button asChild className="mt-6">
          <Link to="/login?redirect=/cart">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (cartLoading && cart.length === 0) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
        <ShoppingCart size={40} className="mb-4 text-muted-foreground" />
        <h3>Your cart is empty</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add a laptop to get started.</p>
        <Button asChild className="mt-6">
          <Link to="/products">Browse laptops</Link>
        </Button>
      </div>
    );
  }

  const shipping = 0;
  const tax = cartTotal * 0.08;

  const changeQty = async (productId: number, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const remove = async (productId: number) => {
    try {
      await removeFromCart(productId);
      toast.success("Removed from cart");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <PageShell title="Shopping cart" subtitle={`${cart.length} item(s)`}>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.map(({ product, quantity }) => {
            const price = Number(product.discountPrice ?? product.basePrice);
            const images = productImages(product);
            return (
              <div key={product.id} className="flex gap-4 rounded-lg border bg-card p-4">
                <Link to={`/products/${product.slug}`} className="shrink-0">
                  <ImageWithFallback
                    src={images[0]}
                    alt={product.name}
                    className="size-24 rounded-md object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/products/${product.slug}`}>
                        <h4>{product.name}</h4>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {shortSpecFromSpecs(product.specs)}
                      </p>
                    </div>
                    <button
                      onClick={() => void remove(product.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-md border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-r-none"
                        disabled={quantity <= 1}
                        onClick={() => void changeQty(product.id, quantity - 1)}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-l-none"
                        disabled={quantity >= product.stockQuantity}
                        onClick={() => void changeQty(product.id, quantity + 1)}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                    <span className="tabular-nums">{formatPrice(price * quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit space-y-4 rounded-lg border bg-card p-6">
          <h3>Order summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (est.)</span>
              <span className="tabular-nums">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(cartTotal + tax + shipping)}</span>
          </div>
          <Button size="lg" className="w-full" onClick={() => navigate("/checkout")}>
            Checkout <ArrowRight size={16} />
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Check, CreditCard, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Addresses, Coupons, Orders, getApiErrorMessage } from "@/api/client";
import type { PaymentProvider, UserAddressResponse } from "@/api/types";
import { formatPrice, formatAddress } from "@/lib/format";
import { useStore } from "../data/store";
import { PageShell } from "../components/storefront-layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export function CheckoutPage() {
  const { cart, cartTotal, clearCart, isAuthenticated, authLoading } = useStore();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<UserAddressResponse[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [payment, setPayment] = useState<PaymentProvider>("VNPAY");
  const [coupon, setCoupon] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [addrOpen, setAddrOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    receiverName: "",
    phone: "",
    street: "",
    district: "",
    city: "",
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      setLoadingAddr(true);
      try {
        const list = await Addresses.mine();
        if (cancelled) return;
        setAddresses(list ?? []);
        const def = list?.find((a) => a.isDefault) ?? list?.[0];
        if (def) setAddressId(String(def.id));
      } catch {
        if (!cancelled) setAddresses([]);
      } finally {
        if (!cancelled) setLoadingAddr(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-24 text-center">
        <h3>Sign in to checkout</h3>
        <Button asChild className="mt-4">
          <Link to="/login?redirect=/checkout">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-24 text-center">
        <h3>Your cart is empty</h3>
        <Button asChild className="mt-4">
          <Link to="/products">Browse laptops</Link>
        </Button>
      </div>
    );
  }

  const tax = cartTotal * 0.08;
  const total = Math.max(0, cartTotal + tax - discount);
  const selected = addresses.find((a) => String(a.id) === addressId);

  const applyCoupon = async () => {
    const code = coupon.trim();
    if (!code) return;
    try {
      const res = await Coupons.apply({ code });
      setAppliedCode(res.code);
      // Estimate discount for display (backend re-applies at order time)
      if (res.discountType === "PERCENT") {
        setDiscount((cartTotal * Number(res.discountValue)) / 100);
      } else {
        setDiscount(Number(res.discountValue));
      }
      toast.success(`Coupon ${res.code} applied`);
    } catch (e) {
      setAppliedCode(null);
      setDiscount(0);
      toast.error(getApiErrorMessage(e, "Invalid coupon"));
    }
  };

  const createAddress = async () => {
    try {
      const created = await Addresses.create(newAddr);
      setAddresses((prev) => [...prev, created]);
      setAddressId(String(created.id));
      setAddrOpen(false);
      toast.success("Address saved");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const placeOrder = async () => {
    if (!selected) {
      toast.error("Please select a shipping address");
      return;
    }
    setPlacing(true);
    try {
      const order = await Orders.create({
        paymentProvider: payment,
        shippingAddress: formatAddress(selected),
        couponCode: appliedCode,
      });
      await clearCart().catch(() => null);
      toast.success(`Order #${order.id} placed`);
      if (payment === "VNPAY" || payment === "MOMO") {
        navigate(`/payment?orderId=${order.id}`);
      } else {
        navigate(`/payment/success?orderId=${order.id}`);
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not place order"));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageShell title="Checkout">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="space-y-4 rounded-lg border bg-card p-6">
            <h3 className="flex items-center gap-2">
              <Truck size={18} /> Shipping address
            </h3>
            {loadingAddr ? (
              <Loader2 className="animate-spin text-muted-foreground" size={20} />
            ) : addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
            ) : (
              <RadioGroup value={addressId} onValueChange={setAddressId} className="space-y-2">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm"
                  >
                    <RadioGroupItem value={String(a.id)} />
                    <span>{formatAddress(a)}</span>
                    {a.isDefault && (
                      <span className="ml-auto rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Default
                      </span>
                    )}
                  </label>
                ))}
              </RadioGroup>
            )}
            <Button variant="outline" size="sm" onClick={() => setAddrOpen(true)}>
              + Add new address
            </Button>
          </section>

          <section className="space-y-4 rounded-lg border bg-card p-6">
            <h3 className="flex items-center gap-2">
              <CreditCard size={18} /> Payment method
            </h3>
            <RadioGroup
              value={payment}
              onValueChange={(v) => setPayment(v as PaymentProvider)}
              className="space-y-2"
            >
              <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm">
                <RadioGroupItem value="VNPAY" />
                <span>VNPAY — Pay online securely</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm">
                <RadioGroupItem value="COD" />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm">
                <RadioGroupItem value="MOMO" />
                <span>MoMo e-wallet</span>
              </label>
            </RadioGroup>
          </section>
        </div>

        <div className="h-fit space-y-4 rounded-lg border bg-card p-6">
          <h3>Order summary</h3>
          <div className="space-y-3">
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {product.name} × {quantity}
                </span>
                <span className="tabular-nums">
                  {formatPrice(Number(product.discountPrice ?? product.basePrice) * quantity)}
                </span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <Button variant="outline" onClick={() => void applyCoupon()}>
              Apply
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <SummaryRow label="Subtotal" value={formatPrice(cartTotal)} />
            <SummaryRow label="Tax (est.)" value={formatPrice(tax)} />
            <SummaryRow label="Shipping" value="Free" />
            {discount > 0 && (
              <SummaryRow label="Discount" value={`-${formatPrice(discount)}`} />
            )}
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={placing || !selected}
            onClick={() => void placeOrder()}
          >
            {placing ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Placing order...
              </>
            ) : (
              <>
                Place order <Check size={16} />
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={addrOpen} onOpenChange={setAddrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New address</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Receiver name</Label>
              <Input
                value={newAddr.receiverName}
                onChange={(e) => setNewAddr((a) => ({ ...a, receiverName: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={newAddr.phone}
                onChange={(e) => setNewAddr((a) => ({ ...a, phone: e.target.value }))}
                placeholder="0901234567"
              />
            </div>
            <div className="space-y-1">
              <Label>Street</Label>
              <Input
                value={newAddr.street}
                onChange={(e) => setNewAddr((a) => ({ ...a, street: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>District</Label>
                <Input
                  value={newAddr.district}
                  onChange={(e) => setNewAddr((a) => ({ ...a, district: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>City</Label>
                <Input
                  value={newAddr.city}
                  onChange={(e) => setNewAddr((a) => ({ ...a, city: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddrOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void createAddress()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

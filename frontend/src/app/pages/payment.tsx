import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { Orders } from "@/api/client";
import { Button } from "../components/ui/button";

export function PaymentPendingPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const [seconds, setSeconds] = useState(15);
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  // Poll order status while waiting for gateway webhook
  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const order = await Orders.byId(Number(orderId));
        if (cancelled) return;
        setStatus(order.status);
        if (order.status === "CONFIRMED" || order.status === "SHIPPED" || order.status === "DELIVERED") {
          navigate(`/payment/success?orderId=${orderId}`);
        } else if (order.status === "CANCELLED") {
          navigate(`/payment/failed?orderId=${orderId}`);
        }
      } catch {
        /* keep waiting */
      }
    };
    void tick();
    const id = setInterval(() => void tick(), 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [orderId, navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <Loader2 size={48} className="mx-auto animate-spin text-muted-foreground" />
      <h2 className="mt-6">Awaiting payment confirmation</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {orderId
          ? `Order #${orderId} — complete payment in the gateway window if prompted.`
          : "Do not close this window. You'll be redirected automatically."}
      </p>
      {status && (
        <p className="mt-2 text-xs text-muted-foreground">Current status: {status}</p>
      )}
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
        <Clock size={16} /> Polling… {seconds}s
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link to={orderId ? `/orders` : "/orders"}>View orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/products">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <CheckCircle2 size={56} className="mx-auto text-green-500" />
      <h2 className="mt-6">Payment successful</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Thank you for your order!
        {orderId ? (
          <>
            {" "}
            Your order <b>#{orderId}</b> is now being processed.
          </>
        ) : (
          " A confirmation has been sent to your email."
        )}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link to="/orders">View my orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/products">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export function PaymentFailedPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <XCircle size={56} className="mx-auto text-destructive" />
      <h2 className="mt-6">Payment failed</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn&apos;t process your payment
        {orderId ? ` for order #${orderId}` : ""}. Please try again from My Orders.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link to="/orders">My orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/cart">Back to cart</Link>
        </Button>
      </div>
    </div>
  );
}

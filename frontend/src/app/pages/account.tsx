import { useEffect, useState } from "react";
import { Link } from "react-router";
import { MapPin, Plus, Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Addresses, Auth, getApiErrorMessage } from "@/api/client";
import type { UserAddressResponse } from "@/api/types";
import { formatAddress } from "@/lib/format";
import { useStore } from "../data/store";
import { PageShell } from "../components/storefront-layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export function AccountPage() {
  const { user, isAuthenticated, authLoading, refreshUser } = useStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [addresses, setAddresses] = useState<UserAddressResponse[]>([]);
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
    if (user) {
      setFullName(user.fullName ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void Addresses.mine()
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="py-24 text-center">
        <h3>Sign in to manage your account</h3>
        <Button asChild className="mt-4">
          <Link to="/login?redirect=/account">Sign in</Link>
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">
          Or open{" "}
          <Link to="/profile" className="underline underline-offset-2">
            My profile
          </Link>
        </p>
      </div>
    );
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Auth.updateMe({
        fullName: fullName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password || undefined,
      });
      setPassword("");
      await refreshUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (id: number) => {
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    try {
      await Addresses.update(id, {
        receiverName: a.receiverName,
        phone: a.phone,
        street: a.street,
        district: a.district,
        city: a.city,
        isDefault: true,
      });
      const list = await Addresses.mine();
      setAddresses(list);
      toast.success("Default address updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const remove = async (id: number) => {
    try {
      await Addresses.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address removed");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const createAddress = async () => {
    try {
      const created = await Addresses.create(newAddr);
      setAddresses((prev) => [...prev, created]);
      setAddrOpen(false);
      toast.success("Address saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <PageShell
      title="My account"
      subtitle="Addresses & account settings — or open My profile for the full hub."
      action={
        <Button asChild variant="outline" size="sm">
          <Link to="/profile">My profile</Link>
        </Button>
      }
    >
      <Tabs defaultValue="addresses">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form className="max-w-lg space-y-4 rounded-lg border bg-card p-6" onSubmit={saveProfile}>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={user.username} disabled />
            </div>
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567" />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : null}
              Save changes
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="password">
          <form className="max-w-lg space-y-4 rounded-lg border bg-card p-6" onSubmit={saveProfile}>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <Button type="submit" disabled={saving || password.length < 6}>
              Update password
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="max-w-2xl space-y-4">
            {addresses.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <MapPin size={18} className="mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{a.receiverName}</span>
                    {a.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        <Star size={10} className="fill-amber-400 text-amber-400" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{formatAddress(a)}</p>
                </div>
                <div className="flex gap-1">
                  {!a.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => void makeDefault(a.id)}>
                      Set default
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => void remove(a.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={() => setAddrOpen(true)}>
              <Plus size={16} /> Add address
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={addrOpen} onOpenChange={setAddrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New address</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {(
              [
                ["receiverName", "Receiver name"],
                ["phone", "Phone"],
                ["street", "Street"],
                ["district", "District"],
                ["city", "City"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  value={newAddr[key]}
                  onChange={(e) => setNewAddr((a) => ({ ...a, [key]: e.target.value }))}
                />
              </div>
            ))}
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

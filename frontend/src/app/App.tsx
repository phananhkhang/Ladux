import React, { useState } from "react";
import {
  Laptop,
  Search,
  ShoppingBag,
  Heart,
  User,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Check,
  SlidersHorizontal,
  Boxes,
  FileText,
  Plus,
  Trash2,
  Eye,
  BarChart2,
  AlertCircle,
  RefreshCw,
  Cpu,
  HardDrive,
  Monitor,
  Zap,
  MessageSquare,
  Send,
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Users,
  CheckCircle2,
  LogOut,
  Lock,
  UserPlus,
  ArrowLeft,
  Pencil,
  Home,
  Building2,
  X,
  Loader2,
} from "lucide-react";
import heroLaptopImg from "../imports/O1CN01dJEBqB1EYIkvQLZNQ_1677810363-0-cib_6159-removebg-preview.png";
import laduxLogoImg from "../imports/LaduxLogo.png";

export type CustomerLevel = "BROWSER" | "SILVER" | "GOLD" | "RUBY";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED"
  | "CANCELLED";
export type PaymentProvider = "VNPAY" | "MOMO" | "COD";

export interface VariantOption {
  ram: "16GB" | "32GB" | "64GB";
  storage: "512GB SSD" | "1TB SSD" | "2TB SSD";
  colorName: string;
  colorHex: string;
  priceDelta: number;
}

export interface ShippingAddressRequest {
  id: number;
  fullName: string;
  phone: string;
  addressDetail: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface CartItem {
  product: LaptopProduct;
  quantity: number;
  selectedRam: string;
  selectedStorage: string;
  selectedColorName: string;
  selectedColorHex: string;
  price: number;
}

export interface CouponItem {
  code: string;
  discountAmount: number;
  minSubtotal: number;
  description: string;
}

export interface OrderItemRecord {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  shippingAddress: ShippingAddressRequest;
  paymentMethod: PaymentProvider;
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  status: OrderStatus;
  trackingNumber: string;
}
export type PurchaseOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";
export type StockMovementType =
  | "PURCHASE_IN"
  | "SALE_OUT"
  | "RETURN_IN"
  | "DAMAGE_OUT"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "OTHER";

export interface ReviewItem {
  id: number;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  avatar: string;
}

export interface LaptopProduct {
  id: number;
  brand: string;
  category: "Gaming" | "Ultrabook" | "MacBook" | "Workstation" | "Doanh Nhân";
  name: string;
  slug: string;
  cpu: string;
  gpu: string;
  display: string;
  ram: string;
  rom: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  reviews: ReviewItem[];
  isNew?: boolean;
  isFeatured?: boolean;
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const MOCK_PRODUCTS: LaptopProduct[] = [
  {
    id: 1,
    brand: "ASUS ROG",
    category: "Gaming",
    name: "ASUS ROG Zenbook Duo (i9 / Dual OLED Screen / 32GB / 1TB)",
    slug: "asus-rog-zenbook-duo",
    cpu: "Intel Core Ultra 9 185H (16 nhân, 22 luồng)",
    gpu: "Intel Arc Graphics High Performance",
    display: "Dual 14.0 inch 3K OLED (2880 x 1800) 120Hz Touchscreen",
    ram: "32GB LPDDR5X",
    rom: "1TB PCIe 4.0 NVMe SSD",
    price: 59990000,
    discountPrice: 54990000,
    stockQuantity: 12,
    rating: 5.0,
    reviewCount: 38,
    images: [
      heroLaptopImg,
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&fit=crop&auto=format",
    ],
    description:
      "Laptop màn hình kép độc đáo đẳng cấp thế giới. Bàn phím Bluetooth tháo rời biến thiết bị thành trạm làm việc đa màn hình di động.",
    reviews: [
      {
        id: 1,
        reviewerName: "Trần Hoàng Minh",
        rating: 5,
        comment:
          "Màn hình kép quá đỉnh cho nhu cầu dựng phim & mở bảng vẽ kịch bản cùng lúc! Máy chạy cực mượt, nhiệt độ rất ổn định.",
        createdAt: "22/08/2026",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&auto=format",
      },
      {
        id: 2,
        reviewerName: "Lê Thị Thu Thảo",
        rating: 5,
        comment:
          "Hàng giao chuẩn hỏa tốc 2 giờ nguyên seal. Đã test màn hình OLED rực rỡ 100% DCI-P3 chuẩn điện ảnh.",
        createdAt: "18/08/2026",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&fit=crop&auto=format",
      },
    ],
    isNew: true,
    isFeatured: true,
  },
  {
    id: 2,
    brand: "Apple",
    category: "MacBook",
    name: "MacBook Pro 16 inch M3 Max (36GB / 1TB SSD) Space Black",
    slug: "macbook-pro-16-m3-max",
    cpu: "Apple M3 Max (16-core CPU, 40-core GPU)",
    gpu: "Integrated 40-Core GPU",
    display: "16.2 inch Liquid Retina XDR (3456 x 2234), 120Hz ProMotion",
    ram: "36GB Unified Memory",
    rom: "1TB SSD NVMe",
    price: 99990000,
    discountPrice: 94990000,
    stockQuantity: 14,
    rating: 4.9,
    reviewCount: 42,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&fit=crop&auto=format",
    ],
    description:
      "MacBook Pro 16 inch với chip M3 Max mang lại hiệu năng cực đỉnh cho các chuyên gia đồ họa, lập trình và sáng tạo video 8K.",
    reviews: [
      {
        id: 3,
        reviewerName: "Phạm Quốc Bảo",
        rating: 5,
        comment:
          "M3 Max xuất video 8K ProRes nhanh không tưởng. Vỏ màu Space Black chống bám vân tay tốt hơn đời cũ rất nhiều.",
        createdAt: "15/08/2026",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&auto=format",
      },
    ],
    isNew: true,
    isFeatured: true,
  },
];

// ─── Auth Form Components ───────────────────────────────────────────────────

interface LoginViewProps {
  onLogin: () => void;
  onGoRegister: () => void;
  onBack: () => void;
}

function LoginView({ onLogin, onGoRegister, onBack }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 900);
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-[#00D492] mb-10 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại cửa hàng
        </button>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 sm:p-10 backdrop-blur-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D492]/15 border border-[#00D492]/30 mb-4">
              <Lock className="w-6 h-6 text-[#00D492]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Đăng nhập</h1>
            <p className="mt-1.5 text-xs text-neutral-500">Chào mừng trở lại với LADUX</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/30 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/30 transition"
              />
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-[11px] text-[#00D492] hover:underline font-semibold">
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#00D492] py-3.5 text-sm font-extrabold text-black uppercase tracking-wider hover:bg-[#00bc82] disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-100 mt-2"
            >
              {loading ? "Đang xác thực..." : "Đăng Nhập"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
              <span className="bg-[#0e1213] px-3 text-neutral-500">Hoặc tiếp tục với</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                onLogin();
              }, 800);
            }}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-800 bg-black/50 py-3.5 text-xs font-bold text-white transition-all hover:border-[#00D492]/50 hover:bg-white/[0.05]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.13C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.63H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.37l3.99-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.63l3.99 3.13c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Đăng nhập bằng Google</span>
          </button>

          <p className="mt-7 text-center text-xs text-neutral-500">
            Chưa có tài khoản?{" "}
            <button
              onClick={onGoRegister}
              className="font-bold text-[#00D492] hover:underline"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>

        {/* Social proof */}
        <p className="mt-6 text-center text-[10px] text-neutral-600 font-mono uppercase tracking-widest">
          Bảo mật SSL · Dữ liệu mã hóa 256-bit
        </p>
      </div>
    </main>
  );
}

interface RegisterViewProps {
  onRegister: () => void;
  onGoLogin: () => void;
  onBack: () => void;
}

function RegisterView({ onRegister, onGoLogin, onBack }: RegisterViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegister();
    }, 900);
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-[#00D492] mb-10 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại cửa hàng
        </button>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 sm:p-10 backdrop-blur-md">
          <div className="mb-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D492]/15 border border-[#00D492]/30 mb-4">
              <UserPlus className="w-6 h-6 text-[#00D492]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Tạo tài khoản</h1>
            <p className="mt-1.5 text-xs text-neutral-500">Tham gia cộng đồng thành viên LADUX</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Họ & Tên
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/30 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/30 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/30 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/30 transition"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#00D492] py-3.5 text-sm font-extrabold text-black uppercase tracking-wider hover:bg-[#00bc82] disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-100 mt-2"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng Ký"}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-neutral-500">
            Đã có tài khoản?{" "}
            <button
              onClick={onGoLogin}
              className="font-bold text-[#00D492] hover:underline"
            >
              Đăng nhập
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] text-neutral-600 font-mono uppercase tracking-widest">
          Bảo mật SSL · Dữ liệu mã hóa 256-bit
        </p>
      </div>
    </main>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [currentView, setCurrentView] = useState<
    | "store"
    | "product-detail"
    | "cart"
    | "checkout"
    | "orders"
    | "wishlist"
    | "about"
    | "contact"
    | "account"
    | "addresses"
    | "login"
    | "register"
  >("store");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<number>(150000000);

  const [selectedProduct, setSelectedProduct] = useState<LaptopProduct | null>(MOCK_PRODUCTS[0]);
  
  // User Avatar state
  const [userAvatar, setUserAvatar] = useState<string>(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&auto=format"
  );
  
  // Variant states for Product Detail
  const [selectedRam, setSelectedRam] = useState<"16GB" | "32GB" | "64GB">("32GB");
  const [selectedStorage, setSelectedStorage] = useState<"512GB SSD" | "1TB SSD" | "2TB SSD">("1TB SSD");
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>({
    name: "Space Black",
    hex: "#1D1D1F",
  });
  const [productQuantity, setProductQuantity] = useState<number>(1);

  // Cart state with variants
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: MOCK_PRODUCTS[0],
      quantity: 1,
      selectedRam: "32GB",
      selectedStorage: "1TB SSD",
      selectedColorName: "Space Black",
      selectedColorHex: "#1D1D1F",
      price: 54990000,
    },
  ]);
  const [wishlist, setWishlist] = useState<number[]>([1, 2]);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Shipping Addresses State
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddressRequest[]>([
    {
      id: 1,
      fullName: "Lê Huy",
      phone: "0988 123 456",
      addressDetail: "Số 88 Tôn Thất Thuyết",
      ward: "Phường Mỹ Đình 2",
      district: "Quận Nam Từ Liêm",
      city: "Hà Nội",
      isDefault: true,
    },
    {
      id: 2,
      fullName: "Lê Huy (Văn phòng)",
      phone: "0912 345 678",
      addressDetail: "Tầng 12, Tòa nhà Keangnam Landmark 72",
      ward: "Phường Mễ Trì",
      district: "Quận Nam Từ Liêm",
      city: "Hà Nội",
      isDefault: false,
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(1);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    addressDetail: "",
    ward: "",
    district: "",
    city: "Hà Nội",
    isDefault: false,
  });

  // Address Management page state
  const [showAddrFormModal, setShowAddrFormModal] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<number | null>(null);
  const [addrForm, setAddrForm] = useState({
    fullName: "",
    phone: "",
    addressDetail: "",
    ward: "",
    district: "",
    city: "Hà Nội",
    isDefault: false,
  });
  const [addrSaving, setAddrSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const openAddAddr = () => {
    setEditingAddrId(null);
    setAddrForm({ fullName: "", phone: "", addressDetail: "", ward: "", district: "", city: "Hà Nội", isDefault: false });
    setShowAddrFormModal(true);
  };

  const openEditAddr = (addr: ShippingAddressRequest) => {
    setEditingAddrId(addr.id);
    setAddrForm({ fullName: addr.fullName, phone: addr.phone, addressDetail: addr.addressDetail, ward: addr.ward, district: addr.district, city: addr.city, isDefault: addr.isDefault });
    setShowAddrFormModal(true);
  };

  const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;

  const saveAddrForm = () => {
    const cleanPhone = addrForm.phone.replace(/\s/g, "");
    if (!addrForm.fullName.trim()) { showToast("Vui lòng nhập họ tên người nhận."); return; }
    if (!VN_PHONE_REGEX.test(cleanPhone)) { showToast("Số điện thoại không đúng định dạng Việt Nam."); return; }
    if (!addrForm.addressDetail.trim()) { showToast("Vui lòng nhập địa chỉ nhà/tên đường."); return; }
    if (!addrForm.ward.trim() || !addrForm.district.trim() || !addrForm.city.trim()) { showToast("Vui lòng điền đầy đủ phường, quận, thành phố."); return; }

    setAddrSaving(true);
    setTimeout(() => {
      if (editingAddrId !== null) {
        setSavedAddresses(prev => prev.map(a => {
          if (a.id === editingAddrId) return { ...a, ...addrForm };
          if (addrForm.isDefault) return { ...a, isDefault: false };
          return a;
        }));
        showToast("Đã cập nhật địa chỉ thành công!");
      } else {
        const newId = Date.now();
        setSavedAddresses(prev => {
          const updated = addrForm.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev;
          return [...updated, { id: newId, ...addrForm }];
        });
        showToast("Đã thêm địa chỉ mới thành công!");
      }
      setAddrSaving(false);
      setShowAddrFormModal(false);
    }, 800);
  };

  const setDefaultAddr = (id: number) => {
    setSavedAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    setSelectedAddressId(id);
    showToast("Đã đặt làm địa chỉ mặc định!");
  };

  const deleteAddr = (id: number) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
    setDeleteConfirmId(null);
    showToast("Đã xóa địa chỉ giao hàng.");
  };

  // Coupons State
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>("VNPAY");

  // Orders State
  const [orders, setOrders] = useState<OrderItemRecord[]>([
    {
      id: "ord-081926",
      orderNumber: "LDX-081926",
      date: "22/08/2026",
      items: [
        {
          product: MOCK_PRODUCTS[0],
          quantity: 1,
          selectedRam: "32GB",
          selectedStorage: "1TB SSD",
          selectedColorName: "Space Black",
          selectedColorHex: "#1D1D1F",
          price: 54990000,
        },
      ],
      shippingAddress: {
        id: 1,
        fullName: "Lê Huy",
        phone: "0988 123 456",
        addressDetail: "Số 88 Tôn Thất Thuyết",
        ward: "Phường Mỹ Đình 2",
        district: "Quận Nam Từ Liêm",
        city: "Hà Nội",
        isDefault: true,
      },
      paymentMethod: "VNPAY",
      subTotal: 54990000,
      discountAmount: 2000000,
      shippingFee: 0,
      finalAmount: 52990000,
      status: "SHIPPED",
      trackingNumber: "VNPOST-99281726",
    },
  ]);
  const [selectedOrderId, setSelectedAddressOrderId] = useState<string>("ord-081926");

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView("account");
    showToast("Đăng nhập thành công! Chào mừng bạn.");
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setCurrentView("account");
    showToast("Tạo tài khoản thành công! Chào mừng thành viên mới.");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView("store");
    showToast("Bạn đã đăng xuất thành công.");
  };

  const computeVariantPrice = (basePrice: number, ram: string, storage: string) => {
    let extra = 0;
    if (ram === "32GB") extra += 3000000;
    if (ram === "64GB") extra += 8000000;
    if (storage === "1TB SSD") extra += 2500000;
    if (storage === "2TB SSD") extra += 6000000;
    return basePrice + extra;
  };

  const addToCartCustom = (
    product: LaptopProduct,
    ram: string,
    storage: string,
    colorName: string,
    colorHex: string,
    qty: number
  ) => {
    const base = product.discountPrice || product.price;
    const finalUnitPrice = computeVariantPrice(base, ram, storage);

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedRam === ram &&
          item.selectedStorage === storage &&
          item.selectedColorName === colorName
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: qty,
          selectedRam: ram,
          selectedStorage: storage,
          selectedColorName: colorName,
          selectedColorHex: colorHex,
          price: finalUnitPrice,
        },
      ];
    });
    showToast(`Đã thêm ${qty} x "${product.name}" (${ram} / ${storage}) vào giỏ hàng`);
  };

  const updateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((_, i) => i !== index));
      showToast("Đã xóa sản phẩm khỏi giỏ hàng");
      return;
    }
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
    );
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Vui lòng nhập mã giảm giá.");
      return;
    }
    if (code === "LADUX2M" || code === "WELCOME10") {
      const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
      const discount = code === "LADUX2M" ? 2000000 : Math.round(subtotal * 0.1);
      setAppliedCoupon({
        code,
        discountAmount: discount,
        minSubtotal: 20000000,
        description: code === "LADUX2M" ? "Giảm ngay 2.000.000₫ cho đơn Laptop" : "Giảm 10% tổng đơn hàng",
      });
      showToast(`Đã áp dụng mã giảm giá ${code} thành công!`);
    } else {
      setCouponError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }
  };

  const toggleWishlist = (id: number) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id));
      showToast("Đã xóa khỏi danh sách yêu thích");
    } else {
      setWishlist([...wishlist, id]);
      showToast("Đã thêm vào danh sách yêu thích");
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedProduct) return;

    const newRev: ReviewItem = {
      id: Date.now(),
      reviewerName: "Khách Hàng LADUX VIP",
      rating: newRating,
      comment: newComment,
      createdAt: "Vừa xong",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&auto=format",
    };

    setSelectedProduct({
      ...selectedProduct,
      reviews: [newRev, ...selectedProduct.reviews],
      reviewCount: selectedProduct.reviewCount + 1,
    });

    setNewComment("");
    showToast("Cảm ơn bạn đã gửi đánh giá sản phẩm!");
  };

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchBrand = selectedBrand === "All" || p.brand === selectedBrand;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cpu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.gpu.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = (p.discountPrice || p.price) <= priceRange;
    return matchCategory && matchBrand && matchSearch && matchPrice;
  });

  // ─── Login / Register views (no header) ───────────────────────────────────
  if (currentView === "login") {
    return (
      <div className="dark min-h-screen overflow-x-hidden bg-[#080a0b] text-white font-sans selection:bg-[#00D492] selection:text-[#07100e]">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_78%_8%,rgba(0,212,146,0.12),transparent_24%),radial-gradient(circle_at_14%_56%,rgba(93,77,155,0.1),transparent_28%)]" />
        {notificationMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-white text-black px-5 py-3 rounded-md shadow-2xl text-sm font-medium flex items-center gap-3 border border-neutral-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{notificationMsg}</span>
          </div>
        )}
        {/* Minimal header */}
        <header className="border-b border-white/10 bg-[#080a0b]/65 backdrop-blur-xl">
          <div className="container mx-auto px-6 h-[64px] flex items-center">
            <button
              onClick={() => setCurrentView("store")}
              className="flex items-center gap-3"
            >
              <img
                src={laduxLogoImg}
                alt="LADUX Logo"
                className="h-9 w-auto object-contain rounded-[10px]"
              />
              <span className="text-xl font-black tracking-widest text-white">LADUX</span>
            </button>
          </div>
        </header>
        <LoginView
          onLogin={handleLogin}
          onGoRegister={() => setCurrentView("register")}
          onBack={() => setCurrentView("store")}
        />
      </div>
    );
  }

  if (currentView === "register") {
    return (
      <div className="dark min-h-screen overflow-x-hidden bg-[#080a0b] text-white font-sans selection:bg-[#00D492] selection:text-[#07100e]">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_78%_8%,rgba(0,212,146,0.12),transparent_24%),radial-gradient(circle_at_14%_56%,rgba(93,77,155,0.1),transparent_28%)]" />
        {notificationMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-white text-black px-5 py-3 rounded-md shadow-2xl text-sm font-medium flex items-center gap-3 border border-neutral-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{notificationMsg}</span>
          </div>
        )}
        <header className="border-b border-white/10 bg-[#080a0b]/65 backdrop-blur-xl">
          <div className="container mx-auto px-6 h-[64px] flex items-center">
            <button
              onClick={() => setCurrentView("store")}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-white text-black font-extrabold flex items-center justify-center rounded text-xs tracking-wider">
                LX
              </div>
              <span className="text-xl font-black tracking-widest">LADUX</span>
            </button>
          </div>
        </header>
        <RegisterView
          onRegister={handleRegister}
          onGoLogin={() => setCurrentView("login")}
          onBack={() => setCurrentView("store")}
        />
      </div>
    );
  }

  // ─── Main layout (all other views) ────────────────────────────────────────
  return (
    <div className="dark min-h-screen overflow-x-hidden bg-[#080a0b] text-white font-sans selection:bg-[#00D492] selection:text-[#07100e]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_78%_8%,rgba(0,212,146,0.12),transparent_24%),radial-gradient(circle_at_14%_56%,rgba(93,77,155,0.1),transparent_28%),linear-gradient(180deg,#080a0b_0%,#060708_100%)]" />

      {/* Toast */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-black px-5 py-3 rounded-md shadow-2xl text-sm font-medium flex items-center gap-3 border border-neutral-200 animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080a0b]/80 text-white backdrop-blur-xl">
        <div className="container mx-auto px-5 sm:px-6 h-[72px] flex items-center gap-4 lg:gap-6">

          {/* ── Logo ── */}
          <div
            onClick={() => setCurrentView("store")}
            className="cursor-pointer flex items-center gap-2.5 group shrink-0"
          >
            <img
              src={laduxLogoImg}
              alt="LADUX Logo"
              className="h-9 sm:h-10 w-auto object-contain rounded-[10px] group-hover:scale-105 transition-transform"
            />
            <span className="hidden sm:block text-xl font-black tracking-widest text-white">LADUX</span>
          </div>

          {/* ── Search Bar (Amazon-style) ── */}
          <div className="flex-1 flex items-stretch h-11 rounded-md overflow-hidden border border-white/[0.12] bg-white/[0.04] focus-within:border-[#00D492]/60 focus-within:ring-1 focus-within:ring-[#00D492]/20 transition-all max-w-[calc(100%-20px)] ml-2">
            {/* Text Input */}
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentView("store");
              }}
              onKeyDown={(e) => { if (e.key === "Enter") setCurrentView("store"); }}
              className="flex-1 bg-transparent px-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none min-w-0"
            />

            {/* Divider */}
            <div className="w-px bg-white/[0.1] self-stretch" />

            {/* Category Dropdown */}
            <div className="relative flex items-center shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentView("store");
                }}
                className="appearance-none bg-transparent pl-4 pr-8 h-full text-[11px] font-bold uppercase tracking-widest text-neutral-300 focus:outline-none cursor-pointer hover:text-white transition-colors"
              >
                <option value="All" className="bg-[#0d0f10] text-white">Chọn danh mục</option>
                <option value="Gaming" className="bg-[#0d0f10] text-white">Gaming</option>
                <option value="Ultrabook" className="bg-[#0d0f10] text-white">Ultrabook</option>
                <option value="MacBook" className="bg-[#0d0f10] text-white">MacBook</option>
                <option value="Workstation" className="bg-[#0d0f10] text-white">Workstation</option>
                <option value="Doanh Nhân" className="bg-[#0d0f10] text-white">Doanh Nhân</option>
              </select>
              <ChevronRight className="absolute right-2 w-3.5 h-3.5 text-neutral-400 rotate-90 pointer-events-none" />
            </div>

            {/* Search Button */}
            <button
              onClick={() => setCurrentView("store")}
              className="flex items-center justify-center w-12 bg-[#00D492] hover:bg-[#00bc82] active:bg-[#009e6d] transition-colors shrink-0"
              aria-label="Tìm kiếm"
            >
              <Search className="w-5 h-5 text-black stroke-[2.5]" />
            </button>
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Wishlist */}
            <button
              onClick={() => setCurrentView("wishlist")}
              className="relative p-2.5 text-neutral-400 hover:text-white transition rounded-xl hover:bg-white/[0.06]"
              aria-label="Danh sách yêu thích"
            >
              <Heart className="w-5 h-5 text-red-400 fill-red-400/20" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#00D492] text-black font-bold text-[9px] rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCurrentView("cart")}
              className="relative p-2.5 text-neutral-400 hover:text-white transition rounded-xl hover:bg-white/[0.06]"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#00D492] text-black font-bold text-[9px] rounded-full flex items-center justify-center">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* Account */}
            {isLoggedIn ? (
              <button
                onClick={() => setCurrentView("account")}
                aria-label="Tài khoản"
                className="group hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3.5 text-neutral-200 transition hover:border-[#00D492]/50 hover:bg-white/[0.08]"
              >
                <img
                  src={userAvatar}
                  alt="Avatar"
                  className="h-7 w-7 rounded-lg object-cover border border-[#00D492]"
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Tài khoản</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView("login")}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#00D492]/40 bg-[#00D492]/10 py-2 px-4 text-[#00D492] text-[10px] font-bold uppercase tracking-widest hover:bg-[#00D492]/20 transition"
              >
                <Lock className="w-3.5 h-3.5" /> Đăng nhập
              </button>
            )}
            <button
              onClick={() => setCurrentView(isLoggedIn ? "account" : "login")}
              aria-label="Tài khoản"
              className="sm:hidden p-2.5 text-neutral-400 hover:text-[#00D492] rounded-xl hover:bg-white/[0.06] transition"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* ── VIEW: STOREFRONT ── */}
      {currentView === "store" && (
        <main>
          <section className="relative overflow-hidden py-20 lg:py-28 border-b border-white/[0.08]">
            <div className="pointer-events-none absolute -right-32 top-0 h-[34rem] w-[34rem] rounded-full bg-[#00D492]/[0.07] blur-3xl" />
            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-2">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
                    Laptop{" "}
                    <span className="text-[#00D492] font-script italic font-normal text-6xl sm:text-7xl lg:text-8xl">
                      perfect
                    </span>{" "}
                    for
                  </h1>
                  <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
                    anyone.
                  </h2>
                  <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-neutral-500 leading-none pt-2">
                    Laptop <span className="text-[#00D492]">premium</span>
                  </h2>
                </div>

                <p className="text-neutral-400 text-sm max-w-lg leading-relaxed pt-2">
                  Trải nghiệm dòng Laptop 2 màn hình cảm ứng kép thế hệ mới. Đạt chuẩn hiệu năng cao nhất cho công việc sáng tạo, lập trình & đồ họa chuyên nghiệp.
                </p>

                <div className="flex flex-wrap items-center gap-5 pt-4">
                  <button
                    onClick={() => {
                      const el = document.getElementById("catalog-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-[#00D492] hover:bg-[#00bc82] text-black font-extrabold px-8 py-4 rounded-full text-sm flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-[#00D492]/20"
                  >
                    <span>Get Starter</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>

                  <button
                    onClick={() => showToast("Đang mở video giới thiệu Laptop...")}
                    className="border-2 border-white/80 hover:border-white text-white font-bold px-8 py-4 rounded-full text-sm transition-colors flex items-center gap-2"
                  >
                    <span>Watch video</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 relative flex justify-center items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#00D492]/30 to-purple-600/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                  <img
                    src={heroLaptopImg}
                    alt="Laptop perfect for anyone"
                    className="relative w-full max-w-lg object-contain drop-shadow-[0_20px_50px_rgba(0,212,146,0.3)] hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Catalog */}
          <section id="catalog-section" className="py-16 container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-neutral-900 gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#00D492]">
                  DANH MỤC KHUYÊN DÙNG
                </span>
                <h2 className="text-3xl font-black tracking-tight mt-1 text-white">
                  DANH SÁCH LAPTOP HIỆN CÓ
                </h2>
              </div>
              <p className="text-xs font-mono text-neutral-400">
                Hiển thị <span className="text-[#00D492] font-bold">{filteredProducts.length}</span> sản phẩm phù hợp
              </p>
            </div>

            {/* Filter Bar: Category, Brand, Price Range */}
            <div className="mb-10 p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300">
                <SlidersHorizontal className="w-4 h-4 text-[#00D492]" />
                <span>BỘ LỌC TÌM KIẾM LAPTOP</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Brand Filter */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Lọc theo Thương hiệu (Brand):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "ASUS ROG", "Apple", "Dell", "Lenovo", "MSI"].map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          selectedBrand === brand
                            ? "bg-[#00D492] text-black shadow-[0_0_10px_rgba(0,212,146,0.2)]"
                            : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Lọc theo Dòng máy (Category):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Gaming", "Ultrabook", "MacBook", "Workstation", "Doanh Nhân"].map(
                      (cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                            selectedCategory === cat
                              ? "bg-[#00D492] text-black shadow-[0_0_10px_rgba(0,212,146,0.2)]"
                              : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase text-neutral-400">
                    <span>Mức giá tối đa:</span>
                    <span className="font-mono text-[#00D492] text-xs">
                      {priceRange >= 150000000 ? "Tất cả mức giá" : formatVND(priceRange)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20000000}
                    max={150000000}
                    step={5000000}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#00D492] bg-neutral-900 rounded-lg cursor-pointer h-2"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>20.000.000 ₫</span>
                    <span>150.000.000 ₫</span>
                  </div>
                </div>
              </div>

              {(selectedBrand !== "All" || selectedCategory !== "All" || priceRange < 150000000) && (
                <div className="pt-2 border-t border-neutral-900/60 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-mono">Đang áp dụng bộ lọc</span>
                  <button
                    onClick={() => {
                      setSelectedBrand("All");
                      setSelectedCategory("All");
                      setPriceRange(150000000);
                      setSearchQuery("");
                    }}
                    className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Đặt lại bộ lọc
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((laptop) => (
                <div
                  key={laptop.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.035] shadow-[0_18px_60px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-1 hover:border-[#00D492]/60 hover:shadow-[0_22px_80px_rgba(0,212,146,0.12)] flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent to-transparent pointer-events-none" />
                      <button
                        onClick={() => toggleWishlist(laptop.id)}
                        aria-label={
                          wishlist.includes(laptop.id)
                            ? "Xóa khỏi yêu thích"
                            : "Thêm vào yêu thích"
                        }
                        className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
                          wishlist.includes(laptop.id)
                            ? "border-[#00D492]/60 bg-[#00D492] text-[#07100e]"
                            : "border-white/20 bg-black/35 text-white hover:border-[#00D492]/70 hover:bg-black/65 hover:text-[#00D492]"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${wishlist.includes(laptop.id) ? "fill-current" : ""}`}
                        />
                      </button>
                      <img
                        src={laptop.images[0]}
                        alt={laptop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-2">
                        <span>{laptop.brand}</span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {laptop.rating} (
                          {laptop.reviewCount})
                        </span>
                      </div>
                      <h3
                        onClick={() => {
                          setSelectedProduct(laptop);
                          setCurrentView("product-detail");
                        }}
                        className="font-bold text-sm leading-snug line-clamp-2 hover:underline cursor-pointer min-h-[2.5rem] text-white"
                      >
                        {laptop.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-neutral-900 mt-2">
                    <div className="my-3 text-lg font-bold font-mono text-white">
                      {formatVND(laptop.discountPrice || laptop.price)}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(laptop);
                          setCurrentView("product-detail");
                        }}
                        className="border border-neutral-800 hover:border-white py-2 rounded text-xs font-semibold text-neutral-300"
                      >
                        Chi Tiết
                      </button>
                      <button
                        onClick={() => addToCartCustom(laptop, "32GB", "1TB SSD", "Space Black", "#1D1D1F", 1)}
                        className="bg-[#00D492] text-black py-2 rounded text-xs font-bold hover:bg-[#00bc82]"
                      >
                        Thêm Giỏ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ── VIEW: PRODUCT DETAIL ── */}
      {currentView === "product-detail" && selectedProduct && (
        <main className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-8">
            <button onClick={() => setCurrentView("store")} className="hover:underline">
              Trang chủ
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold truncate">{selectedProduct.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Product Gallery & Overview */}
            <div className="lg:col-span-6 space-y-6">
              <div className="aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center p-6 relative group">
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 bg-black/60 border border-[#00D492]/40 text-[#00D492] text-[10px] font-mono font-bold px-3 py-1 rounded-full backdrop-blur-md">
                  CHÍNH HÃNG NGUYÊN SEAL
                </span>
              </div>

              {/* Specifications Overview Cards */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-400">
                  Thông số kỹ thuật chi tiết
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
                    <span className="text-neutral-500 block text-[10px] uppercase">Bộ xử lý (CPU)</span>
                    <span className="font-semibold text-neutral-200 block truncate">{selectedProduct.cpu}</span>
                  </div>
                  <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
                    <span className="text-neutral-500 block text-[10px] uppercase">Đồ họa (GPU)</span>
                    <span className="font-semibold text-neutral-200 block truncate">{selectedProduct.gpu}</span>
                  </div>
                  <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
                    <span className="text-neutral-500 block text-[10px] uppercase">Màn hình</span>
                    <span className="font-semibold text-neutral-200 block truncate">{selectedProduct.display}</span>
                  </div>
                  <div className="p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl space-y-1">
                    <span className="text-neutral-500 block text-[10px] uppercase">Tình trạng kho</span>
                    <span className="font-semibold text-[#00D492] block">Sẵn hàng ({selectedProduct.stockQuantity} máy)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Variant & Quantity Selector */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <span className="inline-block px-3 py-1 bg-neutral-900 border border-[#00D492]/30 text-[#00D492] text-xs font-mono font-bold rounded-md mb-3">
                  {selectedProduct.brand} • {selectedProduct.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {selectedProduct.name}
                </h1>
                <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" /> {selectedProduct.rating}
                  </div>
                  <span>•</span>
                  <span>{selectedProduct.reviewCount} Đánh giá từ khách hàng</span>
                  <span>•</span>
                  <span className="text-[#00D492] font-mono">Bảo hành 24 Tháng</span>
                </div>
              </div>

              {/* Dynamic Price Display */}
              <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-neutral-500 uppercase block mb-1">
                    Giá chính thức (Đã có VAT)
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black font-mono text-[#00D492]">
                      {formatVND(
                        computeVariantPrice(
                          selectedProduct.discountPrice || selectedProduct.price,
                          selectedRam,
                          selectedStorage
                        )
                      )}
                    </span>
                    {selectedProduct.discountPrice && (
                      <span className="text-sm font-mono text-neutral-500 line-through">
                        {formatVND(
                          computeVariantPrice(selectedProduct.price, selectedRam, selectedStorage)
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <span className="self-start sm:self-center text-[10px] font-bold uppercase tracking-widest text-[#00D492] bg-[#00D492]/10 border border-[#00D492]/30 px-3 py-1.5 rounded-full">
                  Miễn phí giao hàng toàn quốc
                </span>
              </div>

              {/* Variant Selectors */}
              <div className="space-y-6 border-t border-neutral-900 pt-6">
                {/* RAM Selection */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      1. Chọn Bộ Nhớ RAM:
                    </label>
                    <span className="text-xs font-mono text-[#00D492] font-bold">{selectedRam}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["16GB", "32GB", "64GB"] as const).map((ram) => (
                      <button
                        key={ram}
                        onClick={() => setSelectedRam(ram)}
                        className={`py-3 px-4 rounded-xl font-mono text-xs font-bold border transition-all ${
                          selectedRam === ram
                            ? "border-[#00D492] bg-[#00D492]/10 text-[#00D492] shadow-[0_0_15px_rgba(0,212,146,0.15)]"
                            : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white"
                        }`}
                      >
                        {ram}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Storage Selection */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      2. Chọn Ổ Cứng (SSD):
                    </label>
                    <span className="text-xs font-mono text-[#00D492] font-bold">{selectedStorage}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["512GB SSD", "1TB SSD", "2TB SSD"] as const).map((storage) => (
                      <button
                        key={storage}
                        onClick={() => setSelectedStorage(storage)}
                        className={`py-3 px-4 rounded-xl font-mono text-xs font-bold border transition-all ${
                          selectedStorage === storage
                            ? "border-[#00D492] bg-[#00D492]/10 text-[#00D492] shadow-[0_0_15px_rgba(0,212,146,0.15)]"
                            : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white"
                        }`}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Swatches */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      3. Chọn Màu Sắc Vỏ Máy:
                    </label>
                    <span className="text-xs font-mono text-[#00D492] font-bold">{selectedColor.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {[
                      { name: "Space Black", hex: "#1D1D1F" },
                      { name: "Silver", hex: "#E3E4E5" },
                      { name: "Midnight Green", hex: "#1B2824" },
                    ].map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setSelectedColor(col)}
                        className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          selectedColor.name === col.name
                            ? "border-[#00D492] bg-[#00D492]/10 text-white"
                            : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                        {selectedColor.name === col.name && (
                          <Check className="w-3.5 h-3.5 text-[#00D492] ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity Stepper & Add to Cart Action */}
              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-neutral-800 bg-neutral-950 rounded-xl p-1">
                    <button
                      onClick={() => setProductQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white font-bold transition"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono font-bold text-sm text-white">
                      {productQuantity}
                    </span>
                    <button
                      onClick={() => setProductQuantity((q) => q + 1)}
                      className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white font-bold transition"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      addToCartCustom(
                        selectedProduct,
                        selectedRam,
                        selectedStorage,
                        selectedColor.name,
                        selectedColor.hex,
                        productQuantity
                      );
                    }}
                    className="flex-1 bg-[#00D492] text-black py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Thêm Vào Giỏ Hàng</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCartCustom(
                      selectedProduct,
                      selectedRam,
                      selectedStorage,
                      selectedColor.name,
                      selectedColor.hex,
                      productQuantity
                    );
                    setCurrentView("checkout");
                  }}
                  className="w-full bg-white text-black py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-neutral-200 transition"
                >
                  Mua Ngay Với Cấu Hình Này
                </button>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <section className="mt-16 pt-12 border-t border-neutral-900 max-w-4xl">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-[#00D492]" />
              <span>ĐÁNH GIÁ TỪ NGƯỜI DÙNG ({selectedProduct.reviews.length})</span>
            </h2>

            <form
              onSubmit={handleAddReview}
              className="mb-10 p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-4"
            >
              <h3 className="text-sm font-bold text-white uppercase">Viết Đánh Giá Của Bạn</h3>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Đánh giá số sao:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= newRating ? "fill-amber-400 text-amber-400" : "text-neutral-700"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                required
                rows={3}
                placeholder="Chia sẻ trải nghiệm sử dụng mẫu Laptop này..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#00D492]"
              ></textarea>

              <button
                type="submit"
                className="bg-[#00D492] text-black px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#00bc82]"
              >
                <Send className="w-3.5 h-3.5" /> Gửi Đánh Giá
              </button>
            </form>

            <div className="space-y-6">
              {selectedProduct.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.avatar}
                        alt={rev.reviewerName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold text-xs text-white block">
                          {rev.reviewerName}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {rev.createdAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ── VIEW: CART PAGE (/cart) ── */}
      {currentView === "cart" && (
        <main className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-6 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#00D492]">
                GIỎ HÀNG LADUX ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                SẢN PHẨM ĐÃ CHỌN
              </h1>
            </div>
            <button
              onClick={() => setCurrentView("store")}
              className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00D492] transition"
            >
              ← Tiếp tục xem sản phẩm
            </button>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="py-20 text-center space-y-6 max-w-md mx-auto">
              <div className="w-24 h-24 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-600">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Giỏ hàng của bạn đang trống</h2>
                <p className="text-xs text-neutral-400">
                  Chưa có sản phẩm Laptop cao cấp nào được chọn. Hãy khám phá ngay các siêu phẩm tại LADUX!
                </p>
              </div>
              <button
                onClick={() => setCurrentView("store")}
                className="bg-[#00D492] text-black font-extrabold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20"
              >
                Khám phá Laptop ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Item List */}
              <div className="lg:col-span-8 space-y-4">
                {cartItems.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.selectedRam}-${item.selectedStorage}-${item.selectedColorName}-${idx}`}
                    className="p-5 bg-neutral-950 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-6 transition hover:border-neutral-800"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-24 h-24 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shrink-0 p-2 flex items-center justify-center">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#00D492] font-bold uppercase">
                          {item.product.brand}
                        </span>
                        <h3
                          onClick={() => {
                            setSelectedProduct(item.product);
                            setCurrentView("product-detail");
                          }}
                          className="font-bold text-sm text-white line-clamp-1 hover:underline cursor-pointer"
                        >
                          {item.product.name}
                        </h3>
                        <p className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                          <span>
                            {item.selectedRam} / {item.selectedStorage}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/20"
                              style={{ backgroundColor: item.selectedColorHex }}
                            />
                            {item.selectedColorName}
                          </span>
                        </p>
                        <p className="text-sm font-mono font-bold text-[#00D492] pt-1">
                          {formatVND(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-neutral-900 pt-4 sm:pt-0">
                      {/* CartQuantityRequest Stepper */}
                      <div className="flex items-center border border-neutral-800 bg-neutral-900 rounded-xl p-1">
                        <button
                          onClick={() => updateCartQuantity(idx, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white font-bold transition"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-mono font-bold text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white font-bold transition"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right font-mono text-sm font-bold text-white min-w-[100px]">
                        {formatVND(item.price * item.quantity)}
                      </div>

                      <button
                        onClick={() => updateCartQuantity(idx, 0)}
                        aria-label="Xóa sản phẩm"
                        className="p-2.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-6">
                  <h2 className="text-lg font-black text-white uppercase tracking-wider pb-4 border-b border-neutral-900">
                    TỔNG ĐƠN HÀNG
                  </h2>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Tạm tính ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} máy):</span>
                      <span className="text-white font-semibold">
                        {formatVND(cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0))}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-400">
                      <span>Phí vận chuyển bảo hiểm:</span>
                      <span className="text-[#00D492] font-semibold">MIỄN PHÍ</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-[#00D492]">
                        <span>Giảm giá ({appliedCoupon.code}):</span>
                        <span className="font-semibold">
                          -{formatVND(appliedCoupon.discountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-neutral-900 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white uppercase">Tổng thanh toán:</span>
                      <span className="text-2xl font-black text-[#00D492]">
                        {formatVND(
                          Math.max(
                            0,
                            cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0) -
                              (appliedCoupon?.discountAmount || 0)
                          )
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView("checkout")}
                    className="w-full bg-[#00D492] text-black py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20 flex items-center justify-center gap-2"
                  >
                    <span>TIẾN HÀNH THANH TOÁN</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="pt-2 text-[10px] text-neutral-500 font-mono space-y-2">
                    <p className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00D492]" />
                      Cam kết bảo mật thông tin thanh toán 100%
                    </p>
                    <p className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#00D492]" />
                      Giao hàng hỏa tốc trong 2h tại Hà Nội & TP.HCM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ── VIEW: CHECKOUT PAGE (/checkout) ── */}
      {currentView === "checkout" && (
        <main className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-6 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#00D492]">
                XÁC NHẬN ĐƠN HÀNG LADUX
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                THANH TOÁN AN TOÀN
              </h1>
            </div>
            <button
              onClick={() => setCurrentView("cart")}
              className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00D492] transition"
            >
              ← Trở lại giỏ hàng
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Shipping Address, Coupons, Payment Method */}
            <div className="lg:col-span-7 space-y-8">
              {/* 1. Shipping Address Selector (ShippingAddressRequest) */}
              <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00D492]" />
                    <span>1. ĐỊA CHỈ NHẬN HÀNG</span>
                  </h2>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="text-xs font-bold text-[#00D492] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm địa chỉ mới
                  </button>
                </div>

                <div className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between gap-4 ${
                        selectedAddressId === addr.id
                          ? "border-[#00D492] bg-[#00D492]/10"
                          : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{addr.fullName}</span>
                          <span className="font-mono text-neutral-400">({addr.phone})</span>
                          {addr.isDefault && (
                            <span className="bg-[#00D492]/20 border border-[#00D492]/40 text-[#00D492] text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-300">
                          {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.city}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          selectedAddressId === addr.id
                            ? "border-[#00D492] bg-[#00D492]"
                            : "border-neutral-700"
                        }`}
                      >
                        {selectedAddressId === addr.id && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Address Modal */}
              {showAddressModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4">
                    <h3 className="text-base font-bold text-white">Thêm Địa Chỉ Giao Hàng Mới</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-neutral-400 mb-1">Họ và tên người nhận</label>
                        <input
                          type="text"
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00D492]"
                          placeholder="Lê Huy"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 mb-1">Số điện thoại</label>
                        <input
                          type="text"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#00D492]"
                          placeholder="0988 123 456"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 mb-1">Địa chỉ chi tiết (Số nhà, đường)</label>
                        <input
                          type="text"
                          value={newAddress.addressDetail}
                          onChange={(e) => setNewAddress({ ...newAddress, addressDetail: e.target.value })}
                          className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00D492]"
                          placeholder="Số 88 Tôn Thất Thuyết"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-neutral-400 mb-1">Phường / Xã</label>
                          <input
                            type="text"
                            value={newAddress.ward}
                            onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00D492]"
                            placeholder="Mỹ Đình 2"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-400 mb-1">Quận / Huyện</label>
                          <input
                            type="text"
                            value={newAddress.district}
                            onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#00D492]"
                            placeholder="Nam Từ Liêm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowAddressModal(false)}
                        className="flex-1 py-3 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          if (!newAddress.fullName || !newAddress.phone || !newAddress.addressDetail) {
                            showToast("Vui lòng điền đầy đủ thông tin địa chỉ");
                            return;
                          }
                          const created: ShippingAddressRequest = {
                            id: Date.now(),
                            ...newAddress,
                          };
                          setSavedAddresses([...savedAddresses, created]);
                          setSelectedAddressId(created.id);
                          setShowAddressModal(false);
                          showToast("Đã thêm địa chỉ mới thành công!");
                        }}
                        className="flex-1 py-3 bg-[#00D492] text-black rounded-xl text-xs font-extrabold hover:bg-[#00bc82]"
                      >
                        Lưu Địa Chỉ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Coupon Code Input (CouponApplyRequest) */}
              <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-4">
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00D492]" />
                  <span>2. MÃ GIẢM GIÁ / COUPON</span>
                </h2>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Nhập mã (Gợi ý: LADUX2M hoặc WELCOME10)"
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-[#00D492] text-black px-6 py-3 rounded-xl text-xs font-extrabold uppercase hover:bg-[#00bc82] transition shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>

                {couponError && (
                  <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {couponError}
                  </p>
                )}

                {appliedCoupon && (
                  <div className="p-3 bg-[#00D492]/10 border border-[#00D492]/30 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#00D492]">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-neutral-400 text-[11px]">{appliedCoupon.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponInput("");
                        showToast("Đã hủy mã giảm giá.");
                      }}
                      className="text-neutral-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Payment Method Selection */}
              <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-4">
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00D492]" />
                  <span>3. PHƯƠNG THỨC THANH TOÁN</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* VNPay Option */}
                  <div
                    onClick={() => setPaymentMethod("VNPAY")}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      paymentMethod === "VNPAY"
                        ? "border-[#00D492] bg-[#00D492]/10"
                        : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-900/30 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-xs">
                        VNPay
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">Cổng VNPay</span>
                        <span className="text-[10px] text-neutral-400">Thẻ ATM / QR Code / E-Wallet</span>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === "VNPAY" ? "border-[#00D492] bg-[#00D492]" : "border-neutral-700"
                      }`}
                    >
                      {paymentMethod === "VNPAY" && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </div>

                  {/* COD Option */}
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      paymentMethod === "COD"
                        ? "border-[#00D492] bg-[#00D492]/10"
                        : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center font-bold text-[#00D492] text-xs">
                        COD
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">Thanh toán khi nhận</span>
                        <span className="text-[10px] text-neutral-400">Tiền mặt / Kiểm tra máy trước</span>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === "COD" ? "border-[#00D492] bg-[#00D492]" : "border-neutral-700"
                      }`}
                    >
                      {paymentMethod === "COD" && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order Action */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-6 sticky top-24">
                <h2 className="text-base font-black text-white uppercase tracking-wider pb-4 border-b border-neutral-900">
                  TỔNG QUAN ĐƠN HÀNG
                </h2>

                {/* Itemized List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 text-xs border-b border-neutral-900/60 pb-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 bg-neutral-900 rounded-lg object-contain p-1 border border-neutral-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{item.product.name}</p>
                          <p className="text-[10px] font-mono text-neutral-500">
                            {item.selectedRam} / {item.selectedStorage} x {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white shrink-0">
                        {formatVND(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="space-y-2.5 font-mono text-xs pt-2 border-t border-neutral-900">
                  <div className="flex justify-between text-neutral-400">
                    <span>Tạm tính (subTotal):</span>
                    <span className="text-white font-semibold">
                      {formatVND(cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0))}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span>Giảm giá (discountAmount):</span>
                    <span className="text-[#00D492] font-semibold">
                      -{formatVND(appliedCoupon?.discountAmount || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span>Phí vận chuyển (shippingFee):</span>
                    <span className="text-[#00D492] font-semibold">MIỄN PHÍ</span>
                  </div>

                  <div className="pt-4 border-t border-neutral-900 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white uppercase">Tổng cộng (finalAmount):</span>
                    <span className="text-2xl font-black text-[#00D492]">
                      {formatVND(
                        Math.max(
                          0,
                          cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0) -
                            (appliedCoupon?.discountAmount || 0)
                        )
                      )}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  onClick={() => {
                    const selAddr = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];
                    const sub = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
                    const disc = appliedCoupon?.discountAmount || 0;
                    const finalAmt = Math.max(0, sub - disc);

                    const newOrderRecord: OrderItemRecord = {
                      id: `ord-${Date.now()}`,
                      orderNumber: `LDX-${Math.floor(100000 + Math.random() * 900000)}`,
                      date: "Vừa xong",
                      items: [...cartItems],
                      shippingAddress: selAddr,
                      paymentMethod,
                      subTotal: sub,
                      discountAmount: disc,
                      shippingFee: 0,
                      finalAmount: finalAmt,
                      status: paymentMethod === "VNPAY" ? "PENDING" : "CONFIRMED",
                      trackingNumber: `LDX-EXPRESS-${Math.floor(10000000 + Math.random() * 90000000)}`,
                    };

                    setOrders([newOrderRecord, ...orders]);
                    setSelectedAddressOrderId(newOrderRecord.id);
                    setCartItems([]);
                    setCurrentView("account");
                    showToast(`Đặt hàng thành công! Mã đơn: ${newOrderRecord.orderNumber}`);
                  }}
                  className="w-full bg-[#00D492] text-black py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>ĐẶT HÀNG NGAY</span>
                </button>

                <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-neutral-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#00D492]" /> Thanh toán SSL 256-bit
                  </span>
                  <span>•</span>
                  <span>Đổi trả 30 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── VIEW: ORDERS / ORDER DETAIL PAGE (/orders/:id) ── */}
      {currentView === "orders" && (
        <main className="container mx-auto px-6 py-12 max-w-5xl">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-6 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#00D492]">
                LADUX CUSTOMER PORTAL
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                QUẢN LÝ & THEO DÕI ĐƠN HÀNG
              </h1>
            </div>
            <button
              onClick={() => setCurrentView("account")}
              className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00D492] transition"
            >
              ← Về tài khoản
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Orders List Navigation */}
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Danh sách đơn hàng ({orders.length})
              </h2>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setSelectedAddressOrderId(ord.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                    selectedOrderId === ord.id
                      ? "border-[#00D492] bg-[#00D492]/10"
                      : "border-neutral-900 bg-neutral-950 hover:border-neutral-800"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#00D492]">{ord.orderNumber}</span>
                    <span className="text-[10px] text-neutral-500">{ord.date}</span>
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-1">
                    {ord.items[0]?.product.name}
                    {ord.items.length > 1 && ` (+${ord.items.length - 1} khác)`}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="font-mono text-neutral-300 font-semibold">
                      {formatVND(ord.finalAmount)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        ord.status === "DELIVERED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : ord.status === "SHIPPED"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : ord.status === "CANCELLED"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {ord.status === "PENDING"
                        ? "Chờ thanh toán"
                        : ord.status === "CONFIRMED"
                        ? "Đã xác nhận"
                        : ord.status === "SHIPPED"
                        ? "Đang giao"
                        : ord.status === "DELIVERED"
                        ? "Đã giao hàng"
                        : "Đã hủy"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Detail Content */}
            <div className="lg:col-span-8">
              {(() => {
                const currentOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];
                if (!currentOrder) {
                  return (
                    <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-2xl text-center text-neutral-500 text-xs">
                      Không tìm thấy thông tin đơn hàng.
                    </div>
                  );
                }

                const statusSteps: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
                const currentStepIdx =
                  currentOrder.status === "CANCELLED"
                    ? -1
                    : statusSteps.indexOf(currentOrder.status as any);

                return (
                  <div className="p-6 sm:p-8 bg-neutral-950 rounded-2xl border border-neutral-900 space-y-8">
                    {/* Header Metadata */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-900">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                          MÃ ĐƠN HÀNG CHI TIẾT
                        </span>
                        <h2 className="text-2xl font-black font-mono text-[#00D492]">
                          #{currentOrder.orderNumber}
                        </h2>
                        <p className="text-xs text-neutral-400 mt-1">
                          Khởi tạo lúc: {currentOrder.date} · Cổng thanh toán:{" "}
                          <span className="font-bold text-white">{currentOrder.paymentMethod}</span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                          MÃ VẬN ĐƠN (TRACKING)
                        </span>
                        <span className="text-xs font-mono font-bold text-white bg-neutral-900 border border-neutral-800 px-3 py-1 rounded inline-block mt-1">
                          {currentOrder.trackingNumber}
                        </span>
                      </div>
                    </div>

                    {/* Order Status Stepper */}
                    {currentOrder.status === "CANCELLED" ? (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Đơn hàng này đã bị hủy theo yêu cầu.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                          Trạng Thái Tiến Độ Đơn Hàng
                        </h3>
                        <div className="grid grid-cols-4 gap-2 relative pt-2">
                          {[
                            { code: "PENDING", label: "Chờ thanh toán" },
                            { code: "CONFIRMED", label: "Đã xác nhận" },
                            { code: "SHIPPED", label: "Đang giao" },
                            { code: "DELIVERED", label: "Đã giao hàng" },
                          ].map((st, i) => {
                            const isDone = i <= currentStepIdx;
                            const isCurrent = i === currentStepIdx;
                            return (
                              <div key={st.code} className="flex flex-col items-center text-center space-y-2">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all ${
                                    isDone
                                      ? "bg-[#00D492] text-black shadow-[0_0_15px_rgba(0,212,146,0.3)]"
                                      : "bg-neutral-900 border border-neutral-800 text-neutral-600"
                                  }`}
                                >
                                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : i + 1}
                                </div>
                                <span
                                  className={`text-[10px] sm:text-xs font-semibold leading-tight ${
                                    isCurrent
                                      ? "text-[#00D492] font-bold"
                                      : isDone
                                      ? "text-white"
                                      : "text-neutral-600"
                                  }`}
                                >
                                  {st.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        Sản phẩm trong đơn ({currentOrder.items.length})
                      </h3>
                      <div className="space-y-3">
                        {currentOrder.items.map((it, i) => (
                          <div
                            key={i}
                            className="p-4 bg-neutral-900/60 border border-neutral-900 rounded-xl flex items-center justify-between gap-4 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={it.product.images[0]}
                                alt={it.product.name}
                                className="w-14 h-14 bg-neutral-950 rounded-lg object-contain p-1 border border-neutral-800 shrink-0"
                              />
                              <div>
                                <h4 className="font-bold text-white">{it.product.name}</h4>
                                <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                                  {it.selectedRam} / {it.selectedStorage} · Màu: {it.selectedColorName}
                                </p>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="font-bold text-white block">
                                {formatVND(it.price * it.quantity)}
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                {formatVND(it.price)} x {it.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Financial Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-900 text-xs">
                      {/* Shipping Info */}
                      <div className="p-4 bg-neutral-900/40 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                          NƠI NHẬN HÀNG
                        </span>
                        <p className="font-bold text-white">{currentOrder.shippingAddress.fullName}</p>
                        <p className="font-mono text-neutral-400">{currentOrder.shippingAddress.phone}</p>
                        <p className="text-neutral-300 leading-relaxed">
                          {currentOrder.shippingAddress.addressDetail},{" "}
                          {currentOrder.shippingAddress.ward},{" "}
                          {currentOrder.shippingAddress.district},{" "}
                          {currentOrder.shippingAddress.city}
                        </p>
                      </div>

                      {/* Payment Summary */}
                      <div className="p-4 bg-neutral-900/40 rounded-xl space-y-2 font-mono">
                        <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                          TỔNG KẾT THANH TOÁN
                        </span>
                        <div className="flex justify-between text-neutral-400">
                          <span>Tạm tính:</span>
                          <span className="text-white">{formatVND(currentOrder.subTotal)}</span>
                        </div>
                        <div className="flex justify-between text-[#00D492]">
                          <span>Giảm giá:</span>
                          <span>-{formatVND(currentOrder.discountAmount)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Phí vận chuyển:</span>
                          <span className="text-[#00D492]">MIỄN PHÍ</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                          <span>Tổng cộng:</span>
                          <span className="text-[#00D492]">
                            {formatVND(currentOrder.finalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-neutral-900">
                      {/* Retry Payment Button */}
                      {currentOrder.status === "PENDING" && currentOrder.paymentMethod === "VNPAY" && (
                        <button
                          onClick={() => {
                            showToast(`Chuyển hướng đến cổng VNPay để thanh toán ${formatVND(currentOrder.finalAmount)}...`);
                            setTimeout(() => {
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === currentOrder.id ? { ...o, status: "CONFIRMED" } : o
                                )
                              );
                              showToast("Thanh toán VNPay thành công! Đơn hàng đã được xác nhận.");
                            }, 1500);
                          }}
                          className="bg-[#00D492] text-black px-6 py-3 rounded-xl text-xs font-extrabold uppercase hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20 flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Thanh toán lại VNPay</span>
                        </button>
                      )}

                      {/* Cancel Order Button */}
                      {(currentOrder.status === "PENDING" || currentOrder.status === "CONFIRMED") && (
                        <button
                          onClick={() => {
                            setOrders((prev) =>
                              prev.map((o) =>
                                o.id === currentOrder.id ? { ...o, status: "CANCELLED" } : o
                              )
                            );
                            showToast(`Đã hủy đơn hàng #${currentOrder.orderNumber}`);
                          }}
                          className="border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-6 py-3 rounded-xl text-xs font-bold uppercase transition"
                        >
                          Hủy đơn hàng
                        </button>
                      )}

                      <button
                        onClick={() => {
                          showToast("Đang tải hóa đơn VAT điện tử (PDF)...");
                        }}
                        className="border border-neutral-800 hover:border-white text-neutral-300 px-6 py-3 rounded-xl text-xs font-semibold transition flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Tải Hóa Đơn VAT</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </main>
      )}

      {/* ── VIEW: WISHLIST PAGE (/wishlist) ── */}
      {currentView === "wishlist" && (
        <main className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-6 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#00D492]">
                LADUX FAVORITES ({wishlist.length})
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                DANH SÁCH LAPTOP YÊU THÍCH
              </h1>
            </div>
            <button
              onClick={() => setCurrentView("store")}
              className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#00D492] transition"
            >
              ← Trở lại cửa hàng
            </button>
          </div>

          {wishlist.length === 0 ? (
            <div className="py-20 text-center space-y-6 max-w-md mx-auto">
              <div className="w-24 h-24 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-600">
                <Heart className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Chưa có sản phẩm yêu thích</h2>
                <p className="text-xs text-neutral-400">
                  Hãy nhấn vào biểu tượng trái tim ở các sản phẩm Laptop cao cấp để lưu lại danh sách quan tâm của bạn.
                </p>
              </div>
              <button
                onClick={() => setCurrentView("store")}
                className="bg-[#00D492] text-black font-extrabold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20"
              >
                Khám phá Laptop ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PRODUCTS.filter((p) => wishlist.includes(p.id)).map((laptop) => (
                <div
                  key={laptop.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.035] shadow-[0_18px_60px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-1 hover:border-[#00D492]/60 hover:shadow-[0_22px_80px_rgba(0,212,146,0.12)] flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent to-transparent pointer-events-none" />
                      <button
                        onClick={() => toggleWishlist(laptop.id)}
                        aria-label="Xóa khỏi yêu thích"
                        className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#00D492]/60 bg-[#00D492] text-[#07100e] backdrop-blur-md transition-all duration-300 hover:scale-110"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                      <img
                        src={laptop.images[0]}
                        alt={laptop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-2">
                        <span>{laptop.brand}</span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {laptop.rating} (
                          {laptop.reviewCount})
                        </span>
                      </div>
                      <h3
                        onClick={() => {
                          setSelectedProduct(laptop);
                          setCurrentView("product-detail");
                        }}
                        className="font-bold text-sm leading-snug line-clamp-2 hover:underline cursor-pointer min-h-[2.5rem] text-white"
                      >
                        {laptop.name}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                        {laptop.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-neutral-900 mt-2">
                    <div className="my-3 text-lg font-bold font-mono text-[#00D492]">
                      {formatVND(laptop.discountPrice || laptop.price)}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(laptop);
                          setCurrentView("product-detail");
                        }}
                        className="border border-neutral-800 hover:border-white py-2.5 rounded-xl text-xs font-semibold text-neutral-300 transition"
                      >
                        Chi Tiết
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(laptop);
                          setCurrentView("product-detail");
                        }}
                        className="bg-[#00D492] text-black py-2.5 rounded-xl text-xs font-bold hover:bg-[#00bc82] transition"
                      >
                        Chọn Cấu Hình
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ── VIEW: ABOUT ── */}
      {currentView === "about" && (
        <main className="container mx-auto px-6 py-16 max-w-4xl space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-mono text-[#00D492] uppercase tracking-widest">
              ABOUT LADUX STORE
            </span>
            <h1 className="text-4xl sm:text-5xl font-black">
              HỆ THỐNG PHÂN PHỐI LAPTOP CAO CẤP
            </h1>
            <p className="text-neutral-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Ladux được thành lập với sứ mệnh định hình lại thị trường Laptop tại Việt Nam — tập
              trung chuyên biệt 100% vào các dòng Laptop cao cấp nhất thế giới.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-3">
              <Award className="w-8 h-8 text-[#00D492]" />
              <h3 className="font-bold text-sm text-white">Chính Hãng 100%</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Cam kết chỉ bán sản phẩm Laptop chính hãng nguyên seal nhập khẩu chính ngạch.
              </p>
            </div>
            <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-3">
              <Users className="w-8 h-8 text-[#00D492]" />
              <h3 className="font-bold text-sm text-white">Chuyên Gia Tư Vấn</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Đội ngũ kỹ thuật viên giàu kinh nghiệm trực tiếp hỗ trợ cài đặt AI & cân màu màn
                hình.
              </p>
            </div>
            <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-3">
              <ShieldCheck className="w-8 h-8 text-[#00D492]" />
              <h3 className="font-bold text-sm text-white">Bảo Hành Vượt Trội</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Bảo hành độc quyền 24 tháng, hỗ trợ máy thay thế trong thời gian bảo hành.
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ── VIEW: CONTACT ── */}
      {currentView === "contact" && (
        <main className="container mx-auto px-6 py-16 max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-mono text-[#00D492] uppercase tracking-widest">
              CONTACT US
            </span>
            <h1 className="text-4xl font-black">LIÊN HỆ VỚI LADUX</h1>
            <p className="text-neutral-400 text-sm">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 về các giải pháp Laptop cao cấp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Đã gửi tin nhắn liên hệ!");
              }}
              className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-4"
            >
              <h3 className="font-bold text-sm text-white uppercase mb-4">
                Gửi Tin Nhắn Cho Chúng Tôi
              </h3>
              <div>
                <label className="block text-neutral-400 text-xs mb-1">Họ & Tên</label>
                <input
                  required
                  className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-xs mb-1">Email / Số Điện Thoại</label>
                <input
                  required
                  className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-xs mb-1">Nội Dung</label>
                <textarea
                  rows={4}
                  required
                  className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-[#00D492] text-black py-3 rounded text-xs font-extrabold uppercase"
              >
                Gửi Yêu Cầu
              </button>
            </form>

            <div className="space-y-6 text-xs">
              <div className="flex items-start gap-4 p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
                <MapPin className="w-5 h-5 text-[#00D492] shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-1">Showroom Chính</h4>
                  <p className="text-neutral-400">
                    Số 88 Tôn Thất Thuyết, Phường Mỹ Đình 2, Quận Nam Từ Liêm, Hà Nội.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
                <Phone className="w-5 h-5 text-[#00D492] shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-1">Hotline Hỗ Trợ Khách Hàng</h4>
                  <p className="text-neutral-400 font-mono">1900 888 999 (24/7)</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
                <Mail className="w-5 h-5 text-[#00D492] shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-1">Email Liên Hệ & B2B</h4>
                  <p className="text-neutral-400 font-mono">contact@ladux.vn / b2b@ladux.vn</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── VIEW: ACCOUNT ── */}
      {currentView === "account" && (
        <main className="container mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#00D492]">
                Khu vực thành viên · 01
              </p>
              <h1 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
                Tài khoản của bạn
              </h1>
            </div>
            <button
              onClick={() => setCurrentView("store")}
              className="text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 transition hover:text-[#00D492]"
            >
              ← Quay lại cửa hàng
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.88fr_1.7fr]">
            <aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <div className="mb-7 flex items-center gap-4 border-b border-white/10 pb-6">
                <div className="relative group">
                  <img
                    src={userAvatar}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover border-2 border-[#00D492] shadow-[0_0_15px_rgba(0,212,146,0.3)]"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-[10px] font-bold uppercase tracking-wider"
                  >
                    Đổi
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setUserAvatar(url);
                        showToast("Đã cập nhật ảnh đại diện thành công!");
                      }
                    }}
                  />
                </div>
                <div>
                  <p className="font-bold text-white text-base">Lê Huy</p>
                  <p className="mt-0.5 font-mono text-[10px] text-neutral-400">LADUX / GOLD MEMBER</p>
                  <label
                    htmlFor="avatar-upload"
                    className="inline-block mt-1 text-[11px] font-bold text-[#00D492] hover:underline cursor-pointer"
                  >
                    Tải lên ảnh mới
                  </label>
                </div>
              </div>

              <nav className="space-y-1 text-sm">
                <button className="flex w-full items-center justify-between rounded-xl bg-[#00D492] px-4 py-3 font-bold text-[#07100e]">
                  <span>Tổng quan</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentView("orders")}
                  className="w-full rounded-xl px-4 py-3 text-left text-neutral-400 transition hover:bg-white/[0.06] hover:text-white flex items-center justify-between"
                >
                  <span>Đơn hàng của tôi</span>
                  <span className="font-mono text-xs text-[#00D492] font-bold">{orders.length}</span>
                </button>
                <button
                  onClick={() => setCurrentView("addresses")}
                  className="w-full rounded-xl px-4 py-3 text-left text-neutral-400 transition hover:bg-white/[0.06] hover:text-white flex items-center justify-between"
                >
                  <span>Địa chỉ giao hàng</span>
                  <span className="font-mono text-xs text-[#00D492] font-bold">{savedAddresses.length}</span>
                </button>
                <button
                  onClick={() => setCurrentView("wishlist")}
                  className="w-full rounded-xl px-4 py-3 text-left text-neutral-400 transition hover:bg-white/[0.06] hover:text-white flex items-center justify-between"
                >
                  <span>Danh sách yêu thích</span>
                  <span className="font-mono text-xs text-[#00D492] font-bold">{wishlist.length}</span>
                </button>
              </nav>

              {/* Logout Button */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </aside>

            <section className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-[linear-gradient(118deg,rgba(0,212,146,0.13),rgba(255,255,255,0.035)_44%,rgba(103,76,174,0.14))] p-6 sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D492]">
                  Điểm thành viên
                </p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="text-5xl font-black tracking-[-0.045em] text-white">2.480</p>
                    <p className="mt-2 text-sm text-neutral-400">
                      Chỉ còn 520 điểm để lên hạng Ruby.
                    </p>
                  </div>
                  <Award className="h-12 w-12 text-[#00D492]" />
                </div>
                <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-black/35">
                  <div className="h-full w-[72%] rounded-full bg-[#00D492]" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Đơn hàng gần đây</h2>
                  <button
                    onClick={() => showToast("Danh sách đơn hàng đang được đồng bộ")}
                    className="text-xs font-bold text-[#00D492] hover:underline"
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs text-[#00D492]">#LDX-081926</p>
                    <p className="mt-1 text-sm font-semibold text-white">ASUS ROG Zenbook Duo</p>
                    <p className="mt-1 text-xs text-neutral-500">22.08.2026 · 54.990.000 ₫</p>
                  </div>
                  <span className="w-fit rounded-full border border-[#00D492]/30 bg-[#00D492]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#00D492]">
                    Đang giao
                  </span>
                </div>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* ── VIEW: SHIPPING ADDRESS MANAGEMENT (/account/addresses) ── */}
      {currentView === "addresses" && (
        <main className="container mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:py-16">
          {/* Breadcrumb / Header */}
          <div className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                <button onClick={() => setCurrentView("account")} className="hover:text-[#00D492] transition-colors">
                  Tài khoản
                </button>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#00D492]">Địa chỉ giao hàng</span>
              </div>
              <h1 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
                Sổ địa chỉ
              </h1>
              <p className="mt-2 text-xs text-neutral-500 font-mono">
                Địa chỉ giao hàng của bạn ({savedAddresses.length} địa chỉ đã lưu)
              </p>
            </div>
            <button
              onClick={openAddAddr}
              className="flex items-center gap-2 rounded-xl bg-[#00D492] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-[#00bc82] hover:scale-[1.02] active:scale-100 shadow-lg shadow-[#00D492]/20 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Thêm địa chỉ mới
            </button>
          </div>

          {/* Empty State */}
          {savedAddresses.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center space-y-7 max-w-sm mx-auto">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-neutral-950 border border-neutral-900 flex items-center justify-center">
                  <Home className="w-12 h-12 text-neutral-700 stroke-[1.3]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-neutral-950 border border-neutral-900 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#00D492]" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Chưa có địa chỉ nào</h2>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Bạn chưa có địa chỉ giao hàng nào được lưu. Thêm địa chỉ đầu tiên để thanh toán nhanh hơn.
                </p>
              </div>
              <button
                onClick={openAddAddr}
                className="flex items-center gap-2 rounded-xl bg-[#00D492] px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black hover:bg-[#00bc82] transition shadow-lg shadow-[#00D492]/20"
              >
                <Plus className="w-4 h-4" />
                Thêm địa chỉ đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`group relative rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                    addr.isDefault
                      ? "border-[#00D492]/50 bg-[#00D492]/[0.05] shadow-[0_0_30px_rgba(0,212,146,0.07)]"
                      : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Address Info */}
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Icon */}
                      <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border ${addr.isDefault ? "bg-[#00D492]/15 border-[#00D492]/30" : "bg-neutral-900 border-neutral-800"}`}>
                        {addr.fullName.toLowerCase().includes("văn phòng") || addr.fullName.toLowerCase().includes("office") || addr.fullName.toLowerCase().includes("cơ quan")
                          ? <Building2 className={`w-5 h-5 ${addr.isDefault ? "text-[#00D492]" : "text-neutral-500"}`} />
                          : <Home className={`w-5 h-5 ${addr.isDefault ? "text-[#00D492]" : "text-neutral-500"}`} />
                        }
                      </div>

                      <div className="min-w-0 space-y-1.5">
                        {/* Name + Phone + Badge */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-bold text-white text-base leading-tight">{addr.fullName}</span>
                          <span className="font-mono text-xs text-neutral-400">{addr.phone}</span>
                          {addr.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#00D492]/20 border border-[#00D492]/40 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#00D492]">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              Mặc định
                            </span>
                          )}
                        </div>
                        {/* Full Address */}
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.city}
                        </p>
                        {/* Set Default Button */}
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddr(addr.id)}
                            className="text-[11px] font-bold text-neutral-500 hover:text-[#00D492] transition-colors underline-offset-2 hover:underline"
                          >
                            Thiết lập làm mặc định
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 sm:self-start">
                      <button
                        onClick={() => openEditAddr(addr)}
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-[11px] font-bold text-neutral-300 transition hover:border-white/25 hover:text-white"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Chỉnh sửa
                      </button>

                      {deleteConfirmId === addr.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => deleteAddr(addr.id)}
                            className="rounded-xl bg-red-500/20 border border-red-500/40 px-3 py-2.5 text-[11px] font-extrabold text-red-400 hover:bg-red-500/30 transition"
                          >
                            Xác nhận xóa
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-xl border border-white/10 px-2.5 py-2.5 text-neutral-500 hover:text-white transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(addr.id)}
                          disabled={addr.isDefault}
                          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[11px] font-bold transition ${
                            addr.isDefault
                              ? "border-neutral-900 text-neutral-700 cursor-not-allowed"
                              : "border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
                          }`}
                          title={addr.isDefault ? "Không thể xóa địa chỉ mặc định" : "Xóa địa chỉ này"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* API Endpoint Note (dev reference only, hidden visually) */}
          {/* GET /api/v1/user-addresses/user · POST /api/v1/user-addresses · PUT /api/v1/user-addresses/{id} · DELETE /api/v1/user-addresses/{id} */}
        </main>
      )}

      {/* ── MODAL: ADD / EDIT ADDRESS (UserAddressRequest) ── */}
      {showAddrFormModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => { if (!addrSaving) setShowAddrFormModal(false); }}
          />

          {/* Modal Panel */}
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0f10] shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D492]">
                  {editingAddrId !== null ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                </p>
                <h2 className="mt-0.5 text-lg font-black text-white tracking-tight">
                  {editingAddrId !== null ? "Cập nhật thông tin địa chỉ" : "Địa chỉ giao hàng mới"}
                </h2>
              </div>
              <button
                onClick={() => { if (!addrSaving) setShowAddrFormModal(false); }}
                className="rounded-xl border border-white/10 p-2.5 text-neutral-400 hover:text-white hover:border-white/25 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* receiverName */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                  Họ và tên người nhận <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={addrForm.fullName}
                  onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/20 transition"
                />
              </div>

              {/* phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                  Số điện thoại nhận hàng <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={addrForm.phone}
                  onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                  placeholder="0988 123 456"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/20 transition"
                />
                <p className="mt-1 text-[10px] text-neutral-600 font-mono">Định dạng: 09x, 08x, 07x, 03x…</p>
              </div>

              {/* street (addressDetail) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                  Địa chỉ nhà / Tên đường <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={addrForm.addressDetail}
                  onChange={(e) => setAddrForm({ ...addrForm, addressDetail: e.target.value })}
                  placeholder="Số 88 Tôn Thất Thuyết"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/20 transition"
                />
              </div>

              {/* ward + district */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Phường / Xã <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={addrForm.ward}
                    onChange={(e) => setAddrForm({ ...addrForm, ward: e.target.value })}
                    placeholder="Phường Mỹ Đình 2"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Quận / Huyện <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={addrForm.district}
                    onChange={(e) => setAddrForm({ ...addrForm, district: e.target.value })}
                    placeholder="Quận Nam Từ Liêm"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/20 transition"
                  />
                </div>
              </div>

              {/* city */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                  Tỉnh / Thành phố <span className="text-red-400">*</span>
                </label>
                <select
                  value={addrForm.city}
                  onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D492]/60 focus:ring-1 focus:ring-[#00D492]/20 transition appearance-none"
                >
                  {["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"].map(city => (
                    <option key={city} value={city} className="bg-neutral-900">{city}</option>
                  ))}
                </select>
              </div>

              {/* isDefault toggle */}
              <div
                onClick={() => setAddrForm({ ...addrForm, isDefault: !addrForm.isDefault })}
                className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                  addrForm.isDefault
                    ? "border-[#00D492]/50 bg-[#00D492]/[0.07]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                {/* Toggle Switch */}
                <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${addrForm.isDefault ? "bg-[#00D492]" : "bg-neutral-800"}`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${addrForm.isDefault ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Đặt làm địa chỉ giao hàng mặc định</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Địa chỉ này sẽ được tự động chọn khi thanh toán</p>
                </div>
              </div>
            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="flex items-center gap-3 border-t border-white/[0.08] px-6 py-5">
              <button
                onClick={() => { if (!addrSaving) setShowAddrFormModal(false); }}
                disabled={addrSaving}
                className="flex-1 rounded-xl border border-white/10 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400 transition hover:border-white/25 hover:text-white disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={saveAddrForm}
                disabled={addrSaving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#00D492] py-3.5 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-[#00bc82] disabled:opacity-70 shadow-lg shadow-[#00D492]/20"
              >
                {addrSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Lưu địa chỉ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-20 border-t border-neutral-900 bg-black text-neutral-500 text-xs py-12">
        <div className="container mx-auto px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-white">
            <img
              src={laduxLogoImg}
              alt="LADUX Logo"
              className="h-10 w-auto object-contain rounded-[10px] opacity-90 hover:opacity-100 transition-opacity"
            />
            <span className="text-xl font-black tracking-widest text-white">LADUX</span>
          </div>
          <p>© 2026 LADUX. PREMIUM LAPTOP ONLY STORE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}

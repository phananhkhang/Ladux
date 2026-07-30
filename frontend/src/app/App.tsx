import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import {
    useAuthStore,
    useCartStore,
    useWishlistStore,
    useProductStore,
    useNotificationStore,
    useAddressStore,
    useUIStore,
    useOrderStore,
} from "../stores";
import {
    LaptopProduct,
    CouponItem,
    PaymentProvider,
    ReviewItem,
    ViewType,
    mapProductResponseToLaptopProduct,
} from "../types";
import { couponService } from "../services";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import ProductStoreView from "../pages/ProductStoreView";
import AllProductsView from "../pages/AllProductsView";
import ProductDetailView from "../pages/ProductDetailView";
import CartView from "../pages/CartView";
import CheckoutView from "../pages/CheckoutView";
import OrdersView from "../pages/OrdersView";
import WishlistView from "../pages/WishlistView";
import AccountView from "../pages/AccountView";
import LoginView from "../pages/LoginView";
import RegisterView from "../pages/RegisterView";
import AboutView from "../pages/AboutView";
import ContactView from "../pages/ContactView";
import laduxLogoImg from "../assets/ladux-logo.png";

export default function App() {
    useEffect(() => {
        console.log("App mounted");

        auth.fetchCurrentUser();

        console.log("Fetch Products");

        productStore.fetchProducts();

        productStore.fetchBrands();

        productStore.fetchCategories();
    }, []);
    // --- Zustand Stores Integration ---
    const auth = useAuthStore();
    const cart = useCartStore();
    const wishlistStore = useWishlistStore();
    const productStore = useProductStore();
    const notificationStore = useNotificationStore();
    const addressStore = useAddressStore();
    const uiStore = useUIStore();
    const orderStore = useOrderStore();

    // 1. Tự động kiểm tra phiên đăng nhập khi vừa mount & nạp dữ liệu sản phẩm
    useEffect(() => {
        auth.fetchCurrentUser();
        productStore.fetchProducts();
        productStore.fetchBrands();
        productStore.fetchCategories();
    }, []);

    // 2. Nếu người dùng đã đăng nhập, tự động tải ngầm toàn bộ dữ liệu cá nhân về Stores
    useEffect(() => {
        if (auth.isLoggedIn) {
            cart.fetchCart();
            wishlistStore.fetchWishlist();
            notificationStore.fetchNotifications();
            addressStore.fetchAddresses();
            orderStore.fetchOrders();
        }
    }, [auth.isLoggedIn]);

    // 3. Lắng nghe themeMode từ useUIStore để toggle class 'dark' trên html
    useEffect(() => {
        if (uiStore.theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [uiStore.theme]);

    const [currentView, setCurrentView] = useState<ViewType>("store");

    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedBrand, setSelectedBrand] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [priceRange, setPriceRange] = useState<number>(150000000);

    const [selectedProduct, setSelectedProduct] = useState<LaptopProduct | null>(null);

    // User Avatar state
    const [userAvatar, setUserAvatar] = useState<string>(
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&auto=format"
    );

    const [selectedAddressId, setSelectedAddressId] = useState<number>(1);
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
    const [couponError, setCouponError] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>("VNPAY");
    const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
    const [selectedOrderId, setSelectedAddressOrderId] = useState<string>("");

    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");

    const showToast = (msg: string) => {
        setNotificationMsg(msg);
        setTimeout(() => setNotificationMsg(null), 3000);
    };

    const handleLogin = () => {
        setCurrentView("account");
        showToast("Đăng nhập thành công! Chào mừng bạn.");
    };

    const handleRegister = () => {
        setCurrentView("account");
        showToast("Tạo tài khoản thành công! Chào mừng thành viên mới.");
    };

    const handleLogout = () => {
        auth.logout();
        setCurrentView("store");
        showToast("Bạn đã đăng xuất thành công.");
    };

    const addToCartCustom = (
        product: LaptopProduct,
        ram: string,
        storage: string,
        colorName: string,
        colorHex: string,
        quantity: number
    ) => {
        cart.addToCart({ productId: product.id, quantity });
        showToast(`Đã thêm ${quantity} máy ${product.name} vào giỏ hàng API!`);
    };

    const activeWishlist = wishlistStore.wishlistProductIds;

    const toggleWishlist = async (productId: number) => {
        try {
            await wishlistStore.toggleWishlist(productId);
            const isLiked = wishlistStore.isInWishlist(productId);
            showToast(isLiked ? "Đã thêm vào danh sách yêu thích!" : "Đã xóa khỏi danh sách yêu thích.");
        } catch {
            showToast("Lỗi khi cập nhật danh sách yêu thích.");
        }
    };

    const handleApplyCoupon = async () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) {
            setCouponError("Vui lòng nhập mã coupon.");
            return;
        }

        const subtotal = cart.totalAmount || 0;

        try {
            const res = await couponService.applyCoupon(code);
            if (res) {
                const minSub = Number(res.minOrderValue || 0);
                if (subtotal < minSub) {
                    setCouponError(
                        `Đơn hàng cần đạt tối thiểu ${minSub.toLocaleString("vi-VN")}đ để áp dụng mã này.`
                    );
                    return;
                }

                const discount =
                    res.discountType === "PERCENT"
                        ? (subtotal * Number(res.discountValue || 0)) / 100
                        : Number(res.discountValue || 0);

                setAppliedCoupon({
                    code: res.code,
                    discountAmount: discount,
                    minSubtotal: minSub,
                    description:
                        res.discountType === "PERCENT"
                            ? `Giảm ${res.discountValue}%`
                            : `Giảm giá mã ${res.code}`,
                });
                setCouponError("");
                showToast(`Áp dụng mã ${res.code} thành công!`);
                return;
            }
        } catch {
            setCouponError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        }
    };

    const handleAddReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedProduct) return;

        const newReview: ReviewItem = {
            id: Date.now(),
            reviewerName: auth.user?.fullName || auth.user?.username || "Khách hàng LADUX",
            rating: newRating,
            comment: newComment,
            createdAt: "Vừa xong",
            avatar: auth.user?.avatar || userAvatar,
        };

        const updatedProduct = {
            ...selectedProduct,
            reviews: [newReview, ...selectedProduct.reviews],
            reviewCount: selectedProduct.reviewCount + 1,
        };

        setSelectedProduct(updatedProduct);
        setNewComment("");
        setNewRating(5);
        showToast("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
    };

    // Chuyển đổi dữ liệu LaptopProduct từ backend store
    const allDisplayProducts: LaptopProduct[] = productStore.products.map((p) =>
        mapProductResponseToLaptopProduct(p)
    );

    // Cập nhật selectedProduct mặc định nếu chưa chọn
    useEffect(() => {
        if (!selectedProduct && allDisplayProducts.length > 0) {
            setSelectedProduct(allDisplayProducts[0]);
        }
    }, [allDisplayProducts, selectedProduct]);

    // Products filter logic
    const filteredProducts = allDisplayProducts.filter((laptop) => {
        if (!laptop) return false;
        const laptopBrand = laptop.brand || "";
        const laptopCat = laptop.category || "";
        const laptopName = laptop.name || "";
        const laptopCpu = laptop.cpu || "";

        const matchesBrand = selectedBrand === "All" || laptopBrand.toLowerCase() === selectedBrand.toLowerCase();
        const matchesCategory = selectedCategory === "All" || laptopCat.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch =
            searchQuery === "" ||
            laptopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            laptopBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            laptopCpu.toLowerCase().includes(searchQuery.toLowerCase());
        const currentPrice = laptop.discountPrice || laptop.price || 0;
        const matchesPrice = currentPrice <= priceRange;

        return matchesBrand && matchesCategory && matchesSearch && matchesPrice;
    });

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
                <header className="border-b border-white/10 bg-[#080a0b]/65 backdrop-blur-xl">
                    <div className="container mx-auto px-6 h-[64px] flex items-center">
                        <button onClick={() => setCurrentView("store")} className="flex items-center gap-3">
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
                    onLoginSuccess={() => {
                        setCurrentView("account");
                        showToast("Đăng nhập thành công! Phiên làm việc đã được khôi phục.");
                    }}
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
                        <button onClick={() => setCurrentView("store")} className="flex items-center gap-3">
                            <img
                                src={laduxLogoImg}
                                alt="LADUX Logo"
                                className="h-9 w-auto object-contain rounded-[10px]"
                            />
                            <span className="text-xl font-black tracking-widest text-white">LADUX</span>
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

    return (
        <div className="dark min-h-screen overflow-x-hidden bg-[#080a0b] text-white font-sans selection:bg-[#00D492] selection:text-[#07100e]">
            {/* Background Ambient Glow */}
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_78%_8%,rgba(0,212,146,0.12),transparent_24%),radial-gradient(circle_at_14%_56%,rgba(93,77,155,0.1),transparent_28%)]" />

            {/* Notification Toast */}
            {notificationMsg && (
                <div className="fixed bottom-6 right-6 z-50 bg-white text-black px-5 py-3 rounded-md shadow-2xl text-sm font-medium flex items-center gap-3 border border-neutral-200 animate-in fade-in slide-in-from-bottom-5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{notificationMsg}</span>
                </div>
            )}

            {/* Header Component */}
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                currentView={currentView}
                setCurrentView={setCurrentView}
                wishlistCount={wishlistStore.wishlistProductIds.length}
                cartCount={cart.totalItems}
                isLoggedIn={auth.isLoggedIn}
                userAvatar={auth.user?.avatar || userAvatar}
                userName={auth.user?.fullName || auth.user?.username}
            />

            {/* Views Router */}
            {currentView === "store" && (
                <ProductStoreView
                    filteredProducts={filteredProducts}
                    allProducts={allDisplayProducts}
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    setSearchQuery={setSearchQuery}
                    wishlist={activeWishlist}
                    toggleWishlist={toggleWishlist}
                    setSelectedProduct={setSelectedProduct}
                    setCurrentView={setCurrentView}
                    addToCartCustom={addToCartCustom}
                    showToast={showToast}
                />
            )}

            {currentView === "all-products" && (
                <AllProductsView
                    allProducts={allDisplayProducts}
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    wishlist={activeWishlist}
                    toggleWishlist={toggleWishlist}
                    setSelectedProduct={setSelectedProduct}
                    setCurrentView={setCurrentView}
                    addToCartCustom={addToCartCustom}
                />
            )}

            {currentView === "product-detail" && selectedProduct && (
                <ProductDetailView
                    selectedProduct={selectedProduct}
                    setCurrentView={setCurrentView}
                    addToCartCustom={addToCartCustom}
                    handleAddReview={handleAddReview}
                    newRating={newRating}
                    setNewRating={setNewRating}
                    newComment={newComment}
                    setNewComment={setNewComment}
                />
            )}

            {currentView === "cart" && (
                <CartView
                    setCurrentView={setCurrentView}
                    setSelectedProduct={setSelectedProduct}
                />
            )}

            {currentView === "checkout" && (
                <CheckoutView
                    setCurrentView={setCurrentView}
                    showToast={showToast}
                />
            )}

            {currentView === "orders" && (
                <OrdersView
                    selectedOrderId={selectedOrderId}
                    setSelectedAddressOrderId={setSelectedAddressOrderId}
                    setCurrentView={setCurrentView}
                    showToast={showToast}
                />
            )}

            {currentView === "wishlist" && (
                <WishlistView
                    wishlist={activeWishlist}
                    toggleWishlist={toggleWishlist}
                    products={allDisplayProducts}
                    setCurrentView={setCurrentView}
                    setSelectedProduct={setSelectedProduct}
                />
            )}

            {(currentView === "account" || currentView === "addresses") && (
                <AccountView
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    userAvatar={auth.user?.avatar || userAvatar}
                    setUserAvatar={setUserAvatar}
                    userFullName={auth.user?.fullName || auth.user?.username || "Thành viên LADUX"}
                    wishlistCount={activeWishlist.length}
                    handleLogout={handleLogout}
                    showToast={showToast}
                />
            )}

            {currentView === "about" && <AboutView />}

            {currentView === "contact" && <ContactView showToast={showToast} />}

            {/* Footer Component */}
            <Footer />
        </div>
    );
}

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
} from "../stores";
import {
    LaptopProduct,
    CartItem,
    CouponItem,
    OrderItemRecord,
    ShippingAddressRequest,
    PaymentProvider,
    ReviewItem,
    ViewType,
} from "../types";
import { MOCK_PRODUCTS } from "../data/mockProducts";
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
    // --- Zustand Stores Integration ---
    const auth = useAuthStore();
    const cart = useCartStore();
    const wishlistStore = useWishlistStore();
    const productStore = useProductStore();
    const notificationStore = useNotificationStore();
    const addressStore = useAddressStore();
    const uiStore = useUIStore();

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

    const [selectedProduct, setSelectedProduct] = useState<LaptopProduct | null>(MOCK_PRODUCTS[0]);

    // User Avatar state
    const [userAvatar, setUserAvatar] = useState<string>(
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&auto=format"
    );

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

    // Wishlist state
    const [wishlist, setWishlist] = useState<number[]>([1, 2]);

    // Shipping Address State
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
    ]);

    const [selectedAddressId, setSelectedAddressId] = useState<number>(1);

    // Coupon state
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
    const [couponError, setCouponError] = useState("");

    // Payment method state
    const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>("VNPAY");

    // Notification toast state
    const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

    // Orders Management State
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
        auth.setAccessToken("demo-token");
        setCurrentView("account");
        showToast("Đăng nhập thành công! Chào mừng bạn.");
    };

    const handleRegister = () => {
        auth.setAccessToken("demo-token");
        setCurrentView("account");
        showToast("Tạo tài khoản thành công! Chào mừng thành viên mới.");
    };

    const handleLogout = () => {
        auth.logout();
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
        quantity: number
    ) => {
        const itemPrice = computeVariantPrice(product.discountPrice || product.price, ram, storage);
        const existingIdx = cartItems.findIndex(
            (i) =>
                i.product.id === product.id &&
                i.selectedRam === ram &&
                i.selectedStorage === storage &&
                i.selectedColorName === colorName
        );

        if (existingIdx > -1) {
            const updated = [...cartItems];
            updated[existingIdx].quantity += quantity;
            setCartItems(updated);
        } else {
            setCartItems([
                ...cartItems,
                {
                    product,
                    quantity,
                    selectedRam: ram,
                    selectedStorage: storage,
                    selectedColorName: colorName,
                    selectedColorHex: colorHex,
                    price: itemPrice,
                },
            ]);
        }
        showToast(`Đã thêm ${quantity} máy ${product.name} (${ram}/${storage}) vào giỏ!`);
    };

    const updateCartQuantity = (index: number, newQty: number) => {
        if (newQty <= 0) {
            setCartItems(cartItems.filter((_, i) => i !== index));
            showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
        } else {
            const updated = [...cartItems];
            updated[index].quantity = newQty;
            setCartItems(updated);
        }
    };

    const toggleWishlist = (productId: number) => {
        if (wishlist.includes(productId)) {
            setWishlist(wishlist.filter((id) => id !== productId));
            showToast("Đã xóa khỏi danh sách yêu thích.");
        } else {
            setWishlist([...wishlist, productId]);
            showToast("Đã thêm vào danh sách yêu thích!");
        }
    };

    const handleApplyCoupon = () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) {
            setCouponError("Vui lòng nhập mã coupon.");
            return;
        }

        const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

        if (code === "LADUX2M") {
            if (subtotal < 30000000) {
                setCouponError("Mã LADUX2M chỉ áp dụng cho đơn hàng từ 30.000.000 ₫");
                return;
            }
            setAppliedCoupon({
                code: "LADUX2M",
                discountAmount: 2000000,
                minSubtotal: 30000000,
                description: "Giảm 2.000.000 ₫ trực tiếp cho đơn hàng cao cấp",
            });
            setCouponError("");
            showToast("Áp dụng mã LADUX2M thành công (-2.000.000 ₫)!");
        } else if (code === "WELCOME10") {
            const disc = Math.round(subtotal * 0.05);
            setAppliedCoupon({
                code: "WELCOME10",
                discountAmount: disc,
                minSubtotal: 0,
                description: "Giảm 5% cho thành viên mới",
            });
            setCouponError("");
            showToast(`Áp dụng mã WELCOME10 thành công!`);
        } else {
            setCouponError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        }
    };

    const handleAddReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedProduct) return;

        const newReview: ReviewItem = {
            id: Date.now(),
            reviewerName: "Lê Huy",
            rating: newRating,
            comment: newComment,
            createdAt: "Vừa xong",
            avatar: userAvatar,
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

    // Products filter logic
    const filteredProducts = MOCK_PRODUCTS.filter((laptop) => {
        const matchesBrand = selectedBrand === "All" || laptop.brand === selectedBrand;
        const matchesCategory = selectedCategory === "All" || laptop.category === selectedCategory;
        const matchesSearch =
            searchQuery === "" ||
            laptop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            laptop.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            laptop.cpu.toLowerCase().includes(searchQuery.toLowerCase());
        const currentPrice = laptop.discountPrice || laptop.price;
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
                wishlistCount={wishlistStore.wishlistProductIds.length || wishlist.length}
                cartCount={cart.totalItems || cartItems.reduce((s, i) => s + i.quantity, 0)}
                isLoggedIn={auth.isLoggedIn}
                userAvatar={auth.user?.avatar || userAvatar}
                userName={auth.user?.fullName || auth.user?.username}
            />

            {/* Views Router */}
            {currentView === "store" && (
                <ProductStoreView
                    filteredProducts={filteredProducts}
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    setSearchQuery={setSearchQuery}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                    setSelectedProduct={setSelectedProduct}
                    setCurrentView={setCurrentView}
                    addToCartCustom={addToCartCustom}
                    showToast={showToast}
                />
            )}

            {currentView === "all-products" && (
                <AllProductsView
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    wishlist={wishlist}
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
                    cartItems={cartItems}
                    updateCartQuantity={updateCartQuantity}
                    appliedCoupon={appliedCoupon}
                    setCurrentView={setCurrentView}
                    setSelectedProduct={setSelectedProduct}
                />
            )}

            {currentView === "checkout" && (
                <CheckoutView
                    cartItems={cartItems}
                    savedAddresses={savedAddresses}
                    setSavedAddresses={setSavedAddresses}
                    selectedAddressId={selectedAddressId}
                    setSelectedAddressId={setSelectedAddressId}
                    appliedCoupon={appliedCoupon}
                    setAppliedCoupon={setAppliedCoupon}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    orders={orders}
                    setOrders={setOrders}
                    setSelectedAddressOrderId={setSelectedAddressOrderId}
                    setCartItems={setCartItems}
                    setCurrentView={setCurrentView}
                    showToast={showToast}
                    handleApplyCoupon={handleApplyCoupon}
                    couponInput={couponInput}
                    setCouponInput={setCouponInput}
                    couponError={couponError}
                />
            )}

            {currentView === "orders" && (
                <OrdersView
                    orders={orders}
                    selectedOrderId={selectedOrderId}
                    setSelectedAddressOrderId={setSelectedAddressOrderId}
                    setOrders={setOrders}
                    setCurrentView={setCurrentView}
                    showToast={showToast}
                />
            )}

            {currentView === "wishlist" && (
                <WishlistView
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                    products={MOCK_PRODUCTS}
                    setCurrentView={setCurrentView}
                    setSelectedProduct={setSelectedProduct}
                />
            )}

            {(currentView === "account" || currentView === "addresses") && (
                <AccountView
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    userAvatar={userAvatar}
                    setUserAvatar={setUserAvatar}
                    userFullName="Lê Huy"
                    orders={orders}
                    savedAddresses={savedAddresses}
                    setSavedAddresses={setSavedAddresses}
                    wishlistCount={wishlist.length}
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

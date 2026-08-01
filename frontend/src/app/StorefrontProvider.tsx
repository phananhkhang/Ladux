import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type Dispatch,
    type FormEvent,
    type ReactNode,
    type SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useCartStore, useProductStore, useUIStore, useWishlistStore } from "../stores";
import {
    type LaptopProduct,
    type ReviewItem,
    mapProductResponseToLaptopProduct,
} from "../types";
import { ROUTES } from "./routePaths";

interface StorefrontContextValue {
    allDisplayProducts: LaptopProduct[];
    isCatalogReady: boolean;
    catalogError: string | null;
    selectedProduct: LaptopProduct | null;
    setSelectedProduct: Dispatch<SetStateAction<LaptopProduct | null>>;
    selectedCategory: string;
    setSelectedCategory: Dispatch<SetStateAction<string>>;
    selectedBrand: string;
    setSelectedBrand: Dispatch<SetStateAction<string>>;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    priceRange: number;
    setPriceRange: Dispatch<SetStateAction<number>>;
    selectedOrderId: string;
    setSelectedOrderId: Dispatch<SetStateAction<string>>;
    userAvatar: string;
    setUserAvatar: Dispatch<SetStateAction<string>>;
    displayAvatar: string;
    userName?: string;
    isLoggedIn: boolean;
    wishlistProductIds: number[];
    wishlistCount: number;
    cartCount: number;
    notificationMsg: string | null;
    newRating: number;
    setNewRating: Dispatch<SetStateAction<number>>;
    newComment: string;
    setNewComment: Dispatch<SetStateAction<string>>;
    showToast: (message: string) => void;
    handleRegister: () => void;
    handleLogout: () => void;
    toggleWishlist: (productId: number) => Promise<void>;
    addToCartCustom: (
        product: LaptopProduct,
        ram: string,
        storage: string,
        colorName: string,
        colorHex: string,
        quantity: number
    ) => Promise<void>;
    handleAddReview: (event: FormEvent) => void;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function useStorefront(): StorefrontContextValue {
    const context = useContext(StorefrontContext);
    if (!context) {
        throw new Error("useStorefront must be used within StorefrontProvider");
    }
    return context;
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
    const logout = useAuthStore((state) => state.logout);

    const products = useProductStore((state) => state.products);
    const catalogError = useProductStore((state) => state.error);
    const fetchProducts = useProductStore((state) => state.fetchProducts);
    const fetchBrands = useProductStore((state) => state.fetchBrands);
    const fetchCategories = useProductStore((state) => state.fetchCategories);

    const addToCart = useCartStore((state) => state.addToCart);
    const fetchCart = useCartStore((state) => state.fetchCart);
    const cartCount = useCartStore((state) => state.totalItems);

    const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);
    const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
    const toggleWishlistInStore = useWishlistStore((state) => state.toggleWishlist);
    const isInWishlist = useWishlistStore((state) => state.isInWishlist);

    const theme = useUIStore((state) => state.theme);

    const [isCatalogReady, setIsCatalogReady] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<LaptopProduct | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedBrand, setSelectedBrand] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [priceRange, setPriceRange] = useState(150000000);
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [userAvatar, setUserAvatar] = useState(
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&auto=format"
    );
    const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        void fetchCurrentUser();
        Promise.allSettled([fetchProducts(), fetchBrands(), fetchCategories()]).finally(() => {
            setIsCatalogReady(true);
        });
    }, [fetchBrands, fetchCategories, fetchCurrentUser, fetchProducts]);

    useEffect(() => {
        if (!isLoggedIn) return;
        void Promise.allSettled([fetchCart(), fetchWishlist()]);
    }, [fetchCart, fetchWishlist, isLoggedIn]);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    useEffect(() => {
        return () => {
            if (toastTimer.current) clearTimeout(toastTimer.current);
        };
    }, []);

    const allDisplayProducts = useMemo(
        () => products.map((product) => mapProductResponseToLaptopProduct(product)),
        [products]
    );

    const showToast = useCallback((message: string) => {
        setNotificationMsg(message);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setNotificationMsg(null), 3000);
    }, []);

    const handleRegister = useCallback(() => {
        navigate(ROUTES.account);
        showToast("Tạo tài khoản thành công! Chào mừng thành viên mới.");
    }, [navigate, showToast]);

    const handleLogout = useCallback(() => {
        void logout();
        navigate(ROUTES.home);
        showToast("Bạn đã đăng xuất thành công.");
    }, [logout, navigate, showToast]);

    const addToCartCustom = useCallback(
        async (product: LaptopProduct, _ram: string, _storage: string, _colorName: string, _colorHex: string, quantity: number) => {
            const rawProduct = products.find((item) => item.id === product.id);
            const variant = rawProduct?.variants?.find((item) => item.isActive) ?? rawProduct?.variants?.[0];

            try {
                await addToCart({ productId: variant?.id ?? product.id, quantity });
                showToast(`Đã thêm ${quantity} máy ${product.name} vào giỏ hàng!`);
            } catch {
                showToast("Không thể thêm sản phẩm vào giỏ hàng.");
            }
        },
        [addToCart, products, showToast]
    );

    const toggleWishlist = useCallback(
        async (productId: number) => {
            try {
                await toggleWishlistInStore(productId);
                showToast(
                    isInWishlist(productId)
                        ? "Đã thêm vào danh sách yêu thích!"
                        : "Đã xóa khỏi danh sách yêu thích."
                );
            } catch {
                showToast("Lỗi khi cập nhật danh sách yêu thích.");
            }
        },
        [isInWishlist, showToast, toggleWishlistInStore]
    );

    const handleAddReview = useCallback(
        (event: FormEvent) => {
            event.preventDefault();
            if (!newComment.trim() || !selectedProduct) return;

            const newReview: ReviewItem = {
                id: Date.now(),
                reviewerName: user?.fullName || user?.username || "Khách hàng LADUX",
                rating: newRating,
                comment: newComment,
                createdAt: "Vừa xong",
                avatar: user?.avatar || userAvatar,
            };

            setSelectedProduct({
                ...selectedProduct,
                reviews: [newReview, ...selectedProduct.reviews],
                reviewCount: selectedProduct.reviewCount + 1,
            });
            setNewComment("");
            setNewRating(5);
            showToast("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
        },
        [newComment, newRating, selectedProduct, showToast, user, userAvatar]
    );

    const value = useMemo<StorefrontContextValue>(
        () => ({
            allDisplayProducts,
            isCatalogReady,
            catalogError,
            selectedProduct,
            setSelectedProduct,
            selectedCategory,
            setSelectedCategory,
            selectedBrand,
            setSelectedBrand,
            searchQuery,
            setSearchQuery,
            priceRange,
            setPriceRange,
            selectedOrderId,
            setSelectedOrderId,
            userAvatar,
            setUserAvatar,
            displayAvatar: user?.avatar || userAvatar,
            userName: user?.fullName || user?.username,
            isLoggedIn,
            wishlistProductIds,
            wishlistCount: wishlistProductIds.length,
            cartCount,
            notificationMsg,
            newRating,
            setNewRating,
            newComment,
            setNewComment,
            showToast,
            handleRegister,
            handleLogout,
            toggleWishlist,
            addToCartCustom,
            handleAddReview,
        }),
        [
            addToCartCustom,
            allDisplayProducts,
            cartCount,
            catalogError,
            handleAddReview,
            handleLogout,
            handleRegister,
            isCatalogReady,
            isLoggedIn,
            newComment,
            newRating,
            notificationMsg,
            priceRange,
            searchQuery,
            selectedBrand,
            selectedCategory,
            selectedOrderId,
            selectedProduct,
            showToast,
            toggleWishlist,
            user,
            userAvatar,
            wishlistProductIds,
        ]
    );

    return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

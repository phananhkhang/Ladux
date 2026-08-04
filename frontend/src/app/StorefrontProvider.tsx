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
import { useLocation, useNavigate } from "react-router-dom";
import { useAddressStore, useAuthStore, useCartStore, useNotificationStore, useOrderStore, useProductStore, useUIStore, useWishlistStore } from "../stores";
import { reviewService } from "../services";
import {
    type LaptopProduct,
    type ReviewItem,
    getAvatarUrl,
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
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    selectedOrderId: string;
    setSelectedOrderId: Dispatch<SetStateAction<string>>;
    userAvatar: string;
    setUserAvatar: Dispatch<SetStateAction<string>>;
    displayAvatar: string;
    userName?: string;
    isLoggedIn: boolean;
    isAuthReady: boolean;
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
        variantId: number,
        quantity: number
    ) => Promise<boolean>;
    handleAddReview: (event: FormEvent) => Promise<void>;
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
    const location = useLocation();

    const user = useAuthStore((state) => state.user);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
    const logout = useAuthStore((state) => state.logout);
    const clearSession = useAuthStore((state) => state.clearSession);

    const products = useProductStore((state) => state.products);
    const catalogError = useProductStore((state) => state.error);
    const fetchProducts = useProductStore((state) => state.fetchProducts);
    const fetchBrands = useProductStore((state) => state.fetchBrands);
    const fetchCategories = useProductStore((state) => state.fetchCategories);

    const addToCart = useCartStore((state) => state.addToCart);
    const fetchCart = useCartStore((state) => state.fetchCart);
    const cartCount = useCartStore((state) => state.totalItems);
    const fetchOrders = useOrderStore((state) => state.fetchOrders);
    const resetOrders = useOrderStore((state) => state.reset);
    const resetCart = useCartStore((state) => state.reset);
    const resetWishlist = useWishlistStore((state) => state.reset);
    const resetAddresses = useAddressStore((state) => state.reset);
    const resetNotifications = useNotificationStore((state) => state.reset);

    const wishlistProductIds = useWishlistStore((state) => state.wishlistProductIds);
    const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
    const toggleWishlistInStore = useWishlistStore((state) => state.toggleWishlist);
    const isInWishlist = useWishlistStore((state) => state.isInWishlist);

    const theme = useUIStore((state) => state.theme);

    const [isCatalogReady, setIsCatalogReady] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<LaptopProduct | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [userAvatar, setUserAvatar] = useState("");
    const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const accountScopeRef = useRef<number | null>(null);

    useEffect(() => {
        let isMounted = true;

        fetchCurrentUser().finally(() => {
            if (isMounted) setIsAuthReady(true);
        });
        Promise.allSettled([fetchProducts(), fetchBrands(), fetchCategories()]).finally(() => {
            setIsCatalogReady(true);
        });

        return () => {
            isMounted = false;
        };
    }, [fetchBrands, fetchCategories, fetchCurrentUser, fetchProducts]);

    useEffect(() => {
        const handleAuthExpired = () => clearSession();
        window.addEventListener("ladux:auth-expired", handleAuthExpired);
        return () => window.removeEventListener("ladux:auth-expired", handleAuthExpired);
    }, [clearSession]);

    useEffect(() => {
        const nextAccountId = user?.id ?? null;
        if (accountScopeRef.current === nextAccountId) return;

        accountScopeRef.current = nextAccountId;
        resetAddresses();
        resetCart();
        resetWishlist();
        resetOrders();
        resetNotifications();
    }, [resetAddresses, resetCart, resetNotifications, resetOrders, resetWishlist, user?.id]);

    useEffect(() => {
        if (!isLoggedIn) return;
        void Promise.allSettled([fetchCart(), fetchWishlist(), fetchOrders(0, 10)]);
    }, [fetchCart, fetchOrders, fetchWishlist, isLoggedIn]);

    useEffect(() => {
        const productId = selectedProduct?.id;
        if (!productId) return;

        let isMounted = true;
        reviewService
            .getReviewsByProductId(productId, { page: 0, size: 100, sort: "createdAt,desc" })
            .then((response) => {
                if (!isMounted) return;
                const reviews: ReviewItem[] = (response.content || []).map((review) => ({
                    id: review.id,
                    reviewerName: review.reviewerName,
                    rating: review.rating,
                    comment: review.comment,
                    createdAt: review.createdAt
                        ? new Date(review.createdAt).toLocaleString("vi-VN")
                        : "",
                    avatar: getAvatarUrl(review.reviewerAvatar),
                }));
                setSelectedProduct((current) =>
                    current?.id === productId
                        ? {
                              ...current,
                              reviews,
                              reviewCount: response.totalElements,
                          }
                        : current
                );
            })
            .catch(() => {
                // Giữ dữ liệu tổng hợp từ ProductResponse nếu endpoint review tạm thời lỗi.
            });

        return () => {
            isMounted = false;
        };
    }, [selectedProduct?.id]);

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

    const requireLogin = useCallback(
        (message: string) => {
            showToast(message);
            navigate(ROUTES.login, {
                state: {
                    from: `${location.pathname}${location.search}`,
                },
            });
        },
        [location.pathname, location.search, navigate, showToast]
    );

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
        async (product: LaptopProduct, variantId: number, quantity: number) => {
            if (!isLoggedIn) {
                requireLogin("Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.");
                return false;
            }

            const rawProduct = products.find((item) => item.id === product.id);
            const variant = rawProduct?.variants?.find((item) => item.id === variantId && item.isActive);

            if (!variant) {
                showToast("Cấu hình sản phẩm không còn khả dụng.");
                return false;
            }

            if (quantity > variant.stockQuantity) {
                showToast(`Chỉ còn ${variant.stockQuantity} sản phẩm trong kho.`);
                return false;
            }

            try {
                await addToCart({ productId: variant.id, quantity });
                showToast(`Đã thêm ${quantity} máy ${product.name} vào giỏ hàng!`);
                return true;
            } catch {
                showToast("Không thể thêm sản phẩm vào giỏ hàng.");
                return false;
            }
        },
        [addToCart, isLoggedIn, products, requireLogin, showToast]
    );

    const toggleWishlist = useCallback(
        async (productId: number) => {
            if (!isLoggedIn) {
                requireLogin("Vui lòng đăng nhập trước khi thêm sản phẩm vào yêu thích.");
                return;
            }

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
        [isInWishlist, isLoggedIn, requireLogin, showToast, toggleWishlistInStore]
    );

    const handleAddReview = useCallback(
        async (event: FormEvent) => {
            event.preventDefault();
            if (!newComment.trim() || !selectedProduct) return;

            if (!isLoggedIn) {
                requireLogin("Vui lòng đăng nhập trước khi gửi đánh giá.");
                return;
            }

            try {
                const response = await reviewService.createReview({
                    productId: selectedProduct.id,
                    rating: newRating,
                    comment: newComment.trim(),
                });
                const newReview: ReviewItem = {
                    id: response.id,
                    reviewerName: response.reviewerName,
                    rating: response.rating,
                    comment: response.comment,
                    createdAt: response.createdAt
                        ? new Date(response.createdAt).toLocaleString("vi-VN")
                        : "",
                    avatar: getAvatarUrl(response.reviewerAvatar),
                };

                setSelectedProduct((current) => {
                    if (!current || current.id !== selectedProduct.id) return current;
                    const reviewCount = current.reviewCount + 1;
                    return {
                        ...current,
                        reviews: [newReview, ...current.reviews],
                        reviewCount,
                        rating: ((current.rating * current.reviewCount) + newReview.rating) / reviewCount,
                    };
                });
                setNewComment("");
                setNewRating(5);
                showToast("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
            } catch (error: any) {
                showToast(error?.response?.data?.message || "Không thể gửi đánh giá sản phẩm.");
            }
        },
        [isLoggedIn, newComment, newRating, requireLogin, selectedProduct, showToast]
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
            searchQuery,
            setSearchQuery,
            selectedOrderId,
            setSelectedOrderId,
            userAvatar,
            setUserAvatar,
            displayAvatar: getAvatarUrl(user?.avatar || userAvatar),
            userName: user?.fullName || user?.username,
            isLoggedIn,
            isAuthReady,
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
            isAuthReady,
            newComment,
            newRating,
            notificationMsg,
            searchQuery,
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

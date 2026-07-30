import { create } from 'zustand';
import { wishlistService, WishlistResponse } from '@/services';

interface WishlistState {
  wishlistItems: WishlistResponse[];
  wishlistProductIds: number[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearError: () => void;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistItems: [],
  wishlistProductIds: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await wishlistService.getWishlistsByUserId();
      const ids = items.flatMap((item) => (item.product ? [item.product.id] : []));
      set({ wishlistItems: items, wishlistProductIds: ids });
    } catch (error: any) {
      console.error('Lỗi fetch wishlist:', error);
      const message = error?.response?.data?.message || 'Không thể tải danh sách sản phẩm yêu thích!';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId) => {
    const isLiked = get().isInWishlist(productId);
    set({ error: null });
    try {
      if (isLiked) {
        // Nếu đã thích ➔ Bấm vào thì Xóa
        await wishlistService.removeItemFromWishlist(productId);
        set((state) => ({
          wishlistProductIds: state.wishlistProductIds.filter((id) => id !== productId),
          wishlistItems: state.wishlistItems.filter((item) => item.product?.id !== productId),
        }));
      } else {
        // Nếu chưa thích ➔ Bấm vào thì Thêm
        await wishlistService.addItemToWishlist(productId);
        // Fetch lại để lấy đối tượng Product đầy đủ
        await get().fetchWishlist();
      }
    } catch (error: any) {
      console.error('Lỗi toggle wishlist:', error);
      const message = error?.response?.data?.message || 'Cập nhật danh sách yêu thích thất bại!';
      set({ error: message });
      throw error;
    }
  },

  removeFromWishlist: async (productId) => {
    set({ error: null });
    try {
      await wishlistService.removeItemFromWishlist(productId);
      set((state) => ({
        wishlistProductIds: state.wishlistProductIds.filter((id) => id !== productId),
        wishlistItems: state.wishlistItems.filter((item) => item.product?.id !== productId),
      }));
    } catch (error: any) {
      console.error('Lỗi xóa wishlist item:', error);
      const message = error?.response?.data?.message || 'Xóa sản phẩm yêu thích thất bại!';
      set({ error: message });
      throw error;
    }
  },

  isInWishlist: (productId) => {
    return get().wishlistProductIds.includes(productId);
  },

  reset: () => {
    set({
      wishlistItems: [],
      wishlistProductIds: [],
      isLoading: false,
      error: null,
    });
  },
}));
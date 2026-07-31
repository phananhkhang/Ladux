import { create } from 'zustand';
import { userAddressService, UserAddressResponse, UserAddressRequest } from '@/services';

interface AddressState {
  addresses: UserAddressResponse[];
  defaultAddress: UserAddressResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAddresses: () => Promise<void>;
  fetchDefaultAddress: () => Promise<void>;
  createAddress: (data: UserAddressRequest) => Promise<UserAddressResponse>;
  updateAddress: (id: number, data: UserAddressRequest) => Promise<UserAddressResponse>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  defaultAddress: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await userAddressService.getUserAddressesByUserId();
      const def = list.find((a) => a.isDefault) || null;
      set({ addresses: list, defaultAddress: def });
    } catch (err: any) {
      console.error('Lỗi fetch user addresses:', err);
      const message = err?.response?.data?.message || 'Không thể tải danh sách địa chỉ!';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDefaultAddress: async () => {
    try {
      const list = await userAddressService.getDefaultUserAddressesByUserId();
      set({ defaultAddress: list.length > 0 ? list[0] : null });
    } catch (err) {
      console.error('Lỗi fetch default address:', err);
    }
  },

  createAddress: async (data: UserAddressRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newAddress = await userAddressService.createUserAddress(data);
      await get().fetchAddresses();
      return newAddress;
    } catch (err: any) {
      console.error('Lỗi create address:', err);
      const message = err?.response?.data?.message || 'Thêm địa chỉ mới thất bại!';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAddress: async (id: number, data: UserAddressRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await userAddressService.updateUserAddress(id, data);
      await get().fetchAddresses();
      return updated;
    } catch (err: any) {
      console.error('Lỗi update address:', err);
      const message = err?.response?.data?.message || 'Cập nhật địa chỉ thất bại!';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAddress: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await userAddressService.deleteUserAddressById(id);
      await get().fetchAddresses();
    } catch (err: any) {
      console.error('Lỗi delete address:', err);
      const message = err?.response?.data?.message || 'Xóa địa chỉ thất bại!';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  setDefaultAddress: async (id: number) => {
    const target = get().addresses.find((a) => a.id === id);
    if (!target) return;
    set({ isLoading: true, error: null });
    try {
      const reqData: UserAddressRequest = {
        receiverName: target.receiverName,
        phone: target.phone,
        street: target.street,
        ward: target.ward || '',
        district: target.district,
        city: target.city,
        isDefault: true,
      };
      await userAddressService.updateUserAddress(id, reqData);
      await get().fetchAddresses();
    } catch (err: any) {
      console.error('Lỗi set default address:', err);
      const message = err?.response?.data?.message || 'Đặt địa chỉ mặc định thất bại!';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      addresses: [],
      defaultAddress: null,
      isLoading: false,
      error: null,
    });
  },
}));

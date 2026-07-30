import apiClient from './apiClient';

export interface UserAddressResponse {
  id: number;
  userId: number | null;
  receiverName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface UserAddressRequest {
  receiverName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export const userAddressService = {
  /**
   * Lấy tất cả địa chỉ nhận hàng của người dùng đang đăng nhập
   * GET /api/v1/user-addresses/user
   */
  getUserAddressesByUserId: (): Promise<UserAddressResponse[]> => {
    return apiClient.get('/user-addresses/user');
  },

  /**
   * Lấy danh sách địa chỉ mặc định của người dùng
   * GET /api/v1/user-addresses/default
   */
  getDefaultUserAddressesByUserId: (): Promise<UserAddressResponse[]> => {
    return apiClient.get('/user-addresses/default');
  },

  /**
   * Lấy chi tiết địa chỉ theo Address ID
   * GET /api/v1/user-addresses/{addressId}
   */
  getUserAddressById: (addressId: number): Promise<UserAddressResponse> => {
    return apiClient.get(`/user-addresses/${addressId}`);
  },

  /**
   * Thêm mới địa chỉ nhận hàng
   * POST /api/v1/user-addresses
   */
  createUserAddress: (data: UserAddressRequest): Promise<UserAddressResponse> => {
    return apiClient.post('/user-addresses', data);
  },

  /**
   * Cập nhật địa chỉ nhận hàng theo Address ID
   * PUT /api/v1/user-addresses/{addressId}
   */
  updateUserAddress: (addressId: number, data: UserAddressRequest): Promise<UserAddressResponse> => {
    return apiClient.put(`/user-addresses/${addressId}`, data);
  },

  /**
   * Xóa địa chỉ nhận hàng theo Address ID
   * DELETE /api/v1/user-addresses/{addressId}
   */
  deleteUserAddressById: (addressId: number): Promise<void> => {
    return apiClient.delete(`/user-addresses/${addressId}`);
  },
};

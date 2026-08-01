import axios from 'axios';

// 1. Khởi tạo instance với Base URL lấy từ file .env
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Để gửi/nhận HttpOnly Cookie (RefreshToken)
});

// 2. REQUEST INTERCEPTOR: Chạy TRƯỚC KHI request được gửi đi
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken'); // Lấy AccessToken từ bộ nhớ
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Tự động dán Token vào Header
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR: Chạy NGAY KHI nhận được response từ Backend
apiClient.interceptors.response.use(
    (response) => response.data, // Chỉ trả về phần 'data' sạch (bỏ bớt rác HTTP Wrapper)
    async (error) => {
        const originalRequest = error.config;
        const url = originalRequest?.url || '';
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');

        // Nếu Backend trả về 401 (Hết hạn Token) và không phải API Auth (login/register/refresh)
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                // Tự động gọi API Refresh Token ngầm
                await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                // Gọi lại request ban đầu với Cookie mới
                return apiClient(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
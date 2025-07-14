import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ 자동 재발급 interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axiosInstance.post('/auth/refresh', {
                    refreshToken: localStorage.getItem('refreshToken'),
                });
                const newAccessToken = res.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshErr) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/auth';
                return Promise.reject(refreshErr);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

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

// ✅ 공통 에러 처리 + 자동 재발급
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ✅ 401 - AccessToken 만료 → 자동 재발급 시도
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

        // ✅ 그 외 에러 공통 처리
        const status = error.response?.status;
        if (status === 403) {
            alert("권한이 없습니다. 다시 로그인 해주세요.");
        } else if (status === 404) {
            alert("요청하신 페이지를 찾을 수 없습니다.");
        } else if (status >= 500) {
            alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else if (!status) {
            alert("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;

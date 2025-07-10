import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/api', // 프록시를 사용하므로 /api 만 설정
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;

import axiosInstance from './axiosInstance';

interface RegisterParams {
    name: string;
    email: string;
    password: string;
    role: 'USER' | 'INSTRUCTOR';
    levelId?: number | null;
}

// 회원가입
export const registerUser = (params: RegisterParams) => {
    return axiosInstance.post('/users/register', params);
};

// 로그인
export const loginUser = (email: string, password: string) => {
    return axiosInstance.post('/auth/login', { email, password });
};

// 레벨 목록 조회 (수강생용)
export const fetchLevels = () => {
    return axiosInstance.get('/levels');
};

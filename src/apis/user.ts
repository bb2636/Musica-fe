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
// 마이페이지 - 내 정보 조회
export const fetchMyProfile = () => {
    return axiosInstance.get('/users/mypage');
};

// 마이페이지 - 내 정보 수정
interface UpdateProfileParams {
    name: string;
    email: string;
    levelId?: number | null;
}
export const updateMyProfile = (userId: number, params: UpdateProfileParams) => {
    return axiosInstance.patch(`/users/${userId}`, params);
};

// 마이페이지 - 내 질문 목록
export const fetchMyQuestions = () => {
    return axiosInstance.get('/users/mypage/questions');
};

// 마이페이지 - 내 후기 목록
export const fetchMyReviews = () => {
    return axiosInstance.get('/users/reviews/mypage');
};

// 마이페이지 - 내 찜 목록
export const fetchMyWishlist = () => {
    return axiosInstance.get('/users/wishlists/mywishlist');
};


import { useState, useEffect } from 'react';

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    name: string;
    exp: number;
    iat: number;
}

interface AuthState {
    isAuthenticated: boolean;
    user: {
        id: string;
        email: string;
        role: string;
        name: string;
    } | null;
    loading: boolean;
}

/**
 * 🔐 인증 상태 관리 hook
 * JWT 토큰에서 사용자 정보를 추출하고 관리
 */
export const useAuth = (): AuthState => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        loading: true
    });

    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem('accessToken');

                if (!token) {
                    setAuthState({
                        isAuthenticated: false,
                        user: null,
                        loading: false
                    });
                    return;
                }

                // JWT payload 디코딩 (간단한 base64 디코딩)
                const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;

                // 토큰 만료 확인
                const currentTime = Date.now() / 1000;
                if (payload.exp < currentTime) {
                    console.warn('🔐 토큰이 만료되었습니다');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userRole');

                    setAuthState({
                        isAuthenticated: false,
                        user: null,
                        loading: false
                    });
                    return;
                }

                // 사용자 정보 설정
                const user = {
                    id: payload.sub,
                    email: payload.email,
                    role: payload.role,
                    name: payload.name
                };

                // localStorage에 role 저장 (다른 컴포넌트에서 사용)
                localStorage.setItem('userRole', payload.role);

                console.log('🔐 인증 상태 확인:', {
                    authenticated: true,
                    role: payload.role,
                    email: payload.email
                });

                setAuthState({
                    isAuthenticated: true,
                    user,
                    loading: false
                });

            } catch (error) {
                console.error('🔐 JWT 파싱 실패:', error);

                // 잘못된 토큰 제거
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userRole');

                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    loading: false
                });
            }
        };

        checkAuth();

        // 토큰 변경 감지를 위한 storage 이벤트 리스너
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'accessToken') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return authState;
};

/**
 * 🚪 로그아웃 함수
 */
export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');

    // 페이지 새로고침으로 상태 초기화
    window.location.href = '/auth';
};
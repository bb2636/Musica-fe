import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../apis/axiosInstance';
import { isAxiosError } from '../../types/errors';
import Header from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";

export default function MyPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                setLoading(true);
                setError(null);

                // 🔍 localStorage에서 role 확인
                const localRole = localStorage.getItem('userRole');
                console.log('🔍 localStorage userRole:', localRole);

                if (localRole) {
                    const upperRole = localRole.toUpperCase();

                    // ✅ 관리자면 /mypage/admin으로 바로 이동
                    if (upperRole === 'ADMIN') {
                        console.log('🔄 관리자 권한 확인 - 관리자 페이지로 이동');
                        navigate('/mypage/admin');
                        return;
                    }

                    if (upperRole === 'INSTRUCTOR') {
                        console.log('🔄 강사 권한 확인 - 강사 페이지로 이동');
                        navigate('/mypage/instructor');
                        return;
                    }

                    if (upperRole === 'USER') {
                        console.log('🔄 일반 사용자 권한 확인 - 사용자 페이지로 이동');
                        navigate('/mypage/users', { replace: true });
                        return;
                    }

                    setLoading(false);
                    return;
                }

                // 🔍 API로 사용자 정보 조회
                console.log('🔍 API로 사용자 정보 조회 시도...');
                const response = await axiosInstance.get('/users/mypage');
                console.log('🔍 API 응답:', response.data);

                const fetchedRole = response.data.role?.toUpperCase();
                console.log('🔍 서버에서 받은 role:', fetchedRole);

                // 받은 role을 localStorage에도 저장
                if (fetchedRole) {
                    localStorage.setItem('userRole', fetchedRole);
                }

                if (fetchedRole === 'ADMIN') {
                    console.log('🔄 API에서 관리자 권한 확인 - 관리자 페이지로 이동');
                    navigate('/mypage/admin');
                } else if (fetchedRole === 'INSTRUCTOR') {
                    console.log('🔄 API에서 강사 권한 확인 - 강사 페이지로 이동');
                    navigate('/mypage/instructor');
                } else if (fetchedRole === 'USER') {
                    console.log('🔄 API에서 일반 사용자 권한 확인 - 사용자 페이지로 이동');
                    navigate('/mypage/users', { replace: true });
                }

            } catch (error: unknown) {
                console.error('❌ 마이페이지 정보 불러오기 실패:', error);

                if (isAxiosError(error)) {
                    const status = error.response?.status;

                    if (status === 401) {
                        setError('로그인이 필요합니다. 다시 로그인해주세요.');
                        setTimeout(() => navigate('/auth'), 2000);
                    } else if (status === 403) {
                        setError('권한이 부족합니다.');
                    } else if (status === 404) {
                        setError('사용자 정보를 찾을 수 없습니다.');
                    } else {
                        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                    }
                } else {
                    setError('알 수 없는 오류가 발생했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [navigate]);

    // 🔄 로딩 상태
    if (loading) {
        return (
            <>
                <Header/>
                <div className="max-w-4xl mx-auto p-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <div className="text-lg text-gray-600">사용자 정보를 불러오는 중...</div>
                        </div>
                    </div>
                </div>
                <Footer/>
            </>
        );
    }

    // 🚨 에러 상태
    if (error) {
        return (
            <>
                <Header/>
                <div className="max-w-4xl mx-auto p-8">
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                        <div className="text-red-500 text-lg mb-4">⚠️ 오류가 발생했습니다</div>
                        <div className="text-gray-600 mb-6">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
                <Footer/>
            </>
        );
    }

    return (
        <>
            <Header/>
            <div className="max-w-6xl mx-auto">
                {/* 역할별 리디렉션 처리 - 잠시 대기 중 표시 */}
                <div className="p-8 text-center">
                    <div className="text-gray-600 text-lg mb-4">역할을 확인하고 있습니다...</div>
                    <div className="text-sm text-gray-500">잠시만 기다려주세요.</div>
                </div>
            </div>
            <Footer/>
        </>
    );
}
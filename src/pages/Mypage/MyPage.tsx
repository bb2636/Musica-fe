import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../apis/axiosInstance';
import UserMyPage from "./USER/UserMyPage";
import InstructorMyPage from "./INSTRUCTOR/InstructorMyPage";
import Header from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";

export default function MyPage() {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const localRole = localStorage.getItem('userRole');

        if (localRole) {
            const upperRole = localRole.toUpperCase();
            setRole(upperRole);

            // ✅ 관리자면 /mypage/admin으로 바로 이동
            if (upperRole === 'ADMIN') {
                navigate('/mypage/admin');
            }

            setLoading(false);
            return;
        }

        axiosInstance.get('/users/mypage')
            .then(res => {
                const fetchedRole = res.data.role?.toUpperCase();
                setRole(fetchedRole);

                if (fetchedRole === 'ADMIN') {
                    navigate('/mypage/admin');
                }
            })
            .catch(err => {
                console.error('마이페이지 정보 불러오기 실패:', err);
                setRole(null);
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) {
        return <div className="p-8 text-center">로딩중...</div>;
    }

    return (
        <>
            <Header/>
            {role === 'USER' && <UserMyPage />}
            {role === 'INSTRUCTOR' && <InstructorMyPage />}
            {!['USER', 'INSTRUCTOR', 'ADMIN'].includes(role || '') && (
                <div className="p-8 text-center text-red-600">
                    권한이 없는 사용자입니다. 로그인 상태를 확인해주세요.
                </div>
            )}
            <Footer/>
        </>
    );
}

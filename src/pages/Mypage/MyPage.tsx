import { useState, useEffect } from 'react';
import axiosInstance from '../../apis/axiosInstance';
import UserMyPage from "./USER/UserMyPage";
import InstructorMyPage from "./INSTRUCTOR/InstructorMyPage";
import AdminMyPage from "./ADMIN/AdminMyPage";
import Header from "../../components/Header.tsx";


export default function MyPage() {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const localRole = localStorage.getItem('userRole');

        if (localRole) {
            setRole(localRole.toUpperCase());
            setLoading(false);
            return;
        }

        axiosInstance.get('/users/mypage')
            .then(res => {
                const fetchedRole = res.data.role?.toUpperCase();
                setRole(fetchedRole);
            })
            .catch(err => {
                console.error('마이페이지 정보 불러오기 실패:', err);
                setRole(null);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-center">로딩중...</div>;
    }

    return (
        <>
            <Header/>
            {role === 'USER' && <UserMyPage />}
            {role === 'INSTRUCTOR' && <InstructorMyPage />}
            {role === 'ADMIN' && <AdminMyPage />}
            {!['USER', 'INSTRUCTOR', 'ADMIN'].includes(role || '') && (
                <div className="p-8 text-center text-red-600">
                    권한이 없는 사용자입니다. 로그인 상태를 확인해주세요.
                </div>
            )}
        </>
    );
}

import { Link, Outlet } from 'react-router-dom';
import Header from "../../../components/Header.tsx";
import Footer from "../../../components/Footer.tsx";

export default function AdminMyPage() {
    return (
        <>
            <Header/>
            <div className="max-w-7xl mx-auto p-8 flex gap-8">
                {/* 왼쪽 사이드 네비 */}
                <aside className="w-60 bg-gray-50 p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-bold mb-4">관리자 페이지</h2>
                    <nav className="space-y-3">
                        <Link to="/mypage/admin/instructors" className="block hover:underline">강사 승인 관리</Link>
                        <Link to="/mypage/admin/categories" className="block hover:underline">카테고리 관리</Link>
                    </nav>
                </aside>

                {/* 중앙 컨텐츠 */}
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
            <Footer/>
        </>
    );
}

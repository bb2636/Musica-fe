import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/musica-logo.png";
import SearchBar from "./SearchBar.tsx";

const Header: React.FC = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('accessToken');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userName');
        alert('로그아웃 되었습니다. 메인페이지로 이동합니다.');
        navigate('/main');
    };

    return (
        <header className="bg-black w-full flex flex-col items-center shadow-lg sticky top-0 z-30">
            {/* 로고 영역 */}
            <div className="w-full flex flex-col items-center pt-6 pb-2">
                <img
                    src={logo}
                    alt="Musica Logo"
                    className="h-24 md:h-32 w-auto object-contain drop-shadow-xl cursor-pointer select-none"
                    style={{ maxWidth: '90vw' }}
                    onClick={() => navigate('/main')}
                />
            </div>
            {/* 우측 버튼 영역 */}
            <div className="absolute right-6 top-8 flex items-center gap-0 z-40">
                {isLoggedIn ? (
                    <>
                        <button
                            onClick={() => navigate('/cart')}
                            className="text-2xl hover:scale-110 transition text-white"
                            title="장바구니"
                        >
                            🛒
                        </button>
                        <div
                            className="cursor-pointer w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 hover:bg-gray-700 transition"
                            onClick={() => navigate('/mypage')}
                            title="마이페이지"
                        >
                            <span className="text-white text-base font-semibold">MY</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-3 rounded shadow-sm"
                        >
                            로그아웃
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-6 py-2 rounded-full bg-black text-white font-semibold border border-black shadow hover:bg-gray-900 hover:text-white transition"
                        >
                            로그인
                        </button>
                        <span className="mx-2 text-gray-400 text-lg select-none">|</span>
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-6 py-2 rounded-full bg-black text-white font-semibold border border-black shadow hover:bg-gray-900 hover:text-white transition"
                        >
                            회원가입
                        </button>
                    </>
                )}
            </div>
            {/* 검색창 영역 제거됨 */}
        </header>
    );
};

export default Header;

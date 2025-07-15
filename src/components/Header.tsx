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
        <header className="bg-black w-full flex flex-row items-center shadow-lg sticky top-0 z-30 px-8" style={{ minHeight: '56px', height: '60px' }}>
            {/* 로고 영역 - 왼쪽 정렬 */}
            <div className="flex items-center cursor-pointer select-none" onClick={() => navigate('/main')}>
                <img
                    src={logo}
                    alt="Musica Logo"
                    className="h-10 md:h-12 w-auto object-contain drop-shadow-xl"
                    style={{ maxWidth: '170px' }}
                />
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-0">
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
        </header>
    );
};

export default Header;

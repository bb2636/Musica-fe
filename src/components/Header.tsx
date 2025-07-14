import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../../public/musica-logo.png";
import SearchBar from "./SearchBar.tsx";

const Header: React.FC = () => {
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem('accessToken');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userName');
        alert('로그아웃 되었습니다. 메인페이지로 이동합니다.')
        navigate('/main');
    };

    return (
        <header className="bg-white shadow px-4 py-0 flex items-center justify-between h-20">
            <div
                className="flex items-center cursor-pointer h-full gap-1"
                onClick={() => navigate('/main')}
            >
                <img
                    src={logo}
                    alt="logo"
                    className="block h-full object-cover"
                    style={{ margin: 0, padding: 0 }}
                />
                {/*<span className="font-bold text-black text-xl leading-none">Musica</span>*/}
            </div>

            <SearchBar/>

            <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                    <>
                        <button
                            onClick={() => navigate('/cart')}
                            className="text-2xl hover:scale-110 transition"
                            title="장바구니"
                        >
                            🛒
                        </button>
                        <div
                            className="cursor-pointer w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center"
                            onClick={() => navigate('/mypage')}
                        >
                            <span className="text-2xl font-bold">MY</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3 rounded"
                        >
                            로그아웃
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded"
                        >
                            로그인
                        </button>
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 px-3 rounded"
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

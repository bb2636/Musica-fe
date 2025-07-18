import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/musica-logo.png";
import SearchBar from "./SearchBar.tsx";


const Header: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    alert("로그아웃 되었습니다. 메인페이지로 이동합니다.");
    navigate("/main");
  };

  return (
    <header className="bg-black w-full shadow z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
        {/* 왼쪽: 로고 */}
        <div
          className="flex-none cursor-pointer"
          onClick={() => navigate("/main")}
        >
          <img
            src={logo}
            alt="Musica Logo"
            className="h-12 md:h-16 w-auto object-contain"
          />
        </div>

        {/* 가운데: 검색바 */}
        <div className="flex-1 flex justify-center mx-8">
          <div className="max-w-lg w-full">
            <SearchBar />
          </div>
        </div>

        {/* 오른쪽: 버튼들 */}
        <div className="flex-none flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/cart")}
                className="text-2xl hover:scale-110 transition text-white"
                title="장바구니"
              >
                🛒
              </button>
              <button
                onClick={() => navigate("/mypage")}
                className="text-sm px-4 py-1.5 rounded-full bg-gray-800 text-white border hover:bg-gray-700 transition"
              >
                MY
              </button>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-1.5 rounded-full bg-gray-900 text-white border hover:bg-gray-700 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth")}
                className="text-sm px-4 py-1.5 rounded-full bg-gray-900 text-white border hover:bg-gray-700 transition"
              >
                로그인
              </button>
              <span className="text-gray-400 text-lg select-none">|</span>
              <button
                onClick={() => navigate("/auth")}
                className="text-sm px-4 py-1.5 rounded-full bg-gray-900 text-white border hover:bg-gray-700 transition"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

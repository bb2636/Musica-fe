import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/musica-logo.png";
import SearchBar from "./SearchBar.tsx";
import cartIcon from "../assets/cart.png";


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
          {isLoggedIn && (
            <button
              onClick={() => navigate("/cart")}
              className="hover:scale-110 transition"
              title="장바구니"
              style={{ marginRight: "5px" }}
            >
              <img src={cartIcon} alt="장바구니" className="w-7 h-7 inline" />
            </button>
          )}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <span
                onClick={() => navigate("/mypage")}
                className="cursor-pointer text-white hover:underline font-normal"
              >
                MY
              </span>
              <span className="text-gray-400 text-lg select-none">|</span>
              <span
                onClick={handleLogout}
                className="cursor-pointer text-white hover:underline font-normal"
              >
                로그아웃
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span
                onClick={() => navigate("/auth")}
                className="cursor-pointer text-white hover:underline font-normal"
              >
                로그인
              </span>
              <span className="text-gray-400 text-lg select-none">|</span>
              <span
                onClick={() => navigate("/auth")}
                className="cursor-pointer text-white hover:underline font-normal"
              >
                회원가입
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

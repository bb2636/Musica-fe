import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/musica-logo.png";
import cartIcon from "../assets/cart.png";
import { commonApi } from "../apis/commonApi";
import type { CategoryOption, DifficultyOption } from "../types/common";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");

  // 통합 검색 상태
  const [sort, setSort] = useState<string>("latest");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [difficultyId, setDifficultyId] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState<string>("");
  const [categoryList, setCategoryList] = useState<CategoryOption[]>([]);
  const [difficultyList, setDifficultyList] = useState<DifficultyOption[]>([]);

  useEffect(() => {
    // 카테고리/난이도 데이터 불러오기
    const fetchMeta = async () => {
      try {
        const [cats, diffs] = await Promise.all([
          commonApi.getCategories(),
          commonApi.getDifficulties(),
        ]);
        setCategoryList(cats);
        setDifficultyList(diffs);
      } catch (err) {
        console.error("카테고리/난이도 불러오기 실패:", err);
      }
    };
    fetchMeta();
  }, []);

  // 검색 실행
  const handleSearch = () => {
    navigate(
      `/search?keyword=${encodeURIComponent(keyword)}&sort=${sort}&categoryId=${categoryId ?? ""}&difficultyId=${difficultyId ?? ""}`
    );
  };

  // 필터 초기화
  const handleReset = () => {
    setSort("latest");
    setCategoryId(undefined);
    setDifficultyId(undefined);
    setKeyword("");
  };

  // Enter 키로 검색
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

        {/* 가운데: 통합 검색 필터 UI */}
        <div className="flex-1 flex justify-center mx-8">
          <form
            className="flex flex-wrap gap-2 items-center bg-white/90 px-4 py-2 rounded-lg shadow max-w-3xl w-full"
            onSubmit={e => {
              e.preventDefault();
              handleSearch();
            }}
          >
            {/* 정렬 */}
            <select
              className="border rounded px-2 py-1 text-sm"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
            </select>
            {/* 카테고리 */}
            <select
              className="border rounded px-2 py-1 text-sm"
              value={categoryId ?? ""}
              onChange={e => {
                const val = e.target.value;
                setCategoryId(val ? Number(val) : undefined);
              }}
            >
              <option value="">카테고리</option>
              {categoryList.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {/* 난이도 */}
            <select
              className="border rounded px-2 py-1 text-sm"
              value={difficultyId ?? ""}
              onChange={e => {
                const val = e.target.value;
                setDifficultyId(val ? Number(val) : undefined);
              }}
            >
              <option value="">난이도</option>
              {difficultyList.map(diff => (
                <option key={diff.id} value={diff.id}>{diff.name}</option>
              ))}
            </select>
            {/* 클래스명 검색어 */}
            <input
              type="text"
              className="border rounded px-2 py-1 text-sm flex-1 min-w-[120px]"
              placeholder="클래스명 검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {/* 검색 버튼 */}
            <button
              type="submit"
              className="bg-neutral-900 text-white px-3 py-1 rounded hover:bg-neutral-800 transition text-sm"
            >
              검색
            </button>
            {/* 필터 초기화 버튼 */}
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition text-sm"
              onClick={handleReset}
            >
              초기화
            </button>
          </form>
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

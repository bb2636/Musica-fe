import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/musica-logo.png";
import cartIcon from "../assets/cart.png";
import { commonApi } from "../apis/commonApi";
import type { CategoryOption, DifficultyOption } from "../types/common";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const userRole = (localStorage.getItem("userRole") ?? "").toUpperCase();
  const isUser = userRole === "USER";

  // 통합 검색 상태
  const [sort, setSort] = useState<string>("latest");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [difficultyId, setDifficultyId] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState<string>("");
  const [categoryList, setCategoryList] = useState<CategoryOption[]>([]);
  const [difficultyList, setDifficultyList] = useState<DifficultyOption[]>([]);

  // 드롭다운 상태
  const [sortOpen, setSortOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);

  // 드롭다운 외부 클릭 닫기
  const sortRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        sortRef.current && !sortRef.current.contains(e.target as Node) &&
        categoryRef.current && !categoryRef.current.contains(e.target as Node) &&
        difficultyRef.current && !difficultyRef.current.contains(e.target as Node)
      ) {
        setSortOpen(false);
        setCategoryOpen(false);
        setDifficultyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  // 아래 화살표 SVG
  const ArrowDown = (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <header className="w-full bg-black text-white">
      <div className="max-w-6xl mx-auto w-full px-6 py-4 flex items-center justify-between sm:flex-col lg:flex-row">
        {/* 좌측: 로고 */}
        <div className="flex-none cursor-pointer" onClick={() => navigate("/main")}> 
          <img src={logo} alt="Musica Logo" className="h-12 md:h-16 w-auto object-contain" />
        </div>

        {/* 중앙: 메뉴/검색 */}
        <div className="flex-1 flex items-center justify-center gap-2 relative">
          {/* 초기화 */}
          <button
            type="button"
            className="text-white bg-transparent border-none text-sm px-3 py-1 cursor-pointer hover:opacity-80"
            onClick={handleReset}
          >
            초기화
          </button>
          {/* 정렬 드롭다운 */}
          <div className="relative inline-flex flex-col min-w-[max-content]" ref={sortRef}>
            <button
              className="flex items-center gap-1 text-white bg-transparent border-none text-sm cursor-pointer hover:opacity-80"
              onClick={() => {
                setSortOpen((v) => !v);
                setCategoryOpen(false);
                setDifficultyOpen(false);
              }}
            >
              {sort === "latest" ? "최신순" : "인기순"}
              {ArrowDown}
            </button>
            {sortOpen && (
              <div className="absolute top-full left-0 mt-1 min-w-full w-max bg-white text-black rounded shadow z-50">
                <button
                  className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  onClick={() => { setSort("latest"); setSortOpen(false); }}
                >
                  최신순
                </button>
                <button
                  className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  onClick={() => { setSort("popular"); setSortOpen(false); }}
                >
                  인기순
                </button>
              </div>
            )}
          </div>
          {/* 카테고리 드롭다운 */}
          <div className="relative inline-flex flex-col min-w-[max-content]" ref={categoryRef}>
            <button
              className="flex items-center gap-1 text-white bg-transparent border-none text-sm cursor-pointer hover:opacity-80"
              onClick={() => {
                setCategoryOpen((v) => !v);
                setSortOpen(false);
                setDifficultyOpen(false);
              }}
            >
              {categoryId ? (categoryList.find(c => c.id === categoryId)?.name || "카테고리") : "카테고리"}
              {ArrowDown}
            </button>
            {categoryOpen && (
              <div className="absolute top-full left-0 mt-1 min-w-full w-max bg-white text-black rounded shadow z-50 max-h-60 overflow-y-auto">
                <button
                  className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  onClick={() => { setCategoryId(undefined); setCategoryOpen(false); }}
                >
                  전체
                </button>
                {categoryList.map(cat => (
                  <button
                    key={cat.id}
                    className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                    onClick={() => { setCategoryId(cat.id); setCategoryOpen(false); }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* 난이도 드롭다운 */}
          <div className="relative inline-flex flex-col min-w-[max-content]" ref={difficultyRef}>
            <button
              className="flex items-center gap-1 text-white bg-transparent border-none text-sm cursor-pointer hover:opacity-80"
              onClick={() => {
                setDifficultyOpen((v) => !v);
                setSortOpen(false);
                setCategoryOpen(false);
              }}
            >
              {difficultyId ? (difficultyList.find(d => d.id === difficultyId)?.name || "난이도") : "난이도"}
              {ArrowDown}
            </button>
            {difficultyOpen && (
              <div className="absolute top-full left-0 mt-1 min-w-full w-max bg-white text-black rounded shadow z-50 max-h-60 overflow-y-auto">
                <button
                  className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  onClick={() => { setDifficultyId(undefined); setDifficultyOpen(false); }}
                >
                  전체
                </button>
                {difficultyList.map(diff => (
                  <button
                    key={diff.id}
                    className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                    onClick={() => { setDifficultyId(diff.id); setDifficultyOpen(false); }}
                  >
                    {diff.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* 검색창 */}
          <form
            className="relative ml-2"
            onSubmit={e => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <input
              type="text"
              className="w-72 bg-gray-100 border-none text-black placeholder-gray-500 pl-4 pr-10 py-2 rounded-md text-sm"
              placeholder="어떤 음악강의를 찾으시나요?"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* 우측: 장바구니, MY, 로그아웃/로그인 */}
        <div className="flex items-center gap-4 text-sm">
          {isLoggedIn && isUser && (
            <button
              onClick={() => navigate("/cart")}
              className="hover:opacity-80 mr-2"
              title="장바구니"
            >
              <img src={cartIcon} alt="장바구니" className="w-7 h-7 inline" />
            </button>
          )}
          {isLoggedIn ? (
            <>
              <span
                onClick={() => navigate("/mypage")}
                className="cursor-pointer hover:underline font-normal"
              >
                MY
              </span>
              <span className="text-gray-400 text-lg select-none">|</span>
              <span
                onClick={handleLogout}
                className="cursor-pointer hover:underline font-normal"
              >
                로그아웃
              </span>
            </>
          ) : (
            <>
              <span
                onClick={() => navigate("/auth")}
                className="cursor-pointer hover:underline font-normal"
              >
                로그인
              </span>
              <span className="text-gray-400 text-lg select-none">|</span>
              <span
                onClick={() => navigate("/auth")}
                className="cursor-pointer hover:underline font-normal"
              >
                회원가입
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

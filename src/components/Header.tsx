import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/musica-logo.png";
import cartIcon from "../assets/cart.png";
import { commonApi } from "../apis/commonApi";
import type { CategoryOption, DifficultyOption } from "../types/common";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const userRole = (localStorage.getItem("userRole") ?? "").toUpperCase();
  const isUser = userRole === "USER";

  const [sort, setSort] = useState<string>("latest");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [difficultyId, setDifficultyId] = useState<number | undefined>();
  const [keyword, setKeyword] = useState<string>("");

  const [categoryList, setCategoryList] = useState<CategoryOption[]>([]);
  const [difficultyList, setDifficultyList] = useState<DifficultyOption[]>([]);

  const [sortOpen, setSortOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        sortRef.current &&
        !sortRef.current.contains(e.target as Node) &&
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node) &&
        difficultyRef.current &&
        !difficultyRef.current.contains(e.target as Node)
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

  const handleSearch = () => {
    navigate(
      `/search?keyword=${encodeURIComponent(keyword)}&sort=${sort}&categoryId=${
        categoryId ?? ""
      }&difficultyId=${difficultyId ?? ""}`
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleReset = () => {
    setKeyword("");
    setSort("latest");
    setCategoryId(undefined);
    setDifficultyId(undefined);
  };

  const handleLogout = () => {
    localStorage.clear();
    alert("로그아웃 되었습니다. 메인페이지로 이동합니다.");
    navigate("/main");
  };

  const ArrowDown = (
    <svg
      className="w-4 h-4 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <header className="w-full bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* 로고 */}
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

        {/* 검색 + 필터 */}
        <div className="flex-1 flex flex-wrap justify-center items-center gap-2">
          {/* 드롭다운 필터 그룹 */}
          <div className="flex flex-wrap gap-2">
            {/* 정렬 */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => {
                  setSortOpen(!sortOpen);
                  setCategoryOpen(false);
                  setDifficultyOpen(false);
                }}
                className="flex items-center gap-1 text-sm hover:opacity-80"
              >
                {sort === "latest" ? "최신순" : "인기순"} {ArrowDown}
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white text-black rounded shadow z-50 min-w-[8rem] whitespace-nowrap">
                  <button
                    className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left whitespace-nowrap"
                    onClick={() => {
                      setSort("latest");
                      setSortOpen(false);
                    }}
                  >
                    최신순
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left whitespace-nowrap"
                    onClick={() => {
                      setSort("popular");
                      setSortOpen(false);
                    }}
                  >
                    인기순
                  </button>
                </div>
              )}
            </div>

            {/* 카테고리 */}
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => {
                  setCategoryOpen(!categoryOpen);
                  setSortOpen(false);
                  setDifficultyOpen(false);
                }}
                className="flex items-center gap-1 text-sm hover:opacity-80"
              >
                {categoryId
                  ? categoryList.find((c) => c.id === categoryId)?.name ||
                    "카테고리"
                  : "카테고리"}{" "}
                {ArrowDown}
              </button>
              {categoryOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white text-black rounded shadow z-50 max-h-60 overflow-y-auto min-w-[8rem] whitespace-nowrap">
                  <button
                    className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left whitespace-nowrap"
                    onClick={() => {
                      setCategoryId(undefined);
                      setCategoryOpen(false);
                    }}
                  >
                    전체
                  </button>
                  {categoryList.map((cat) => (
                    <button
                      key={cat.id}
                      className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left whitespace-nowrap"
                      onClick={() => {
                        setCategoryId(cat.id);
                        setCategoryOpen(false);
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 난이도 */}
            <div className="relative" ref={difficultyRef}>
              <button
                onClick={() => {
                  setDifficultyOpen(!difficultyOpen);
                  setSortOpen(false);
                  setCategoryOpen(false);
                }}
                className="flex items-center gap-1 text-sm hover:opacity-80"
              >
                {difficultyId
                  ? difficultyList.find((d) => d.id === difficultyId)?.name ||
                    "난이도"
                  : "난이도"}{" "}
                {ArrowDown}
              </button>
              {difficultyOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white text-black rounded shadow z-50 max-h-60 overflow-y-auto min-w-[8rem] whitespace-nowrap">
                  <button
                    className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left whitespace-nowrap"
                    onClick={() => {
                      setDifficultyId(undefined);
                      setDifficultyOpen(false);
                    }}
                  >
                    전체
                  </button>
                  {difficultyList.map((d) => (
                    <button
                      key={d.id}
                      className="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-left whitespace-nowrap"
                      onClick={() => {
                        setDifficultyId(d.id);
                        setDifficultyOpen(false);
                      }}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 검색창 */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative"
          >
            <input
              type="text"
              className="w-72 bg-gray-100 border-none text-black placeholder-gray-500 pl-4 pr-10 py-2 rounded-md text-sm"
              placeholder="어떤 음악강의를 찾으시나요?"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <svg
                className="w-5 h-5 text-black"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </button>
          </form>

          {/* 초기화 버튼 (조건부) */}
          {(keyword || categoryId || difficultyId || sort !== "latest") && (
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
            >
              초기화
            </button>
          )}
        </div>

        {/* 로그인 / 장바구니 / MY */}
        <div className="flex items-center gap-4 text-sm">
          {isLoggedIn && isUser && (
            <button
              onClick={() => navigate("/cart")}
              className="hover:opacity-80"
              title="장바구니"
            >
              <img src={cartIcon} alt="장바구니" className="w-7 h-7" />
            </button>
          )}
          {isLoggedIn ? (
            <>
              <span
                onClick={() => navigate("/mypage")}
                className="cursor-pointer hover:underline"
              >
                MY
              </span>
              <span className="text-gray-400 select-none">|</span>
              <span
                onClick={handleLogout}
                className="cursor-pointer hover:underline"
              >
                로그아웃
              </span>
            </>
          ) : (
            <>
              <span
                onClick={() => navigate("/auth?mode=login")}
                className={`cursor-pointer hover:underline font-normal ${
                  location.pathname === "/auth" &&
                  (location.search.includes("mode=login") ||
                    location.search === "")
                    ? "text-white font-bold underline"
                    : ""
                }`}
              >
                로그인
              </span>
              <span className="text-gray-400 select-none">|</span>
              <span
                onClick={() => navigate("/auth?mode=signup")}
                className={`cursor-pointer hover:underline font-normal ${
                  location.pathname === "/auth" &&
                  location.search.includes("mode=signup")
                    ? "text-white font-bold underline"
                    : ""
                }`}
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

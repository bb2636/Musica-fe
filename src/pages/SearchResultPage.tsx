import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ClassCard from "../components/mainpage/ClassCard";
import type { SearchClassItem } from "../types/SearchClassItem";
import useWishlist from "../hooks/useWishlist";
import useCart from "../hooks/useCart";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { classApi } from "../apis/classesApi";

interface PageResult<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

const PAGE_SIZE = 30; // 5x6

const SearchResultPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageResult<SearchClassItem> | null>(null);

  // 커스텀 훅 사용
  const { wishedClassIds, wishlistCounts, processingSet: wishProcessingSet, toggleWish } = useWishlist();
  const { cartItems, processingSet: cartProcessingSet, toggleCart } = useCart();
  const cartClassIds = cartItems.map((item) => item.classId);

  // 쿼리 파라미터 추출
  const keyword = searchParams.get("keyword") || "";
  const sort = searchParams.get("sort") || "latest";
  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const difficultyId = searchParams.get("difficultyId") ? Number(searchParams.get("difficultyId")) : undefined;
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 0;

  // 데이터 fetch
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const params: Record<string, any> = {
          keyword: keyword.trim() || undefined,
          sort,
          page,
          size: PAGE_SIZE,
        };
        if (categoryId !== undefined) params.categoryId = categoryId;
        if (difficultyId !== undefined) params.difficultyId = difficultyId;
        const res = await classApi.getAllClasses(params);
        setPageData(res);
      } catch (err) {
        setPageData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [keyword, sort, categoryId, difficultyId, page]);

  // 페이지 이동
  const goToPage = useCallback((p: number) => {
    searchParams.set("page", String(p));
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  // 페이지네이션 버튼 생성
  const renderPagination = () => {
    if (!pageData) return null;
    const { totalPages, number } = pageData;
    if (totalPages <= 1) return null;
    const maxPage = totalPages - 1;
    const currentPage = number;
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(maxPage, currentPage + 2);
    if (currentPage <= 2) end = Math.min(4, maxPage);
    if (currentPage >= maxPage - 2) start = Math.max(0, maxPage - 4);
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return (
      <div className="flex items-center justify-center gap-1 mt-8">
        <button
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-40"
          onClick={() => goToPage(0)}
          disabled={currentPage === 0}
        >
          &lt;&lt;
        </button>
        <button
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-40"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          &lt;
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => goToPage(p)}
            className={`px-3 py-1 rounded transition text-sm font-semibold ${
              currentPage === p
                ? "bg-neutral-900 text-white"
                : "bg-white text-gray-800 border hover:bg-neutral-800 hover:text-white"
            }`}
          >
            {p + 1}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-40"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === maxPage}
        >
          &gt;
        </button>
        <button
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-40"
          onClick={() => goToPage(maxPage)}
          disabled={currentPage === maxPage}
        >
          &gt;&gt;
        </button>
      </div>
    );
  };

  // 핸들러
  const handleToggleWish = (id: number) => toggleWish(id, wishedClassIds.includes(id));
  const handleToggleCart = (id: number) => toggleCart(id, cartClassIds.includes(id));

//   console.log(`🧩 카드 ${i}:`, cls);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-6">검색 결과</h2>
      {loading ? (
        <div className="text-center text-lg py-20">로딩 중...</div>
      ) : !pageData || pageData.content.length === 0 ? (
        <div className="text-center text-gray-500 py-20">검색 결과가 없습니다</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {pageData.content.map((cls) => (
              <ClassCard
                key={cls.id}
                id={cls.id}
                title={cls.title}
                instructor={cls.instructorName}
                price={cls.classPrice}
                rating={cls.averageRating}
                ratingCount={cls.ratingCount}
                thumbnailUrl={cls.thumbnailUrl}
                onToggleWish={() => handleToggleWish(cls.id)}
                onToggleCart={() => handleToggleCart(cls.id)}
                wishedClassIds={wishedClassIds}
                wishlistCount={wishlistCounts[cls.id] ?? 0} // ← 서버 응답에 없음
                isProcessingWishSet={wishProcessingSet}
                isProcessingCartSet={cartProcessingSet}
                isInCart={cartClassIds.includes(cls.id)}
              />
            ))}
          </div>
          {renderPagination()}
        </>
      )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchResultPage; 
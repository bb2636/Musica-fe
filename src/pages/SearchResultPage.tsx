import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ClassCard from "../components/mainpage/ClassCard";
import type { SearchClassItem } from "../types/SearchClassItem";
import useWishlist from "../hooks/useWishlist";
import useCart from "../hooks/useCart";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { classApi } from "../apis/classesApi";
import { getEnrolledClasses } from "../apis/payment"; // ✅ 수강중 API 추가

interface PageResult<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

const PAGE_SIZE = 30;

const SearchResultPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageResult<SearchClassItem> | null>(null);

  // ✅ 수강중 클래스 ID 목록
  const [paidClassIds, setPaidClassIds] = useState<number[]>([]);
  const [paidClassIdsLoading, setPaidClassIdsLoading] = useState(true);

  // 커스텀 훅
  const { wishedClassIds, wishlistCounts, processingSet: wishProcessingSet, toggleWish, fetchWishlist } = useWishlist(); // ✅ fetchWishlist 포함
  const { cartItems, processingSet: cartProcessingSet, toggleCart } = useCart();
  const cartClassIds = cartItems.map((item) => item.classId);

  // ✅ 수강중 클래스 불러오기
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole") ?? "";
    const isUser = role.toUpperCase() === "USER";

    if (token && isUser) {
      getEnrolledClasses()
        .then((classes) => {
          const ids = classes.map((item) => item.classId);
          setPaidClassIds(ids);
        })
        .finally(() => {
          setPaidClassIdsLoading(false);
        });
    } else {
      setPaidClassIdsLoading(false);
    }
  }, []);

  // ✅ 찜 목록 불러오기
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchWishlist();
    }
  }, [fetchWishlist]);

  // 쿼리 파라미터
  const keyword = searchParams.get("keyword") || "";
  const sort = searchParams.get("sort") || "latest";
  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const difficultyId = searchParams.get("difficultyId") ? Number(searchParams.get("difficultyId")) : undefined;
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 0;

  // 클래스 목록 불러오기
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
  }, [keyword, sort, categoryId, difficultyId, page]);

  const goToPage = useCallback((p: number) => {
    searchParams.set("page", String(p));
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

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
        <button onClick={() => goToPage(0)} disabled={currentPage === 0} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-40">&lt;&lt;</button>
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-40">&lt;</button>
        {pages.map((p) => (
          <button key={p} onClick={() => goToPage(p)}
            className={`px-3 py-1 rounded transition text-sm font-semibold ${
              currentPage === p
                ? "bg-neutral-900 text-white"
                : "bg-white text-gray-800 border hover:bg-neutral-800 hover:text-white"
            }`}
          >
            {p + 1}
          </button>
        ))}
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === maxPage} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-40">&gt;</button>
        <button onClick={() => goToPage(maxPage)} disabled={currentPage === maxPage} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-40">&gt;&gt;</button>
      </div>
    );
  };

  const handleToggleWish = (id: number) => toggleWish(id, wishedClassIds.includes(id));
  const handleToggleCart = (id: number) => toggleCart(id, cartClassIds.includes(id));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8 min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-6">검색 결과</h2>
        {loading || paidClassIdsLoading ? (
          <div className="text-center text-lg py-20">로딩 중...</div>
        ) : !pageData || pageData.content.length === 0 ? (
          <div className="text-center text-gray-500 py-20">검색 결과가 없습니다</div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-8">
              {pageData.content.map((cls) => (
                <div key={cls.id} className="w-full sm:w-[260px]">
                  <ClassCard
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
                    wishlistCount={wishlistCounts[cls.id] ?? cls.wishlistCount}
                    isProcessingWishSet={wishProcessingSet}
                    isProcessingCartSet={cartProcessingSet}
                    isInCart={cartClassIds.includes(cls.id)}
                    isPaid={paidClassIds.includes(cls.id)} // ✅ 수강중 표시용
                  />
                </div>
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

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axiosInstance from "../apis/axiosInstance";
import type { MainpageClassItem } from "../types/MainpageClassItem";
import type { ReviewSummaryCard } from "../types/ReviewSummaryCard";
import RecommendedSection from "../components/mainpage/RecommendedSection";
import PopularSection from "../components/mainpage/PopularSection";
import RecentSection from "../components/mainpage/RecentSection";
import ReviewSummarySection from "../components/mainpage/ReviewSummarySection";
import FreeClassSection from "../components/mainpage/FreeClassSection";
import { getEnrolledClasses } from "../apis/payment";
import useWishlist from "../hooks/useWishlist";
import useCart from "../hooks/useCart";

const role = localStorage.getItem("userRole") ?? "";
const isUser = role.toUpperCase() === "USER";
const MainPage: React.FC = () => {
  const [paidClassIdsLoading, setPaidClassIdsLoading] = useState(true);
  const [recommendedClasses, setRecommendedClasses] = useState<
    MainpageClassItem[]
  >([]);
  const [popularClasses, setPopularClasses] = useState<MainpageClassItem[]>([]);
  const [recentClasses, setRecentClasses] = useState<MainpageClassItem[]>([]);
  const [reviewSummaryCards, setReviewSummaryCards] = useState<
    ReviewSummaryCard[]
  >([]);
  const [freeClasses, setFreeClasses] = useState<MainpageClassItem[]>([]);
  const [paidClassIds, setPaidClassIds] = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // 커스텀 훅 사용
  const {
    wishedClassIds,
    wishlistCounts,
    processingSet: wishProcessingSet,
    fetchWishlist,
    toggleWish,
  } = useWishlist();
  const {
    cartItems,
    processingSet: cartProcessingSet,
    fetchCart,
    toggleCart,
  } = useCart();
  const cartClassIds = cartItems.map((item) => item.classId);

  const mapClassData = (data: any[]): MainpageClassItem[] => {
    if (!Array.isArray(data)) return [];
    const mapped = data.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      rating: item.rating,
      tag: item.categoryName,
      categoryName: item.categoryName,
      thumbnailUrl: item.thumbnailUrl,
      instructor: item.instructorName,
      ratingCount: item.ratingCount,
      originalPrice: item.originalPrice,
      studentCount: item.studentCount ?? 0,
      wishlistCount: item.wishlistCount ?? 0,
    }));
    return mapped;
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    if (token) {
      fetchWishlist(); // ✅ 커스텀 훅 사용
      fetchCart(); // ✅ 커스텀 훅 사용
    }

    if (token && isUser) {
      getEnrolledClasses()
        .then((classes) => {
          console.log("📦 수강 중 클래스 응답:", classes);
          const ids = classes.map((item) => item.classId);
          console.log("✅ 결제된 클래스 ID 목록:", ids);
          setPaidClassIds(ids);
        })
        .finally(() => {
          setPaidClassIdsLoading(false);
        });
    } else {
      setPaidClassIdsLoading(false);
    }

    axiosInstance
      .get("/main/reviews/summary")
      .then((res) =>
        setReviewSummaryCards(Array.isArray(res.data) ? res.data : [])
      )
      .catch(() => setReviewSummaryCards([]));
    axiosInstance
      .get("/main/popular")
      .then((res) => setPopularClasses(mapClassData(res.data)))
      .catch(() => setPopularClasses([]));
    axiosInstance
      .get("/main/latest")
      .then((res) => setRecentClasses(mapClassData(res.data)))
      .catch(() => setRecentClasses([]));
    axiosInstance
      .get("/main/classes/free")
      .then((res) => setFreeClasses(mapClassData(res.data)))
      .catch(() => setFreeClasses([]));
    if (token && isUser) {
      axiosInstance
        .get("/main/recommend")
        .then((res) => setRecommendedClasses(mapClassData(res.data)))
        .catch(() => setRecommendedClasses([]));
    } else {
      setRecommendedClasses([]);
    }
  }, []);

  // Section에 전달할 핸들러
  const handleToggleWish = (id: number) =>
    toggleWish(id, wishedClassIds.includes(id));
  const handleToggleCart = (id: number) =>
    toggleCart(id, cartClassIds.includes(id));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full mx-auto px-4 py-8">
        {paidClassIdsLoading ? (
          <div className="text-center text-gray-500">로딩 중...</div>
        ) : (
          <>
            {/* 추천 클래스 (유저 + 로그인 + 데이터 있음) */}
            {isLoggedIn && isUser && recommendedClasses.length > 0 && (
              <RecommendedSection
                classes={recommendedClasses}
                onToggleWish={handleToggleWish}
                onToggleCart={handleToggleCart}
                wishedClassIds={wishedClassIds}
                isInCartList={cartClassIds}
                isProcessingWishSet={wishProcessingSet}
                isProcessingCartSet={cartProcessingSet}
                paidClassIds={paidClassIds}
                wishlistCounts={wishlistCounts}
              />
            )}

            {/* 인기, 최신, 무료 클래스 섹션들 */}
            <PopularSection
              classes={popularClasses}
              onToggleWish={handleToggleWish}
              onToggleCart={handleToggleCart}
              wishedClassIds={wishedClassIds}
              isInCartList={cartClassIds}
              isProcessingWishSet={wishProcessingSet}
              isProcessingCartSet={cartProcessingSet}
              paidClassIds={paidClassIds}
              wishlistCounts={wishlistCounts}
            />

            <RecentSection
              classes={recentClasses}
              onToggleWish={handleToggleWish}
              onToggleCart={handleToggleCart}
              wishedClassIds={wishedClassIds}
              isInCartList={cartClassIds}
              isProcessingWishSet={wishProcessingSet}
              isProcessingCartSet={cartProcessingSet}
              paidClassIds={paidClassIds}
              wishlistCounts={wishlistCounts}
            />

            <ReviewSummarySection reviews={reviewSummaryCards} />

            <FreeClassSection
              classes={freeClasses}
              onToggleWish={handleToggleWish}
              onToggleCart={handleToggleCart}
              wishedClassIds={wishedClassIds}
              isInCartList={cartClassIds}
              isProcessingWishSet={wishProcessingSet}
              isProcessingCartSet={cartProcessingSet}
              paidClassIds={paidClassIds}
              wishlistCounts={wishlistCounts}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;

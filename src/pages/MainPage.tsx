import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axiosInstance from "../apis/axiosInstance";
import { cartApi } from "../apis/cart";
import { wishlistApi } from "../apis/WishlistApi";
import type { MainpageClassItem } from "../types/MainpageClassItem";
import type { ReviewSummaryCard } from "../types/ReviewSummaryCard";
import type { CartItemInfo } from "../types/CartItemInfo";
import RecommendedSection from "../components/mainpage/RecommendedSection";
import PopularSection from "../components/mainpage/PopularSection";
import RecentSection from "../components/mainpage/RecentSection";
import ReviewSummarySection from "../components/mainpage/ReviewSummarySection";
import FreeClassSection from "../components/mainpage/FreeClassSection";
import { getEnrolledClasses } from "../apis/payment";

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
  const [wishedClassIds, setWishedClassIds] = useState<number[]>([]); // 찜된 클래스 ID 목록
  const [wishlistCounts, setWishlistCounts] = useState<Record<number, number>>(
    {}
  ); // 찜 개수 상태 추가
  const [cartItems, setCartItems] = useState<CartItemInfo[]>([]); // 장바구니에 담긴 클래스 목록
  const [paidClassIds, setPaidClassIds] = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  //const wishProcessingSet = useRef<Set<number>>(new Set()); // 찜 중복 요청 방지용
  const [wishProcessingSet, setWishProcessingSet] = useState<Set<number>>(
    new Set()
  );
  const cartProcessingSet = useRef<Set<number>>(new Set()); // 장바구니 중복 요청 방지용
  const cartClassIds = cartItems.map((item) => item.classId);

  const mapClassData = (data: any[]): MainpageClassItem[] => {
    if (!Array.isArray(data)) return [];

    // 💡 먼저 매핑된 클래스 목록을 만들어줍니다
    const mapped = data.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      rating: item.rating,
      tag: item.categoryName,
      categoryName: item.categoryName,
      thumbnailUrl: item.thumbnailUrl,
      instructor: item.instructor,
      ratingCount: item.ratingCount,
      originalPrice: item.originalPrice,
      studentCount: item.studentCount ?? 0,
      wishlistCount: item.wishlistCount ?? 0, // 프론트에서 찜 수 바로 보여주기 위함
    }));

    // 💡 클래스별 찜 수를 상태로 따로 저장해서 낙관적 UI 구현
    const countMap: Record<number, number> = {};
    mapped.forEach((cls) => {
      countMap[cls.id] = cls.wishlistCount ?? 0;
    });
    setWishlistCounts(countMap);

    return mapped;
  };

  const onToggleWish = async (classId: number, isWished: boolean) => {
    if (wishProcessingSet.has(classId)) return;
    const newSet = new Set(wishProcessingSet);
    newSet.add(classId);
    setWishProcessingSet(newSet);

    setWishedClassIds((prev) =>
      isWished ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
    setWishlistCounts((prev) => ({
      ...prev,
      [classId]: (prev[classId] ?? 0) + (isWished ? -1 : 1),
    }));

    try {
      if (!isWished) {
        await wishlistApi.addToWishlist(classId);
      } else {
        await wishlistApi.removeFromWishlist(classId);
        alert("찜 목록에서 제거했습니다.");
      }
    } catch (err) {
      alert("찜 처리 중 오류가 발생했습니다.");
      setWishedClassIds((prev) =>
        isWished ? [...prev, classId] : prev.filter((id) => id !== classId)
      );
      setWishlistCounts((prev) => ({
        ...prev,
        [classId]: (prev[classId] ?? 0) + (isWished ? 1 : -1),
      }));
    } finally {
      const updated = new Set(wishProcessingSet);
      updated.delete(classId);
      setWishProcessingSet(updated);
    }
  };

  const onToggleCart = async (classId: number, isInCart: boolean) => {
    if (cartProcessingSet.current.has(classId)) return;
    cartProcessingSet.current.add(classId);

    const prevCartItems = [...cartItems];
    setCartItems((prev) =>
      isInCart
        ? prev.filter((item) => item.classId !== classId)
        : [...prev, { classId, cartItemId: -1 }]
    ); // 💡 낙관적 UI 반영

    try {
      if (!isInCart) {
        await cartApi.addToCart(classId);
        // alert("장바구니에 담았습니다!");
      } else {
        const found = prevCartItems.find((item) => item.classId === classId);
        if (found) {
          await cartApi.removeFromCart([found.cartItemId]);
          alert("장바구니에서 제거했습니다.");
        } else {
          throw new Error("기존 장바구니 정보 없음");
        }
      }
    } catch (err) {
      alert("장바구니 처리 중 오류가 발생했습니다.");
      setCartItems(prevCartItems); // ❗ 실패 시 롤백
    } finally {
      try {
        const { cartItems: items } = await cartApi.getCartItems();
        setCartItems(
          items.map((item) => ({
            classId: item.classId,
            cartItemId: item.cartItemId,
          }))
        );
      } catch {
        alert("장바구니 목록 동기화 실패");
      }
      cartProcessingSet.current.delete(classId);
    }
  };

  useEffect(() => {
    // const [paidClassIdsLoading, setPaidClassIdsLoading] = useState(true);
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    if (token) {
      wishlistApi
        .getMyWishlist()
        .then((wishlist) => {
          const ids = wishlist.map((item) => item.classId);
          setWishedClassIds(ids);
        })
        .catch(() => setWishedClassIds([]));

      cartApi
        .getCartItems()
        .then((cartResponse) => {
          const items = cartResponse.cartItems.map((item) => ({
            classId: item.classId,
            cartItemId: item.cartItemId,
          }));
          setCartItems(items);
        })
        .catch(() => setCartItems([]));
    }

    // if (token && isUser) {
    //   getEnrolledClasses().then((classes) => {
    //     console.log("📦 수강 중 클래스 응답:", classes);
    //     const ids = classes.map((item) => item.classId);
    //     console.log("✅ 결제된 클래스 ID 목록:", ids);
    //     setPaidClassIds(ids);
    //   });
    // }

    if (token && isUser) {
      getEnrolledClasses()
        .then((classes) => {
          const ids = classes.map((item) => item.classId);
          setPaidClassIds(ids);
        })
        .finally(() => {
          setPaidClassIdsLoading(false); // ✅ 여기서는 상태만 변경
        });
    } else {
      setPaidClassIdsLoading(false); // 로그인 안 했을 때도 해줘야 렌더링 됨!
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full mx-auto px-4 py-8">
        {paidClassIdsLoading ? (
          <div className="text-center text-gray-500">로딩 중...</div>
        ) : (
          <>
            {isLoggedIn && isUser && recommendedClasses.length > 0 && (
              <RecommendedSection
                classes={recommendedClasses}
                onToggleWish={onToggleWish}
                onToggleCart={onToggleCart}
                wishedClassIds={wishedClassIds}
                isInCartList={cartClassIds}
                isProcessingWishSet={wishProcessingSet}
                isProcessingCartSet={cartProcessingSet.current}
                paidClassIds={paidClassIds}
                wishlistCounts={wishlistCounts}
              />
            )}
            <PopularSection
              classes={popularClasses}
              onToggleWish={onToggleWish}
              onToggleCart={onToggleCart}
              wishedClassIds={wishedClassIds}
              isInCartList={cartClassIds}
              isProcessingWishSet={wishProcessingSet}
              isProcessingCartSet={cartProcessingSet.current}
              paidClassIds={paidClassIds}
              wishlistCounts={wishlistCounts}
            />
            <RecentSection
              classes={recentClasses}
              onToggleWish={onToggleWish}
              onToggleCart={onToggleCart}
              wishedClassIds={wishedClassIds}
              isInCartList={cartClassIds}
              isProcessingWishSet={wishProcessingSet}
              isProcessingCartSet={cartProcessingSet.current}
              paidClassIds={paidClassIds}
              wishlistCounts={wishlistCounts}
            />
            <ReviewSummarySection reviews={reviewSummaryCards} />
            <FreeClassSection
              classes={freeClasses}
              onToggleWish={onToggleWish}
              onToggleCart={onToggleCart}
              wishedClassIds={wishedClassIds}
              isInCartList={cartClassIds}
              isProcessingWishSet={wishProcessingSet}
              isProcessingCartSet={cartProcessingSet.current}
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

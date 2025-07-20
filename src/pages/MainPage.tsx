import React, { useEffect, useState, useRef } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import axiosInstance from '../apis/axiosInstance';
import { cartApi } from '../apis/cart';
import { wishlistApi } from '../apis/WishlistApi';
import type { MainpageClassItem } from '../types/MainpageClassItem';
import type { ReviewSummaryCard } from '../types/ReviewSummaryCard';
import type { CartItemInfo } from '../types/CartItemInfo';
import RecommendedSection from '../components/mainpage/RecommendedSection';
import PopularSection from '../components/mainpage/PopularSection';
import RecentSection from '../components/mainpage/RecentSection';
import ReviewSummarySection from '../components/mainpage/ReviewSummarySection';
import FreeClassSection from '../components/mainpage/FreeClassSection';

const MainPage: React.FC = () => {
  const [recommendedClasses, setRecommendedClasses] = useState<MainpageClassItem[]>([]);
  const [popularClasses, setPopularClasses] = useState<MainpageClassItem[]>([]);
  const [recentClasses, setRecentClasses] = useState<MainpageClassItem[]>([]);
  const [reviewSummaryCards, setReviewSummaryCards] = useState<ReviewSummaryCard[]>([]);
  const [freeClasses, setFreeClasses] = useState<MainpageClassItem[]>([]);
  const [wishedClassIds, setWishedClassIds] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartItemInfo[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const mapClassData = (data: any[]): MainpageClassItem[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
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
    }));
  };

  const isProcessingWishRef = useRef(false);

  const onToggleWish = async (classId: number) => {
    if (isProcessingWishRef.current) return;
    isProcessingWishRef.current = true;

    // 1️⃣ 일단 UI에서 먼저 반영
    setWishedClassIds(prev => {
      const exists = prev.includes(classId);
      return exists ? prev.filter(id => id !== classId) : [...prev, classId];
    });

    try {
      const isWished = wishedClassIds.includes(classId);
      if (!isWished) {
        await wishlistApi.addToWishlist(classId);
      } else {
        await wishlistApi.removeFromWishlist(classId);
      }
    } catch (err) {
      console.error('[MainPage] 찜 토글 처리 실패:', err);
    } finally {
      // 2️⃣ 최종적으로 서버에서 다시 정합성 확인
      try {
        const updated = await wishlistApi.getMyWishlist();
        setWishedClassIds(updated.map(item => item.classId));
        console.log('[MainPage] 서버에서 최신 찜 목록 동기화 완료');
      } catch (syncErr) {
        console.error('[MainPage] 찜 목록 재동기화 실패:', syncErr);
      }
      isProcessingWishRef.current = false;
    }
  };

  const onToggleCart = (id: number) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.classId === id);
      return exists
        ? prev.filter((item) => item.classId !== id)
        : [...prev, { classId: id, cartItemId: -1 }]; // -1: 등록 후 새로 불러옴 필요
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  
    console.log('[MainPage] 현재 accessToken:', token);
  
    if (token) {
      // 🔥 찜 목록 가져오기
      wishlistApi.getMyWishlist()
        .then((wishlist) => {
          const ids = wishlist.map((item) => item.classId); // ✅ 수정됨: item.classId → item.id
          console.log('[MainPage] 찜 목록 로드 성공:', ids);
          setWishedClassIds(ids);
        })
        .catch((err) => {
          console.error('[MainPage] 찜 목록 로드 실패:', err);
          setWishedClassIds([]);
        });
  
      // 장바구니 목록 가져오기
      cartApi.getCartItems()
        .then(cartResponse => {
          const items = cartResponse.cartItems.map(item => ({
            classId: item.classId,
            cartItemId: item.cartItemId,
          }));
          setCartItems(items);
        })
        .catch((err) => {
          console.error('장바구니 목록 로드 실패:', err);
          setCartItems([]);
        });
    }
  
    // 리뷰 요약 가져오기
    axiosInstance.get('/main/reviews/summary')
      .then(res => {
        setReviewSummaryCards(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('리뷰 요약 로드 실패:', err);
        setReviewSummaryCards([]);
      });
  
    // 인기 클래스 가져오기
    axiosInstance.get('/main/popular')
      .then(res => setPopularClasses(mapClassData(res.data)))
      .catch((err) => {
        console.error('인기 클래스 로드 실패:', err);
        setPopularClasses([]);
      });
  
    // 최신 클래스 가져오기
    axiosInstance.get('/main/latest')
      .then(res => setRecentClasses(mapClassData(res.data)))
      .catch((err) => {
        console.error('최신 클래스 로드 실패:', err);
        setRecentClasses([]);
      });
  
    // 무료 클래스 가져오기
    axiosInstance.get('/main/classes/free')
      .then(res => setFreeClasses(mapClassData(res.data)))
      .catch((err) => {
        console.error('무료 클래스 로드 실패:', err);
        setFreeClasses([]);
      });
  
    // 추천 클래스 가져오기
    if (token) {
      axiosInstance.get('/main/recommend')
        .then(res => setRecommendedClasses(mapClassData(res.data)))
        .catch((err) => {
          console.error('추천 클래스 로드 실패:', err);
          setRecommendedClasses([]);
        });
    } else {
      setRecommendedClasses([]);
    }
  }, []);

  const cartClassIds = cartItems.map((item) => item.classId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full mx-auto px-4 py-8">
        {isLoggedIn && (
          <RecommendedSection
            classes={recommendedClasses}
            onToggleWish={onToggleWish}
            onToggleCart={onToggleCart}
            wishedClassIds={wishedClassIds}
            isInCartList={cartClassIds}
            cartItems={cartItems}
          />
        )}
        <PopularSection
          classes={popularClasses}
          onToggleWish={onToggleWish}
          onToggleCart={onToggleCart}
          wishedClassIds={wishedClassIds}
          isInCartList={cartClassIds}
          cartItems={cartItems}
        />
        <RecentSection
          classes={recentClasses}
          onToggleWish={onToggleWish}
          onToggleCart={onToggleCart}
          wishedClassIds={wishedClassIds}
          isInCartList={cartClassIds}
          cartItems={cartItems}
        />
        <ReviewSummarySection reviews={reviewSummaryCards} />
        <FreeClassSection
          classes={freeClasses}
          onToggleWish={onToggleWish}
          onToggleCart={onToggleCart}
          wishedClassIds={wishedClassIds}
          isInCartList={cartClassIds}
          cartItems={cartItems}
        />
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;
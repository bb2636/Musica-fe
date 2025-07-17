import React, { useEffect, useState } from 'react';
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
// import axiosInstance from '../apis/axiosInstance';
import type { MainpageClassItem } from '../types/MainpageClassItem';
import axiosInstance from '../apis/axiosInstance';
import RecommendedSection from '../components/mainpage/RecommendedSection.tsx';
import PopularSection from '../components/mainpage/PopularSection.tsx';
import RecentSection from '../components/mainpage/RecentSection.tsx';
import ReviewSummarySection from '../components/mainpage/ReviewSummarySection';
import type { ReviewSummaryCard } from '../types/ReviewSummaryCard';

// 카테고리 아이콘 예시 (실제 프로젝트에서는 아이콘 라이브러리 사용 권장)
// const categoryIcons = [
//   <span role="img" aria-label="기타">🎸</span>,
//   <span role="img" aria-label="피아노">🎹</span>,
//   <span role="img" aria-label="드럼">🥁</span>,
//   <span role="img" aria-label="보컬">🎤</span>,
//   <span role="img" aria-label="바이올린">🎻</span>,
//   <span role="img" aria-label="작곡">🎼</span>,
// ];

const MainPage: React.FC = () => {
  const [recommendedClasses, setRecommendedClasses] = useState<MainpageClassItem[]>([]);
  const [popularClasses, setPopularClasses] = useState<MainpageClassItem[]>([]);
  const [recentClasses, setRecentClasses] = useState<MainpageClassItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [wishedClassIds, setWishedClassIds] = useState<number[]>([]);
  const [reviewSummaryCards, setReviewSummaryCards] = useState<ReviewSummaryCard[]>([]);

  // ✅ 공통 헬퍼 함수 정의
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
      studentCount: item.studentCount ?? 0, // 서버에서 빠졌을 경우 대비
    }));
  };
  // 찜 토글 핸들러
  const onToggleWish = (id: number) => {
    setWishedClassIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };
  // 장바구니 추가 핸들러 (예시: alert)
  const onAddToCart = (id: number) => {
    alert('장바구니에 담았습니다! (id: ' + id + ')');
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    // 후기 요약 데이터 요청
    axiosInstance.get('/main/reviews/summary')
      .then(res => {
        setReviewSummaryCards(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setReviewSummaryCards([]));

    // 추천클래스(로그인유저만)
    if (token) {
      axiosInstance.get('/main/recommend')
      .then((res) => {
        const mapped = mapClassData(res.data);
        setRecommendedClasses(mapped);
      })
      .catch(() => setRecommendedClasses([]));
    } else {
      setRecommendedClasses([]);
    }

    // ✅ 인기 클래스 (로그인 상관없이 항상)
    axiosInstance.get('/main/popular')
    .then((res) => {
      const mapped = mapClassData(res.data);
      setPopularClasses(mapped);
    })
    .catch(() => setPopularClasses([]));

    // ✅ 최신 클래스
    axiosInstance.get('/main/latest')
    .then((res) => {
      const mapped = mapClassData(res.data);
      setRecentClasses(mapped);
    })
    .catch(() => setRecentClasses([]));
    //나중에 추가: 최근 클래스, 무료 클래스 등도 여기서 fetch 가능
  }, []);
    
    

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <Header />
      {/* 본문 */}
      <main className="flex-1 w-full mx-auto px-4 py-8">
        {/* 추천 클래스 */}
        {isLoggedIn && (
          <RecommendedSection
            classes={recommendedClasses}
            onToggleWish={onToggleWish}
            onAddToCart={onAddToCart}
            wishedClassIds={wishedClassIds}
          />
        )}

        {/* 인기 클래스 */}
        <PopularSection
          classes={popularClasses}
          onToggleWish={onToggleWish}
          onAddToCart={onAddToCart}
          wishedClassIds={wishedClassIds}
        />
        
        {/* 최근 추가된 클래스 */}
        <RecentSection
          classes={recentClasses}
          onToggleWish={onToggleWish}
          onAddToCart={onAddToCart}
          wishedClassIds={wishedClassIds}
        />

        {/* AI 요약 후기 섹션 (항상 렌더링) */}
        <ReviewSummarySection reviews={reviewSummaryCards} />

        {/* 빠른 링크 (와이어프레임 참고, 간단한 예시) */}
        <section className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-2xl mb-2">💬</span>
            <div className="font-semibold text-sm mb-1">메시지</div>
            <div className="text-xs text-gray-400">강사와 학생들과 소통하기</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-2xl mb-2">📚</span>
            <div className="font-semibold text-sm mb-1">학습 자료</div>
            <div className="text-xs text-gray-400">악보, 연습 가이드 및 이론 자료</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-2xl mb-2">📈</span>
            <div className="font-semibold text-sm mb-1">학습 진도</div>
            <div className="text-xs text-gray-400">나의 학습 진도 상태 확인하기</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-2xl mb-2">⚙️</span>
            <div className="font-semibold text-sm mb-1">설정</div>
            <div className="text-xs text-gray-400">계정 및 알림 설정 관리하기</div>
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
};

export default MainPage; 
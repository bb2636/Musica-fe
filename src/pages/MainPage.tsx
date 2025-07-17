import React, { useEffect, useState } from 'react';
import CategoryCard from '../components/CategoryCard';
import type { CategoryItem } from '../types/CategoryItem.ts';
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
// import axiosInstance from '../apis/axiosInstance';
import type { MainpageClassItem } from '../types/MainpageClassItem';
import axiosInstance from '../apis/axiosInstance';
import SearchBar from '../components/SearchBar.tsx';
import RecommendedSection from '../components/mainpage/RecommendedSection.tsx';
import PopularSection from '../components/mainpage/PopularSection.tsx';
import RecentSection from '../components/mainpage/RecentSection.tsx';

// 카테고리 아이콘 예시 (실제 프로젝트에서는 아이콘 라이브러리 사용 권장)
const categoryIcons = [
  <span role="img" aria-label="기타">🎸</span>,
  <span role="img" aria-label="피아노">🎹</span>,
  <span role="img" aria-label="드럼">🥁</span>,
  <span role="img" aria-label="보컬">🎤</span>,
  <span role="img" aria-label="바이올린">🎻</span>,
  <span role="img" aria-label="작곡">🎼</span>,
];



const MOCK_CATEGORIES = [
  { id: 1, name: '기타', icon: categoryIcons[0], classCount: 124 },
  { id: 2, name: '피아노', icon: categoryIcons[1], classCount: 98 },
  { id: 3, name: '드럼', icon: categoryIcons[2], classCount: 76 },
  { id: 4, name: '보컬', icon: categoryIcons[3], classCount: 82 },
  { id: 5, name: '바이올린', icon: categoryIcons[4], classCount: 65 },
  { id: 6, name: '작곡', icon: categoryIcons[5], classCount: 54 },
];



const MainPage: React.FC = () => {
  const [recommendedClasses, setRecommendedClasses] = useState<MainpageClassItem[]>([]);
  const [popularClasses, setPopularClasses] = useState<MainpageClassItem[]>([]);
  const [recentClasses, setRecentClasses] = useState<MainpageClassItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    // 추천클래스(로그인유저만)
    if (token) {
      axiosInstance.get('/main/recommend')
        .then(res => {
          // console.log('✅ 추천 클래스 응답:', res.data);
          const data = res.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            rating: item.rating,
            tag: item.categoryName, // alias로 추가
            thumbnailUrl: item.thumbnailUrl,
            instructor: item.instructor, // 없으면 undefined
            ratingCount: item.ratingCount,
            originalPrice: item.originalPrice,
          }));
          console.log('매핑 후 recommendedClasses:', data);
          setRecommendedClasses(data);
        })
        .catch(() => setRecommendedClasses([]));
    } else {
      setRecommendedClasses([]);
    }

    // ✅ 인기 클래스 (로그인 상관없이 항상)
    axiosInstance.get('/main/popular')
      .then(res => {
        const data = res.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          rating: item.rating,
          tag: item.categoryName, // alias로 추가
          thumbnailUrl: item.thumbnailUrl,
          instructor: item.instructor,
          ratingCount: item.ratingCount,
          originalPrice: item.originalPrice,
        }));
        setPopularClasses(data);
      })
      .catch(() => setPopularClasses([]));

    // ✅ 최신 클래스
    axiosInstance.get('/main/latest')
    .then(res => {
      const data = res.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        rating: item.rating,
        tag: item.categoryName, // alias
        categoryName: item.categoryName, // 타입 충족
        thumbnailUrl: item.thumbnailUrl,
        instructor: item.instructor,
        ratingCount: item.ratingCount,
        originalPrice: item.originalPrice,
      }));
      setRecentClasses(data);
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
        {isLoggedIn && <RecommendedSection classes={recommendedClasses} />}

        {/* 인기 클래스 */}
        <PopularSection classes={popularClasses} />
        
        {/* 인기 카테고리 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">인기 카테고리</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map(cat => (
              <CategoryCard key={cat.id} {...cat} />
            ))}
          </div>
        </section>
        {/* 최근 추가된 클래스 */}
        <RecentSection classes={recentClasses} />

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
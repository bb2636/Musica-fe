import React, { useEffect, useState } from 'react';
import ClassCard from '../components/ClassCard';
import CategoryCard from '../components/CategoryCard';
import type { CategoryItem } from '../types/CategoryItem.ts';
import type { ClassItem } from '../types/ClassItem.ts';
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
// import axiosInstance from '../apis/axiosInstance';

// 카테고리 아이콘 예시 (실제 프로젝트에서는 아이콘 라이브러리 사용 권장)
const categoryIcons = [
  <span role="img" aria-label="기타">🎸</span>,
  <span role="img" aria-label="피아노">🎹</span>,
  <span role="img" aria-label="드럼">🥁</span>,
  <span role="img" aria-label="보컬">🎤</span>,
  <span role="img" aria-label="바이올린">🎻</span>,
  <span role="img" aria-label="작곡">🎼</span>,
];

// 🔥 MOCK DATA (API 서버 미사용 시)
const MOCK_RECOMMENDED_CLASSES = [
  {
    id: 1,
    title: '클래식 기타 마스터 클래스: 초급부터 마스터까지',
    instructor: '김민준 교수',
    price: 249000,
    originalPrice: 299000,
    rating: 4.9,
    ratingCount: 128,
    tag: '기타',
    thumbnailUrl: '',
  },
  {
    id: 2,
    title: '바이올린 테크닉 마스터',
    instructor: '이재민 강사',
    price: 180000,
    rating: 4.7,
    ratingCount: 86,
    tag: '바이올린',
    thumbnailUrl: '',
  },
  {
    id: 3,
    title: '고급 피아노 테크닉',
    instructor: '한지혜 교수',
    price: 220000,
    originalPrice: 250000,
    rating: 4.8,
    ratingCount: 112,
    tag: '피아노',
    thumbnailUrl: '',
  },
  {
    id: 4,
    title: '드럼 기초 마스터하기',
    instructor: '채현 김 강사',
    price: 150000,
    rating: 4.6,
    ratingCount: 94,
    tag: '드럼',
    thumbnailUrl: '',
  },
  {
    id: 5,
    title: '보컬 입문자를 위한 실전 클래스',
    instructor: '박소연 강사',
    price: 130000,
    rating: 4.5,
    ratingCount: 77,
    tag: '보컬',
    thumbnailUrl: '',
  },
];

const MOCK_CATEGORIES = [
  { id: 1, name: '기타', icon: categoryIcons[0], classCount: 124 },
  { id: 2, name: '피아노', icon: categoryIcons[1], classCount: 98 },
  { id: 3, name: '드럼', icon: categoryIcons[2], classCount: 76 },
  { id: 4, name: '보컬', icon: categoryIcons[3], classCount: 82 },
  { id: 5, name: '바이올린', icon: categoryIcons[4], classCount: 65 },
  { id: 6, name: '작곡', icon: categoryIcons[5], classCount: 54 },
];

const MOCK_RECENT_CLASSES = [
  {
    id: 11,
    title: '플루트 톤 개발 마스터',
    instructor: '유나 박 강사',
    price: 160000,
    rating: 4.8,
    ratingCount: 32,
    tag: '플루트',
    thumbnailUrl: '',
  },
  {
    id: 12,
    title: '그룹 피아노 초보자 과정',
    instructor: '선호 이 강사',
    price: 120000,
    rating: 4.7,
    ratingCount: 18,
    tag: '피아노',
    thumbnailUrl: '',
  },
  {
    id: 13,
    title: '음악 이론 마스터 클래스',
    instructor: '이한준 교수',
    price: 180000,
    originalPrice: 220000,
    rating: 4.9,
    ratingCount: 24,
    tag: '이론',
    thumbnailUrl: '',
  },
  {
    id: 14,
    title: '작곡가를 위한 미디 입문',
    instructor: '정우성 강사',
    price: 145000,
    rating: 4.6,
    ratingCount: 41,
    tag: '작곡',
    thumbnailUrl: '',
  },
  {
    id: 15,
    title: '보컬 고급 테크닉 집중반',
    instructor: '이수진 강사',
    price: 170000,
    rating: 4.8,
    ratingCount: 29,
    tag: '보컬',
    thumbnailUrl: '',
  },
];

const MainPage: React.FC = () => {
  const [recommendedClasses, setRecommendedClasses] = useState<ClassItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [recentClasses, setRecentClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    // 실제 API 연동 코드 (서버 403 등으로 인해 현재는 주석 처리)
    // axiosInstance.get('/api/main/recommended').then(res => setRecommendedClasses(res.data));
    // axiosInstance.get('/api/main/categories').then(res => setCategories(res.data));
    // axiosInstance.get('/api/main/recent').then(res => setRecentClasses(res.data));

    // MOCK 데이터로만 세팅
    setRecommendedClasses(MOCK_RECOMMENDED_CLASSES);
    setCategories(MOCK_CATEGORIES);
    setRecentClasses(MOCK_RECENT_CLASSES);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header/>
      {/* 본문 */}
      <main className="flex-1 w-full mx-auto px-4 py-8">
        {/* 추천 클래스 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">추천 클래스</h2>
            <button className="text-xs text-gray-500 border px-2 py-1 rounded">정렬: 인기순</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommendedClasses.map(item => (
              <ClassCard key={item.id} {...item} />
            ))}
          </div>
        </section>

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
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">최근 추가된 클래스</h2>
            <button className="text-xs text-blue-600 hover:underline">모두 보기</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentClasses.map(item => (
              <ClassCard key={item.id} {...item} />
            ))}
          </div>
        </section>

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
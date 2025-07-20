// src/components/mainpage/PopularSection.tsx
import React from 'react';
import SwiperSection from './SwiperSection';
import ClassCard from './ClassCard';
import type { MainpageClassItem } from '../../types/MainpageClassItem';

interface Props {
  classes: MainpageClassItem[];
  onToggleWish: (id: number) => void;
  onAddToCart: (id: number) => void;
  wishedClassIds: number[];
}

const PopularSection: React.FC<Props> = ({ classes, onToggleWish, onAddToCart, wishedClassIds }) => {
  const cardElements = classes
    .filter(item => item && item.id && item.title) // 필수값 확인
    .map((item, idx) => (
      <ClassCard
        key={`${item.id}-${idx}`}
        id={item.id}
        title={item.title ?? '제목 없음'}
        instructor={item.instructor ?? '미정'}
        price={item.price ?? 0}
        originalPrice={item.originalPrice}
        rating={item.rating ?? 5}
        ratingCount={item.ratingCount ?? 0}
        tag={item.tag ?? item.categoryName ?? '기타'}
        thumbnailUrl={item.thumbnailUrl ?? '/no-image.png'}
        onToggleWish={onToggleWish}
        onAddToCart={onAddToCart}
        isWished={wishedClassIds.includes(item.id)}
        wishlistCount={item.wishlistCount ?? 0}
      />
    ));

  return (
    <SwiperSection title={<><span role="img" aria-label="인기"></span> 인기 클래스</>} moreLink="/classes/popular">
      {cardElements}
    </SwiperSection>
  );
};

export default PopularSection;

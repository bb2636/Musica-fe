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

const RecentSection: React.FC<Props> = ({ classes, onToggleWish, onAddToCart, wishedClassIds }) => {
  // ✅ 카드 리스트 준비
  const cardElements = classes
    .filter(item => item && item.id)
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
      />
    ));

  return (
    <SwiperSection title={<><span role="img" aria-label="최근">🆕</span> 최신 클래스</>} moreLink="/classes/recent">
      {cardElements}
    </SwiperSection>
  );
};

export default RecentSection;

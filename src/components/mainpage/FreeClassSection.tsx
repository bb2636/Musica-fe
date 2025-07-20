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

const FreeClassSection: React.FC<Props> = ({ classes, onToggleWish, onAddToCart, wishedClassIds }) => {
  return (
    <SwiperSection title={<><span role="img" aria-label="무료"></span> 무료 클래스</>} moreLink="/classes/free">
      {classes && classes.length > 0 ? (
        classes.map((item) => (
          <ClassCard
            key={item.id}
            id={item.id}
            title={item.title}
            instructor={item.instructor || '미정'}
            price={item.price}
            originalPrice={item.originalPrice}
            rating={item.rating}
            ratingCount={item.ratingCount ?? 0}
            tag={item.tag || item.categoryName}
            thumbnailUrl={item.thumbnailUrl || undefined}
            onToggleWish={onToggleWish}
            onAddToCart={onAddToCart}
            isWished={wishedClassIds.includes(item.id)}
            wishlistCount={item.wishlistCount ?? 0}
          />
        ))
      ) : null}
    </SwiperSection>
  );
};

export default FreeClassSection; 
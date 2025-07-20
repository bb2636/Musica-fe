import React from 'react';
import SwiperSection from './SwiperSection';
import ClassCard from './ClassCard';
import type { MainpageClassItem } from '../../types/MainpageClassItem';
import type { CartItemInfo } from '../../types/CartItemInfo';

interface Props {
  classes: MainpageClassItem[];
  onToggleWish: (id: number) => void;
  onToggleCart: (id: number) => void;
  wishedClassIds: number[];
  isInCartList: number[];
  cartItems: CartItemInfo[];
}

const PopularSection: React.FC<Props> = ({
  classes,
  onToggleWish,
  onToggleCart,
  wishedClassIds,
  isInCartList,
  cartItems,
}) => {
  const cardElements = classes.filter(item => item && item.id).map((item, idx) => (
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
      onToggleCart={onToggleCart}
      isInCart={isInCartList.includes(item.id)}
      wishlistCount={item.wishlistCount ?? 0}
      cartItems={cartItems}
      wishedClassIds={wishedClassIds}
    />
  ));

  return (
    <SwiperSection title={<><span role="img" aria-label="인기"></span> 인기 클래스</>} moreLink="/classes/popular">
      {cardElements}
    </SwiperSection>
  );
};

export default PopularSection;
import React from "react";
import SwiperSection from "./SwiperSection";
import ClassCard from "./ClassCard";
import type { MainpageClassItem } from "../../types/MainpageClassItem";

interface Props {
  classes: MainpageClassItem[];
  onToggleWish: (id: number, isWished: boolean) => void;
  onToggleCart: (id: number, isInCart: boolean) => void;
  wishedClassIds: number[];
  isInCartList: number[];
  isProcessingWishSet?: Set<number>;
  isProcessingCartSet?: Set<number>;
  paidClassIds: number[]; // ✅ 전달받음
  wishlistCounts: Record<number, number>; // 찜 수 상태 추가
}

const PopularSection: React.FC<Props> = ({
  classes,
  onToggleWish,
  onToggleCart,
  wishedClassIds,
  isInCartList,
  isProcessingWishSet,
  isProcessingCartSet,
  paidClassIds,
  wishlistCounts, // props로 받아오기
}) => {
  return (
    <SwiperSection
      title={
        <>
          <span role="img" aria-label="인기"></span> 인기 클래스
        </>
      }
      moreLink="/classes/popular"
    >
      {classes.map((item) => (
        <ClassCard
          key={item.id}
          id={item.id}
          title={item.title ?? "제목 없음"}
          instructor={item.instructor ?? "미정"}
          price={item.price ?? 0}
          originalPrice={item.originalPrice}
          rating={item.rating ?? 5}
          ratingCount={item.ratingCount ?? 0}
          tag={item.tag ?? item.categoryName ?? '기타'}
          thumbnailUrl={item.thumbnailUrl ?? '/no-image.png'}
          wishlistCount={wishlistCounts[item.id] ?? 0}
          isInCart={isInCartList.includes(item.id)}
          onToggleWish={onToggleWish}
          onToggleCart={onToggleCart}
          wishedClassIds={wishedClassIds}
          isProcessingWishSet={isProcessingWishSet}
          isProcessingCartSet={isProcessingCartSet}
          isPaid={paidClassIds.includes(item.id)} // ✅ 이 부분이 핵심!
        />
      ))}
    </SwiperSection>
  );
};

export default PopularSection;

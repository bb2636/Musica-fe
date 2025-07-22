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
}

const RecentSection: React.FC<Props> = ({
  classes,
  onToggleWish,
  onToggleCart,
  wishedClassIds,
  isInCartList,
  isProcessingWishSet,
  isProcessingCartSet,
  paidClassIds,
}) => {
  return (
    <SwiperSection
      title={
        <>
          <span role="img" aria-label="최신"></span> 최신 클래스
        </>
      }
      moreLink="/classes/recent"
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
          tag={item.tag ?? item.categoryName ?? "기타"}
          thumbnailUrl={item.thumbnailUrl ?? "/no-image.png"}
          wishlistCount={item.wishlistCount ?? 0}
          isInCart={isInCartList.includes(item.id)}
          onToggleWish={onToggleWish}
          onToggleCart={onToggleCart}
          wishedClassIds={wishedClassIds}
          isProcessingWishSet={isProcessingWishSet}
          isProcessingCartSet={isProcessingCartSet}
          isPaid={paidClassIds.includes(item.id)} // ✅ 핵심 포인트!
        />
      ))}
    </SwiperSection>
  );
};

export default RecentSection;

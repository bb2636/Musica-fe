import React, { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import type { ReviewSummaryCard as ReviewSummaryCardType } from '../../types/ReviewSummaryCard';
import ReviewSummaryCard from './ReviewSummaryCard';

interface Props {
  reviews: ReviewSummaryCardType[];
}

const ReviewSummarySection: React.FC<Props> = ({ reviews }) => {
  const swiperRef = useRef<SwiperClass>(null); // ✅ SwiperRef로 변경

  const handlePrev = () => swiperRef.current?.slidePrev();
  const handleNext = () => swiperRef.current?.slideNext();

  useEffect(() => {
    swiperRef.current?.update();
  }, [reviews]);

  if (!reviews || reviews.length === 0) {
    return (
      <section className="w-full py-16 bg-[#f9f9f9]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center text-gray-400 py-16">표시할 후기가 없습니다.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 bg-[#f9f9f9]">
      <div className="max-w-[1000px] mx-auto relative">
        {/* ← 버튼 (항상 표시) */}
        <button
          className="absolute z-20 top-1/2 -translate-y-1/2 -left-8 bg-white w-10 h-10 rounded-full shadow flex items-center justify-center"
          onClick={handlePrev}
          aria-label="이전"
          type="button"
        >
          <svg width="20" height="20" fill="none" stroke="gray" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        {/* → 버튼 (항상 표시) */}
        <button
          className="absolute z-20 top-1/2 -translate-y-1/2 -right-8 bg-white w-10 h-10 rounded-full shadow flex items-center justify-center"
          onClick={handleNext}
          aria-label="다음"
          type="button"
        >
          <svg width="20" height="20" fill="none" stroke="gray" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
        <div className="overflow-hidden w-full">
          <Swiper
            modules={[Navigation]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            slidesPerView={1}
            slidesPerGroup={1}
            spaceBetween={0}
            loop={false}
            watchSlidesProgress
            watchOverflow={false}
            className="w-full"
          >
            {reviews.map((review, idx) => (
              <SwiperSlide key={review.classId + '-' + idx} className="!w-full flex justify-center">
                <ReviewSummaryCard review={review} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default ReviewSummarySection; 
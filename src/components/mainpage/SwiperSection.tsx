// src/components/mainpage/SwiperSection.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface SwiperSectionProps {
  title: React.ReactNode;
  moreLink?: string;
  children: React.ReactNode; // 단일 노드든 배열이든 허용
}

const SwiperSection: React.FC<SwiperSectionProps> = ({ title, moreLink, children }) => {
  const swiperRef = useRef<any>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // swiper 상태 갱신 핸들러
  const handlePrev = () => swiperRef.current?.slidePrev();
  const handleNext = () => swiperRef.current?.slideNext();
  const handleSlideChange = (swiper: any) => {
    setIsAtStart(swiper.isBeginning);
    setIsAtEnd(swiper.isEnd);
  };

  // children이 바뀔 때 swiper update
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.update();
    }
  }, [children]);

  // 개발 디버깅용 로그
  // if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  //   const count = React.Children.count(children);
  //   console.log('🌸 렌더링 예정 카드 개수:', count);
  //   React.Children.forEach(children, (child, i) => console.log('child', i, child));
  // }

  const validChildren = React.Children.toArray(children).filter(Boolean); // 빈 children 제거
  const childCount = validChildren.length;

  if (childCount === 0) {
    return (
      <section className="w-full py-8 text-center text-gray-400">
        <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>
        <p>표시할 클래스가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="w-full py-8 relative z-10">
      {/* 섹션 제목 + 더 보기 */}
      <div className="flex items-center justify-between mb-4 px-4 max-w-[1200px] mx-auto">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        {moreLink && (
          <a href={moreLink} className="text-blue-600 text-xs md:text-sm hover:underline">
            더 보기
          </a>
        )}
      </div>

      {/* 슬라이더 전체 wrapper */}
      <div className="relative max-w-[1200px] mx-auto px-4">
        {!isAtStart && (
          <button
            className="absolute z-20 top-1/2 -translate-y-1/2 -left-6 bg-white shadow rounded-full w-10 h-10 flex items-center justify-center"
            onClick={handlePrev}
            aria-label="이전"
            type="button"
          >
            <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {!isAtEnd && (
          <button
            className="absolute z-20 top-1/2 -translate-y-1/2 -right-6 bg-white shadow rounded-full w-10 h-10 flex items-center justify-center"
            onClick={handleNext}
            aria-label="다음"
            type="button"
          >
            <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}

        <div className="overflow-hidden relative z-10">
          <Swiper
            modules={[Navigation]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsAtStart(swiper.isBeginning);
              setIsAtEnd(swiper.isEnd);
            }}
            onSlideChange={handleSlideChange}
            slidesPerView={5}
            slidesPerGroup={5}
            spaceBetween={24}
            loop={false}
            watchSlidesProgress
            watchOverflow={false}
            className="w-full"
            breakpoints={{
              1025: { slidesPerView: 5, slidesPerGroup: 5 },
              769: { slidesPerView: 3, slidesPerGroup: 3 },
              641: { slidesPerView: 2, slidesPerGroup: 2 },
              0: { slidesPerView: 1, slidesPerGroup: 1 },
            }}
          >
            {React.Children.map(children, (child, idx) => (
              <SwiperSlide key={idx} className="!w-[260px] shrink-0">
                <div className="w-full">{child}</div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>

  );
};

export default SwiperSection;
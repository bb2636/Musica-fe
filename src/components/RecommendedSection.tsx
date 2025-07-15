import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ClassCard from './ClassCard';
import type { MainpageClassItem } from '../types/MainpageClassItem';

interface RecommendedSectionProps {
  classes: MainpageClassItem[];
}

const RecommendedSection: React.FC<RecommendedSectionProps> = ({ classes }) => {
  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">추천 클래스 🎉</h2>
        <button className="text-blue-600 font-semibold hover:underline">더 보기</button>
      </div>
      <Swiper
        modules={[Navigation]}
        slidesPerView={4}
        spaceBetween={16}
        navigation
      >
        {classes.map((item) => (
          <SwiperSlide key={item.id}>
            <ClassCard
              id={item.id}
              title={item.title}
              instructor={item.instructor || '미정'}
              price={item.price}
              originalPrice={item.originalPrice}
              rating={item.rating}
              ratingCount={item.ratingCount ?? 0}
              tag={item.categoryName}
              thumbnailUrl={item.thumbnailUrl || undefined}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default RecommendedSection; 
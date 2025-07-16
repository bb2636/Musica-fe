// src/components/PopularSection.tsx
import React from 'react';
import ClassCard from '../ClassCard';
import type { MainpageClassItem } from '../../types/MainpageClassItem';

interface Props {
  classes: MainpageClassItem[];
}

const PopularSection: React.FC<Props> = ({ classes }) => {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🔥 인기 클래스</h2>
        <button className="text-xs text-blue-600 hover:underline">모두 보기</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {classes.map((item) => (
          <ClassCard
            key={item.id}
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
        ))}
      </div>
    </section>
  );
};

export default PopularSection;

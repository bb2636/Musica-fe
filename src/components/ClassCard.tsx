import React from 'react';

interface ClassCardProps {
  id: number;
  title: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  tag: string;
  thumbnailUrl?: string;
}

const ClassCard: React.FC<ClassCardProps> = ({
  title,
  instructor,
  price,
  originalPrice,
  rating,
  ratingCount,
  tag,
  thumbnailUrl,
}) => {
  return (
    <div className="w-64 bg-white rounded-xl shadow p-4 flex flex-col justify-between min-h-[260px]">
      <div>
        <div className="text-xs text-blue-600 font-semibold mb-1">{tag}</div>
        <div className="font-bold text-base mb-1 line-clamp-2 min-h-[40px]">{title}</div>
        <div className="text-xs text-gray-500 mb-2">{instructor}</div>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({ratingCount})</span>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex items-end gap-2">
          <span className="text-lg font-bold text-gray-900">₩{price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-xs text-gray-400 line-through">₩{originalPrice.toLocaleString()}</span>
          )}
        </div>
        <button className="w-full mt-3 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">자세히 보기</button>
      </div>
    </div>
  );
};

export default ClassCard; 
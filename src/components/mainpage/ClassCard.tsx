// src/components/mainpage/ClassCard.tsx
import React from 'react';

interface ClassCardProps {
  id: number;
  title: string;
  instructor?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount?: number;
  tag?: string;
  thumbnailUrl?: string | null;
  onToggleWish: (id: number) => void;
  onAddToCart: (id: number) => void;
  isWished?: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({
  id,
  title,
  instructor,
  price,
  originalPrice,
  rating,
  ratingCount,
  tag,
  thumbnailUrl,
  onToggleWish,
  onAddToCart,
  isWished = false,
}) => {
    if (!title || price === undefined || rating === undefined) {
        console.warn('🚨 렌더링 스킵된 카드:', { id, title, price, rating });
      }
  return (
    <div className="relative w-full h-[350px] bg-white rounded-xl shadow hover:scale-[1.02] transition-transform duration-150 flex flex-col overflow-hidden">
      <div className="flex-[7] aspect-[4/3] h-[190px] min-h-[180px] max-h-[210px] relative bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
        <div className="absolute top-2 right-2 z-10 flex gap-2 pr-2">
          <button onClick={e => { e.stopPropagation(); onToggleWish(id); }}
                  className="bg-white/80 rounded-full p-1 shadow hover:bg-blue-100 transition"
                  aria-label="찜하기">
            {isWished ? (
              <svg width="22" height="22" fill="#2563eb" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            )}
          </button>
          <button onClick={e => { e.stopPropagation(); onAddToCart(id); }}
                  className="bg-white/80 rounded-full p-1 shadow hover:bg-green-100 transition"
                  aria-label="장바구니">
            <svg width="22" height="22" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-[3] flex flex-col justify-end p-4 gap-2 bg-white min-h-[90px]">
        {tag && <div className="text-xs text-blue-600 font-semibold mb-1">{tag}</div>}
        <div className="font-bold text-base mb-1 line-clamp-2 min-h-[40px]">{title}</div>
        {instructor && <div className="text-xs text-gray-500 mb-2">{instructor}</div>}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-sm font-semibold">{(rating ?? 5).toFixed(1)}</span>
          <span className="text-xs text-gray-400">({ratingCount ?? 0})</span>
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <span className="text-lg font-bold text-gray-900">₩{(price ?? 0).toLocaleString()}</span>
          {originalPrice && (
            <span className="text-xs text-gray-400 line-through">₩{originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassCard;

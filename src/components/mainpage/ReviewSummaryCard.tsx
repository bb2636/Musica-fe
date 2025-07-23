import React from 'react';
import type { ReviewSummaryCard as ReviewSummaryCardType } from '../../types/ReviewSummaryCard';

interface Props {
  review: ReviewSummaryCardType;
}

const ReviewSummaryCard: React.FC<Props> = ({ review }) => {
  return (
    <div className="w-full max-w-[800px] max-w-[90%] mx-auto bg-white px-8 py-10 rounded-xl shadow text-center flex flex-col items-center border border-neutral-200 font-sans">
      {/* summary - 가장 강조 */}
      <div className="text-xl font-semibold text-black mb-6">{review.summary}</div>
      {/* 별점 */}
      <div className="flex items-center justify-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="w-7 h-7"
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{ color: '#ff4d4f' }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
          </svg>
        ))}
      </div>
      {/* 클래스명 + 난이도 */}
      <div className="text-pink-600 font-semibold mb-4 text-base">
        {review.classTitle} <span className="text-base text-gray-500">[{review.levelName}]</span>
      </div>
      {/* 원본 후기 */}
      <div className="text-base text-gray-800 mb-6">{review.rawComment}</div>
      {/* 작성자 */}
      <div className="text-base text-gray-800">- {review.maskedUsername} -</div>
    </div>
  );
};

export default ReviewSummaryCard; 
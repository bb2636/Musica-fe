import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  onToggleWish: (id: number, isWished: boolean) => void;
  wishlistCount?: number;
  isInCart?: boolean;
  onToggleCart: (id: number, isInCart: boolean) => void;
  wishedClassIds: number[];
  isPaid?: boolean; // ✅ 여기만 남기고
  isProcessingWishSet?: Set<number>;
  isProcessingCartSet?: Set<number>;
}

const ClassCard: React.FC<ClassCardProps> = ({
  id,
  title,
  instructor,
  price,
  originalPrice,
  rating,
  ratingCount = 0,
  tag,
  thumbnailUrl,
  onToggleWish,
  wishlistCount = 0,
  isInCart = false,
  onToggleCart,
  wishedClassIds,
  isPaid = false, // ✅ 기본값 false
  isProcessingWishSet,
  isProcessingCartSet,
}) => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));
  const isWished = wishedClassIds.includes(id);
  const isProcessingCart = isProcessingCartSet?.has(id) ?? false;

  const [isProcessingWish, setIsProcessingWish] = useState(false);

  const handleToggleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) return navigate("/auth");
    if (isProcessingCart) return;
    onToggleCart(id, isInCart);
  };

  const handleToggleWish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) return navigate("/auth");
    if (isProcessingWish || isProcessingWishSet?.has(id)) return;

    setIsProcessingWish(true);
    try {
      await onToggleWish(id, isWished);
    } finally {
      setIsProcessingWish(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/classes/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative w-full h-[350px] bg-white rounded-xl shadow hover:scale-[1.02] transition-transform duration-150 flex flex-col overflow-hidden cursor-pointer"
    >
      <div className="flex-[7] aspect-[4/3] h-[190px] relative bg-gray-100 flex items-center justify-center rounded-t-xl overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
      </div>

      <div className="flex-[3] p-4 flex flex-col justify-end bg-white gap-2 min-h-[90px]">
        {tag && (
          <div className="text-xs text-blue-600 font-semibold">{tag}</div>
        )}
        <div className="font-bold text-base line-clamp-2">{title}</div>
        {instructor && (
          <div className="text-xs text-gray-500">{instructor}</div>
        )}
        <div className="text-xs text-gray-500">❤️ {wishlistCount}명 찜</div>
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <span className="text-yellow-400">★</span>
          <span>{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({ratingCount})</span>
        </div>

        <div className="flex justify-between items-end mt-auto">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              ₩{price.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-xs line-through text-gray-400">
                ₩{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {/* ❤️ 찜 버튼 */}
            <button
              onClick={handleToggleWish}
              disabled={isProcessingWish || isProcessingWishSet?.has(id)}
              className={`bg-white rounded-full p-1 shadow transition ${
                isWished ? "bg-red-100" : "hover:bg-red-100"
              } ${isProcessingWish ? "opacity-50" : ""}`}
            >
              {isWished ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                  c0-2.54 2.03-4.5 4.5-4.5 1.74 0 3.41 1.01 4.13 2.44
                  C11.09 5.01 12.76 4 14.5 4
                  C16.97 4 19 5.96 19 8.5
                  c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                >
                  <path
                    d="M12.1 8.64l-.1.1-.11-.11C10.14 6.6 7.24 6.6 5.28 8.56
                  c-1.96 1.96-1.96 5.14 0 7.1l6.72 6.73 6.72-6.73
                  c1.96-1.96 1.96-5.14 0-7.1-1.96-1.96-5.14-1.96-7.1 0z"
                  />
                </svg>
              )}
            </button>

            {/* 🛒 장바구니 또는 '이미 결제됨' 버튼 */}
            {isPaid ? (
              <button
                disabled
                className="bg-gray-200 text-gray-500 px-3 py-1 text-sm rounded-full cursor-not-allowed"
              >
                수강중
              </button>
            ) : (
              <button
                onClick={handleToggleCart}
                disabled={isProcessingCart}
                className={`bg-white rounded-full p-1 shadow transition ${
                  isInCart ? "bg-green-100" : "hover:bg-green-100"
                } ${isProcessingCart ? "opacity-50" : ""}`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isInCart ? "#22c55e" : "none"}
                  stroke="#22c55e"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;

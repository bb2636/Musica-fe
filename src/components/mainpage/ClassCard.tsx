import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../../apis/cart';
import { wishlistApi } from '../../apis/WishlistApi';
import type { CartItemInfo } from '../../types/CartItemInfo';

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
  wishlistCount?: number;
  isInCart?: boolean;
  onToggleCart: (id: number) => void;
  cartItems?: CartItemInfo[];
  wishedClassIds: number[];
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
  wishlistCount = 0,
  isInCart = false,
  onToggleCart,
  cartItems = [],
  wishedClassIds,
}) => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));
  const [isProcessingCart, setIsProcessingCart] = useState(false);
  const [isProcessingWish, setIsProcessingWish] = useState(false);

  const handleToggleCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    if (isProcessingCart) return;

    if (isInCart && (!cartItems || cartItems.length === 0)) {
      alert('장바구니 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.');
      return;
    }

    setIsProcessingCart(true);
    try {
      if (!isInCart) {
        await cartApi.addToCart(id);
        alert('장바구니에 담았습니다!');
      } else {
        const found = cartItems.find((item) => item.classId === id);
        if (found) {
          await cartApi.removeFromCart([found.cartItemId]);
          alert('장바구니에서 제거했습니다.');
        } else {
          alert('장바구니 정보가 올바르지 않습니다. 새로고침 후 다시 시도해 주세요.');
          return;
        }
      }
      onToggleCart(id);
    } catch (err) {
      console.error('장바구니 요청 에러:', err);
      alert('장바구니 요청 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingCart(false);
    }
  };

  const handleToggleWish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    if (isProcessingWish) return;
  
    const isWished = wishedClassIds.includes(id); // ✅ 여기를 수정!
  
    console.log(`[ClassCard] 렌더링 id=${id}, isWished=${isWished}`);
  
    setIsProcessingWish(true);
    try {
      if (!isWished) {
        await wishlistApi.addToWishlist(id);
        alert('찜 등록 완료!');
      } else {
        await wishlistApi.removeFromWishlist(id);
        alert('찜 해제 완료!');
      }
      onToggleWish(id);
    } catch (err) {
      console.error('찜 요청 에러:', err);
      alert('찜 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingWish(false);
    }
  };

  // useEffect(() => {
  //   const isWished = wishedClassIds.includes(id);
  //   console.log(`[ClassCard] 렌더링 id=${id}, isWished=${isWished}`);
  // }, [wishedClassIds, id]);

  return (
    <div className="relative w-full h-[350px] bg-white rounded-xl shadow hover:scale-[1.02] transition-transform duration-150 flex flex-col overflow-hidden">
      <div className="flex-[7] aspect-[4/3] h-[190px] relative bg-gray-100 flex items-center justify-center rounded-t-xl overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
        <div className="absolute top-2 right-2 z-10 flex gap-2 pr-2">
          <button
            onClick={handleToggleWish}
            disabled={isProcessingWish}
            className={`bg-white/80 rounded-full p-1 shadow transition ${wishedClassIds.includes(id) ? 'bg-red-100' : 'hover:bg-red-100'} ${isProcessingWish ? 'opacity-50' : ''}`}
          >
            {wishedClassIds.includes(id) ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                  2 6.5 3.5 5 5.5 5c1.54 0 3.04.99 3.57 2.36h1.87
                  C13.46 5.99 14.96 5 16.5 5
                  18.5 5 20 6.5 20 8.5
                  c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                  2 6.5 3.5 5 5.5 5c1.54 0 3.04.99 3.57 2.36h1.87
                  C13.46 5.99 14.96 5 16.5 5
                  18.5 5 20 6.5 20 8.5
                  c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleToggleCart}
            disabled={isProcessingCart}
            className={`bg-white/80 rounded-full p-1 shadow transition ${isInCart ? 'bg-green-100' : 'hover:bg-green-100'} ${isProcessingCart ? 'opacity-50' : ''}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={isInCart ? '#22c55e' : 'none'} stroke="#22c55e" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-[3] p-4 flex flex-col justify-end bg-white gap-2 min-h-[90px]">
        {tag && <div className="text-xs text-blue-600 font-semibold">{tag}</div>}
        <div className="font-bold text-base line-clamp-2">{title}</div>
        {instructor && <div className="text-xs text-gray-500">{instructor}</div>}
        <div className="text-xs text-gray-500">❤️ {wishlistCount}명 찜</div>
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <span className="text-yellow-400">★</span>
          <span>{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({ratingCount})</span>
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <span className="text-lg font-bold text-gray-900">₩{price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-xs line-through text-gray-400">
              ₩{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassCard;

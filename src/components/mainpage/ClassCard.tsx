import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../apis/axiosInstance';

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
  wishlistCount?: number;
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
  wishlistCount = 0,
}) => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('accessToken'));

  const [localWished, setLocalWished] = useState(isWished);
  const [localWishlistCount, setLocalWishlistCount] = useState(wishlistCount);
  const [localInCart, setLocalInCart] = useState(false);

  const handleToggleCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능한 기능입니다.');
      navigate('/auth');
      return;
    }

    try {
      if (!localInCart) {
        const res = await axiosInstance.put('/users/carts', null, {
          params: { classId: id },
        });
        alert(res.data.message);
        setLocalInCart(true);
      } else {
        const res = await axiosInstance.delete('/users/carts', {
          data: { cartItemIds: [id] }, // ✅ 서버 요구사항에 따라 params or body 중 하나로 조정
        });
        alert(res.data.message);
        setLocalInCart(false);
      }
      onAddToCart(id);
    } catch (err: any) {
      alert(err.response?.data?.message || '장바구니 처리 실패');
    }
  };

  const handleToggleWish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능한 기능입니다.');
      navigate('/auth');
      return;
    }

    try {
      if (!localWished) {
        const res = await axiosInstance.post(`/users/wishlists/classes/${id}`);
        alert(res.data.message);
        setLocalWished(true);
        setLocalWishlistCount(prev => prev + 1);
      } else {
        const res = await axiosInstance.delete(`/users/wishlists/classes/${id}`);
        alert(res.data.message);
        setLocalWished(false);
        setLocalWishlistCount(prev => (prev > 0 ? prev - 1 : 0));
      }
      onToggleWish(id);
    } catch (err: any) {
      alert(err.response?.data?.message || '찜 처리 실패');
    }
  };

  return (
    <div className="relative w-full h-[350px] bg-white rounded-xl shadow hover:scale-[1.02] transition-transform duration-150 flex flex-col overflow-hidden">
      {/* 썸네일 */}
      <div className="flex-[7] aspect-[4/3] h-[190px] relative bg-gray-100 flex items-center justify-center rounded-t-xl overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
        <div className="absolute top-2 right-2 z-10 flex gap-2 pr-2">
          {/* 찜 버튼 */}
          <button onClick={handleToggleWish}
                  className={`bg-white/80 rounded-full p-1 shadow transition ${localWished ? 'bg-blue-100' : 'hover:bg-blue-100'}`}>
            {localWished ? (
              <svg width="22" height="22" fill="#2563eb" viewBox="0 0 24 24"><path d="..." /></svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="..." /></svg>
            )}
          </button>
          {/* 장바구니 버튼 */}
          <button onClick={handleToggleCart}
                  className={`bg-white/80 rounded-full p-1 shadow transition ${localInCart ? 'bg-green-100' : 'hover:bg-green-100'}`}>
            {localInCart ? (
              <svg width="22" height="22" fill="#22c55e" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="..." /></svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="..." /></svg>
            )}
          </button>
        </div>
      </div>

      {/* 상세정보 */}
      <div className="flex-[3] p-4 flex flex-col justify-end bg-white gap-2 min-h-[90px]">
        {tag && <div className="text-xs text-blue-600 font-semibold">{tag}</div>}
        <div className="font-bold text-base line-clamp-2">{title}</div>
        {instructor && <div className="text-xs text-gray-500">{instructor}</div>}
        <div className="text-xs text-gray-500">❤️ {localWishlistCount}명 찜</div>
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <span className="text-yellow-400">★</span>
          <span>{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({ratingCount})</span>
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <span className="text-lg font-bold text-gray-900">₩{price.toLocaleString()}</span>
          {originalPrice && <span className="text-xs line-through text-gray-400">₩{originalPrice.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
};

export default ClassCard;

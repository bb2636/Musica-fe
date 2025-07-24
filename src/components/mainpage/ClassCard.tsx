import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";

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
  isProcessingCartSet

}) => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));
  const isWished = wishedClassIds.includes(id);
  const isProcessingCart = isProcessingCartSet?.has(id) ?? false;
  const isProcessingWish = isProcessingWishSet?.has(id) ?? false;
  // const wishlistCount = wishlistCounts[id] ?? 0;

  //const [isProcessingWish, setIsProcessingWish] = useState(false);

  // 장바구니 토글 핸들러 - useCallback으로 메모이제이션 (최적화 적용)
  const handleToggleCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isLoggedIn) {
        const confirmed = window.confirm(
          "장바구니 담기를 이용하려면 로그인이 필요합니다. 로그인하시겠습니까?"
        );
        if (confirmed) navigate("/auth");
        return;
      }
      if (isProcessingCart) return;

      alert(isInCart ? "장바구니에서 제거했습니다." : "장바구니에 담았습니다.");

      console.log("🛒 장바구니 토글 요청:", id, isInCart);
      onToggleCart(id, isInCart);
    },
    [isLoggedIn, isProcessingCart, navigate, id, isInCart, onToggleCart]
  );

  // 찜 토글 핸들러 - useCallback + 낙관적 UI 반영 (최적화 적용)
  const handleToggleWish = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isLoggedIn) {
        const confirmed = window.confirm(
          "찜 등록을 이용하려면 로그인이 필요합니다. 로그인하시겠습니까?"
        );
        if (confirmed) navigate("/auth");
        return;
      }
      //if (isProcessingWish) return;

      // 🔥 여기서 최신값을 다시 계산하도록 변경
      const currentlyWished = wishedClassIds.includes(id); // 최신 상태
      await onToggleWish(id, currentlyWished);
    },
    [isLoggedIn, isProcessingWish, navigate, id, wishedClassIds, onToggleWish]
  );

  const handleCardClick = () => {
    navigate(`/classes/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative flex flex-col transition-shadow duration-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md hover:-translate-y-[1px] transform cursor-pointer h-[400px]"
    >
      {/* 썸네일 */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 w-full h-full flex items-center justify-center">
            No Image
          </div>
        )}
      </div>

      {/* 정보 + 버튼 영역 */}
      <div className="p-4 flex flex-col justify-between flex-1">
        {/* 상단: 카테고리, 제목, 강사, 찜/평점 */}
        <div>
          {tag && (
            <div className="text-xs text-blue-600 font-semibold">{tag}</div>
          )}
          <h3 className="text-base font-semibold leading-tight mt-3 line-clamp-2 break-keep min-h-[48px]">
            {title}
          </h3>
          {/* <h3 className="text-base font-semibold leading-tight mt-3 line-clamp-2 break-keep">
            {title}
          </h3> */}
          {instructor && (
            <div className="text-sm text-gray-500">{instructor}</div>
          )}
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <div>❤️ {wishlistCount}명 찜</div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span>{rating.toFixed(1)}</span>
              <span className="text-gray-400">({ratingCount})</span>
            </div>
          </div>
        </div>

        {/* 하단: 가격 + 버튼 */}
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₩{price.toLocaleString()}
            </span>
            {originalPrice && originalPrice !== price && (
              <span className="text-sm line-through text-gray-400">
                ₩{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <button onClick={handleToggleWish} type="button">
              {isWished ? (
                <SolidHeartIcon className="w-5 h-5 text-red-500" />
              ) : (
                <OutlineHeartIcon className="w-5 h-5 text-red-500" />
              )}
            </button>
            {isPaid ? (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 border border-gray-300 rounded-full whitespace-nowrap">
                수강 중
              </span>
            ) : (
              <button onClick={handleToggleCart} type="button">
                {isInCart ? (
                  <ShoppingCart className="w-5 h-5 text-blue-600 fill-blue-600" />
                ) : (
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;

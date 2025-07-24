import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { wishlistApi } from "../../../apis/WishlistApi";

interface WishlistItem {
  classId: number; // ✅ 클래스 고유 ID
  title: string;
  thumbnailUrl?: string;
  price: number;
  instructorName: string;
  categoryName: string;
}

export default function MyWishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const response = await wishlistApi.getMyWishlist();
        setWishlist(response); // 이미 가공된 배열
      } catch (err) {
        setError("찜 목록을 불러오는데 실패했습니다.");
        console.error("찜 목록 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  // ✅ 찜 해제 핸들러 추가
  const handleRemove = async (classId: number) => {
    try {
      await wishlistApi.removeFromWishlist(classId);
      setWishlist((prev) => prev.filter((item) => item.classId !== classId)); // ✅ UI 갱신
    } catch (error) {
      console.error("찜 해제 실패:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">찜 목록을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen py-8 px-2 md:px-0 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black">찜 목록</h2>
        <span className="text-gray-500">총 {wishlist.length}개</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❤️</div>
          <div className="text-gray-600 mb-4">아직 찜한 강의가 없습니다.</div>
          <div className="text-sm text-gray-500">
            관심 있는 강의를 찜해보세요!
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.classId}
              className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-[360px] hover:shadow-lg transition-shadow"
            >
              {/* 썸네일 */}
              <div className="w-full aspect-[4/3] bg-gray-100 mb-3 overflow-hidden rounded">
                <img
                  src={item.thumbnailUrl || "/default-thumbnail.png"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.currentTarget.src = "/default-thumbnail.png")
                  }
                />
              </div>

              {/* 제목 + 가격 */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                  {item.title}
                </h3>
                <p className="text-base font-bold text-gray-900 mt-2">
                  {item.price > 0 ? `₩${item.price.toLocaleString()}` : "무료"}
                </p>
              </div>

              {/* 버튼 영역 */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/classes/${item.classId}`)}
                  className="flex-1 bg-black text-white text-sm py-1.5 rounded hover:bg-gray-800"
                >
                  클래스 보기
                </button>
                <button
                  onClick={() => handleRemove(item.classId)}
                  className="flex-1 bg-rose-400 text-white text-sm py-1.5 rounded hover:bg-rose-500"
                >
                  찜 해제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

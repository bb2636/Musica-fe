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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">찜 목록</h2>
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
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
            >
              {item.thumbnailUrl && (
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {item.title}
              </h3>
              {item.price && (
                <div className="text-black font-bold">
                  {item.price.toLocaleString()}원
                </div>
              )}
              <div className="flex gap-x-2">
                {/* ✅ 클래스 상세페이지 이동 */}
                <button
                  className="flex-1 bg-black text-white py-2 px-3 rounded text-sm hover:bg-gray-400"
                  onClick={() => navigate(`/classes/${item.classId}`)}
                >
                  클래스 보기
                </button>

                {/* ✅ 찜 해제 */}
                <button
                  className="flex-1 bg-red-400 text-white py-2 px-3 rounded text-sm hover:bg-red-600"
                  onClick={() => handleRemove(item.classId)}
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

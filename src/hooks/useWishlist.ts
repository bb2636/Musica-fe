import { useCallback, useState } from "react";
import { wishlistApi } from "../apis/WishlistApi";

export default function useWishlist() {
  const [wishedClassIds, setWishedClassIds] = useState<number[]>([]);
  const [wishlistCounts, setWishlistCounts] = useState<Record<number, number>>({});
  const [processingSet, setProcessingSet] = useState<Set<number>>(new Set());

  // 찜 목록 불러오기
  const fetchWishlist = useCallback(async () => {
    try {
      const wishlist = await wishlistApi.getMyWishlist();
      const ids = wishlist.map((item) => item.classId);
      setWishedClassIds(ids);
    } catch {
      setWishedClassIds([]);
      // setWishlistCounts({});
    }
  }, []);

  // 찜 토글 (낙관적 UI, 실패 시 롤백) - 찜 수 증가/감소 (음수 방지)
  const toggleWish = useCallback(
    async (classId: number, isWished: boolean) => {
      if (processingSet.has(classId)) return;
      const newSet = new Set(processingSet);
      newSet.add(classId);
      setProcessingSet(newSet);
  
      // 임시 UI 반영
      setWishedClassIds((prev) =>
        isWished ? prev.filter((id) => id !== classId) : [...prev, classId]
      );
  
      try {
        if (!isWished) {
          await wishlistApi.addToWishlist(classId);
        } else {
          await wishlistApi.removeFromWishlist(classId);
        }
  
        // ✅ 정확한 count 서버에서 재조회
        const newCount = await wishlistApi.getWishlistCount(classId);
        setWishlistCounts((prev) => ({
          ...prev,
          [classId]: newCount,
        }));
      } catch {
        // 롤백
        setWishedClassIds((prev) =>
          isWished ? [...prev, classId] : prev.filter((id) => id !== classId)
        );
      } finally {
        const updated = new Set(processingSet);
        updated.delete(classId);
        setProcessingSet(updated);
      }
    },
    [processingSet]
  );

  return {
    wishedClassIds,
    wishlistCounts,
    processingSet,
    fetchWishlist,
    toggleWish,
  };
} 
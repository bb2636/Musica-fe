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
      // 찜 개수 동기화는 별도 API 필요, 현재는 빈 객체로 초기화
      setWishlistCounts({});
    } catch {
      setWishedClassIds([]);
      setWishlistCounts({});
    }
  }, []);

  // 찜 토글 (낙관적 UI, 실패 시 롤백) - 찜 수 증가/감소 (음수 방지)
  const toggleWish = useCallback(
    async (classId: number, isWished: boolean) => {
      if (processingSet.has(classId)) return;
      const newSet = new Set(processingSet);
      newSet.add(classId);
      setProcessingSet(newSet);

      setWishedClassIds((prev) =>
        isWished ? prev.filter((id) => id !== classId) : [...prev, classId]
      );
      setWishlistCounts((prev) => ({
        ...prev,
        [classId]: Math.max(0, (prev[classId] ?? 0) + (isWished ? -1 : 1)),
      }));

      try {
        if (!isWished) {
          await wishlistApi.addToWishlist(classId);
        } else {
          await wishlistApi.removeFromWishlist(classId);
        }
      } catch (err) {
        // 롤백
        setWishedClassIds((prev) =>
          isWished ? [...prev, classId] : prev.filter((id) => id !== classId)
        );
        setWishlistCounts((prev) => ({
          ...prev,
          [classId]: Math.max(0, (prev[classId] ?? 0) + (isWished ? -1 : 1)),
        }));
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
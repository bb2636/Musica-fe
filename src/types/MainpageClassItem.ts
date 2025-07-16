// src/types/MainpageClassItem.ts
export interface MainpageClassItem {
    id: number;
    title: string;
    price: number;
    rating: number;
    categoryName: string; // ← 원래 서버 응답 그대로 받는 필드
    tag?: string; // ← 프론트에서 '카드용'으로 따로 쓸 별칭(alias)
    thumbnailUrl: string | null;
    instructor?: string;
    ratingCount?: number;
    originalPrice?: number;
  }
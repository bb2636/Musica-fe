// src/types/MainpageClassItem.ts
export interface MainpageClassItem {
    id: number;
    title: string;
    price: number;
    rating: number;
    categoryName: string;
    thumbnailUrl: string | null;
    instructor?: string;
    ratingCount?: number;
    originalPrice?: number;
  }
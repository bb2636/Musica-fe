// src/types/SearchClassItem.ts
export interface SearchClassItem {
    id: number;
    title: string;
    category: string;
    difficulty: string;
    thumbnailUrl: string | null;
    classPrice: number;
    instructorName: string;
    totalLectureCount: number;
    studentCount: number;
    averageRating: number;
    ratingCount?: number;
    wishlistCount?: number;
  }
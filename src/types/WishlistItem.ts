export interface WishlistItem {
    classId: number; // ✅ 클래스 고유 ID
    title: string;
    thumbnailUrl?: string;
    price: number;
    instructorName: string;
    categoryName: string;
  }
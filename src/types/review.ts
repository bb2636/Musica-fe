// types/review.ts
export interface InstructorReview {
  reviewId: number;
  reviewerName: string;
  comment: string;
  rating: number;
  createdAt: string;
  classId: number;
  classTitle: string;
  lectureId: number;
  lectureTitle: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

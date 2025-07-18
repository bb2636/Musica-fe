// 기본 후기 정보
export interface Review {
  reviewId: number;
  name: string;
  rating: number;
  comment: string;
  progress: number;
  isAuthor: boolean;
  createdAt: string;
  lectureId: number;
  status: string;
  message: string;
}

// ✅ 클래스 상세 페이지용 후기 정보 (API 응답과 일치)
export interface ReviewDetail {
  reviewId: number;
  name: string;
  rating: number;
  comment: string;
  progress: number;
  isAuthor: boolean;
  createdAt: string;
  lectureId: number;
  status: string;
  message: string;
}

// 후기 요약 카드 (메인페이지용)
export interface ReviewSummaryCard {
  id: number;
  rating: number;
  summary: string;
  maskedUsername: string;
  className: string;
  createdAt: string;
}

// 강사용 후기 정보 (기존 컴포넌트 호환)
export interface InstructorReview {
  reviewId: number;
  userName: string;
  rating: number;
  comment: string;
  className: string;
  lectureName: string;
  createdAt: string;
  progress: number;
  // ✅ 기존 컴포넌트에서 사용하는 필드들 추가
  classTitle: string;
  lectureTitle: string;
  reviewerName: string;
}

// 후기 작성 요청
export interface ReviewRequest {
  classId: number;
  lectureId: number;
  rating: number;
  comment: string;
}

// 후기 수정 요청
export interface ReviewUpdateRequest {
  rating: number;
  comment: string;
}

// 후기 응답
export interface ReviewResponse {
  status: string;
  message: string;
  reviewId: number;
}

// 페이징 응답
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 후기 통계
export interface ReviewStats {
  totalCount: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // 1~5점별 개수
  };
}

// 후기 필터
export interface ReviewFilter {
  rating?: number;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}
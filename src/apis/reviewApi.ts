import axiosInstance from "./axiosInstance";
import axiosPublicInstance from "./axiosPublicInstance"; // ✅ 추가
import type {
  ReviewSummaryCard,
  ReviewDetail,
  ReviewRequest,
  ReviewResponse,
  InstructorReview,
  PagedResponse,
} from "../types/review";

export const reviewApi = {
  // 클래스별 후기 목록 조회 (공개) - 비로그인 허용
  async getClassReviews(classId: number): Promise<ReviewDetail[]> {
    const response = await axiosPublicInstance.get(
      `/reviews/classes/${classId}`
    );
    return response.data;
  },

  // 후기 요약 카드 (메인페이지/상세페이지) - 비로그인 허용
  async getReviewSummaryCards(): Promise<ReviewSummaryCard[]> {
    const response = await axiosPublicInstance.get("/reviews/summary/cards"); // ✅ 변경
    return response.data;
  },

  // 강의별 후기 요약 (AI)
  async getLectureSummary(
    lectureId: number
  ): Promise<{ lectureId: string; summary: string }> {
    const response = await axiosInstance.get(
      `/reviews/summary/lecture/${lectureId}`
    );
    return response.data;
  },

  // 후기 등록 (인증 필요)
  async createReview(data: ReviewRequest): Promise<ReviewResponse> {
    const response = await axiosInstance.post("/users/reviews", data);
    return response.data;
  },

  // 후기 수정 (인증 필요)
  async updateReview(
    reviewId: number,
    data: { rating: number; comment: string }
  ): Promise<ReviewResponse> {
    const response = await axiosInstance.patch(
      `/users/reviews/${reviewId}`,
      data
    );
    return response.data;
  },

  // 후기 삭제 (인증 필요)
  async deleteReview(reviewId: number): Promise<ReviewResponse> {
    const response = await axiosInstance.delete(`/users/reviews/${reviewId}`);
    return response.data;
  },

  // 내 후기 목록 (마이페이지)
  async getMyReviews(): Promise<ReviewDetail[]> {
    const response = await axiosInstance.get("/users/reviews/mypage");
    return response.data;
  },

  // 후기 단건 조회
  async getReviewById(reviewId: number): Promise<ReviewDetail> {
    const response = await axiosInstance.get(`/reviews/${reviewId}`);
    return response.data;
  },
};

// ✅ 기존 강사용 후기 함수 - 그대로 유지 (하위 호환성)
export const getInstructorReviews = async (
  page = 0,
  size = 10,
  classId?: number,
  sort = "createdAt,desc"
): Promise<PagedResponse<InstructorReview>> => {
  const params: any = { page, size, sort };
  if (classId) params.classId = classId;

  const res = await axiosInstance.get("/instructors/reviews", { params });
  return res.data;
};

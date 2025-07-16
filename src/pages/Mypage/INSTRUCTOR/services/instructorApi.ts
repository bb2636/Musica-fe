import axiosInstance from "../../../../apis/axiosInstance";
import type { DashboardData, Question, Review, Settlement } from "../types/instructor";

export const instructorApi = {
  // 내가 등록한 클래스 목록 조회
  getMyClasses: async () => {
    const res = await axiosInstance.get("/instructors/classes");
    return res.data;
  },

  // 클래스 등록
  createClass: async (data: {
    title: string;
    descriptionHtml: string;
    categoryId: number;
    difficultyId: number;
    classPrice: number;
    thumbnailUrl?: string;
  }) => {
    const res = await axiosInstance.post("/instructors/classes", data);
    return res.data;
  },

  // 클래스 수정
  updateClass: async (classId: number, data: {
    title: string;
    descriptionHtml: string;
    categoryId: number;
    difficultyId: number;
    classPrice: number;
    thumbnailUrl?: string;
  }) => {
    const res = await axiosInstance.put(`/instructors/classes/${classId}`, data);
    return res.data;
  },

  // 클래스 삭제
  deleteClass: async (classId: number) => {
    const res = await axiosInstance.delete(`/instructors/classes/${classId}`);
    return res.data;
  },

  // ✅ 대시보드 통계 조회
  getDashboard: async (): Promise<DashboardData> => {
    const res = await axiosInstance.get("/instructors/dashboard");
    return res.data;
  },

  // ✅ QnA 목록 조회
  getQuestions: async (): Promise<Question[]> => {
    const res = await axiosInstance.get("/instructors/questions");
    return res.data;
  },

  // ✅ 리뷰 목록 조회 (선택적)
  getReviews: async (): Promise<Review[]> => {
    const res = await axiosInstance.get("/instructors/reviews");
    return res.data;
  },

  // ✅ 정산 내역 조회 (선택적)
  getSettlements: async (): Promise<Settlement[]> => {
    const res = await axiosInstance.get("/instructors/settlements");
    return res.data;
  }
};
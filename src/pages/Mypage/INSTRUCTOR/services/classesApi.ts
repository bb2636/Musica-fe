// apis/classApi.ts
import axiosInstance from "../../../../apis/axiosInstance";

export const classApi = {
  // 클래스 상세 조회 (공용)
  getClassDetail: async (classId: number) => {
    const res = await axiosInstance.get(`/classes/${classId}`);
    return res.data;
  },

  // 클래스 전체 목록 (검색, 정렬, 필터링 포함)
  getAllClasses: async (params: {
    keyword?: string;
    categoryId?: number;
    difficultyId?: number;
    sort?: string;
    page?: number;
    size?: number;
  }) => {
    const res = await axiosInstance.get("/classes", { params });
    return res.data;
  },

  // 수강생 전용 클래스 목록
  getStudentClasses: async () => {
    const res = await axiosInstance.get("/users/classes");
    return res.data;
  }
};
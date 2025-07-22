// src/apis/lectureApi.ts
import axiosInstance from "../apis/axiosInstance";
import type { LectureCreateResDto } from "../types/LectureCreateResDto";
import type {
  LectureCreateReq,
  LectureSummary,
  LectureProgressSaveReq,
  LectureDetail, // 강의 상세용 타입
} from "../types/lecture";

export const lectureApi = {
  // ✅ 강의 등록 (강사용)
  createLecture: async (
    classId: number,
    data: LectureCreateReq
  ): Promise<LectureCreateResDto> => {
    const res = await axiosInstance.post(
      `/instructors/classes/${classId}/lectures`,
      data
    );
    return res.data;
  },

  // ✅ 강의 수정
  updateLecture: async (
    lectureId: number,
    data: LectureCreateReq
  ): Promise<{ message: string; lecture_id: string }> => {
    const res = await axiosInstance.put(
      `/instructors/lectures/${lectureId}`,
      data
    );
    return res.data;
  },

  // ✅ 강의 삭제
  deleteLecture: async (
    lectureId: number
  ): Promise<{ message: string; lecture_id: string }> => {
    const res = await axiosInstance.delete(
      `/instructors/lectures/${lectureId}`
    );
    return res.data;
  },

  // ✅ 강의 목록 조회 (공개용, 비로그인도 가능)
  getLectureList: async (classId: number): Promise<LectureSummary[]> => {
    const res = await axiosInstance.get(`/classes/${classId}/lectures`);
    return res.data;
  },

  // ✅ 강의 목록 조회 (수강생 전용)
  getLectureListForStudent: async (
    classId: number
  ): Promise<LectureSummary[]> => {
    const res = await axiosInstance.get(`/users/classes/${classId}/lectures`);
    return res.data;
  },

  // ✅ 강의 목록 조회 (강사용) — 필요 시 추가
  getLectureListForInstructor: async (
    classId: number
  ): Promise<LectureSummary[]> => {
    const res = await axiosInstance.get(
      `/instructors/classes/${classId}/lectures`
    );
    return res.data;
  },

  // ✅ 강의 상세 조회 (시청 정보 포함)
  getLectureDetail: async (lectureId: number): Promise<LectureDetail> => {
    const res = await axiosInstance.get(`/lectures/${lectureId}`);
    return res.data;
  },

  // ✅ 강의 순서 변경 (강사용)
  updateLectureOrder: async (
    classId: number,
    orderData: {
      lectureOrderList: number[]; // 예시로 사용, 실제 DTO에 맞게 조정
    }
  ) => {
    const res = await axiosInstance.patch(
      `/instructors/classes/${classId}/lectures/order`,
      orderData
    );
    return res.data;
  },

  // ✅ 강의 진행률 저장 (수강생)
  saveProgress: async (lectureId: number, data: LectureProgressSaveReq) => {
    const res = await axiosInstance.patch(
      `/lectures/${lectureId}/progress`,
      data
    );
    return res.data;
  },

  // ✅ presigned upload URL 요청 (강의 or 자료 업로드용)
  getUploadUrls: async (
    videoName?: string,
    fileName?: string
  ): Promise<{ [key: string]: string }> => {
    const res = await axiosInstance.get(`/lectures/upload-url`, {
      params: { videoName, fileName },
    });
    return res.data;
  },

  // ✅ presigned download URL 요청 (자료 보기용)
  getDownloadUrl: async (key: string): Promise<{ downloadUrl: string }> => {
    const res = await axiosInstance.get(`/lectures/view-url`, {
      params: { key },
    });
    return res.data;
  },
};

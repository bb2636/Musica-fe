// src/apis/lectureApi.ts
import axiosInstance from "../apis/axiosInstance";
import type { LectureCreateResDto } from "../types/LectureCreateResDto";
import type {
  LectureWatchData,
  LectureSummary,
  LectureProgressSaveReq,
  LectureCreateReq,
} from "../types/lecture";

export const lectureApi = {
  // 강의 등록
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

  // 강의 수정
  updateLecture: async (lectureId: number, data: LectureCreateReq) => {
    const res = await axiosInstance.put(
      `/instructors/lectures/${lectureId}`,
      data
    );
    return res.data;
  },

  // 강의 삭제
  deleteLecture: async (lectureId: number) => {
    const res = await axiosInstance.delete(
      `/instructors/lectures/${lectureId}`
    );
    return res.data;
  },

  // 강의 목록 조회 (공용)
  getLectureList: async (classId: number) => {
    const res = await axiosInstance.get(`/classes/${classId}/lectures`);
    return res.data;
  },

  // 강의 상세 조회
  getLectureDetail: async (lectureId: number) => {
    const res = await axiosInstance.get(`/lectures/${lectureId}`);
    return res.data;
  },

  // 강의 순서 변경
  updateLectureOrder: async (classId: number, orderData: LectureCreateReq) => {
    const res = await axiosInstance.patch(
      `/instructors/classes/${classId}/lectures/order`,
      orderData
    );
    return res.data;
  },

  // 강의 시청 진행률 저장
  saveLectureProgress: async (
    lectureId: number,
    data: LectureProgressSaveReq
  ) => {
    const res = await axiosInstance.patch(
      `/lectures/${lectureId}/progress`,
      data
    );
    return res.data;
  },

  // presigned upload URL 요청
  getUploadUrls: async (videoName?: string, fileName?: string) => {
    const res = await axiosInstance.get(`/lectures/upload-url`, {
      params: { videoName, fileName },
    });
    return res.data;
  },

  // presigned download URL 요청 (optional)
  getDownloadUrl: async (key: string): Promise<{ downloadUrl: string }> => {
    const res = await axiosInstance.get(`/lectures/view-url`, {
      params: { key },
    });
    return res.data;
  },

  // 강의 시청 데이터 조회 (수강 권한 확인 포함)
  getLectureWatchData: async (
    classId: number,
    lectureId: number
  ): Promise<LectureWatchData> => {
    const res = await axiosInstance.get(
      `/classes/${classId}/lectures/${lectureId}/watch`
    );
    return res.data;
  },

  // 강의 목록 조회 (수강생용)
  getLectureListForStudent: async (
    classId: number
  ): Promise<LectureSummary[]> => {
    const res = await axiosInstance.get(`/users/classes/${classId}/lectures`);
    return res.data;
  },

  // 강의 진행률 저장
  saveProgress: async (lectureId: number, data: LectureProgressSaveReq) => {
    const res = await axiosInstance.patch(
      `/lectures/${lectureId}/progress`,
      data
    );
    return res.data;
  },
};

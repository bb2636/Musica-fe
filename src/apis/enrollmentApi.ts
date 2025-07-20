// src/apis/enrollmentApi.ts
import axiosInstance from "../apis/axiosInstance";
import type { Enrollment } from '../types/enrollment';

export const enrollmentApi = {
    // 내 수강 강의 목록 조회
    getMyEnrollments: async (): Promise<Enrollment[]> => {
        const response = await axiosInstance.get('/users/me/classes');
        return response.data;
    },

    // 특정 강의 수강 여부 확인
    checkEnrollment: async (classId: number): Promise<boolean> => {
        try {
            const response = await axiosInstance.get('/users/me/classes');
            return response.data.some((cls: Enrollment) => cls.classId === classId);
        } catch {
            return false;
        }
    },

    // 수강 진도율 업데이트
    updateProgress: async (
        classId: number,
        lectureId: number,
        progressData: {
            watchedDuration: number;
            totalDuration: number;
            isCompleted: boolean;
        }
    ) => {
        const response = await axiosInstance.put(
            `/api/enrollments/${classId}/lectures/${lectureId}/progress`,
            progressData
        );
        return response.data;
    }
};

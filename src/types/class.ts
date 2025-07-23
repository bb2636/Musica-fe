// class.ts
import type { LectureSummary } from "./lecture";

// ✅ 사용자 관련 수강 정보
export interface UserClassStatus {
  enrolled: boolean; // ✅ 서버 응답 필드와 일치
  progressRate: number;
  completedLectureCount: number;
  totalLectureCount: number;
}

// ✅ 클래스 요약 정보 (리스트용)
export interface ClassSummary {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  thumbnailUrl: string;
  classPrice: number;
  instructorName: string;
  totalLectureCount: number;
  studentCount: number;
  averageRating: number;
}

// ✅ 클래스 상세 정보 (상세 페이지용)
export interface ClassDetail {
  id: number;
  title: string;
  descriptionHtml: string;
  categoryName: string;
  difficulty: string;
  thumbnailUrl: string;
  classPrice: number;
  instructorName: string;
  userClassStatus: UserClassStatus;
  lectures: LectureSummary[];
}

// ✅ 클래스 생성 요청
export interface ClassCreateReq {
  title: string;
  descriptionHtml?: string;
  categoryId: number;
  difficultyId: number;
  classPrice: number;
  thumbnailUrl?: string;
}

// ✅ 클래스 수정 요청
export type ClassUpdateReq = ClassCreateReq;

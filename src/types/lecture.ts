// ✅ 올바른 LectureProgressSaveReq 타입 정의
export interface LectureProgressSaveReq {
  watchedSeconds: number;
  completed: boolean;
}

// ✅ 강의 요약 정보 (커리큘럼용)
export interface LectureSummary {
  lectureId: number; // 강의 ID
  title: string; // 강의 제목
  lectureOrder: number; // 순서
  duration: number; // 강의 길이 (초 단위)
  isCompleted?: boolean; // 시청 완료 여부 (선택)
  progressRate?: number; // 시청률 (선택, 0~100)
  videoUrl?: string; // 영상 URL
  fileUrl?: string; // 자료 파일 URL
  isAccessible?: boolean; // 접근 가능 여부 (프론트 계산용)
}

// ✅ 강의 상세 정보 (시청 페이지용)
// export interface LectureDetail extends LectureSummary {
//   classId: number;
//   watchedSeconds: number; // 시청한 초
//   isCompleted: boolean; // 완료 여부
//   className: string; // 소속 클래스명 (추가 조회된 값)
//   // 🔽 아래는 필요 시 확장 가능
//   detectedInstruments?: Record<string, boolean>;
//   confidenceScores?: Record<string, number>;
//   thresholds?: Record<string, number>;
// }

// ✅ 강의 등록 요청
export interface LectureCreateReq {
  title: string;
  lectureOrder: number;
  videoUrl?: string;
  fileUrl?: string;
  duration?: number;
}

export interface LectureDetail extends LectureSummary {
  classId: number;
  watchedSeconds: number;
  isCompleted: boolean;
  className: string;
  lectures: LectureSummary[]; // ✅ 시청 페이지에 커리큘럼 표시용 추가
  detectedInstruments?: Record<string, boolean>;
  confidenceScores?: Record<string, number>;
  thresholds?: Record<string, number>;
}

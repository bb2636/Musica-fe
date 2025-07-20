export interface LectureSummary {
  lectureId: number;
  title: string;
  lectureOrder: number;
  description?: string;
  orderNumber: number;
  isAccessible: boolean;
  progress?: LectureProgressSaveReq;
  duration: number;
  videoUrl?: string;
  fileUrl?: string;
}

export interface LectureDetail extends LectureSummary {
  watchedSeconds: number;
  isCompleted: boolean;
}

export interface LectureCreateReq {
  title: string;
  lectureOrder: number;
  videoUrl?: string;
  fileUrl?: string;
  duration?: number;
}

export interface LectureCreateDto {
  title: string;
  videoUrl?: string;
  fileUrl?: string;
  lectureOrder: number;
  duration?: number;
}

export interface LectureProgressSaveReq {
  watchedSeconds: number;
  isCompleted: boolean;
}

export interface LectureWatchData {
  classId: number;
  lectureId: number;
  classTitle: string;
  lectureTitle: string;
  lectures: LectureDetail[];
  currentLecture: LectureDetail;
  isEnrolled: boolean;
  nextLecture?: LectureDetail;
  previousLecture?: LectureDetail;
}
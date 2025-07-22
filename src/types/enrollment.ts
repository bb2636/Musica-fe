// types/enrollment.ts
export interface Enrollment {
  enrollmentId: number;
  classId: number;
  userId: number;
  enrolledAt: string;
  progressRate: number;
  completedLectureCount: number;
  totalLectureCount: number;
  lastAccessedAt?: string;
  classInfo: {
    title: string;
    instructorName: string;
    thumbnailUrl: string;
    categoryName: string;
    difficulty: string;
    totalDuration: number;
  };
}

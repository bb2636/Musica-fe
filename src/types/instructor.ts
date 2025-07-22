// instructorTypes.ts
// ✅ 강사 대시보드
export interface DashboardData {
  instructorInfo: DashboardInstructorInfo;
  stats: Statistics;
  recentActivities: Activity[];
}

export interface DashboardInstructorInfo {
  name: string;
  email: string;
  totalClasses: number;
  totalStudents: number;
}

export interface Statistics {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingQuestions: number;
  totalReviews: number;
  averageRating: number;
}

export interface Activity {
  type: "question" | "review";
  message: string;
  timestamp: string;
}

// ✅ 질문 (QnA)
export interface Question {
  id: number;
  studentName: string;
  className: string;
  question: string;
  answer?: string;
  status: QuestionStatus;
  createdAt: string;
  answeredAt?: string;
}

export type QuestionStatus = "PENDING" | "ANSWERED";

// ✅ 리뷰 (선택적)
export interface Review {
  id: number;
  classTitle: string;
  reviewerName: string;
  rating: number; // 0.0 ~ 5.0
  comment: string;
  createdAt: string;
}

// ✅ 정산 내역 (선택적)
export interface Settlement {
  id: number;
  settlementMonth: string; // 예: "2025-07"
  totalAmount: number;
  commissionRate: number; // 0~100 (%)
  netAmount: number;
  settledAt: string;
}

// ✅ 정산 계좌 DTO (AccountRequestDto, AccountResponseDto)
export interface AccountRequestDto {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface AccountResponseDto {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ 월별 매출 DTO (MonthlyRevenueDto)
export interface MonthlyRevenueDto {
  month: number; // 1~12
  totalRevenue: number;
}

// 강사 개인 정보
export interface InstructorInfo {
  id: number;
  name: string;
  email: string;
  isApproved: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  levelName?: string;
  createdAt: string;
}

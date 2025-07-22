import axiosInstance from "./axiosInstance";
import type { Enrollment } from "../types/enrollment";

// 결제 승인 (카트 결제)
export const approveCartPayment = (params: string) =>
  axiosInstance.post(`/users/payment/cart/checkout?${params}`);

// 결제 내역 조회
export const getPayments = (status: string) =>
  axiosInstance.get("/users/me/payments", {
    params: status === "ALL" ? {} : { status },
  });

// 결제 상세 내역 조회
export const getPaymentDetail = (paymentId: number) =>
  axiosInstance.get("/users/me/payments", {
    params: { paymentId },
  });

// 결제 취소
export const cancelPayment = (payment_id: number, payment_item_ids: number[]) =>
  axiosInstance.post("users/payment/cancel", {
    payment_id,
    payment_item_ids,
  });

// ✅ 진짜 Enrollment[]만 반환하도록 수정
export const getEnrolledClasses = async (): Promise<Enrollment[]> => {
  const res = await axiosInstance.get("/users/me/classes");

  return res.data.map((item: any) => ({
    enrollmentId: item.payment_id, // ✅ payment_id → enrollmentId
    classId: item.class_id, // ✅ class_id → classId
    userId: 0, // ✅ 없으므로 기본값 사용
    enrolledAt: item.paid_at ?? "", // ✅ paid_at → enrolledAt
    progressRate: item.progress ?? 0,
    completedLectureCount: 0, // ✅ 응답에 없으므로 기본값
    totalLectureCount: 0,
    lastAccessedAt: "",
    classInfo: {
      title: item.title ?? "",
      instructorName: item.instructorName ?? "",
      thumbnailUrl: item.thumbnailUrl ?? "",
      categoryName: "", // ✅ 없으면 빈 문자열
      difficulty: "",
      totalDuration: 0,
    },
  }));
};

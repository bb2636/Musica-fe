import axiosInstance from './axiosInstance';

// 결제 승인 (카트 결제)
export const approveCartPayment = (params: string) =>
  axiosInstance.post(`/users/payment/cart/checkout?${params}`);

// 결제 내역 조회
export const getPayments = (status: string) =>
  axiosInstance.get('/users/me/payments', {
    params: status === 'ALL' ? {} : { status },
  });

// 결제 상세 내역 조회
export const getPaymentDetail = (paymentId: number) =>
  axiosInstance.get('/users/me/payments', {
    params: { paymentId },
  });

// 결제 취소
export const cancelPayment = (payment_id: number, payment_item_ids: number[]) =>
  axiosInstance.post('users/payment/cancel', {
    payment_id,
    payment_item_ids,
  });

// 수강 중인 클래스 목록 조회 - PaymentController와 일치
getEnrolledClasses: async (): Promise<EnrolledClassDto[]> => {
    return apiClient.get('/users/me/classes');
}
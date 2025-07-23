import React, { useEffect, useState } from "react";
import { getPayments, getPaymentDetail, cancelPayment } from "../apis/payment";
import type { AxiosError } from "axios";

interface PaymentItem {
  paymentId: number;
  title: string;
  thumbnailUrl: string;
  amount: number;
  status: string | { id: number; name: string };
  paidAt: string;
}

interface PaymentDetailClassItem {
  paymentItemId: number;
  class_id: number;
  title: string;
  thumbnailUrl: string;
  instructorName: string;
  amount: number;
  status: string;
}

interface PaymentDetail {
  paymentId: number;
  totalAmount: number;
  paidAt: string;
  status: string;
  paymentItems: PaymentDetailClassItem[];
}

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const PaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus] = useState<string>("ALL"); // 제거되지 않으면 읽히도록 유지
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedCancelItems, setSelectedCancelItems] = useState<number[]>([]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const fetchPayments = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPayments(selectedStatus);
      setPayments(res.data);
    } catch {
      setError("결제 내역을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedStatus]);

  const handleDetail = async (paymentId: number): Promise<void> => {
    setDetailLoading(true);
    setDetailError(null);
    setSelectedPayment(null);
    try {
      const res = await getPaymentDetail(paymentId);
      setSelectedPayment(res.data[0]);
    } catch {
      setDetailError("결제 상세 정보를 불러올 수 없습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleCancelItem = (itemId: number): void => {
    setSelectedCancelItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCancel = async (): Promise<void> => {
    if (!selectedPayment || selectedCancelItems.length === 0) return;
    setCancelLoading(true);
    setCancelError(null);
    setCancelSuccess(null);
    try {
      const res = await cancelPayment(
        selectedPayment.paymentId,
        selectedCancelItems
      );
      if (res.data.status === "success" || res.data.status === "CANCELED") {
        setCancelSuccess(res.data.message || "취소가 완료되었습니다.");
        setSelectedCancelItems([]);
        await handleDetail(selectedPayment.paymentId);
        fetchPayments();
      } else {
        setCancelError(res.data.message || "취소할 수 없는 항목입니다.");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message =
        axiosError?.response?.data?.message ||
        "취소 요청이 정상적으로 처리되지 않았습니다.";
      setCancelError(message);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">결제 내역</h2>
          {loading ? (
            <div className="text-gray-500 text-center py-20">로딩 중...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-20">{error}</div>
          ) : payments.length === 0 ? (
            <div className="text-gray-500 text-center py-20">
              결제 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((item, idx) => (
                <div
                  key={item.paymentId ?? `payment-${idx}`}
                  className="flex items-center rounded p-4 gap-4"
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      결제일: {formatDate(item.paidAt)}
                    </div>
                    <div className="text-sm text-gray-500">
                      상태:{" "}
                      {typeof item.status === "object" && "name" in item.status
                        ? item.status.name
                        : item.status}
                    </div>
                  </div>
                  <div className="text-lg font-bold mr-4">
                    {item.amount.toLocaleString()}원
                  </div>
                  <button
                    className="px-4 py-1 bg-black text-white rounded hover:bg-gray-300 hover:text-black transition text-sm"
                    onClick={() => handleDetail(item.paymentId)}
                  >
                    결제 내역 상세보기
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setSelectedPayment(null)}
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-4">결제 상세 내역</h3>
                {cancelSuccess && (
                  <div className="text-green-600 text-center mb-2">
                    {cancelSuccess}
                  </div>
                )}
                {cancelError && (
                  <div className="text-red-500 text-center mb-2">
                    {cancelError}
                  </div>
                )}
                {detailLoading ? (
                  <div className="text-gray-500 text-center py-10">
                    로딩 중...
                  </div>
                ) : detailError ? (
                  <div className="text-red-500 text-center py-10">
                    {detailError}
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      결제일: {formatDate(selectedPayment.paidAt)}
                    </div>
                    <div className="mb-2">
                      총 결제금액:{" "}
                      {selectedPayment.totalAmount.toLocaleString()}원
                    </div>
                    <div className="mb-4 font-semibold">클래스 목록</div>
                    <div className="space-y-2">
                      {(selectedPayment.paymentItems || []).map((item, idx) => (
                        <div
                          key={
                            item.paymentItemId ??
                            `${item.class_id}-${item.title}-${idx}`
                          }
                          className="flex items-center gap-3 bg-gray-50 rounded p-2"
                        >
                          {item.status === "CANCELED" ? (
                            <span className="text-red-600 font-bold w-12 text-center">
                              Cancel
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedCancelItems.includes(
                                item.paymentItemId
                              )}
                              onChange={() =>
                                handleToggleCancelItem(item.paymentItemId)
                              }
                              className="accent-blue-600 w-4 h-4 mr-2"
                            />
                          )}
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-xs text-gray-500">
                              강사: {item.instructorName}
                            </div>
                          </div>
                          <div className="text-sm font-bold">
                            {item.amount.toLocaleString()}원
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                      onClick={handleCancel}
                      disabled={
                        cancelLoading || selectedCancelItems.length === 0
                      }
                    >
                      {cancelLoading ? "취소 요청 중..." : "선택 항목 취소"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;

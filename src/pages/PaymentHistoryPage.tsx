import React, { useEffect, useState } from 'react';
import axiosInstance from '../apis/axiosInstance';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface PaymentItem {
  payment_id: number;
  title: string;
  thumbnailUrl: string;
  amount: number;
  status: string;
  paid_at: string;
}

interface PaymentDetailClassItem {
  payment_item_id: number;
  class_id: number;
  title: string;
  thumbnailUrl: string;
  instructorName: string;
  amount: number;
}

interface PaymentDetail {
  payment_id: number;
  totalAmount: number;
  paid_at: string;
  class: PaymentDetailClassItem[];
}

interface CancelResponse {
  status: string;
  message?: string;
}

const statusOptions: { label: string; value: string }[] = [
  { label: '전체', value: 'ALL' },
  { label: '수강 중', value: 'ACTIVE' },
  { label: '취소됨', value: 'CANCELLED' },
];

const PaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedCancelItems, setSelectedCancelItems] = useState<number[]>([]);
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get<PaymentItem[]>(`/users/me/payments`, {
          params: selectedStatus === 'ALL' ? {} : { status: selectedStatus },
        });
        setPayments(res.data);
      } catch (err) {
        console.error(err);
        setError('결제 내역을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [selectedStatus]);

  const handleDetail = async (payment_id: number): Promise<void> => {
    setDetailLoading(true);
    setDetailError(null);
    setSelectedPayment(null);
    try {
      const res = await axiosInstance.get<PaymentDetail[]>(`/users/me/payments`, {
        params: { payment_id },
      });
      setSelectedPayment(res.data[0]);
    } catch (err) {
      console.error(err);
      setDetailError('결제 상세 정보를 불러올 수 없습니다.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleCancelItem = (itemId: number): void => {
    setSelectedCancelItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCancel = async (): Promise<void> => {
    if (!selectedPayment || selectedCancelItems.length === 0) return;
    setCancelLoading(true);
    setCancelError(null);
    setCancelSuccess(null);
    try {
      const res = await axiosInstance.post<CancelResponse>('/payment/cancel', {
        payment_id: selectedPayment.payment_id,
        payment_item_ids: selectedCancelItems,
      });
      if (res.data.status === 'success') {
        setCancelSuccess(res.data.message || '취소가 완료되었습니다.');
        setSelectedCancelItems([]);
        await handleDetail(selectedPayment.payment_id);
      } else {
        setCancelError(res.data.message || '취소에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      setCancelError('취소 요청이 정상적으로 처리되지 않았습니다.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">결제 내역</h2>
          <div className="flex gap-2 mb-4">
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                className={`px-4 py-2 rounded ${selectedStatus === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setSelectedStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="text-gray-500 text-center py-20">로딩 중...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-20">{error}</div>
          ) : payments.length === 0 ? (
            <div className="text-gray-500 text-center py-20">결제 내역이 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {payments.map(item => (
                <div key={item.payment_id} className="flex items-center bg-gray-100 rounded p-4 gap-4">
                  <img src={item.thumbnailUrl} alt={item.title} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-gray-500">결제일: {item.paid_at?.slice(0, 10)}</div>
                    <div className="text-sm text-gray-500">상태: {item.status}</div>
                  </div>
                  <div className="text-lg font-bold mr-4">{item.amount.toLocaleString()}원</div>
                  <button
                    className="text-blue-600 underline text-sm"
                    onClick={() => handleDetail(item.payment_id)}
                  >
                    상세보기
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* 상세 내역 모달/영역 */}
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
                {cancelSuccess && <div className="text-green-600 text-center mb-2">{cancelSuccess}</div>}
                {cancelError && <div className="text-red-500 text-center mb-2">{cancelError}</div>}
                {detailLoading ? (
                  <div className="text-gray-500 text-center py-10">로딩 중...</div>
                ) : detailError ? (
                  <div className="text-red-500 text-center py-10">{detailError}</div>
                ) : (
                  <>
                    <div className="mb-2">결제일: {selectedPayment.paid_at}</div>
                    <div className="mb-2">총 결제금액: {selectedPayment.totalAmount.toLocaleString()}원</div>
                    <div className="mb-2">결제 ID: {selectedPayment.payment_id}</div>
                    <div className="mb-4 font-semibold">클래스 목록</div>
                    <div className="space-y-2">
                      {selectedPayment.class.map(item => (
                        <div key={item.payment_item_id} className="flex items-center gap-3 bg-gray-50 rounded p-2">
                          <input
                            type="checkbox"
                            checked={selectedCancelItems.includes(item.payment_item_id)}
                            onChange={() => handleToggleCancelItem(item.payment_item_id)}
                            className="accent-blue-600 w-4 h-4 mr-2"
                            disabled={cancelLoading}
                          />
                          <img src={item.thumbnailUrl} alt={item.title} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-xs text-gray-500">강사: {item.instructorName}</div>
                          </div>
                          <div className="text-sm font-bold">{item.amount.toLocaleString()}원</div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                      onClick={handleCancel}
                      disabled={cancelLoading || selectedCancelItems.length === 0}
                    >
                      {cancelLoading ? '취소 요청 중...' : '선택 항목 취소'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentHistoryPage; 
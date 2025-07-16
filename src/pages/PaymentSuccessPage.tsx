import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../apis/axiosInstance';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const cartItemIds = searchParams.get('cartItemIds'); // 콤마로 구분된 문자열
    const cartItemIdArray = cartItemIds ? cartItemIds.split(',') : [];

    if (!paymentKey || !orderId || !amount || !cartItemIds) {
      alert('결제 정보가 올바르지 않습니다.');
      navigate('/');
      return;
    }

    const requestPayment = async () => {
      try {
        // cartItemIds를 여러 개의 쿼리 파라미터로 변환
        const cartItemIdParams = cartItemIdArray.map(id => `cartItemIds=${encodeURIComponent(id)}`).join('&');
        const params = `paymentKey=${encodeURIComponent(paymentKey)}&orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount)}&${cartItemIdParams}`;
        const res = await axiosInstance.post(`/users/payment/cart/checkout?${params}`);
        console.log('결제 승인 API 응답:', res);
        console.log('결제 승인 API status:', res.data.status);
        if (res.data.status === 'success' || res.data.status === 'CANCELED') {
          alert('결제가 성공적으로 완료되었습니다.');
          navigate('/payment-history');
        } else {
          alert(res.data.message || '결제 승인에 실패했습니다.');
          navigate('/cart');
        }
      } catch (error) {
        console.error('결제 승인 오류:', error);
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const err = error as any;
          console.log('결제 승인 오류 status:', err.response?.status);
          console.log('결제 승인 오류 data:', err.response?.data);
        }
        alert('결제 승인 중 오류가 발생했습니다.');
        navigate('/cart');
      }
    };
    requestPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Header />
      <div className="text-xl font-semibold">결제 승인 중...</div>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage; 
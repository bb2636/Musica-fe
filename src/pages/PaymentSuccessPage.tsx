import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { approveCartPayment } from '../apis/payment';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const amount = searchParams.get('amount');
    const cartItemIds = searchParams.get('cartItemIds');

    if (!paymentKey || !orderId || !amount || !cartItemIds) {
      alert('결제 정보가 올바르지 않습니다.');
      navigate('/');
      return;
    }

    const isAlreadyProcessed = sessionStorage.getItem(`processed_${orderId}`);
    if (isAlreadyProcessed) {
      navigate('/payment-history');
      return;
    }

    const requestPayment = async () => {
      try {
        const cartItemIdArray = cartItemIds.split(',');
        const cartItemIdParams = cartItemIdArray.map(id => `cartItemIds=${encodeURIComponent(id)}`).join('&');
        const params = `paymentKey=${encodeURIComponent(paymentKey)}&orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount)}&${cartItemIdParams}`;
        const res = await approveCartPayment(params);

        if (res.data.status === 'success' || res.data.status === 'CANCELED') {
          sessionStorage.setItem(`processed_${orderId}`, 'true');
          alert('결제가 성공적으로 완료되었습니다.');
          navigate('/payment-history');
        } else {
          alert(res.data.message || '결제 승인에 실패했습니다.');
          navigate('/cart');
        }
      } catch (error) {
        console.error('결제 승인 오류:', error);
        alert('결제 승인 중 오류가 발생했습니다.');
        navigate('/cart');
      }
    };
    requestPayment();
  }, [searchParams, navigate, orderId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Header />
      <div className="text-xl font-semibold">결제 승인 중...</div>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage; 
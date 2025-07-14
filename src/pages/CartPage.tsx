import { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import axiosInstance from '../apis/axiosInstance';

interface CartItem {
  classId: number;
  title: string;
  instructorName: string;
  thumbnailUrl: string;
  price: number;
  // ... 기타 필요한 필드
}

interface CartData {
  userId: number;
  cartItems: CartItem[];
  totalCount: number;
  totalPrice: number;
  totalDiscountPrice: number;
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get('http://localhost:8080/api/users/carts');
        setCart(res.data);
      } catch (err: any) {
        setError('장바구니 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleTossPay = async () => {
    if (!cart) return;
    const tossPayments = await loadTossPayments('test_ck_P9BRQmyarYyYDXA9p2mWrJ07KzLN');
    tossPayments.requestPayment('카드', {
      amount: cart.totalDiscountPrice ?? cart.totalPrice,
      orderId: `order_${Date.now()}`,
      orderName: '장바구니 결제',
      customerName: '홍길동', // 실제로는 사용자 정보로 대체
      successUrl: `http://localhost:8080/payment/cart/checkout/cartId=${cart.userId}`,
      failUrl: window.location.origin + '/cart?pay=fail',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full bg-white shadow">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="font-bold text-blue-600 text-xl">InstruConnect</div>
          <div className="text-lg font-semibold">장바구니</div>
          <div></div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">내 장바구니</h2>
        {loading ? (
          <div className="text-gray-500 text-center py-20">로딩 중...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-20">{error}</div>
        ) : !cart || cart.cartItems.length === 0 ? (
          <div className="text-gray-500 text-center py-20">장바구니가 비어 있습니다.</div>
        ) : (
          <div className="space-y-4">
            {cart.cartItems.map(item => (
              <div key={item.classId} className="flex items-center bg-white rounded-lg shadow p-4">
                <div className="w-20 h-20 bg-gray-200 rounded mr-4 flex items-center justify-center">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover rounded" />
                  ) : (
                    <span className="text-3xl text-gray-400">🎵</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.instructorName}</div>
                </div>
                <div className="text-lg font-bold mr-4">{item.price.toLocaleString()}원</div>
                {/* 삭제 버튼 등은 필요시 추가 */}
              </div>
            ))}
            <div className="flex flex-col items-end mt-6 gap-2">
              <div className="text-base">총 {cart.totalCount}개</div>
              <div className="text-lg font-bold">총 합계: {cart.totalPrice.toLocaleString()}원</div>
              {cart.totalDiscountPrice !== cart.totalPrice && (
                <div className="text-lg font-bold text-blue-600">할인 적용가: {cart.totalDiscountPrice.toLocaleString()}원</div>
              )}
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition" onClick={handleTossPay}>결제하기</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CartPage; 
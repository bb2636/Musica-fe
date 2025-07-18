import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getCart, clearCart, deleteCartItems } from '../apis/cart';
import { loadTossPayments } from '@tosspayments/payment-sdk';

interface CartItem {
  cartItemId: number;
  classId: number;
  title: string;
  instructorName: string;
  thumbnailUrl: string;
  price: number;
}

interface CartResponse {
  cartId: number;
  userId: number;
  cartItems: CartItem[];
  totalCount: number;
  totalPrice: number;
  totalDiscountPrice: number;
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCart();
      setCart(res.data);
      setSelected([]);
      // 카트 아이템들 콘솔 출력
      console.log('가져온 카트 아이템:', res.data.cartItems);
    } catch (err) {
      setError('장바구니 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleClearCart = async () => {
    if (!window.confirm('장바구니를 모두 비우시겠습니까?')) return;
    try {
      await clearCart();
      setActionMsg('장바구니가 비워졌습니다.');
      fetchCart();
    } catch {
      setActionMsg('장바구니 비우기에 실패했습니다.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    if (!window.confirm('선택한 클래스를 삭제하시겠습니까?')) return;
    try {
      await deleteCartItems(selected);
      setActionMsg('선택한 클래스가 삭제되었습니다.');
      fetchCart();
    } catch {
      setActionMsg('선택 삭제에 실패했습니다.');
    }
  };

  const toggleSelect = (cartItemId: number) => {
    setSelected(prev => {
      const newSelected = prev.includes(cartItemId)
        ? prev.filter(id => id !== cartItemId)
        : [...prev, cartItemId];
      console.log('체크박스 클릭 후 selected:', newSelected);
      return newSelected;
    });
  };

  // 선택된 아이템의 합계 금액 계산
  const selectedItems = cart && selected.length > 0 ? cart.cartItems.filter(item => selected.includes(item.cartItemId)) : [];
  const selectedAmount = selectedItems.reduce(
    (sum, item) => sum + (typeof item.price === 'number' ? item.price : 0),
    0
  );

  const handlePayment = async () => {
    if (!cart || selected.length === 0) {
      alert('결제할 클래스를 선택하세요.');
      return;
    }
    // 선택된 cartItemsId 콘솔 출력
    console.log('결제 버튼 클릭 시 selected:', selected);

    const clientKey = 'test_ck_P9BRQmyarYyYDXA9p2mWrJ07KzLN';

    const tossPayments = await loadTossPayments(clientKey);

    // 선택된 cartItem만 결제
    const amount = selectedAmount;
    // cartItemIds를 하나의 쿼리 파라미터로 전달
    const cartItemIdsParam = `cartItemIds=${selected.join(',')}`;
    console.log('cartItemIdsParam:', cartItemIdsParam);

    const orderId = new Date().getTime().toString();
    const orderName = selectedItems.length > 1
      ? `${selectedItems[0].title} 외 ${selectedItems.length - 1}건`
      : selectedItems[0].title;

    tossPayments.requestPayment('카드', {
      amount,
      orderId,
      orderName,
      customerName: '고객 이름',
      successUrl: `${window.location.origin}/payment-success?${cartItemIdsParam}`,
      failUrl: `${window.location.origin}/payment-fail`,
    }).catch(function (error) {
      if (error.code === 'USER_CANCEL') {
        alert('결제가 취소되었습니다.');
      } else {
        alert(`결제 실패: ${error.message}`);
      }
    });
  };


  if (loading) return <div className="text-center py-20 text-gray-500">로딩 중...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">장바구니</h1>
        {actionMsg && (
          <div className="mb-4 text-center text-blue-600">{actionMsg}</div>
        )}
        {cart && cart.cartItems.length > 0 ? (
          <>
            <div className="flex justify-between mb-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={handleClearCart}
              >
                전체 비우기
              </button>
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-900 transition"
                onClick={handleDeleteSelected}
                disabled={selected.length === 0}
              >
                선택 삭제
              </button>
            </div>
            <div className="space-y-4 mb-8">
              {cart.cartItems.map(item => (
                <div key={item.cartItemId} className="flex items-center bg-white rounded shadow p-4 gap-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.cartItemId)}
                    onChange={() => toggleSelect(item.cartItemId)}
                    className="w-5 h-5 accent-blue-600 mr-2"
                  />
                  <img src={item.thumbnailUrl} alt={item.title} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-gray-500">강사: {item.instructorName}</div>
                    <div className="text-xs text-gray-400">클래스 ID: {item.classId}</div>
                    <div className="text-xs text-gray-400">카트 아이템 ID: {item.cartItemId}</div>
                  </div>
                  <div className="text-lg font-bold">
                    {typeof item.price === 'number' ? item.price.toLocaleString() + '원' : '-'}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded shadow p-6 flex flex-col items-end">
              <div className="mb-2 text-gray-500">총 {cart.totalCount}개</div>
              <div className="mb-2">
                <span className="text-gray-500 mr-2 line-through">
                  {typeof cart.totalPrice === 'number' ? cart.totalPrice.toLocaleString() + '원' : '-'}
                </span>
                <span className="text-xl font-bold text-blue-700">
                  {typeof cart.totalDiscountPrice === 'number' ? cart.totalDiscountPrice.toLocaleString() + '원' : '-'}
                </span>
              </div>
              <button
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition"
                disabled={selected.length === 0}
                onClick={handlePayment}
              >
                선택 항목 결제
              </button>
              {selected.length > 0 && (
                <div className="mt-2 text-base text-right w-full text-blue-700 font-semibold">
                  선택 결제 금액: {selectedAmount.toLocaleString()}원
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 py-20">장바구니가 비어 있습니다.</div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CartPage; 
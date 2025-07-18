import axiosInstance from './axiosInstance';

// 장바구니 조회
export const getCart = () => axiosInstance.get('/users/carts');

// 장바구니에 클래스 추가
export const addCartItem = (classId: number) =>
  axiosInstance.put('/users/carts', null, { params: { classId } });

// 장바구니 전체 비우기
export const clearCart = () => axiosInstance.delete('/users/carts');

// 장바구니 선택 삭제
export const deleteCartItems = (cartItemIds: number[]) =>
  axiosInstance.delete('/users/carts', { data: { cartItemIds } }); 
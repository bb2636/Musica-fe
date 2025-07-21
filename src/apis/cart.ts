import axiosInstance from './axiosInstance';

export interface CartItem {
    cartItemId: number;
    classId: number;
    title: string;
    thumbnailUrl: string;
    price: number;
    instructorName: string;
}

export interface CartResponse {
    cartId: number;
    userId: number;
    cartItems: CartItem[];
    totalCount: number;
    totalPrice: number;
    totalDiscountPrice: number;
}

export const cartApi = {
    // 장바구니 목록 조회
    async getCartItems(): Promise<CartResponse> {
        const response = await axiosInstance.get('/users/carts');
        return response.data;
    },

    // 장바구니에 추가 (PUT 요청, params 사용)
    async addToCart(classId: number): Promise<{ message: string, status: string }> {
        const response = await axiosInstance.put('/users/carts', null, {
            params: { classId }
        });
        return response.data;
    },

    // 선택 항목 장바구니에서 제거
    async removeFromCart(cartItemIds: number[]): Promise<{ message: string, status: string }> {
        const response = await axiosInstance.delete('/users/carts', {
            data: { cartItemIds }
        });
        return response.data;
    },

    // 장바구니 전체 비우기
    async clearCart(): Promise<{ message: string, status: string }> {
        const response = await axiosInstance.delete('/users/carts');
        return response.data;
    },

    // 장바구니 상품 수량 조회
    async getCartCount(): Promise<number> {
        try {
            const cart = await this.getCartItems();
            return cart.totalCount || 0;
        } catch (error) {
            console.error('장바구니 수량 확인 실패:', error);
            return 0;
        }
    },

    // 장바구니에 있는지 확인
    async isInCart(classId: number): Promise<boolean> {
        try {
            const cart = await this.getCartItems();
            return cart.cartItems.some(item => item.classId === classId);
        } catch (error) {
            console.error('장바구니 확인 실패:', error);
            return false;
        }
    }
};

// 기존 함수들도 유지 (하위 호환성)
export const getCart = () => axiosInstance.get('/users/carts');

export const addCartItem = (classId: number) =>
    axiosInstance.put('/users/carts', null, { params: { classId } });

export const clearCart = () => axiosInstance.delete('/users/carts');

export const deleteCartItems = (cartItemIds: number[]) =>
    axiosInstance.delete('/users/carts', { data: { cartItemIds } });
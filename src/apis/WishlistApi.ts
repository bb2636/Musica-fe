import axiosInstance from './axiosInstance';

export interface WishlistItem {
    id: number;
    title: string;
    thumbnailUrl?: string;
    price: number;
    instructorName: string;
    categoryName: string;
}

export const wishlistApi = {
    // 내 찜 목록 조회
    async getMyWishlist(): Promise<WishlistItem[]> {
        const response = await axiosInstance.get('/users/wishlists/mywishlist');
        return response.data.classes || [];
    },

    // 찜 목록에 추가
    async addToWishlist(classId: number): Promise<{ message: string }> {
        const response = await axiosInstance.post('/users/wishlists', { classId });
        return response.data;
    },

    // 찜 목록에서 제거
    async removeFromWishlist(classId: number): Promise<{ message: string }> {
        const response = await axiosInstance.delete(`/users/wishlists/${classId}`);
        return response.data;
    },

    // 찜 상태 확인
    async isWishlisted(classId: number): Promise<boolean> {
        try {
            const wishlist = await this.getMyWishlist();
            return wishlist.some(item => item.id === classId);
        } catch (error) {
            console.error('찜 상태 확인 실패:', error);
            return false;
        }
    }
};
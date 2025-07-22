import axiosInstance from './axiosInstance';

export interface WishlistItem {
  classId: number; // ✅ 실제 필드명과 일치시켜야 함
  title: string;
  thumbnailUrl?: string;
  price: number;
  instructorName: string;
  categoryName: string;
}

export const wishlistApi = {
  // 내 찜 목록 조회
  async getMyWishlist(): Promise<WishlistItem[]> {
    try {
      const response = await axiosInstance.get('/users/wishlists/mywishlist');
      // console.log('[wishlistApi] 찜 목록 응답 데이터:', response.data);

      const rawList = response.data.wishlist || [];

      // 🔥 여기서 classId → id로 매핑
      return rawList.map((item: any) => ({
        classId: item.classId,
        title: item.title,
        thumbnailUrl: item.thumbnailUrl,
        price: item.price,
        instructorName: item.instructorName,
        categoryName: item.categoryName || '기타',
      }));
    } catch (error) {
      console.error('[wishlistApi] 찜 목록 가져오기 실패:', error);
      throw error;
    }
  },

  // 찜 목록에 추가
  async addToWishlist(classId: number): Promise<{ message: string }> {
    const response = await axiosInstance.post(`/users/wishlists/classes/${classId}`);
    return response.data;
  },

  // 찜 목록에서 제거
  async removeFromWishlist(classId: number): Promise<{ message: string }> {
    const token = localStorage.getItem('accessToken'); // ✅ 토큰 수동 주입
    const response = await axiosInstance.delete(`/users/wishlists/classes/${classId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // 찜 상태 확인
  async isWishlisted(classId: number): Promise<boolean> {
    try {
      const wishlist = await this.getMyWishlist();
      return wishlist.some(item => item.classId === classId);
    } catch (error) {
      console.error('찜 상태 확인 실패:', error);
      return false;
    }
  },

  // ✅ 클래스별 찜 수 조회
  async getWishlistCount(classId: number): Promise<number> {
    const res = await axiosInstance.get(`/users/wishlists/classes/${classId}/count`);
    return res.data.count ?? 0;
  },
  
};

import axiosInstance from "./axiosInstance";

// ✅ 백엔드에서 받는 실제 카테고리 구조
export interface Category {
  id: number;
  code: string;
  displayName: string;
  displayOrder: number;
  isActive: boolean;
}

// ✅ 프론트엔드에서 사용하는 간소화된 구조
export interface CategoryOption {
  id: number;
  name: string;
}

export interface Difficulty {
  id: number;
  name: string;
}

export interface DifficultyOption {
  id: number;
  name: string;
}

export const commonApi = {
  // ✅ 활성화된 카테고리만 가져오기 (강사용)
  async getCategories(): Promise<CategoryOption[]> {
    try {
      // 1. 모든 카테고리를 가져옴
      const response = await axiosInstance.get("/meta/categories");
      const allCategories: Category[] = response.data;

      // 2. 활성화된 카테고리만 필터링하고 정렬
      const activeCategories = allCategories
        .filter((category) => category.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      // 3. 프론트엔드에서 사용할 구조로 변환
      return activeCategories.map((c) => ({
        id: c.id,
        name: c.displayName,
      }));
    } catch (error) {
      console.error("카테고리 조회 실패:", error);
      // 백엔드 API가 다른 구조를 반환하는 경우 기존 방식 사용
      const response = await axiosInstance.get("/meta/categories");
      return response.data.map((c: any) => ({
        id: c.id,
        name: c.displayName || c.name,
      }));
    }
  },

  // ✅ 관리자용 - 모든 카테고리 조회
  async getAllCategories(): Promise<Category[]> {
    const response = await axiosInstance.get("/admin/categories");
    return response.data;
  },

  // 난이도 목록 조회
  async getDifficulties(): Promise<DifficultyOption[]> {
    const response = await axiosInstance.get("/meta/levels");
    return response.data.map((d: any) => ({
      id: d.id,
      name: d.name,
    }));
  },

  // 특정 카테고리 조회
  async getCategoryById(id: number): Promise<Category> {
    const response = await axiosInstance.get(`/meta/categories/${id}`);
    return response.data;
  },

  // 특정 난이도 조회
  async getDifficultyById(id: number): Promise<Difficulty> {
    const response = await axiosInstance.get(`/meta/levels/${id}`);
    return response.data;
  },
};

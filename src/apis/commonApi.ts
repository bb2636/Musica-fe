import axiosInstance from "../apis/axiosInstance";
import type {
  Category,
  Difficulty,
  CategoryOption,
  DifficultyOption,
} from "../types/common";

export const commonApi = {
  getCategories: async (): Promise<CategoryOption[]> => {
    const res = await axiosInstance.get("/meta/categories");
    return res.data.map((c: Category) => ({
      id: c.id,
      name: c.displayName,
    }));
  },

  getDifficulties: async (): Promise<DifficultyOption[]> => {
    const res = await axiosInstance.get("/meta/levels");
    return res.data.map((d: Difficulty) => ({
      id: d.id,
      name: d.name,
    }));
  },
};

// services/commonApi.ts
import axiosInstance from "../../../../apis/axiosInstance";

export const commonApi = {
  getCategories: async () => {
    const res = await axiosInstance.get("/categories");
    return res.data; // [{ id, name }]
  },

  getDifficulties: async () => {
    const res = await axiosInstance.get("/difficulties");
    return res.data; // [{ id, name }]
  },
};
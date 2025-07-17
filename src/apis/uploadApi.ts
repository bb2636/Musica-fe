// /src/apis/uploadApi.ts

import axiosInstance from "./axiosInstance";

export const uploadApi = {
  getPresignedUrl: async (fileName: string, contentType: string) => {
    const res = await axiosInstance.post("/uploads/presigned", {
      fileName,
      contentType,
    });
    return res.data; // { uploadUrl, fileUrl }
  },
};

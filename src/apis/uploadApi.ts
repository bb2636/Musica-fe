// /src/apis/uploadApi.ts

import axiosInstance from "./axiosInstance";

// s3 업로드 url 요청
export const uploadApi = {
  getPresignedUrl: async (fileName: string, contentType: string) => {
    const res = await axiosInstance.post("/uploads/presigned", {
      fileName,
      contentType,
    });
    return res.data; // { uploadUrl, fileUrl }
  },
};

// apis/reviewApi.ts
import axiosInstance from "../apis/axiosInstance";
import type { InstructorReview, PagedResponse } from "../types/review";

export const getInstructorReviews = async (
  page = 0,
  size = 10,
  classId?: number,
  sort = "createdAt,desc"
): Promise<PagedResponse<InstructorReview>> => {
  const params: any = { page, size, sort };
  if (classId) params.classId = classId;

  const res = await axiosInstance.get("/instructors/reviews", { params });
  return res.data;
};

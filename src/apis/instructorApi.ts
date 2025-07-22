import axiosInstance from "../apis/axiosInstance";
import type {

  DashboardData, InstructorInfo,
  Question,
  Review,
  Settlement,
} from "../types/instructor";

export const instructorApi = {
  /**
   * 📌 내가 등록한 클래스 목록 조회
   * GET /api/instructors/classes
   */
  getMyClasses: async () => {
    const res = await axiosInstance.get("/instructors/classes");
    return res.data;
  },

  /**
   * 📌 클래스 등록
   * POST /api/instructors/classes
   */
  createClass: async (data: {
    title: string;
    descriptionHtml: string;
    categoryId: number;
    difficultyId: number;
    classPrice: number;
    thumbnailUrl?: string;
  }) => {
    const res = await axiosInstance.post("/instructors/classes", data);
    return res.data;
  },

  /**
   * 📌 클래스 수정
   * PUT /api/instructors/classes/{classId}
   */
  updateClass: async (
    classId: number,
    data: {
      title: string;
      descriptionHtml: string;
      categoryId: number;
      difficultyId: number;
      classPrice: number;
      thumbnailUrl?: string;
    }
  ) => {
    const res = await axiosInstance.put(
      `/instructors/classes/${classId}`,
      data
    );
    return res.data;
  },

  /**
   * 📌 클래스 삭제
   * DELETE /api/instructors/classes/{classId}
   */
  deleteClass: async (classId: number) => {
    const res = await axiosInstance.delete(`/instructors/classes/${classId}`);
    return res.data;
  },

  /**
   * 📊 대시보드 통계 조회
   * GET /api/instructors/dashboard
   */
  getDashboard: async (): Promise<DashboardData> => {
    const res = await axiosInstance.get("/instructors/dashboard");
    return res.data;
  },

  /**
   * ❓ 강사가 받은 질문 목록 조회 (status 필터 가능)
   * ✅ 해당 API는 백엔드에 /api/instructors/questions?status=PENDING 같은 형식으로 구현되어 있어야 함
   * GET /api/instructors/questions
   */
  getQuestions: async (params?: {
    status?: "PENDING" | "ANSWERED";
  }): Promise<Question[]> => {
    const res = await axiosInstance.get("/instructors/questions", { params });
    return res.data;
  },

  /**
   * 🌟 강사의 클래스에 작성된 리뷰 목록 조회
   * GET /api/instructors/reviews
   */
  getReviews: async (): Promise<Review[]> => {
    const res = await axiosInstance.get("/instructors/reviews");
    return res.data;
  },

  /**
   * 💸 강사 정산 내역 조회
   * GET /api/instructors/settlements
   */
  getSettlements: async (): Promise<Settlement[]> => {
    const res = await axiosInstance.get("/instructors/settlements");
    return res.data;
  },

  /**
   * 📝 질문에 대한 답변 등록
   * POST /api/instructors/questions/{questionId}/answer
   *
   * @param questionId - 질문 ID
   * @param answer - 답변 내용 (text)
   *
   * 백엔드가 아래와 같은 형태의 요청을 받는다고 가정:
   * {
   *   "answer": "답변 내용입니다"
   * }
   */
  answerQuestion: async (questionId: number, answer: string): Promise<void> => {
    await axiosInstance.post(`/instructors/questions/${questionId}/answer`, {
      answer,
    });
  },

  // 강사의 개인 정보 가져오는 API
  getInstructorInfo: async (): Promise<InstructorInfo> => {
    const res = await axiosInstance.get("/instructors/info");
    return res.data;
  },

  // 강사의 이름, 이메일, 비밀번호 수정 API (개인 정보 수정)
  updateInstructorInfo: async (form: {
    name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<InstructorInfo> => {
    const res = await axiosInstance.put("/instructors/info", form);
    return res.data; // ✅ 여기서 .data만 리턴
  },

  getInstructorClasses: async (params: {
    keyword?: string;
    categoryId?: number;
    difficultyId?: number;
    sort?: string;
    page?: number;
    size?: number;
  }) => {
    const res = await axiosInstance.get("/instructors/classes", { params });
    return res.data;
  },
};

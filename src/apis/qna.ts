import axiosInstance from './axiosInstance';
import type {
    CreateQuestionReqDto,
    CreateQuestionResDto,
    UpdateQuestionReqDto,
    QuestionDto,
    CreateAnswerReqDto,
    CreateAnswerResDto,
    InstructorAnswerDto
} from '../types/qna';

// 질문 등록
export const createQuestion = (data: CreateQuestionReqDto) => {
    return axiosInstance.post<CreateQuestionResDto>('/users/questions', data);
};

// 질문 수정
export const updateQuestion = (questionId: number, data: UpdateQuestionReqDto) => {
    return axiosInstance.put(`/users/questions/${questionId}`, data);
};

// 질문 삭제
export const deleteQuestion = (questionId: number) => {
    return axiosInstance.delete(`/users/questions/${questionId}`);
};

// 특정 클래스에 등록된 모든 질문 조회
export const getQuestionsByClass = (classId: number) => {
    return axiosInstance.get<QuestionDto[]>(`/classes/${classId}/questions`);
};

// 답변 등록 (강사만)
export const createAnswer = (data: CreateAnswerReqDto) => {
    return axiosInstance.post<CreateAnswerResDto>('/instructors/answers', data);
};

// 강사 마이페이지에서 자신의 답변 리스트 조회 (JWT 기반)
export const getInstructorAnswers = () => {
    return axiosInstance.get<InstructorAnswerDto[]>(`/instructors/answers`);
};

// (옵션) 특정 instructorId로 답변 리스트 조회 (필요시)
export const getInstructorAnswersById = (instructorId: number) => {
    return axiosInstance.get<InstructorAnswerDto[]>(`/instructors/${instructorId}/answers`);
};

// 유저 마이페이지에서 자신의 질문 리스트 조회
export const getMyQuestions = () => {
    return axiosInstance.get<QuestionDto[]>(`/users/mypage/questions`);
}; 
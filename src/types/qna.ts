// Q&A 관련 타입 정의

// 질문 등록 요청
export interface CreateQuestionReqDto {
    userId?: number;
    classId: number;
    question: string;
}

// 질문 등록 응답
export interface CreateQuestionResDto {
    success: boolean;
    questionId: number;
}

// 질문 수정 요청
export interface UpdateQuestionReqDto {
    question: string;
}

// 질문 조회/리스트
export interface QuestionDto {
    questionId: number;
    classId: number;
    lectureId?: number;
    userId: number;
    question: string;
    createdAt: string;
}

// 답변 등록 요청
export interface CreateAnswerReqDto {
    userId?: number;
    questionId: number;
    answer: string;
}

// 답변 등록 응답
export interface CreateAnswerResDto {
    success: boolean;
    answerId: number;
}

// 강사 답변 조회
export interface InstructorAnswerDto {
    answerId: number;
    questionId: number;
    classId: number;
    lectureId?: number;
    userId: number;
    question: string;
    answer: string;
    createdAt: string;
    answeredAt: string;
} 
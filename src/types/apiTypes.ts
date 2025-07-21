// types/apiTypes.ts - API 응답 타입 정의

export interface ApiErrorResponse {
  message: string;
  success?: boolean;
  code?: string;
}

export interface ApiSuccessResponse<T = never> {
  success: boolean;
  message?: string;
  data?: T;
}

// 카테고리 관련 타입들
export interface CategoryResponse {
  id: number;
  code: string;
  displayName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CategoryRequest {
  name: string;
  displayOrder: number;
  isActive: boolean;
}

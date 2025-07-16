// types/errors.ts
import { AxiosError } from 'axios';

/**
 * 🚨 API 에러 응답 타입
 */
export interface ApiErrorResponse {
    success?: boolean;
    message: string;
    userId?: number;
}

/**
 * 🔍 에러 타입 가드 함수들
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
    return error !== null && typeof error === 'object' && 'isAxiosError' in error;
};

export const isApiError = (error: unknown): error is AxiosError<ApiErrorResponse> => {
    return isAxiosError(error) && error.response?.data !== undefined;
};

/**
 * 🎯 에러 메시지 추출 유틸리티
 */
export const getErrorMessage = (error: unknown): string => {
    if (isApiError(error)) {
        return error.response?.data?.message || '알 수 없는 API 오류가 발생했습니다.';
    }

    if (isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
            return '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
        }
        if (error.code === 'ECONNABORTED') {
            return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
        }
        if (error.message === 'Network Error') {
            return '네트워크 연결을 확인해주세요.';
        }
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return '알 수 없는 오류가 발생했습니다.';
};

/**
 * 🎯 HTTP 상태코드별 메시지 반환
 */
export const getStatusMessage = (status?: number): string => {
    switch (status) {
        case 400:
            return '잘못된 요청입니다.';
        case 401:
            return '로그인이 필요합니다.';
        case 403:
            return '권한이 없습니다.';
        case 404:
            return '요청한 리소스를 찾을 수 없습니다.';
        case 409:
            return '이미 처리된 요청입니다.';
        case 500:
            return '서버 내부 오류가 발생했습니다.';
        default:
            return '알 수 없는 오류가 발생했습니다.';
    }
};
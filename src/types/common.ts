// 백엔드에서 내려주는 카테고리 원형 타입
export interface Category {
  id: number;
  code: string;
  displayName: string;
  displayOrder: number;
  active: boolean;
}

// 프론트에서 사용하는 옵션용 간소화 타입
export interface CategoryOption {
  id: number;
  name: string; // displayName을 변환해서 넣음
}

// 백엔드에서 내려주는 난이도 원형 타입
export interface Difficulty {
  id: number;
  name: string;
}

// 프론트에서 사용하는 옵션용 간소화 타입
export interface DifficultyOption {
  id: number;
  name: string;
}
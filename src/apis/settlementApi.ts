import axiosInstance from "./axiosInstance";
import type {
  AccountRequestDto,
  AccountResponseDto,
  MonthlyRevenueDto
} from "../types/instructor";

// 정산 계좌 등록
export const addAccount = async (dto: AccountRequestDto): Promise<AccountResponseDto> => {
  const res = await axiosInstance.post("/instructors/me/account", dto);
  return res.data;
};

// 정산 계좌 조회
export const getAccount = async (): Promise<AccountResponseDto> => {
  const res = await axiosInstance.get("/instructors/me/account");
  return res.data;
};

// 정산 계좌 수정
export const updateAccount = async (dto: AccountRequestDto): Promise<AccountResponseDto> => {
  const res = await axiosInstance.put("/instructors/me/account", dto);
  return res.data;
};

// 정산 계좌 삭제
export const deleteAccount = async (): Promise<void> => {
  await axiosInstance.delete("/instructors/me/account");
};

// 강사의 전체 매출 총합
export const getTotalSalesByInstructor = async (): Promise<number> => {
  const res = await axiosInstance.get("/instructors/statistics/revenue");
  return res.data;
};

// 강사의 클래스별 전체 매출 총합
export const getTotalSalesByClass = async (): Promise<number> => {
  const res = await axiosInstance.get("/instructors/classes/statistics/revenue");
  return res.data;
};

// 강사의 월별 매출 (년 기준)
export const getMonthlySalesByInstructor = async (year: number): Promise<MonthlyRevenueDto[]> => {
  const res = await axiosInstance.get("/instructors/statistics/year/revenue", { params: { year } });
  return res.data;
};

// 강사의 클래스별 월별 매출 (년 기준)
export const getMonthlySalesByClass = async (year: number): Promise<MonthlyRevenueDto[]> => {
  const res = await axiosInstance.get("/instructors/classes/statistics/year/revenue", { params: { year } });
  return res.data;
}; 
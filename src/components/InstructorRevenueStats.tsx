import React, { useEffect, useState } from 'react';
import axiosInstance from '../apis/axiosInstance';

interface MonthlyRevenueResponse {
  year: number;
  monthlyRevenue: number[];
}
interface RevenueResponse {
  totalRevenue: number;
}
interface ExpectedRevenueResponse {
  expectedRevenue: number;
}

const InstructorRevenueStats: React.FC = () => {
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [expectedRevenue, setExpectedRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 전체 매출
        const totalRes = await axiosInstance.get<RevenueResponse>('/instructors/statistics/revenue');
        setTotalRevenue(totalRes.data.totalRevenue);

        // 월별 매출
        const monthRes = await axiosInstance.get<MonthlyRevenueResponse>(`/instructors/statistics/revenue?year=${year}`);
        setMonthlyRevenue(monthRes.data.monthlyRevenue);

        // 이번달 예상 매출
        const expectedRes = await axiosInstance.get<ExpectedRevenueResponse>('/instructors/revenue/expected/current-month');
        setExpectedRevenue(expectedRes.data.expectedRevenue);
      } catch (err: any) {
        setError('매출 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  if (loading) {
    return <div className="text-center text-gray-500 py-20">로딩 중...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-20">{error}</div>;
  }

  return (
    <>
      {/* 전체 매출 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-lg font-semibold mb-2">총 누적 매출</div>
        <div className="text-3xl font-bold text-blue-700">{totalRevenue?.toLocaleString()}원</div>
      </div>
      {/* 이번달 예상 매출 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-lg font-semibold mb-2">이번달 예상 매출</div>
        <div className="text-2xl font-bold text-green-600">{expectedRevenue?.toLocaleString()}원</div>
      </div>
      {/* 월별 매출 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">월별 매출</div>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }).map((_, idx) => {
              const y = new Date().getFullYear() - idx;
              return (
                <option key={y} value={y}>{y}년</option>
              );
            })}
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {monthlyRevenue.map((rev, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="text-xs text-gray-500">{idx + 1}월</div>
              <div className="font-bold">{rev.toLocaleString()}원</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default InstructorRevenueStats; 
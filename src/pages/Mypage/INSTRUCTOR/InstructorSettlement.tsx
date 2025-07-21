import React, { useState, useEffect } from "react";
import { getMonthlySalesByInstructor } from "../../../apis/settlementApi";
import type { MonthlyRevenueDto } from "../../../types/instructor";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const InstructorSettlement = () => {
  const [monthlyRevenues, setMonthlyRevenues] = useState<MonthlyRevenueDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMonthlyRevenues();
    // eslint-disable-next-line
  }, [selectedYear]);

  const fetchMonthlyRevenues = async () => {
    setLoading(true);
    try {
      const data = await getMonthlySalesByInstructor(selectedYear);
      setMonthlyRevenues(data);
    } catch (error) {
      console.error("월별 매출 내역 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">월별 매출 내역</h2>
        <div className="flex space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 월별 매출 그래프 */}
      <div style={{ width: "100%", height: 300 }} className="mb-8">
        <ResponsiveContainer>
          <LineChart data={monthlyRevenues} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickFormatter={m => `${m}월`} />
            <YAxis tickFormatter={v => v.toLocaleString()} />
            <Tooltip formatter={v => `${v.toLocaleString()}원`} labelFormatter={l => `${l}월`} />
            <Line type="monotone" dataKey="totalRevenue" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-3 text-left">월</th>
              <th className="border border-gray-200 px-4 py-3 text-right">매출</th>
            </tr>
          </thead>
          <tbody>
            {monthlyRevenues.map((item) => (
              <tr key={item.month} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-3">{item.month}월</td>
                <td className="border border-gray-200 px-4 py-3 text-right">{(item.totalRevenue ?? 0).toLocaleString()}원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {monthlyRevenues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">월별 매출 내역이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default InstructorSettlement;

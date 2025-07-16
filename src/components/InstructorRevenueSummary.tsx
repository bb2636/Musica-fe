import React, { useEffect, useState } from 'react';
import axiosInstance from '../apis/axiosInstance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

const InstructorRevenueSummary: React.FC = () => {
  const navigate = useNavigate();
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [expectedRevenue, setExpectedRevenue] = useState<number | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const totalRes = await axiosInstance.get('/instructors/statistics/revenue');
        setTotalRevenue(totalRes.data.totalRevenue);

        const expectedRes = await axiosInstance.get('/instructors/revenue/expected/current-month');
        setExpectedRevenue(expectedRes.data.expectedRevenue);

        const monthRes = await axiosInstance.get(`/instructors/statistics/revenue?year=${year}`);
        setMonthlyRevenue(monthRes.data.monthlyRevenue);
      } catch (err) {
        setError('매출 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const chartData = monthlyRevenue.map((v, i) => ({
    month: `${i + 1}월`,
    revenue: v,
  }));

  if (loading) return <div className="text-center text-gray-500 py-20">로딩 중...</div>;
  if (error) return <div className="text-center text-red-500 py-20">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-gray-500 mb-1">총 누적 매출</div>
        <div className="text-2xl font-bold text-blue-700">{totalRevenue?.toLocaleString()}원</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-gray-500 mb-1">이번달 예상 매출</div>
        <div className="text-xl font-bold text-green-600">{expectedRevenue?.toLocaleString()}원</div>
      </div>
      <div
        className="bg-white rounded-lg shadow p-6 flex flex-col items-center cursor-pointer hover:bg-blue-50 transition"
        onClick={() => navigate('/instructor/revenue')}
        title="월별 매출 상세 보기"
      >
        <div className="text-gray-500 mb-1">{year}년 월별 매출</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} hide />
            <Tooltip formatter={v => `${v.toLocaleString()}원`} />
            <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InstructorRevenueSummary; 
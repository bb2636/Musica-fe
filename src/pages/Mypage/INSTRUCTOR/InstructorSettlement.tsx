// InstructorSettlement.tsx
import React, { useState, useEffect } from 'react';
import { instructorApi } from './services/instructorApi';

interface Settlement {
    id: number;
    period: string;
    totalSales: number;
    commission: number;
    netIncome: number;
    status: 'PENDING' | 'COMPLETED';
    settlementDate?: string;
}

const InstructorSettlement = () => {
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        fetchSettlements();
    }, [selectedYear, selectedMonth]);

    const fetchSettlements = async () => {
        try {
            const data = await instructorApi.getSettlements({
                year: selectedYear,
                month: selectedMonth
            });
            setSettlements(data.content || data);
        } catch (error) {
            console.error('정산 내역 로드 실패:', error);
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
                <h2 className="text-xl font-semibold">정산 내역</h2>
                <div className="flex space-x-4">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}년</option>
                        ))}
                    </select>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>{month}월</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-4 py-3 text-left">정산 기간</th>
                            <th className="border border-gray-200 px-4 py-3 text-right">총 매출</th>
                            <th className="border border-gray-200 px-4 py-3 text-right">수수료</th>
                            <th className="border border-gray-200 px-4 py-3 text-right">정산 금액</th>
                            <th className="border border-gray-200 px-4 py-3 text-center">상태</th>
                            <th className="border border-gray-200 px-4 py-3 text-center">정산일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {settlements.map((settlement) => (
                            <tr key={settlement.id} className="hover:bg-gray-50">
                                <td className="border border-gray-200 px-4 py-3">
                                    {settlement.period}
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-right">
                                    {settlement.totalSales.toLocaleString()}원
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-right text-red-600">
                                    -{settlement.commission.toLocaleString()}원
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-right font-semibold">
                                    {settlement.netIncome.toLocaleString()}원
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        settlement.status === 'COMPLETED'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {settlement.status === 'COMPLETED' ? '정산완료' : '정산대기'}
                                    </span>
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-center">
                                    {settlement.settlementDate || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {settlements.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">정산 내역이 없습니다.</p>
                </div>
            )}
        </div>
    );
};

export default InstructorSettlement;

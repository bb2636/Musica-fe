import {useEffect, useState} from "react";
import axiosInstance from "../../../apis/axiosInstance.ts";

export default function InstructorApprovalPage() {
    interface Instructor {
        id: number;
        name: string;
        email: string;
        createdAt: string;
        approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    }

    const [instructors, setInstructors] = useState<Instructor[]>([]);

    useEffect(() => {
        axiosInstance.get("/admin/instructors/pending")
            .then(res => setInstructors(res.data))
            .catch(() => alert("강사 목록 조회 실패"));
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await axiosInstance.post(`/admin/instructors/${id}/approve`);
            updateInstructorStatus(id, "APPROVED");
            alert("강사를 승인했습니다.");
        } catch {
            alert("승인 처리 실패");
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axiosInstance.post(`/admin/instructors/${id}/reject`);
            updateInstructorStatus(id, "REJECTED");
            alert("강사를 거절했습니다.");
        } catch {
            alert("거절 처리 실패");
        }
    };

    const updateInstructorStatus = (id: number, status: "PENDING" | "APPROVED" | "REJECTED") => {
        setInstructors(prev =>
            prev.map(inst =>
                inst.id === id ? {...inst, approvalStatus: status} : inst
            )
        );
    };

    // ✅ 통계 계산
    const totalCount = instructors.length;
    const pendingCount = instructors.filter(i => i.approvalStatus === "PENDING").length;

    return (
        <>
            <div className="max-w-5xl mx-auto p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">강사 승인 관리</h2>
                    <div className="text-sm text-gray-600">
                        총 {totalCount}개의 신청 | 대기 중: {pendingCount}
                    </div>
                </div>

                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2">이름</th>
                        <th className="border px-4 py-2">이메일</th>
                        <th className="border px-4 py-2">가입일</th>
                        <th className="border px-4 py-2">상태</th>
                        <th className="border px-4 py-2">액션</th>
                    </tr>
                    </thead>
                    <tbody>
                    {instructors.map(inst => (
                        <tr key={inst.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{inst.name}</td>
                            <td className="border px-4 py-2">{inst.email}</td>
                            <td className="border px-4 py-2">{inst.createdAt.slice(0, 10)}</td>
                            <td className="border px-4 py-2">
                                {inst.approvalStatus === "PENDING" &&
                                    <span className="text-yellow-600 font-semibold">대기중</span>}
                                {inst.approvalStatus === "APPROVED" &&
                                    <span className="text-green-600 font-semibold">승인됨</span>}
                                {inst.approvalStatus === "REJECTED" &&
                                    <span className="text-red-600 font-semibold">거절됨</span>}
                            </td>
                            <td className="border px-4 py-2 space-x-2">
                                <button
                                    onClick={() => handleApprove(inst.id)}
                                    disabled={inst.approvalStatus !== "PENDING"}
                                    className={`px-3 py-1 rounded transition ${
                                        inst.approvalStatus !== "PENDING"
                                            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                                            : "bg-green-500 text-white hover:bg-green-400"
                                    }`}
                                >
                                    승인
                                </button>
                                <button
                                    onClick={() => handleReject(inst.id)}
                                    disabled={inst.approvalStatus !== "PENDING"}
                                    className={`px-3 py-1 rounded transition ${
                                        inst.approvalStatus !== "PENDING"
                                            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                                            : "bg-red-500 text-white hover:bg-red-400"
                                    }`}
                                >
                                    거절
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {instructors.length === 0 && (
                    <p className="mt-6 text-center text-gray-500">승인 대기 중인 강사가 없습니다.</p>
                )}
            </div>
        </>
    );
}

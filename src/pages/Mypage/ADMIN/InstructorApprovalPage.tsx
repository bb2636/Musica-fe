import {useEffect, useState} from "react";
import axiosInstance from "../../../apis/axiosInstance.ts";
import { getErrorMessage, isAxiosError } from "../../../types/errors.ts";

export default function InstructorApprovalPage() {
    interface Instructor {
        id: number;
        name: string;
        email: string;
        createdAt: string;
        approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    }

    const [pendingInstructors, setPendingInstructors] = useState<Instructor[]>([]);
    const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
    const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

    // 🔄 데이터 로딩 함수
    const fetchInstructors = async () => {
        try {
            setLoading(true);
            setError(null);

            const [pendingRes, allRes] = await Promise.all([
                axiosInstance.get("/admin/instructors/pending"),
                axiosInstance.get("/admin/instructors/all")
            ]);

            setPendingInstructors(pendingRes.data);
            setAllInstructors(allRes.data);
        } catch (error: unknown) {
            console.error("강사 목록 조회 실패:", error);

            // 🎯 타입 안전한 에러 처리
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    setError("로그인이 필요합니다.");
                } else if (status === 403) {
                    setError("관리자 권한이 필요합니다.");
                } else {
                    setError(getErrorMessage(error));
                }
            } else {
                setError("강사 목록을 불러오는데 실패했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    // ✅ 승인 처리
    const handleApprove = async (id: number) => {
        if (processingIds.has(id)) return; // 중복 처리 방지

        try {
            setProcessingIds(prev => new Set(prev).add(id));

            await axiosInstance.post(`/admin/instructors/${id}/approve`);

            // 상태 업데이트
            updateInstructorStatus(id, "APPROVED");

            // 성공 알림 (더 부드럽게)
            showSuccessMessage("강사를 승인했습니다.");
        } catch (error: unknown) {
            console.error("승인 처리 실패:", error);

            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 404) {
                    showErrorMessage("해당 강사를 찾을 수 없습니다.");
                } else if (status === 409) {
                    showErrorMessage("이미 처리된 강사입니다.");
                } else {
                    showErrorMessage(getErrorMessage(error));
                }
            } else {
                showErrorMessage("승인 처리에 실패했습니다. 다시 시도해주세요.");
            }
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    // ❌ 거절 처리
    const handleReject = async (id: number) => {
        if (processingIds.has(id)) return; // 중복 처리 방지

        // 거절 확인
        if (!window.confirm("정말로 이 강사를 거절하시겠습니까?")) {
            return;
        }

        try {
            setProcessingIds(prev => new Set(prev).add(id));

            await axiosInstance.post(`/admin/instructors/${id}/reject`);

            // 상태 업데이트
            updateInstructorStatus(id, "REJECTED");

            showSuccessMessage("강사를 거절했습니다.");
        } catch (error: unknown) {
            console.error("거절 처리 실패:", error);

            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 404) {
                    showErrorMessage("해당 강사를 찾을 수 없습니다.");
                } else if (status === 409) {
                    showErrorMessage("이미 처리된 강사입니다.");
                } else {
                    showErrorMessage(getErrorMessage(error));
                }
            } else {
                showErrorMessage("거절 처리에 실패했습니다. 다시 시도해주세요.");
            }
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    // 🔄 상태 업데이트 (두 목록 모두 동기화)
    const updateInstructorStatus = (id: number, status: "PENDING" | "APPROVED" | "REJECTED") => {
        // 대기 목록에서 업데이트
        setPendingInstructors(prev =>
            prev.map(inst =>
                inst.id === id ? {...inst, approvalStatus: status} : inst
            )
        );

        // 전체 목록에서도 업데이트
        setAllInstructors(prev =>
            prev.map(inst =>
                inst.id === id ? {...inst, approvalStatus: status} : inst
            )
        );
    };

    // 🎯 알림 함수들
    const showSuccessMessage = (message: string) => {
        // TODO: 추후 토스트 알림으로 개선
        alert(message);
    };

    const showErrorMessage = (message: string) => {
        // TODO: 추후 토스트 알림으로 개선
        alert(message);
    };

    // 📊 통계 계산
    const totalCount = allInstructors.length;
    const pendingCount = allInstructors.filter(i => i.approvalStatus === "PENDING").length;
    const approvedCount = allInstructors.filter(i => i.approvalStatus === "APPROVED").length;
    const rejectedCount = allInstructors.filter(i => i.approvalStatus === "REJECTED").length;

    // 🎨 상태별 스타일
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "APPROVED":
                return "bg-green-100 text-green-800 border-green-300";
            case "REJECTED":
                return "bg-red-100 text-red-800 border-red-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "PENDING":
                return "대기중";
            case "APPROVED":
                return "승인됨";
            case "REJECTED":
                return "거절됨";
            default:
                return "알 수 없음";
        }
    };

    // 🚨 에러 상태
    if (error) {
        return (
            <div className="max-w-5xl mx-auto p-8">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="text-red-500 text-lg mb-4">⚠️ 오류가 발생했습니다</div>
                    <div className="text-gray-600 mb-6">{error}</div>
                    <button
                        onClick={fetchInstructors}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    // 🔄 로딩 상태
    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <div className="text-lg text-gray-600">강사 목록을 불러오는 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* 📊 헤더 & 통계 */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">강사 승인 관리</h2>
                <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">총 {totalCount}명</span>
                    <span className="text-yellow-600">대기: {pendingCount}</span>
                    <span className="text-green-600">승인: {approvedCount}</span>
                    <span className="text-red-600">거절: {rejectedCount}</span>
                </div>
            </div>

            {/* 🔄 새로고침 버튼 */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={fetchInstructors}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                    🔄 새로고침
                </button>
            </div>

            {/* 📋 탭 메뉴 */}
            <div className="flex space-x-1 mb-6">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === "pending"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    승인 대기 ({pendingCount})
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === "all"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    전체 강사 ({totalCount})
                </button>
            </div>

            {/* 📋 승인 대기 목록 */}
            {activeTab === "pending" && (
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">승인 대기 중인 강사</h3>
                    </div>

                    {pendingInstructors.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">이름</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">이메일</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">가입일</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">상태</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">액션</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pendingInstructors.map(inst => (
                                    <tr key={inst.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{inst.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{inst.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(inst.createdAt).toLocaleDateString('ko-KR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(inst.approvalStatus)}`}>
                                                {getStatusText(inst.approvalStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button
                                                onClick={() => handleApprove(inst.id)}
                                                disabled={inst.approvalStatus !== "PENDING" || processingIds.has(inst.id)}
                                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                    inst.approvalStatus !== "PENDING" || processingIds.has(inst.id)
                                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        : "bg-green-500 text-white hover:bg-green-600"
                                                }`}
                                            >
                                                {processingIds.has(inst.id) ? "처리중..." : "승인"}
                                            </button>
                                            <button
                                                onClick={() => handleReject(inst.id)}
                                                disabled={inst.approvalStatus !== "PENDING" || processingIds.has(inst.id)}
                                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                    inst.approvalStatus !== "PENDING" || processingIds.has(inst.id)
                                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        : "bg-red-500 text-white hover:bg-red-600"
                                                }`}
                                            >
                                                {processingIds.has(inst.id) ? "처리중..." : "거절"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            승인 대기 중인 강사가 없습니다.
                        </div>
                    )}
                </div>
            )}

            {/* 📋 전체 강사 목록 */}
            {activeTab === "all" && (
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">전체 강사 목록</h3>
                    </div>

                    {allInstructors.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">이름</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">이메일</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">가입일</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">상태</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">액션</th>
                                </tr>
                                </thead>
                                <tbody>
                                {allInstructors.map(inst => (
                                    <tr key={inst.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{inst.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{inst.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(inst.createdAt).toLocaleDateString('ko-KR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(inst.approvalStatus)}`}>
                                                {getStatusText(inst.approvalStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            {inst.approvalStatus === "PENDING" ? (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(inst.id)}
                                                        disabled={processingIds.has(inst.id)}
                                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                            processingIds.has(inst.id)
                                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                : "bg-green-500 text-white hover:bg-green-600"
                                                        }`}
                                                    >
                                                        {processingIds.has(inst.id) ? "처리중..." : "승인"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(inst.id)}
                                                        disabled={processingIds.has(inst.id)}
                                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                            processingIds.has(inst.id)
                                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                : "bg-red-500 text-white hover:bg-red-600"
                                                        }`}
                                                    >
                                                        {processingIds.has(inst.id) ? "처리중..." : "거절"}
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-sm text-gray-500">
                                                    {inst.approvalStatus === "APPROVED" ? "승인 완료" : "거절됨"}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            등록된 강사가 없습니다.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
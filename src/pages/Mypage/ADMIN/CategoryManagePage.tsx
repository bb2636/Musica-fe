import { useState, useEffect } from 'react';
import axiosInstance from '../../../apis/axiosInstance';
import { isAxiosError } from '../../../types/errors';
import type { ApiErrorResponse } from '../../../types/apiTypes';

interface Category {
    id: number;
    code: string;
    displayName: string;
    displayOrder: number;
    isActive: boolean;
}

interface CategoryForm {
    name: string;
    displayOrder: number;
    isActive: boolean;
}

export default function CategoryManagePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

    const [form, setForm] = useState<CategoryForm>({
        name: '',
        displayOrder: 1,
        isActive: true
    });

    // 🔄 카테고리 목록 조회
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get('/admin/categories');
            setCategories(response.data);
        } catch (error: unknown) {
            console.error('카테고리 목록 조회 실패:', error);
            if (isAxiosError(error)) {
                const errorData = error.response?.data as ApiErrorResponse;
                setError(errorData?.message || '카테고리 목록을 불러오는데 실패했습니다.');
            } else {
                setError('카테고리 목록을 불러오는데 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 📝 폼 초기화
    const resetForm = () => {
        setForm({
            name: '',
            displayOrder: 1,
            isActive: true
        });
        setEditingCategory(null);
    };

    // 📝 모달 열기
    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setForm({
                name: category.displayName,
                displayOrder: category.displayOrder,
                isActive: category.isActive
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    // 📝 모달 닫기
    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    // 📝 폼 입력 처리
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // ✅ 카테고리 생성/수정
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            alert('카테고리 이름을 입력해주세요.');
            return;
        }

        try {
            if (editingCategory) {
                // 수정
                await axiosInstance.put(`/admin/categories/${editingCategory.id}`, form);
                alert('카테고리가 성공적으로 수정되었습니다.');
            } else {
                // 생성
                await axiosInstance.post('/admin/categories', form);
                alert('카테고리가 성공적으로 생성되었습니다.');
            }

            closeModal();
            fetchCategories();
        } catch (error: unknown) {
            console.error('카테고리 저장 실패:', error);
            if (isAxiosError(error)) {
                const errorData = error.response?.data as ApiErrorResponse;
                alert(errorData?.message || '카테고리 저장에 실패했습니다.');
            } else {
                alert('카테고리 저장에 실패했습니다.');
            }
        }
    };

    // 🗑️ 카테고리 삭제
    const handleDelete = async (id: number) => {
        if (!window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
            return;
        }

        if (processingIds.has(id)) return;

        try {
            setProcessingIds(prev => new Set(prev).add(id));

            await axiosInstance.delete(`/admin/categories/${id}`);
            alert('카테고리가 성공적으로 삭제되었습니다.');
            fetchCategories();
        } catch (error: unknown) {
            console.error('카테고리 삭제 실패:', error);
            if (isAxiosError(error)) {
                const errorData = error.response?.data as ApiErrorResponse;
                alert(errorData?.message || '카테고리 삭제에 실패했습니다.');
            } else {
                alert('카테고리 삭제에 실패했습니다.');
            }
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    // 🔄 상태 토글
    const handleToggleStatus = async (id: number) => {
        if (processingIds.has(id)) return;

        try {
            setProcessingIds(prev => new Set(prev).add(id));

            await axiosInstance.patch(`/admin/categories/${id}/toggle`);
            fetchCategories();
        } catch (error: unknown) {
            console.error('카테고리 상태 변경 실패:', error);
            if (isAxiosError(error)) {
                const errorData = error.response?.data as ApiErrorResponse;
                alert(errorData?.message || '카테고리 상태 변경에 실패했습니다.');
            } else {
                alert('카테고리 상태 변경에 실패했습니다.');
            }
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    // 🔄 로딩 상태
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <div className="text-lg text-gray-600">카테고리 목록을 불러오는 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    // 🚨 에러 상태
    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-8">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="text-red-500 text-lg mb-4">⚠️ 오류가 발생했습니다</div>
                    <div className="text-gray-600 mb-6">{error}</div>
                    <button
                        onClick={fetchCategories}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* 📊 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">카테고리 관리</h2>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">총 {categories.length}개</span>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-300 hover:text-black transition-colors"
                    >
                        + 새 카테고리
                    </button>
                    <button
                        onClick={fetchCategories}
                        className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-300 hover:text-black transition-colors"
                    >
                        🔄 새로고침
                    </button>
                </div>
            </div>

            {/* 📋 카테고리 테이블 */}
            <div className="bg-white rounded-lg shadow-sm border">
                {categories.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">ID</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">코드</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">이름</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-gray-900">순서</th>
                                <th className="text-left px-9 py-3 text-sm font-medium text-gray-900">상태</th>
                                <th className="text-left px-16 py-3 text-sm font-medium text-gray-900">액션</th>
                            </tr>
                            </thead>
                            <tbody>
                            {categories.map(category => (
                                <tr key={category.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{category.id}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{category.code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{category.displayName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{category.displayOrder}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(category.id)}
                                            disabled={processingIds.has(category.id)}
                                            className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                                                category.isActive
                                                    ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                                            } ${processingIds.has(category.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {processingIds.has(category.id) ? '처리중...' : (category.isActive ? '활성' : '비활성')}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button
                                            onClick={() => openModal(category)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            disabled={processingIds.has(category.id)}
                                            className={`px-3 py-1 rounded text-sm transition-colors ${
                                                processingIds.has(category.id)
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-red-500 text-white hover:bg-red-600'
                                            }`}
                                        >
                                            {processingIds.has(category.id) ? '삭제중...' : '삭제'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        등록된 카테고리가 없습니다.
                    </div>
                )}
            </div>

            {/* 📝 생성/수정 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingCategory ? '카테고리 수정' : '새 카테고리 생성'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* 카테고리 이름 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    카테고리 이름 *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    placeholder="예: 피아노, 기타, 드럼"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* 정렬 순서 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    정렬 순서
                                </label>
                                <input
                                    type="number"
                                    name="displayOrder"
                                    value={form.displayOrder}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">숫자가 작을수록 먼저 표시됩니다.</p>
                            </div>

                            {/* 활성 상태 */}
                            <div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={form.isActive}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">활성 상태</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">비활성 시 사용자에게 표시되지 않습니다.</p>
                            </div>

                            {/* 버튼 */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    {editingCategory ? '수정' : '생성'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
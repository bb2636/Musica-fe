import { useState, useEffect } from 'react';
import { reviewApi } from '../../apis/reviewApi';
import type { LectureSummary } from '../../types/lecture';
import type { ReviewDetail } from '../../types/review';

interface ReviewFormProps {
    classId: number;
    lectures: LectureSummary[];
    editingReview?: ReviewDetail | null;
    onSuccess: () => void;
    onCancel: () => void;
    onUpdate?: (reviewId: number, data: { rating: number, comment: string }) => void;
}

const ReviewForm = ({ classId, lectures, editingReview, onSuccess, onCancel, onUpdate }: ReviewFormProps) => {
    const [formData, setFormData] = useState({
        lectureId: 0,
        rating: 5,
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // 수정 모드일 때 초기값 설정
    useEffect(() => {
        if (editingReview) {
            setFormData({
                lectureId: editingReview.lectureId,
                rating: editingReview.rating,
                comment: editingReview.comment
            });
        } else {
            setFormData({
                lectureId: 0,
                rating: 5,
                comment: ''
            });
        }
    }, [editingReview]);

    const isEditMode = !!editingReview;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.lectureId && !isEditMode) {
            alert('후기를 작성할 강의를 선택해주세요.');
            return;
        }

        if (formData.comment.trim().length < 10) {
            alert('후기는 최소 10자 이상 작성해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            if (isEditMode && editingReview && onUpdate) {
                // 수정 모드
                onUpdate(editingReview.reviewId, {
                    rating: formData.rating,
                    comment: formData.comment.trim()
                });
            } else {
                // 새 후기 작성 모드
                const response = await reviewApi.createReview({
                    classId,
                    lectureId: formData.lectureId,
                    rating: formData.rating,
                    comment: formData.comment.trim()
                });

                if (response.status === 'success') {
                    alert('후기가 등록되었습니다.');
                    setFormData({ lectureId: 0, rating: 5, comment: '' });
                    onSuccess();
                } else {
                    alert(response.message || '후기 등록에 실패했습니다.');
                }
            }
        } catch (err) {
            console.error('후기 처리 실패:', err);

            let errorMessage = isEditMode ? '후기 수정에 실패했습니다.' : '후기 등록에 실패했습니다.';

            if (typeof err === 'object' && err !== null && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }

            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStarRating = () => {
        return (
            <div className="flex gap-1 items-center">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className={`text-2xl transition-colors ${
                            star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-300`}
                        disabled={submitting}
                    >
                        ⭐
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
          ({formData.rating}점)
        </span>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>{isEditMode ? '✏️' : '✍️'}</span>
                {isEditMode ? '후기 수정하기' : '후기 작성하기'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 강의 선택 - 수정 모드에서는 비활성화 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        강의 선택 <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.lectureId}
                        onChange={(e) => setFormData(prev => ({ ...prev, lectureId: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        required
                        disabled={submitting || isEditMode} // 수정 모드에서는 강의 변경 불가
                    >
                        <option value={0}>후기를 작성할 강의를 선택하세요</option>
                        {lectures.map(lecture => (
                            <option key={lecture.lectureId} value={lecture.lectureId}>
                                {lecture.lectureOrder}. {lecture.title}
                            </option>
                        ))}
                    </select>
                    {isEditMode && (
                        <p className="text-xs text-gray-500 mt-1">
                            * 수정 시에는 강의를 변경할 수 없습니다.
                        </p>
                    )}
                </div>

                {/* 별점 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        별점 <span className="text-red-500">*</span>
                    </label>
                    {renderStarRating()}
                </div>

                {/* 후기 내용 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        후기 내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="강의에 대한 솔직한 후기를 남겨주세요. (최소 10자 이상)"
                        required
                        minLength={10}
                        maxLength={500}
                        disabled={submitting}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        {formData.comment.length}/500자
                    </div>
                </div>

                {/* 버튼들 */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={submitting || (!formData.lectureId && !isEditMode) || formData.comment.trim().length < 10}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                {isEditMode ? '수정 중...' : '등록 중...'}
              </span>
                        ) : (
                            isEditMode ? '후기 수정' : '후기 등록'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                    >
                        취소
                    </button>
                </div>
            </form>

            {/* 주의사항 */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                    <span className="font-semibold">💡 후기 작성 안내:</span><br/>
                    • 구매한 강의에 대해서만 후기 작성이 가능합니다<br/>
                    • 부적절한 내용의 후기는 관리자에 의해 삭제될 수 있습니다<br/>
                    • 작성된 후기는 다른 수강생들에게 도움이 되는 소중한 정보입니다
                </p>
            </div>
        </div>
    );
};

export default ReviewForm;
import { useEffect, useState } from 'react';
import { fetchMyReviews } from '../../../apis/user';

interface Review {
    id: number;
    comment: string;
    rating?: number;
    createdAt?: string;
    classTitle?: string;
}

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                const response = await fetchMyReviews();
                setReviews(response?.data ?? []);
            } catch (err) {
                setError('후기 목록을 불러오는데 실패했습니다.');
                console.error('후기 목록 로딩 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        loadReviews();
    }, []);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span
                key={i}
                className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
                ⭐
            </span>
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">후기 목록을 불러오는 중...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">⚠️ {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">내 후기</h2>
                <span className="text-gray-500">총 {reviews.length}개</span>
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">⭐</div>
                    <div className="text-gray-600 mb-4">아직 작성한 후기가 없습니다.</div>
                    <div className="text-sm text-gray-500">수강한 강의에 후기를 남겨보세요!</div>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    {review.classTitle && (
                                        <div className="text-sm text-blue-600 font-medium mb-2">
                                            📚 {review.classTitle}
                                        </div>
                                    )}
                                    {review.rating && (
                                        <div className="flex items-center mb-2">
                                            {renderStars(review.rating)}
                                            <span className="ml-2 text-sm text-gray-600">
                                                {review.rating}/5
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {review.createdAt && (
                                    <div className="text-sm text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <div className="text-gray-800 leading-relaxed">
                                {review.comment}
                            </div>

                            <div className="mt-4 flex space-x-2">
                                <button className="bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600">
                                    강의로 이동
                                </button>
                                <button className="bg-gray-500 text-white py-2 px-4 rounded text-sm hover:bg-gray-600">
                                    수정
                                </button>
                                <button className="bg-red-500 text-white py-2 px-4 rounded text-sm hover:bg-red-600">
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
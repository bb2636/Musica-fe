// InstructorReviews.tsx
import React, { useState, useEffect } from 'react';
import { instructorApi } from './services/instructorApi';

interface Review {
    id: number;
    studentName: string;
    className: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: string]: number };
}

const InstructorReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, []);

    const fetchReviews = async () => {
        try {
            const data = await instructorApi.getReviews();
            setReviews(data.content || data);
        } catch (error) {
            console.error('리뷰 목록 로드 실패:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await instructorApi.getReviewStats();
            setStats(data);
        } catch (error) {
            console.error('리뷰 통계 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                ⭐
            </span>
        ));
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
            <h2 className="text-xl font-semibold mb-6">리뷰 관리</h2>

            {/* 리뷰 통계 */}
            {stats && (
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">리뷰 통계</h3>
                            <div className="flex items-center space-x-4">
                                <div className="text-2xl font-bold">
                                    {stats.averageRating.toFixed(1)}
                                </div>
                                <div className="flex">
                                    {renderStars(Math.round(stats.averageRating))}
                                </div>
                                <div className="text-yellow-100">
                                    ({stats.totalReviews}개 리뷰)
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-yellow-100 mb-1">평점 분포</p>
                            {Object.entries(stats.ratingDistribution)
                                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                                .map(([rating, count]) => (
                                    <div key={rating} className="text-sm">
                                        {rating}점: {count}개
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 리뷰 목록 */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">{review.className}</h3>
                                <p className="text-sm text-gray-600">
                                    {review.studentName} • {review.createdAt}
                                </p>
                            </div>
                            <div className="flex items-center">
                                {renderStars(review.rating)}
                                <span className="ml-2 text-sm text-gray-600">
                                    {review.rating}/5
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700">{review.comment}</p>
                        </div>
                    </div>
                ))}
            </div>

            {reviews.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">리뷰가 없습니다.</p>
                </div>
            )}
        </div>
    );
};

export default InstructorReviews;

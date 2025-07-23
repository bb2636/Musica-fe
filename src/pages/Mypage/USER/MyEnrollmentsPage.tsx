import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Enrollment } from '../../../types/enrollment';
import { enrollmentApi } from '../../../apis/enrollmentApi';

const MyEnrollmentsPage: React.FC = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadEnrollments();
    }, []);

    const loadEnrollments = async () => {
        try {
            setLoading(true);
            const data = await enrollmentApi.getMyEnrollments();
            setEnrollments(data);
        } catch (err) {
            console.error('수강 내역 로딩 실패:', err);
            setError('수강 내역을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const handleContinueLearning = (enrollment: Enrollment) => {
        // 시청 페이지에서 accessible 강의로 리디렉션 처리
        navigate(`/classes/${enrollment.classId}/lectures`);
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 20) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">수강 내역을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 text-4xl mb-4">😞</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={loadEnrollments}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-white min-h-screen py-8 px-2 md:px-0 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-black">수강 중인 강의</h1>
                    <p className="text-gray-700 mt-1">총 {enrollments.length}개의 강의를 수강하고 있습니다</p>
                </div>
            </div>

            {enrollments.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">수강 중인 강의가 없습니다</h3>
                    <p className="text-gray-500 mb-6">새로운 강의를 시작해보세요!</p>
                    <button
                        onClick={() => alert('강의 목록 페이지로 이동합니다!')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        강의 둘러보기
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enrollment) => (
                        <div
                            key={enrollment.enrollmentId}
                            className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="relative">
                                <img
                                    src={enrollment.classInfo.thumbnailUrl || '/default-thumbnail.jpg'}
                                    alt={enrollment.classInfo.title}
                                    className="w-full h-48 object-cover rounded-t-xl"
                                    onError={(e) => {
                                        e.currentTarget.src = '/default-thumbnail.jpg';
                                    }}
                                />

                                <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                    {enrollment.progressRate.toFixed(0)}% 완료
                                </div>

                                <div className="absolute bottom-3 left-3 flex gap-2">
                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                        {enrollment.classInfo.categoryName}
                                    </span>
                                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                        {enrollment.classInfo.difficulty}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                                    {enrollment.classInfo.title}
                                </h3>

                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                    <span className="mr-3">👨‍🏫 {enrollment.classInfo.instructorName}</span>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>학습 진도</span>
                                        <span>{enrollment.completedLectureCount}/{enrollment.totalLectureCount} 강의</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(enrollment.progressRate)}`}
                                            style={{ width: `${enrollment.progressRate}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <span>수강 시작: {formatDate(enrollment.enrolledAt)}</span>
                                    <span>총 {formatDuration(enrollment.classInfo.totalDuration)}</span>
                                </div>

                                <button
                                    onClick={() => handleContinueLearning(enrollment)}
                                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                                >
                                    <span>▶️</span>
                                    {enrollment.progressRate > 0 ? '이어서 학습하기' : '학습 시작하기'}
                                </button>

                                {enrollment.lastAccessedAt && (
                                    <p className="text-xs text-gray-400 text-center mt-2">
                                        마지막 학습: {formatDate(enrollment.lastAccessedAt)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyEnrollmentsPage;

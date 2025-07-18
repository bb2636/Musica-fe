import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import {
    fetchMyProfile,
    fetchMyWishlist,
    fetchMyQuestions,
    fetchMyReviews,
} from '../../../apis/user.ts';

interface MyWishlistItem {
    id: number;
    title: string;
}
interface MyQuestionItem {
    id: number;
    content: string;
}
interface MyReviewItem {
    id: number;
    comment: string;
}
interface Profile {
    name: string;
    email: string;
    level?: string;
}

export default function UserMyPage() {
    const location = useLocation();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [wishlist, setWishlist] = useState<MyWishlistItem[]>([]);
    const [questions, setQuestions] = useState<MyQuestionItem[]>([]);
    const [reviews, setReviews] = useState<MyReviewItem[]>([]);

    // 현재 경로가 메인 마이페이지인지 확인
    const isMainPage = location.pathname === '/mypage/users';

    console.log('🔍 UserMyPage - 현재 경로:', location.pathname);
    console.log('🔍 UserMyPage - isMainPage:', isMainPage);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileRes, wishlistRes, questionsRes, reviewsRes] = await Promise.all([
                    fetchMyProfile(),
                    fetchMyWishlist(),
                    fetchMyQuestions(),
                    fetchMyReviews()
                ]);

                setProfile(profileRes?.data ?? null);
                setWishlist(wishlistRes?.data?.classes ?? []);
                setQuestions(questionsRes?.data ?? []);
                setReviews(reviewsRes?.data ?? []);
            } catch (error) {
                console.error('데이터 로딩 실패:', error);
            }
        };

        loadData();
    }, []);

    return (
        <>
            <Header />
            <div className="max-w-7xl mx-auto p-8 space-y-8">
                <div className="flex gap-8">
                    <aside className="w-60 bg-gray-50 p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-bold mb-4">마이페이지</h2>
                        <nav className="space-y-3">
                            <Link
                                to="/mypage/users/profile"
                                className={`block hover:underline transition-colors ${
                                    location.pathname === '/mypage/users/profile'
                                        ? 'text-blue-800 font-semibold'
                                        : 'text-blue-600 hover:text-blue-800'
                                }`}
                            >
                                내 정보 수정
                            </Link>
                            <Link
                                to="/mypage/users/wishlist"
                                className={`block hover:underline transition-colors ${
                                    location.pathname === '/mypage/users/wishlist'
                                        ? 'text-blue-800 font-semibold'
                                        : 'text-blue-600 hover:text-blue-800'
                                }`}
                            >
                                찜 목록 전체보기
                            </Link>
                            <Link
                                to="/mypage/users/questions"
                                className={`block hover:underline transition-colors ${
                                    location.pathname === '/mypage/users/questions'
                                        ? 'text-blue-800 font-semibold'
                                        : 'text-blue-600 hover:text-blue-800'
                                }`}
                            >
                                내 질문 전체보기
                            </Link>
                            <Link
                                to="/mypage/users/reviews"
                                className={`block hover:underline transition-colors ${
                                    location.pathname === '/mypage/users/reviews'
                                        ? 'text-blue-800 font-semibold'
                                        : 'text-blue-600 hover:text-blue-800'
                                }`}
                            >
                                내 후기 전체보기
                            </Link>
                            <Link
                                to="/mypage/users/tuner"
                                className={`block hover:underline transition-colors ${
                                    location.pathname === '/mypage/users/tuner'
                                        ? 'text-blue-800 font-semibold'
                                        : 'text-blue-600 hover:text-blue-800'
                                }`}
                            >
                                AI 튜너 바로가기
                            </Link>
                        </nav>
                    </aside>

                    <main className="flex-1">
                        <Outlet />

                        {/* ✅ 메인 페이지일 때만 카드 표시 */}
                        {isMainPage && (
                            <div className="grid grid-cols-2 gap-6 mt-8">
                                <Card
                                    emoji="👤"
                                    title="내 정보"
                                    desc="회원 정보 수정하기"
                                    link="/mypage/users/profile"
                                >
                                    {profile ? (
                                        <div className="space-y-1">
                                            <p><strong>이름:</strong> {profile.name}</p>
                                            <p><strong>이메일:</strong> {profile.email}</p>
                                            <p><strong>레벨:</strong> {profile.level ?? '없음'}</p>
                                        </div>
                                    ) : (
                                        <p>정보를 불러오는 중입니다...</p>
                                    )}
                                </Card>

                                <Card
                                    emoji="❤️"
                                    title="찜 목록"
                                    desc="관심 강의 모아보기"
                                    link="/mypage/users/wishlist"
                                >
                                    {wishlist.length > 0 ? (
                                        <ul className="space-y-1">
                                            {wishlist.slice(0, 3).map(w => (
                                                <li key={w.id} className="text-sm text-gray-600 truncate">
                                                    • {w.title}
                                                </li>
                                            ))}
                                            {wishlist.length > 3 && (
                                                <li className="text-xs text-gray-500">
                                                    외 {wishlist.length - 3}개 더...
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">찜한 강의가 없습니다.</p>
                                    )}
                                </Card>

                                <Card
                                    emoji="❓"
                                    title="내 질문"
                                    desc="강의에 남긴 질문 확인"
                                    link="/mypage/users/questions"
                                >
                                    {questions.length > 0 ? (
                                        <ul className="space-y-1">
                                            {questions.slice(0, 3).map(q => (
                                                <li key={q.id} className="text-sm text-gray-600 truncate">
                                                    • {q.content}
                                                </li>
                                            ))}
                                            {questions.length > 3 && (
                                                <li className="text-xs text-gray-500">
                                                    외 {questions.length - 3}개 더...
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">등록한 질문이 없습니다.</p>
                                    )}
                                </Card>

                                <Card
                                    emoji="⭐"
                                    title="내 후기"
                                    desc="작성한 후기 모아보기"
                                    link="/mypage/users/reviews"
                                >
                                    {reviews.length > 0 ? (
                                        <ul className="space-y-1">
                                            {reviews.slice(0, 3).map(r => (
                                                <li key={r.id} className="text-sm text-gray-600 truncate">
                                                    • {r.comment}
                                                </li>
                                            ))}
                                            {reviews.length > 3 && (
                                                <li className="text-xs text-gray-500">
                                                    외 {reviews.length - 3}개 더...
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">작성한 후기가 없습니다.</p>
                                    )}
                                </Card>

                                <Card
                                    emoji="🎵"
                                    title="AI 튜너"
                                    desc="마이크로 조율하는 AI 튜너"
                                    link="/mypage/users/tuner"
                                >
                                    <p>실시간 음정 분석</p>
                                    <p>마이크만 있으면 OK!</p>
                                </Card>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <Footer />
        </>
    );
}

interface CardProps {
    emoji: string;
    title: string;
    desc: string;
    link: string;
    children: React.ReactNode;
}

const Card = ({ emoji, title, desc, link, children }: CardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(link);
    };

    return (
        <div
            onClick={handleClick}
            className="cursor-pointer bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
            <div className="flex items-center space-x-2 mb-3">
                <span className="text-3xl">{emoji}</span>
                <div>
                    <div className="font-semibold text-sm text-gray-800">{title}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                </div>
            </div>
            <div className="text-sm text-gray-700" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};
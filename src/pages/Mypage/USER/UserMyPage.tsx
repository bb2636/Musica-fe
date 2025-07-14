import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    level?: { name: string };
}

export default function UserMyPage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [wishlist, setWishlist] = useState<MyWishlistItem[]>([]);
    const [questions, setQuestions] = useState<MyQuestionItem[]>([]);
    const [reviews, setReviews] = useState<MyReviewItem[]>([]);

    useEffect(() => {
        fetchMyProfile().then(res => setProfile(res?.data ?? null));
        fetchMyWishlist().then(res => setWishlist(res?.data?.classes ?? []));
        fetchMyQuestions().then(res => setQuestions(res?.data ?? []));
        fetchMyReviews().then(res => setReviews(res?.data ?? []));
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8">
            <Card
                emoji="👤"
                title="내 정보"
                desc="회원 정보 수정하기"
                onClick={() => navigate('/mypage/users/profile')}
            >
                {profile ? (
                    <div className="space-y-1">
                        <p>이름: {profile.name}</p>
                        <p>이메일: {profile.email}</p>
                        <p>레벨: {profile.level?.name ?? '없음'}</p>
                    </div>
                ) : (
                    <p>정보를 불러오는 중입니다...</p>
                )}
            </Card>

            <Card
                emoji="❤️"
                title="찜 목록"
                desc="관심 강의 모아보기"
                onClick={() => navigate('/mypage/users/wishlist')}
            >
                {wishlist.length > 0 ? (
                    <ul className="space-y-1">
                        {wishlist.slice(0,3).map(w => (
                            <li key={w.id}>{w.title}</li>
                        ))}
                    </ul>
                ) : (
                    <p>찜한 강의가 없습니다.</p>
                )}
                <div className="mt-2">
                    <button onClick={e => { e.stopPropagation(); navigate('/mypage/users/wishlist'); }}
                            className="text-sm text-blue-600 hover:underline">
                        전체 보기
                    </button>
                </div>
            </Card>

            <Card
                emoji="❓"
                title="내 질문"
                desc="강의에 남긴 질문 확인"
                onClick={() => navigate('/mypage/users/questions')}
            >
                {questions.length > 0 ? (
                    <ul className="space-y-1">
                        {questions.slice(0,3).map(q => (
                            <li key={q.id}>{q.content}</li>
                        ))}
                    </ul>
                ) : (
                    <p>등록한 질문이 없습니다.</p>
                )}
                <div className="mt-2">
                    <button onClick={e => { e.stopPropagation(); navigate('/mypage/users/questions'); }}
                            className="text-sm text-blue-600 hover:underline">
                        전체 보기
                    </button>
                </div>
            </Card>

            <Card
                emoji="⭐"
                title="내 후기"
                desc="작성한 후기 모아보기"
                onClick={() => navigate('/mypage/users/reviews')}
            >
                {reviews.length > 0 ? (
                    <ul className="space-y-1">
                        {reviews.slice(0,3).map(r => (
                            <li key={r.id}>{r.comment}</li>
                        ))}
                    </ul>
                ) : (
                    <p>작성한 후기가 없습니다.</p>
                )}
                <div className="mt-2">
                    <button onClick={e => { e.stopPropagation(); navigate('/mypage/users/reviews'); }}
                            className="text-sm text-blue-600 hover:underline">
                        전체 보기
                    </button>
                </div>
            </Card>
        </div>
    );
}

interface CardProps {
    emoji: string;
    title: string;
    desc: string;
    onClick: () => void;
    children: React.ReactNode;
}

const Card = ({ emoji, title, desc, onClick, children }: CardProps) => (
    <div
        onClick={onClick}
        className="cursor-pointer bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
    >
        <div className="flex items-center space-x-2 mb-2">
            <span className="text-3xl">{emoji}</span>
            <div>
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-xs text-gray-500">{desc}</div>
            </div>
        </div>
        <div className="text-sm text-gray-700" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

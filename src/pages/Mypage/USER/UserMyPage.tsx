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
import { enrollmentApi } from '../../../apis/enrollmentApi';
import type { Enrollment } from '../../../types/enrollment';
import { getPayments } from "../../../apis/payment";

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

interface PaymentItem {
  paymentId: number;
  title: string;
  thumbnailUrl: string;
  amount: number;
  status: string | { id: number; name: string };
  paidAt: string;
}

export default function UserMyPage() {
    const location = useLocation();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [wishlist, setWishlist] = useState<MyWishlistItem[]>([]);
    const [questions, setQuestions] = useState<MyQuestionItem[]>([]);
    const [reviews, setReviews] = useState<MyReviewItem[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

    const isMainPage = location.pathname === '/mypage/users';

    console.log('🔍 UserMyPage - 현재 경로:', location.pathname);
    console.log('🔍 UserMyPage - isMainPage:', isMainPage);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [
                    profileRes,
                    wishlistRes,
                    questionsRes,
                    reviewsRes,
                    enrollmentsRes
                ] = await Promise.all([
                    fetchMyProfile(),
                    fetchMyWishlist(),
                    fetchMyQuestions(),
                    fetchMyReviews(),
                    enrollmentApi.getMyEnrollments()
                ]);

                setProfile(profileRes?.data ?? null);
                setWishlist(wishlistRes?.data?.classes ?? []);
                setQuestions(questionsRes?.data ?? []);
                setReviews(reviewsRes?.data ?? []);
                setEnrollments(enrollmentsRes ?? []);
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
                            <Link to="/mypage/users/profile" className={`block hover:underline transition-colors ${location.pathname === '/mypage/users/profile' ? 'text-blue-800 font-semibold' : 'text-blue-600 hover:text-blue-800'}`}>내 정보 수정</Link>
                            <Link to="/mypage/users/enrollments" className={`block hover:underline transition-colors ${location.pathname === '/mypage/users/enrollments' ? 'text-blue-800 font-semibold' : 'text-blue-600 hover:text-blue-800'}`}>수강 중인 강의 목록</Link>
                            <Link to="/mypage/users/wishlist" className={`block hover:underline transition-colors ${location.pathname === '/mypage/users/wishlist' ? 'text-blue-800 font-semibold' : 'text-blue-600 hover:text-blue-800'}`}>찜 목록 전체보기</Link>
                            <Link to="/mypage/users/questions" className={`block hover:underline transition-colors ${location.pathname === '/mypage/users/questions' ? 'text-blue-800 font-semibold' : 'text-blue-600 hover:text-blue-800'}`}>내 질문 전체보기</Link>
                            <Link to="/mypage/users/reviews" className={`block hover:underline transition-colors ${location.pathname === '/mypage/users/reviews' ? 'text-blue-800 font-semibold' : 'text-blue-600 hover:text-blue-800'}`}>내 후기 전체보기</Link>
                            <Link to="/mypage/users/tuner" className={`block hover:underline transition-colors ${location.pathname === '/mypage/users/tuner' ? 'text-blue-800 font-semibold' : 'text-blue-600 hover:text-blue-800'}`}>AI 튜너 바로가기</Link>
                            <Link to="/mypage/users/payments" className={`block hover:underline transition-colors ${location.pathname === '/mypage/users/payments' ? 'text-blue-800 font-semibold' : 'text-blue-600 hover:text-blue-800'}`}>결제 내역</Link>
                        </nav>
                    </aside>

                    <main className="flex-1">
                        <Outlet />
                        {isMainPage && (
                            <>
                                <div className="grid grid-cols-2 gap-6 mt-8">
                                    <Card emoji="👤" title="내 정보" desc="회원 정보 수정하기" link="/mypage/users/profile">
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

                                    <Card emoji="📘" title="수강 중인 강의" desc="내가 결제한 강의 보기" link="/mypage/users/enrollments">
                                        {enrollments.length > 0 ? (
                                            <ul className="space-y-1">
                                                {enrollments.slice(0, 3).map(e => {
                                                    console.log('enrollment:', e);
                                                    console.log('enrollment.classInfo:', e.classInfo);
                                                    console.log('enrollment.title:', (e as any).title);
                                                    return (
                                                        <li key={e.enrollmentId} className="text-sm text-gray-600 truncate">• {e.classInfo?.title || (e as any).title || '제목 없음'}</li>
                                                    );
                                                })}
                                                {enrollments.length > 3 && <li className="text-xs text-gray-500">외 {enrollments.length - 3}개 더...</li>}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">수강 중인 강의가 없습니다.</p>
                                        )}
                                    </Card>

                                    <Card emoji="❤️" title="찜 목록" desc="관심 강의 모아보기" link="/mypage/users/wishlist">
                                        {wishlist.length > 0 ? (
                                            <ul className="space-y-1">
                                                {wishlist.slice(0, 3).map(w => {
                                                    console.log('wishlist:', w);
                                                    return (
                                                        <li key={w.id} className="text-sm text-gray-600 truncate">• {w.title}</li>
                                                    );
                                                })}
                                                {wishlist.length > 3 && <li className="text-xs text-gray-500">외 {wishlist.length - 3}개 더...</li>}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">찜한 강의가 없습니다.</p>
                                        )}
                                    </Card>

                                    <Card emoji="❓" title="내 질문" desc="강의에 남긴 질문 확인" link="/mypage/users/questions">
                                        {questions.length > 0 ? (
                                            <ul className="space-y-1">
                                                {questions.slice(0, 3).map(q => {
                                                    console.log('question:', q);
                                                    return (
                                                        <li key={q.id} className="text-sm text-gray-600 truncate">• {q.content}</li>
                                                    );
                                                })}
                                                {questions.length > 3 && <li className="text-xs text-gray-500">외 {questions.length - 3}개 더...</li>}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">등록한 질문이 없습니다.</p>
                                        )}
                                    </Card>

                                    <Card emoji="⭐" title="내 후기" desc="작성한 후기 모아보기" link="/mypage/users/reviews">
                                        {reviews.length > 0 ? (
                                            <ul className="space-y-1">
                                                {reviews.slice(0, 3).map(r => {
                                                    console.log('review:', r);
                                                    return (
                                                        <li key={r.id} className="text-sm text-gray-600 truncate">• {r.comment}</li>
                                                    );
                                                })}
                                                {reviews.length > 3 && <li className="text-xs text-gray-500">외 {reviews.length - 3}개 더...</li>}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">작성한 후기가 없습니다.</p>
                                        )}
                                    </Card>

                                    <Card emoji="🎵" title="AI 튜너" desc="마이크로 조율하는 AI 튜너" link="/mypage/users/tuner">
                                        <p>실시간 음정 분석</p>
                                        <p>마이크만 있으면 OK!</p>
                                    </Card>
                                </div>
                                <PaymentSummary />
                            </>
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
        <div onClick={handleClick} className="cursor-pointer bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
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

const PaymentSummary: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPayments("ALL").then(res => setPayments(res.data.slice(0, 3))); // 최근 3건만
  }, []);

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">최근 결제 내역</h3>
        <button
          className="text-blue-600 text-sm"
          onClick={() => navigate("payments")}
        >
          전체 보기 &gt;
        </button>
      </div>
      {payments.length === 0 ? (
        <div className="text-gray-400 text-sm">결제 내역이 없습니다.</div>
      ) : (
        <ul>
          {payments.map((item) => {
            console.log('PaymentSummary payment item:', item);
            return (
              <li key={item.paymentId} className="flex justify-between py-1 border-b last:border-b-0">
                <span>{item.title}</span>
                <span className="font-semibold">{item.amount.toLocaleString()}원</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
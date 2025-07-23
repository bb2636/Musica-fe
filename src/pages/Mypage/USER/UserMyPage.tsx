import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  fetchMyProfile,
  fetchMyQuestions,
  fetchMyReviews,
} from "../../../apis/user.ts";
import { wishlistApi } from "../../../apis/WishlistApi";
import type { WishlistItem } from "../../../types/WishlistItem";
import { enrollmentApi } from "../../../apis/enrollmentApi";
import type { Enrollment } from "../../../types/enrollment";
import { getPayments } from "../../../apis/payment";

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
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [questions, setQuestions] = useState<MyQuestionItem[]>([]);
  const [reviews, setReviews] = useState<MyReviewItem[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const isMainPage = location.pathname === "/mypage/users";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          profileRes,
          wishlistRes,
          questionsRes,
          reviewsRes,
          enrollmentsRes,
        ] = await Promise.all([
          fetchMyProfile(),
          wishlistApi.getMyWishlist(),
          fetchMyQuestions(),
          fetchMyReviews(),
          enrollmentApi.getMyEnrollments(),
        ]);

        setProfile(profileRes?.data ?? null);
        setWishlist(wishlistRes ?? []);
        setQuestions(questionsRes?.data ?? []);
        setReviews(reviewsRes?.data ?? []);
        setEnrollments(enrollmentsRes ?? []);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <Header />
      <div className="bg-white min-h-[calc(100vh-120px)] py-10">
        <div className="max-w-7xl mx-auto flex gap-8 px-4 md:px-8">
          {/* 왼쪽 세로 nav */}
          <aside className="w-60 bg-white p-6 rounded-xl shadow-sm flex-shrink-0 h-fit border border-neutral-200">
            <h2 className="text-lg font-bold mb-4 text-black">마이페이지</h2>
            <nav className="space-y-3">
              <Link
                to="/mypage/users/profile"
                className={`block transition-colors rounded-lg px-3 py-2 font-medium text-base ${location.pathname === "/mypage/users/profile" ? "bg-black text-white" : "text-gray-800 hover:bg-neutral-200 hover:text-black"}`}
              >
                내 정보 수정
              </Link>
              <Link
                to="/mypage/users/enrollments"
                className={`block transition-colors rounded-lg px-3 py-2 font-medium text-base ${location.pathname === "/mypage/users/enrollments" ? "bg-black text-white" : "text-gray-800 hover:bg-neutral-200 hover:text-black"}`}
              >
                수강 중인 강의 목록
              </Link>
              <Link
                to="/mypage/users/wishlist"
                className={`block transition-colors rounded-lg px-3 py-2 font-medium text-base ${location.pathname === "/mypage/users/wishlist" ? "bg-black text-white" : "text-gray-800 hover:bg-neutral-200 hover:text-black"}`}
              >
                찜 목록 전체보기
              </Link>
              <Link
                to="/mypage/users/questions"
                className={`block transition-colors rounded-lg px-3 py-2 font-medium text-base ${location.pathname === "/mypage/users/questions" ? "bg-black text-white" : "text-gray-800 hover:bg-neutral-200 hover:text-black"}`}
              >
                내 질문 전체보기
              </Link>
              <Link
                to="/mypage/users/reviews"
                className={`block transition-colors rounded-lg px-3 py-2 font-medium text-base ${location.pathname === "/mypage/users/reviews" ? "bg-black text-white" : "text-gray-800 hover:bg-neutral-200 hover:text-black"}`}
              >
                내 후기 전체보기
              </Link>
              <Link
                to="/mypage/users/tuner"
                className={`block transition-colors rounded-lg px-3 py-2 font-medium text-base ${location.pathname === "/mypage/users/tuner" ? "bg-black text-white" : "text-gray-800 hover:bg-neutral-200 hover:text-black"}`}
              >
                AI 튜너 바로가기
              </Link>
              <Link
                to="/mypage/users/payments"
                className={`block transition-colors rounded-lg px-3 py-2 font-medium text-base ${location.pathname === "/mypage/users/payments" ? "bg-black text-white" : "text-gray-800 hover:bg-neutral-200 hover:text-black"}`}
              >
                결제 내역
              </Link>
            </nav>
          </aside>
          {/* 오른쪽 메인 콘텐츠 */}
          <main className="flex-1">
            <Outlet />
            {isMainPage && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <Card title="내 정보" desc="회원 정보 수정하기" link="/mypage/users/profile">
                    {profile ? (
                      <div className="space-y-1">
                        <p>
                          <strong>이름:</strong> {profile.name}
                        </p>
                        <p>
                          <strong>이메일:</strong> {profile.email}
                        </p>
                        <p>
                          <strong>레벨:</strong> {profile.level ?? "없음"}
                        </p>
                      </div>
                    ) : (
                      <p>정보를 불러오는 중입니다...</p>
                    )}
                  </Card>

                  <Card title="수강 중인 강의" desc="내가 결제한 강의 보기" link="/mypage/users/enrollments">
                    {enrollments.length > 0 ? (
                      <ul className="space-y-2">
                        {enrollments.slice(0, 2).map(e => (
                          <li
                            key={(e as any).class_id}
                            className="flex items-center gap-3 bg-neutral-100 rounded p-2 cursor-pointer hover:bg-neutral-200 transition"
                            onClick={() => window.location.href = `/classes/${(e as any).class_id}`}
                          >
                            <img
                              src={(e as any).thumbnailUrl}
                              alt={(e as any).title}
                              className="w-12 h-12 object-cover rounded"
                              onError={ev => (ev.currentTarget.src = '/default-thumbnail.png')}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate text-black">{(e as any).title}</div>
                              <div className="text-xs text-gray-500 truncate">강사: {(e as any).instructorName}</div>
                              <div className="text-xs text-gray-500">진도율: {(e as any).progress}%</div>
                            </div>
                            <div className="text-sm font-bold whitespace-nowrap text-black">{(e as any).amount?.toLocaleString()}원</div>
                          </li>
                        ))}
                        {enrollments.length > 2 && (
                          <li className="text-xs text-gray-500">외 {enrollments.length - 2}개 더...</li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-500">수강 중인 강의가 없습니다.</p>
                    )}
                  </Card>

                  <Card title="찜 목록" desc="관심 강의 모아보기" link="/mypage/users/wishlist">
                    {wishlist.length > 0 ? (
                      <ul className="space-y-1">
                        {wishlist.slice(0, 3).map((w) => (
                          <li
                            key={w.classId}
                            className="text-sm text-gray-700 truncate"
                          >
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

                  <Card title="내 질문" desc="강의에 남긴 질문 확인" link="/mypage/users/questions">
                    {questions.length > 0 ? (
                      <ul className="space-y-1">
                        {questions.slice(0, 3).map((q) => (
                          <li
                            key={q.id}
                            className="text-sm text-gray-700 truncate"
                          >
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

                  <Card title="내 후기" desc="작성한 후기 모아보기" link="/mypage/users/reviews">
                    {reviews.length > 0 ? (
                      <ul className="space-y-1">
                        {reviews.slice(0, 3).map((r) => (
                          <li
                            key={r.id}
                            className="text-sm text-gray-700 truncate"
                          >
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

                  <Card title="AI 튜너" desc="마이크로 조율하는 AI 튜너" link="/mypage/users/tuner">
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
  title: string;
  desc: string;
  link: string;
  children: React.ReactNode;
}

const Card = ({ title, desc, link, children }: CardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(link);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 border border-neutral-200"
    >
      <div className="mb-3">
        <div className="font-semibold text-base text-black mb-1">{title}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
      <div
        className="text-sm text-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const PaymentSummary: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPayments("ALL").then((res) => setPayments(res.data.slice(0, 3)));
  }, []);

  return (
      <div
          onClick={() => navigate("payments")}
          className="cursor-pointer bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
      >
        {/* ✅ 카드 헤더 스타일 통일 */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-3xl">💳</span>
          <div>
            <div className="font-semibold text-sm text-gray-800">결제 내역</div>
            <div className="text-xs text-gray-500">최근 결제 3건</div>
          </div>
        </div>

        {/* ✅ 카드 본문 내용 */}
        <div className="text-sm text-gray-700">
          {payments.length === 0 ? (
              <div className="text-gray-400">결제 내역이 없습니다.</div>
          ) : (
              <ul className="space-y-1">
                {payments.map((item) => (
                    <li
                        key={item.paymentId}
                        className="flex justify-between py-1 border-b last:border-b-0"
                    >
                      <span className="truncate">{item.title}</span>
                      <span className="font-semibold">
                  {item.amount.toLocaleString()}원
                </span>
                    </li>
                ))}
              </ul>
          )}
        </div>
      </div>
  );
};
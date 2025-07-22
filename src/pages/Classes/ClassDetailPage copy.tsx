import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { classApi } from "../../apis/classesApi";
import { wishlistApi } from "../../apis/WishlistApi.ts";
import { cartApi } from "../../apis/cart";
import { reviewApi } from "../../apis/reviewApi";
import type { ReviewDetail, ReviewSummaryCard } from "../../types/review";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ReviewForm from "./ReviewForm";
import type { ClassDetail } from "../../types/class";

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewDetail[]>([]);
  const [reviewSummaries, setReviewSummaries] = useState<ReviewSummaryCard[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewDetail | null>(null);

  useEffect(() => {
    if (!classId) return;
    loadAllData();
  }, [classId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadClassDetail(),
        loadReviews(),
        loadReviewSummaries(),
        checkWishlistStatus(),
        checkCartStatus(),
      ]);
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassDetail = async () => {
    try {
      const data = await classApi.getClassDetail(Number(classId));
      setClassDetail(data);
    } catch (err) {
      console.error("클래스 상세 정보 로딩 실패:", err);
      setError("클래스 정보를 불러오는데 실패했습니다.");
    }
  };

  const loadReviews = async () => {
    try {
      const reviewData = await reviewApi.getClassReviews(Number(classId));
      setReviews(reviewData);
    } catch (err) {
      console.error("후기 로딩 실패:", err);
    }
  };

  const loadReviewSummaries = async () => {
    try {
      const summaries = await reviewApi.getReviewSummaryCards();
      setReviewSummaries(summaries.slice(0, 3));
    } catch (err) {
      console.error("후기 요약 로딩 실패:", err);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const wishlist = await wishlistApi.getMyWishlist();
      const isLiked = wishlist.some((item) => item.classId === Number(classId));
      setIsWishlisted(isLiked);
    } catch (err) {
      console.error("찜 목록 확인 실패:", err);
    }
  };

  const checkCartStatus = async () => {
    try {
      const isInUserCart = await cartApi.isInCart(Number(classId));
      setIsInCart(isInUserCart);
    } catch (err) {
      console.error("장바구니 확인 실패:", err);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(Number(classId));
        setIsWishlisted(false);
        alert("찜 목록에서 제거되었습니다.");
      } else {
        await wishlistApi.addToWishlist(Number(classId));
        setIsWishlisted(true);
        alert("찜 목록에 추가되었습니다.");
      }
    } catch (err) {
      console.error("찜 목록 처리 실패:", err);

      let errorMessage = "로그인이 필요한 서비스입니다.";

      if (err instanceof Error) {
        console.error("Error details:", err.message);
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        errorMessage =
          axiosError.response?.data?.message || "로그인이 필요한 서비스입니다.";
      }

      alert(errorMessage);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (isInCart) {
        alert("이미 장바구니에 있는 강의입니다.");
        return;
      }

      // ✅ 새로운 cartApi 사용 (PUT 요청)
      const response = await cartApi.addToCart(Number(classId));

      if (response.status === "success") {
        setIsInCart(true);
        alert(response.message);

        // 🔔 헤더 장바구니 카운트 업데이트
        // window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        alert(response.message || "장바구니 추가에 실패했습니다.");
      }
    } catch (err) {
      console.error("장바구니 추가 실패:", err);

      let errorMessage = "장바구니 추가에 실패했습니다.";

      // Axios 에러 처리
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as {
          response?: {
            status?: number;
            data?: { message?: string };
          };
        };

        if (axiosError.response?.status === 401) {
          errorMessage = "로그인이 필요한 서비스입니다.";
        } else if (axiosError.response?.status === 400) {
          errorMessage =
            axiosError.response.data?.message ||
            "이미 결제한 클래스는 장바구니에 담을 수 없습니다.";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      alert(errorMessage);
    }
  };

  const handlePurchase = async () => {
    if (!classDetail || !classId) return;

    if (classDetail.userClassStatus?.enrolled) {
      alert("이미 수강 중인 클래스입니다.");
      return;
    }

    try {
      let cartItemId: number;

      if (isInCart) {
        // 👉 이미 장바구니에 담겨 있다면 cartItemId 찾기
        const res = await cartApi.getCartItems();
        const matchedItem = res.cartItems.find(
          (item) => item.classId === Number(classId)
        );
        if (!matchedItem) throw new Error("장바구니 항목을 찾을 수 없습니다.");
        cartItemId = matchedItem.cartItemId;
      } else {
        // 👉 장바구니에 추가 후 cartItemId 받아서 이동
        const res = await cartApi.addToCart(Number(classId));
        if (res.status !== "success") throw new Error(res.message);

        // ⛳ 백엔드 응답에 아래 형태로 내려와야 함
        // { status: 'success', message: '추가됨', items: { cartItemId: number } }
        cartItemId = res.items.cartItemId;

        setIsInCart(true);
      }

      // 👉 결제 페이지 이동 (장바구니 기반)
      navigate(
        `/payment?type=cart&cartItemIds=${cartItemId}&price=${classDetail.classPrice}`
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("서버 메시지:", error.response?.data?.message);
      }
    }
  };

  // const handlePurchase = () => {
  //   if (!classDetail) return;

  //   if (classDetail.userClassStatus?.enrolled) {
  //     alert("이미 수강 중인 클래스입니다.");
  //     return;
  //   }

  //   // 즉시 구매 처리
  //   navigate(
  //     `/payment?type=direct&classId=${classId}&price=${classDetail.classPrice}`
  //   );
  // };

  const handleGoToCart = () => {
    navigate("/cart");
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPrice = (price: number): string => {
    return price === 0 ? "무료" : `${price.toLocaleString()}원`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ⭐
      </span>
    ));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    );
  };

  const handleReviewEdit = (review: ReviewDetail) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewUpdate = async (
    reviewId: number,
    data: { rating: number; comment: string }
  ) => {
    try {
      const response = await reviewApi.updateReview(reviewId, data);
      if (response.status === "success") {
        alert("후기가 수정되었습니다.");
        setEditingReview(null);
        setShowReviewForm(false);
        loadReviews(); // 후기 목록 새로고침
      } else {
        alert(response.message || "후기 수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("후기 수정 실패:", err);
      alert("후기 수정에 실패했습니다.");
    }
  };

  const handleReviewDelete = async (reviewId: number) => {
    if (!window.confirm("후기를 삭제하시겠습니까?")) return;

    try {
      const response = await reviewApi.deleteReview(reviewId);
      if (response.status === "success") {
        alert("후기가 삭제되었습니다.");
        loadReviews(); // 후기 목록 새로고침
      } else {
        alert(response.message || "후기 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("후기 삭제 실패:", err);
      alert("후기 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">강의 정보를 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !classDetail) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              앗! 문제가 발생했어요
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "클래스를 찾을 수 없습니다."}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                이전 페이지로
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const totalDuration = classDetail.lectures.reduce(
    (sum, lecture) => sum + lecture.duration,
    0
  );
  const isEnrolled = classDetail.userClassStatus?.enrolled || false;
  console.log("userClassStatus:", classDetail.userClassStatus); // 클래스 등록(구매) 여부 확인 로그 출력
  const averageRating = calculateAverageRating();

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* 🏠 클래스 헤더 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <img
              src={classDetail.thumbnailUrl || "/default-thumbnail.jpg"}
              alt={classDetail.title}
              className="w-full aspect-video object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "/default-thumbnail.jpg";
              }}
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {classDetail.categoryName}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                {classDetail.difficulty}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {classDetail.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                👨‍🏫 {classDetail.instructorName}
              </span>
              <span className="flex items-center gap-1">
                📚 {classDetail.lectures.length}개 강의
              </span>
              <span className="flex items-center gap-1">
                ⏱️ 총 {formatDuration(totalDuration)}
              </span>
              <span className="flex items-center gap-1">
                ⭐ {averageRating.toFixed(1)} ({reviews.length}개 후기)
              </span>
            </div>

            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(classDetail.classPrice)}
            </div>

            {/* 📊 수강 진행률 (수강생만) */}
            {isEnrolled && classDetail.userClassStatus && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex justify-between text-sm text-green-800 mb-2">
                  <span className="font-medium">수강 진행률</span>
                  <span className="font-bold">
                    {classDetail.userClassStatus.progressRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${classDetail.userClassStatus.progressRate}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-green-600 mt-2">
                  {classDetail.userClassStatus.completedLectureCount} /{" "}
                  {classDetail.userClassStatus.totalLectureCount} 강의 완료
                </div>
              </div>
            )}

            {/* 구매, 장바구니, 찜 버튼 영역 */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* 수강 중이면 수강하러 가기만 노출 */}
              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/classes/${classId}/lectures`)}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  🎓 <span>수강하러 가기</span>
                </button>
              ) : (
                <>
                  {/* ✅ 지금 구매하기 */}
                  <button
                    onClick={handleGoToCart}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    💳 <span>지금 구매하기</span>
                  </button>
                  

                  {/* ✅ 장바구니 상태에 따라 토글 */}
                  {isInCart ? (
                    <button
                      onClick={handleGoToCart}
                      className="flex-1 px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      💳 <span>장바구니에서 구매하기</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      ➕ <span>장바구니 담기</span>
                    </button>
                  )}
                </>
              )}

              {/* 찜하기 버튼은 항상 표시 */}
              <button
                onClick={handleWishlistToggle}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  isWishlisted
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {isWishlisted ? "💖" : "🖤"}
                <span>{isWishlisted ? "찜 해제" : "찜하기"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 📖 클래스 설명 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📖</span>
            클래스 소개
          </h2>
          <div
            className={`text-gray-700 leading-relaxed ${
              showFullDescription ? "" : "line-clamp-4"
            }`}
          >
            <div
              dangerouslySetInnerHTML={{
                __html:
                  classDetail.descriptionHtml ||
                  '<p class="text-gray-500 italic">클래스 설명이 제공되지 않았습니다.</p>',
              }}
            />
          </div>
          {classDetail.descriptionHtml &&
            classDetail.descriptionHtml.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                {showFullDescription ? "접기" : "더보기"}
              </button>
            )}
        </div>

        {/* ✨ 후기 요약 카드 */}
        {reviewSummaries.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>✨</span>
              수강생 후기 하이라이트
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviewSummaries.map((summary, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{renderStars(summary.rating)}</div>
                    <span className="text-sm text-gray-600 font-medium">
                      {summary.maskedUsername}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 italic">
                    "{summary.summary}"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {summary.createdAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📚 강의 목록 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📚</span>
            강의 목록
          </h2>
          <div className="space-y-3">
            {classDetail.lectures.map((lecture, index) => (
              <div
                key={lecture.lectureId}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  isEnrolled
                    ? "hover:bg-blue-50 hover:border-blue-200 cursor-pointer"
                    : "bg-gray-50 border-gray-200"
                }`}
                onClick={
                  isEnrolled
                    ? () =>
                        navigate(
                          `/classes/${classId}/lectures/${lecture.lectureId}`
                        )
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {lecture.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        ⏱️ {formatDuration(lecture.duration)}
                      </span>
                      {lecture.videoUrl && (
                        <span className="flex items-center gap-1 text-green-600">
                          🎥 동영상
                        </span>
                      )}
                      {lecture.fileUrl && (
                        <span className="flex items-center gap-1 text-blue-600">
                          📄 자료
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isEnrolled ? (
                  <span className="text-blue-600 hover:text-blue-800 font-medium">
                    ▶️ 학습하기
                  </span>
                ) : (
                  <span className="text-gray-400 flex items-center gap-1">
                    🔒 구매 필요
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 💬 후기 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>💬</span>
              수강 후기
              <span className="text-lg text-blue-600">({reviews.length})</span>
            </h2>
            {isEnrolled && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>✍️</span>
                후기 작성
              </button>
            )}
          </div>

          {/* 후기 통계 */}
          {reviews.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-1">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <div className="text-xs text-gray-500">평균 별점</div>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(
                      (r) => r.rating === star
                    ).length;
                    const percentage =
                      reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div
                        key={star}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="w-8">{star}점</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 후기 작성/수정 폼 */}
          {showReviewForm && isEnrolled && (
            <div className="mb-6">
              <ReviewForm
                classId={Number(classId)}
                lectures={classDetail.lectures}
                editingReview={editingReview}
                onSuccess={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  loadReviews();
                }}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
                onUpdate={handleReviewUpdate}
              />
            </div>
          )}

          {/* 후기 목록 */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="border-b border-gray-100 pb-6 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-semibold text-gray-900">
                          {review.name}
                        </span>
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-500">
                          {review.createdAt}
                        </span>
                        {review.isAuthor && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            내 후기
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-2">
                        {review.comment}
                      </p>
                      {review.progress > 0 && (
                        <div className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          📊 진도율: {review.progress}%
                        </div>
                      )}
                    </div>
                    {review.isAuthor && (
                      <div className="flex gap-2 ml-4">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                          onClick={() => handleReviewEdit(review)}
                        >
                          수정
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                          onClick={() => handleReviewDelete(review.reviewId)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  아직 등록된 후기가 없습니다
                </h3>
                <p className="text-gray-500 mb-4">
                  이 강의의 첫 번째 수강생이 되어보세요!
                </p>
                {isEnrolled && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    첫 후기 작성하기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 🎯 구매 유도 CTA (비수강생만) */}
        {!isEnrolled && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
            <h3 className="text-3xl font-bold mb-2">🚀 지금 시작해보세요!</h3>
            <p className="text-blue-100 mb-6 text-lg">
              {classDetail.lectures.length}개의 강의로 {classDetail.difficulty}{" "}
              레벨의 {classDetail.categoryName}를 마스터하세요
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handlePurchase}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg"
              >
                💳 {formatPrice(classDetail.classPrice)}에 시작하기
              </button>
              <button
                onClick={isInCart ? handleGoToCart : handleAddToCart}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                {isInCart ? "💳 지금 구매하기" : "🛒 장바구니에 담기"}
              </button>
            </div>

            {/* 신뢰도 지표 */}
            <div className="flex justify-center items-center gap-8 mt-6 text-blue-100 text-sm">
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span>수강생 만족도 95%</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📱</span>
                <span>평생 수강 가능</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ClassDetailPage;

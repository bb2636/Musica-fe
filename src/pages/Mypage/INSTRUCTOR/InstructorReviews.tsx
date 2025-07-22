import { useEffect, useState } from "react";
import { getInstructorReviews } from "../../../apis/reviewApi";
import type { InstructorReview } from "../../../types/review";

const PAGE_SIZE = 10;

const calculateStats = (reviews: InstructorReview[]) => {
  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : parseFloat(
          (
            reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          ).toFixed(1)
        );

  const classCountMap: Record<string, number> = {};
  reviews.forEach((r) => {
    classCountMap[r.classTitle] = (classCountMap[r.classTitle] || 0) + 1;
  });

  const mostReviewedClass = Object.entries(classCountMap).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  const latestReviewDate = reviews
    .map((r) => r.createdAt)
    .sort()
    .slice(-1)[0];

  return { totalReviews, averageRating, mostReviewedClass, latestReviewDate };
};

const ReviewSummary = ({ reviews }: { reviews: InstructorReview[] }) => {
  const { totalReviews, averageRating, mostReviewedClass, latestReviewDate } =
    calculateStats(reviews);

  const cardClass =
    "rounded-lg p-4 shadow text-white bg-gradient-to-r from-neutral-800 to-black";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className={cardClass}>
        <p className="text-sm font-medium">총 후기 수</p>
        <p className="text-2xl font-semibold">{totalReviews}개</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm font-medium">평균 평점</p>
        <p className="text-2xl font-semibold">{averageRating}</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm font-medium">리뷰가 가장 많은 클래스</p>
        <p className="text-base">{mostReviewedClass || "-"}</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm font-medium">최근 후기 작성일</p>
        <p className="text-base">{latestReviewDate?.slice(0, 10) || "-"}</p>
      </div>
    </div>
  );
};

const InstructorReviewList = () => {
  const [reviews, setReviews] = useState<InstructorReview[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [classId, _setClassId] = useState<number | undefined>();
  const [sort, setSort] = useState("createdAt,desc");

  const fetchReviews = async (
    pageNumber: number,
    classId?: number,
    sortType?: string
  ) => {
    try {
      const res = await getInstructorReviews(
        pageNumber,
        PAGE_SIZE,
        classId,
        sortType
      );
      console.log("📦 후기 페이지 응답:", res);
      setReviews(res.content);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("후기 조회 실패", error);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchReviews(0, classId, sort);
  }, [classId, sort]);

  useEffect(() => {
    fetchReviews(page, classId, sort);
  }, [page]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">강의 후기</h2>

      {/* ✅ 요약 박스 */}
      <ReviewSummary reviews={reviews} />

      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        <select
          className="border px-2 py-1 rounded"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="createdAt,desc">최신순</option>
          <option value="createdAt,asc">오래된순</option>
          <option value="rating,desc">평점 높은순</option>
          <option value="rating,asc">평점 낮은순</option>
        </select>
      </div>

      {/* 후기 리스트 */}
      {reviews.length === 0 ? (
        <p className="text-gray-500">등록된 후기가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {reviews.map((review) => (
            <li
              key={review.reviewId}
              className="bg-neutral-900 text-white p-4 rounded-lg shadow"
            >
              <p className="font-semibold">
                {review.classTitle} - {review.lectureTitle}
              </p>
              <p className="text-sm mt-1">
                ⭐️ {review.rating}점 by {review.reviewerName}
              </p>
              <p className="text-xs text-gray-400">{review.createdAt}</p>
              <p className="mt-2">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={`page-${i}`}
              onClick={() => setPage(i)}
              className={`px-3 py-1 rounded border transition ${
                i === page
                  ? "bg-black text-white"
                  : "bg-white text-gray-800 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorReviewList;

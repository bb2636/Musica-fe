import { useEffect, useState } from "react";
import { instructorApi } from "../../../apis/instructorApi";
import { classApi } from "../../../apis/classesApi";
import { commonApi } from "../../../apis/commonApi";
import type { DashboardData } from "../../../types/instructor";
import type { ClassSummary } from "../../../types/class";
import type { CategoryOption, DifficultyOption } from "../../../types/common";

// ✅ 필터 UI 컴포넌트 임포트
import ClassSearchFilter from "../../../components/ClassSearchFilter.tsx";

interface PageResult<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

const PAGE_SIZE = 10;

// ✅ 난이도 한글 표기 매핑
const DIFFICULTY_DISPLAY_MAP: Record<string, string> = {
  Beginner: "초급",
  Intermediate: "중급",
  Advanced: "고급",
};

const InstructorDashboard = () => {
  const [sort, setSort] = useState("latest");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [difficultyId, setDifficultyId] = useState<number | undefined>();
  const [categoryList, setCategoryList] = useState<CategoryOption[]>([]);
  const [difficultyList, setDifficultyList] = useState<DifficultyOption[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [keyword, setKeyword] = useState("");
  const [pageData, setPageData] = useState<PageResult<ClassSummary> | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dash = await instructorApi.getDashboard();
      setDashboard(dash);

      const classParams: Record<string, any> = {
        keyword: keyword.trim() || undefined,
        page: currentPage,
        size: PAGE_SIZE,
        sort,
      };
      if (categoryId !== undefined) classParams.categoryId = categoryId;
      if (difficultyId !== undefined) classParams.difficultyId = difficultyId;

      const classPage = await classApi.getInstructorClasses(classParams);
      setPageData(classPage);
    } catch (err) {
      console.error("대시보드 데이터 로딩 실패:", err);
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as any).response?.status === 401
      ) {
        console.warn("🚨 인증 만료. 로그인 페이지로 이동");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth";
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaData = async () => {
    try {
      const [cats, diffs] = await Promise.all([
        commonApi.getCategories(),
        commonApi.getDifficulties(),
      ]);

      // ✅ 난이도 순서 보장
      const orderedDiffs = diffs.sort((a, b) => {
        const order = ["Beginner", "Intermediate", "Advanced"];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });

      setCategoryList(cats);
      setDifficultyList(orderedDiffs); // ✅ 정렬된 값 사용
    } catch (err) {
      console.error("카테고리/난이도 목록 불러오기 실패:", err);
    }
  };

  const resetFilters = () => {
    setKeyword("");
    setCategoryId(undefined);
    setDifficultyId(undefined);
    setSort("latest");
    setCurrentPage(0);
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchData();
  };

  useEffect(() => {
    fetchMetaData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, sort, categoryId, difficultyId]);

  if (loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (!dashboard)
    return <div className="p-6 text-red-500">대시보드 데이터 없음</div>;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold">
          안녕하세요, {dashboard.instructorInfo.name}님 👋
        </h2>
        <p className="text-gray-600">
          현재 {dashboard.instructorInfo.totalClasses}개의 클래스를 운영
          중입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="총 수익"
          value={`${dashboard.stats.totalRevenue.toLocaleString()}원`}
          color="cool"
        />
        <StatCard
          title="이번 달 수익"
          value={`${dashboard.stats.monthlyRevenue.toLocaleString()}원`}
          color="cool"
        />
        <StatCard
          title="미답변 질문"
          value={`${dashboard.stats.pendingQuestions}`}
          color="cool"
        />
        <StatCard
          title="평균 평점"
          value={`${dashboard.stats.averageRating.toFixed(1)}`}
          color="cool"
        />
        <StatCard
          title="총 리뷰 수"
          value={`${dashboard.stats.totalReviews}개`}
          color="cool"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">클래스 목록</h3>
        </div>

        {/* ✅ 필터 UI 삽입 */}
        <ClassSearchFilter
          keyword={keyword}
          setKeyword={setKeyword}
          sort={sort}
          setSort={(value) => {
            setSort(value);
            setCurrentPage(0);
          }}
          categoryId={categoryId}
          setCategoryId={(value) => {
            setCategoryId(value);
            setCurrentPage(0);
          }}
          difficultyId={difficultyId}
          setDifficultyId={(value) => {
            setDifficultyId(value);
            setCurrentPage(0);
          }}
          categoryList={categoryList}
          difficultyList={difficultyList}
          onSearch={handleSearch}
          onReset={resetFilters}
        />

        {pageData?.content.length === 0 ? (
          <p className="text-gray-500">등록된 클래스가 없습니다.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm text-left">
                <thead className="border-b text-gray-600 bg-gray-100 text-center">
                  <tr>
                    <th className="px-4 py-2">썸네일</th>
                    <th className="px-4 py-2">클래스명</th>
                    <th className="px-4 py-2">카테고리/난이도</th>
                    <th className="px-4 py-2">강의 수</th>
                    <th className="px-4 py-2">수강생</th>
                    <th className="px-4 py-2">평점</th>
                    <th className="px-4 py-2">가격</th>
                    {/* <th className="px-4 py-2">관리</th> */}
                  </tr>
                </thead>
                {/* <tbody>
                  {pageData?.content.map((cls) => (
                    <tr key={cls.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <img
                          src={cls.thumbnailUrl}
                          alt={cls.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-2 font-medium">{cls.title}</td>
                      <td className="px-4 py-2">
                        {cls.category} /{" "}
                        {DIFFICULTY_DISPLAY_MAP[cls.difficulty] ??
                          cls.difficulty}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {cls.totalLectureCount}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {cls.studentCount}명
                      </td>
                      <td className="px-4 py-2 text-center">
                        {cls.averageRating.toFixed(1)} ⭐
                      </td>
                      <td className="px-4 py-2 text-right">
                        {cls.classPrice.toLocaleString()}원
                      </td>
                    </tr>
                  ))}
                </tbody> */}
                <tbody>
                  {pageData?.content.map((cls) => (
                    <tr key={cls.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-center">
                        <img
                          src={cls.thumbnailUrl}
                          alt={cls.title}
                          className="w-20 h-12 object-cover rounded mx-auto"
                        />
                      </td>
                      <td className="px-4 py-2 font-medium text-center">
                        {cls.title}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {cls.category} /{" "}
                        {DIFFICULTY_DISPLAY_MAP[cls.difficulty] ??
                          cls.difficulty}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {cls.totalLectureCount}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {cls.studentCount}명
                      </td>
                      <td className="px-4 py-2 text-center">
                        {cls.averageRating.toFixed(1)} ⭐
                      </td>
                      <td className="px-4 py-2 text-center">
                        {cls.classPrice.toLocaleString()}원
                      </td>
                      {/* <td className="px-4 py-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() =>
                              navigate(
                                `/mypage/instructor/classes/${cls.id}/lectures/create`
                              )
                            }
                            className="bg-neutral-200 hover:bg-neutral-300 text-sm text-gray-900 px-3 py-1 rounded transition"
                          >
                            수정
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = window.confirm(
                                "정말로 이 클래스를 삭제하시겠습니까?"
                              );
                              if (!confirmed) return;

                              try {
                                await instructorApi.deleteClass(cls.id);
                                alert("클래스가 삭제되었습니다.");
                                fetchData(); // 삭제 후 목록 갱신
                              } catch (err) {
                                console.error("삭제 실패:", err);
                                alert("클래스 삭제에 실패했습니다.");
                              }
                            }}
                            className="bg-neutral-400 hover:bg-neutral-600 text-sm text-white px-3 py-1 rounded transition"
                          >
                            삭제
                          </button>
                        </div>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                className="px-3 py-1 rounded bg-neutral-900 text-white disabled:opacity-40 hover:bg-neutral-800 transition"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
              >
                이전
              </button>

              <div className="space-x-1">
                {pageData &&
                  Array.from({ length: pageData.totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1 rounded transition ${
                        currentPage === i
                          ? "bg-neutral-600 text-white"
                          : "bg-white text-gray-800 border hover:bg-neutral-800 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
              </div>

              <button
                className="px-3 py-1 rounded bg-neutral-900 text-white disabled:opacity-40 hover:bg-neutral-800 transition"
                onClick={() =>
                  setCurrentPage((prev) =>
                    pageData
                      ? Math.min(prev + 1, pageData.totalPages - 1)
                      : prev
                  )
                }
                disabled={!pageData || currentPage === pageData.totalPages - 1}
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;

const StatCard = ({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color:
    | "blue"
    | "green"
    | "yellow"
    | "purple"
    | "pink"
    | "black"
    | "dark"
    | "cool";
}) => {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-pink-600",

    // ✅ 추가된 블랙 계열
    black: "from-gray-900 to-black", // 완전 어두운 그라데이션
    dark: "from-gray-800 to-gray-900", // 조금 더 부드러운 블랙
    cool: "from-neutral-800 to-gray-950", // 쿨톤 블랙
  };

  return (
    <div
      className={`p-6 text-white rounded-lg bg-gradient-to-r ${colorMap[color]}`}
    >
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-opacity-80">{title}</div>
    </div>
  );
};

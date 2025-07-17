import { useEffect, useState } from "react";
import { instructorApi } from "../../../apis/instructorApi";
import { classApi } from "../../../apis/classesApi";
import { commonApi } from "../../../apis/commonApi";
import type { DashboardData } from "../../../types/instructor";
import type { ClassSummary } from "../../../types/class";
import type { CategoryOption, DifficultyOption } from "../../../types/common";

// ✅ 필터 UI 컴포넌트 임포트
import ClassSearchFilter from "../../../components/ClassSearchFilter";

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 수익"
          value={`${dashboard.stats.totalRevenue.toLocaleString()}원`}
          color="blue"
        />
        <StatCard
          title="이번 달 수익"
          value={`${dashboard.stats.monthlyRevenue.toLocaleString()}원`}
          color="green"
        />
        <StatCard
          title="미답변 질문"
          value={`${dashboard.stats.pendingQuestions}`}
          color="yellow"
        />
        <StatCard
          title="평균 평점"
          value={`${dashboard.stats.averageRating.toFixed(1)}`}
          color="purple"
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
                <thead className="border-b text-gray-600 bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">썸네일</th>
                    <th className="px-4 py-2">클래스명</th>
                    <th className="px-4 py-2">카테고리/난이도</th>
                    <th className="px-4 py-2">강의 수</th>
                    <th className="px-4 py-2">수강생</th>
                    <th className="px-4 py-2">평점</th>
                    <th className="px-4 py-2">가격</th>
                  </tr>
                </thead>
                <tbody>
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
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                className="px-3 py-1 rounded border bg-white text-gray-700 disabled:opacity-40"
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
                      className={`px-3 py-1 rounded border ${
                        currentPage === i
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
              </div>

              <button
                className="px-3 py-1 rounded border bg-white text-gray-700 disabled:opacity-40"
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
  color: "blue" | "green" | "yellow" | "purple";
}) => {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
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

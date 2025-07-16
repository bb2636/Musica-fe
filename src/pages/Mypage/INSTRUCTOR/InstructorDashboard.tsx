import { useState, useEffect } from 'react';
import { instructorApi } from './services/instructorApi';
import { classApi } from './services/classesApi';
import { commonApi } from './services/commonApi';
import type { DashboardData } from '../INSTRUCTOR/types/instructor';
import type { ClassSummary } from './types/class';

interface PageResult<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // 현재 페이지 (0부터 시작)
  size: number;
}

const InstructorDashboard = () => {
  const [sort, setSort] = useState('latest');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [difficultyId, setDifficultyId] = useState<number | undefined>();
  const [categoryList, setCategoryList] = useState<{ id: number; name: string }[]>([]);
  const [difficultyList, setDifficultyList] = useState<{ id: number; name: string }[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [keyword, setKeyword] = useState('');
  const [pageData, setPageData] = useState<PageResult<ClassSummary> | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // 0부터 시작
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      // ⚠️ undefined 제거
      const classParams: Record<string, any> = {
        keyword: keyword.trim() || undefined,
        page: currentPage,
        size: PAGE_SIZE,
        sort,
      };
      if (categoryId !== undefined) classParams.categoryId = categoryId;
      if (difficultyId !== undefined) classParams.difficultyId = difficultyId;
  
      const [dash, classPage] = await Promise.all([
        instructorApi.getDashboard(),
        classApi.getAllClasses(classParams),
      ]);
  
      setDashboard(dash);
      setPageData(classPage);
    } catch (err) {
      console.error('대시보드 데이터 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, sort, categoryId, difficultyId]);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [cats, diffs] = await Promise.all([
          commonApi.getCategories(),
          commonApi.getDifficulties(),
        ]);
        setCategoryList(cats);
        setDifficultyList(diffs);
      } catch (err) {
        console.error('카테고리/난이도 목록 불러오기 실패:', err);
      }
    };

    fetchMetaData();
  }, []);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchData();
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (!dashboard) return <div className="p-6 text-red-500">대시보드 데이터 없음</div>;

  return (
    <div className="p-6 space-y-8">
      {/* 상단 인사말 */}
      <div>
        <h2 className="text-xl font-semibold">안녕하세요, {dashboard.instructorInfo.name}님 👋</h2>
        <p className="text-gray-600">
          현재 {dashboard.instructorInfo.totalClasses}개의 클래스를 운영 중입니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="총 수익" value={`${dashboard.stats.totalRevenue.toLocaleString()}원`} color="blue" />
        <StatCard title="이번 달 수익" value={`${dashboard.stats.monthlyRevenue.toLocaleString()}원`} color="green" />
        <StatCard title="미답변 질문" value={`${dashboard.stats.pendingQuestions}`} color="yellow" />
        <StatCard title="평균 평점" value={`${dashboard.stats.averageRating.toFixed(1)}`} color="purple" />
      </div>

      {/* 최근 활동 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">최근 활동</h3>
        {dashboard.recentActivities.length === 0 ? (
          <p className="text-gray-500">최근 활동이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {dashboard.recentActivities.map((activity, idx) => (
              <li key={idx} className="flex justify-between items-center border-b pb-2">
                <span className="text-sm">{activity.message}</span>
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 클래스 목록 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">클래스 목록</h3>
          <div className="flex flex-wrap gap-2 items-center mb-4">
            {/* 검색창 */}
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleEnter}
              placeholder="클래스명 검색"
              className="border px-3 py-1 rounded text-sm"
            />
            <button onClick={handleSearch} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
              검색
            </button>

            {/* 정렬 */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setCurrentPage(0);
              }}
              className="border px-2 py-1 rounded text-sm"
            >
              <option value="latest">최신순</option>
              <option value="rating">평점순</option>
              <option value="students">수강생순</option>
            </select>

            {/* 카테고리 */}
            <select
              value={categoryId ?? ''}
              onChange={(e) => {
                setCategoryId(e.target.value ? Number(e.target.value) : undefined);
                setCurrentPage(0);
              }}
              className="border px-2 py-1 rounded text-sm"
            >
              <option value="">전체 카테고리</option>
              {categoryList.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* 난이도 */}
            <select
              value={difficultyId ?? ''}
              onChange={(e) => {
                setDifficultyId(e.target.value ? Number(e.target.value) : undefined);
                setCurrentPage(0);
              }}
              className="border px-2 py-1 rounded text-sm"
            >
              <option value="">전체 난이도</option>
              {difficultyList.map((diff) => (
                <option key={diff.id} value={diff.id}>
                  {diff.name}
                </option>
              ))}
            </select>

          </div>
        </div>

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
                        <img src={cls.thumbnailUrl} alt={cls.title} className="w-20 h-12 object-cover rounded" />
                      </td>
                      <td className="px-4 py-2 font-medium">{cls.title}</td>
                      <td className="px-4 py-2">{cls.category} / {cls.difficulty}</td>
                      <td className="px-4 py-2 text-center">{cls.totalLectureCount}</td>
                      <td className="px-4 py-2 text-center">{cls.studentCount}명</td>
                      <td className="px-4 py-2 text-center">{cls.averageRating.toFixed(1)} ⭐</td>
                      <td className="px-4 py-2 text-right">{cls.classPrice.toLocaleString()}원</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-between items-center mt-4">
              <button
                className="px-3 py-1 rounded border bg-white text-gray-700 disabled:opacity-40"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
              >
                이전
              </button>

              <div className="space-x-1">
                {Array.from({ length: pageData?.totalPages ?? 0 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 rounded border ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                className="px-3 py-1 rounded border bg-white text-gray-700 disabled:opacity-40"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, (pageData?.totalPages ?? 1) - 1))
                }
                disabled={currentPage === (pageData?.totalPages ?? 1) - 1}
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
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) => {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className={`p-6 text-white rounded-lg bg-gradient-to-r ${colorMap[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-opacity-80">{title}</div>
    </div>
  );
};
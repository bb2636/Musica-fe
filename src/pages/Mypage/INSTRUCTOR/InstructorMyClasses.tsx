import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { instructorApi } from "../../../apis/instructorApi";
import { commonApi } from "../../../apis/commonApi";
import type { ClassSummary } from "../../../types/class";
import type { CategoryOption, DifficultyOption } from "../../../types/common";

const PAGE_SIZE = 8;

const DIFFICULTY_DISPLAY_MAP: Record<string, string> = {
  Beginner: "초급",
  Intermediate: "중급",
  Advanced: "고급",
};

const InstructorMyClasses = () => {
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryOption[]>([]);
  const [difficultyList, setDifficultyList] = useState<DifficultyOption[]>([]);

  const [sort, setSort] = useState("latest");
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [difficultyId, setDifficultyId] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: keyword.trim() || undefined,
        categoryId,
        difficultyId,
        sort,
        page: currentPage,
        size: PAGE_SIZE,
      };

      const res = await instructorApi.getInstructorClasses(params);
      setClasses(Array.isArray(res.content) ? res.content : []);
      setTotalPages(res.totalPages ?? 1);
    } catch (error) {
      console.error("클래스 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [categories, difficulties] = await Promise.all([
        commonApi.getCategories(),
        commonApi.getDifficulties(),
      ]);

      // ✅ 난이도 순서 정렬
      const orderedDifficulties = difficulties.sort((a, b) => {
        const order = ["Beginner", "Intermediate", "Advanced"];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });

      setCategoryList(categories);
      setDifficultyList(orderedDifficulties);
    } catch (err) {
      console.error("필터 정보 로딩 실패:", err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [keyword, categoryId, difficultyId, sort, currentPage]);

  const handleReset = () => {
    setKeyword("");
    setCategoryId(undefined);
    setDifficultyId(undefined);
    setSort("latest");
    setCurrentPage(0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">내가 등록한 클래스</h2>
        <button
          onClick={() => navigate("/mypage/instructor/classes/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          + 클래스 등록
        </button>
      </div>

      {/* 🔍 필터 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어 입력"
          className="md:col-span-2 px-3 py-2 border rounded"
        />
        <select
          value={categoryId || ""}
          onChange={(e) =>
            setCategoryId(e.target.value ? Number(e.target.value) : undefined)
          }
          className="px-3 py-2 border rounded"
        >
          <option value="">카테고리 전체</option>
          {categoryList.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={difficultyId || ""}
          onChange={(e) =>
            setDifficultyId(e.target.value ? Number(e.target.value) : undefined)
          }
          className="px-3 py-2 border rounded"
        >
          <option value="">난이도 전체</option>
          {difficultyList.map((dif) => (
            <option key={dif.id} value={dif.id}>
              {DIFFICULTY_DISPLAY_MAP[dif.name] ?? dif.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="latest">최신순</option>
          <option value="popular">수강생 많은 순</option>
          <option value="rating">평점 높은 순</option>
        </select>
      </div>

      {/* 🔄 초기화 버튼 */}
      <div className="mb-4 text-right">
        <button
          onClick={handleReset}
          className="text-sm text-gray-600 hover:underline"
        >
          필터 초기화
        </button>
      </div>

      {/* 📦 클래스 목록 */}
      {loading ? (
        <div className="text-center text-gray-500 py-20">불러오는 중...</div>
      ) : classes.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          등록한 클래스가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {classes.map((c) => (
            <div
              key={c.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/classes/${c.id}`)}
            >
              <img
                src={
                  c.thumbnailUrl ||
                  "https://via.placeholder.com/240x160?text=No+Image"
                }
                alt={c.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium mb-1">{c.title}</h3>
                <p className="text-sm text-gray-500 mb-1">
                  카테고리: {c.category}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  난이도: {DIFFICULTY_DISPLAY_MAP[c.difficulty] ?? c.difficulty}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  강의 수: {c.totalLectureCount}개
                </p>
                <p className="text-right text-blue-600 font-semibold mb-2">
                  {c.classPrice.toLocaleString()}원
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/mypage/instructor/classes/${c.id}/lectures/create`
                    );
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 py-1 rounded"
                >
                  ✏️ 수정하기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⏩ 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`px-4 py-2 border rounded ${
                i === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
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

export default InstructorMyClasses;

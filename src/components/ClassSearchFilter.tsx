import React from "react";
import type { CategoryOption, DifficultyOption } from "../types/common";

interface Props {
  keyword: string;
  setKeyword: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  categoryId: number | undefined;
  setCategoryId: (v: number | undefined) => void;
  difficultyId: number | undefined;
  setDifficultyId: (v: number | undefined) => void;
  categoryList: CategoryOption[];
  difficultyList: DifficultyOption[];
  onSearch: () => void;
  onReset: () => void;
}

const DIFFICULTY_DISPLAY_MAP: Record<string, string> = {
  Beginner: "초급",
  Intermediate: "중급",
  Advanced: "고급",
};

const ClassSearchFilter: React.FC<Props> = ({
  keyword,
  setKeyword,
  sort,
  setSort,
  categoryId,
  setCategoryId,
  difficultyId,
  setDifficultyId,
  categoryList,
  difficultyList,
  onSearch,
  onReset,
}) => {
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleEnter}
        placeholder="클래스명 검색"
        className="border px-3 py-1 rounded text-sm"
      />
      <button
        onClick={onSearch}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
      >
        검색
      </button>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="border px-2 py-1 rounded text-sm"
      >
        <option value="latest">최신순</option>
        <option value="rating">평점순</option>
        <option value="students">수강생순</option>
      </select>

      <select
        value={categoryId ?? ""}
        onChange={(e) =>
          setCategoryId(e.target.value ? Number(e.target.value) : undefined)
        }
        className="border px-2 py-1 rounded text-sm"
      >
        <option value="">전체 카테고리</option>
        {categoryList.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={difficultyId ?? ""}
        onChange={(e) =>
          setDifficultyId(e.target.value ? Number(e.target.value) : undefined)
        }
        className="border px-2 py-1 rounded text-sm"
      >
        <option value="">전체 난이도</option>
        {difficultyList.map((diff) => (
          <option key={diff.id} value={diff.id}>
            {DIFFICULTY_DISPLAY_MAP[diff.name] ?? diff.name}
          </option>
        ))}
      </select>

      <button
        onClick={onReset}
        className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
      >
        필터 초기화
      </button>
    </div>
  );
};

export default ClassSearchFilter;

import { useEffect, useState } from "react";
import { classApi } from "../apis/classesApi";
import { instructorApi } from "../apis/instructorApi";
import { commonApi } from "../apis/commonApi";
import { uploadApi } from "../apis/uploadApi";
import { getContentType } from "../utils/getContentType";
import type { ClassUpdateReq } from "../types/class";
import type { CategoryOption, DifficultyOption } from "../types/common";

// const DIFFICULTY_DISPLAY_MAP: Record<string, string> = {
//   Beginner: "초급",
//   Intermediate: "중급",
//   Advanced: "고급",
// };

const DIFFICULTY_SORT_ORDER: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

interface Props {
  classId: number;
}

const ClassEditSection = ({ classId }: Props) => {
  const [form, setForm] = useState<ClassUpdateReq>({
    title: "",
    descriptionHtml: "",
    categoryId: 0,
    difficultyId: 0,
    classPrice: 0,
    thumbnailUrl: "",
  });

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [difficulties, setDifficulties] = useState<DifficultyOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, cats, diffs] = await Promise.all([
          classApi.getClassDetail(classId),
          commonApi.getCategories(),
          commonApi.getDifficulties(),
        ]);

        setCategories(cats);

        const sortedDiffs = diffs.sort(
          (a, b) =>
            DIFFICULTY_SORT_ORDER[a.name] - DIFFICULTY_SORT_ORDER[b.name]
        );
        setDifficulties(sortedDiffs);

        const category = cats.find((c) => c.name === res.categoryName);
        const difficulty = diffs.find((d) => d.name === res.difficulty);

        if (!category || !difficulty) {
          alert("카테고리 또는 난이도를 찾을 수 없습니다.");
          return;
        }

        setForm({
          title: res.title,
          descriptionHtml: res.descriptionHtml,
          categoryId: category.id,
          difficultyId: difficulty.id,
          classPrice: res.classPrice,
          thumbnailUrl: res.thumbnailUrl,
        });
      } catch (e) {
        console.error("클래스 정보 조회 실패", e);
        alert("클래스 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleChange = <K extends keyof ClassUpdateReq>(
    key: K,
    value: ClassUpdateReq[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const contentType = getContentType(file);
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(contentType)) {
      alert("지원되지 않는 이미지 형식입니다.");
      return;
    }

    try {
      const { uploadUrl, fileUrl } = await uploadApi.getPresignedUrl(
        file.name,
        contentType
      );
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": contentType },
      });
      handleChange("thumbnailUrl", fileUrl);
    } catch (err) {
      console.error("썸네일 업로드 실패", err);
      alert("썸네일 업로드 중 오류 발생");
    }
  };

  const handleSubmit = async () => {
    try {
      await instructorApi.updateClass(classId, form);
      alert("클래스 정보가 수정되었습니다.");
    } catch (err) {
      console.error("클래스 수정 실패", err);
      alert("클래스 정보 수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        클래스 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-4 border rounded p-4 bg-white shadow-sm">
      <h2 className="text-xl font-bold">클래스 정보 수정</h2>

      {/* 제목 */}
      <div>
        <label className="block font-semibold mb-1">제목</label>
        <input
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="제목을 입력하세요"
        />
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block font-semibold mb-1">카테고리</label>
        <select
          value={form.categoryId}
          onChange={(e) => handleChange("categoryId", Number(e.target.value))}
          className="border p-2 rounded w-full"
        >
          <option value="" disabled hidden>
            카테고리를 선택하세요
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 난이도 */}
      <div>
        <label className="block font-semibold mb-1">난이도</label>
        <select
          value={form.difficultyId}
          onChange={(e) => handleChange("difficultyId", Number(e.target.value))}
          className="border p-2 rounded w-full"
        >
          <option value="" disabled hidden>
            난이도를 선택하세요
          </option>
          {difficulties.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* 가격 */}
      <div>
        <label className="block font-semibold mb-1">가격</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={
            form.classPrice !== undefined
              ? form.classPrice.toLocaleString("ko-KR")
              : ""
          }
          onChange={(e) => {
            const raw = e.target.value;
            const onlyNums = raw.replace(/[^0-9]/g, ""); // 숫자만 남김
            const num = Math.max(0, Number(onlyNums));
            handleChange("classPrice", isNaN(num) ? 0 : num);
          }}
          className="border p-2 rounded w-full"
          placeholder="가격을 입력하세요 (숫자만)"
        />
      </div>

      {/* 상세 설명 */}
      <div>
        <label className="block font-semibold mb-1">상세 설명</label>
        <textarea
          value={form.descriptionHtml}
          onChange={(e) => handleChange("descriptionHtml", e.target.value)}
          className="border p-2 rounded w-full"
          rows={5}
          placeholder="상세 설명을 입력하세요"
        />
      </div>

      {/* 썸네일 */}
      <div>
        <label className="block font-semibold mb-1">썸네일 이미지 업로드</label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} />
        {!form.thumbnailUrl && (
          <p className="text-xs text-gray-400 mt-1">* 기존 썸네일이 있습니다</p>
        )}
        {form.thumbnailUrl && (
          <img
            src={form.thumbnailUrl}
            alt="썸네일"
            className="w-32 h-20 object-cover mt-2 rounded"
          />
        )}
      </div>

      {/* ✅ 저장 버튼 우측 정렬 */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          클래스 정보 저장
        </button>
      </div>
    </div>
  );
};

export default ClassEditSection;

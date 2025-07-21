// src/pages/Classes/CreateClassPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { instructorApi } from "../../apis/instructorApi";
import { uploadApi } from "../../apis/uploadApi";
import { commonApi } from "../../apis/commonApi";

interface CategoryOption {
  id: number;
  name: string;
}

interface DifficultyOption {
  id: number;
  name: "Beginner" | "Intermediate" | "Advanced";
  displayName: string;
}

const DIFFICULTY_DISPLAY_MAP: Record<string, string> = {
  Beginner: "초급",
  Intermediate: "중급",
  Advanced: "고급",
};

const CreateClassPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [categoryId, setCategoryId] = useState<number>();
  const [difficultyId, setDifficultyId] = useState<number>();
  const [classPrice, setClassPrice] = useState<number>();
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [difficulties, setDifficulties] = useState<DifficultyOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);

        const [catRes, diffRes] = await Promise.all([
          commonApi.getCategories(), // CategoryOption[] 반환
          commonApi.getDifficulties(), // DifficultyOption[] 반환
        ]);

        // ✅ 이미 API에서 필터링된 카테고리를 받음 (name 필드 사용)
        setCategories(catRes);

        // 난이도에 displayName 추가
        const diffWithDisplay: DifficultyOption[] = diffRes.map((d) => ({
          id: d.id,
          name: d.name as "Beginner" | "Intermediate" | "Advanced",
          displayName: DIFFICULTY_DISPLAY_MAP[d.name] || d.name,
        }));

        setDifficulties(diffWithDisplay);
      } catch (err) {
        console.error("옵션 목록 조회 실패", err);
        alert("카테고리 및 난이도 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("지원되지 않는 이미지 형식입니다.");
      return;
    }

    try {
      const { uploadUrl, fileUrl } = await uploadApi.getPresignedUrl(
        file.name,
        file.type
      );
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      setThumbnailUrl(fileUrl);
      // alert("썸네일 업로드 성공!");
    } catch (e) {
      console.error("썸네일 업로드 실패", e);
      alert("썸네일 업로드 실패: 지원하지 않는 이미지 형식입니다.");
    }
  };

  const handleSubmit = async () => {
    if (!title || !categoryId || !difficultyId || !classPrice) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    try {
      const classPayload = {
        title,
        descriptionHtml,
        categoryId: categoryId!,
        difficultyId: difficultyId!,
        classPrice: classPrice!,
        thumbnailUrl: thumbnailUrl || undefined,
      };

      const res = await instructorApi.createClass(classPayload);
      console.log("✅ 등록된 클래스 응답:", res); // 여기에 id가 있는지 확인
      const classId = res.class_id;

      alert("클래스가 등록되었습니다.");

      // ✅ 강의 등록 페이지로 이동
      navigate(`/mypage/instructor/classes/${classId}/lectures/create`);
    } catch (e) {
      console.error("클래스 등록 실패", e);
      alert("클래스 등록 실패");
    }
  };

  if (loading) {
    return (
        <div className="p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-600">옵션 정보를 불러오는 중...</span>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">클래스 등록</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">카테고리</label>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="border p-2 rounded w-full"
          >
            <option value="" disabled>
              카테고리를 선택하세요
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ 활성화된 카테고리가 없습니다. 관리자에게 문의하세요.
              </p>
          )}
        </div>

        <div>
          <label className="block font-semibold">난이도</label>
          <select
            value={difficultyId ?? ""}
            onChange={(e) => setDifficultyId(Number(e.target.value))}
            className="border p-2 rounded w-full"
          >
            <option value="" disabled>
              난이도를 선택하세요
            </option>
            {difficulties.map((d) => (
              <option key={d.id} value={d.id}>
                {d.displayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold">가격</label>
          <input
            type="number"
            value={classPrice ?? ""}
            onChange={(e) => setClassPrice(Number(e.target.value))}
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold">상세 설명</label>
        <textarea
          value={descriptionHtml}
          onChange={(e) => setDescriptionHtml(e.target.value)}
          rows={5}
          className="border p-2 rounded w-full"
        />
      </div>

      <div>
        <label className="block font-semibold">썸네일 이미지 업로드</label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} />
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="썸네일"
            className="w-40 mt-2 rounded shadow"
          />
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        등록하고 강의 등록 페이지로 이동
      </button>
    </div>
  );
};

export default CreateClassPage;

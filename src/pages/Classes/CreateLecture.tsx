import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadApi } from "../../apis/uploadApi";
import { lectureApi } from "../../apis/lectureApi";
import { classApi } from "../../apis/classesApi";
import { getContentType } from "../../utils/getContentType";
import ClassEditSection from "../../components/ClassEditSection";
import type { LectureSummary } from "../../types/lecture";

interface LectureForm {
  id?: number;
  title: string;
  videoFile?: File;
  pdfFile?: File;
  duration: string;
  rawDuration?: number;
  existingTitle?: string;
  existingVideoUrl?: string;
  existingFileUrl?: string;
  existingDuration?: string;
  existingLectureOrder?: number;
  existingRawDuration?: number;
  existingVideoObjectKey?: string;
}

// export interface LectureResponse {
//   lectureId: number;
//   title: string;
//   duration: number;
//   order: number;
//   progressRate?: number | null;
//   isCompleted?: boolean | null;
//   videoUrl?: string;
//   fileUrl?: string;
//   videoObjectKey?: string;
// }

const INSTRUMENT_DISPLAY_MAP: Record<string, string> = {
  bass: "베이스",
  drum: "드럼",
  drums: "드럼",
  guitar: "기타",
  guitars: "기타",
  keys: "키보드",
  keyboard: "키보드",
  percussion: "타악기",
  piano: "피아노",
  string: "현악기",
  strings: "현악기",
  vocal: "보컬",
  vocals: "보컬",
  wind: "관악기",
  brass: "금관악기",
  sax: "색소폰",
  saxophone: "색소폰",
  flute: "플루트",
  clarinet: "클라리넷",
  trumpet: "트럼펫",
  trombone: "트롬본",
  harp: "하프",
  // 필요한 악기가 더 있다면 여기에 추가하세요!
};

function toKoreanInstrument(key: string) {
  return INSTRUMENT_DISPLAY_MAP[key.toLowerCase()] || key;
}

const parseDurationToSeconds = (time: string): number => {
  const parts = time.split(":").map(Number);
  return parts.length === 2 ? parts[0] * 60 + parts[1] : Number(time);
};

const formatDuration = (seconds: number): string => {
  return `${Math.floor(seconds / 60)}:${("0" + (seconds % 60)).slice(-2)}`;
};

const CreateLecturePage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [lectures, setLectures] = useState<LectureForm[]>([]);
  const [recommendedMap, setRecommendedMap] = useState<
    Record<number, string[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 상태 선언
  const [activeSubmittingIndex, setActiveSubmittingIndex] = useState<
    number | null
  >(null);
  const [classCategory, setClassCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) return;
    const fetchExistingLectures = async () => {
      try {
        const data: LectureSummary[] = await lectureApi.getLectureList(
          Number(classId)
        );
        const formatted = data.map((l) => ({
          id: l.lectureId,
          title: l.title,
          existingTitle: l.title,
          duration: formatDuration(l.duration),
          existingDuration: formatDuration(l.duration),
          existingRawDuration: l.duration,
          existingVideoUrl: l.videoUrl,
          existingFileUrl: l.fileUrl,
          existingLectureOrder: l.lectureOrder,
          existingVideoObjectKey: l.videoObjectKey,
        }));
        setLectures(formatted);

        const classDetail = await classApi.getClassDetail(Number(classId));
        setClassCategory(classDetail.categoryName);
      } catch (err) {
        console.error("기존 강의 불러오기 실패:", err);
      }
    };
    fetchExistingLectures();
  }, [classId]);

  const isModifiedLecture = (lecture: LectureForm): boolean => {
    if (!lecture.id) return true;
    const titleChanged = lecture.title.trim() !== lecture.existingTitle?.trim();
    const fileChanged = !!lecture.videoFile || !!lecture.pdfFile;
    return titleChanged || fileChanged;
  };

  const handleAddLecture = () =>
    setLectures([...lectures, { title: "", duration: "" }]);

  const handleLectureChange = <T extends keyof LectureForm>(
    index: number,
    field: T,
    value: LectureForm[T]
  ) => {
    setLectures((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleVideoDuration = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const seconds = Math.round(video.duration);
        handleLectureChange(index, "duration", formatDuration(seconds));
        handleLectureChange(index, "rawDuration", seconds);
      };
      video.src = URL.createObjectURL(file);
      handleLectureChange(index, "videoFile", file);
    }
  };

  // const uploadFile = async (file: File) => {
  //   const { uploadUrl, fileUrl, objectKey } = await uploadApi.getPresignedUrl(
  //     file.name,
  //     file.type
  //   );
  //   await fetch(uploadUrl, {
  //     method: "PUT",
  //     body: file,
  //     headers: { "Content-Type": file.type },
  //   });
  //   return { fileUrl, objectKey };
  // };
  const uploadFile = async (file: File) => {
    const contentType = getContentType(file); // ✅ file.type 비어 있을 때 확장자 기반 추론

    const { uploadUrl, fileUrl, objectKey } = await uploadApi.getPresignedUrl(
      file.name,
      contentType
    );

    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
    });

    return { fileUrl, objectKey };
  };

  const registerLecture = async (lecture: LectureForm, index: number) => {
    const { fileUrl: vUrl, objectKey: vKey } = lecture.videoFile
      ? await uploadFile(lecture.videoFile)
      : { fileUrl: lecture.existingVideoUrl, objectKey: undefined };
    const { fileUrl: fUrl, objectKey: fKey } = lecture.pdfFile
      ? await uploadFile(lecture.pdfFile)
      : { fileUrl: lecture.existingFileUrl, objectKey: undefined };
    const payload = {
      title: lecture.title.trim(),
      videoUrl: vUrl ?? null,
      fileUrl: fUrl ?? null,
      videoObjectKey: vKey ?? lecture.existingVideoObjectKey ?? null,
      fileObjectKey: fKey ?? null,
      duration:
        lecture.rawDuration ??
        lecture.existingRawDuration ??
        parseDurationToSeconds(lecture.duration || "0"),
      lectureOrder: lecture.existingLectureOrder ?? index + 1,
    };

    const titleChanged = lecture.title.trim() !== lecture.existingTitle?.trim();
    const durationChanged = lecture.duration !== lecture.existingDuration;
    const isModified =
      !lecture.id ||
      titleChanged ||
      durationChanged ||
      !!lecture.videoFile ||
      !!lecture.pdfFile;
    if (!isModified) return;

    if (lecture.id) {
      await lectureApi.updateLecture(lecture.id, payload);
      const detail = await lectureApi.getLectureDetail(lecture.id);
      const instruments = detail.detectedInstruments || {};
      const recommended = Object.entries(instruments)
        .filter(([, v]) => v === true)
        .map(([k]) => toKoreanInstrument(k));
      setLectures((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          existingTitle: payload.title,
          videoFile: undefined,
          pdfFile: undefined,
          existingVideoUrl: payload.videoUrl,
          existingFileUrl: payload.fileUrl,
        };
        return updated;
      });
      setRecommendedMap((prev) => ({ ...prev, [lecture.id!]: recommended }));
    } else {
      const res = await lectureApi.createLecture(Number(classId), payload);

      // ✅ 한글 매핑 처리
      const recommended = (res.recommendedCategories || []).map(
        toKoreanInstrument
      );

      setLectures((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          id: res.lectureId,
          existingTitle: payload.title,
          videoFile: undefined,
          pdfFile: undefined,
          existingVideoUrl: payload.videoUrl,
          existingFileUrl: payload.fileUrl,
        };
        return updated;
      });

      setRecommendedMap((prev) => ({
        ...prev,
        [res.lectureId]: recommended, // ✅ 한글로 변환된 값 넣기
      }));
    }
  };

  const handleDeleteLecture = async (index: number) => {
    const lecture = lectures[index];
    if (!window.confirm("정말 이 강의를 삭제하시겠습니까?")) return;
    try {
      if (lecture.id) {
        await lectureApi.deleteLecture(lecture.id);
        setRecommendedMap((prev) => {
          const copy = { ...prev };
          delete copy[lecture.id!];
          return copy;
        });
      }
      setLectures((prev) => prev.filter((_, i) => i !== index));
      alert("강의가 삭제되었습니다.");
    } catch (err) {
      console.error("강의 삭제 실패:", err);
      alert("강의 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {classId && <ClassEditSection classId={Number(classId)} />}
      <h1 className="text-2xl font-bold text-gray-900">강의 등록</h1>

      {lectures.map((lecture, idx) => (
        <div
          key={idx}
          className="mb-6 border border-gray-200 p-4 rounded-lg bg-white shadow hover:shadow-md transition"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800">
              강의 {idx + 1}
            </h3>
            <button
              onClick={() => handleDeleteLecture(idx)}
              className="text-red-500 text-sm hover:underline"
            >
              삭제
            </button>
          </div>

          <div className="space-y-3 mt-2">
            <input
              type="text"
              placeholder="강의 제목"
              value={lecture.title}
              onChange={(e) =>
                handleLectureChange(idx, "title", e.target.value)
              }
              className="border p-2 rounded w-full text-sm"
            />
            <input
              type="text"
              readOnly
              placeholder="재생 시간 (예: 15:30)"
              value={lecture.duration}
              className="border p-2 rounded w-full text-sm bg-gray-100"
            />
            <label className="block font-medium text-sm">강의 영상</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoDuration(idx, e)}
            />
            {!lecture.videoFile && lecture.existingVideoUrl && (
              <p className="text-xs text-gray-400">* 기존 영상이 있습니다</p>
            )}
            <label className="block font-medium text-sm">강의 자료 (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                handleLectureChange(idx, "pdfFile", e.target.files?.[0])
              }
            />
            {!lecture.pdfFile && lecture.existingFileUrl && (
              <p className="text-xs text-gray-400">* 기존 자료가 있습니다</p>
            )}

            {lecture.id && recommendedMap[lecture.id] && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded animate-fade-in">
                <p className="text-sm font-medium text-blue-800">추천 악기:</p>
                <ul className="list-disc pl-5 text-sm text-blue-700">
                  {recommendedMap[lecture.id].map((cat) => (
                    <li key={cat}>{cat}</li>
                  ))}
                </ul>
                {classCategory && (
                  <p className="text-sm mt-2 text-gray-700">
                    이 클래스의 카테고리는{" "}
                    <span className="font-semibold">{classCategory}</span>
                    입니다.
                    <br />
                    영상 분석 결과{" "}
                    <span className="font-semibold">
                      {recommendedMap[lecture.id].join(", ")}
                    </span>{" "}
                    악기가 감지되었습니다. <br />
                    <span className="font-semibold">{classCategory}</span>에
                    적합한 강의인지 확인해 주세요.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={async () => {
                  setActiveSubmittingIndex(idx);
                  setIsSubmitting(true);
                  try {
                    await registerLecture(lecture, idx);
                  } catch (err) {
                    console.error("등록 오류:", err);
                    alert("강의 등록 중 오류가 발생했습니다.");
                  } finally {
                    setActiveSubmittingIndex(null);
                    setIsSubmitting(false);
                  }
                }}
                className={`mt-2 text-sm px-4 py-1.5 rounded transition font-semibold ${
                  lecture.id
                    ? "bg-gray-300 hover:bg-gray-400 text-gray-800"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } ${
                  activeSubmittingIndex === idx
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={
                  isSubmitting ||
                  activeSubmittingIndex !== null ||
                  !isModifiedLecture(lecture)
                }
              >
                {activeSubmittingIndex === idx
                  ? lecture.id
                    ? "수정 중..."
                    : "등록 중..."
                  : lecture.id
                  ? "수정하기"
                  : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddLecture}
        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
      >
        + 강의 추가
      </button>

      {/* ✅ 등록 완료 메시지 */}
      {!isSubmitting &&
        lectures.length > 0 &&
        lectures.every((lec) => lec.id) && (
          <div className="mt-6 bg-white border border-green-400 p-6 rounded shadow-lg animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-green-800 font-bold text-lg">
                모든 강의가 성공적으로 등록되었습니다!
              </p>
            </div>
            <p className="text-gray-700 text-sm mb-4">
              추천 악기 분석 결과도 함께 확인해 보세요.
            </p>
            <div className="text-right">
              <button
                onClick={() => navigate("/mypage/instructor/classes")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                클래스 목록으로 이동
              </button>
            </div>
          </div>
        )}

      {/* ✅ 로딩 오버레이 */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
          <div className="bg-white px-10 py-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 w-80 text-center border border-gray-200">
            {/* 로딩 애니메이션 */}
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />

            {/* 제목 */}
            <h2 className="text-lg font-bold text-gray-800">
              강의 분석 중입니다
            </h2>

            {/* 설명 */}
            <p className="text-sm text-gray-600 leading-relaxed">
              🎶 악기 분석을 진행 중입니다 🥁
              <br />
              잠시만 기다려 주세요!
            </p>
          </div>
        </div>
      )}
      {/* {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 bg-white px-8 py-6 rounded-lg shadow-xl">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base font-semibold text-gray-800">
              강의 분석 중입니다
            </p>
            <p className="text-sm text-gray-600 text-center">
              🎶악기 분석을 진행 중입니다.
              <br />
              잠시만 기다려 주세요...
            </p>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default CreateLecturePage;

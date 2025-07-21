import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadApi } from "../../apis/uploadApi";
import { lectureApi } from "../../apis/lectureApi";

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

export interface LectureResponse {
  lectureId: number;
  title: string;
  duration: number;
  order: number;
  progressRate?: number | null;
  isCompleted?: boolean | null;
  videoUrl?: string;
  fileUrl?: string;
  videoObjectKey?: string;
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
  const isSubmitting = false;
  const isDone = false;
  const [activeSubmittingIndex, setActiveSubmittingIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!classId) return;
    const fetchExistingLectures = async () => {
      try {
        const data: LectureResponse[] = await lectureApi.getLectureList(
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
          existingLectureOrder: l.order,
          existingVideoObjectKey: l.videoObjectKey,
        }));
        setLectures(formatted);
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

  const handleLectureChange = <
      T extends keyof LectureForm
  >(
      index: number,
      field: T,
      value: LectureForm[T]
  ) => {
    const updated = [...lectures];
    updated[index][field] = value;
    setLectures(updated);
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

  const uploadFile = async (file: File) => {
    const { uploadUrl, fileUrl, objectKey } = await uploadApi.getPresignedUrl(
      file.name,
      file.type
    );
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
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
        .map(([k]) => k.toUpperCase());
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
        [res.lectureId]: res.recommendedCategories,
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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">강의 등록</h1>
      {lectures.map((lecture, idx) => (
        <div key={idx} className="mb-6 border p-4 rounded space-y-2 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">강의 {idx + 1}</h3>
            <button
              onClick={() => handleDeleteLecture(idx)}
              className="text-red-500 text-sm"
            >
              삭제
            </button>
          </div>
          <input
            type="text"
            placeholder="강의 제목"
            value={lecture.title}
            onChange={(e) => handleLectureChange(idx, "title", e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            readOnly
            placeholder="재생 시간 (예: 15:30)"
            value={lecture.duration}
            className="border p-2 rounded w-full"
          />
          <label className="block font-medium">강의 영상</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleVideoDuration(idx, e)}
          />
          {!lecture.videoFile && lecture.existingVideoUrl && (
            <p className="text-xs text-gray-400">* 기존 영상이 있습니다</p>
          )}
          <label className="block font-medium">강의 자료 (PDF)</label>
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
            <div className="mt-2 p-2 bg-white border rounded">
              <p className="text-sm font-medium text-gray-700">추천 악기:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {recommendedMap[lecture.id].map((cat) => (
                  <li key={cat}>{cat}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={async () => {
                setActiveSubmittingIndex(idx);
                try {
                  await registerLecture(lecture, idx);
                } finally {
                  setActiveSubmittingIndex(null);
                }
              }}
              className={`mt-2 text-white text-sm px-3 py-1 rounded ${
                lecture.id ? "bg-blue-500" : "bg-green-500"
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
      ))}
      <button
        type="button"
        onClick={handleAddLecture}
        className="bg-gray-200 px-4 py-2 rounded"
      >
        + 강의 추가
      </button>
      {/* <button
        onClick={handleSubmit}
        className={`bg-blue-600 text-white px-4 py-2 rounded w-full ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={
          isSubmitting || lectures.filter(isModifiedLecture).length === 0
        }
      >
        {isSubmitting ? "등록 중..." : "강의 등록하기"}
      </button> */}
      {isDone && (
        <div className="mt-6 bg-green-100 border border-green-300 p-4 rounded">
          <p className="text-green-800 font-semibold">
            강의 등록이 완료되었습니다!
          </p>
          <p className="text-sm mt-1">아래 추천 악기를 확인해보세요.</p>
          <button
            onClick={() => navigate("/mypage/instructor/classes")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            클래스 목록으로 이동
          </button>
        </div>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow text-center">
            <svg
              className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <p className="text-sm">
              강의를 등록하고 있습니다. 잠시만 기다려주세요...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLecturePage;

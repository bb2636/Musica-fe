import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadApi } from "../../apis/uploadApi";
import { lectureApi } from "../../apis/lectureApi";

interface LectureForm {
  id?: number; // 기존 강의는 id 보유
  title: string;
  videoFile?: File;
  pdfFile?: File;
  duration: string;
  existingVideoUrl?: string;
  existingFileUrl?: string;
}

interface LectureResponse {
  id: number;
  title: string;
  videoUrl?: string;
  fileUrl?: string;
  duration: number; // 초 단위
}

const parseDurationToSeconds = (time: string): number => {
  const parts = time.split(":").map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return Number(time);
};

const formatDuration = (seconds: number): string => {
  return `${Math.floor(seconds / 60)}:${("0" + (seconds % 60)).slice(-2)}`;
};

const CreateLecturePage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [lectures, setLectures] = useState<LectureForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!classId) return;

    const fetchExistingLectures = async () => {
      try {
        const data: LectureResponse[] = await lectureApi.getLectureList(
          Number(classId)
        );
        const formatted: LectureForm[] = data.map((l) => ({
          id: l.id,
          title: l.title,
          duration: formatDuration(l.duration),
          existingVideoUrl: l.videoUrl,
          existingFileUrl: l.fileUrl,
        }));
        setLectures(formatted);
      } catch (err) {
        console.error("기존 강의 불러오기 실패:", err);
      }
    };

    fetchExistingLectures();
  }, [classId]);

  const handleAddLecture = () => {
    setLectures([...lectures, { title: "", duration: "" }]);
  };

  const handleRemoveLecture = (index: number) => {
    const updated = [...lectures];
    updated.splice(index, 1);
    setLectures(updated);
  };

  const handleLectureChange = (
    index: number,
    field: keyof LectureForm,
    value: any
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
      };
      video.src = URL.createObjectURL(file);
      handleLectureChange(index, "videoFile", file);
    }
  };

  const uploadFile = async (file: File) => {
    const { uploadUrl, fileUrl } = await uploadApi.getPresignedUrl(
      file.name,
      file.type
    );
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    return fileUrl;
  };

  const registerLecture = async (lecture: LectureForm, index: number) => {
    if (lecture.id) return; // 기존 강의는 등록 스킵

    const videoUrl = lecture.videoFile
      ? await uploadFile(lecture.videoFile)
      : undefined;
    const fileUrl = lecture.pdfFile
      ? await uploadFile(lecture.pdfFile)
      : undefined;

    await lectureApi.createLecture(Number(classId), {
      title: lecture.title,
      videoUrl,
      fileUrl,
      duration: parseDurationToSeconds(lecture.duration),
      lectureOrder: index + 1,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 🔍 등록 대상 강의 필터링
      const lecturesToRegister = lectures.filter(
        (lecture) =>
          !lecture.id && // 기존 강의는 제외
          lecture.title.trim() !== "" && // 제목이 비어있으면 제외
          (lecture.videoFile || lecture.pdfFile) // 영상이나 파일 둘 중 하나라도 있어야 등록
      );

      // ✅ 필터링된 강의만 등록 요청
      for (let i = 0; i < lecturesToRegister.length; i++) {
        await registerLecture(lecturesToRegister[i], i);
      }

      alert("강의 등록 완료!");
      navigate("/mypage/instructor/classes");
    } catch (err) {
      console.error("강의 등록 실패:", err);
      alert("강의 등록 실패");
    } finally {
      setIsSubmitting(false);
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
              onClick={() => handleRemoveLecture(idx)}
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
            placeholder="재생 시간 (예: 15:30)"
            value={lecture.duration}
            onChange={(e) =>
              handleLectureChange(idx, "duration", e.target.value)
            }
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
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddLecture}
        className="bg-gray-200 px-4 py-2 rounded"
      >
        + 강의 추가
      </button>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        disabled={
          isSubmitting ||
          lectures.filter(
            (l) => !l.id && l.title.trim() !== "" && (l.videoFile || l.pdfFile)
          ).length === 0
        }
      >
        {isSubmitting ? "등록 중..." : "강의 등록하기"}
      </button>

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

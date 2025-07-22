import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { lectureApi } from "../../apis/lectureApi";
import type { LectureDetail } from "../../types/lecture";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LectureWatchPage = () => {
  const { lectureId } = useParams();
  const parsedLectureId = Number(lectureId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true); // 마운트 상태 추적

  const [lecture, setLecture] = useState<LectureDetail | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [watchedSeconds, setWatchedSeconds] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ 진도 저장 함수 (안전성 강화)
  const saveProgress = useCallback(
    async (forceImmediate = false) => {
      // 컴포넌트가 언마운트되었으면 return
      if (!isMountedRef.current) {
        console.log("🚫 Component unmounted, skipping save");
        return;
      }

      console.log("🟡 saveProgress called");

      // 조건 체크를 더 안전하게
      if (!parsedLectureId || isNaN(parsedLectureId)) {
        console.log("❌ Invalid lectureId:", parsedLectureId);
        return;
      }

      if (!videoRef.current) {
        console.log("❌ Video ref not available");
        return;
      }

      if (!duration || duration <= 0) {
        console.log("❌ Duration not valid:", duration);
        return;
      }

      const currentTime = videoRef.current.currentTime;

      // currentTime이 유효한지 체크
      if (isNaN(currentTime) || currentTime < 0) {
        console.log("❌ Invalid currentTime:", currentTime);
        return;
      }

      const progressRate = (currentTime / duration) * 100;
      const isNowCompleted = progressRate >= 95;

      const payload = {
        watchedSeconds: Math.floor(currentTime), // 정수로 변환
        completed: isNowCompleted,
      };

      console.log("📤 Saving progress:", payload);

      try {
        await lectureApi.saveProgress(parsedLectureId, payload);
        console.log("✅ 진도 저장 완료:", payload);

        if (isMountedRef.current) {
          if (isNowCompleted && !completed) {
            toast.success("🎉 강의 수강 완료!");
            setCompleted(true);
          } else if (forceImmediate) {
            toast.success("💾 진도 저장 완료!");
          }
        }
      } catch (error) {
        console.error("❌ 진도 저장 실패:", error);
        if (forceImmediate && isMountedRef.current) {
          toast.error("진도 저장에 실패했습니다.");
        }
      }
    },
    [parsedLectureId, duration, completed]
  );

  // ✅ 디바운스된 진도 저장 (5초마다)
  const debouncedSaveProgress = useCallback(() => {
    if (!isMountedRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        saveProgress();
      }
    }, 5000);
  }, [saveProgress]);

  // ✅ 강의 정보 불러오기
  useEffect(() => {
    if (!parsedLectureId || isNaN(parsedLectureId)) {
      console.log("❌ Invalid lectureId in fetch:", parsedLectureId);
      return;
    }

    const fetchLecture = async () => {
      try {
        setLoading(true);
        console.log("📥 Fetching lecture:", parsedLectureId);
        const res = await lectureApi.getLectureDetail(parsedLectureId);
        console.log("📦 Lecture data:", res);

        if (isMountedRef.current) {
          setLecture(res);
          setCompleted(res.isCompleted);
        }
      } catch (error) {
        console.error("❌ 강의 정보 로드 실패:", error);
        if (isMountedRef.current) {
          toast.error("강의 정보를 불러올 수 없습니다.");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchLecture();
  }, [parsedLectureId]);

  // ✅ 마운트 상태 관리 및 정리
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      console.log("🧹 Component unmounting, cleaning up...");
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  // ✅ 영상 재생 시간 추적
  const handleTimeUpdate = () => {
    if (!isMountedRef.current || !videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    if (isNaN(currentTime)) return;

    setWatchedSeconds(currentTime);
    debouncedSaveProgress();
  };

  // ✅ 영상 일시정지 시 진도 저장
  const handlePause = () => {
    console.log("⏸️ Video paused");
    if (!isMountedRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveProgress(true);
  };

  // ✅ 영상 재생 시작할 때도 저장
  const handlePlay = () => {
    console.log("▶️ Video played");
    if (!isMountedRef.current) return;
    saveProgress();
  };

  // ✅ 메타데이터 로드 처리
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!isMountedRef.current) return;

    const video = e.currentTarget;
    const videoDuration = video.duration;

    console.log("📦 Metadata loaded. duration:", videoDuration);

    if (isNaN(videoDuration) || videoDuration <= 0) {
      console.log("❌ Invalid video duration:", videoDuration);
      return;
    }

    setDuration(videoDuration);

    if (lecture && lecture.watchedSeconds && lecture.watchedSeconds > 0) {
      video.currentTime = Math.min(lecture.watchedSeconds, videoDuration);
      console.log("⏭️ Set video time to:", lecture.watchedSeconds);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-64">
        <div className="text-lg">강의를 불러오는 중...</div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="p-4 text-center">
        <div className="text-lg text-red-500">강의를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">{lecture.title}</h2>

      {/* 디버그 정보 */}
      <div className="mb-4 p-2 bg-gray-100 text-sm rounded">
        <div>📊 Debug Info:</div>
        <div>- Lecture ID: {parsedLectureId}</div>
        <div>- Duration: {duration}</div>
        <div>- Watched: {Math.floor(watchedSeconds)}</div>
        <div>- Completed: {completed ? "Yes" : "No"}</div>
        <div>- Video URL: {lecture.videoUrl ? "Available" : "Missing"}</div>
      </div>

      {completed && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
          ✅ 이 강의는 수강 완료되었습니다!
        </div>
      )}

      <video
        ref={videoRef}
        controls
        src={lecture.videoUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onPlay={handlePlay}
        onEnded={() => saveProgress(true)}
        onError={(e) => {
          console.error("❌ Video error:", e);
          toast.error("비디오 로드에 실패했습니다.");
        }}
        className="w-full max-w-4xl rounded-lg shadow"
      />

      <div className="mt-4 space-y-2">
        <div>
          ⏱ 현재 시청 시간: {Math.floor(watchedSeconds)}초 / 총{" "}
          {Math.floor(duration)}초
        </div>
        <div>
          📊 진도율:{" "}
          {duration > 0 ? Math.round((watchedSeconds / duration) * 100) : 0}%
        </div>
        <progress
          value={watchedSeconds}
          max={duration}
          className="w-full h-3"
        />
      </div>

      {/* 수동 저장 버튼 */}
      <div className="mt-4">
        <button
          onClick={() => saveProgress(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          💾 진도 저장
        </button>
      </div>
    </div>
  );
};

export default LectureWatchPage;

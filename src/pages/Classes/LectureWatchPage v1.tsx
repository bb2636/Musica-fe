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
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* 강의 제목 & 완료 배지 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{lecture.title}</h1>
        {completed && (
          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
            ✅ 수강 완료
          </span>
        )}
      </div>

      {/* 영상 플레이어 */}
      <div className="rounded-lg overflow-hidden shadow mb-6">
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
          className="w-full aspect-video bg-black"
        />
      </div>

      {/* 진도 정보 */}
      <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-700">
            ⏱ 시청 시간: {Math.floor(watchedSeconds)}초 / {Math.floor(duration)}
            초
          </p>
          <p className="text-sm text-gray-700">
            📊 진도율:{" "}
            {duration > 0
              ? Math.min(100, Math.round((watchedSeconds / duration) * 100))
              : 0}
            %
          </p>
          <progress
            value={watchedSeconds}
            max={duration}
            className="w-full h-2 mt-1"
          />
        </div>

        {/* 진도 수동 저장 버튼 */}
        <button
          onClick={() => saveProgress(true)}
          className="whitespace-nowrap self-start sm:self-auto px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          💾 진도 저장
        </button>
      </div>
    </div>
  );
};

export default LectureWatchPage;

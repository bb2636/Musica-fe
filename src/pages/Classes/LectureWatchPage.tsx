import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lectureApi } from "../../apis/lectureApi";
import type { LectureDetail, LectureSummary } from "../../types/lecture";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../components/Header";

const LectureWatchPage = () => {
  const { lectureId } = useParams();
  const parsedLectureId = Number(lectureId);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const [lecture, setLecture] = useState<LectureDetail | null>(null);
  const [lectureList, setLectureList] = useState<LectureSummary[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [watchedSeconds, setWatchedSeconds] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const saveProgress = useCallback(
    async (forceImmediate = false) => {
      if (
        !isMountedRef.current ||
        !parsedLectureId ||
        !videoRef.current ||
        !duration
      )
        return;

      const currentTime = videoRef.current.currentTime;
      if (isNaN(currentTime) || currentTime < 0) return;

      const progressRate = (currentTime / duration) * 100;
      const isNowCompleted = progressRate >= 95;

      const payload = {
        watchedSeconds: Math.floor(currentTime),
        completed: isNowCompleted,
      };

      try {
        await lectureApi.saveProgress(parsedLectureId, payload);
        if (isMountedRef.current) {
          if (isNowCompleted && !completed) {
            toast.success("🎉 강의 수강 완료!");
            setCompleted(true);
          } else if (forceImmediate) {
            toast.success("💾 진도 저장 완료!");
          }
        }
      } catch {
        if (forceImmediate && isMountedRef.current) {
          toast.error("진도 저장에 실패했습니다.");
        }
      }
    },
    [parsedLectureId, duration, completed]
  );

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

  // ✅ 1. 시청 정보 초기화용 useEffect (여기에 추가!)
  useEffect(() => {
    // 강의 ID가 바뀌면 시청 정보 초기화
    setWatchedSeconds(0);
    setDuration(0);
    setCompleted(false);

    // 영상도 처음부터 시작하게 하려면 (선택 사항)
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [parsedLectureId]);

  // ✅ 2. 강의 정보 불러오기 (이미 있는 코드)
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        const res = await lectureApi.getLectureDetail(parsedLectureId);
        setLecture(res);
        setCompleted(res.isCompleted);
      } catch {
        toast.error("강의 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    const fetchLectureList = async () => {
      if (!parsedLectureId || isNaN(parsedLectureId)) return;
      try {
        const res = await lectureApi.getLectureListForStudent(
          lecture?.classId || 0
        );
        setLectureList(res);
      } catch {
        toast.error("강의 목록을 불러올 수 없습니다.");
      }
    };

    fetchLecture().then(() => {
      if (lecture?.classId) fetchLectureList();
    });
  }, [parsedLectureId, lecture?.classId]);

  // ✅ 3. 마운트/언마운트 관리
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ✅ 4. 수강 완료 자동 감지 (requestAnimationFrame)
  useEffect(() => {
    let animationFrameId: number;
    let hasTriggeredCompletion = false;

    const checkCompletion = () => {
      if (!isMountedRef.current || !videoRef.current || !duration || completed)
        return;

      const currentTime = videoRef.current.currentTime;
      const progressRate = (currentTime / duration) * 100;

      if (progressRate >= 90 && !hasTriggeredCompletion) {
        hasTriggeredCompletion = true;
        saveProgress(true); // 바로 완료 처리
      }

      animationFrameId = requestAnimationFrame(checkCompletion);
    };

    animationFrameId = requestAnimationFrame(checkCompletion);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration, completed, saveProgress]);

  const handleTimeUpdate = () => {
    if (!isMountedRef.current || !videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    if (isNaN(currentTime)) return;
    setWatchedSeconds(currentTime);
    debouncedSaveProgress();
  };

  const handlePause = () => {
    if (!isMountedRef.current) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveProgress(true);
  };

  const handlePlay = () => {
    if (!isMountedRef.current) return;
    saveProgress();
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!isMountedRef.current) return;
    const video = e.currentTarget;
    const videoDuration = video.duration;
    if (isNaN(videoDuration) || videoDuration <= 0) return;
    setDuration(videoDuration);
    if (lecture?.watchedSeconds) {
      video.currentTime = Math.min(lecture.watchedSeconds, videoDuration);
    }
  };

  if (loading || !lecture) {
    return <div className="p-4">강의 정보를 불러오는 중입니다...</div>;
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">{lecture.title}</h1>
          <video
            ref={videoRef}
            controls
            src={lecture.videoUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPause={handlePause}
            onPlay={handlePlay}
            onEnded={() => saveProgress(true)}
            className="w-full aspect-video bg-black rounded-lg shadow"
          />
          <div className="bg-gray-50 rounded p-4 shadow-sm mt-4">
            <p className="text-sm">
              진도율: {Math.round((watchedSeconds / duration) * 100)}%
            </p>
            <progress
              value={watchedSeconds}
              max={duration}
              className="w-full h-2 mt-1"
            />
          </div>
        </div>
        <aside className="w-full lg:w-80">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">강의 목록</h2>
            <ul className="space-y-2">
              {lectureList.map((lec) => (
                <li
                  key={lec.lectureId}
                  onClick={() =>
                    navigate(
                      `/classes/${lecture.classId}/lectures/${lec.lectureId}`
                    )
                  }
                  className={`p-3 rounded border cursor-pointer transition hover:bg-gray-100 ${
                    lec.lectureId === lecture.lectureId
                      ? "bg-blue-50 border-blue-500"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{lec.title}</span>
                    {lec.isCompleted && (
                      <span className="flex items-center gap-1 text-green-600 text-xs whitespace-nowrap">
                        <span>✔</span>
                        <span>완료</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ⏱ {Math.floor(lec.duration / 60)}분 {lec.duration % 60}초
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>{" "}
      </div>
    </>
  );
};

export default LectureWatchPage;

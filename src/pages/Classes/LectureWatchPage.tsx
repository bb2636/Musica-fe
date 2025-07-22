import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lectureApi } from "../../apis/lectureApi";
import type { LectureDetail, LectureSummary } from "../../types/lecture";

const LectureWatchPage: React.FC = () => {
  const urlParams = useParams<{ classId: string; lectureId?: string }>();
  const navigate = useNavigate();

  const [lectureDetail, setLectureDetail] = useState<LectureDetail | null>(
    null
  );
  const [lectureList, setLectureList] = useState<LectureSummary[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!urlParams.lectureId) {
      (async () => {
        try {
          const list = await lectureApi.getLectureListForStudent(
            Number(urlParams.classId)
          );
          const first = list.find((l) => l.isAccessible);
          if (first) {
            navigate(
              `/classes/${urlParams.classId}/lectures/${first.lectureId}`,
              { replace: true }
            );
          } else {
            setError("아직 열람 가능한 강의가 없습니다.");
          }
        } catch {
          setError("강의 목록을 불러올 수 없습니다.");
        }
      })();
      return;
    }
  }, [urlParams.lectureId, urlParams.classId, navigate]);

  useEffect(() => {
    loadAllData();
    return () => {
      if (progressSaveIntervalRef.current)
        clearInterval(progressSaveIntervalRef.current);
    };
  }, [urlParams.lectureId]);

  const saveProgress = useCallback(async () => {
    if (!videoRef.current || !lectureDetail || duration === 0) return;
    const watchedSeconds = Math.floor(currentTime);
    const progressRate = (currentTime / duration) * 100;
    const isCompleted = progressRate >= 90;
    try {
      await lectureApi.saveProgress(lectureDetail.lectureId, {
        watchedSeconds,
        isCompleted,
      });
      setLectureDetail((prev: LectureDetail | null) =>
        prev ? { ...prev, watchedSeconds, isCompleted } : null
      );
    } catch (err) {
      console.error("진도 저장 실패:", err);
    }
  }, [lectureDetail, currentTime, duration]);

  useEffect(() => {
    if (isPlaying && currentTime > 0 && lectureDetail) {
      progressSaveIntervalRef.current = setInterval(() => {
        saveProgress();
      }, 30000);
    } else if (progressSaveIntervalRef.current) {
      clearInterval(progressSaveIntervalRef.current);
    }
    return () => {
      if (progressSaveIntervalRef.current)
        clearInterval(progressSaveIntervalRef.current);
    };
  }, [isPlaying, currentTime, lectureDetail, saveProgress]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await lectureApi.getLectureWatchData(
        Number(urlParams.classId),
        Number(urlParams.lectureId)
      );

      const detail = await lectureApi.getLectureDetail(
        Number(urlParams.lectureId)
      );
      setLectureDetail(detail);

      const list = await lectureApi.getLectureListForStudent(
        Number(urlParams.classId)
      );
      setLectureList(list);

      if (detail.watchedSeconds > 0) {
        setTimeout(() => {
          if (videoRef.current)
            videoRef.current.currentTime = detail.watchedSeconds;
        }, 500);
      }
    } catch (err) {
      console.error("강의 데이터 로딩 실패:", err);
      setError("강의 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const goToLecture = async (lecture: LectureSummary) => {
    if (!lecture.isAccessible) return alert("아직 이용할 수 없는 강의입니다.");
    await saveProgress();
    navigate(`/classes/${urlParams.classId}/lectures/${lecture.lectureId}`);
  };

  const getPreviousLecture = () => {
    const index = lectureList.findIndex(
      (l) => l.lectureId === lectureDetail?.lectureId
    );
    if (index > 0) return lectureList[index - 1];
    return null;
  };

  const getNextLecture = () => {
    const index = lectureList.findIndex(
      (l) => l.lectureId === lectureDetail?.lectureId
    );
    if (index >= 0 && index < lectureList.length - 1)
      return lectureList[index + 1];
    return null;
  };

  if (loading) {
    return <div className="text-white">강의 로딩 중...</div>;
  }

  if (error || !lectureDetail) {
    return (
      <div className="text-red-600">
        {error || "강의 정보를 불러올 수 없습니다."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">
        {lectureDetail.className} - {lectureDetail.title}
      </h1>
      <video
        ref={videoRef}
        className="w-full h-[60vh] bg-black"
        controls
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false);
          saveProgress();
        }}
        src={lectureDetail.videoUrl}
      />

      <div className="mt-4 flex justify-between items-center text-sm">
        <div>
          현재 시간: {Math.floor(currentTime)}초 / 총 {Math.floor(duration)}초
        </div>
        <div>
          진도율: {Math.floor((currentTime / duration) * 100)}%
          {lectureDetail.isCompleted ? " ✅ 완료" : " 🔄 진행 중"}
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        {getPreviousLecture() && (
          <button
            onClick={() => goToLecture(getPreviousLecture()!)}
            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
          >
            ← 이전 강의
          </button>
        )}
        {getNextLecture() && (
          <button
            onClick={() => goToLecture(getNextLecture()!)}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
          >
            다음 강의 →
          </button>
        )}
      </div>
    </div>
  );
};

export default LectureWatchPage;

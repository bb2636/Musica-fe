import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lectureApi } from "../../apis/lectureApi";
import type { LectureDetail, LectureSummary } from "../../types/lecture";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createQuestion, getQuestionsByClass } from "../../apis/qna";
import type { QuestionDto } from "../../types/qna";

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
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [qnaLoading, setQnaLoading] = useState(false);

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

  // Q&A 불러오기
  const fetchQuestions = useCallback(async () => {
    if (!lecture?.classId) return;
    setQnaLoading(true);
    try {
      const res = await getQuestionsByClass(lecture.classId);
      setQuestions(res.data);
    } catch (e) {
      toast.error("Q&A를 불러오지 못했습니다.");
    } finally {
      setQnaLoading(false);
    }
  }, [lecture?.classId]);

  // 강의 정보 불러온 후 Q&A도 불러오기
  useEffect(() => {
    if (lecture?.classId) {
      fetchQuestions();
    }
  }, [lecture?.classId, fetchQuestions]);

  // Q&A 질문 등록
  const handleCreateQuestion = async () => {
    console.log("[QNA] lecture 객체:", JSON.stringify(lecture, null, 2));
    if (!newQuestion.trim() || !lecture?.classId || !lecture?.id) {
      console.warn("[QNA] 등록 불가: 값 부족", { newQuestion, classId: lecture?.classId, lectureId: lecture?.id });
      return;
    }
    const payload = {
      classId: lecture.classId,
      lectureId: lecture.id,
      question: newQuestion.trim(),
    };
    console.log("[QNA] 등록 payload:", payload);
    try {
      await createQuestion(payload);
      setNewQuestion("");
      fetchQuestions();
      toast.success("질문이 등록되었습니다.");
    } catch (e) {
      console.error("[QNA] 질문 등록 에러:", e);
      toast.error("질문 등록에 실패했습니다.");
    }
  };

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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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

        {/* Q&A 영역 - 영상 아래에 배치 */}
        <section className="mt-10">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span role="img" aria-label="QnA">💬</span> Q&amp;A
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <textarea
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="이 강의에 대해 궁금한 점을 질문해보세요!"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                disabled={qnaLoading}
                maxLength={300}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateQuestion}
                disabled={qnaLoading || !newQuestion.trim()}
              >
                질문 등록
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">{newQuestion.length}/300자</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span role="img" aria-label="list">📋</span> 이 강의의 Q&amp;A
            </h3>
            {qnaLoading ? (
              <div className="text-gray-500 py-8 text-center">Q&amp;A 불러오는 중...</div>
            ) : (
              <ul className="space-y-4">
                {questions.filter(q => q.lectureId === lecture.id).length === 0 ? (
                  <li className="text-gray-400 text-center py-8">아직 등록된 질문이 없습니다.</li>
                ) : (
                  questions
                    .filter(q => q.lectureId === lecture.id)
                    .map(q => (
                      <li key={q.questionId} className="border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-blue-700">Q.</span>
                          <span className="text-gray-800">{q.question}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex justify-between">
                          <span>작성일: {q.createdAt?.slice(0, 10)}</span>
                          {/* <span>질문자: {q.userId}</span> // 추후 닉네임 등 표시 가능 */}
                        </div>
                      </li>
                    ))
                )}
              </ul>
            )}
          </div>
        </section>
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
                    <span className="text-green-600 text-xs">✔ 완료</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ⏱ {Math.floor(lec.duration / 60)}분 {lec.duration % 60}초
                </p>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default LectureWatchPage;

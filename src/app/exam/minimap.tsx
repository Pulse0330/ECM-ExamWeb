"use client";

import { Flag, Clock } from "lucide-react";
import { useMemo, memo, useState, useEffect } from "react";

interface MiniMapProps {
  questions: any[];
  choosedAnswers: Record<number, number>;
  bookmarks: number[];
  currentQuestionIndex?: number;
  onJump: (qid: number) => void;
  endTime?: string; // Add endTime prop
  examMinutes?: number; // Add examMinutes prop
}

const MiniMap = memo(function MiniMap({
  questions,
  choosedAnswers,
  bookmarks,
  currentQuestionIndex,
  onJump,
  endTime,
  examMinutes,
}: MiniMapProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (!timeLeft || !examMinutes) return "text-slate-600";
    const totalSeconds = examMinutes * 60;
    const percentage = (timeLeft / totalSeconds) * 100;

    if (percentage > 50) return "text-green-600 dark:text-green-400";
    if (percentage > 20) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getTimeBgColor = () => {
    if (!timeLeft || !examMinutes) return "bg-slate-100";
    const totalSeconds = examMinutes * 60;
    const percentage = (timeLeft / totalSeconds) * 100;

    if (percentage > 50)
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    if (percentage > 20)
      return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  };

  const stats = useMemo(() => {
    const answered = Object.keys(choosedAnswers).length;
    const bookmarked = bookmarks.length;
    const total = questions.length;
    return { answered, bookmarked, total };
  }, [choosedAnswers, bookmarks, questions.length]);

  const bookmarkedQuestions = useMemo(() => {
    return questions.filter((q) => bookmarks.includes(q.question_id));
  }, [questions, bookmarks]);

  return (
    <div className="space-y-2">
      {/* Timer Card */}
      {timeLeft !== null && (
        <div
          className={`rounded-xl shadow-sm px-3 py-2.5 border ${getTimeBgColor()}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className={getTimeColor()} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Үлдсэн хугацаа
              </span>
            </div>
            <span className={`text-sm font-mono font-bold ${getTimeColor()}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      )}

      {/* Compact Stats Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm px-3 py-2.5 border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Асуултын зураг
          </span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-semibold">
            {stats.answered}/{stats.total}
          </span>
        </div>
        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(stats.answered / stats.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Dot Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-2.5 border">
        <div className="flex flex-wrap gap-1.5 lg:grid lg:grid-cols-6">
          {questions.map((q, idx) => {
            const answered = !!choosedAnswers[q.question_id];
            const isBookmarked = bookmarks.includes(q.question_id);
            const isCurrent = currentQuestionIndex === idx;

            return (
              <button
                key={q.question_id}
                onClick={() => onJump(q.question_id)}
                className={`relative w-9 h-9 lg:w-full lg:aspect-square rounded-lg transition-all active:scale-90 flex items-center justify-center text-xs font-bold
                  ${
                    answered
                      ? "bg-green-500 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600"
                  }
                  ${isCurrent ? "" : ""}
                `}
              >
                {idx + 1}

                {isBookmarked && (
                  <span className="absolute -top-1 -right-1 z-10">
                    <div className="bg-yellow-400 rounded-full p-0.5 shadow-md">
                      <Flag size={8} className="fill-white text-white" />
                    </div>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookmarks Section */}
      {bookmarkedQuestions.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-sm p-2.5 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-1.5">
            <Flag size={12} className="fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-800 dark:text-yellow-200">
              Тэмдэглэсэн ({bookmarkedQuestions.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {bookmarkedQuestions.map((q) => {
              const questionIndex = questions.findIndex(
                (quest) => quest.question_id === q.question_id
              );
              return (
                <button
                  key={q.question_id}
                  onClick={() => onJump(q.question_id)}
                  className="bg-white dark:bg-slate-800 border border-yellow-300 dark:border-yellow-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 active:scale-95 transition-all"
                >
                  #{questionIndex + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default MiniMap;

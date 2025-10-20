"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Calendar,
  Hourglass,
  DollarSign,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { ExamData } from "@/types/examlists";
import { cn } from "@/lib/utils";

interface ExamCardProps {
  exam: ExamData;
  now: Date;
}

const getCardStyle = (
  isActive: boolean,
  isPayable: boolean,
  isUpcoming: boolean,
  isFinished: boolean
) => {
  if (isPayable)
    return "border-red-400/60 bg-gradient-to-br from-red-50 via-white to-red-50/50 dark:from-red-950/40 dark:via-gray-950 dark:to-red-950/20 dark:border-red-700/40";
  if (isActive)
    return "border-emerald-400/60 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-950/40 dark:via-gray-950 dark:to-emerald-950/20 dark:border-emerald-700/40";
  if (isUpcoming)
    return "border-blue-400/60 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-950/40 dark:via-gray-950 dark:to-blue-950/20 dark:border-blue-700/40";
  if (isFinished)
    return "border-gray-300/60 bg-gradient-to-br from-gray-50 via-white to-gray-100/50 dark:from-gray-900/40 dark:via-gray-950 dark:to-gray-900/20 dark:border-gray-700/40";
  return "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900";
};

const ExamCard: React.FC<ExamCardProps> = React.memo(({ exam, now }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const examTimes = useMemo(() => {
    const startTime = new Date(exam.ognoo);
    const endTime = new Date(startTime.getTime() + exam.exam_minute * 60000);
    return { startTime, endTime };
  }, [exam.ognoo, exam.exam_minute]);

  const { startTime, endTime } = examTimes;

  const examStatus = useMemo(() => {
    const isPurchased = exam.ispurchased === 1;
    const isFree = exam.ispaydescr === "Төлбөргүй";
    const isPayable = exam.ispaydescr === "Төлбөртэй" && !isPurchased;
    const isUpcoming = now < startTime;
    const isFinished = now > endTime;
    // Free exams and purchased exams can ALWAYS be accessed (even after time ends)
    const canAccess = isFree || isPurchased;
    // Active means: started AND user has access (ignore if finished)
    const isActive = now >= startTime && canAccess && !isFinished;
    // Can take exam anytime if you have access and it's not upcoming
    const canTakeExam = !isUpcoming && canAccess;
    const isLocked = isUpcoming || isPayable;
    return {
      isPurchased,
      isFree,
      isPayable,
      isUpcoming,
      isFinished,
      isActive,
      isLocked,
      canAccess,
      canTakeExam,
    };
  }, [exam.ispurchased, exam.ispaydescr, now, startTime, endTime]);

  const {
    isPurchased,
    isFree,
    isPayable,
    isUpcoming,
    isActive,
    isLocked,
    isFinished,
    canAccess,
    canTakeExam,
  } = examStatus;

  const countdownData = useMemo(() => {
    let statusText = "Дууссан";
    let statusBadgeClass = "bg-gradient-to-r from-gray-500 to-gray-600";
    let buttonText = "Үр дүн харах";
    let countdown = "Шалгалт дууссан";
    let countdownClasses =
      "text-gray-600 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700";

    if (isPayable) {
      statusText = "ТӨЛБӨР";
      statusBadgeClass =
        "bg-gradient-to-r from-red-500 to-rose-600 animate-pulse shadow-lg shadow-red-500/30";
      buttonText = `Төлбөр төлөх`;
      countdown = `${exam.amount.toLocaleString()}₮ төлөх шаардлагатай`;
      countdownClasses =
        "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700/50";
    } else if (isUpcoming && canAccess) {
      // Free or purchased exam that hasn't started yet
      const diff = startTime.getTime() - now.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      countdown = `${minutes}м ${seconds}с`;
      statusText = "УДАХГҮЙ";
      statusBadgeClass =
        "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30";
      buttonText = "Хүлээгдэж байна";
      countdownClasses =
        "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700/50";
    } else if (isUpcoming && !canAccess) {
      // Paid exam, not purchased, not started
      const diff = startTime.getTime() - now.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      countdown = `${minutes}м ${seconds}с`;
      statusText = "УДАХГҮЙ";
      statusBadgeClass =
        "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30";
      buttonText = "Хүлээгдэж байна";
      countdownClasses =
        "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700/50";
    } else if (isActive) {
      // Currently live
      const diff = endTime.getTime() - now.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      countdown = `${minutes}м ${seconds}с`;
      statusText = "LIVE";
      statusBadgeClass =
        "bg-gradient-to-r from-emerald-500 to-green-600 animate-pulse shadow-lg shadow-emerald-500/40";
      buttonText = "Шалгалт эхлүүлэх";
      countdownClasses =
        "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700/50";
    } else if (isFinished && canTakeExam) {
      // Finished but can still take (free or purchased)
      statusText = "БОЛОМЖТОЙ";
      statusBadgeClass =
        "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/30";
      buttonText = "Шалгалт өгөх";
      countdown = "Шалгалт өгөх боломжтой";
      countdownClasses =
        "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700/50";
    } else if (isFinished) {
      // Finished and cannot access
      statusText = "ДУУССАН";
      statusBadgeClass = "bg-gradient-to-r from-gray-500 to-gray-600";
      buttonText = "Үр дүн харах";
      countdown = "Шалгалт дууссан";
      countdownClasses =
        "text-gray-600 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }

    return {
      statusText,
      statusBadgeClass,
      buttonText,
      countdown,
      countdownClasses,
    };
  }, [
    isPayable,
    isUpcoming,
    isActive,
    isFinished,
    canAccess,
    canTakeExam,
    startTime,
    endTime,
    now,
    exam.amount,
  ]);

  const cardStyle = useMemo(
    () => getCardStyle(isActive, isPayable, isUpcoming, isFinished),
    [isActive, isPayable, isUpcoming, isFinished]
  );

  const handleAction = () => {
    if (isPayable) {
      router.push(`/payment/${exam.exam_id}`);
    } else if (canTakeExam) {
      // Clear any saved answers before starting exam
      try {
        // Clear localStorage for this specific exam
        const examStorageKey = `exam_${exam.exam_id}_answers`;
        const examStateKey = `exam_${exam.exam_id}_state`;
        const examTimeKey = `exam_${exam.exam_id}_time`;

        localStorage.removeItem(examStorageKey);
        localStorage.removeItem(examStateKey);
        localStorage.removeItem(examTimeKey);

        // Also clear any other exam-related data that might be stored
        Object.keys(localStorage).forEach((key) => {
          if (key.includes(`exam_${exam.exam_id}`)) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error("Error clearing exam data:", error);
      }

      // Navigate to exam page
      router.push(`/exam/${exam.exam_id}`);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-500 flex flex-col h-full backdrop-blur-sm",
        cardStyle,
        (canTakeExam || isPayable) &&
          "cursor-pointer hover:scale-[1.03] hover:shadow-2xl",
        isActive && "hover:shadow-emerald-500/20",
        isPayable && "hover:shadow-red-500/20",
        isFinished && canTakeExam && "hover:shadow-indigo-500/20"
      )}
      onClick={canTakeExam || isPayable ? handleAction : undefined}
    >
      {/* Decorative gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          isHovered && "opacity-100"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-5",
            isActive && "from-emerald-400 to-green-600",
            isPayable && "from-red-400 to-rose-600",
            isUpcoming && "from-blue-400 to-indigo-600",
            isFinished && "from-gray-400 to-gray-600"
          )}
        />
      </div>

      <div className="relative p-4 sm:p-5 lg:p-6 flex flex-col flex-grow">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h2
              title={exam.title}
              className={cn(
                "text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight min-h-[2.5em] transition-all duration-300",
                isFinished
                  ? "text-gray-600 dark:text-gray-400"
                  : "text-gray-900 dark:text-gray-50",
                isHovered ? "line-clamp-none" : "line-clamp-2"
              )}
            >
              {exam.title}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {isPurchased && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-semibold">Худалдаж авсан</span>
                </div>
              )}
              {isFree && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                  <Sparkles size={14} />
                  <span className="text-xs font-bold">Төлбөргүй</span>
                </div>
              )}
            </div>
          </div>
          <div
            className={cn(
              "text-[10px] sm:text-xs text-white font-bold px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap uppercase tracking-wide flex items-center gap-1 sm:gap-1.5 shadow-lg",
              countdownData.statusBadgeClass
            )}
          >
            {isActive && (
              <Sparkles size={10} className="animate-pulse sm:w-3 sm:h-3" />
            )}
            <span className="hidden xs:inline">{countdownData.statusText}</span>
            <span className="xs:hidden">
              {countdownData.statusText.slice(0, 4)}
            </span>
          </div>
        </div>

        {/* Teacher Info */}
        {exam.teach_name && (
          <div
            className={cn(
              "mb-4 p-3 rounded-xl border backdrop-blur-sm transition-colors duration-300",
              isFinished
                ? "bg-gray-50/50 dark:bg-gray-800/30 border-gray-200/50 dark:border-gray-700/50"
                : "bg-white/50 dark:bg-gray-900/30 border-gray-200/50 dark:border-gray-700/50"
            )}
          >
            <p
              className={cn(
                "text-xs sm:text-sm flex items-center gap-2",
                isFinished
                  ? "text-gray-500 dark:text-gray-500"
                  : "text-gray-700 dark:text-gray-300"
              )}
            >
              <span className="font-semibold text-sm sm:text-base">👨‍🏫</span>
              <span className="hidden xs:inline font-semibold">Багш:</span>
              <span className="font-medium truncate">{exam.teach_name}</span>
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div
          className={cn(
            "grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5",
            isFinished
              ? "text-gray-500 dark:text-gray-500"
              : "text-gray-700 dark:text-gray-300"
          )}
        >
          <StatCard
            icon={
              <BookOpen
                size={16}
                className="text-indigo-500 sm:w-[18px] sm:h-[18px]"
              />
            }
            label="Асуулт"
            value={exam.que_cnt}
            isFinished={isFinished}
            isHovered={isHovered}
          />
          <StatCard
            icon={
              <Clock
                size={16}
                className="text-rose-500 sm:w-[18px] sm:h-[18px]"
              />
            }
            label="Хугацаа"
            value={`${exam.exam_minute} мин`}
            isFinished={isFinished}
            isHovered={isHovered}
          />
          <StatCard
            icon={
              <Calendar
                size={16}
                className="text-blue-500 sm:w-[18px] sm:h-[18px]"
              />
            }
            label="Эхлэх"
            value={startTime.toLocaleTimeString("mn-MN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            isFinished={isFinished}
            isHovered={isHovered}
          />
          <StatCard
            icon={
              <Hourglass
                size={16}
                className="text-amber-500 sm:w-[18px] sm:h-[18px]"
              />
            }
            label="Дуусах"
            value={endTime.toLocaleTimeString("mn-MN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            isFinished={isFinished}
            isHovered={isHovered}
          />
        </div>

        {/* Payment Info */}
        {isPayable && (
          <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 rounded-xl border-2 border-red-200 dark:border-red-800/50 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">
                Төлбөр:
              </span>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-0.5 sm:gap-1">
                <DollarSign size={16} className="sm:w-5 sm:h-5" />
                {exam.amount.toLocaleString()}₮
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAction();
          }}
          disabled={isLocked}
          className={cn(
            "w-full text-sm sm:text-base font-bold py-3 sm:py-3.5 lg:py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg relative overflow-hidden group/btn",
            isActive
              ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:shadow-xl"
              : isPayable
              ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-red-500/40 hover:shadow-red-500/60 hover:shadow-xl"
              : isFinished && canTakeExam
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:shadow-xl"
              : "bg-gray-200 cursor-not-allowed text-gray-500 dark:bg-gray-800 dark:text-gray-500",
            (canTakeExam || isPayable) && "hover:scale-[1.02]"
          )}
        >
          <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
            <span className="truncate">{countdownData.buttonText}</span>
            {(canTakeExam || isPayable) && (
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover/btn:translate-x-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
              />
            )}
          </span>
          {(canTakeExam || isPayable) && (
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          )}
        </button>
      </div>
    </div>
  );
});

ExamCard.displayName = "ExamCard";

const StatCard = React.memo(
  ({
    icon,
    label,
    value,
    isFinished,
    isHovered,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    isFinished?: boolean;
    isHovered?: boolean;
  }) => (
    <div
      className={cn(
        "p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl border backdrop-blur-sm transition-all duration-300",
        isFinished
          ? "bg-gray-50/50 dark:bg-gray-800/30 border-gray-200/50 dark:border-gray-700/50"
          : "bg-white/60 dark:bg-gray-900/40 border-gray-200/60 dark:border-gray-700/60",
        isHovered && !isFinished && "bg-white/80 dark:bg-gray-900/60"
      )}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1">{icon}</div>
      <div
        className={cn(
          "text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1",
          isFinished
            ? "text-gray-500 dark:text-gray-500"
            : "text-gray-600 dark:text-gray-400"
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "text-sm sm:text-base font-bold truncate",
          isFinished
            ? "text-gray-600 dark:text-gray-500"
            : "text-gray-900 dark:text-gray-50"
        )}
      >
        {value}
      </div>
    </div>
  )
);

StatCard.displayName = "StatCard";

export default ExamCard;

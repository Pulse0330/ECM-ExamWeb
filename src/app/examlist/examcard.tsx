"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Calendar,
  Hourglass,
  User,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { ExamData } from "@/types/examlists";
import { cn } from "@/lib/utils";

interface ExamCardProps {
  exam: ExamData;
  now?: string; // optional болгож байна
  router?: any;
  now: Date;
  router: ReturnType<typeof useRouter>;
}

const getCardStyle = (
  isActive: boolean,
  isPayable: boolean,
  isUpcoming: boolean
) => {
  if (isPayable)
    return "border-red-500/70 shadow-xl shadow-red-500/30 bg-white dark:bg-gray-950/50 dark:border-red-700/50";
  if (isActive)
    return "border-green-500/70 shadow-2xl shadow-green-500/30 ring-2 ring-green-500/20 bg-white dark:bg-gray-950/50 dark:border-green-700/50";
  if (isUpcoming)
    return "border-blue-400/70 shadow-lg shadow-blue-500/10 bg-white dark:bg-gray-950/50 dark:border-blue-700/50";
  return "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900";
};

const ExamCard: React.FC<ExamCardProps> = React.memo(
  ({ exam, now, router }) => {
    const [isHovered, setIsHovered] = useState(false);

    const examTimes = useMemo(() => {
      const startTime = new Date(exam.ognoo);
      const endTime = new Date(startTime.getTime() + exam.exam_minute * 60000);
      return { startTime, endTime };
    }, [exam.ognoo, exam.exam_minute]);

    const { startTime, endTime } = examTimes;

    const examStatus = useMemo(() => {
      const isPurchased = exam.ispurchased === 1;
      const isPayable = exam.ispaydescr === "Төлбөртэй" && !isPurchased;
      const isUpcoming = now < startTime;
      const isFinished = now > endTime;
      const isActive = !isUpcoming && !isFinished && !isPayable;
      const isLocked = isUpcoming || isFinished || isPayable;
      return {
        isPurchased,
        isPayable,
        isUpcoming,
        isFinished,
        isActive,
        isLocked,
      };
    }, [exam.ispurchased, exam.ispaydescr, now, startTime, endTime]);

    const { isPurchased, isPayable, isUpcoming, isActive, isLocked } =
      examStatus;

    const countdownData = useMemo(() => {
      let statusText = "Дууссан";
      let statusBadgeClass = "bg-gray-500";
      let buttonText = "Шалгалт дууссан";
      let countdown = "Шалгалт дууссан";
      let countdownClasses =
        "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";

      if (isPayable) {
        statusText = "ТӨЛБӨР";
        statusBadgeClass = "bg-red-600 animate-pulse";
        buttonText = `Төлбөр төлөх (${exam.amount.toLocaleString()}₮)`;
        countdown = "Төлбөр төлөгдөөгүй!";
        countdownClasses =
          "text-red-600 bg-red-100 dark:bg-red-900/30 border-red-400/50";
      } else if (isUpcoming) {
        const diff = startTime.getTime() - now.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        countdown = `${minutes}м ${seconds}с`;
        statusText = "УДАХГҮЙ";
        statusBadgeClass = "bg-blue-500";
        buttonText = "Хүлээгдэж байна";
        countdownClasses =
          "text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-400/50";
      } else if (isActive) {
        const diff = endTime.getTime() - now.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        countdown = `${minutes}м ${seconds}с`;
        statusText = "LIVE";
        statusBadgeClass = "bg-green-600 animate-pulse";
        buttonText = "Шалгалт эхлүүлэх";
        countdownClasses =
          "text-green-600 bg-green-100 dark:bg-green-900/30 border-green-400/50";
      }

      return {
        statusText,
        statusBadgeClass,
        buttonText,
        countdown,
        countdownClasses,
      };
    }, [isPayable, isUpcoming, isActive, startTime, endTime, now, exam.amount]);

    const cardStyle = useMemo(
      () => getCardStyle(isActive, isPayable, isUpcoming),
      [isActive, isPayable, isUpcoming]
    );

    const handleAction = () => {
      if (isPayable) router.push(`/payment/${exam.exam_id}`);
      else if (isActive) router.push(`/exam/${exam.exam_id}`);
    };

    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 flex flex-col h-full ${cardStyle}`}
      >
        <div className="p-5 flex flex-col flex-grow">
          {/* Header & Status Badge */}
          <div className="flex justify-between items-start mb-3">
            <h2
              title={exam.title}
              className={`text-lg md:text-xl font-extrabold text-gray-900 dark:text-gray-50 leading-tight min-h-[2.5em] cursor-pointer transition-all duration-300 ${
                isHovered ? "line-clamp-none" : "line-clamp-2"
              }`}
            >
              {exam.title}
            </h2>
            <div
              className={`text-xs text-white font-bold px-3 py-1 rounded-full whitespace-nowrap uppercase ${countdownData.statusBadgeClass}`}
            >
              {countdownData.statusText}
            </div>
          </div>

          {/* Core Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-gray-700 dark:text-gray-300 mb-5">
            <DetailItem
              icon={<BookOpen size={16} className="text-indigo-500" />}
              label="Асуулт"
              value={exam.que_cnt}
            />
            <DetailItem
              icon={<Clock size={16} className="text-red-500" />}
              label="Хугацаа"
              value={`${exam.exam_minute} мин`}
            />
            <DetailItem
              icon={
                <Calendar
                  size={16}
                  className="text-gray-500 dark:text-gray-400"
                />
              }
              label="Эхлэх"
              value={startTime.toLocaleTimeString("mn-MN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            <DetailItem
              icon={
                <Hourglass
                  size={16}
                  className="text-gray-500 dark:text-gray-400"
                />
              }
              label="Дуусах"
              value={endTime.toLocaleTimeString("mn-MN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleAction}
            disabled={isLocked && !isPayable}
            className={`w-full text-base font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg ${
              isActive
                ? "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-blue-500/50"
                : isPayable
                ? "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 shadow-red-500/50"
                : "bg-gray-300 cursor-not-allowed text-gray-700 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {countdownData.buttonText}{" "}
            {(isActive || isPayable) && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    );
  }
);

ExamCard.displayName = "ExamCard";

export const DetailItem = React.memo(
  ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
  }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
        {icon} {label}
      </div>
      <span className="font-bold text-gray-900 dark:text-gray-50">{value}</span>
    </div>
  )
);

DetailItem.displayName = "DetailItem";

export default ExamCard;

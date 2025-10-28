"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Clock, Calendar, Hourglass } from "lucide-react";
import { ExamData } from "@/types/examlists";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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
    return "border-red-400/50 shadow-lg shadow-red-200/40 bg-gradient-to-b from-white to-red-50 dark:from-gray-950 dark:to-red-950/10";
  if (isActive)
    return "border-green-400/50 shadow-lg shadow-green-200/40 bg-gradient-to-b from-white to-green-50 dark:from-gray-950 dark:to-green-950/10";
  if (isUpcoming)
    return "border-blue-400/50 shadow-lg shadow-blue-200/40 bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-blue-950/10";
  if (isFinished)
    return "border-gray-400/50 shadow-md shadow-gray-200/20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950";
  return "border-gray-300 bg-white dark:bg-gray-900";
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
    const isPayable = exam.ispaydescr === "Төлбөртэй" && !isPurchased;
    const isUpcoming = now < startTime;
    const isFinished = now > endTime;
    const isActive = !isUpcoming && !isFinished && !isPayable;
    const isLocked = isUpcoming || isPayable;
    return {
      isPurchased,
      isPayable,
      isUpcoming,
      isFinished,
      isActive,
      isLocked,
    };
  }, [exam.ispurchased, exam.ispaydescr, now, startTime, endTime]);

  const { isPayable, isUpcoming, isActive, isFinished, isLocked } = examStatus;

  const countdownData = useMemo(() => {
    let statusText = "Дууссан";
    let statusBadgeClass = "bg-gray-500";
    let buttonText = "Үр дүн харах";
    let countdown = "Шалгалт дууссан";

    if (isPayable) {
      statusText = "ТӨЛБӨР";
      statusBadgeClass = "bg-red-500 animate-pulse";
      buttonText = `Төлбөр төлөх (${exam.amount.toLocaleString()}₮)`;
    } else if (isUpcoming) {
      const diff = startTime.getTime() - now.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      countdown = `${minutes}м ${seconds}с`;
      statusText = "УДАХГҮЙ";
      statusBadgeClass = "bg-blue-500";
      buttonText = "Хүлээгдэж байна";
    } else if (isActive) {
      const diff = endTime.getTime() - now.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      countdown = `${minutes}м ${seconds}с`;
      statusText = "LIVE";
      statusBadgeClass = "bg-green-600 animate-pulse";
      buttonText = "Шалгалт эхлүүлэх";
    }

    return { statusText, statusBadgeClass, buttonText, countdown };
  }, [
    isPayable,
    isUpcoming,
    isActive,
    isFinished,
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
    if (isPayable) router.push(`/payment/${exam.exam_id}`);
    else if (isActive) router.push(`/exam/${exam.exam_id}`);
    else if (isFinished) router.push(`/result/${exam.exam_id}`);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        poppins.className,
        "relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out flex flex-col h-full transform",
        cardStyle,
        (isActive || isPayable || isFinished) &&
          "cursor-pointer hover:-translate-y-1 hover:shadow-xl"
      )}
      onClick={isActive || isPayable || isFinished ? handleAction : undefined}
    >
      <div className="p-6 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h2
            title={exam.title}
            className={cn(
              "text-lg md:text-xl font-bold leading-snug tracking-tight min-h-[2.5em] transition-all duration-300",
              isFinished
                ? "text-gray-600 dark:text-gray-400"
                : "text-gray-900 dark:text-gray-50",
              isHovered ? "line-clamp-none" : "line-clamp-2"
            )}
          >
            {exam.title}
          </h2>
          <div
            className={cn(
              "text-xs font-semibold px-3 py-1 rounded-full text-white shadow-sm",
              countdownData.statusBadgeClass
            )}
          >
            {countdownData.statusText}
          </div>
        </div>

        {exam.teach_name && (
          <p
            className={cn(
              "text-sm mb-3 font-medium tracking-wide",
              isFinished
                ? "text-gray-500 dark:text-gray-500"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            👨‍🏫 {exam.teach_name}
          </p>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5 text-sm">
          <DetailItem icon={<BookOpen />} label="Асуулт" value={exam.que_cnt} />
          <DetailItem
            icon={<Clock />}
            label="Хугацаа"
            value={`${exam.exam_minute} мин`}
          />
          <DetailItem
            icon={<Calendar />}
            label="Эхлэх"
            value={startTime.toLocaleTimeString("mn-MN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <DetailItem
            icon={<Hourglass />}
            label="Дуусах"
            value={endTime.toLocaleTimeString("mn-MN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        </div>

        {/* Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAction();
          }}
          disabled={isLocked}
          className={cn(
            "w-full mt-auto text-base font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm",
            isActive
              ? "bg-green-600 hover:bg-green-700 text-white"
              : isPayable
              ? "bg-red-600 hover:bg-red-700 text-white"
              : isFinished
              ? "bg-gray-500 hover:bg-gray-600 text-white"
              : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
          )}
        >
          {countdownData.buttonText}
          {(isActive || isPayable || isFinished) && (
            <ArrowRight size={18} className="ml-1" />
          )}
        </button>
      </div>
    </div>
  );
});

ExamCard.displayName = "ExamCard";

const DetailItem = React.memo(
  ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
  }) => (
    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
      <div className="flex items-center gap-2">
        <span className="opacity-70">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  )
);

DetailItem.displayName = "DetailItem";

export default ExamCard;

"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamData } from "@/types/sorillists";

interface ExamCardProps {
  exam: ExamData;
}

export default function ExamCard({ exam }: ExamCardProps) {
  const router = useRouter();

  const formatMongolianDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "1-р сар", "2-р сар", "3-р сар", "4-р сар",
      "5-р сар", "6-р сар", "7-р сар", "8-р сар",
      "9-р сар", "10-р сар", "11-р сар", "12-р сар"
    ];
    
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${year} оны ${month} ${day}, ${hours}:${minutes}`;
  };

  const examDate = formatMongolianDate(exam.sorildate);

  const isStartable = exam.flag_name === "Эхлүүлэх";
  const isFinished = exam.flag_name === "Үр дүн";

  const getCardStyle = () => {
    if (isStartable)
      return "border-emerald-400/60 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-950/40 dark:via-gray-950 dark:to-emerald-950/20 dark:border-emerald-700/40";
    if (isFinished)
      return "border-gray-300/60 bg-gradient-to-br from-gray-50 via-white to-gray-100/50 dark:from-gray-900/40 dark:via-gray-950 dark:to-gray-900/20 dark:border-gray-700/40";
    return "border-blue-400/60 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-950/40 dark:via-gray-950 dark:to-blue-950/20 dark:border-blue-700/40";
  };

  const handleStart = () => {
    if (!isStartable) return;
    router.push(`/soril/${exam.exam_id}?count=${exam.que_cnt}`);
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-500 flex flex-col backdrop-blur-sm",
        getCardStyle(),
        (isStartable || isFinished) &&
          "cursor-pointer hover:scale-[1.03] hover:shadow-2xl",
        isStartable && "hover:shadow-emerald-500/20",
        isFinished && "hover:shadow-gray-500/10"
      )}
    >
      {/* Image Section */}
      <div className="relative w-full h-36 sm:h-40 lg:h-44">
        <Image
          src={exam.filename}
          alt={exam.soril_name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Status Badge */}
        {isFinished && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 rounded-full p-1.5">
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
        )}
      </div>

      {/* Content */}
      <CardHeader className="pb-2 px-5 pt-3">
        <h3
          className={cn(
            "text-lg font-bold leading-tight",
            isFinished
              ? "text-gray-600 dark:text-gray-400"
              : "text-gray-900 dark:text-gray-50"
          )}
        >
          {exam.soril_name}
        </h3>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex flex-col gap-3">
        <div className="grid gap-2 text-sm">
          <Stat icon={<Calendar size={16} />} label="Огноо" value={examDate} />
          <Stat
            icon={<BookOpen size={16} />}
            label="Нийт асуулт"
            value={`${exam.que_cnt} асуулт`}
          />
          <Stat
            icon={<Clock size={16} />}
            label="Хугацаа"
            value={`${exam.minut} минут`}
          />
        </div>

        <button
          onClick={handleStart}
          disabled={!isStartable}
          className={cn(
            "mt-4 w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all",
            isStartable
              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:scale-[1.02]"
              : "bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
          )}
        >
          <span>{exam.flag_name}</span>
          {isStartable && <ArrowRight size={18} />}
        </button>
      </CardContent>
    </Card>
  );
}

const Stat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
    {icon}
    <div className="flex justify-between w-full text-xs">
      <span>{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  </div>
);
"use client";

import { useEffect, useState, useMemo } from "react";

type TimerProps = {
  durationMinutes: number; // Шалгалтын хугацаа (минут)
  examName: string; // Шалгалтын нэр
  variant?: string; // Вариант
  startTime?: Date; // Эхэлсэн цаг
  onTimeUp?: () => void; // Цаг дуусах callback
};

export default function ITimer({
  durationMinutes,
  examName,
  variant,
  startTime,
  onTimeUp,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [clientStartTime, setClientStartTime] = useState<Date | null>(null);

  useEffect(() => {
    setClientStartTime(startTime || new Date());
  }, [startTime]);

  const endTime = useMemo(() => {
    if (!clientStartTime) return null;
    return new Date(clientStartTime.getTime() + durationMinutes * 60 * 1000);
  }, [clientStartTime, durationMinutes]);

  useEffect(() => {
    if (!isRunning || !clientStartTime) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, onTimeUp, clientStartTime]);

  const colorClass =
    timeLeft <= 60
      ? "text-red-400"
      : timeLeft <= 5 * 60
      ? "text-yellow-300"
      : "text-black dark:text-white";

  const isFinalPhase = timeLeft <= 10;
  const sizeClass = isFinalPhase
    ? "text-6xl font-extrabold"
    : "text-2xl font-bold";
  const animClass = isFinalPhase ? "animate-pulse" : "";

  const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");

  if (!clientStartTime) return null;

  return (
    <div className="border p-2 rounded w-65">
      <div className="p-4 w-64 flex flex-col gap-4">
        <div
          className={`flex justify-center ${sizeClass} ${colorClass} ${animClass}`}
        >
          {m}:{s}
        </div>
      </div>
    </div>
  );
}

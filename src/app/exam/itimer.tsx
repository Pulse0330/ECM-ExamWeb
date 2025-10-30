"use client";

import { useEffect, useState, useMemo } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { getServerDate } from "@/lib/api";

type TimerProps = {
  durationMinutes?: number;
  endTime?: string;
  examName: string;
  onTimeUp?: () => void;
};

export default function ITimer({
  durationMinutes,
  endTime: providedEndTime,
  examName,
  onTimeUp,
}: TimerProps) {
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // ========================================
  // 1. Серверээс цаг авах
  // ========================================
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const serverDateStr = await getServerDate();

        if (serverDateStr) {
          const currentServerTime = new Date(serverDateStr);
          setServerTime(currentServerTime);

          if (providedEndTime) {
            const endDate = new Date(providedEndTime);
            const diff = Math.floor(
              (endDate.getTime() - currentServerTime.getTime()) / 1000
            );
            setTimeLeft(Math.max(0, diff));

            console.log("⏰ Timer initialized with end_time:", {
              serverTime: currentServerTime.toISOString(),
              endTime: endDate.toISOString(),
              timeLeftSeconds: diff,
              timeLeftMinutes: Math.floor(diff / 60),
            });
          } else if (durationMinutes) {
            setTimeLeft(durationMinutes * 60);
            console.log(
              "⏰ Timer initialized with duration:",
              durationMinutes,
              "minutes"
            );
          }
        } else {
          console.warn("⚠️ No server date returned, using client time");
          setServerTime(new Date());
          if (durationMinutes) {
            setTimeLeft(durationMinutes * 60);
          }
        }
      } catch (error) {
        console.error("❌ Server date fetch failed:", error);
        setServerTime(new Date());
        if (durationMinutes) {
          setTimeLeft(durationMinutes * 60);
        }
      }
    };

    fetchServerTime();
  }, [durationMinutes, providedEndTime]);

  // ========================================
  // 2. End time тооцоолох (MOVED BEFORE EARLY RETURN)
  // ========================================
  const endTime = useMemo(() => {
    if (!serverTime) return null;

    if (providedEndTime) {
      return new Date(providedEndTime);
    }

    if (durationMinutes) {
      return new Date(serverTime.getTime() + durationMinutes * 60 * 1000);
    }

    return null;
  }, [serverTime, durationMinutes, providedEndTime]);

  // ========================================
  // 3. Status тодорхойлох (MOVED BEFORE EARLY RETURN)
  // ========================================
  const status = useMemo(() => {
    if (timeLeft <= 60)
      return { label: "Маш бага", color: "text-red-600", level: "critical" };
    if (timeLeft <= 5 * 60)
      return { label: "Анхаар", color: "text-orange-600", level: "warning" };
    return { label: "Хэвийн", color: "text-green-600", level: "normal" };
  }, [timeLeft]);

  // ========================================
  // 4. Форматласан цаг (MOVED BEFORE EARLY RETURN)
  // ========================================
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formattedTime =
    (durationMinutes && durationMinutes > 60) || hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`;

  // ========================================
  // 5. Таймер ажиллуулах
  // ========================================
  useEffect(() => {
    if (!isRunning || !serverTime) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          console.log("⏰ Time's up! Calling onTimeUp callback...");
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, onTimeUp, serverTime]);

  // ========================================
  // 6. Loading state (NOW AFTER ALL HOOKS)
  // ========================================
  if (!serverTime) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border animate-pulse bg-white dark:bg-gray-800">
        <Clock size={16} className="animate-spin text-blue-500" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Уншиж байна...
        </span>
      </div>
    );
  }

  // ========================================
  // 7. Render
  // ========================================
  return (
    <>
      {/* ===================== */}
      {/* Mobile Version        */}
      {/* ===================== */}
      <div className="md:hidden">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-all ${
            timeLeft <= 60
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              : timeLeft <= 5 * 60
              ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}
        >
          <Clock
            size={16}
            className={
              timeLeft <= 60
                ? "text-red-500 animate-pulse"
                : timeLeft <= 5 * 60
                ? "text-orange-500"
                : "text-gray-600 dark:text-gray-400"
            }
          />
          <div
            className={`font-semibold text-base tabular-nums ${
              timeLeft <= 60
                ? "text-red-600 dark:text-red-400"
                : timeLeft <= 5 * 60
                ? "text-orange-600 dark:text-orange-400"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {formattedTime}
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* Desktop Version       */}
      {/* ===================== */}
      <div className="hidden md:block rounded-xl border shadow-sm overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {/* Timer Display */}
        <div className="p-4 flex flex-col items-center gap-3">
          {/* Header */}
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Clock
              size={20}
              className={
                timeLeft <= 60
                  ? "animate-pulse text-red-500"
                  : timeLeft <= 5 * 60
                  ? "text-orange-500"
                  : ""
              }
            />
            <span className="text-sm font-medium opacity-80">
              Үлдсэн хугацаа
            </span>
          </div>

          {/* Time Display */}
          <div
            className={`text-5xl font-bold tabular-nums tracking-tight transition-colors ${
              timeLeft <= 60
                ? "text-red-600 dark:text-red-400 animate-pulse"
                : timeLeft <= 5 * 60
                ? "text-orange-600 dark:text-orange-400"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {formattedTime}
          </div>

          {/* Warning Badge */}
          {timeLeft <= 5 * 60 && (
            <div
              className={`flex items-center gap-1.5 text-xs font-medium border px-2.5 py-1 rounded-full transition-all ${
                timeLeft <= 60
                  ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 animate-pulse"
                  : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400"
              }`}
            >
              <AlertCircle size={14} />
              <span>{status.label}</span>
            </div>
          )}
        </div>

        {/* End Time Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900 text-center border-t dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Дуусах цаг:{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {endTime?.toLocaleTimeString("mn-MN", {
                hour: "2-digit",
                minute: "2-digit",
              }) || "—"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

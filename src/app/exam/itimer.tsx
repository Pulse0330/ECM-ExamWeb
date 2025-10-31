"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Clock, AlertCircle, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getServerDate } from "@/lib/api";
import { useServerDateStore } from "@/stores/serverDateStore";

type TimerProps = {
  endTime: string;
  examName?: string;
  onTimeUp?: () => void;
};

export default function ITimer({
  endTime: providedEndTime,
  examName,
  onTimeUp,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const { setServerDate, getAdjustedTime } = useServerDateStore();

  // ✅ Use ref to store the callback to avoid re-creating intervals
  const onTimeUpRef = useRef(onTimeUp);

  // ✅ Keep the ref updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // ✅ Track if time up callback was already called
  const timeUpCalledRef = useRef(false);

  const { data: serverDateString } = useQuery({
    queryKey: ["serverTime"],
    queryFn: getServerDate,
    refetchInterval: 30000,
    staleTime: 25000,
  });

  useEffect(() => {
    if (serverDateString) {
      setServerDate(serverDateString);
    }
  }, [serverDateString, setServerDate]);

  useEffect(() => {
    if (!serverDateString || isInitialized || !providedEndTime) return;

    const currentServerTime = getAdjustedTime();
    const endDate = new Date(providedEndTime);

    const diff = Math.floor(
      (endDate.getTime() - currentServerTime.getTime()) / 1000
    );
    setTimeLeft(Math.max(0, diff));

    console.log("⏰ Timer initialized:", {
      serverTime: currentServerTime.toISOString(),
      endTime: endDate.toISOString(),
      timeLeftSeconds: diff,
      timeLeftMinutes: Math.floor(diff / 60),
    });

    setIsInitialized(true);
  }, [serverDateString, providedEndTime, isInitialized, getAdjustedTime]);

  const endTime = useMemo(() => {
    if (!providedEndTime) return null;
    return new Date(providedEndTime);
  }, [providedEndTime]);

  const status = useMemo(() => {
    if (timeLeft <= 60)
      return { label: "Маш бага", color: "text-red-600", level: "critical" };
    if (timeLeft <= 5 * 60)
      return { label: "Анхаар", color: "text-orange-600", level: "warning" };
    return { label: "Хэвийн", color: "text-green-600", level: "normal" };
  }, [timeLeft]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`;

  // ✅ Timer countdown with proper cleanup
  useEffect(() => {
    if (!isInitialized) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // ✅ Only call onTimeUp once, deferred to avoid state update during render
          if (!timeUpCalledRef.current) {
            console.log("⏰ Time's up! Calling onTimeUp callback...");
            timeUpCalledRef.current = true;

            // ✅ Defer callback to next tick to avoid "setState during render" error
            setTimeout(() => {
              onTimeUpRef.current?.();
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [isInitialized]); // ✅ Remove onTimeUp from dependencies

  if (!isInitialized) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border animate-pulse bg-white dark:bg-gray-800">
        <Clock size={16} className="animate-spin text-blue-500" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Уншиж байна...
        </span>
      </div>
    );
  }

  const formatEndTime = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return {
      date: `${year}.${month}.${day}`,
      time: `${hours}:${minutes}`,
    };
  };

  const formattedEndTime = endTime ? formatEndTime(endTime) : null;

  return (
    <>
      {/* Mobile Version */}
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

      {/* Desktop Version */}
      <div className="hidden md:block rounded-xl border shadow-sm overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="p-4 flex flex-col items-center gap-3">
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

        {formattedEndTime && (
          <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/30 border-t dark:border-gray-700">
            <div className="flex items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Calendar size={12} />
                <span className="font-medium">{formattedEndTime.date}</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  {formattedEndTime.time}
                </span>
                <span className="text-gray-500 dark:text-gray-500 text-[10px]">
                  UTC
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

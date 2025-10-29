"use client";

import { useEffect, useState, useMemo } from "react";
import { Clock, AlertCircle } from "lucide-react";

type TimerProps = {
  durationMinutes: number;
  examName: string;
  variant?: string;
  startTime?: Date;
  onTimeUp?: () => void;
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

  // ⏱ Формат тохиргоо
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // 60 минутаас их бол цаг харуулна
  const formattedTime =
    durationMinutes > 60
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`;

  const status = useMemo(() => {
    if (timeLeft <= 60) return { label: "Маш бага" };
    if (timeLeft <= 5 * 60) return { label: "Анхаар" };
    return { label: "Хэвийн" };
  }, [timeLeft]);

  if (!clientStartTime) return null;

  return (
    <>
      {/* Mobile - Compact */}
      <div className="md:hidden">
        <div
          className="
            inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
            border
          "
        >
          <Clock size={16} className="flex-shrink-0" />
          <div className="font-semibold text-base tabular-nums">
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Desktop - Full Card */}
      <div className="hidden md:block rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock size={20} />
            <span className="text-sm font-medium opacity-80">
              Үлдсэн хугацаа
            </span>
          </div>

          <div className="text-5xl font-bold tabular-nums tracking-tight">
            {formattedTime}
          </div>

          {timeLeft <= 5 * 60 && (
            <div className="flex items-center gap-1.5 text-xs font-medium border px-2.5 py-1 rounded-full text-gray-700">
              <AlertCircle size={14} />
              <span>{status.label}</span>
            </div>
          )}
        </div>

        <div className="p-3 text-center">
          <div className="text-xs">
            Дуусах цаг:{" "}
            {endTime?.toLocaleTimeString("mn-MN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </>
  );
}

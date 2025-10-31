"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getServerDate } from "@/lib/api";
import { useServerDateStore } from "@/stores/serverDateStore";
import { Clock, Calendar } from "lucide-react";

export default function ServerDate() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { setServerDate, getAdjustedTime } = useServerDateStore();

  // Fetch server date every 30 seconds and store in Zustand
  const { data: serverDateString } = useQuery({
    queryKey: ["serverTime"],
    queryFn: getServerDate,
  });

  // Update Zustand store when server date arrives
  useEffect(() => {
    if (serverDateString) {
      setServerDate(serverDateString);
    }
  }, [serverDateString, setServerDate]);

  // Update current time every second using Zustand
  useEffect(() => {
    if (!serverDateString) return;

    const interval = setInterval(() => {
      setCurrentTime(getAdjustedTime());
    }, 1000);

    // Initial set
    setCurrentTime(getAdjustedTime());

    return () => clearInterval(interval);
  }, [serverDateString, getAdjustedTime]);

  if (!currentTime) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Clock className="w-4 h-4 animate-spin text-gray-400" />
        <span className="font-mono text-sm text-gray-400">--:--:--</span>
      </div>
    );
  }

  const year = currentTime.getUTCFullYear();
  const month = String(currentTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(currentTime.getUTCDate()).padStart(2, "0");
  const hours = String(currentTime.getUTCHours()).padStart(2, "0");
  const minutes = String(currentTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(currentTime.getUTCSeconds()).padStart(2, "0");

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 ">
      {/* Date Section */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 tabular-nums">
          {year}.{month}.{day}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gradient-to-b from-transparent via-blue-300 dark:via-blue-700 to-transparent"></div>

      {/* Time Section */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
        <div className="font-mono text-sm font-semibold text-blue-700 dark:text-blue-300 tabular-nums">
          <span className="inline-block transition-all duration-300">
            {hours}
          </span>
          <span className="animate-pulse mx-0.5">:</span>
          <span className="inline-block transition-all duration-300">
            {minutes}
          </span>
          <span className="animate-pulse mx-0.5">:</span>
          <span className="inline-block transition-all duration-300">
            {seconds}
          </span>
        </div>
      </div>
    </div>
  );
}

// Compact version - only time
export function ServerDateCompact() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { getAdjustedTime } = useServerDateStore();

  const { data: serverDateString } = useQuery({
    queryKey: ["serverTime"],
    queryFn: getServerDate,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!serverDateString) return;
    const interval = setInterval(() => {
      setCurrentTime(getAdjustedTime());
    }, 1000);
    setCurrentTime(getAdjustedTime());
    return () => clearInterval(interval);
  }, [serverDateString, getAdjustedTime]);

  if (!currentTime) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Clock className="w-4 h-4 animate-spin text-gray-400" />
        <span className="font-mono text-sm text-gray-400">--:--:--</span>
      </div>
    );
  }

  const hours = String(currentTime.getUTCHours()).padStart(2, "0");
  const minutes = String(currentTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(currentTime.getUTCSeconds()).padStart(2, "0");

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-300">
      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
      <div className="font-mono text-sm font-semibold text-blue-700 dark:text-blue-300 tabular-nums">
        <span>{hours}</span>
        <span className="animate-pulse mx-0.5">:</span>
        <span>{minutes}</span>
        <span className="animate-pulse mx-0.5">:</span>
        <span>{seconds}</span>
      </div>
    </div>
  );
}

// Date only version
export function ServerDateOnly() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { getAdjustedTime } = useServerDateStore();

  const { data: serverDateString } = useQuery({
    queryKey: ["serverTime"],
    queryFn: getServerDate,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!serverDateString) return;
    const interval = setInterval(() => {
      setCurrentTime(getAdjustedTime());
    }, 1000);
    setCurrentTime(getAdjustedTime());
    return () => clearInterval(interval);
  }, [serverDateString, getAdjustedTime]);

  if (!currentTime) return null;

  const year = currentTime.getUTCFullYear();
  const month = String(currentTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(currentTime.getUTCDate()).padStart(2, "0");

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm">
      <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 tabular-nums">
        {year}.{month}.{day}
      </span>
    </div>
  );
}

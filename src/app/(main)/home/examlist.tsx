"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { getHomeScreen } from "@/lib/api";
import {
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  Loader2,
  Calendar,
  BookOpen,
  User,
  ArrowRight,
} from "lucide-react";

const cn = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(" ");

type ExamCategory = "active" | "paid" | "expired" | "all";

export default function ExamCategoriesPage() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>("all");

  const {
    data: apiData,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["homeScreen", userId],
    queryFn: () => getHomeScreen(userId!),
    enabled: !!userId,
  });

  // Шалгалтуудыг ангилах
  const categorizedExams = useMemo(() => {
    if (!apiData?.RetDataThirt) {
      return { active: [], paid: [], expired: [] };
    }

    const activeExams = apiData.RetDataThirt;
    const now = new Date();

    return {
      active: activeExams.filter((exam) => {
        const startTime = new Date(exam.ognoo);
        const endTime = new Date(
          startTime.getTime() + exam.exam_minute * 60000
        );
        const isActive = now >= startTime && now <= endTime;
        const isPaid = exam.ispurchased === 1 || exam.amount === 0;
        return isActive && isPaid;
      }),
      paid: activeExams.filter(
        (exam) => exam.amount > 0 && exam.ispurchased === 0
      ),
      expired: activeExams.filter((exam) => {
        const startTime = new Date(exam.ognoo);
        const endTime = new Date(
          startTime.getTime() + exam.exam_minute * 60000
        );
        return now > endTime;
      }),
    };
  }, [apiData]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Өгөгдөл татаж байна...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !apiData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="font-bold text-xl mb-2 text-red-700 dark:text-red-400">
            😭 Алдаа гарлаа
          </p>
          <p className="text-red-600 dark:text-red-300">
            {(error as Error)?.message || "Өгөгдөл олдсонгүй"}
          </p>
        </div>
      </div>
    );
  }

  const activeExams = apiData.RetDataThirt || [];
  const displayExams =
    selectedCategory === "all"
      ? activeExams
      : categorizedExams[selectedCategory];

  const categories = [
    {
      id: "all" as ExamCategory,
      label: "Бүгд",
      icon: CheckCircle,
      count: activeExams.length,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      activeColor: "bg-gray-600 text-white",
    },
    {
      id: "active" as ExamCategory,
      label: "Идэвхтэй",
      icon: Zap,
      count: categorizedExams.active.length,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      activeColor: "bg-green-600 text-white",
    },
    {
      id: "paid" as ExamCategory,
      label: "Төлбөртэй",
      icon: DollarSign,
      count: categorizedExams.paid.length,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      activeColor: "bg-red-600 text-white",
    },
    {
      id: "expired" as ExamCategory,
      label: "Хугацаа дууссан",
      icon: Clock,
      count: categorizedExams.expired.length,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      activeColor: "bg-gray-600 text-white",
    },
  ];

  const now = new Date();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            Шалгалтын жагсаалт
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Таны боломжтой шалгалтуудыг ангилалаар харна уу
          </p>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "p-4 rounded-xl transition-all duration-300 border-2",
                  isActive
                    ? `${category.activeColor} border-transparent shadow-lg scale-105`
                    : `${category.bgColor} ${category.color} border-transparent hover:scale-102 hover:shadow-md`
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-6 h-6" />
                  <span className="text-2xl font-bold">{category.count}</span>
                </div>
                <p className="text-sm font-semibold">{category.label}</p>
              </button>
            );
          })}
        </div>

        {/* Exam List */}
        <div className="space-y-4">
          {displayExams.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                Шалгалт олдсонгүй
              </p>
            </div>
          ) : (
            displayExams.map((exam) => {
              const startTime = new Date(exam.ognoo);
              const endTime = new Date(
                startTime.getTime() + exam.exam_minute * 60000
              );
              const isActive = now >= startTime && now <= endTime;
              const isExpired = now > endTime;
              const isPaid = exam.amount > 0 && exam.ispurchased === 0;

              let statusColor = "bg-gray-500";
              let statusText = "Хүлээгдэж байна";

              if (isPaid) {
                statusColor = "bg-red-600 animate-pulse";
                statusText = "Төлбөр төлөх";
              } else if (isActive) {
                statusColor = "bg-green-600 animate-pulse";
                statusText = "Идэвхтэй";
              } else if (isExpired) {
                statusColor = "bg-gray-500";
                statusText = "Дууссан";
              }

              return (
                <div
                  key={exam.exam_id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
                          {exam.title}
                        </h3>
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap",
                            statusColor
                          )}
                        >
                          {statusText}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4 text-indigo-500" />
                          <span>{exam.teach_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          <span>{exam.que_cnt} асуулт</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4 text-red-500" />
                          <span>{exam.exam_minute} мин</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{exam.ognoo}</span>
                        </div>
                      </div>
                      {exam.help && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                          {exam.help}
                        </p>
                      )}
                    </div>

                    {/* Right: Action */}
                    <div className="flex flex-col items-end gap-2">
                      {isPaid && (
                        <div className="text-right mb-2">
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {exam.amount.toLocaleString()}₮
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {exam.ispaydescr}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (isPaid) {
                            router.push(`/payment/${exam.exam_id}`);
                          } else if (isActive) {
                            router.push(`/exam/${exam.exam_id}`);
                          }
                        }}
                        disabled={!isActive && !isPaid}
                        className={cn(
                          "px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2",
                          isPaid
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                            : isActive
                            ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        )}
                      >
                        {exam.flag_name}{" "}
                        {(isActive || isPaid) && (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

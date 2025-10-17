// app/(main)/sorillist/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Filter, X, Calendar, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { getSorillists } from "@/lib/api";
import type { ApiSorillistsResponse, ExamData } from "@/types/sorillists";
import ExamCard from "./examcard";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ExamCategory = "all" | "upcoming" | "past";

export default function ExamListPage() {
  const userId = useAuthStore((s) => s.userId);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<ExamCategory>("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const mutation = useMutation<ApiSorillistsResponse, Error, { id: number }>({
    mutationFn: ({ id }) => getSorillists(id),
  });

  useEffect(() => {
    if (userId) mutation.mutate({ id: userId });
  }, [userId]);

  const data: ExamData[] = mutation.data?.RetData || [];
  const now = new Date();

  const categorized = useMemo(() => {
    return {
      upcoming: data.filter((e) => new Date(e.sorildate) > now),
      past: data.filter((e) => new Date(e.sorildate) <= now),
    };
  }, [data, now]);

  const filtered = useMemo(() => {
    let list = data;
    if (category !== "all") list = categorized[category];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return list.filter((e) => e.soril_name.toLowerCase().includes(q));
    }
    return list;
  }, [data, categorized, category, searchTerm]);

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-6 sm:py-8 lg:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-8 lg:mb-10">
          <div className="text-center space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Шалгалтын жагсаалт
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Сорилуудыг жагсааж, эхлүүлэх товчийг дарна уу
            </p>
          </div>
        </header>

        {/* Controls Container */}
        <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-5">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div
              className={cn(
                "relative rounded-2xl transition-all duration-300",
                isSearchFocused
                  ? "shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10"
                  : "shadow-md"
              )}
            >
              <Search
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
                  isSearchFocused
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                )}
                size={20}
              />
              <input
                className={cn(
                  "w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl border-2 transition-all duration-300",
                  "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "focus:outline-none text-sm sm:text-base",
                  isSearchFocused
                    ? "border-blue-500 dark:border-blue-600"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                )}
                placeholder="Шалгалтын нэрээр хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
                  aria-label="Clear search"
                >
                  <X
                    size={18}
                    className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                  />
                </button>
              )}
            </div>

            {/* Search Results Count */}
            {searchTerm && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {filtered.length}
                  </span>{" "}
                  шалгалт олдлоо
                </p>
              </div>
            )}
          </div>

          {/* Filter Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Filter size={18} />
              <span className="text-sm font-medium">Шүүлт:</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <CategoryBadge
                active={category === "all"}
                onClick={() => setCategory("all")}
                count={data.length}
                label="Бүгд"
                variant="all"
              />
              <CategoryBadge
                active={category === "upcoming"}
                onClick={() => setCategory("upcoming")}
                count={categorized.upcoming.length}
                label="Идэвхтэй байгаа "
                variant="upcoming"
                icon={<Calendar size={14} />}
              />
              <CategoryBadge
                active={category === "past"}
                onClick={() => setCategory("past")}
                count={categorized.past.length}
                label="Дууссан"
                variant="past"
                icon={<CheckCircle2 size={14} />}
              />
            </div>
          </div>
        </div>

        <Separator className="my-6 sm:my-8 dark:bg-gray-800" />

        {/* Exam Grid */}
        <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mutation.isPending ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800",
                  "bg-white dark:bg-gray-900 shadow-md animate-pulse"
                )}
              >
                <Skeleton className="w-full h-36 sm:h-40 lg:h-44 bg-gray-200 dark:bg-gray-800" />
                <div className="p-4 sm:p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-11 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((exam) => <ExamCard key={exam.exam_id} exam={exam} />)
          ) : (
            <Card className="col-span-full p-8 sm:p-12 text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Search
                    size={32}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {searchTerm ? "Хайлт олдсонгүй" : "Шалгалт олдсонгүй"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? "Та өөр түлхүүр үгээр хайж үзнэ үү"
                      : "Одоогоор шалгалт бүртгэгдээгүй байна"}
                  </p>
                </div>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors duration-200"
                  >
                    <X size={16} />
                    Хайлт цэвэрлэх
                  </button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Category Badge Component
interface CategoryBadgeProps {
  active: boolean;
  onClick: () => void;
  count: number;
  label: string;
  variant: "all" | "upcoming" | "past";
  icon?: React.ReactNode;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  active,
  onClick,
  count,
  label,
  variant,
  icon,
}) => {
  const getVariantStyles = () => {
    if (!active) {
      return "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800";
    }

    switch (variant) {
      case "all":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-2 border-blue-500 shadow-lg shadow-blue-500/30";
      case "upcoming":
        return "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/30";
      case "past":
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-2 border-gray-500 shadow-lg shadow-gray-500/30";
      default:
        return "";
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 cursor-pointer",
        getVariantStyles(),
        active && "scale-105"
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      <span
        className={cn(
          "ml-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold",
          active
            ? "bg-white/30 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        )}
      >
        {count}
      </span>
    </button>
  );
};

"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  X,
  Zap,
  DollarSign,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { getExamlists } from "@/lib/api";
import { ApiExamlistsResponse, ExamData } from "@/types/examlists";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ExamCard from "./examcard";
import { cn } from "@/lib/utils";

type ExamCategory = "all" | "active" | "free" | "paid" | "expired";

export default function ExamListPage() {
  const userId = useAuthStore((s) => s.userId);
  const router = useRouter();
  const now = new Date();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { data: queryData, isPending } = useQuery<ApiExamlistsResponse>({
    queryKey: ["examlists", userId],
    queryFn: () => getExamlists(userId!),
    enabled: !!userId,
  });

  const data: ExamData[] = queryData?.RetData || [];

  // Category-д ангилах
  const categorizedData = useMemo(() => {
    return {
      active: data.filter((exam: ExamData) => {
        const startTime = new Date(exam.ognoo);
        const endTime = new Date(
          startTime.getTime() + exam.exam_minute * 60000
        );
        const isPurchased = exam.ispurchased === 1;
        const isFree = exam.ispaydescr === "Төлбөргүй";
        return now >= startTime && now <= endTime && (isFree || isPurchased);
      }),
      free: data.filter((exam: ExamData) => exam.ispaydescr === "Төлбөргүй"),
      paid: data.filter(
        (exam: ExamData) =>
          exam.ispaydescr === "Төлбөртэй" && exam.ispurchased === 0
      ),
      expired: data.filter((exam: ExamData) => {
        const startTime = new Date(exam.ognoo);
        const endTime = new Date(
          startTime.getTime() + exam.exam_minute * 60000
        );
        return now > endTime;
      }),
    };
  }, [data, now]);

  // Search + Category filter
  const filteredData = useMemo(() => {
    let exams: ExamData[] = [];
    if (selectedCategory === "all") exams = data;
    else exams = categorizedData[selectedCategory];

    if (!searchTerm.trim()) return exams;

    return exams.filter((exam: ExamData) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, categorizedData, searchTerm, selectedCategory]);

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="min-h-screen bg-gradient-to-br py-6 sm:py-8 lg:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-8 lg:mb-10">
          <div className="text-center space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Шалгалтын жагсаалт
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Та өөрийн шалгалтуудыг энд харж, эхлүүлэх боломжтой
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
                type="text"
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
                    {filteredData.length}
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
                active={selectedCategory === "all"}
                onClick={() => setSelectedCategory("all")}
                count={data.length}
                label="Бүгд"
                variant="all"
              />
              <CategoryBadge
                active={selectedCategory === "active"}
                onClick={() => setSelectedCategory("active")}
                count={categorizedData.active.length}
                label="Идэвхтэй"
                variant="active"
                icon={<Zap size={14} />}
              />
              <CategoryBadge
                active={selectedCategory === "free"}
                onClick={() => setSelectedCategory("free")}
                count={categorizedData.free.length}
                label="Төлбөргүй"
                variant="free"
                icon={<Sparkles size={14} />}
              />
              <CategoryBadge
                active={selectedCategory === "paid"}
                onClick={() => setSelectedCategory("paid")}
                count={categorizedData.paid.length}
                label="Төлбөртэй"
                variant="paid"
                icon={<DollarSign size={14} />}
              />
              <CategoryBadge
                active={selectedCategory === "expired"}
                onClick={() => setSelectedCategory("expired")}
                count={categorizedData.expired.length}
                label="Дууссан"
                variant="expired"
                icon={<CheckCircle2 size={14} />}
              />
            </div>
          </div>
        </div>

        <Separator className="my-6 sm:my-8 dark:bg-gray-800" />

        {/* Exam Grid */}
        <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isPending ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-800",
                  "bg-white dark:bg-gray-900 shadow-md animate-pulse"
                )}
              >
                <div className="p-4 sm:p-5 lg:p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
                  </div>
                  <Skeleton className="h-16 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
                  <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
                </div>
              </div>
            ))
          ) : filteredData.length === 0 ? (
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
          ) : (
            filteredData.map((exam: ExamData) => (
              <ExamCard key={exam.exam_id} exam={exam} now={now} />
            ))
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
  variant: "all" | "active" | "free" | "paid" | "expired";
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
      case "active":
        return "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/30";
      case "free":
        return "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-2 border-cyan-500 shadow-lg shadow-cyan-500/30";
      case "paid":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white border-2 border-red-500 shadow-lg shadow-red-500/30";
      case "expired":
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

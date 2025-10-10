"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  TrendingUp,
  ArrowRight,
  Trophy,
  Zap,
  Lightbulb,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";

const cn = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metricVisibility, setMetricVisibility] = useState({
    showCompletionRateValue: true,
    showLatestScoreValue: true,
    showTotalExamsValue: true,
  });

  const backgroundClass = "bg-slate-50 dark:bg-gray-950";

  const handleToggle = useCallback((metric: keyof typeof metricVisibility) => {
    setMetricVisibility((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  }, []);

  const getAnimationStyles = (delay: number) => ({
    opacity: 0,
    animation: isLoading ? "none" : `fadeIn 0.5s ease-out ${delay}ms forwards`,
  });

  const DashboardCard = ({
    children,
    className,
    delay = 0,
  }: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
  }) => (
    <div
      className={cn(
        "p-6 rounded-2xl transition-all duration-500 shadow-xl cursor-pointer",
        "hover:shadow-2xl hover:translate-y-[-4px]",
        "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 border border-gray-100 dark:border-gray-800 hover:shadow-indigo-300/50 dark:hover:shadow-indigo-700/50",
        className
      )}
      style={getAnimationStyles(delay)}
    >
      {children}
    </div>
  );

  const MagicHeroCard = ({
    children,
    className,
    delay = 0,
  }: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
  }) => {
    const lightModeClasses = cn(
      "bg-white border border-gray-100",
      "shadow-xl shadow-indigo-100/60",
      "text-gray-900",
      "hover:border-indigo-300 hover:shadow-indigo-200/80"
    );

    const darkModeClasses = cn(
      "dark:bg-gray-900 dark:border-gray-800 dark:text-white",
      "dark:shadow-2xl dark:shadow-indigo-900/50",
      "dark:hover:shadow-indigo-700/50"
    );

    return (
      <div
        className={cn(
          "relative p-8 rounded-3xl overflow-hidden cursor-pointer",
          "transition-all duration-300 hover:scale-[1.01]",
          lightModeClasses,
          darkModeClasses,
          className
        )}
        style={getAnimationStyles(delay)}
      >
        <div className="absolute inset-0 z-0 opacity-40 blur-xl pointer-events-none">
          <div
            className={cn(
              "absolute w-2/3 h-2/3 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-[magic-move_10s_linear_infinite] bg-gradient-to-r",
              "from-blue-200/50 to-indigo-200/50",
              "dark:from-indigo-500/70 dark:to-fuchsia-500/70"
            )}
            style={{ left: "50%", top: "50%" }}
          />
        </div>

        <div className="relative z-10">{children}</div>
      </div>
    );
  };

  const renderMetricValue = (
    value: string | number,
    colorClass: string,
    isVisible: boolean,
    suffix: string = ""
  ) => {
    if (isVisible) {
      return (
        <p className={cn("text-6xl font-extrabold mt-2", colorClass)}>
          {value}
          {suffix}
        </p>
      );
    }
    return (
      <span
        className={cn(
          "inline-block text-6xl font-extrabold mt-2 px-2 py-1 select-none blur-sm transition-all duration-300",
          colorClass,
          "text-gray-300 dark:text-gray-700"
        )}
      >
        ***
      </span>
    );
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          backgroundClass,
          "font-inter min-h-screen transition-colors duration-500"
        )}
      >
        <main className="flex justify-center items-center py-16 min-h-screen">
          <div className="flex justify-center items-center h-96 p-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Өгөгдөл татаж байна...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={cn(
        backgroundClass,
        "font-inter min-h-screen transition-colors duration-500"
      )}
    >
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes magic-move {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) scale(1.1);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) scale(0.8);
            opacity: 0.3;
          }
        }
      `}</style>

      <main className="py-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-10 dashboard-content">
          <header
            className="flex justify-between items-center pb-4"
            style={getAnimationStyles(0)}
          >
            <div>
              <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
                Сайн байна уу,
              </p>
              <h1 className="text-5xl font-extrabold tracking-tight flex items-center mt-1 text-gray-900 dark:text-white">
                Болд
              </h1>
            </div>
          </header>

          <MagicHeroCard delay={100}>
            <div
              className={cn(
                "flex justify-between items-start mb-6 pb-3 border-b",
                "border-indigo-300/70 dark:border-indigo-400/50"
              )}
            >
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-8 h-8 flex-shrink-0 text-yellow-600 dark:text-yellow-300" />
                <p className="text-xl font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-200">
                  Танд ойр шалгалт
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-600 dark:text-indigo-300 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  2024-12-20
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end">
              <div className="space-y-1 mb-4 sm:mb-0">
                <h3
                  className={cn(
                    "text-6xl font-extrabold text-transparent bg-clip-text transition-all hover:text-white/90 dark:hover:text-white/90",
                    "bg-gradient-to-r from-blue-700 to-purple-700",
                    "dark:from-white dark:to-indigo-300"
                  )}
                >
                  Математик
                </h3>
                <p className="text-lg mt-1 pt-1 italic text-gray-700 dark:text-indigo-200">
                  Шалтгаан: Улирлын шалгалт
                </p>
                <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400">
                  Багш: Б.Дорж
                </p>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <button
                  className={cn(
                    "flex items-center px-7 py-3 rounded-full font-extrabold shadow-2xl transition-colors transform hover:scale-[1.05] relative overflow-hidden group",
                    "bg-white text-indigo-700 hover:bg-indigo-100",
                    "dark:bg-indigo-700 dark:text-white dark:hover:bg-indigo-800"
                  )}
                >
                  <span className="text-xl tracking-wide">Эхлэх</span>
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </MagicHeroCard>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <DashboardCard delay={300}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                    Дундаж Гүйцэтгэл
                  </p>
                  <button
                    onClick={() => handleToggle("showCompletionRateValue")}
                    className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1 rounded-full -m-1"
                    title={
                      metricVisibility.showCompletionRateValue
                        ? "Тоог нуух"
                        : "Тоог харуулах"
                    }
                  >
                    {metricVisibility.showCompletionRateValue ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              {renderMetricValue(
                87,
                "text-green-500",
                metricVisibility.showCompletionRateValue,
                "%"
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                Нийт шалгалтын дундаж
              </p>
            </DashboardCard>

            <DashboardCard delay={400}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                    Сүүлийн Оноо
                  </p>
                  <button
                    onClick={() => handleToggle("showLatestScoreValue")}
                    className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1 rounded-full -m-1"
                    title={
                      metricVisibility.showLatestScoreValue
                        ? "Тоог нуух"
                        : "Тоог харуулах"
                    }
                  >
                    {metricVisibility.showLatestScoreValue ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              {renderMetricValue(
                92,
                "text-yellow-500",
                metricVisibility.showLatestScoreValue
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                2024-12-15-ийн үр дүн
              </p>
            </DashboardCard>

            <DashboardCard delay={500}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                    Нийт Шалгалт
                  </p>
                  <button
                    onClick={() => handleToggle("showTotalExamsValue")}
                    className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1 rounded-full -m-1"
                    title={
                      metricVisibility.showTotalExamsValue
                        ? "Тоог нуух"
                        : "Тоог харуулах"
                    }
                  >
                    {metricVisibility.showTotalExamsValue ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              {renderMetricValue(
                24,
                "text-purple-500",
                metricVisibility.showTotalExamsValue
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                Танд боломжтой байгаа тоо
              </p>
            </DashboardCard>
          </div>

          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Шалгалт
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">
                Одоогоор шалгалт байхгүй байна
              </p>
            </div>
          </div>

          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Сорил
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">
                Одоогоор сорил байхгүй байна
              </p>
            </div>
          </div>

          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Тест
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">
                Одоогоор тест байхгүй байна
              </p>
            </div>
          </div>

          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Миний шалгалтын багцууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <DashboardCard className="relative">
                <div className="absolute top-0 right-0 p-1 px-3 bg-green-500 text-white font-bold text-xs rounded-bl-lg rounded-tr-xl shadow-lg">
                  Төлөгдсөн!
                </div>

                <div className="flex justify-between items-start mb-2 relative z-10">
                  <h3 className="text-2xl font-extrabold">Математик Pro</h3>
                  <div className="flex items-center text-sm font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 shadow-md border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                    4.8<span className="ml-1">⭐</span>
                  </div>
                </div>

                <p className="text-5xl font-extrabold text-indigo-500 mt-2 relative z-10 flex items-end">
                  45,000
                  <span className="text-2xl font-semibold ml-1">₮</span>
                </p>

                <p className="text-sm mt-1 flex items-center relative z-10 text-gray-500 dark:text-gray-400">
                  <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                  Багц идэвхтэй
                </p>

                <button
                  className={cn(
                    "mt-5 w-full py-3 text-white rounded-xl transition-colors text-lg font-bold transform hover:scale-[1.01] relative z-10",
                    "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/50"
                  )}
                >
                  Эхлүүлэх
                </button>
              </DashboardCard>

              <DashboardCard className="relative">
                <div className="absolute top-0 right-0 p-1 px-3 bg-green-500 text-white font-bold text-xs rounded-bl-lg rounded-tr-xl shadow-lg">
                  Төлөгдсөн!
                </div>

                <div className="flex justify-between items-start mb-2 relative z-10">
                  <h3 className="text-2xl font-extrabold">Физик Мастер</h3>
                  <div className="flex items-center text-sm font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 shadow-md border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                    4.6<span className="ml-1">⭐</span>
                  </div>
                </div>

                <p className="text-5xl font-extrabold text-indigo-500 mt-2 relative z-10 flex items-end">
                  38,000
                  <span className="text-2xl font-semibold ml-1">₮</span>
                </p>

                <p className="text-sm mt-1 flex items-center relative z-10 text-gray-500 dark:text-gray-400">
                  <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                  Багц идэвхтэй
                </p>

                <button
                  className={cn(
                    "mt-5 w-full py-3 text-white rounded-xl transition-colors text-lg font-bold transform hover:scale-[1.01] relative z-10",
                    "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/50"
                  )}
                >
                  Эхлүүлэх
                </button>
              </DashboardCard>
            </div>
          </div>

          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Боломжит Шалгалтын Багцууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <DashboardCard>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <h3 className="text-2xl font-extrabold">Хими Багц</h3>
                  <div className="flex items-center text-sm font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 shadow-md border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                    4.7<span className="ml-1">⭐</span>
                  </div>
                </div>

                <p className="text-5xl font-extrabold text-indigo-500 mt-2 relative z-10 flex items-end">
                  42,000
                  <span className="text-2xl font-semibold ml-1">₮</span>
                </p>

                <button
                  className={cn(
                    "mt-5 w-full py-3 text-white rounded-xl transition-colors text-lg font-bold transform hover:scale-[1.01] relative z-10",
                    "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/50"
                  )}
                >
                  Дэлгэрэнгүй
                </button>
              </DashboardCard>

              <DashboardCard>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <h3 className="text-2xl font-extrabold">Биологи Элит</h3>
                  <div className="flex items-center text-sm font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 shadow-md border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                    4.5<span className="ml-1">⭐</span>
                  </div>
                </div>

                <p className="text-5xl font-extrabold text-indigo-500 mt-2 relative z-10 flex items-end">
                  35,000
                  <span className="text-2xl font-semibold ml-1">₮</span>
                </p>

                <button
                  className={cn(
                    "mt-5 w-full py-3 text-white rounded-xl transition-colors text-lg font-bold transform hover:scale-[1.01] relative z-10",
                    "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/50"
                  )}
                >
                  Дэлгэрэнгүй
                </button>
              </DashboardCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

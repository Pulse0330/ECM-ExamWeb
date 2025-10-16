"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getHomeScreen } from "@/lib/api";
import {
  Loader2,
  TrendingUp,
  ArrowRight,
  Trophy,
  Zap,
  Lightbulb,
  Speaker,
  Calendar,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";

const cn = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export default function Home() {
  const userId = useAuthStore((s) => s.userId);
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
    animation: isPending ? "none" : `fadeIn 0.5s ease-out ${delay}ms forwards`,
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

  // Loading state
  if (isPending) {
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

  // Error state
  if (isError || !apiData) {
    return (
      <div
        className={cn(
          backgroundClass,
          "font-inter min-h-screen transition-colors duration-500"
        )}
      >
        <main className="flex justify-center items-center py-16 min-h-screen">
          <div className="max-w-4xl w-full text-center p-8 bg-red-600/10 border border-red-400 text-red-700 dark:bg-red-800/20 dark:border-red-600 dark:text-red-400 rounded-xl shadow-md">
            <p className="font-bold text-xl mb-2">😭 Ачааллын алдаа</p>
            <p>{(error as Error)?.message || "Өгөгдөл олдсонгүй."}</p>
          </div>
        </main>
      </div>
    );
  }

  const announcements = apiData.RetDataFirst || [];
  const examPackages = apiData.RetDataSecond || [];
  const activeExams = apiData.RetDataThirt || [];
  const pastExams = apiData.RetDataFourth || [];

  const suggestedExam = activeExams.length > 0 ? activeExams[0] : null;

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

      <main>
        <div className="container mx-auto p-4 sm:p-8 space-y-10 dashboard-content">
          <header
            className="flex justify-between items-center pb-4"
            style={getAnimationStyles(0)}
          >
            <div>
              <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
                Сайн байна уу,
              </p>
              <h1 className="text-5xl font-extrabold tracking-tight flex items-center mt-1 text-gray-900 dark:text-white">
                Оюутан!
              </h1>
            </div>
          </header>

          {suggestedExam && (
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
                    <Calendar className="w-4 h-4 mr-1" /> {suggestedExam.ognoo}
                  </p>
                  <div
                    className={cn(
                      "mt-1 px-3 py-1 rounded-full text-xs font-bold inline-block animate-pulse",
                      "bg-indigo-600 text-white shadow-xl"
                    )}
                  >
                    {suggestedExam.exam_minute} минут
                  </div>
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
                    {suggestedExam.title}
                  </h3>
                  <p className="text-lg mt-1 pt-1 italic text-gray-700 dark:text-indigo-200">
                    {suggestedExam.help || "Анхааралтай бөглөнө үү"}
                  </p>
                  <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400">
                    Багш: {suggestedExam.teach_name}
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
                    <span className="text-xl tracking-wide">Эхлэх </span>
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </MagicHeroCard>
          )}

          {/* Статистик */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <DashboardCard delay={300}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                    Идэвхтэй Шалгалт
                  </p>
                  <button
                    onClick={() => handleToggle("showCompletionRateValue")}
                    className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1 rounded-full -m-1"
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
                activeExams.length,
                "text-green-500",
                metricVisibility.showCompletionRateValue
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                Нийт идэвхтэй шалгалт
              </p>
            </DashboardCard>

            <DashboardCard delay={400}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                    Өмнөх Сорилууд
                  </p>
                  <button
                    onClick={() => handleToggle("showLatestScoreValue")}
                    className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1 rounded-full -m-1"
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
                pastExams.length,
                "text-yellow-500",
                metricVisibility.showLatestScoreValue
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                ЭЕШ-ийн сорилууд
              </p>
            </DashboardCard>

            <DashboardCard delay={500}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                    Нийт Багц
                  </p>
                  <button
                    onClick={() => handleToggle("showTotalExamsValue")}
                    className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1 rounded-full -m-1"
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
                examPackages.length,
                "text-purple-500",
                metricVisibility.showTotalExamsValue
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                Боломжтой багцууд
              </p>
            </DashboardCard>
          </div>
          {/* Идэвхтэй Шалгалтууд */}
          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Идэвхтэй Шалгалтууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeExams.map((exam) => (
                <DashboardCard key={exam.exam_id}>
                  <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Багш: {exam.teach_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Асуулт: {exam.que_cnt} | {exam.exam_minute} минут
                  </p>
                  <p className="text-2xl font-bold text-indigo-500 mb-4">
                    {exam.amount.toLocaleString()}₮
                  </p>
                  <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    {exam.flag_name}
                  </button>
                </DashboardCard>
              ))}
            </div>
          </div>

          {/* Өмнөх Жилийн Сорилууд */}
          <div className="py-4" style={getAnimationStyles(700)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              ЭЕШ-ийн Сорилууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pastExams.map((exam) => (
                <DashboardCard key={exam.exam_id}>
                  <img
                    src={exam.filename}
                    alt={exam.soril_name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-bold mb-2">{exam.soril_name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Асуулт: {exam.que_cnt}
                  </p>
                  <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Эхлүүлэх
                  </button>
                </DashboardCard>
              ))}
            </div>
          </div>

          {/* Миний шалгалтын багцууд */}
          <div className="py-4" style={getAnimationStyles(800)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Миний шалгалтын багцууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {examPackages
                .filter((plan) => plan.ispurchased === 1)
                .map((plan) => (
                  <div
                    key={plan.planid}
                    className={cn(
                      "relative p-6 rounded-2xl shadow-xl border transition-all duration-300 cursor-pointer group overflow-hidden",
                      "hover:shadow-indigo-500/30 dark:hover:shadow-indigo-700/50 hover:scale-[1.03]",
                      "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50",
                      "border-4 border-green-500 shadow-green-400/50 dark:shadow-green-700/50"
                    )}
                  >
                    <div className="absolute top-0 right-0 p-1 px-3 bg-green-500 text-white font-bold text-xs rounded-bl-lg rounded-tr-xl shadow-lg">
                      Төлөгдсөн!
                    </div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <h3 className="text-2xl font-extrabold">{plan.title}</h3>
                      <div className="flex items-center text-sm font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 shadow-md border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                        {plan.rate} <span className="ml-1">⭐</span>
                      </div>
                    </div>
                    <p className="text-5xl font-extrabold text-indigo-500 mt-2 relative z-10 flex items-end">
                      {plan.amount.toLocaleString()}
                      <span className="text-2xl font-semibold ml-1">₮</span>
                    </p>
                    <button
                      className={cn(
                        "mt-5 w-full py-3 text-white rounded-xl transition-colors text-lg font-bold transform hover:scale-[1.01] relative z-10",
                        "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/50"
                      )}
                    >
                      Эхлүүлэх
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Боломжит шалгалтын багцууд */}
          <div className="py-4" style={getAnimationStyles(900)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Боломжит Шалгалтын Багцууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {examPackages
                .filter((plan) => plan.ispurchased !== 1)
                .map((plan) => (
                  <div
                    key={plan.planid}
                    className={cn(
                      "relative p-6 rounded-2xl shadow-xl border transition-all duration-300 cursor-pointer group overflow-hidden",
                      "hover:shadow-indigo-500/30 dark:hover:shadow-indigo-700/50 hover:scale-[1.03]",
                      "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50",
                      "border-gray-100 dark:border-gray-800 hover:border-indigo-400"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <h3 className="text-2xl font-extrabold">{plan.title}</h3>
                      <div className="flex items-center text-sm font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 shadow-md border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                        {plan.rate} <span className="ml-1">⭐</span>
                      </div>
                    </div>
                    <p className="text-5xl font-extrabold text-indigo-500 mt-2 relative z-10 flex items-end">
                      {plan.amount.toLocaleString()}
                      <span className="text-2xl font-semibold ml-1">₮</span>
                    </p>
                    <p className="text-sm mt-1 flex items-center relative z-10 text-gray-500 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 mr-1 text-green-500" />{" "}
                      {plan.paydescr}
                    </p>
                    <button
                      className={cn(
                        "mt-5 w-full py-3 text-white rounded-xl transition-colors text-lg font-bold transform hover:scale-[1.01] relative z-10",
                        "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/50"
                      )}
                    >
                      Дэлгэрэнгүй
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Зар мэдээ */}
          <div className="" style={getAnimationStyles(1000)}>
            <DashboardCard
              className="border-l-4 border-indigo-500 hover:translate-y-0 hover:shadow-xl"
              delay={100}
            >
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">
                <div className="flex items-center space-x-3">
                  <Speaker className="w-7 h-7 mr-2 text-indigo-500 flex-shrink-0" />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Үндсэн Зар Мэдээ
                  </h2>
                </div>
                <a
                  href="#"
                  className="text-sm text-indigo-500 hover:text-indigo-400 flex items-center font-bold"
                >
                  Бүгдийг харах <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex p-4 rounded-2xl transition-all cursor-pointer items-start group",
                      "bg-indigo-50/70 backdrop-blur-sm dark:bg-gray-800/80 border border-indigo-100 dark:border-gray-700",
                      "hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/50"
                    )}
                  >
                    <div className="w-24 h-24 flex-shrink-0 mr-4 overflow-hidden rounded-xl border-4 border-indigo-200 dark:border-indigo-700/50 shadow-md">
                      <img
                        src={announcement.filename}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between h-full">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {announcement.title}
                      </h3>
                      <p className="text-sm line-clamp-2 mt-1 text-gray-600 dark:text-gray-400">
                        {announcement.descr.split("#")[0].trim()}
                      </p>
                      <a
                        href={announcement.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center mt-2 font-bold"
                      >
                        Дэлгэрэнгүй харах{" "}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  );
}

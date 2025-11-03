"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getHomeScreen } from "@/lib/api";
import {
  TrendingUp,
  ArrowRight,
  Trophy,
  Zap,
  Lightbulb,
  Calendar,
  DollarSign,
  ExternalLink,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

const cn = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export default function Home() {
  const router = useRouter();
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
        "relative p-6 rounded-2xl transition-all duration-500 shadow-xl cursor-pointer overflow-hidden",
        "hover:shadow-2xl hover:translate-y-[-4px]",
        "bg-white dark:bg-gray-900",
        "border border-gray-100 dark:border-gray-800/50",
        "hover:border-gray-300 dark:hover:border-gray-700",
        "hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/50",
        className
      )}
      style={getAnimationStyles(delay)}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="relative z-10">{children}</div>
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
    return (
      <div
        className={cn(
          "relative p-8 rounded-3xl overflow-hidden cursor-pointer",
          "transition-all duration-300 hover:scale-[1.01]",
          "bg-white dark:bg-gray-900",
          "border border-indigo-100 dark:border-indigo-900/30",
          "shadow-xl shadow-indigo-100/60 dark:shadow-indigo-900/50",
          "hover:shadow-2xl hover:shadow-indigo-200/80 dark:hover:shadow-indigo-700/50",
          "hover:border-indigo-200 dark:hover:border-indigo-800/50",
          className
        )}
        style={getAnimationStyles(delay)}
      >
        <div className="absolute inset-0 z-0 opacity-30 blur-xl pointer-events-none">
          <div
            className={cn(
              "absolute w-2/3 h-2/3 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-[magic-move_10s_linear_infinite]",
              "bg-indigo-300/40 dark:bg-indigo-500/60"
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
        <p className={cn("text-4xl font-bold mt-2", colorClass)}>
          {value}
          {suffix}
        </p>
      );
    }
  };

  if (isError || !apiData) {
    return (
      <div className={cn("max-h-screen transition-colors duration-500")}></div>
    );
  }

  const announcements = apiData.RetDataFirst || [];
  const examPackages = apiData.RetDataSecond || [];
  const activeExams = apiData.RetDataThirt || [];
  const pastExams = apiData.RetDataFourth || [];

  const suggestedExam = activeExams.length > 0 ? activeExams[0] : null;

  return (
    <div className={cn("min-h-screen transition-colors duration-500")}>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

        * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 dashboard-content">
          <header
            className="flex justify-between items-center"
            style={getAnimationStyles(0)}
          ></header>

          {suggestedExam && (
            <MagicHeroCard delay={100}>
              <div
                className={cn(
                  "flex justify-between items-start mb-6 pb-3 border-b",
                  "border-indigo-300 dark:border-indigo-700"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Lightbulb className="w-8 h-8 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-xl font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
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
                  <h3 className="text-3xl sm:text-4xl font-bold text-indigo-700 dark:text-indigo-300">
                    {suggestedExam.title}
                  </h3>
                  <p className="text-base mt-1 pt-1 italic text-gray-700 dark:text-gray-300">
                    {suggestedExam.help || "Анхааралтай бөглөнө үү"}
                  </p>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Багш: {suggestedExam.teach_name}
                  </p>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <Button
                    onClick={() =>
                      router.push(`/exam/${suggestedExam.exam_id}`)
                    }
                    className={cn(
                      "flex items-center px-6 py-2.5 rounded-full font-bold shadow-xl transition-all transform hover:scale-105",
                      "bg-indigo-600 text-white hover:bg-indigo-700",
                      "dark:bg-indigo-700 dark:hover:bg-indigo-800"
                    )}
                  >
                    <span className="text-base tracking-wide">Эхлэх</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </MagicHeroCard>
          )}

          {/* Статистик */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <DashboardCard delay={300}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                    Идэвхтэй Шалгалт
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              {renderMetricValue(
                activeExams.length,
                "text-green-600 dark:text-green-400",
                metricVisibility.showCompletionRateValue
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                Нийт идэвхтэй шалгалт
              </p>
            </DashboardCard>

            <DashboardCard delay={400}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                    Өмнөх Сорилууд
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                  <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              {renderMetricValue(
                pastExams.length,
                "text-yellow-600 dark:text-yellow-400",
                metricVisibility.showLatestScoreValue
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                ЭЕШ-ийн сорилууд
              </p>
            </DashboardCard>

            <DashboardCard delay={500}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                    Нийт Багц
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              {renderMetricValue(
                examPackages.length,
                "text-purple-600 dark:text-purple-400",
                metricVisibility.showTotalExamsValue
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                Боломжтой багцууд
              </p>
            </DashboardCard>
          </div>
          <div className="py-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {announcements.map((announcement) => (
                <div
                  key={announcement.title}
                  className="group flex flex-col bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800/50 hover:border-indigo-200 dark:hover:border-indigo-800/70 hover:shadow-xl hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/50 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Зураг */}
                  <div className="relative w-full h-64 md:h-72 lg:h-80 bg-indigo-50 dark:bg-indigo-900/30 overflow-hidden">
                    {announcement.filename ? (
                      <Image
                        src={announcement.filename}
                        alt={announcement.title || "Announcement image"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                        Зураг байхгүй
                      </div>
                    )}
                    <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Агуулга */}
                  <div className="flex-1 p-5 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {announcement.title}
                    </h3>
                    <p className="flex-grow text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                      {announcement.descr.trim()}
                    </p>
                    <a
                      href={announcement.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Дэлгэрэнгүй ${announcement.title}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-700 self-start"
                    >
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        Дэлгэрэнгүй
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Идэвхтэй Шалгалтууд */}
          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Идэвхтэй Шалгалтууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeExams.map((exam) => (
                <div
                  key={exam.exam_id}
                  className="group relative bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800/50 hover:border-indigo-200 dark:hover:border-indigo-800/50 shadow-md hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/30 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 pr-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {exam.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{exam.ognoo}</span>
                        </div>
                      </div>
                      {exam.amount > 0 && (
                        <div className="flex-shrink-0 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          {exam.amount.toLocaleString()}₮
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-3 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            Асуулт
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {exam.que_cnt}
                          </p>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            Хугацаа
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {exam.exam_minute}'
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      <span>
                        Багш:{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {exam.teach_name}
                        </span>
                      </span>
                    </div>

                    <Button
                      onClick={() => router.push(`/exam/${exam.exam_id}`)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      {exam.flag_name}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Өмнөх Жилийн Сорилууд */}
          <div className="py-4" style={getAnimationStyles(700)}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              ЭЕШ-ийн Сорилууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastExams.map((exam) => (
                <div
                  key={exam.exam_id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-green-100 dark:border-green-900/30 hover:border-green-200 dark:hover:border-green-800/50 shadow-lg hover:shadow-2xl hover:shadow-green-200/50 dark:hover:shadow-green-900/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative overflow-hidden bg-green-50 dark:bg-green-900/20 h-48 flex items-center justify-center">
                    <img
                      src={exam.filename}
                      alt={exam.soril_name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-green-300 dark:border-green-700">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {exam.que_cnt} асуулт
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {exam.soril_name}
                    </h3>
                    <Button className="w-full py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-500/40 hover:shadow-green-500/60 transition-all">
                      Эхлүүлэх
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Миний шалгалтын багцууд */}
          <div className="py-4" style={getAnimationStyles(800)}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
              Миний шалгалтын багцууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {examPackages
                .filter((plan) => plan.ispurchased === 1)
                .map((plan) => (
                  <div
                    key={plan.planid}
                    className="group relative bg-white dark:bg-gray-900 rounded-xl p-5 border border-green-200 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700/70 hover:shadow-xl hover:shadow-green-100/50 dark:hover:shadow-green-900/30 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-lg"></div>
                    <div className="absolute top-0 right-0 px-3 py-1.5 bg-green-600 dark:bg-green-700 text-white text-xs font-bold rounded-bl-lg shadow-md">
                      Идэвхтэй
                    </div>
                    <div className="pt-6 relative z-10">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pr-16 leading-snug">
                        {plan.title}
                      </h3>
                      <div className="flex items-center justify-between mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Үнэ
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {plan.amount.toLocaleString()}
                            </span>
                            <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                              ₮
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs ">Үнэлгээ</p>
                          <span className="text-sm font-bold text-black">
                            {plan.rate}
                          </span>
                        </div>
                      </div>
                      <Button className="w-full py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                        Эхлүүлэх
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Боломжит шалгалтын багцууд */}
          <div className="py-4" style={getAnimationStyles(900)}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Боломжит Шалгалтын Багцууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {examPackages
                .filter((plan) => plan.ispurchased !== 1)
                .map((plan) => (
                  <div
                    key={plan.planid}
                    className="group relative rounded-xl p-5 border  shadow-md hover:shadow-xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/30 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20  transition-transform duration-500"></div>

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1 pr-3 leading-tight group-hover:text-green-600 dark:group-hover:green-blue-400 transition-colors">
                          {plan.title}
                        </h3>
                        <div className="flex-shrink-0 px-2.5 py-1  border-1 border-green-400 rounded-lg shadow-md">
                          <span className="flex gap-1 text-xs font-bold ">
                            {plan.rate}
                            <Star className="size-4 text-amber-300 fill-amber-300" />
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {plan.amount.toLocaleString()}
                          </span>
                          <span className="text-sm text-green-600 dark:text-blue-400 font-semibold">
                            ₮
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          <span>{plan.paydescr}</span>
                        </div>
                      </div>

                      <Button className="w-full py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                        Дэлгэрэнгүй үзэх
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

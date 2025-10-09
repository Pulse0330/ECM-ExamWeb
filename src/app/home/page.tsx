// "use client";

// import { useQuery } from "@tanstack/react-query";
// import { getHomeScreen } from "@/lib/axios";
// import { useState, useEffect } from "react";

// export default function HomePage() {
//   const [userId, setUserId] = useState<number | null>(null);

//   useEffect(() => {
//     const id = localStorage.getItem("userId");
//     if (id) setUserId(Number(id));
//   }, []);

//   const { data: homeData, isPending, isError } = useQuery({
//     queryKey: ["homeScreen", userId],
//     queryFn: () => getHomeScreen(userId!),
   
//   });

//   return (
//     <div>
//       <h1>Тавтай морилно уу!</h1>
//       <pre>{JSON.stringify(homeData, null, 2)}</pre>
//     </div>
//   );
// }
"use client";

import React, { useState, useEffect, useCallback } from "react";
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

// ===============================================
// 1. ИНТЕРФЕЙСҮҮД (Interfaces)
// ===============================================

interface Advertisement {
  title: string;
  descr: string;
  filename: string;
  url: string;
}

interface ExamPlan {
  planid: number;
  title: string;
  amount: number;
  ispay: number;
  paydescr: string;
  rate: string;
  ispurchased: number; // 1: Purchased, 0: Not Purchased
}

interface ActiveExamRaw {
  exam_id: number;
  title: string;
  ognoo: string;
  exam_minute: number;
  amount: number;
  ispaydescr: string;
  teach_name: string;
}

interface SuggestedExam {
  exam_id: number;
  name: string;
  date: string;
  time: string;
  countdown: string;
  reason: string;
  teacher: string;
}

interface HomeScreenData {
  title: string;
  totalExams: number;
  userProfile: {
    username: string;
    lastLogin: string;
  };
  completionRate: number;
  lastActivityExam: string;
  latestScore: number;

  announcements: Advertisement[];
  examPackages: ExamPlan[];
  suggestedExam: SuggestedExam;
}

// ===============================================
// 2. RAW JSON ӨГӨГДӨЛ (Mock API Data)
// ===============================================
const RAW_API_DATA = {
  RetResponse: {
    ResponseMessage: "Амжилттай",
    StatusCode: "200",
    ResponseCode: "10",
    ResponseType: true,
  },
  RetDataFirst: [
    {
      title: "Төрийн албаны ерөнхий шалгалт: Бэлтгэл",
      descr:
        "Та #материал хайж байна уу?  👉👉 Манай шинэ багцад бүх хэрэгцээт хичээл багтсан.",
      filename: "https://ott.mn/Files/Reklam/Zar_1.jpg",
      url: "https://www.facebook.com/photo?fbid=1039773938185968&set=a.766319932198038",
    },
    {
      title: "Шинэчлэгдсэн ЭЕШ: Сургалтын хөтөлбөр",
      descr:
        "Сургалтын шинэчлэгдсэн мэдээлэл болон бүртгэлийн хугацааг эндээс хараарай!",
      filename: "https://ott.mn/Files/Reklam/Rectangle2.png",
      url: "https://www.facebook.com/www.ott.mn",
    },
    {
      title: "Амжилттай элссэн оюутнуудын зөвлөгөө",
      descr:
        "Өндөр оноо авч, мөрөөдлийн сургуульдаа элссэн хүүхдүүдийн нууцууд!",
      filename: "https://placehold.co/80x80/22c55e/ffffff?text=Success",
      url: "https://www.facebook.com/www.ott.mn",
    },
  ],
  RetDataSecond: [
    // ТӨЛБӨР ТӨЛӨГДСӨН БАГЦ (ispurchased: 1)
    {
      planid: 1024,
      title: "Англи хэл ЭЕШ (Төлөгдсөн)",
      expired: "1900-01-01T00:00:00.000Z",
      amount: 19900,
      ispay: 1,
      paydescr: "Төлбөртэй",
      rate: "4.9",
      filename: null,
      ispurchased: 1,
      catname: null,
      catid: null,
      bill_type: 8,
    },
    // ТӨЛБӨР ТӨЛӨГДӨӨГҮЙ БАГЦ (ispurchased: 0)
    {
      planid: 1027,
      title: " Нийгэм судлал ЭЕШ",
      expired: "1900-01-01T00:00:00.000Z",
      amount: 19900,
      ispay: 1,
      paydescr: "Төлбөртэй",
      rate: "4.8",
      filename: null,
      ispurchased: 0,
      catname: null,
      catid: null,
      bill_type: 8,
    },
    // ТӨЛБӨР ТӨЛӨГДӨӨГҮЙ БАГЦ (ispurchased: 0)
    {
      planid: 1028,
      title: "Математик ЭЕШ",
      expired: "1900-01-01T00:00:00.000Z",
      amount: 19900,
      ispay: 1,
      paydescr: "Төлбөртэй",
      rate: "4.8",
      filename: null,
      ispurchased: 0,
      catname: null,
      catid: null,
      bill_type: 8,
    },
  ],
  RetDataThirt: [
    {
      exam_id: 8579,
      title: "Их нүүдэл-ЭЕШ ",
      ognoo: "2025-10-06 15:50",
      exam_minute: 300,
      help: "Анхааралтай уншаад шалгалтаа гүйцэтгээрэй ",
      teach_name: "Д.Дамдин",
      exam_type: 2,
      flag_name: "Эхлүүлэх",
      flag: 1,
      que_cnt: 5,
      ispaydescr: "Төлбөргүй",
      amount: 0,
      ispay: 0,
      ispurchased: 0,
      ispurchaseddescr: "Төлөгдөөгүй",
      bill_type: 6,
    },
  ],
};

// Функц: Огноог задлах болон Countdown тооцоолох (Mock)
const parseExamData = (rawExam: ActiveExamRaw): SuggestedExam => {
  const [datePart, timePart] = rawExam.ognoo.split(" ");
  const isUpcoming = new Date(rawExam.ognoo) > new Date("2025-10-08");
  const countdown = isUpcoming ? "Ойрын хугацаанд" : "Өнөөдөр!";

  return {
    exam_id: rawExam.exam_id,
    name: rawExam.title.trim(),
    date: datePart.replace(/-/g, "/"),
    time: timePart,
    countdown: countdown,
    reason: `Багш ${rawExam.teach_name} танд санал болгож байна.`,
    teacher: rawExam.teach_name,
  };
};

// ТҮР ЗУУРЫН MOCK ФУНКЦ: fetchHomeScreenData
const fetchHomeScreenData = async (): Promise<HomeScreenData> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const firstActiveExam = RAW_API_DATA.RetDataThirt[0];
  const suggestedExamData = parseExamData(firstActiveExam);

  return {
    title: "ЭЕШ-ийн Хяналтын Самбар",
    totalExams: 124,
    userProfile: {
      username: "Ж. Гансүх",
      lastLogin: "2024/09/16 14:30",
    },
    completionRate: 75,
    lastActivityExam: "Математикийн ЭЕШ 2024",
    latestScore: 680,

    announcements: RAW_API_DATA.RetDataFirst as Advertisement[],
    examPackages: RAW_API_DATA.RetDataSecond.slice(0, 3) as ExamPlan[],
    suggestedExam: suggestedExamData,
  };
};

// ===============================================
// Нүүр хуудасны үндсэн компонент (Homepage)
// ===============================================

export default function Home() {
  const [data, setData] = useState<HomeScreenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const homeData = await fetchHomeScreenData();
        setData(homeData);
      } catch (err: unknown) {
        console.error("Error loading home screen data:", err);
        setError("Өгөгдөл татаж чадсангүй. Сервер эсвэл сүлжээний алдаа.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
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
          // Slightly reduce blur effect to be more readable as a placeholder
          "text-gray-300 dark:text-gray-700"
        )}
      >
        ***
      </span>
    );
  };

  if (isLoading) {
    // Loading state
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

  if (error || !data) {
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
            <p>{error || "Өгөгдөл олдсонгүй."}</p>
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
                {data.userProfile.username}!
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
                  <Calendar className="w-4 h-4 mr-1" />{" "}
                  {data.suggestedExam.date} | {data.suggestedExam.time}
                </p>
                <div
                  className={cn(
                    "mt-1 px-3 py-1 rounded-full text-xs font-bold inline-block animate-pulse",
                    data.suggestedExam.countdown === "Өнөөдөр!"
                      ? "bg-yellow-400 text-gray-900 shadow-xl"
                      : "bg-indigo-600 text-white shadow-xl"
                  )}
                >
                  {data.suggestedExam.countdown}
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
                  {data.suggestedExam.name}
                </h3>
                {/* Light: text-gray-700, Dark: text-indigo-200 */}
                <p className="text-lg mt-1 pt-1 italic text-gray-700 dark:text-indigo-200">
                  Шалтгаан: {data.suggestedExam.reason}
                </p>
                {/* Light: text-indigo-500, Dark: text-indigo-400 */}
                <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400">
                  Багш: {data.suggestedExam.teacher}
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
                data?.completionRate || 0,
                "text-green-500",
                metricVisibility.showCompletionRateValue,
                "%"
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                Нийт {data?.totalExams || 0} шалгалтын дундаж
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
                data?.latestScore || 0,
                "text-yellow-500",
                metricVisibility.showLatestScoreValue
              )}
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                {data?.lastActivityExam}-ийн үр дүн
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
                data?.totalExams || 0,
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8"></div>
          </div>
          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Сорил
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8"></div>
          </div>
          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Тест
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8"></div>
          </div>
          {/* ====== Миний шалгалтын багцууд (Зөвхөн авсан) ====== */}
          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Миний шалгалтын багцууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data?.examPackages
                ?.filter((plan) => plan.ispurchased === 1)
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

                    <p className="text-sm mt-1 flex items-center relative z-10 text-gray-500 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 mr-1 text-green-500" />{" "}
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
                  </div>
                ))}
            </div>
          </div>

          {/* ====== Боломжит шалгалтын багцууд (Зөвхөн аваагүй) ====== */}
          <div className="py-4" style={getAnimationStyles(600)}>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
              Боломжит Шалгалтын Багцууд
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data?.examPackages
                ?.filter((plan) => plan.ispurchased !== 1)
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

          <div className="" style={getAnimationStyles(800)}>
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
              {/* Scroll-гүй болгосон жагсаалт: h-48, overflow-y-auto, custom-scrollbar хасагдсан */}
              <div className="space-y-4">
                {data?.announcements.map((announcement, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex p-4 rounded-2xl transition-all cursor-pointer items-start group",
                      // Enhanced List Item Styling (Frosted/Glass look in Light, Deep in Dark)
                      "bg-indigo-50/70 backdrop-blur-sm dark:bg-gray-800/80 border border-indigo-100 dark:border-gray-700",
                      "hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/50"
                    )}
                  >
                    {/* Image Container - Larger and more prominent */}
                    <div className="w-24 h-24 flex-shrink-0 mr-4 overflow-hidden rounded-xl border-4 border-indigo-200 dark:border-indigo-700/50 shadow-md">
                      <img
                        src={
                          announcement.filename ||
                          "https://placehold.co/96x96/9333ea/ffffff?text=Zar"
                        }
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://placehold.co/96x96/9333ea/ffffff?text=Zar";
                        }}
                      />
                    </div>
                    {/* Content */}
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

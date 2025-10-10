"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getExamlists } from "@/lib/api";
import {
  Loader2,
  Clock,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Hourglass,
  User,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

// [1. Interface, 2. Styles/Logic, 3. DetailItem - Хэвээр үлдсэн]

interface Exam {
  exam_id: number;
  title: string;
  ognoo: string;
  exam_minute: number;
  que_cnt: number;
  exam_type: number;
  flag_name: string;
  teach_name: string;
  ispaydescr: string;
  amount: number;
  ispurchased: number;
  plan_name: string;
}

const getCardStyle = (
  isActive: boolean,
  isPayable: boolean,
  isUpcoming: boolean
) => {
  if (isPayable) {
    return "border-red-500/70 shadow-xl shadow-red-500/30 bg-white dark:bg-gray-950/50 dark:border-red-700/50";
  }
  if (isActive) {
    return "border-green-500/70 shadow-2xl shadow-green-500/30 ring-2 ring-green-500/20 bg-white dark:bg-gray-950/50 dark:border-green-700/50";
  }
  if (isUpcoming) {
    return "border-blue-400/70 shadow-lg shadow-blue-500/10 bg-white dark:bg-gray-950/50 dark:border-blue-700/50";
  }
  return "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900";
};

interface ExamCardProps {
  exam: Exam;
  now: Date;
  router: ReturnType<typeof useRouter>;
}

// ** ExamCard - Шинэчлэгдсэн **
const ExamCard: React.FC<ExamCardProps> = ({ exam, now, router }) => {
  const [isHovered, setIsHovered] = useState(false); // Hover төлөв
  const startTime = new Date(exam.ognoo);
  const endTime = new Date(startTime.getTime() + exam.exam_minute * 60000);

  const isPurchased = exam.ispurchased === 1;
  const isPayable = exam.ispaydescr === "Төлбөртэй" && !isPurchased;
  const isUpcoming = now < startTime;
  const isFinished = now > endTime;
  const isActive = !isUpcoming && !isFinished && !isPayable;
  const isLocked = isUpcoming || isFinished || isPayable;

  let statusText = "Дууссан";
  let statusBadgeClass = "bg-gray-500";
  let buttonText = "Шалгалт дууссан";
  let countdown = "Шалгалт дууссан";
  let countdownClasses =
    "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";

  if (isPayable) {
    statusText = "ТӨЛБӨР";
    statusBadgeClass = "bg-red-600 animate-pulse";
    buttonText = `Төлбөр төлөх (${exam.amount.toLocaleString()}₮)`;
    countdown = "Төлбөр төлөгдөөгүй!";
    countdownClasses =
      "text-red-600 bg-red-100 dark:bg-red-900/30 border-red-400/50";
  } else if (isUpcoming) {
    const diff = startTime.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    countdown = `${minutes}м ${seconds}с`;

    statusText = "УДАХГҮЙ";
    statusBadgeClass = "bg-blue-500";
    buttonText = "Хүлээгдэж байна";
    countdownClasses =
      "text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-400/50";
  } else if (isActive) {
    const diff = endTime.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    countdown = `${minutes}м ${seconds}с`;

    statusText = "LIVE";
    statusBadgeClass = "bg-green-600 animate-pulse";
    buttonText = "Шалгалт эхлүүлэх";
    countdownClasses =
      "text-green-600 bg-green-100 dark:bg-green-900/30 border-green-400/50";
  }

  const cardStyle = getCardStyle(isActive, isPayable, isUpcoming);

  const handleAction = () => {
    if (isPayable) {
      router.push(`/payment/${exam.exam_id}`);
    } else if (isActive) {
      router.push(`/exam/${exam.exam_id}`);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 flex flex-col h-full ${cardStyle}`}
    >
      <div className="p-5 flex flex-col flex-grow">
        {/* Header & Status Badge */}
        <div className="flex justify-between items-start mb-3">
          <h2
            title={exam.title}
            className={`text-lg md:text-xl font-extrabold text-gray-900 dark:text-gray-50 leading-tight 
                       min-h-[2.5em] cursor-pointer transition-all duration-300 ${
                         isHovered ? "line-clamp-none" : "line-clamp-2" // Hover-ийн үед хязгаарлалтыг арилгаж, картыг тэлэх
                       }`}
          >
            {exam.title}
          </h2>
          <div
            className={`text-xs text-white font-bold px-3 py-1 rounded-full whitespace-nowrap uppercase ${statusBadgeClass}`}
          >
            {statusText}
          </div>
        </div>

        {/* Plan & Teacher Info */}
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 space-y-1 pb-3 border-b border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            {exam.plan_name}
          </p>
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <p>
              Багш:{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {exam.teach_name}
              </span>
            </p>
          </div>
        </div>

        {/* Core Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-gray-700 dark:text-gray-300 mb-5">
          <DetailItem
            icon={<BookOpen size={16} className="text-indigo-500" />}
            label="Асуулт"
            value={exam.que_cnt}
          />
          <DetailItem
            icon={<Clock size={16} className="text-red-500" />}
            label="Хугацаа"
            value={`${exam.exam_minute} мин`}
          />
          <DetailItem
            icon={
              <Calendar
                size={16}
                className="text-gray-500 dark:text-gray-400"
              />
            }
            label="Эхлэх"
            value={startTime.toLocaleTimeString("mn-MN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <DetailItem
            icon={
              <Hourglass
                size={16}
                className="text-gray-500 dark:text-gray-400"
              />
            }
            label="Дуусах"
            value={endTime.toLocaleTimeString("mn-MN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        </div>

        {/* Payment Status - Highlight */}
        <div className="flex items-center justify-between p-2 rounded-md border border-dashed border-gray-300 dark:border-gray-700 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <DollarSign
              size={18}
              className={
                isPurchased || exam.ispaydescr === "Төлбөргүй"
                  ? "text-green-500"
                  : "text-red-500"
              }
            />
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Төлбөр:
            </span>
          </div>
          <span
            className={`font-extrabold text-base ${
              isPurchased || exam.ispaydescr === "Төлбөргүй"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {isPurchased
              ? "Төлөгдсөн"
              : exam.ispaydescr === "Төлбөргүй"
              ? "Төлбөргүй"
              : `${exam.amount.toLocaleString()}₮`}
          </span>
        </div>

        {/* Countdown Timer - mt-auto нь доод талд наалдуулах үүрэгтэй */}
        {!isFinished && (
          <div
            className={`mt-auto p-3 rounded-lg text-center font-extrabold text-xl md:text-2xl transition-colors mb-4 border border-dashed ${countdownClasses}`}
          >
            {isPayable ? (
              <div className="flex items-center justify-center gap-2">
                <AlertCircle size={24} />
                <span className="text-lg">Төлбөр шаардлагатай!</span>
              </div>
            ) : (
              countdown
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={isLocked && !isPayable}
          className={`w-full text-base font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg ${
            isActive
              ? "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-blue-500/50"
              : isPayable
              ? "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 shadow-red-500/50"
              : "bg-gray-300 cursor-not-allowed text-gray-700 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          {buttonText} {(isActive || isPayable) && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
};

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
      {icon} {label}
    </div>
    <span className="font-bold text-gray-900 dark:text-gray-50">{value}</span>
  </div>
);

export default function ExamListPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const router = useRouter();
  const backgroundClass = "bg-slate-50 dark:bg-gray-950";

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(Number(id));

    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchExamListWrapper = async (id: number) => {
    const response = await getExamlists(id);
    return response.RetData || [];
  };

  const {
    data: exams,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["examList", userId],
    queryFn: () => fetchExamListWrapper(userId!),
    enabled: !!userId,
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Шалгалтын мэдээллийг татаж байна...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-red-900/20 p-6">
        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mb-4" />
        <p className="text-2xl font-bold text-red-700 dark:text-red-400">
          Алдаа гарлаа
        </p>
      </div>
    );

  const allExams = exams || [];
  const requiredPaymentExams = allExams.filter(
    (e: Exam) => e.ispaydescr === "Төлбөртэй" && e.ispurchased === 0
  );
  const paidOrFreeExams = allExams.filter(
    (e: Exam) => e.ispaydescr === "Төлбөргүй" || e.ispurchased === 1
  );

  const sortedPaidOrFreeExams = paidOrFreeExams.sort((a: Exam, b: Exam) => {
    const aStartTime = new Date(a.ognoo);
    const bStartTime = new Date(b.ognoo);
    const aEndTime = new Date(aStartTime.getTime() + a.exam_minute * 60000);
    const bEndTime = new Date(bStartTime.getTime() + b.exam_minute * 60000);

    const aIsActive = aStartTime <= now && aEndTime >= now;
    const bIsActive = bStartTime <= now && bEndTime >= now;

    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;

    return aStartTime.getTime() - bStartTime.getTime();
  });

  return (
    <div
      className={cn(
        backgroundClass,
        "font-inter min-h-screen transition-colors duration-500"
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-8 text-gray-900 dark:text-gray-100 border-b pb-4 border-gray-200 dark:border-gray-800">
          Шалгалтын Жагсаалт
        </h1>

        {/* 1. Идэвхтэй, Төлөгдсөн & Төлбөргүй Шалгалтууд */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BookOpen size={24} className="text-green-600" /> Идэвхтэй &
            Төлөгдсөн Шалгалтууд
          </h2>
          {sortedPaidOrFreeExams.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent className="-ml-3 pb-2 items-stretch">
                {sortedPaidOrFreeExams.map((exam: Exam) => (
                  <CarouselItem
                    key={exam.exam_id}
                    className="pl-3 basis-11/12 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex h-full"
                  >
                    <ExamCard exam={exam} now={now} router={router} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="p-6 md:p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-inner">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Одоогоор идэвхтэй эсвэл удахгүй эхлэх шалгалт байхгүй байна.
              </p>
            </div>
          )}
        </div>

        {/* 2. Төлбөр Шаардлагатай Шалгалтууд */}
        {requiredPaymentExams.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2 border-t pt-8 border-gray-200 dark:border-gray-800">
              <DollarSign size={24} /> Төлбөр Шаардлагатай Шалгалтууд
            </h2>
            <Carousel className="w-full">
              <CarouselContent className="-ml-3 pb-2 items-stretch">
                {requiredPaymentExams.map((exam: Exam) => (
                  <CarouselItem
                    key={exam.exam_id}
                    className="pl-3 basis-11/12 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex h-full"
                  >
                    <ExamCard exam={exam} now={now} router={router} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}

        {/* Footnote */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-center text-gray-500 dark:text-gray-400 pb-4">
          Одоогийн цаг: **{now.toLocaleString("mn-MN")}**
        </div>
      </div>
    </div>
  );
}

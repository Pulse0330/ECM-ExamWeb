"use client";

import React, { memo, useCallback } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  Target,
  User,
  Clock,
} from "lucide-react";

// ========================
// SingleSelectQuestion component
// ========================
interface AnswerData {
  answer_id: number;
  answer_name_html?: string;
  answer_img?: string;
  is_true?: number;
}

interface SingleSelectQuestionProps {
  questionId: number;
  answers: AnswerData[];
  mode: "exam" | "review";
  selectedAnswer?: number | null;
  onAnswerChange?: (questionId: number, answerId: number | null) => void;
}

const SingleSelectQuestion = memo(
  ({
    questionId,
    answers,
    mode,
    selectedAnswer,
    onAnswerChange,
  }: SingleSelectQuestionProps) => {
    const isReviewMode = mode === "review";

    const handleSelect = useCallback(
      (answerId: number) => {
        if (isReviewMode || !onAnswerChange) return;
        const newValue = selectedAnswer === answerId ? null : answerId;
        onAnswerChange(questionId, newValue);
      },
      [questionId, selectedAnswer, isReviewMode, onAnswerChange]
    );

    return (
      <div className="space-y-2 sm:space-y-3">
        {answers.map((option, index) => {
          const isSelected = selectedAnswer === option.answer_id;
          const isCorrect = option.is_true === 1;

          const colorClass = isReviewMode
            ? isCorrect
              ? "border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-950/30"
              : isSelected
              ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950/30"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
            : isSelected
            ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50";

          return (
            <Button
              key={`${questionId}-${option.answer_id}-${index}`}
              onClick={() => handleSelect(option.answer_id)}
              variant="outline"
              disabled={isReviewMode}
              className={`relative flex items-start gap-2 sm:gap-3 w-full justify-start p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 h-auto min-h-[52px] ${colorClass} ${
                isReviewMode
                  ? "cursor-default"
                  : "hover:scale-[1.01] hover:shadow-lg"
              }`}
            >
              {/* Review mode icon */}
              {isReviewMode && (
                <div className="absolute right-2 sm:right-3 top-2 sm:top-3">
                  {isCorrect ? (
                    <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-1">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  ) : isSelected ? (
                    <div className="bg-red-100 dark:bg-red-900/50 rounded-full p-1">
                      <XCircle className="text-red-600 dark:text-red-400 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  ) : null}
                </div>
              )}

              {/* Radio circle */}
              <span
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                  ${
                    isSelected
                      ? isReviewMode
                        ? isCorrect
                          ? "border-green-600 dark:border-green-400 bg-green-600 dark:bg-green-500"
                          : "border-red-600 dark:border-red-400 bg-red-600 dark:bg-red-500"
                        : "border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-500"
                      : "border-gray-400 dark:border-gray-500 bg-transparent"
                  }
                `}
              >
                {isSelected && (
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full" />
                )}
              </span>

              {/* Image */}
              {option.answer_img && (
                <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                  <Image
                    src={option.answer_img}
                    alt={`Answer ${option.answer_id}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Text */}
              <span
                className="flex-1 min-w-0 text-left text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-100 pr-8"
                dangerouslySetInnerHTML={{
                  __html: option.answer_name_html || "",
                }}
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              />
            </Button>
          );
        })}
      </div>
    );
  }
);

SingleSelectQuestion.displayName = "SingleSelectQuestion";

// ========================
// Types
// ========================
interface Question {
  exam_que_id: number;
  question_name: string;
  question_img: string;
  que_onoo: number;
  row_num: string;
}

interface Answer {
  exam_que_id: number;
  answer_id: number;
  answer_name_html: string;
  answer_img: string;
  is_true: number;
}

interface SelectedAnswer {
  exam_que_id: number;
  answer_id: number;
}

interface CorrectAnswer {
  exam_que_id: number;
  answer_id: number;
  answer: string;
  quetype: number;
}

interface Explanation {
  exam_que_id: number;
  descr: string;
  img_file: string;
}

interface ExamInfo {
  test_id: number;
  lesson_name: string;
  test_title: string;
  test_type_name: string;
  test_date: string;
  test_time: string;
  test_ttl: number;
  correct_ttl: number;
  not_answer: number;
  wrong_ttl: number;
  ttl_point: number;
  point: number;
  point_perc: number;
  fname: string;
}

interface ExamResultData {
  RetDataFirst: ExamInfo[];
  RetDataSecond: Question[];
  RetDataThirt: Answer[];
  RetDataFourth: CorrectAnswer[];
  RetDataFifth: Explanation[];
}

// ========================
// Main Component
// ========================
export default function ExamResultDataFetcher() {
  const [filter, setFilter] = React.useState<"all" | "correct" | "wrong">(
    "all"
  );

  const { data, isLoading, error } = useQuery<ExamResultData>({
    queryKey: ["examResultAll"],
    queryFn: async () => {
      const res = await fetch("https://ottapp.ecm.mn/api/resexammore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_id: 16016,
          exam_id: 7900,
          user_id: 223221,
          conn: {
            user: "edusr",
            password: "sql$erver43",
            database: "ikh_skuul",
            server: "172.16.1.79",
            pool: { max: 100000, min: 0, idleTimeoutMillis: 30000000 },
            options: { encrypt: false, trustServerCertificate: false },
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    },
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400"></div>
          <div className="absolute inset-0 rounded-full bg-blue-400/20 dark:bg-blue-600/20 animate-ping"></div>
        </div>
        <p className="text-gray-700 dark:text-gray-200 font-semibold mt-6 text-base sm:text-lg animate-pulse">
          Үр дүн ачааллаж байна...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="max-w-md w-full bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-900 shadow-2xl">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <p className="font-bold text-xl sm:text-2xl text-red-600 dark:text-red-400 mb-2">
              Алдаа гарлаа
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );

  const examInfo = data?.RetDataFirst?.[0];
  const questions = data?.RetDataSecond || [];
  const answers = data?.RetDataThirt || [];
  const correctAnswers = data?.RetDataFourth || [];
  const explanations = data?.RetDataFifth || [];

  // Group answers by question
  const answersByQuestion = answers.reduce((acc: any, a) => {
    if (!acc[a.exam_que_id]) acc[a.exam_que_id] = [];
    acc[a.exam_que_id].push(a);
    return acc;
  }, {});

  // Map selected answers
  const selectedMap = correctAnswers.reduce((acc: any, s) => {
    acc[s.exam_que_id] = s.answer_id;
    return acc;
  }, {});

  // Map explanations
  const explanationMap = explanations.reduce((acc: any, e) => {
    acc[e.exam_que_id] = e;
    return acc;
  }, {});

  // Calculate correct and wrong counts
  const correctCount = questions.filter((q) => {
    const ans = answersByQuestion[q.exam_que_id] || [];
    const selected = selectedMap[q.exam_que_id];
    return ans.some((a: Answer) => a.answer_id === selected && a.is_true === 1);
  }).length;

  const wrongCount = questions.length - correctCount;

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (filter === "all") return true;

    const ans = answersByQuestion[q.exam_que_id] || [];
    const selected = selectedMap[q.exam_que_id];
    const isCorrect = ans.some(
      (a: Answer) => a.answer_id === selected && a.is_true === 1
    );

    if (filter === "correct") return isCorrect;
    if (filter === "wrong") return !isCorrect;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 text-white shadow-2xl overflow-hidden border-0">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Title Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <Award className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                  Шалгалтын Үр Дүн
                </h1>
                <p className="text-blue-100 dark:text-blue-200 text-xs sm:text-sm">
                  {examInfo?.lesson_name} - {examInfo?.test_type_name}
                </p>
              </div>
            </div>

            {/* Student Info */}
            {examInfo?.fname && (
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 border border-white/20">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-white/20 rounded-lg p-2">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-100">Суралцагч</p>
                    <p className="font-semibold text-sm sm:text-base">
                      {examInfo.fname}
                    </p>
                  </div>
                </div>
                {examInfo.test_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{examInfo.test_time}</span>
                  </div>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6">
              <StatBox
                label="Нийт асуулт"
                value={examInfo?.test_ttl || 0}
                icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
              />
              <StatBox
                label="Зөв хариулт"
                value={examInfo?.correct_ttl || 0}
                icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                color="text-green-100"
              />
              <StatBox
                label="Буруу"
                value={examInfo?.wrong_ttl || 0}
                icon={<XCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                color="text-red-100"
              />
              <StatBox
                label="Оноо"
                value={`${examInfo?.point?.toFixed(1) || 0}/${
                  examInfo?.ttl_point || 0
                }`}
                icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
                color="text-yellow-100"
              />
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-2">
                <span className="font-medium">Амжилт</span>
                <span className="font-bold text-base sm:text-lg">
                  {examInfo?.point_perc?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="w-full h-3 sm:h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${examInfo?.point_perc || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 sm:h-11 ${
                  filter === "all"
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-semibold text-sm sm:text-base">
                  Бүгд <span className="ml-1">({questions.length})</span>
                </span>
              </Button>
              <Button
                variant={filter === "correct" ? "default" : "outline"}
                onClick={() => setFilter("correct")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 sm:h-11 ${
                  filter === "correct"
                    ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-950/30 border-2 border-green-300 dark:border-green-600 text-green-700 dark:text-green-400"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold text-sm sm:text-base">
                  Зөв <span className="ml-1">({correctCount})</span>
                </span>
              </Button>
              <Button
                variant={filter === "wrong" ? "default" : "outline"}
                onClick={() => setFilter("wrong")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 sm:h-11 ${
                  filter === "wrong"
                    ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 border-2 border-red-300 dark:border-red-600 text-red-700 dark:text-red-400"
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span className="font-semibold text-sm sm:text-base">
                  Буруу <span className="ml-1">({wrongCount})</span>
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-3 sm:space-y-4">
          {filteredQuestions.map((q, i) => {
            const ans = answersByQuestion[q.exam_que_id] || [];
            const selected = selectedMap[q.exam_que_id];
            const explain = explanationMap[q.exam_que_id];
            const isCorrect = ans.some(
              (a: Answer) => a.answer_id === selected && a.is_true === 1
            );

            return (
              <Card
                key={`question-${q.exam_que_id}-${i}`}
                className={`border-l-4 ${
                  isCorrect
                    ? "border-l-green-500 dark:border-l-green-400"
                    : "border-l-red-500 dark:border-l-red-400"
                } bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700`}
              >
                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs sm:text-sm font-semibold px-3 py-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    >
                      Асуулт {i + 1}
                    </Badge>
                    <Badge
                      variant={isCorrect ? "default" : "destructive"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm ${
                        isCorrect
                          ? "bg-green-600 dark:bg-green-700 hover:bg-green-700"
                          : "bg-red-600 dark:bg-red-700 hover:bg-red-700"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      <span className="font-semibold">
                        {isCorrect ? "Зөв" : "Буруу"}
                      </span>
                    </Badge>
                  </div>
                  <div
                    className="text-sm sm:text-base lg:text-lg font-medium text-gray-800 dark:text-gray-100 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: q.question_name }}
                  />
                  {q.question_img && (
                    <div className="mt-4">
                      <img
                        src={q.question_img}
                        alt="Question"
                        className="rounded-xl border-2 border-gray-200 dark:border-gray-700 max-w-full shadow-md"
                      />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0">
                  <SingleSelectQuestion
                    questionId={q.exam_que_id}
                    answers={ans}
                    mode="review"
                    selectedAnswer={selected}
                  />

                  {explain?.descr && (
                    <>
                      <Separator className="my-4 sm:my-6 dark:bg-gray-700" />
                      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 sm:p-5 rounded-xl shadow-sm">
                        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2 text-base sm:text-lg">
                          <BookOpen className="w-5 h-5" />
                          Тайлбар
                        </h4>
                        <div
                          className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: explain.descr,
                          }}
                        />
                        {explain.img_file && (
                          <div className="mt-4">
                            <img
                              src={explain.img_file}
                              alt="Explanation"
                              className="max-w-full h-auto rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 sm:p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                Асуулт олдсонгүй
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Сонгосон категорид асуулт байхгүй байна
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ========================
// Helper Components
// ========================
function StatBox({
  label,
  value,
  icon,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all duration-200 border border-white/20">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <span className="text-xs sm:text-sm font-medium leading-tight">
          {label}
        </span>
      </div>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
        {value}
      </p>
    </div>
  );
}

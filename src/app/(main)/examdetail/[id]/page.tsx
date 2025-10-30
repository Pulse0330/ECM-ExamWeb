"use client";

import React, { memo, useCallback, use, useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getExamResultMore } from "@/lib/api";
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
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Flag,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Import question components
import SingleSelectQuestion from "@/components/question/sinleselect";
import MultiSelectQuestion from "@/components/question/multiselect";
import FillInTheBlankQuestionShadcn from "@/components/question/fillinblank";
import DragAndDropWrapper from "@/components/question/DragAndDropWrapper";

// ========================
// Types
// ========================
interface Question {
  exam_que_id: number;
  question_name: string;
  question_img: string;
  que_onoo: number;
  row_num: string;
  que_type_id: number;
}

interface Answer {
  exam_que_id: number;
  answer_id: number;
  answer_name_html: string;
  answer_img: string;
  is_true: number;
  ref_child_id?: number;
  refid?: number;
  answer_type?: number;
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
// QuestionItem Component
// ========================
const QuestionItem = memo(
  ({
    question,
    questionNumber,
    answers,
    selectedAnswer,
    explanation,
    isMobile = false,
    testId,
    examId,
    userId,
  }: {
    question: Question;
    questionNumber: number;
    answers: Answer[];
    selectedAnswer: any;
    explanation?: Explanation;
    isMobile?: boolean;
    testId: number;
    examId: number;
    userId: number;
  }) => {
    // Check if answer is correct based on que_type_id

    const isCorrect = useMemo(() => {
      if (!selectedAnswer) return false;

      switch (question.que_type_id) {
        case 1:
          return answers.some(
            (a) => a.answer_id === selectedAnswer && a.is_true === 1
          );

        case 2:
        case 3:
          if (!Array.isArray(selectedAnswer) || selectedAnswer.length === 0)
            return false;
          const correctIds = answers
            .filter((a) => a.is_true === 1)
            .map((a) => a.answer_id);
          return (
            selectedAnswer.length === correctIds.length &&
            selectedAnswer.every((id: number) => correctIds.includes(id))
          );

        case 4:
        case 5:
          return true;

        case 6:
          // For matching questions, validate each match
          try {
            let userMatches: Record<string, number> = {};
            if (typeof selectedAnswer === "string") {
              userMatches = JSON.parse(selectedAnswer);
            } else if (selectedAnswer && typeof selectedAnswer === "object") {
              userMatches = selectedAnswer as Record<string, number>;
            }

            // If no matches, it's wrong
            if (!userMatches || Object.keys(userMatches).length === 0) {
              return false;
            }

            const questionItems = answers.filter((a) => a.ref_child_id !== -1);
            const answerItems = answers.filter((a) => a.ref_child_id === -1);

            // Check if all matches are correct
            return Object.entries(userMatches).every(([qId, aId]) => {
              const questionItem = questionItems.find(
                (q) => q.answer_id === parseInt(qId)
              );
              const answerItem = answerItems.find((a) => a.answer_id === aId);

              if (!questionItem || !answerItem) return false;

              return questionItem.ref_child_id === answerItem.refid;
            });
          } catch (e) {
            return false;
          }

        default:
          return false;
      }
    }, [question.que_type_id, selectedAnswer, answers]);

    return (
      <div
        id={`question-container-${question.exam_que_id}`}
        className={
          isMobile
            ? "p-4"
            : "p-4 sm:p-6 border rounded-xl shadow-sm bg-white dark:bg-slate-900 scroll-mt-20"
        }
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-3 mb-4">
          <h2 className="flex-1 text-base sm:text-lg font-semibold min-w-0">
            {questionNumber}.{" "}
            <span
              dangerouslySetInnerHTML={{ __html: question.question_name }}
              className="[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
            />
          </h2>

          {/* Status Badge */}
          <Badge
            variant={isCorrect ? "default" : "destructive"}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm flex-shrink-0 ${
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
            <span className="font-semibold">{isCorrect ? "Зөв" : "Буруу"}</span>
          </Badge>
        </div>

        {/* Question Image */}
        {question.question_img && (
          <div className="mb-4">
            <img
              src={question.question_img}
              alt="Question"
              className="rounded-xl border-2 border-gray-200 dark:border-gray-700 max-w-full shadow-md"
            />
          </div>
        )}

        {/* Answers - Different component based on que_type_id */}
        <div className="space-y-3">
          {/* Type 1: Single Select */}
          {question.que_type_id === 1 && (
            <SingleSelectQuestion
              questionId={question.exam_que_id}
              questionText={question.question_name}
              answers={answers.map((a) => ({
                ...a,
                is_true: a.is_true === 1,
              }))}
              mode="review"
              selectedAnswer={selectedAnswer as number | null}
              onAnswerChange={() => {}}
            />
          )}

          {/* Type 2, 3: Multi Select */}
          {(question.que_type_id === 2 || question.que_type_id === 3) && (
            <MultiSelectQuestion
              questionId={question.exam_que_id}
              questionText={question.question_name}
              answers={answers.map((a) => ({
                ...a,
                answer_type: a.answer_type || question.que_type_id,
              }))}
              mode="review"
              selectedAnswers={
                Array.isArray(selectedAnswer) ? selectedAnswer : []
              }
              onAnswerChange={() => {}}
              readOnly={true}
            />
          )}

          {/* Type 4: Fill in the Blank */}
          {question.que_type_id === 4 && (
            <FillInTheBlankQuestionShadcn
              questionId={question.exam_que_id.toString()}
              questionText={question.question_name}
              value={typeof selectedAnswer === "string" ? selectedAnswer : ""}
              mode="review"
              readOnly={true}
              correctAnswer={
                answers.find((a) => a.is_true === 1)?.answer_name_html || ""
              }
            />
          )}

          {/* Type 5: Drag and Drop */}
          {question.que_type_id === 5 && (
            <DragAndDropWrapper
              answers={answers}
              questionId={question.exam_que_id}
              examId={examId}
              userId={userId}
              mode="review"
              userAnswers={(() => {
                try {
                  if (typeof selectedAnswer === "string") {
                    return JSON.parse(selectedAnswer);
                  } else if (Array.isArray(selectedAnswer)) {
                    return selectedAnswer;
                  }
                  return [];
                } catch (e) {
                  return [];
                }
              })()}
              correctAnswers={answers
                .sort((a, b) => (a.refid || 0) - (b.refid || 0))
                .map((a) => a.answer_id)}
              readOnly={true}
            />
          )}

          {/* Type 6: Matching */}
          {question.que_type_id === 6 && (
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 p-4 rounded-lg border-l-4 border-blue-500">
              {(() => {
                const questionAnswers = answers.filter(
                  (a) => a.exam_que_id === question.exam_que_id
                );
                const questionItems = questionAnswers.filter(
                  (a) => a.ref_child_id !== -1
                );
                const answerItems = questionAnswers.filter(
                  (a) => a.ref_child_id === -1
                );

                let userMatches: Record<string, number> = {};
                try {
                  if (typeof selectedAnswer === "string") {
                    userMatches = JSON.parse(selectedAnswer);
                  } else if (
                    selectedAnswer &&
                    typeof selectedAnswer === "object"
                  ) {
                    userMatches = selectedAnswer as Record<string, number>;
                  }
                } catch (e) {
                  console.error("Failed to parse matching answer:", e);
                }

                const hasAnswer =
                  userMatches && Object.keys(userMatches).length > 0;

                if (!hasAnswer) {
                  return (
                    <>
                      <div className="grid md:grid-cols-2 gap-4 opacity-90">
                        {/* --- Асуултууд --- */}
                        <div>
                          <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
                            Асуултууд:
                          </p>
                          <div className="space-y-1">
                            {questionItems.map((q, i) => (
                              <div
                                key={i}
                                className="min-h-[60px] flex items-center text-sm p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                <span className="font-mono text-xs mr-2">
                                  {i + 1}.
                                </span>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: q.answer_name_html,
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* --- Хариултууд --- */}
                        <div>
                          <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
                            Хариултууд:
                          </p>
                          <div className="space-y-1">
                            {answerItems.map((a, i) => (
                              <div
                                key={i}
                                className="min-h-[60px] flex items-center text-sm p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                <span className="font-mono text-xs mr-2">
                                  {String.fromCharCode(65 + i)}.
                                </span>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: a.answer_name_html,
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                }

                return (
                  <>
                    <p className="text-sm font-medium mb-3 text-blue-900 dark:text-blue-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Таны холболтууд:
                    </p>
                    <div className="space-y-2">
                      {Object.entries(userMatches).map(([qId, aId]) => {
                        const questionItem = questionItems.find(
                          (q) => q.answer_id === parseInt(qId)
                        );
                        const answerItem = answerItems.find(
                          (a) => a.answer_id === aId
                        );

                        if (!questionItem || !answerItem) return null;

                        const isCorrect =
                          questionItem.ref_child_id === answerItem.refid;

                        return (
                          <div
                            key={qId}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                              isCorrect
                                ? "bg-green-50 dark:bg-green-950/30 border-green-500"
                                : "bg-red-50 dark:bg-red-950/30 border-red-500"
                            }`}
                          >
                            <div className="flex-1">
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Асуулт:
                              </div>
                              <div
                                className="text-sm font-medium"
                                dangerouslySetInnerHTML={{
                                  __html: questionItem.answer_name_html || "",
                                }}
                              />
                            </div>

                            <div
                              className={`text-xl font-bold ${
                                isCorrect ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isCorrect ? "✓" : "✗"}
                            </div>

                            <div className="flex-1">
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Хариулт:
                              </div>
                              <div
                                className="text-sm font-medium"
                                dangerouslySetInnerHTML={{
                                  __html: answerItem.answer_name_html || "",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Explanation */}
        {explanation?.descr && (
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
                  __html: explanation.descr,
                }}
              />
              {explanation.img_file && (
                <div className="mt-4">
                  <img
                    src={explanation.img_file}
                    alt="Explanation"
                    className="max-w-full h-auto rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
);

QuestionItem.displayName = "QuestionItem";

// ========================
// Main Component
// ========================
export default function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "correct" | "wrong">("all");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { id } = use(params);
  const userId = useAuthStore((state) => state.userId);

  const paramParts = id.split("-");
  const testId = parseInt(paramParts[0]);
  const examId = parseInt(paramParts[1]);

  const { data, isLoading, error } = useQuery<ExamResultData>({
    queryKey: ["examResult", testId, examId, userId],
    queryFn: () => getExamResultMore(testId, examId, userId!),
    enabled: !!userId && !isNaN(testId) && !isNaN(examId),
  });

  if (isNaN(testId) || isNaN(examId)) {
    return <ErrorCard message="Буруу ID" />;
  }

  if (!userId) {
    return <ErrorCard message="Нэвтрэх шаардлагатай" />;
  }

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={error.message} />;

  const examInfo = data?.RetDataFirst?.[0];
  const questions = data?.RetDataSecond || [];
  const answers = data?.RetDataThirt || [];
  const correctAnswers = data?.RetDataFourth || [];
  const explanations = data?.RetDataFifth || [];

  const answersByQuestion = answers.reduce((acc: any, a) => {
    if (!acc[a.exam_que_id]) acc[a.exam_que_id] = [];
    acc[a.exam_que_id].push(a);
    return acc;
  }, {});

  const selectedMap = correctAnswers.reduce((acc: any, s) => {
    if (s.quetype === 6 && s.answer) {
      try {
        acc[s.exam_que_id] = JSON.parse(s.answer);
      } catch (e) {
        acc[s.exam_que_id] = s.answer;
      }
    } else {
      acc[s.exam_que_id] = s.answer_id || s.answer;
    }
    return acc;
  }, {});

  const explanationMap = explanations.reduce((acc: any, e) => {
    acc[e.exam_que_id] = e;
    return acc;
  }, {});

  const correctCount = questions.filter((q) => {
    const ans = answersByQuestion[q.exam_que_id] || [];
    const selected = selectedMap[q.exam_que_id];

    switch (q.que_type_id) {
      case 1:
        return ans.some(
          (a: Answer) => a.answer_id === selected && a.is_true === 1
        );
      case 2:
      case 3:
        if (!Array.isArray(selected)) return false;
        const correctIds = ans
          .filter((a: Answer) => a.is_true === 1)
          .map((a: Answer) => a.answer_id);
        return (
          selected.length === correctIds.length &&
          selected.every((id: number) => correctIds.includes(id))
        );
      default:
        return true;
    }
  }).length;

  const wrongCount = questions.length - correctCount;

  const filteredQuestions = questions.filter((q) => {
    if (filter === "all") return true;
    const ans = answersByQuestion[q.exam_que_id] || [];
    const selected = selectedMap[q.exam_que_id];

    let isCorrect = false;
    switch (q.que_type_id) {
      case 1:
        isCorrect = ans.some(
          (a: Answer) => a.answer_id === selected && a.is_true === 1
        );
        break;
      case 2:
      case 3:
        if (!Array.isArray(selected)) {
          isCorrect = false;
        } else {
          const correctIds = ans
            .filter((a: Answer) => a.is_true === 1)
            .map((a: Answer) => a.answer_id);
          isCorrect =
            selected.length === correctIds.length &&
            selected.every((id: number) => correctIds.includes(id));
        }
        break;
      default:
        isCorrect = true;
    }

    return filter === "correct" ? isCorrect : !isCorrect;
  });

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const goToNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-16 lg:pb-8">
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Буцах
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">
              Асуулт {currentQuestionIndex + 1}/{filteredQuestions.length}
            </span>
            <span className="text-muted-foreground">
              {correctCount} зөв, {wrongCount} буруу
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 lg:px-6 py-4 lg:py-8 space-y-4 sm:space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="hidden lg:flex items-center gap-2 text-gray-700 dark:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Буцах
        </Button>

        <HeaderCard
          examInfo={examInfo}
          correctCount={correctCount}
          wrongCount={wrongCount}
        />
        <FilterButtons
          filter={filter}
          setFilter={setFilter}
          totalCount={questions.length}
          correctCount={correctCount}
          wrongCount={wrongCount}
        />

        <div className="hidden lg:block space-y-3 sm:space-y-4">
          {filteredQuestions.map((q, i) => (
            <QuestionItem
              key={q.exam_que_id}
              question={q}
              questionNumber={i + 1}
              answers={answersByQuestion[q.exam_que_id] || []}
              selectedAnswer={selectedMap[q.exam_que_id]}
              explanation={explanationMap[q.exam_que_id]}
              testId={testId}
              examId={examId}
              userId={userId}
            />
          ))}
        </div>

        {currentQuestion && (
          <div className="lg:hidden bg-white dark:bg-slate-900 rounded-xl border shadow-md">
            <QuestionItem
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              answers={answersByQuestion[currentQuestion.exam_que_id] || []}
              selectedAnswer={selectedMap[currentQuestion.exam_que_id]}
              explanation={explanationMap[currentQuestion.exam_que_id]}
              testId={testId}
              examId={examId}
              userId={userId}
              isMobile={true}
            />
          </div>
        )}

        {filteredQuestions.length === 0 && <EmptyState />}
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t shadow-lg">
        <div className="px-3 py-2.5 flex gap-2">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex-1 h-11 font-medium"
          >
            <ChevronLeft size={18} className="mr-1" />
            Өмнөх
          </Button>
          <Button
            onClick={goToNextQuestion}
            disabled={currentQuestionIndex === filteredQuestions.length - 1}
            className="flex-1 h-11 font-medium"
          >
            Дараах
            <ChevronRight size={18} className="ml-1" />
          </Button>
        </div>
      </nav>
    </div>
  );
}

function HeaderCard({ examInfo, correctCount, wrongCount }: any) {
  return (
    <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 text-white shadow-2xl border-0">
      <CardContent className="p-4 sm:p-6 lg:p-8">
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

        {examInfo?.fname && (
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-6 flex items-center gap-3 border border-white/20">
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
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6">
          <StatBox
            label="Нийт"
            value={examInfo?.test_ttl || 0}
            icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <StatBox
            label="Зөв"
            value={correctCount}
            icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="text-green-100"
          />
          <StatBox
            label="Буруу"
            value={wrongCount}
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

        <div>
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span className="font-medium">Амжилт</span>
            <span className="font-bold text-base sm:text-lg">
              {examInfo?.point_perc?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="w-full h-3 sm:h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-1000"
              style={{ width: `${examInfo?.point_perc || 0}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function FilterButtons({
  filter,
  setFilter,
  totalCount,
  correctCount,
  wrongCount,
}: any) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border">
      <CardContent className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 sm:h-11 ${
              filter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Бүгд ({totalCount})
          </Button>
          <Button
            variant={filter === "correct" ? "default" : "outline"}
            onClick={() => setFilter("correct")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 sm:h-11 ${
              filter === "correct" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Зөв ({correctCount})
          </Button>
          <Button
            variant={filter === "wrong" ? "default" : "outline"}
            onClick={() => setFilter("wrong")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 sm:h-11 ${
              filter === "wrong" ? "bg-red-600 hover:bg-red-700" : ""
            }`}
          >
            <XCircle className="w-4 h-4" />
            Буруу ({wrongCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value, icon, color = "text-white" }: any) {
  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all border border-white/20">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <span className="text-xs sm:text-sm font-medium">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
        {value}
      </p>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
      <p className="mt-6 text-lg">Үр дүн ачааллаж байна...</p>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full border-2 border-red-500">
        <CardContent className="p-8 text-center">
          <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
          <p className="font-bold text-2xl text-red-600 mb-2">Алдаа гарлаа</p>
          <p className="text-gray-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-12 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-semibold">Асуулт олдсонгүй</p>
      </CardContent>
    </Card>
  );
}

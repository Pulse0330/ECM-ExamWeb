"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SingleSelectQuestion from "@/components/question/sinleselect";
import MultiSelectQuestion from "@/components/question/multiselect";
import FillInTheBlankQuestionShadcn from "@/components/question/fillinblank";
import DragAndDropWrapper from "@/components/question/DragAndDropWrapper";
import MatchingByLineWrapper from "@/components/question/matchingWrapper";
import MiniMap from "@/app/exam/minimap";
import SubmitExamButtonWithDialog from "@/components/question/Submit";
import { AdvancedExamProctor } from "@/components/question/examguard";
import { Flag, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { getExamById, saveExamAnswer, finishExam } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useExamStore } from "@/stores/examStore";
import type { ApiExamResponse, Answer } from "@/types/exam";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTestIdFromResponse, isExamSubmitSuccess } from "@/types/examfinish";

type SelectedAnswersType = {
  [key: number]: number | number[] | string | Record<string, string> | null;
};

export default function SorilPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const { setTestId } = useExamStore();
  const requestedCount = searchParams.get("count");

  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswersType>(
    {}
  );
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const saveQueueRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const questionContainerRef = useRef<HTMLDivElement>(null);

  const { data: examData } = useQuery<ApiExamResponse>({
    queryKey: ["exam", userId, id],
    queryFn: () => getExamById(userId!, Number(id)),
    enabled: !!userId && !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Load previous answers
  useEffect(() => {
    if (examData?.ChoosedAnswer?.length) {
      const prevAnswers: SelectedAnswersType = {};
      examData.ChoosedAnswer.forEach((item) => {
        if (item.QueID && item.AnsID) {
          prevAnswers[item.QueID] = item.AnsID;
        }
      });
      setSelectedAnswers(prevAnswers);
    }
  }, [examData?.ChoosedAnswer]);

  // Scroll handler
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const questions = useMemo(
    () => examData?.Questions || [],
    [examData?.Questions]
  );
  const answers = useMemo(() => examData?.Answers || [], [examData?.Answers]);
  const examInfo = useMemo(
    () => examData?.ExamInfo || [],
    [examData?.ExamInfo]
  );

  const displayQuestions = useMemo(() => {
    if (!requestedCount) return questions;
    const count = parseInt(requestedCount);
    if (isNaN(count) || count <= 0) return questions;
    return questions.slice(0, count);
  }, [questions, requestedCount]);

  const answersByQuestion = useMemo(() => {
    const map = new Map<number, Answer[]>();
    answers.forEach((answer) => {
      const qid = answer.question_id;
      if (qid !== null) {
        if (!map.has(qid)) map.set(qid, []);
        map.get(qid)!.push(answer);
      }
    });
    return map;
  }, [answers]);

  const matchingData = useMemo(() => {
    const questions = answers.filter(
      (q): q is Answer & { refid: number } =>
        q.ref_child_id !== -1 &&
        q.ref_child_id !== null &&
        typeof q.refid === "number"
    );
    const answersList = answers.filter(
      (a): a is Answer & { refid: number } =>
        a.ref_child_id === -1 && typeof a.refid === "number"
    );
    return { questions, answers: answersList };
  }, [answers]);

  const getAnswersForQuestion = useCallback(
    (questionId: number) => answersByQuestion.get(questionId) || [],
    [answersByQuestion]
  );

  const saveAnswerToAPI = useCallback(
    async (
      questionId: number,
      answerId: number | number[] | string | Record<string, string> | null,
      queTypeId: number
    ) => {
      if (!userId || !id) return;
      try {
        let answerIdValue: number = 0;
        let answerText = "";

        if (queTypeId === 1) {
          answerIdValue = (answerId as number) || 0;
        } else if (queTypeId === 2 || queTypeId === 3) {
          answerIdValue =
            Array.isArray(answerId) && answerId.length > 0 ? answerId[0] : 0;
        } else if (queTypeId === 4) {
          answerText = typeof answerId === "string" ? answerId : "";
          answerIdValue = 0;
        } else if (queTypeId === 5 || queTypeId === 6) {
          answerText = JSON.stringify(answerId);
          answerIdValue = 0;
        }

        await saveExamAnswer(
          Number(userId),
          Number(id),
          questionId,
          answerIdValue,
          queTypeId,
          answerText,
          1
        );
      } catch (error) {
        console.error("❌ Error saving answer:", error);
      }
    },
    [userId, id]
  );

  const debouncedSaveToAPI = useCallback(
    (questionId: number, answerId: any, queTypeId: number) => {
      const existingTimeout = saveQueueRef.current.get(questionId);
      if (existingTimeout) clearTimeout(existingTimeout);

      const timeout = setTimeout(() => {
        saveAnswerToAPI(questionId, answerId, queTypeId);
        saveQueueRef.current.delete(questionId);
      }, 800);

      saveQueueRef.current.set(questionId, timeout);
    },
    [saveAnswerToAPI]
  );

  const handleSingleAnswerChange = useCallback(
    (qid: number, answerId: number | null) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerId }));
      const question = questions.find((q) => q.question_id === qid);
      if (question && answerId !== null) {
        debouncedSaveToAPI(qid, answerId, question.que_type_id);
      }
    },
    [questions, debouncedSaveToAPI]
  );

  const handleMultiAnswerChange = useCallback(
    (qid: number, answerIds: number[]) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerIds }));
      const question = questions.find((q) => q.question_id === qid);
      if (question) debouncedSaveToAPI(qid, answerIds, question.que_type_id);
    },
    [questions, debouncedSaveToAPI]
  );

  const handleFillInTheBlankChange = useCallback(
    (qid: number, answerText: string) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerText }));
      const question = questions.find((q) => q.question_id === qid);
      if (question) debouncedSaveToAPI(qid, answerText, question.que_type_id);
    },
    [questions, debouncedSaveToAPI]
  );

  const handleDragDropChange = useCallback(
    (qid: number, orderedIds: any) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: orderedIds }));
      const question = questions.find((q) => q.question_id === qid);
      if (question) saveAnswerToAPI(qid, orderedIds, question.que_type_id);
    },
    [questions, saveAnswerToAPI]
  );

  const handleJumpToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
    if (questionContainerRef.current) {
      questionContainerRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const toggleBookmark = useCallback((qid: number) => {
    setBookmarks((prev) =>
      prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid]
    );
  }, []);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < displayQuestions.length - 1) {
      handleJumpToQuestion(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, displayQuestions.length, handleJumpToQuestion]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      handleJumpToQuestion(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex, handleJumpToQuestion]);

  // ✅ Proctor handlers
  const handleSubmitExam = useCallback(async () => {
    if (!examInfo.length) return;

    try {
      const response = await finishExam(Number(userId), examInfo[0]);

      if (!isExamSubmitSuccess(response)) {
        throw new Error("Шалгалт дуусгахад алдаа гарлаа");
      }

      const testId = getTestIdFromResponse(response);
      if (!testId) throw new Error("Test ID олдсонгүй");

      setTestId(testId);

      toast.success("✅ Сорил амжилттай дууслаа", {
        duration: 2000,
      });

      setTimeout(() => {
        router.push(`/examdetail/${testId}-${id}`);
      }, 2000);
    } catch (error) {
      console.error("❌ Submit failed:", error);
      toast.error("Сорил дуусгахад алдаа гарлаа");
    }
  }, [examInfo, userId, id, router, setTestId]);

  const handleLogout = useCallback(() => {
    router.push("/home");
  }, [router]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      saveQueueRef.current.forEach((timeout) => clearTimeout(timeout));
      saveQueueRef.current.clear();
    };
  }, []);

  const answeredQuestionsCount = useMemo(() => {
    return Object.keys(selectedAnswers).filter((key) => {
      const answer = selectedAnswers[Number(key)];
      if (answer === null || answer === undefined) return false;
      if (typeof answer === "string") return answer.trim().length > 0;
      if (Array.isArray(answer)) return answer.length > 0;
      if (typeof answer === "object") return Object.keys(answer).length > 0;
      return true;
    }).length;
  }, [selectedAnswers]);

  const currentQuestion = displayQuestions[currentQuestionIndex];
  const isCurrentAnswered =
    currentQuestion && !!selectedAnswers[currentQuestion.question_id];

  const examInfoCard = useMemo(() => {
    if (!examInfo.length) return null;
    const info = examInfo[0];

    return (
      <div className="p-4 rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 shadow-sm">
        <h1 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {info.title}
        </h1>
        {info.descr && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
            {info.descr}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          <div className="px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg backdrop-blur-sm">
            <span className="mr-1">📝</span>
            <span className="font-semibold">
              {displayQuestions.length}
            </span>{" "}
            асуулт
          </div>
          <div className="px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg backdrop-blur-sm">
            <span className="mr-1">📊</span>
            <span className="font-semibold">{info.exam_type_name}</span>
          </div>
          <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/40 rounded-lg backdrop-blur-sm">
            <span className="mr-1">⏱️</span>
            <span className="font-semibold text-green-700 dark:text-green-300">
              Хугацаагүй
            </span>
          </div>
        </div>
      </div>
    );
  }, [examInfo, displayQuestions.length]);

  if (!examInfo.length) return null;

  return (
    <>
      {/* ✅ Exam Proctor Component */}
      <AdvancedExamProctor
        onSubmit={handleSubmitExam}
        onLogout={handleLogout}
        maxViolations={3}
        enableWebcam={false}
        strictMode={true}
        enableFullscreen={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-16 lg:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b shadow-sm">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                  ⏱️ Хугацаа хязгааргүй
                </span>
              </div>
              <SubmitExamButtonWithDialog
                userId={Number(userId)}
                startEid={examInfo[0].start_eid}
                examTime={examInfo[0].minut || 0}
                examInfo={examInfo[0]}
                totalQuestions={displayQuestions.length}
                answeredQuestions={answeredQuestionsCount}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">
                  Асуулт {currentQuestionIndex + 1}/{displayQuestions.length}
                </span>
                <span className="text-muted-foreground">
                  {answeredQuestionsCount} хариулсан
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / displayQuestions.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-4 p-4 max-w-[1800px] mx-auto">
          <aside className="w-64 flex-shrink-0 space-y-4">
            <div className="sticky top-4 space-y-4">
              <MiniMap
                questions={displayQuestions}
                choosedAnswers={selectedAnswers as Record<number, number>}
                bookmarks={bookmarks}
                currentQuestionIndex={currentQuestionIndex}
                onJump={(qid) => {
                  const element = document.getElementById(
                    `question-container-${qid}`
                  );
                  if (element) {
                    const yOffset = -80;
                    const y =
                      element.getBoundingClientRect().top +
                      window.pageYOffset +
                      yOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }}
              />
              <SubmitExamButtonWithDialog
                userId={Number(userId)}
                startEid={examInfo[0].start_eid}
                examTime={examInfo[0].minut || 0}
                examInfo={examInfo[0]}
                totalQuestions={displayQuestions.length}
                answeredQuestions={answeredQuestionsCount}
              />
            </div>
          </aside>

          <main className="flex-1 min-w-0 space-y-4">
            {examInfoCard}
            {displayQuestions.map((question, index) => (
              <QuestionItem
                key={question.question_id}
                question={question}
                questionNumber={index + 1}
                answers={getAnswersForQuestion(question.question_id)}
                selectedAnswer={selectedAnswers[question.question_id]}
                isBookmarked={bookmarks.includes(question.question_id)}
                onToggleBookmark={toggleBookmark}
                onSingleAnswerChange={handleSingleAnswerChange}
                onMultiAnswerChange={handleMultiAnswerChange}
                onFillInTheBlankChange={handleFillInTheBlankChange}
                onDragDropChange={handleDragDropChange}
                matchingData={matchingData}
                examId={Number(id)}
                userId={Number(userId)}
                saveAnswerToAPI={saveAnswerToAPI}
              />
            ))}
          </main>

          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-4 p-4 rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-sm">
              <div className="text-center space-y-2">
                <div className="text-4xl">⏱️</div>
                <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Хугацаа хязгааргүй
                </div>
                <p className="text-xs text-muted-foreground">
                  Та өөрийн хурдаар асуултуудыг хариулна уу
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden px-3 py-3" ref={questionContainerRef}>
          <div className="space-y-3">
            {examInfoCard}
            {currentQuestion && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-md">
                <QuestionItem
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  answers={getAnswersForQuestion(currentQuestion.question_id)}
                  selectedAnswer={selectedAnswers[currentQuestion.question_id]}
                  isBookmarked={bookmarks.includes(currentQuestion.question_id)}
                  onToggleBookmark={toggleBookmark}
                  onSingleAnswerChange={handleSingleAnswerChange}
                  onMultiAnswerChange={handleMultiAnswerChange}
                  onFillInTheBlankChange={handleFillInTheBlankChange}
                  onDragDropChange={handleDragDropChange}
                  matchingData={matchingData}
                  examId={Number(id)}
                  userId={Number(userId)}
                  saveAnswerToAPI={saveAnswerToAPI}
                  isMobile
                />
              </div>
            )}
            <MiniMap
              questions={displayQuestions}
              choosedAnswers={selectedAnswers as Record<number, number>}
              bookmarks={bookmarks}
              currentQuestionIndex={currentQuestionIndex}
              onJump={(qid) => {
                const index = displayQuestions.findIndex(
                  (q) => q.question_id === qid
                );
                if (index >= 0) handleJumpToQuestion(index);
              }}
            />
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t shadow-lg">
          <div className="px-3 py-2.5 flex gap-2">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1 h-11 font-medium disabled:opacity-40"
            >
              <ChevronLeft size={18} className="mr-1" />
              Өмнөх
            </Button>
            <Button
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === displayQuestions.length - 1}
              className={`flex-1 h-11 font-medium ${
                isCurrentAnswered
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              }`}
            >
              {currentQuestionIndex === displayQuestions.length - 1
                ? "🏁 Дуусгах"
                : "Дараах"}
              <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
        </nav>

        {/* Scroll to Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="md:hidden fixed bottom-[72px] right-4 z-30 p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-xl active:scale-95 transition-transform"
          >
            <ChevronUp size={20} />
          </button>
        )}
      </div>
    </>
  );
}

const QuestionItem = React.memo((props: any) => {
  const {
    question,
    questionNumber,
    answers,
    selectedAnswer,
    isBookmarked,
    onToggleBookmark,
    onSingleAnswerChange,
    onMultiAnswerChange,
    onFillInTheBlankChange,
    onDragDropChange,
    matchingData,
    examId,
    userId,
    saveAnswerToAPI,
    isMobile = false,
  } = props;

  return (
    <div
      id={`question-container-${question.question_id}`}
      className={
        isMobile
          ? "p-4"
          : "p-4 sm:p-6 border rounded-xl shadow-sm bg-white dark:bg-slate-900 scroll-mt-20"
      }
    >
      <div className="flex justify-between items-start gap-3 mb-4">
        <h2 className="flex-1 text-base sm:text-lg font-semibold min-w-0">
          {questionNumber}.{" "}
          <span
            dangerouslySetInnerHTML={{ __html: question.question_name }}
            className="[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
          />
        </h2>
        <button
          onClick={() => onToggleBookmark(question.question_id)}
          className={`p-2 rounded-lg flex-shrink-0 transition-all active:scale-95 ${
            isBookmarked
              ? "bg-yellow-400 text-white hover:bg-yellow-500 shadow-md"
              : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Flag size={18} className={isBookmarked ? "fill-current" : ""} />
        </button>
      </div>

      <div className="space-y-3">
        {question.que_type_id === 1 && (
          <SingleSelectQuestion
            questionId={question.question_id}
            questionText={question.question_name}
            answers={answers}
            mode="exam"
            selectedAnswer={selectedAnswer as number | null}
            onAnswerChange={onSingleAnswerChange}
          />
        )}

        {(question.que_type_id === 2 || question.que_type_id === 3) && (
          <MultiSelectQuestion
            questionId={question.question_id}
            questionText={question.question_name}
            answers={answers}
            mode="exam"
            selectedAnswers={
              Array.isArray(selectedAnswer) ? selectedAnswer : []
            }
            onAnswerChange={onMultiAnswerChange}
          />
        )}

        {question.que_type_id === 4 && (
          <FillInTheBlankQuestionShadcn
            questionId={question.question_id.toString()}
            questionText={question.question_name}
            onAnswerChange={(text: string) =>
              onFillInTheBlankChange(question.question_id, text)
            }
          />
        )}

        {question.que_type_id === 5 && (
          <DragAndDropWrapper
            answers={answers}
            questionId={question.question_id}
            examId={examId}
            userId={userId}
            mode="exam"
            onOrderChange={(orderedIds) => {
              onDragDropChange(question.question_id, orderedIds);
              saveAnswerToAPI(
                question.question_id,
                orderedIds,
                question.que_type_id
              );
            }}
          />
        )}

        {question.que_type_id === 6 && (
          <MatchingByLineWrapper
            questions={matchingData.questions as any}
            answers={matchingData.answers as any}
            questionId={question.question_id}
            examId={examId}
            userId={userId}
            onMatchChange={(matches) => {
              saveAnswerToAPI(
                question.question_id,
                matches,
                question.que_type_id
              );
            }}
          />
        )}
      </div>
    </div>
  );
});

QuestionItem.displayName = "QuestionItem";

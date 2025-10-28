"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SingleSelectQuestion from "@/components/question/sinleselect";
import MultiSelectQuestion from "@/components/question/multiselect";
import FillInTheBlankQuestionShadcn from "@/components/question/fillinblank";
import DragAndDropWrapper from "@/components/question/DragAndDropWrapper";
import MatchingByLineWrapper from "@/components/question/matchingWrapper";
import MiniMap from "@/app/exam/minimap";
import ITimer from "@/app/exam/itimer";
import SubmitExamButtonWithDialog from "@/components/question/Submit";
import { Flag } from "lucide-react";
import { getExamById, saveExamAnswer } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { ApiExamResponse, Question, Answer } from "@/types/exam";

type SelectedAnswersType = {
  [key: number]: number | number[] | string | Record<string, string> | null;
};

export default function SorilPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const userId = useAuthStore((s) => s.userId);
  const requestedCount = searchParams.get("count");

  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswersType>(
    {}
  );
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const saveQueueRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const { data: examData } = useQuery<ApiExamResponse>({
    queryKey: ["exam", userId, id],
    queryFn: () => getExamById(userId!, Number(id)),
    enabled: !!userId && !!id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (examData?.ChoosedAnswer && examData.ChoosedAnswer.length > 0) {
      const prevAnswers: SelectedAnswersType = {};
      examData.ChoosedAnswer.forEach((item) => {
        if (item.QueID && item.AnsID) {
          prevAnswers[item.QueID] = item.AnsID;
        }
      });
      setSelectedAnswers(prevAnswers);
    }
  }, [examData?.ChoosedAnswer]);

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

        console.log("✅ Answer saved successfully for question:", questionId);
      } catch (error) {
        console.error("❌ Error saving answer:", {
          questionId,
          queTypeId,
          error: error instanceof Error ? error.message : String(error),
        });
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
      }, 1500);

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

  const handleMatchingChange = useCallback(
    (qid: number, matches: any) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: matches }));
      const question = questions.find((q) => q.question_id === qid);
      if (question) saveAnswerToAPI(qid, matches, question.que_type_id);
    },
    [questions, saveAnswerToAPI]
  );

  const handleJumpToQuestion = useCallback((qid: number) => {
    const element = document.getElementById(`question-container-${qid}`);
    if (element) {
      const yOffset = -80; // Mobile дээр header-ийг тооцож
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  const toggleBookmark = useCallback((qid: number) => {
    setBookmarks((prev) =>
      prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid]
    );
  }, []);

  useEffect(() => {
    return () => {
      saveQueueRef.current.forEach((timeout, questionId) => {
        clearTimeout(timeout);
        const question = questions.find((q) => q.question_id === questionId);
        const answer = selectedAnswers[questionId];
        if (question && answer !== null && answer !== undefined) {
          saveAnswerToAPI(questionId, answer, question.que_type_id);
        }
      });
      saveQueueRef.current.clear();
    };
  }, [questions, selectedAnswers, saveAnswerToAPI]);

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

  const examInfoDisplay = useMemo(() => {
    if (examInfo.length === 0) return null;

    const info = examInfo[0];
    const actualQuestionCount = displayQuestions.length;

    return (
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded border border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">{info.title}</h1>
            {info.descr && (
              <p className="mb-2 text-sm sm:text-base text-muted-foreground">
                {info.descr}
              </p>
            )}
            {info.help && (
              <p className="text-xs sm:text-sm mb-2 text-muted-foreground">
                {info.help}
              </p>
            )}
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                Хугацаа: <span className="font-semibold">{info.minut}</span>{" "}
                минут
              </div>
              <div>
                Асуулт тоо:{" "}
                <span className="font-bold text-primary">
                  {actualQuestionCount}
                </span>
                {actualQuestionCount < info.que_cnt && (
                  <span className="text-muted-foreground">
                    {" "}
                    / {info.que_cnt}
                  </span>
                )}
              </div>
              <div>
                Төрөл:{" "}
                <span className="font-semibold">{info.exam_type_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [examInfo, displayQuestions.length]);

  return (
    <div className="min-h-screen pb-20 lg:pb-4">
      {/* Mobile дээр дээд хэсэгт MiniMap болон Timer */}
      <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-2 space-y-2">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <MiniMap
              questions={displayQuestions}
              choosedAnswers={selectedAnswers as Record<number, number>}
              bookmarks={bookmarks}
              onJump={handleJumpToQuestion}
            />
          </div>
          {examInfo.length > 0 && (
            <div className="flex-shrink-0">
              <ITimer
                durationMinutes={examInfo[0].minut}
                examName={examInfo[0].title}
                startTime={new Date()}
              />
            </div>
          )}
        </div>
        {examInfo.length > 0 && (
          <SubmitExamButtonWithDialog
            userId={Number(userId)}
            startEid={examInfo[0].start_eid}
            examTime={examInfo[0].minut || 0}
            examInfo={examInfo[0]}
            totalQuestions={displayQuestions.length}
            answeredQuestions={answeredQuestionsCount}
          />
        )}
      </div>

      {/* Desktop Layout */}
      <div className="flex flex-col lg:flex-row gap-4 p-2 sm:p-4">
        {/* Left Sidebar - Desktop only */}
        <div className="hidden lg:block lg:w-1/6 h-fit sticky top-4 self-start space-y-4">
          <MiniMap
            questions={displayQuestions}
            choosedAnswers={selectedAnswers as Record<number, number>}
            bookmarks={bookmarks}
            onJump={handleJumpToQuestion}
          />
          {examInfo.length > 0 && (
            <SubmitExamButtonWithDialog
              userId={Number(userId)}
              startEid={examInfo[0].start_eid}
              examTime={examInfo[0].minut || 0}
              examInfo={examInfo[0]}
              totalQuestions={displayQuestions.length}
              answeredQuestions={answeredQuestionsCount}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-4/6 space-y-4 sm:space-y-6">
          {examInfoDisplay}

          {displayQuestions.map((question) => (
            <QuestionItem
              key={question.question_id}
              question={question}
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
              debouncedSaveToAPI={debouncedSaveToAPI}
            />
          ))}
        </div>

        {/* Right Sidebar - Desktop only */}
        <div className="hidden lg:block lg:w-1/6 h-fit sticky top-4 self-start">
          {examInfo.length > 0 && (
            <ITimer
              durationMinutes={examInfo[0].minut}
              examName={examInfo[0].title}
              startTime={new Date()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const QuestionItem = React.memo(
  ({
    question,
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
    debouncedSaveToAPI,
  }: {
    question: Question;
    answers: Answer[];
    selectedAnswer: any;
    isBookmarked: boolean;
    onToggleBookmark: (qid: number) => void;
    onSingleAnswerChange: (qid: number, answerId: number | null) => void;
    onMultiAnswerChange: (qid: number, answerIds: number[]) => void;
    onFillInTheBlankChange: (qid: number, text: string) => void;
    onDragDropChange: (qid: number, orderedIds: any) => void;
    matchingData: { questions: Answer[]; answers: Answer[] };
    examId: number;
    userId: number;
    saveAnswerToAPI: (
      questionId: number,
      answerId: any,
      queTypeId: number
    ) => void;
    debouncedSaveToAPI: (
      questionId: number,
      answerId: any,
      queTypeId: number
    ) => void;
  }) => {
    const handleBookmarkClick = useCallback(() => {
      onToggleBookmark(question.question_id);
    }, [onToggleBookmark, question.question_id]);

    return (
      <div
        id={`question-container-${question.question_id}`}
        className="mb-4 sm:mb-6 p-3 sm:p-4 border rounded-lg shadow-sm bg-card scroll-mt-20 lg:scroll-mt-4"
      >
        <h2 className="flex justify-between items-start font-semibold mb-3 text-sm sm:text-base">
          <div className="flex-1 min-w-0 pr-2">
            <div dangerouslySetInnerHTML={{ __html: question.question_name }} />
          </div>

          <button
            onClick={handleBookmarkClick}
            className={`ml-2 p-2 rounded-md flex-shrink-0 transition-all active:scale-95 ${
              isBookmarked
                ? "bg-yellow-400 text-white hover:bg-yellow-500"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            title={isBookmarked ? "Bookmark хасах" : "Bookmark хийх"}
            type="button"
          >
            <Flag size={16} className={isBookmarked ? "fill-current" : ""} />
          </button>
        </h2>

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
              console.log("📊 Matching updated:", matches);
              saveAnswerToAPI(
                question.question_id,
                matches,
                question.que_type_id
              );
            }}
          />
        )}
      </div>
    );
  }
);

QuestionItem.displayName = "QuestionItem";

// app/soril/[id]/page.tsx - Auto-save with POST request

"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SingleSelectQuestion from "@/components/question/sinleselect";
import MultiSelectQuestion from "@/components/question/multiselect";
import FillInTheBlankQuestionShadcn from "@/components/question/fillinblank";
import DragAndDropWrapper from "@/components/question/DragAndDropWrapper";
import MatchingByLineWrapper from "@/components/question/matching";
import MiniMap from "@/app/exam/minimap";
import ITimer from "@/app/exam/itimer";
import { Flag } from "lucide-react";
import { getExamById } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { ApiExamResponse, Question, Answer } from "@/types/exam";

type SelectedAnswersType = {
  [key: number]: number | number[] | string | Record<string, string> | null;
};

export default function ExamPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const userId = useAuthStore((s) => s.userId);
  const requestedCount = searchParams.get("count");

  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswersType>(
    {}
  );
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const { data: examData } = useQuery<ApiExamResponse>({
    queryKey: ["exam", userId, id],
    queryFn: () => getExamById(userId!, Number(id)),
    enabled: !!userId && !!id,
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
  }, [examData]);

  const questions = useMemo(() => examData?.Questions || [], [examData]);
  const answers = useMemo(() => examData?.Answers || [], [examData]);
  const examInfo = useMemo(() => examData?.ExamInfo || [], [examData]);

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
        if (!map.has(qid)) {
          map.set(qid, []);
        }
        map.get(qid)!.push(answer);
      }
    });
    return map;
  }, [answers]);

  const matchingData = useMemo(() => {
    const questions = answers.filter(
      (q): q is Answer & { refid: number; question_id: number } =>
        q.ref_child_id !== -1 &&
        q.ref_child_id !== null &&
        typeof q.refid === "number" &&
        q.question_id !== null
    );
    const answersList = answers.filter(
      (a): a is Answer & { refid: number } =>
        a.ref_child_id === -1 && typeof a.refid === "number"
    );
    return { questions, answers: answersList };
  }, [answers]);

  const getAnswersForQuestion = useCallback(
    (questionId: number) => {
      return answersByQuestion.get(questionId) || [];
    },
    [answersByQuestion]
  );

  // Save answer to API with POST request
  const saveAnswerToAPI = useCallback(
    async (
      questionId: number,
      answerId: number | number[] | string | Record<string, string> | null,
      queTypeId: number
    ) => {
      if (!userId || !id) return;

      try {
        let answerIdValue: number | string = 0;
        let answerText = "";

        // Handle different answer types
        if (queTypeId === 1) {
          // Single select
          answerIdValue = (answerId as number) || 0;
        } else if (queTypeId === 2 || queTypeId === 3) {
          // Multi select - use first selected or 0
          answerIdValue =
            Array.isArray(answerId) && answerId.length > 0 ? answerId[0] : 0;
        } else if (queTypeId === 4) {
          // Fill in the blank
          answerText = typeof answerId === "string" ? answerId : "";
          answerIdValue = 0;
        } else if (queTypeId === 5 || queTypeId === 6) {
          // Drag and drop or Matching
          answerText = JSON.stringify(answerId);
          answerIdValue = 0;
        }

        const payload = {
          que_type_id: queTypeId,
          question_id: questionId,
          answer_id: answerIdValue,
          answer: answerText,
          row_num: 1,
          exam_id: Number(id),
          user_id: Number(userId),
          conn: {
            user: "edusr",
            password: "sql$erver43",
            database: "ikh_skuul",
            server: "172.16.1.79",
            pool: {
              max: 100000,
              min: 0,
              idleTimeoutMillis: 30000000,
            },
            options: {
              encrypt: false,
              trustServerCertificate: false,
            },
          },
        };

        const response = await fetch(
          "https://ottapp.ecm.mn/api/examchoosedanswer",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          console.error("Failed to save answer:", response.statusText);
        } else {
          console.log("Answer saved successfully for question:", questionId);
        }
      } catch (error) {
        console.error("Error saving answer:", {
          questionId,
          queTypeId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
    [userId, id]
  );

  const handleSingleAnswerChange = useCallback(
    (qid: number, answerId: number | null) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerId }));

      const question = questions.find((q) => q.question_id === qid);
      if (question && answerId !== null) {
        saveAnswerToAPI(qid, answerId, question.que_type_id);
      }
    },
    [questions, saveAnswerToAPI]
  );

  const handleMultiAnswerChange = useCallback(
    (qid: number, answerIds: number[]) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerIds }));

      const question = questions.find((q) => q.question_id === qid);
      if (question) {
        saveAnswerToAPI(qid, answerIds, question.que_type_id);
      }
    },
    [questions, saveAnswerToAPI]
  );

  const handleFillInTheBlankChange = useCallback(
    (qid: number, answerText: string) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerText }));

      const question = questions.find((q) => q.question_id === qid);
      if (question) {
        saveAnswerToAPI(qid, answerText, question.que_type_id);
      }
    },
    [questions, saveAnswerToAPI]
  );

  const handleDragDropChange = useCallback(
    (qid: number, orderedIds: any) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: orderedIds }));

      const question = questions.find((q) => q.question_id === qid);
      if (question) {
        saveAnswerToAPI(qid, orderedIds, question.que_type_id);
      }
    },
    [questions, saveAnswerToAPI]
  );

  const handleJumpToQuestion = useCallback((qid: number) => {
    document
      .getElementById(`question-container-${qid}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const toggleBookmark = useCallback((qid: number) => {
    setBookmarks((prev) =>
      prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid]
    );
  }, []);

  const examInfoDisplay = useMemo(() => {
    if (examInfo.length === 0) return null;

    const info = examInfo[0];
    const actualQuestionCount = displayQuestions.length;

    return (
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded border border-border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">{info.title}</h1>
            {info.descr && (
              <p className="mb-2 text-sm sm:text-base">{info.descr}</p>
            )}
            {info.help && (
              <p className="text-xs sm:text-sm mb-2">{info.help}</p>
            )}
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>Хугацаа: {info.minut} минут</div>
              <div>
                Асуулт тоо:{" "}
                <span className="font-bold text-blue-600">
                  {actualQuestionCount}
                </span>
                {actualQuestionCount < info.que_cnt && (
                  <span className="text-gray-500"> / {info.que_cnt}</span>
                )}
              </div>
              <div>Төрөл: {info.exam_type_name}</div>
              <div className="hidden sm:block">
                Эхлэх цаг: {new Date(info.end_time).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [examInfo, displayQuestions.length]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 sm:p-4">
      {/* MiniMap - Desktop only */}
      <div className="hidden lg:block lg:w-1/6 h-fit sticky top-4 self-start">
        <MiniMap
          questions={displayQuestions}
          choosedAnswers={selectedAnswers as Record<number, number>}
          bookmarks={bookmarks}
          onJump={handleJumpToQuestion}
        />
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
          />
        ))}
      </div>

      {/* Timer - Desktop only */}
      <div className="hidden lg:block lg:w-1/6 h-fit sticky top-4 self-start">
        {examInfo.length > 0 && (
          <ITimer
            durationMinutes={examInfo[0].minut}
            examName={examInfo[0].title}
            startTime={new Date()}
          />
        )}
      </div>

      {/* Mobile Timer - Fixed at bottom */}
      {examInfo.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 shadow-lg z-50">
          <ITimer
            durationMinutes={examInfo[0].minut}
            examName={examInfo[0].title}
            startTime={new Date()}
          />
        </div>
      )}
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
  }) => {
    const handleBookmarkClick = useCallback(() => {
      onToggleBookmark(question.question_id);
    }, [onToggleBookmark, question.question_id]);

    return (
      <div
        id={`question-container-${question.question_id}`}
        className="mb-4 sm:mb-6 p-3 sm:p-4 border rounded shadow-sm"
      >
        <h2 className="flex justify-between items-start font-semibold mb-2 text-sm sm:text-base">
          <div className="flex-1 min-w-0 pr-2">
            <div dangerouslySetInnerHTML={{ __html: question.question_name }} />
          </div>

          <button
            onClick={handleBookmarkClick}
            className={`ml-2 p-1 rounded flex-shrink-0 ${
              isBookmarked
                ? "bg-yellow-400 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            title={isBookmarked ? "Bookmark хасах" : "Bookmark хийх"}
          >
            <Flag size={14} />
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
            onOrderChange={(orderedIds) =>
              onDragDropChange(question.question_id, orderedIds)
            }
          />
        )}

        {question.que_type_id === 6 && (
          <MatchingByLineWrapper
            questions={matchingData.questions as any}
            answers={matchingData.answers as any}
          />
        )}
      </div>
    );
  }
);

QuestionItem.displayName = "QuestionItem";

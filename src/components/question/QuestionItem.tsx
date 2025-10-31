// ==========================================
// components/question/QuestionItem.tsx
// ==========================================
"use client";

import React, { useCallback } from "react";
import { Flag } from "lucide-react";
import SingleSelectQuestion from "@/components/question/sinleselect";
import MultiSelectQuestion from "@/components/question/multiselect";
import FillInTheBlankQuestionShadcn from "@/components/question/fillinblank";
import DragAndDropWrapper from "@/components/question/DragAndDropWrapper";
import MatchingByLineWrapper from "@/components/question/matchingWrapper";

export default React.memo(function QuestionItem(props: any) {
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

  const handleBookmarkClick = useCallback(() => {
    onToggleBookmark(question.question_id);
  }, [onToggleBookmark, question.question_id]);

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
          onClick={handleBookmarkClick}
          className={`p-2 rounded-lg flex-shrink-0 transition-all active:scale-95 ${
            isBookmarked
              ? "bg-yellow-400 text-white hover:bg-yellow-500 shadow-md"
              : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          aria-label={isBookmarked ? "Bookmark хасах" : "Bookmark хийх"}
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

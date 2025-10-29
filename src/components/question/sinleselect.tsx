"use client";

import React, { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";

interface AnswerData {
  answer_id: number;
  answer_name_html?: string;
  answer_img?: string;
  is_true?: boolean;
}

interface SingleSelectQuestionProps {
  questionId: number;
  questionText?: string;
  answers: AnswerData[];
  mode: "exam" | "review";
  selectedAnswer?: number | null;
  correctAnswerId?: number | null;
  onAnswerChange?: (questionId: number, answerId: number | null) => void;
}

function SingleSelectQuestion({
  questionId,
  questionText,
  answers,
  mode,
  selectedAnswer,
  correctAnswerId,
  onAnswerChange,
}: SingleSelectQuestionProps) {
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
      {answers.map((option) => {
        const isSelected = selectedAnswer === option.answer_id;
        const isCorrect =
          option.is_true || correctAnswerId === option.answer_id;

        const colorClass = isReviewMode
          ? isCorrect
            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
            : isSelected
            ? "border-red-500 bg-red-50 dark:bg-red-950/20"
            : "border-border bg-background"
          : isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-background hover:bg-accent";

        return (
          <Button
            key={option.answer_id}
            onClick={() => handleSelect(option.answer_id)}
            variant="outline"
            disabled={isReviewMode}
            className={`relative flex items-start gap-2.5 sm:gap-3 w-full justify-start p-3 sm:p-4 rounded-lg border transition-all h-auto min-h-[48px] ${colorClass} ${
              !isReviewMode ? "active:scale-[0.98]" : ""
            }`}
          >
            {/* Review mode icon */}
            {isReviewMode && (
              <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
                {isCorrect ? (
                  <CheckCircle2 className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                ) : isSelected ? (
                  <XCircle className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
                ) : null}
              </div>
            )}

            {/* Radio circle */}
            <span
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors
              ${
                isSelected
                  ? isReviewMode
                    ? isCorrect
                      ? "border-green-500 bg-green-500"
                      : "border-red-500 bg-red-500"
                    : "border-primary bg-primary"
                  : "border-muted-foreground/30 bg-background"
              }`}
            >
              {isSelected && <span className="w-2 h-2 bg-white rounded-full" />}
            </span>

            {/* Image if exists */}
            {option.answer_img && (
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 border rounded-md overflow-hidden bg-muted">
                <Image
                  src={option.answer_img}
                  alt={`Answer ${option.answer_id}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Answer text - FULLY EXPANDED */}
            <div
              className="flex-1 min-w-0 text-left text-sm sm:text-base pr-8"
              dangerouslySetInnerHTML={{
                __html: option.answer_name_html || "",
              }}
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                whiteSpace: "normal",
                display: "block",
                lineHeight: "1.6",
              }}
            />
          </Button>
        );
      })}
    </div>
  );
}

export default memo(SingleSelectQuestion);

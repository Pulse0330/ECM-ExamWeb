"use client";

import React, { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface AnswerData {
  answer_id: number;
  answer_name_html?: string;
  answer_img?: string;
}

interface SingleSelectQuestionProps {
  questionId: number;
  questionText?: string;
  answers: AnswerData[];
  mode: "exam" | "review";
  selectedAnswer?: number | null;
  onAnswerChange?: (questionId: number, answerId: number | null) => void;
}

function SingleSelectQuestion({
  questionId,
  questionText,
  answers,
  mode,
  selectedAnswer,
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
    <div className="space-y-4">
      <div className="space-y-3">
        {answers.map((option) => {
          const isSelected = selectedAnswer === option.answer_id;

          return (
            <Button
              key={option.answer_id}
              onClick={() => handleSelect(option.answer_id)}
              variant="outline"
              disabled={isReviewMode}
              className={`flex items-center gap-3 w-full justify-start text-left p-3 border rounded-md transition-colors
                ${isSelected ? "border-primary bg-primary/10" : "border-border"}
                ${isReviewMode ? "cursor-default opacity-70" : ""}
              `}
            >
              {/* Radio дугуй */}
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0
                  ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  }
                `}
              >
                {isSelected && (
                  <span className="w-2 h-2 bg-primary-foreground rounded-full" />
                )}
              </span>

              {/* Зураг */}
              {option.answer_img && (
                <img
                  src={option.answer_img}
                  alt={`Answer ${option.answer_id}`}
                  className="w-16 h-16 object-contain rounded border"
                />
              )}

              {/* Сонголтын текст */}
              <span
                dangerouslySetInnerHTML={{
                  __html: option.answer_name_html || "",
                }}
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(SingleSelectQuestion);

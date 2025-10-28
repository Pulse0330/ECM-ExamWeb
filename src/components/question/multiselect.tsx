"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ZoomIn } from "lucide-react";

interface AnswerData {
  answer_id: number;
  answer_name_html?: string;
  answer_img?: string;
  answer_type: number;
}

interface MultiSelectQuestionProps {
  questionId: number;
  questionText?: string;
  questionImage?: string | null;
  answers: AnswerData[];
  mode: "exam" | "review";
  selectedAnswers?: number[]; // ✅ props-аас ирдэг
  onAnswerChange?: (questionId: number, answerIds: number[]) => void;
  readOnly?: boolean; // ✅ review mode-д ашиглана
}

const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || url.trim() === "") return false;
  return url.startsWith("http") || url.startsWith("/");
};

export default function MultiSelectQuestion({
  questionId,
  questionText,
  questionImage,
  answers,
  mode,
  selectedAnswers: selectedAnswersProp = [],
  onAnswerChange,
  readOnly = false,
}: MultiSelectQuestionProps) {
  const [selectedAnswers, setSelectedAnswers] =
    useState<number[]>(selectedAnswersProp);
  const isReviewMode = mode === "review" || readOnly;

  // Props-аас ирсэн сонголтыг update хийх
  useEffect(() => {
    setSelectedAnswers(selectedAnswersProp);
  }, [selectedAnswersProp]);

  const handleToggle = useCallback(
    (answerId: number) => {
      if (isReviewMode) return;

      const newSelected = selectedAnswers.includes(answerId)
        ? selectedAnswers.filter((id) => id !== answerId)
        : [...selectedAnswers, answerId];

      setSelectedAnswers(newSelected);

      if (onAnswerChange) {
        onAnswerChange(questionId, newSelected);
      }
    },
    [questionId, selectedAnswers, isReviewMode, onAnswerChange]
  );

  const isSelected = (answerId: number) => selectedAnswers.includes(answerId);

  const renderQuestionContent = () => {
    const imageUrl = isValidImageUrl(questionImage) ? questionImage : null;

    if (!imageUrl) return null;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative mb-4 cursor-pointer hover:opacity-90 transition-opacity border rounded-md overflow-hidden group">
            <img
              src={imageUrl}
              alt={questionText || "Question"}
              className="w-full h-auto object-contain bg-gray-50 max-h-[300px]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] max-h-[90vh]">
          <VisuallyHidden>
            <DialogTitle>Асуултын зураг</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            <img
              src={imageUrl}
              alt={questionText || "Question"}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderOptionContent = (option: AnswerData) => {
    const imageUrl = isValidImageUrl(option.answer_img)
      ? option.answer_img
      : null;

    if (imageUrl) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <div
              className="cursor-pointer hover:opacity-90 transition-opacity rounded overflow-hidden border"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageUrl}
                alt={option.answer_name_html || "Option"}
                className="w-full h-auto object-contain max-h-[150px]"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] max-h-[90vh]">
            <VisuallyHidden>
              <DialogTitle>Сонголтын зураг</DialogTitle>
            </VisuallyHidden>
            <div className="space-y-4">
              <div className="relative w-full h-[70vh] flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={option.answer_name_html || "Option"}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              {option.answer_name_html && (
                <p
                  className="text-center text-lg font-medium"
                  dangerouslySetInnerHTML={{ __html: option.answer_name_html }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <span
        dangerouslySetInnerHTML={{
          __html: option.answer_name_html || "",
        }}
      />
    );
  };

  return (
    <div className="space-y-4">
      {renderQuestionContent()}

      <div className="space-y-3">
        {answers.map((option) => {
          const selected = isSelected(option.answer_id);
          const hasImage = isValidImageUrl(option.answer_img);

          return (
            <Button
              key={option.answer_id}
              onClick={() => handleToggle(option.answer_id)}
              variant="outline"
              disabled={isReviewMode}
              className={`flex items-center gap-3 w-full justify-start text-left p-3 border rounded-md transition-colors ${
                hasImage ? "h-auto min-h-[100px]" : "min-h-[50px]"
              } ${
                selected ? "border-primary bg-primary/10" : "border-border"
              } ${isReviewMode ? "cursor-default opacity-70" : ""}`}
            >
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  hasImage ? "self-start mt-2" : ""
                } ${
                  selected
                    ? "border-primary bg-primary"
                    : "border-border bg-background"
                }`}
              >
                {selected && (
                  <svg
                    className="w-3 h-3 text-primary-foreground"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>

              <div className="flex-1">{renderOptionContent(option)}</div>
            </Button>
          );
        })}
      </div>

      {selectedAnswers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedAnswers.length} сонголт сонгосон
        </div>
      )}
    </div>
  );
}

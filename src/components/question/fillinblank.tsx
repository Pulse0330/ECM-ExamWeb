"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";

interface FillInTheBlankQuestionProps {
  questionId: string;
  questionText: string;
  correctAnswer?: string; // Зөв хариулт (review mode-д)
  value?: string; // Хэрэглэгчийн хариулт
  readOnly?: boolean; // Review mode
  mode?: "exam" | "review"; // Режим
  userAnswer?: string;
  onAnswerChange?: (answerText: string) => void; // Хариулт хадгалах callback
}

export default function FillInTheBlankQuestionShadcn({
  questionId,
  questionText,
  correctAnswer,
  value = "",
  readOnly = false,
  mode = "exam",
  onAnswerChange,
}: FillInTheBlankQuestionProps) {
  const [answer, setAnswer] = useState<string>(value);

  // value өөрчлөгдөхөд шинэчлэх
  useEffect(() => {
    setAnswer(value);
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;

    const newAnswer = event.target.value;
    setAnswer(newAnswer);

    if (onAnswerChange) {
      onAnswerChange(newAnswer);
    }

    console.log(`Question ${questionId}: Answer set to "${newAnswer}"`);
  };

  // Review mode-д зөв эсвэл буруу эсэхийг шалгах
  const isCorrect =
    mode === "review" && correctAnswer
      ? answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
      : null;

  const TEXT_COLOR_CLASS =
    mode === "exam" ? "text-indigo-600" : "text-gray-700";
  const INPUT_COLOR_CLASS =
    mode === "exam"
      ? "border-indigo-500 focus-visible:ring-indigo-600"
      : isCorrect === true
      ? "border-green-500 bg-green-50"
      : isCorrect === false
      ? "border-red-500 bg-red-50"
      : "border-gray-300 bg-gray-50";

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-sm ">
      <div className="grid w-full items-center gap-2">
        <Label
          htmlFor={`input-${questionId}`}
          className={`text-sm font-medium ${TEXT_COLOR_CLASS}`}
        >
          {mode === "exam" ? "Хариултаа бичнэ үү:" : "Таны хариулт:"}
        </Label>

        <div className="relative">
          <Input
            type="text"
            id={`input-${questionId}`}
            placeholder={readOnly ? "" : "Таны хариулт..."}
            value={answer}
            onChange={handleChange}
            readOnly={readOnly}
            disabled={readOnly}
            className={`w-full transition-colors ${INPUT_COLOR_CLASS} ${
              readOnly ? "cursor-not-allowed" : ""
            }`}
          />

          {/* Review mode-д зөв/буруу icon */}
          {mode === "review" && isCorrect !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
          )}
        </div>

        {/* Review mode-д зөв хариулт харуулах */}
        {mode === "review" && isCorrect === false && correctAnswer && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Зөв хариулт:</span>{" "}
              {correctAnswer}
            </p>
          </div>
        )}

        {/* Review mode-д зөв хариулт өгсөн үед баяр хүргэх */}
        {mode === "review" && isCorrect === true && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium">✓ Зөв хариулт!</p>
          </div>
        )}
      </div>
    </div>
  );
}

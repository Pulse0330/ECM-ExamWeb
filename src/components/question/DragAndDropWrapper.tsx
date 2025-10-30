"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import DragAndDrop from "./DragAndDrop";
import { CheckCircle2, XCircle } from "lucide-react";

interface Answer {
  answer_id: number;
  answer_name_html: string;
}

interface DragAndDropWrapperProps {
  questionId: number;
  examId?: number;
  userId?: number;
  answers: Answer[];
  mode: "exam" | "review";
  userAnswers?: number[];
  correctAnswers?: number[];
  readOnly?: boolean;
  onOrderChange?: (orderedIds: number[]) => void;
}

export default function DragAndDropWrapper({
  questionId,
  examId,
  userId,
  answers,
  mode,
  userAnswers = [],
  correctAnswers = [],
  onOrderChange,
}: DragAndDropWrapperProps) {
  const [items, setItems] = useState<Answer[]>(answers);

  // Шалгалт өгсөн хариултаар эрэмбэлэх
  useEffect(() => {
    if (mode === "review" && userAnswers.length > 0) {
      const sorted = userAnswers
        .map((id) => answers.find((a) => a.answer_id === id))
        .filter(Boolean) as Answer[];
      setItems(sorted);
    } else {
      setItems(answers);
    }
  }, [answers, userAnswers, mode]);

  // Drag хийсний дараа callback дуудах
  const handleOrderChange = useCallback(
    (orderedIds: number[]) => {
      if (mode === "exam") {
        onOrderChange?.(orderedIds);
      }
    },
    [onOrderChange, mode]
  );

  // 🔥 Review mode-д зөв/буруу тоолох
  const reviewStats = useMemo(() => {
    if (mode !== "review") return null;

    let correct = 0;
    let wrong = 0;

    items.forEach((item, index) => {
      if (correctAnswers[index] === item.answer_id) {
        correct++;
      } else {
        wrong++;
      }
    });

    return { correct, wrong, total: items.length };
  }, [items, correctAnswers, mode]);

  // 🔥 Зөв дараалал бүтээх
  const correctOrderedAnswers = useMemo(() => {
    if (mode !== "review" || correctAnswers.length === 0) return [];

    return correctAnswers
      .map((id) => answers.find((a) => a.answer_id === id))
      .filter(Boolean) as Answer[];
  }, [correctAnswers, answers, mode]);

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      {mode === "review" && reviewStats && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm sm:text-base">
              Дарааллын үр дүн
            </h4>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                {reviewStats.correct}
              </span>
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                <XCircle className="w-4 h-4" />
                {reviewStats.wrong}
              </span>
            </div>
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-300">
            {reviewStats.total > 0
              ? `Нийт ${reviewStats.total} элементээс ${reviewStats.correct} зөв байрлуулсан`
              : "Хариулаагүй"}
          </p>
        </div>
      )}

      {/* User's Answer */}
      <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 space-y-3">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
          {mode === "exam"
            ? "Зөв дараалалд оруулна уу:"
            : "Таны өгсөн дараалал:"}
        </h3>

        <DragAndDrop
          answers={items}
          onOrderChange={handleOrderChange}
          disabled={mode === "review"}
          showCorrect={mode === "review"}
          correctIds={correctAnswers}
        />

        {mode === "review" && (
          <div className="mt-4 space-y-2 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Зөв байрлалд байгаа хариулт</span>
            </div>
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>Буруу байрлалд байгаа хариулт</span>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 Зөв дараалал харуулах */}
      {mode === "review" && correctOrderedAnswers.length > 0 && (
        <div className="p-4 border-2 border-green-500 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-950/20 space-y-3">
          <h3 className="font-semibold text-base sm:text-lg text-green-900 dark:text-green-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Зөв дараалал:
          </h3>

          <div className="space-y-2">
            {correctOrderedAnswers.map((answer, index) => (
              <div
                key={answer.answer_id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-300 dark:border-green-700 transition-all hover:shadow-md"
              >
                {/* Number Badge */}
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 dark:bg-green-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {index + 1}
                </span>

                {/* Answer Content */}
                <div
                  className="flex-1 text-sm text-gray-900 dark:text-gray-100"
                  dangerouslySetInnerHTML={{
                    __html: answer.answer_name_html,
                  }}
                />

                {/* Checkmark */}
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              </div>
            ))}
          </div>

          <div className="text-xs text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/30 p-2 rounded">
            💡 Энэ бол зөв дараалал юм. Таны хариултыг дээрх хэсэгтэй харьцуулна
            уу.
          </div>
        </div>
      )}
    </div>
  );
}

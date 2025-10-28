"use client";

import React, { useState, useEffect, useCallback } from "react";
import DragAndDrop from "./DragAndDrop";

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

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white space-y-3">
      <h3 className="font-semibold text-base sm:text-lg">
        {mode === "exam" ? "Зөв дараалалд оруулна уу:" : "Таны өгсөн дараалал:"}
      </h3>

      <DragAndDrop
        answers={items}
        onOrderChange={handleOrderChange}
        disabled={mode === "review"}
        showCorrect={mode === "review"}
        correctIds={correctAnswers}
      />

      {mode === "review" && (
        <div className="mt-3 text-sm text-gray-600">
          <p>✅ Ногоон — зөв байрлалд байгаа хариулт</p>
          <p>❌ Улаан — буруу байрлалд байгаа хариулт</p>
        </div>
      )}
    </div>
  );
}

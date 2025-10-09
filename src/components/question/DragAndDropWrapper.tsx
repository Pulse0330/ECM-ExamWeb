"use client";

import React, { useState, useEffect } from "react";
import DragAndDrop from "./DragAndDrop";
interface Answer {
  answer_id: number;
  answer_name_html: string;
  answer_descr?: string; // "Асуулт" эсвэл "Хариулт"
}

interface DragAndDropWrapperProps {
  answers: Answer[];
  onOrderChange?: (orderedIds: number[]) => void;
}

export default function DragAndDropWrapper({
  answers,
  onOrderChange,
}: DragAndDropWrapperProps) {
  const [questions, setQuestions] = useState<Answer[]>([]);
  const [answersList, setAnswersList] = useState<Answer[]>([]);

  useEffect(() => {
    const questionItems = answers.filter((a) => a.answer_descr === "Асуулт");
    const answerItems = answers.filter((a) => a.answer_descr === "Хариулт");

    setQuestions(questionItems);
    setAnswersList(answerItems);
  }, [answers]);

  return (
    <div>
      <h3 className="font-semibold mb-2">Асуултууд</h3>
      <DragAndDrop answers={questions} />

      <h3 className="font-semibold mb-2 mt-4">Хариултууд</h3>
      <DragAndDrop answers={answersList} />

      {/* Drag-and-drop дараалал өөрчлөгдөх үед гадагш мэдэгдэнэ */}
      {onOrderChange && (
        <div className="mt-4">
          <button
            onClick={() =>
              onOrderChange(
                [...questions, ...answersList].map((a) => a.answer_id)
              )
            }
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Дарааллыг хадгалах
          </button>
        </div>
      )}
    </div>
  );
}

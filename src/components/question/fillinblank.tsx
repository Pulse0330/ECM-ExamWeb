"use client";

import React, { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FillInTheBlankQuestionProps {
  questionId: string;
  questionText: string;
  onAnswerChange?: (answerText: string) => void; // Fill-in-the-Blank хариулт хадгалах callback
}

export default function FillInTheBlankQuestionShadcn({
  questionId,
  questionText,
}: FillInTheBlankQuestionProps) {
  const [answer, setAnswer] = useState<string>("");

  const TEXT_COLOR_CLASS = "text-indigo-600";
  const INPUT_COLOR_CLASS = "border-indigo-500 focus-visible:ring-indigo-600";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newAnswer = event.target.value;
    setAnswer(newAnswer);
    console.log(`Question ${questionId}: Answer set to "${newAnswer}"`);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-sm">
      <div className="grid w-full items-center gap-2">
        <Label
          htmlFor={`input-${questionId}`}
          className="text-sm text-gray-700"
        >
          Хариултаа бичнэ үү:
        </Label>
        <Input
          type="text"
          id={`input-${questionId}`}
          placeholder="Таны хариулт..."
          value={answer}
          onChange={handleChange}
          className={`w-full ${INPUT_COLOR_CLASS}`}
        />
      </div>
    </div>
  );
}

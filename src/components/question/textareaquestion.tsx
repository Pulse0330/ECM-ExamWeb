"use client";

import React, { useState, ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EssayQuestionProps {
  questionId: string;
  questionText: string;
  rows?: number;
}

export default function EssayQuestionShadcn({
  questionId,
  questionText,
  rows = 4,
}: EssayQuestionProps) {
  const [answer, setAnswer] = useState<string>("");

  const TEXT_COLOR_CLASS = "text-amber-700";
  const BG_COLOR_CLASS = "bg-amber-50";
  const INPUT_COLOR_CLASS = "border-amber-500 focus-visible:ring-amber-600";

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = event.target.value;
    setAnswer(newAnswer);

    console.log(
      `Question ${questionId}: Essay Answer set. Length: ${newAnswer.length}`
    );
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-sm">
      <p
        className={`font-semibold text-lg ${TEXT_COLOR_CLASS} ${BG_COLOR_CLASS} p-2 rounded-md`}
      >
        {questionText} (Чөлөөт хариулт)
      </p>

      <div className="grid w-full gap-2">
        <Label
          htmlFor={`essay-input-${questionId}`}
          className="text-sm text-gray-700"
        >
          Хариултаа дэлгэрэнгүй бичнэ үү:
        </Label>
        <Textarea
          id={`essay-input-${questionId}`}
          placeholder="Дор хаяж 50 үгтэй дэлгэрэнгүй тайлбар..."
          value={answer}
          onChange={handleChange}
          rows={rows}
          className={`w-full ${INPUT_COLOR_CLASS}`}
        />
      </div>
    </div>
  );
}

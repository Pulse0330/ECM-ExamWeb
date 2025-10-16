// src/components/question/MatchingByLineWrapper.tsx

"use client";

import dynamic from "next/dynamic";
import React from "react";

interface QuestionItem {
  refid: number;
  answer_id: number;
  question_id: number | null;
  answer_name_html: string;
  answer_descr: string;
  answer_img: string | null;
  ref_child_id: number | null;
}

interface MatchingByLineProps {
  questions: QuestionItem[];
  answers: QuestionItem[];
  onMatchChange?: (matches: Record<number, number>) => void;
}

const MatchingByLineNoSSR = dynamic<MatchingByLineProps>(
  () =>
    import("./matching") as unknown as Promise<
      React.ComponentType<MatchingByLineProps>
    >,
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          padding: 20,
          minHeight: 400,
          textAlign: "center",
          color: "#999",
          border: "1px dashed #ccc",
        }}
      ></div>
    ),
  }
);

export default function MatchingByLineWrapper({
  questions,
  answers,
  onMatchChange,
}: MatchingByLineProps) {
  return (
    <MatchingByLineNoSSR
      questions={questions}
      answers={answers}
      onMatchChange={onMatchChange}
    />
  );
}

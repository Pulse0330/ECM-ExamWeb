"use client";

import dynamic from "next/dynamic";
import React from "react";

interface MatchingByLineProps {
  questions: any[];
  answers: any[];
  onMatchChange?: (matches: Record<string, string>) => void; // шинэ prop
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
        }}
      >
        Зураасаар холбох даалгавар ачаалж байна...
      </div>
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

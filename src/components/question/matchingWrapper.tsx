"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useRef, useEffect, useState } from "react";
import { saveExamAnswer } from "@/lib/api";

export interface QuestionItem {
  refid: number;
  answer_id: number;
  question_id: number | null;
  answer_name_html: string;
  answer_descr: string;
  answer_img: string | null;
  ref_child_id: number | null;
}

export interface MatchingByLineBaseProps {
  questions: QuestionItem[];
  answers: QuestionItem[];
  onMatchChange?: (matches: Record<number, number>) => void;
}

export interface MatchingByLineWrapperProps extends MatchingByLineBaseProps {
  questionId: number;
  examId: number;
  userId: number;
}

const MatchingByLineNoSSR = dynamic<MatchingByLineBaseProps>(
  () => import("./matching").then((mod) => mod.default) as any,
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
      >
        Ачааллаж байна...
      </div>
    ),
  }
);

export default function MatchingByLineWrapper({
  questions,
  answers,
  onMatchChange,
  questionId,
  examId,
  userId,
}: MatchingByLineWrapperProps) {
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMatchesRef = useRef<string>("");
  const isSavingRef = useRef(false);

  const saveToAPI = useCallback(
    async (matches: Record<number, number>) => {
      if (Object.keys(matches).length === 0) {
        console.log("⏭️ Skipping empty matches");
        return;
      }

      setIsSaving(true);

      try {
        const answerText = JSON.stringify(matches);

        console.log("💾 Saving to API:", {
          questionId,
          examId,
          userId,
          matches,
        });

        await saveExamAnswer(userId, examId, questionId, 0, 6, answerText, 1);

        console.log("✅ Matching answer saved successfully");
        onMatchChange?.(matches);
      } catch (error) {
        console.error("❌ Error saving matching answer:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [questionId, examId, userId, onMatchChange]
  );

  const handleMatchChange = useCallback(
    (matches: Record<number, number>) => {
      const matchesStr = JSON.stringify(matches);

      if (prevMatchesRef.current === matchesStr) {
        console.log("⏭️ Skipping duplicate match change");
        return;
      }

      if (isSavingRef.current) {
        console.log("⏳ Already saving, queueing new save...");
      }

      console.log("📝 Match changed:", matches);
      prevMatchesRef.current = matchesStr;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        isSavingRef.current = true;
        saveToAPI(matches).finally(() => {
          isSavingRef.current = false;
        });
      }, 2000);
    },
    [saveToAPI]
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {isSaving && (
        <div className="absolute top-0 right-0 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm z-10">
          Хадгалж байна...
        </div>
      )}
      <MatchingByLineNoSSR
        questions={questions}
        answers={answers}
        onMatchChange={handleMatchChange}
      />
    </div>
  );
}

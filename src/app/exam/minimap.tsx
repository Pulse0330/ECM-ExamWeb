"use client";

import { Flag } from "lucide-react";

export default function MiniMap({
  questions,
  choosedAnswers,
  bookmarks,
  onJump,
}: {
  questions: any[];
  choosedAnswers: Record<number, number>;
  bookmarks: number[];
  onJump: (qid: number) => void;
}) {
  return (
    <div className="grid grid-cols-10 gap-1 border p-2 rounded">
      {questions.map((q, idx) => {
        const answered = !!choosedAnswers[q.question_id]; // хариулсан эсэх
        const isBookmarked = bookmarks.includes(q.question_id);

        return (
          <div
            key={q.question_id}
            className={`relative p-1.5 rounded cursor-pointer border text-center
              ${
                answered
                  ? "bg-green-500 text-white" // хариулсан бол ногоон
                  : "border text-gray-800 dark:text-gray-200 dark:border-gray-600"
              }`}
            onClick={() => onJump(q.question_id)}
          >
            <span>{idx + 1}</span>

            {/* Bookmark хийсэн үед flag icon гаргах */}
            {isBookmarked && (
              <span className="absolute top-0 right-0 p-1">
                <Flag
                  size={12}
                  className="fill-current text-yellow-500 transition-colors duration-200"
                />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

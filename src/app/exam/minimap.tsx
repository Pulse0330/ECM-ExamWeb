// app/soril/[id]/page.tsx доторх MiniMap компонент

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
        // ... (хувьсагчид хэвээр)
        const answered = !!choosedAnswers[q.question_id];
        const isBookmarked = bookmarks.includes(q.question_id);

        return (
          <div
            key={q.question_id}
            // ✅ ЗАСВАР: Flexbox-ийг нэмж, агуулгыг төвлөрүүлнэ.
            className={`relative p-1.5 rounded cursor-pointer border
              flex items-center justify-center // ✨ ЭНЭ ХЭСГИЙГ НЭМСЭН
              ${
                answered
                  ? "bg-green-500 text-white"
                  : "border text-gray-800 dark:text-gray-200 dark:border-gray-600"
              }`}
            onClick={() => onJump(q.question_id)}
          >
            {/* ✅ Асуултын дугаарыг төвлөрүүлнэ. */}
            {/* Text-center-ийн оронд Flex ашиглаж байгаа тул энэ нь төвд баталгаатай байна. */}
            <span className="text-sm font-medium">{idx + 1}</span>

            {/* Bookmark хийсэн үед flag icon гаргах */}
            {isBookmarked && (
              <span className="absolute top-0 right-0 p-1">
                <Flag
                  size={12}
                  // Flag-ийг жижигрүүлж, дугаартай давхцахаас сэргийлсэн.
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

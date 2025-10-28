"use client";

import { Flag, Map } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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
  const [open, setOpen] = useState(false);

  const MapContent = () => (
    <div className="flex flex-wrap gap-1.5 p-2 rounded justify-center">
      {questions.map((q, idx) => {
        const answered = !!choosedAnswers[q.question_id];
        const isBookmarked = bookmarks.includes(q.question_id);

        return (
          <div
            key={q.question_id}
            className={`relative size-11 md:size-9 rounded cursor-pointer border
              flex items-center justify-center transition-all
              ${
                answered
                  ? "bg-green-500 text-white border-green-600"
                  : "border-2 text-gray-800 dark:text-gray-200 dark:border-gray-600 hover:border-primary"
              }`}
            onClick={() => {
              onJump(q.question_id);
              setOpen(false);
            }}
          >
            <span className="text-sm font-semibold">{idx + 1}</span>

            {isBookmarked && (
              <span className="absolute -top-1 -right-1">
                <Flag
                  size={14}
                  className="fill-yellow-500 text-yellow-500 drop-shadow"
                />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile - Sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Map size={16} />
              Асуултын зураг
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Асуултын зураг</SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <MapContent />
              <div className="mt-6 space-y-2 text-sm text-muted-foreground px-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 bg-green-500 rounded"></div>
                  <span>Хариулсан</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-8 border-2 rounded"></div>
                  <span>Хариулаагүй</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag size={16} className="fill-yellow-500 text-yellow-500" />
                  <span>Тэмдэглэгдсэн</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop - Delgetsэн харагдана */}
      <div className="hidden md:block border rounded-lg">
        <MapContent />
      </div>
    </>
  );
}

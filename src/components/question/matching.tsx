"use client";

import React, { useState, useEffect, useRef } from "react";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Check } from "lucide-react";

interface QuestionItem {
  refid: number;
  answer_id: number;
  question_id: number;
  answer_name_html: string;
  answer_descr: string;
  answer_img: string;
}

interface MatchingByLineProps {
  questions: QuestionItem[];
  answers: QuestionItem[];
}

interface Connection {
  start: string;
  end: string;
}

export default function MatchingByLine({
  questions,
  answers,
}: MatchingByLineProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeStart, setActiveStart] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const updateXarrow = useXarrow();
  const containerRef = useRef<HTMLDivElement>(null);

  const questionsOnly = questions.filter((q) => q.answer_descr === "Асуулт");
  const answersOnly = answers.filter((a) => a.answer_descr === "Хариулт");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (container) {
      const handleScroll = () => updateXarrow();
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [updateXarrow]);

  const handleItemClick = (id: string, isQuestion: boolean) => {
    const existingConnection = connections.find(
      (conn) => conn.start === id || conn.end === id
    );
    if (existingConnection) {
      setConnections(connections.filter((conn) => conn !== existingConnection));
      setActiveStart("");
      return;
    }
    if (isQuestion) {
      setActiveStart(id);
    } else if (activeStart) {
      if (connections.some((conn) => conn.end === id)) return;
      setConnections([...connections, { start: activeStart, end: id }]);
      setActiveStart("");
      setTimeout(updateXarrow, 0);
    }
  };

  const isSelected = (id: string) => id === activeStart;
  const isConnected = (id: string) =>
    connections.some((conn) => conn.start === id || conn.end === id);

  const renderContent = (item: QuestionItem, isQuestion: boolean) => {
    if (item.answer_img) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-pointer hover:opacity-90 transition-opacity rounded overflow-hidden">
              <Image
                src={item.answer_img}
                alt={item.answer_name_html}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] max-h-[90vh]">
            <VisuallyHidden>
              <DialogTitle>
                {isQuestion ? "Асуултын зураг" : "Хариултын зураг"}
              </DialogTitle>
            </VisuallyHidden>
            <div className="relative w-full h-[80vh]">
              <Image
                src={item.answer_img}
                alt={item.answer_name_html}
                fill
                className="object-contain"
              />
            </div>
            {item.answer_name_html && (
              <p className="mt-2 text-center">{item.answer_name_html}</p>
            )}
          </DialogContent>
        </Dialog>
      );
    }
    return <span>{item.answer_name_html}</span>;
  };

  return (
    <div className="w-full" ref={containerRef}>
      <Xwrapper>
        <p className="font-semibold mb-4">
          {isMobile
            ? "Асуулт дээр дарж дараа нь хариулт сонгоно уу"
            : "Зөв хариултыг холбоно уу"}
        </p>

        {isMobile ? (
          // 📱 MOBILE VIEW
          <div className="space-y-6">
            {questionsOnly.map((q) => {
              const connectedAnswer = connections.find(
                (c) => c.start === `question-${q.refid}`
              );
              const answerItem = connectedAnswer
                ? answersOnly.find(
                    (a) =>
                      a.refid ===
                      Number(connectedAnswer.end.replace("answer-", ""))
                  )
                : null;

              return (
                <div key={`question-${q.refid}`} className="space-y-3">
                  <div
                    id={`question-${q.refid}`}
                    onClick={() => handleItemClick(`question-${q.refid}`, true)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "w-full cursor-pointer justify-start min-h-[50px] relative",
                      isSelected(`question-${q.refid}`) &&
                        "bg-blue-50 border-blue-500 ring-2 ring-blue-500/50",
                      isConnected(`question-${q.refid}`) &&
                        !isSelected(`question-${q.refid}`) &&
                        "bg-green-50 border-green-500"
                    )}
                  >
                    {renderContent(q, true)}
                    {isConnected(`question-${q.refid}`) && (
                      <Check className="absolute top-2 right-2 w-5 h-5 text-green-600" />
                    )}
                  </div>

                  {answerItem && (
                    <div className="pl-4 border-l-2 border-green-500">
                      <div className="text-sm text-muted-foreground mb-1">
                        Сонгосон хариулт:
                      </div>
                      <div className="p-3 bg-green-50 rounded border border-green-500">
                        {renderContent(answerItem, false)}
                      </div>
                    </div>
                  )}

                  {activeStart === `question-${q.refid}` && !answerItem && (
                    <div className="pl-4 space-y-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        Хариулт сонгоно уу:
                      </div>
                      {answersOnly
                        .filter((a) => !isConnected(`answer-${a.refid}`))
                        .map((a) => (
                          <div
                            key={`answer-${a.refid}`}
                            id={`answer-${a.refid}`}
                            onClick={() =>
                              handleItemClick(`answer-${a.refid}`, false)
                            }
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "default",
                              }),
                              "w-full cursor-pointer justify-start min-h-[50px] bg-yellow-50 border-dashed border-blue-500 hover:bg-yellow-100"
                            )}
                          >
                            {renderContent(a, false)}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // 💻 DESKTOP VIEW
          <div className="flex gap-10 justify-between">
            <div className="flex-1">
              <h3 className="border-b pb-2.5 mb-2">Асуулт</h3>
              {questionsOnly.map((q) => (
                <div
                  key={`question-${q.refid}`}
                  id={`question-${q.refid}`}
                  onClick={() => handleItemClick(`question-${q.refid}`, true)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "w-full cursor-pointer my-2.5 justify-start min-h-[50px] text-left break-words",
                    isSelected(`question-${q.refid}`) &&
                      "bg-blue-50 border-blue-500 ring-2 ring-blue-500/50",
                    isConnected(`question-${q.refid}`) &&
                      !isSelected(`question-${q.refid}`) &&
                      "bg-green-50 border-green-500"
                  )}
                >
                  {renderContent(q, true)}
                </div>
              ))}
            </div>

            <div className="flex-1">
              <h3 className="border-b pb-2.5 mb-2">Хариулт</h3>
              {answersOnly.map((a) => (
                <div
                  key={`answer-${a.refid}`}
                  id={`answer-${a.refid}`}
                  onClick={() => handleItemClick(`answer-${a.refid}`, false)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "w-full cursor-pointer my-2.5 min-h-[50px] justify-end text-right break-words",
                    isConnected(`answer-${a.refid}`) &&
                      "bg-green-50 border-green-500",
                    !activeStart &&
                      !isConnected(`answer-${a.refid}`) &&
                      "opacity-80"
                  )}
                >
                  {renderContent(a, false)}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isMobile &&
          connections.map((conn, i) =>
            conn.end ? (
              <Xarrow
                key={`xarrow-${i}`}
                start={conn.start}
                end={conn.end}
                color="#7c3aed"
                showHead={false}
                strokeWidth={2}
                curveness={0.3}
              />
            ) : null
          )}
      </Xwrapper>
    </div>
  );
}

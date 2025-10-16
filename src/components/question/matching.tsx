"use client";

import React, { useState, useEffect, useRef } from "react";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Check, ZoomIn } from "lucide-react"; // ZoomIn icon-ийг нэмсэн

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

interface Connection {
  start: string;
  end: string;
}

// Зургийг томруулж харуулах компонент
const ImageDialog = ({
  item,
  isQuestion,
}: {
  item: QuestionItem;
  isQuestion: boolean;
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <button
        type="button"
        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
        title="Зургийг томруулах"
        onClick={(e) => e.stopPropagation()} // Элемент дээрх үндсэн onClick-ийг зогсооно
      >
        <ZoomIn className="w-4 h-4" />
      </button>
    </DialogTrigger>
    <DialogContent className="max-w-[90vw] max-h-[90vh] p-6">
      <VisuallyHidden>
        <DialogTitle>
          {isQuestion ? "Асуултын зураг" : "Хариултын зураг"}
        </DialogTitle>
      </VisuallyHidden>
      <div className="relative w-full h-[75vh] flex items-center justify-center bg-gray-50 rounded-lg">
        <img
          src={item.answer_img!}
          alt={item.answer_name_html}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      {item.answer_name_html && (
        <p
          className="mt-4 text-center text-lg font-medium"
          dangerouslySetInnerHTML={{ __html: item.answer_name_html }}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default function MatchingByLine({
  questions = [],
  answers = [],
  onMatchChange,
}: MatchingByLineProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeStart, setActiveStart] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const updateXarrow = useXarrow();
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ Questions болон Answers зөв ялгах - ref_child_id-ийн логикийг хадгалав.
  const questionsOnly = questions.filter(
    (a) => a.ref_child_id !== -1 && a.ref_child_id !== null
  );
  const answersOnly = answers.filter((a) => a.ref_child_id === -1);

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
    window.addEventListener("resize", updateXarrow);
    return () => window.removeEventListener("resize", updateXarrow);
  }, [updateXarrow]);

  useEffect(() => {
    if (onMatchChange) {
      const matches: Record<number, number> = connections.reduce(
        (acc, conn) => {
          const startRefId = parseInt(conn.start.replace("question-", ""));
          const endRefId = parseInt(conn.end.replace("answer-", ""));
          if (!isNaN(startRefId) && !isNaN(endRefId)) {
            acc[startRefId] = endRefId;
          }
          return acc;
        },
        {} as Record<number, number>
      );

      onMatchChange(matches);
    }
    setTimeout(updateXarrow, 0);
  }, [connections, onMatchChange, updateXarrow]);

  const isSelected = (id: string) => id === activeStart;
  const isConnected = (id: string) =>
    connections.some((conn) => conn.start === id || conn.end === id);

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
      if (isConnected(id)) return;

      // ActiveStart-аас гарч буй хуучин холболтыг устгана (1:1 холболт)
      const connectionsWithoutOldStart = connections.filter(
        (c) => c.start !== activeStart
      );

      setConnections([
        ...connectionsWithoutOldStart,
        { start: activeStart, end: id },
      ]);
      setActiveStart("");
    }
  };

  /**
   * Асуулт/Хариултын агуулгыг (зураг+текст) рендерлэх функц
   * Dialogue-ийн логикийг эндээс салган, зөвхөн агуулгыг буцаадаг болгосон.
   */
  const renderContent = (item: QuestionItem, isQuestion: boolean) => {
    // Зурагтай бол зургийг жижиг хэмжээтэйгээр тексттэй зэрэгцүүлж харуулна.
    if (item.answer_img) {
      return (
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden shadow-sm border border-gray-200">
            <img
              src={item.answer_img}
              alt={item.answer_name_html}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className="text-sm font-medium text-gray-700 line-clamp-3 flex-1 text-left"
            dangerouslySetInnerHTML={{ __html: item.answer_name_html }}
          />
        </div>
      );
    }
    // Зураггүй бол зөвхөн текстийг буцаана.
    return (
      <span
        className="font-medium text-gray-700 text-left"
        dangerouslySetInnerHTML={{ __html: item.answer_name_html }}
      />
    );
  };

  /**
   * Асуулт/Хариултын жагсаалтын элементийг рендерлэх үндсэн функц
   */
  const renderItem = (
    item: QuestionItem,
    isQuestion: boolean,
    className: string,
    onClick: () => void
  ) => (
    <div
      key={`${isQuestion ? "question" : "answer"}-${item.refid}`}
      id={`${isQuestion ? "question" : "answer"}-${item.refid}`}
      onClick={onClick}
      className={cn("cursor-pointer relative", className)}
    >
      {/* Зураг томруулах Dialog-ийг элемент бүрийн дотор нэмсэн */}
      {item.answer_img && <ImageDialog item={item} isQuestion={isQuestion} />}

      <div className="w-full h-full flex items-center justify-start text-left">
        {isQuestion &&
          item.answer_img &&
          // Гар утасны загварт item.answer_img байгаа бол renderContent-ийг дуудна
          renderContent(item, isQuestion)}
        {isQuestion && !item.answer_img && (
          <span
            className="font-medium text-gray-700 text-left"
            dangerouslySetInnerHTML={{ __html: item.answer_name_html }}
          />
        )}

        {!isQuestion &&
          item.answer_img &&
          // Гар утасны загварт item.answer_img байгаа бол renderContent-ийг дуудна
          renderContent(item, isQuestion)}
        {!isQuestion && !item.answer_img && (
          <span
            className="font-medium text-gray-700 text-right w-full"
            dangerouslySetInnerHTML={{ __html: item.answer_name_html }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full relative" ref={containerRef}>
      <Xwrapper>
        <p className="font-semibold mb-4">
          {isMobile
            ? "Асуулт дээр дарж дараа нь хариулт сонгоно уу"
            : "Зөв хариултыг холбоно уу"}
        </p>

        {isMobile ? (
          /* ======================== MOBILE UI ======================== */
          <div className="space-y-6">
            {questionsOnly.map((q) => {
              const qid = `question-${q.refid}`;
              const connectedAnswer = connections.find((c) => c.start === qid);
              const answerItem = connectedAnswer
                ? answersOnly.find(
                    (a) =>
                      a.refid ===
                      Number(connectedAnswer.end.replace("answer-", ""))
                  )
                : null;

              return (
                <div key={qid} className="space-y-3">
                  {/* Асуултын элемент */}
                  <div
                    id={qid}
                    onClick={() => handleItemClick(qid, true)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "w-full cursor-pointer justify-start min-h-[50px] relative text-left p-3",
                      isSelected(qid) &&
                        "bg-blue-50 border-blue-500 ring-2 ring-blue-500/50",
                      isConnected(qid) &&
                        !isSelected(qid) &&
                        "bg-green-50 border-green-500"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      {renderContent(q, true)}
                      {q.answer_img && (
                        <ImageDialog item={q} isQuestion={true} />
                      )}
                      {isConnected(qid) && (
                        <Check className="flex-shrink-0 w-5 h-5 text-green-600 ml-2" />
                      )}
                    </div>
                  </div>

                  {answerItem && (
                    <div
                      onClick={() => handleItemClick(qid, true)} // Дахин дарж холболтыг цуцлах
                      className="pl-4 border-l-2 border-green-500 space-y-2 cursor-pointer"
                    >
                      <div className="text-sm text-muted-foreground">
                        Сонгосон хариулт:
                      </div>
                      <div className="p-3 bg-green-50 rounded border border-green-500 relative">
                        {renderContent(answerItem, false)}
                        {answerItem.answer_img && (
                          <ImageDialog item={answerItem} isQuestion={false} />
                        )}
                      </div>
                    </div>
                  )}

                  {activeStart === qid && !answerItem && (
                    <div className="pl-4 space-y-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        Хариулт сонгоно уу:
                      </div>
                      {answersOnly
                        .filter((a) => !isConnected(`answer-${a.refid}`))
                        .map((a) => {
                          const aid = `answer-${a.refid}`;
                          return (
                            <div
                              key={aid}
                              id={aid}
                              onClick={() => handleItemClick(aid, false)}
                              className={cn(
                                buttonVariants({
                                  variant: "outline",
                                  size: "default",
                                }),
                                "w-full cursor-pointer justify-start min-h-[50px] bg-yellow-50 border-dashed border-blue-500 hover:bg-yellow-100 text-left p-3 relative"
                              )}
                            >
                              {renderContent(a, false)}
                              {a.answer_img && (
                                <ImageDialog item={a} isQuestion={false} />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-10 justify-between">
            {/* Асуултын багана */}
            <div className="flex-1">
              <h3 className="border-b pb-2.5 mb-2 font-medium text-gray-700">
                Эхний багана
              </h3>
              {questionsOnly.map((a) => {
                const qid = `question-${a.refid}`;
                return (
                  <div
                    key={qid}
                    id={qid}
                    onClick={() => handleItemClick(qid, true)}
                    className={cn(
                      "w-full cursor-pointer my-2.5 p-4 rounded-lg border-2 transition-all min-h-[80px] flex items-center justify-start relative",
                      isSelected(qid) &&
                        "bg-blue-50 border-blue-500 ring-2 ring-blue-500/50 shadow-md",
                      isConnected(qid) &&
                        !isSelected(qid) &&
                        "bg-green-50 border-green-500 shadow-sm",
                      !isSelected(qid) &&
                        !isConnected(qid) &&
                        "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    )}
                  >
                    {renderContent(a, true)}
                    {a.answer_img && <ImageDialog item={a} isQuestion={true} />}
                  </div>
                );
              })}
            </div>

            {/* Хариултын багана */}
            <div className="flex-1">
              <h3 className="border-b pb-2.5 mb-2 font-medium text-gray-700">
                2дох багана
              </h3>
              {answersOnly.map((a) => {
                const aid = `answer-${a.refid}`;
                return (
                  <div
                    key={aid}
                    id={aid}
                    onClick={() => handleItemClick(aid, false)}
                    className={cn(
                      "w-full cursor-pointer my-2.5 p-4 rounded-lg border-2 transition-all min-h-[80px] flex items-center justify-end relative",
                      isConnected(aid) &&
                        "bg-green-50 border-green-500 shadow-sm",
                      activeStart &&
                        !isConnected(aid) &&
                        "border-dashed border-blue-500 bg-blue-50 hover:bg-blue-100 shadow-sm",
                      !activeStart &&
                        !isConnected(aid) &&
                        "bg-white border-gray-200 opacity-60 hover:opacity-80"
                    )}
                  >
                    {renderContent(a, false)}
                    {a.answer_img && (
                      <ImageDialog item={a} isQuestion={false} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Холболтын шугамууд (Зөвхөн Desktop) */}
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

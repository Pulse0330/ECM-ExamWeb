"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { Check, ZoomIn } from "lucide-react";

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
  readonly?: boolean;
}

interface Connection {
  start: string;
  end: string;
}

// Зургийг томруулж харуулах компонент
const ImageDialog = ({
  item,
  isQuestion,
  isMobileView = false,
}: {
  item: QuestionItem;
  isQuestion: boolean;
  isMobileView?: boolean;
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <button
        type="button"
        className={cn(
          "absolute top-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10",
          isQuestion || isMobileView ? "left-1" : "right-1"
        )}
        title="Зургийг томруулах"
        onClick={(e) => e.stopPropagation()}
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
          onError={(e) => {
            console.error("❌ Dialog image load failed:", item.answer_img);
            e.currentTarget.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EЗураг алга%3C/text%3E%3C/svg%3E";
          }}
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

  // ✅ Track if onMatchChange was already called for current connections
  const lastNotifiedRef = useRef<string>("");

  // ✅ Store onMatchChange in ref to avoid re-triggering
  const onMatchChangeRef = useRef(onMatchChange);

  useEffect(() => {
    onMatchChangeRef.current = onMatchChange;
  }, [onMatchChange]);

  // ✅ answer_id ашиглан unique болгох
  const questionsOnly = useMemo(() => {
    const filtered = questions.filter(
      (a) => a.ref_child_id !== -1 && a.ref_child_id !== null
    );

    // Давхардсан answer_id-г арилгах
    const seen = new Set<number>();
    return filtered.filter((item) => {
      if (seen.has(item.answer_id)) {
        console.warn(`⚠️ Duplicate question answer_id: ${item.answer_id}`);
        return false;
      }
      seen.add(item.answer_id);
      return true;
    });
  }, [questions]);

  const answersOnly = useMemo(() => {
    const filtered = answers.filter((a) => a.ref_child_id === -1);

    // Давхардсан answer_id-г арилгах
    const seen = new Set<number>();
    return filtered.filter((item) => {
      if (seen.has(item.answer_id)) {
        console.warn(`⚠️ Duplicate answer answer_id: ${item.answer_id}`);
        return false;
      }
      seen.add(item.answer_id);
      return true;
    });
  }, [answers]);

  // Debug
  useEffect(() => {
    console.log("📝 Questions:", questionsOnly);
    console.log("✅ Answers:", answersOnly);
  }, [questionsOnly, answersOnly]);

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

  // ✅ FIXED: Only notify parent when connections actually change
  useEffect(() => {
    if (!onMatchChangeRef.current) return;

    const matches: Record<number, number> = {};

    connections.forEach((conn) => {
      const startAnswerId = parseInt(conn.start.replace("q-", ""));
      const endAnswerId = parseInt(conn.end.replace("a-", ""));
      if (!isNaN(startAnswerId) && !isNaN(endAnswerId)) {
        matches[startAnswerId] = endAnswerId;
      }
    });

    const matchesStr = JSON.stringify(matches);

    // ⚠️ Only call onMatchChange if connections changed
    if (lastNotifiedRef.current !== matchesStr) {
      console.log("🔗 [matching.tsx] Notifying parent - Connections:", matches);
      lastNotifiedRef.current = matchesStr;
      onMatchChangeRef.current(matches);
    }

    setTimeout(updateXarrow, 0);
  }, [connections, updateXarrow]);

  const isSelected = (id: string) => id === activeStart;
  const isConnected = (id: string) =>
    connections.some((conn) => conn.start === id || conn.end === id);

  const handleItemClick = (id: string, isQuestion: boolean) => {
    console.log(`🖱️ Clicked: ${id}, isQuestion: ${isQuestion}`);

    const existingConnection = connections.find(
      (conn) => conn.start === id || conn.end === id
    );

    if (existingConnection) {
      console.log("❌ Removing connection:", existingConnection);
      setConnections(connections.filter((conn) => conn !== existingConnection));
      setActiveStart("");
      return;
    }

    if (isQuestion) {
      console.log("📌 Setting active start:", id);
      setActiveStart(id);
    } else if (activeStart) {
      if (isConnected(id)) {
        console.log("⚠️ Already connected:", id);
        return;
      }

      const connectionsWithoutOldStart = connections.filter(
        (c) => c.start !== activeStart
      );

      const newConnection = { start: activeStart, end: id };
      console.log("✅ Adding connection:", newConnection);

      setConnections([...connectionsWithoutOldStart, newConnection]);
      setActiveStart("");
    }
  };

  const renderContent = (
    item: QuestionItem,
    isQuestion: boolean,
    isMobileView: boolean = false
  ) => {
    // Зургийн URL шалгах
    const hasValidImage =
      item.answer_img &&
      item.answer_img.trim() !== "" &&
      item.answer_img.startsWith("http") &&
      !item.answer_img.includes("???????");

    if (hasValidImage) {
      const imageUrl = item.answer_img as string; // Type assertion

      // Desktop дээр хариулт: текст зүүн, зураг баруун
      if (!isMobileView && !isQuestion) {
        return (
          <div className="flex items-center gap-3 w-full">
            <span
              className="text-sm font-medium text-gray-700 line-clamp-3 flex-1 text-left"
              dangerouslySetInnerHTML={{ __html: item.answer_name_html }}
            />
            <div className="relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
              <img
                src={imageUrl}
                alt={item.answer_name_html}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("❌ Image load failed:", imageUrl);
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        );
      }

      // Асуулт (desktop) эсвэл Mobile: зураг зүүн, текст баруун
      return (
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
            <img
              src={imageUrl}
              alt={item.answer_name_html}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("❌ Image load failed:", imageUrl);
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <span
            className="text-sm font-medium text-gray-700 line-clamp-3 flex-1 text-left"
            dangerouslySetInnerHTML={{ __html: item.answer_name_html }}
          />
        </div>
      );
    }
    return (
      <span
        className="font-medium text-gray-700"
        dangerouslySetInnerHTML={{ __html: item.answer_name_html }}
      />
    );
  };

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
              const qid = `q-${q.answer_id}`;
              const connectedAnswer = connections.find((c) => c.start === qid);
              const answerItem = connectedAnswer
                ? answersOnly.find(
                    (a) => `a-${a.answer_id}` === connectedAnswer.end
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
                      {renderContent(q, true, true)}
                      {q.answer_img &&
                        q.answer_img.startsWith("http") &&
                        !q.answer_img.includes("???????") && (
                          <ImageDialog
                            item={q}
                            isQuestion={true}
                            isMobileView={true}
                          />
                        )}
                      {isConnected(qid) && (
                        <Check className="flex-shrink-0 w-5 h-5 text-green-600 ml-2" />
                      )}
                    </div>
                  </div>

                  {answerItem && (
                    <div
                      onClick={() => handleItemClick(qid, true)}
                      className="pl-4 border-l-2 border-green-500 space-y-2 cursor-pointer"
                    >
                      <div className="text-sm text-muted-foreground">
                        Сонгосон хариулт:
                      </div>
                      <div className="p-3 bg-green-50 rounded border border-green-500 relative">
                        {renderContent(answerItem, false, true)}
                        {answerItem.answer_img &&
                          answerItem.answer_img.startsWith("http") &&
                          !answerItem.answer_img.includes("???????") && (
                            <ImageDialog
                              item={answerItem}
                              isQuestion={false}
                              isMobileView={true}
                            />
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
                        .filter((a) => !isConnected(`a-${a.answer_id}`))
                        .map((a) => {
                          const aid = `a-${a.answer_id}`;
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
                              {renderContent(a, false, true)}
                              {a.answer_img &&
                                a.answer_img.startsWith("http") &&
                                !a.answer_img.includes("???????") && (
                                  <ImageDialog
                                    item={a}
                                    isQuestion={false}
                                    isMobileView={true}
                                  />
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
          /* ======================== DESKTOP UI ======================== */
          <div className="flex gap-10 justify-between">
            {/* Асуултын багана */}
            <div className="flex-1">
              <h3 className="border-b pb-2.5 mb-2 font-medium text-gray-700">
                Асуултын багана
              </h3>
              {questionsOnly.map((q) => {
                const qid = `q-${q.answer_id}`;
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
                    {renderContent(q, true, false)}
                    {q.answer_img &&
                      q.answer_img.startsWith("http") &&
                      !q.answer_img.includes("???????") && (
                        <ImageDialog
                          item={q}
                          isQuestion={true}
                          isMobileView={false}
                        />
                      )}
                  </div>
                );
              })}
            </div>

            {/* Хариултын багана */}
            <div className="flex-1">
              <h3 className="border-b pb-2.5 mb-2 font-medium text-gray-700">
                Хариултын багана
              </h3>
              {answersOnly.map((a) => {
                const aid = `a-${a.answer_id}`;
                return (
                  <div
                    key={aid}
                    id={aid}
                    onClick={() => handleItemClick(aid, false)}
                    className={cn(
                      "w-full cursor-pointer my-2.5 p-4 rounded-lg border-2 transition-all min-h-[80px] flex items-center relative",
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
                    {renderContent(a, false, false)}
                    {a.answer_img &&
                      a.answer_img.startsWith("http") &&
                      !a.answer_img.includes("???????") && (
                        <ImageDialog
                          item={a}
                          isQuestion={false}
                          isMobileView={false}
                        />
                      )}
                  </div>
                );
              })}
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

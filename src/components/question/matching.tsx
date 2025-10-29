"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { cn } from "@/lib/utils";

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
  color: string;
}

export default function MatchingByLine({
  questions = [],
  answers = [],
  onMatchChange,
}: MatchingByLineProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeStart, setActiveStart] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const updateXarrow = useXarrow();
  const lastNotifiedRef = useRef<string>("");
  const onMatchChangeRef = useRef(onMatchChange);

  const colorPalette = useRef<string[]>([
    "#ef4444",
    "#dc2626",
    "#b91c1c",
    "#f87171",
    "#fca5a5",
    "#3b82f6",
    "#2563eb",
    "#1d4ed8",
    "#60a5fa",
    "#93c5fd",
    "#22c55e",
    "#16a34a",
    "#15803d",
    "#4ade80",
    "#86efac",
    "#f59e0b",
    "#d97706",
    "#b45309",
    "#fbbf24",
    "#fcd34d",
    "#8b5cf6",
    "#7c3aed",
    "#6d28d9",
    "#a78bfa",
    "#c4b5fd",
    "#ec4899",
    "#db2777",
    "#be185d",
    "#f472b6",
    "#f9a8d4",
    "#14b8a6",
    "#0d9488",
    "#0f766e",
    "#2dd4bf",
    "#5eead4",
    "#eab308",
    "#ca8a04",
    "#a16207",
    "#facc15",
    "#fde047",
    "#9333ea",
    "#7e22ce",
    "#6b21a8",
    "#a855f7",
    "#c084fc",
    "#06b6d4",
    "#0891b2",
    "#0e7490",
    "#38bdf8",
    "#7dd3fc",
  ]);
  const usedColors = useRef<Set<string>>(new Set());

  const getUniqueColor = (): string => {
    const available = colorPalette.current.filter(
      (c) => !usedColors.current.has(c)
    );
    if (!available.length) {
      usedColors.current.clear();
      return getUniqueColor();
    }
    const color = available[Math.floor(Math.random() * available.length)];
    usedColors.current.add(color);
    return color;
  };

  useEffect(() => {
    onMatchChangeRef.current = onMatchChange;
  }, [onMatchChange]);

  const questionsOnly = useMemo(() => {
    const filtered = questions.filter(
      (q) => q.ref_child_id !== -1 && q.ref_child_id !== null
    );
    const seen = new Set<number>();
    return filtered.filter((item) => {
      if (seen.has(item.answer_id)) return false;
      seen.add(item.answer_id);
      return true;
    });
  }, [questions]);

  const answersOnly = useMemo(() => {
    const filtered = answers.filter((a) => a.ref_child_id === -1);
    const seen = new Set<number>();
    return filtered.filter((item) => {
      if (seen.has(item.answer_id)) return false;
      seen.add(item.answer_id);
      return true;
    });
  }, [answers]);

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
    if (!onMatchChangeRef.current) return;
    const matches: Record<number, number> = {};
    connections.forEach((conn) => {
      const startId = parseInt(conn.start.replace("q-", ""));
      const endId = parseInt(conn.end.replace("a-", ""));
      if (!isNaN(startId) && !isNaN(endId)) matches[startId] = endId;
    });
    const str = JSON.stringify(matches);
    if (lastNotifiedRef.current !== str) {
      lastNotifiedRef.current = str;
      onMatchChangeRef.current(matches);
    }
    setTimeout(updateXarrow, 0);
  }, [connections, updateXarrow]);

  const isSelected = (id: string) => id === activeStart;
  const isConnected = (id: string) =>
    connections.some((c) => c.start === id || c.end === id);
  const getConnectionColor = (id: string) =>
    connections.find((c) => c.start === id || c.end === id)?.color;

  const handleItemClick = (id: string, isQuestion: boolean) => {
    const existing = connections.find((c) => c.start === id || c.end === id);
    if (existing) {
      usedColors.current.delete(existing.color);
      setConnections(connections.filter((c) => c !== existing));
      setActiveStart("");
      return;
    }
    if (isQuestion) setActiveStart(id);
    else if (activeStart) {
      const color = getUniqueColor();
      setConnections((prev) => [
        ...prev.filter((c) => c.start !== activeStart),
        { start: activeStart, end: id, color },
      ]);
      setActiveStart("");
    }
  };

  const renderContent = (item: QuestionItem) => (
    <div
      dangerouslySetInnerHTML={{ __html: item.answer_name_html }}
      className="text-sm font-medium w-full text-center"
    />
  );

  return (
    <div ref={containerRef} className="w-full relative">
      <Xwrapper>
        <p className="font-semibold mb-4 text-center">
          {isMobile
            ? "Асуулт дээр дарж дараа нь хариулт сонгоно уу"
            : "Зөв хариултыг холбоно уу"}
        </p>

        {isMobile ? (
          <div className="space-y-4">
            {questionsOnly.map((q) => {
              const qid = `q-${q.answer_id}`;
              const connected = connections.find((c) => c.start === qid);
              const answerItem = connected
                ? answersOnly.find((a) => `a-${a.answer_id}` === connected.end)
                : null;

              return (
                <div key={qid}>
                  <div
                    onClick={() => handleItemClick(qid, true)}
                    className={cn(
                      "w-full p-3 border rounded-lg cursor-pointer flex justify-between items-center",
                      isSelected(qid)
                        ? "border-blue-500 "
                        : isConnected(qid)
                        ? "border-green-500 "
                        : "border-gray-300 bg-gray-400"
                    )}
                    style={{
                      borderColor: getConnectionColor(qid),
                      backgroundColor: getConnectionColor(qid)
                        ? `${getConnectionColor(qid)}20`
                        : undefined,
                    }}
                  >
                    {renderContent(q)}
                  </div>

                  {answerItem && (
                    <div className="pl-4 mt-2 border-l-2 border-green-500">
                      <div className="text-sm text-muted-foreground">
                        Сонгосон хариулт:
                      </div>
                      <div className="p-2 rounded border border-green-500 ">
                        {renderContent(answerItem)}
                      </div>
                    </div>
                  )}

                  {isSelected(qid) && !answerItem && (
                    <div className="pl-4 mt-2 space-y-2">
                      {answersOnly
                        .filter((a) => !isConnected(`a-${a.answer_id}`))
                        .map((a) => {
                          const aid = `a-${a.answer_id}`;
                          return (
                            <div
                              key={aid}
                              onClick={() => handleItemClick(aid, false)}
                              className={cn(
                                "w-full p-2 border border-dashed rounded cursor-pointer  hover:bg-yellow-100"
                              )}
                            >
                              {renderContent(a)}
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
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <h3 className="border-b pb-2 font-semibold text-center">Асуулт</h3>
            <h3 className="border-b pb-2 font-semibold text-center">Хариулт</h3>

            {questionsOnly.map((q, index) => {
              const qid = `q-${q.answer_id}`;
              const a = answersOnly[index];
              const aid = a ? `a-${a.answer_id}` : null;

              return (
                <React.Fragment key={qid}>
                  <div
                    id={qid}
                    onClick={() => handleItemClick(qid, true)}
                    className={cn(
                      "w-full p-4 border rounded-lg cursor-pointer flex items-center justify-center text-center",
                      isSelected(qid)
                        ? "border-blue-500 "
                        : isConnected(qid)
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300"
                    )}
                    style={{
                      borderColor: getConnectionColor(qid),
                      backgroundColor: getConnectionColor(qid)
                        ? `${getConnectionColor(qid)}20`
                        : undefined,
                    }}
                  >
                    {renderContent(q)}
                  </div>

                  {aid && a && (
                    <div
                      id={aid}
                      onClick={() => handleItemClick(aid, false)}
                      className={cn(
                        "w-full p-4 border rounded-lg cursor-pointer flex items-center justify-center text-center",
                        isSelected(aid)
                          ? "border-blue-500 bg-blue-50"
                          : isConnected(aid)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300"
                      )}
                      style={{
                        borderColor: getConnectionColor(aid),
                        backgroundColor: getConnectionColor(aid)
                          ? `${getConnectionColor(aid)}20`
                          : undefined,
                      }}
                    >
                      {renderContent(a)}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {!isMobile &&
          connections.map((c, i) => (
            <Xarrow
              key={i}
              start={c.start}
              end={c.end}
              color={c.color}
              strokeWidth={3}
              curveness={0.3}
              showHead={false}
            />
          ))}
      </Xwrapper>
    </div>
  );
}

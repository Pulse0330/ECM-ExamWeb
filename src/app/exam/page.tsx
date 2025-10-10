"use client";

import React, { useState, useEffect, use } from "react";
import SingleSelectQuestion from "@/components/question/sinleselect";
import MultiSelectQuestion from "@/components/question/multiselect";
import FillInTheBlankQuestionShadcn from "@/components/question/fillinblank";
import DragAndDropWrapper from "@/components/question/DragAndDropWrapper";
import MatchingByLineWrapper from "@/components/question/matchingWrapper";
import MiniMap from "@/app/exam/minimap";
import ITimer from "@/app/exam/itimer";
import { Flag } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [examInfo, setExamInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number | number[] | string | Record<string, string> | null;
  }>({});

  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const userId = "248064";
  const handleAutoSubmit = () => {
    console.log("⏳ Шалгалт автоматаар submit хийж байна...");
    alert("Шалгалт автоматаар дууслаа.");
    router.push("/home");
  };

  const handleLogout = () => {
    console.log("🚫 Multi login илэрлээ, хэрэглэгч log out хийгдлээ.");
    localStorage.clear();
    router.push("/login");
  };

  // --- Data Fetch ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://ottapp.ecm.mn/api/getexamfill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: Number(userId),
            exam_id: Number(examId),
            conn: {
              user: "edusr",
              password: "sql$erver43",
              database: "ikh_skuul",
              server: "172.16.1.79",
              pool: { max: 100000, min: 0, idleTimeoutMillis: 30000000 },
              options: { encrypt: false, trustServerCertificate: false },
            },
          }),
        });

        const data = await res.json();
        setQuestions(data.Questions || []);
        setAnswers(data.Answers || []);
        setExamInfo(data.ExamInfo || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId]);

  const getAnswersForQuestion = (questionId: number) =>
    answers.filter((a) => a.question_id === questionId);

  const handleSingleAnswerChange = (qid: number, answerId: number | null) => {
    setSelectedAnswers((prev) => ({ ...prev, [qid]: answerId }));
  };

  const handleMultiAnswerChange = (qid: number, answerIds: number[]) => {
    setSelectedAnswers((prev) => ({ ...prev, [qid]: answerIds }));
  };

  const handleFillInTheBlankChange = (qid: number, answerText: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qid]: answerText }));
  };

  const handleJumpToQuestion = (qid: number) => {
    document
      .getElementById(`question-container-${qid}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleBookmark = (qid: number) => {
    setBookmarks((prev) =>
      prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid]
    );
  };

  if (loading)
    return <div className="p-4 text-lg font-semibold">Татаж байна...</div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 🧠 Шалгалтын хяналтын систем */}

      <div className="flex gap-4">
        {/* Зүүн тал: MiniMap */}
        <div className="w-1/6 flex-shrink-0">
          <div className="sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <MiniMap
              questions={questions}
              choosedAnswers={selectedAnswers as Record<number, number>}
              bookmarks={bookmarks}
              onJump={handleJumpToQuestion}
            />
          </div>
        </div>

        {/* Гол хэсэг: Асуултууд */}
        <div className="w-4/6 space-y-6">
          {examInfo.length > 0 && (
            <div className="mb-6 p-4 rounded border border-border">
              <h1 className="text-2xl font-bold mb-2">{examInfo[0].title}</h1>
              {examInfo[0].descr && <p className="mb-2">{examInfo[0].descr}</p>}
              {examInfo[0].help && (
                <p className="text-sm mb-2">{examInfo[0].help}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                <div>Хугацаа: {examInfo[0].minut} минут</div>
                <div>Асуулт тоо: {examInfo[0].que_cnt}</div>
                <div>Төрөл: {examInfo[0].exam_type_name}</div>
                <div>
                  Эхлэх цаг: {new Date(examInfo[0].end_time).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {questions.map((question) => (
            <div
              key={question.question_id}
              id={`question-container-${question.question_id}`}
              className="mb-6 p-4 border rounded shadow-sm"
            >
              {/* Гарчиг + Bookmark товч */}
              <h2 className="flex justify-between items-center font-semibold mb-2">
                {question.question_name}
                <button
                  onClick={() => toggleBookmark(question.question_id)}
                  className={`ml-2 p-1 rounded ${
                    bookmarks.includes(question.question_id)
                      ? "bg-yellow-400 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                  title={
                    bookmarks.includes(question.question_id)
                      ? "Bookmark хасах"
                      : "Bookmark хийх"
                  }
                >
                  <Flag size={14} />
                </button>
              </h2>

              {question.que_type_id === 1 && (
                <SingleSelectQuestion
                  questionId={question.question_id}
                  questionText={question.question_name}
                  answers={getAnswersForQuestion(question.question_id)}
                  mode="exam"
                  selectedAnswer={
                    selectedAnswers[question.question_id] as number | null
                  }
                  onAnswerChange={handleSingleAnswerChange}
                />
              )}

              {question.que_type_id === 2 && (
                <MultiSelectQuestion
                  questionId={question.question_id}
                  questionText={question.question_name}
                  answers={getAnswersForQuestion(question.question_id)}
                  mode="exam"
                  selectedAnswers={
                    Array.isArray(selectedAnswers[question.question_id])
                      ? (selectedAnswers[question.question_id] as number[])
                      : []
                  }
                  onAnswerChange={handleMultiAnswerChange}
                />
              )}

              {question.que_type_id === 4 && (
                <FillInTheBlankQuestionShadcn
                  questionId={question.question_id.toString()}
                  questionText={question.question_name}
                  onAnswerChange={(text: string) =>
                    handleFillInTheBlankChange(question.question_id, text)
                  }
                />
              )}

              {question.que_type_id === 5 && (
                <DragAndDropWrapper
                  answers={getAnswersForQuestion(question.question_id)}
                  onOrderChange={(orderedIds) =>
                    setSelectedAnswers((prev) => ({
                      ...prev,
                      [question.question_id]: orderedIds,
                    }))
                  }
                />
              )}

              {question.que_type_id === 6 && (
                <MatchingByLineWrapper
                  questions={getAnswersForQuestion(question.question_id).filter(
                    (a) => a.answer_descr === "Асуулт"
                  )}
                  answers={getAnswersForQuestion(question.question_id).filter(
                    (a) => a.answer_descr === "Хариулт"
                  )}
                  onMatchChange={(matches) =>
                    setSelectedAnswers((prev) => ({
                      ...prev,
                      [question.question_id]: matches,
                    }))
                  }
                />
              )}
            </div>
          ))}
        </div>

        {/* Баруун тал: Timer */}
        <div className="w-1/6 flex-shrink-0">
          <div className="sticky top-4">
            {examInfo.length > 0 && (
              <ITimer
                durationMinutes={examInfo[0].minut}
                examName={examInfo[0].title}
                startTime={new Date()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

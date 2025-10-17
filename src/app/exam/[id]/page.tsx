"use client";

import React, { useState, useEffect, use, useCallback, useMemo } from "react";
import SingleSelectQuestion from "@/components/question/sinleselect";
import MultiSelectQuestion from "@/components/question/multiselect";
import FillInTheBlankQuestionShadcn from "@/components/question/fillinblank";
import DragAndDropWrapper from "@/components/question/DragAndDropWrapper";
import MatchingByLineWrapper from "@/components/question/matching";
import MiniMap from "@/app/exam/minimap";
import ITimer from "@/app/exam/itimer";
import { Flag } from "lucide-react";

// Constants - component гаднах хэсэгт тодорхойлсон
const EXAM_API_URL = "https://ottapp.ecm.mn/api/getexamfill";
const USER_ID = 248064;
const EXAM_ID = 8580;
const DB_CONFIG = {
  user: "edusr",
  password: "sql$erver43",
  database: "ikh_skuul",
  server: "172.16.1.79",
  pool: { max: 100000, min: 0, idleTimeoutMillis: 30000000 },
  options: { encrypt: false, trustServerCertificate: false },
};

// Types
interface Question {
  question_id: number;
  question_name: string;
  que_type_id: number;
}

interface Answer {
  answer_id: number;
  question_id: number;
  answer_type: number;
  answer_name: string;
  answer_name_html: string;
  answer_descr?: string;
  answer_img?: string;
  refid?: number;
  ref_child_id?: number | null;
  is_correct?: boolean;
  order_num?: number;
}

interface ExamInfo {
  title: string;
  descr?: string;
  help?: string;
  minut: number;
  que_cnt: number;
  exam_type_name: string;
  end_time: string;
}

type SelectedAnswersType = {
  [key: number]: number | number[] | string | Record<string, string> | null;
};

export default function Page({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = use(params);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [examInfo, setExamInfo] = useState<ExamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswersType>(
    {}
  );
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  // Fetch data - useCallback ашиглан optimize хийсэн
  const fetchExamData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(EXAM_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: USER_ID,
          exam_id: EXAM_ID,
          conn: DB_CONFIG,
        }),
      });

      const data = await res.json();
      setQuestions(data.Questions || []);
      setAnswers(data.Answers || []);
      setExamInfo(data.ExamInfo || []);
    } catch (err) {
      console.error("Exam data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  // Memoized answers lookup - давтан filter хийхгүй байхын тулд
  const answersByQuestion = useMemo(() => {
    const map = new Map<number, Answer[]>();
    answers.forEach((answer) => {
      const qid = answer.question_id;
      if (!map.has(qid)) {
        map.set(qid, []);
      }
      map.get(qid)!.push(answer);
    });
    return map;
  }, [answers]);

  // Memoized matching questions and answers with proper type filtering
  const matchingData = useMemo(() => {
    const questions = answers.filter(
      (q): q is Answer & { refid: number } =>
        q.ref_child_id !== -1 &&
        q.ref_child_id !== null &&
        typeof q.refid === "number"
    );
    const answersList = answers.filter(
      (a): a is Answer & { refid: number } =>
        a.ref_child_id === -1 && typeof a.refid === "number"
    );
    return { questions, answers: answersList };
  }, [answers]);

  // Optimized answer getter
  const getAnswersForQuestion = useCallback(
    (questionId: number) => {
      return answersByQuestion.get(questionId) || [];
    },
    [answersByQuestion]
  );

  // Answer change handlers - useCallback ашиглан re-render багасгасан
  const handleSingleAnswerChange = useCallback(
    (qid: number, answerId: number | null) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerId }));
    },
    []
  );

  const handleMultiAnswerChange = useCallback(
    (qid: number, answerIds: number[]) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerIds }));
    },
    []
  );

  const handleFillInTheBlankChange = useCallback(
    (qid: number, answerText: string) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerText }));
    },
    []
  );

  const handleDragDropChange = useCallback((qid: number, orderedIds: any) => {
    setSelectedAnswers((prev) => ({ ...prev, [qid]: orderedIds }));
  }, []);

  // Jump to question - useCallback ашиглан optimize
  const handleJumpToQuestion = useCallback((qid: number) => {
    document
      .getElementById(`question-container-${qid}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Bookmark toggle - useCallback ашиглан optimize
  const toggleBookmark = useCallback((qid: number) => {
    setBookmarks((prev) =>
      prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid]
    );
  }, []);

  // Memoized exam info display
  const examInfoDisplay = useMemo(() => {
    if (examInfo.length === 0) return null;

    const info = examInfo[0];
    return (
      <div className="mb-6 p-4 rounded border border-border">
        <h1 className="text-2xl font-bold mb-2">{info.title}</h1>
        {info.descr && <p className="mb-2">{info.descr}</p>}
        {info.help && <p className="text-sm mb-2">{info.help}</p>}
        <div className="flex flex-wrap gap-4 text-sm">
          <div>Хугацаа: {info.minut} минут</div>
          <div>Асуулт тоо: {info.que_cnt}</div>
          <div>Төрөл: {info.exam_type_name}</div>
          <div>Эхлэх цаг: {new Date(info.end_time).toLocaleString()}</div>
        </div>
      </div>
    );
  }, [examInfo]);

  if (loading) {
    return <div className="p-4 text-lg font-semibold">Татаж байна...</div>;
  }

  return (
    <div className="flex gap-4 p-4">
      {/* Зүүн тал: MiniMap */}
      <div className="w-1/6">
        <MiniMap
          questions={questions}
          choosedAnswers={selectedAnswers as Record<number, number>}
          bookmarks={bookmarks}
          onJump={handleJumpToQuestion}
        />
      </div>

      {/* Гол хэсэг: Асуултууд */}
      <div className="w-4/6 space-y-6">
        {examInfoDisplay}

        {questions.map((question) => (
          <QuestionItem
            key={question.question_id}
            question={question}
            answers={getAnswersForQuestion(question.question_id)}
            selectedAnswer={selectedAnswers[question.question_id]}
            isBookmarked={bookmarks.includes(question.question_id)}
            onToggleBookmark={toggleBookmark}
            onSingleAnswerChange={handleSingleAnswerChange}
            onMultiAnswerChange={handleMultiAnswerChange}
            onFillInTheBlankChange={handleFillInTheBlankChange}
            onDragDropChange={handleDragDropChange}
            matchingData={matchingData}
          />
        ))}
      </div>

      {/* Баруун тал: Timer */}
      <div className="w-1/6">
        {examInfo.length > 0 && (
          <ITimer
            durationMinutes={examInfo[0].minut}
            examName={examInfo[0].title}
            startTime={new Date()}
          />
        )}
      </div>
    </div>
  );
}

// Separate memoized component for each question item
const QuestionItem = React.memo(
  ({
    question,
    answers,
    selectedAnswer,
    isBookmarked,
    onToggleBookmark,
    onSingleAnswerChange,
    onMultiAnswerChange,
    onFillInTheBlankChange,
    onDragDropChange,
    matchingData,
  }: {
    question: Question;
    answers: Answer[];
    selectedAnswer: any;
    isBookmarked: boolean;
    onToggleBookmark: (qid: number) => void;
    onSingleAnswerChange: (qid: number, answerId: number | null) => void;
    onMultiAnswerChange: (qid: number, answerIds: number[]) => void;
    onFillInTheBlankChange: (qid: number, text: string) => void;
    onDragDropChange: (qid: number, orderedIds: any) => void;
    matchingData: { questions: Answer[]; answers: Answer[] };
  }) => {
    const handleBookmarkClick = useCallback(() => {
      onToggleBookmark(question.question_id);
    }, [onToggleBookmark, question.question_id]);

    return (
      <div
        id={`question-container-${question.question_id}`}
        className="mb-6 p-4 border rounded shadow-sm"
      >
        <h2 className="flex justify-between items-center font-semibold mb-2">
          {question.question_name}
          <button
            onClick={handleBookmarkClick}
            className={`ml-2 p-1 rounded ${
              isBookmarked
                ? "bg-yellow-400 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            title={isBookmarked ? "Bookmark хасах" : "Bookmark хийх"}
          >
            <Flag size={14} />
          </button>
        </h2>

        {question.que_type_id === 1 && (
          <SingleSelectQuestion
            questionId={question.question_id}
            questionText={question.question_name}
            answers={answers}
            mode="exam"
            selectedAnswer={selectedAnswer as number | null}
            onAnswerChange={onSingleAnswerChange}
          />
        )}

        {question.que_type_id === 2 && (
          <MultiSelectQuestion
            questionId={question.question_id}
            questionText={question.question_name}
            answers={answers}
            mode="exam"
            selectedAnswers={
              Array.isArray(selectedAnswer) ? selectedAnswer : []
            }
            onAnswerChange={onMultiAnswerChange}
          />
        )}

        {question.que_type_id === 3 && (
          <MultiSelectQuestion
            questionId={question.question_id}
            questionText={question.question_name}
            answers={answers}
            mode="exam"
            selectedAnswers={
              Array.isArray(selectedAnswer) ? selectedAnswer : []
            }
            onAnswerChange={onMultiAnswerChange}
          />
        )}

        {question.que_type_id === 4 && (
          <FillInTheBlankQuestionShadcn
            questionId={question.question_id.toString()}
            questionText={question.question_name}
            onAnswerChange={(text: string) =>
              onFillInTheBlankChange(question.question_id, text)
            }
          />
        )}

        {question.que_type_id === 5 && (
          <DragAndDropWrapper
            answers={answers}
            onOrderChange={(orderedIds) =>
              onDragDropChange(question.question_id, orderedIds)
            }
          />
        )}

        {question.que_type_id === 6 && (
          <MatchingByLineWrapper
            questions={matchingData.questions as any}
            answers={matchingData.answers as any}
          />
        )}
      </div>
    );
  }
);

QuestionItem.displayName = "QuestionItem";

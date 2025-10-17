// app/soril/[id]/page.tsx - Updated Component

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import SingleSelectQuestion from "@/components/question/sinleselect";
import MultiSelectQuestion from "@/components/question/multiselect";
import FillInTheBlankQuestionShadcn from "@/components/question/fillinblank";
import DragAndDropWrapper from "@/components/question/DragAndDropWrapper";
import MatchingByLineWrapper from "@/components/question/matching";
import MiniMap from "@/app/exam/minimap";
import ITimer from "@/app/exam/itimer";
import { Flag, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getExamById, saveAnswer } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type {
  ApiExamResponse,
  Question,
  Answer,
  ExamInfo,
  SaveAnswerRequest,
} from "@/types/exam";

type SelectedAnswersType = {
  [key: number]: number | number[] | string | Record<string, string> | null;
};

export default function ExamPage() {
  const { id } = useParams();
  const userId = useAuthStore((s) => s.userId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [examInfo, setExamInfo] = useState<ExamInfo[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswersType>(
    {}
  );
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch exam data
  const examMutation = useMutation<
    ApiExamResponse,
    Error,
    { userId: number; examId: number }
  >({
    mutationFn: ({ userId, examId }) => getExamById(userId, examId),
    onSuccess: (data) => {
      setQuestions(data.Questions || []);
      setAnswers(data.Answers || []);
      setExamInfo(data.ExamInfo || []);

      // Load previous answers if exists
      if (data.ChoosedAnswer && data.ChoosedAnswer.length > 0) {
        const prevAnswers: SelectedAnswersType = {};
        data.ChoosedAnswer.forEach((item) => {
          if (item.QueID && item.AnsID) {
            prevAnswers[item.QueID] = item.AnsID;
          }
        });
        setSelectedAnswers(prevAnswers);
      }
    },
    onError: (error) => {
      console.error("Exam data fetch error:", error);
      toast.error("Шалгалтын мэдээлэл татахад алдаа гарлаа");
    },
  });

  // Load exam on mount
  useEffect(() => {
    if (userId && id) {
      examMutation.mutate({ userId, examId: Number(id) });
    }
  }, [userId, id]);

  // Save answer mutation
  const saveMutation = useMutation<any, Error, SaveAnswerRequest>({
    mutationFn: saveAnswer,
    onSuccess: () => {
      toast.success("Хариулт хадгалагдлаа", {
        duration: 1000,
        position: "bottom-right",
      });
    },
    onError: (error) => {
      console.error("Save answer error:", error);
      toast.error("Хариулт хадгалахад алдаа гарлаа");
    },
  });

  // Memoized answers lookup
  const answersByQuestion = useMemo(() => {
    const map = new Map<number, Answer[]>();
    answers.forEach((answer) => {
      const qid = answer.question_id;
      if (qid !== null) {
        if (!map.has(qid)) {
          map.set(qid, []);
        }
        map.get(qid)!.push(answer);
      }
    });
    return map;
  }, [answers]);

  // Memoized matching data
  const matchingData = useMemo(() => {
    const questions = answers.filter(
      (q): q is Answer & { refid: number; question_id: number } =>
        q.ref_child_id !== -1 &&
        q.ref_child_id !== null &&
        typeof q.refid === "number" &&
        q.question_id !== null
    );
    const answersList = answers.filter(
      (a): a is Answer & { refid: number } =>
        a.ref_child_id === -1 && typeof a.refid === "number"
    );
    return { questions, answers: answersList };
  }, [answers]);

  const getAnswersForQuestion = useCallback(
    (questionId: number) => {
      return answersByQuestion.get(questionId) || [];
    },
    [answersByQuestion]
  );

  // Save answer to server
  const saveAnswerToServer = useCallback(
    (
      questionId: number,
      answerValue: number | number[] | string | Record<string, string> | null,
      queTypeId: number
    ) => {
      if (!userId || !id) return;

      saveMutation.mutate({
        userId,
        examId: Number(id),
        questionId,
        queTypeId,
        answerValue,
      });
    },
    [userId, id, saveMutation]
  );

  // Answer change handlers with auto-save
  const handleSingleAnswerChange = useCallback(
    (qid: number, answerId: number | null) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerId }));

      const question = questions.find((q) => q.question_id === qid);
      if (question) {
        saveAnswerToServer(qid, answerId, question.que_type_id);
      }
    },
    [questions, saveAnswerToServer]
  );

  const handleMultiAnswerChange = useCallback(
    (qid: number, answerIds: number[]) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerIds }));

      const question = questions.find((q) => q.question_id === qid);
      if (question) {
        saveAnswerToServer(qid, answerIds, question.que_type_id);
      }
    },
    [questions, saveAnswerToServer]
  );

  const handleFillInTheBlankChange = useCallback(
    (qid: number, answerText: string) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: answerText }));

      const question = questions.find((q) => q.question_id === qid);
      if (question) {
        saveAnswerToServer(qid, answerText, question.que_type_id);
      }
    },
    [questions, saveAnswerToServer]
  );

  const handleDragDropChange = useCallback(
    (qid: number, orderedIds: any) => {
      setSelectedAnswers((prev) => ({ ...prev, [qid]: orderedIds }));

      const question = questions.find((q) => q.question_id === qid);
      if (question) {
        saveAnswerToServer(qid, orderedIds, question.que_type_id);
      }
    },
    [questions, saveAnswerToServer]
  );

  // Manual save all answers
  const handleSaveAllAnswers = useCallback(async () => {
    setIsSaving(true);
    try {
      const savePromises = Object.entries(selectedAnswers).map(
        ([qid, answer]) => {
          const question = questions.find(
            (q) => q.question_id === parseInt(qid)
          );
          if (question && userId && id) {
            return saveAnswer({
              userId,
              examId: Number(id),
              questionId: parseInt(qid),
              queTypeId: question.que_type_id,
              answerValue: answer,
            });
          }
          return Promise.resolve();
        }
      );

      await Promise.all(savePromises);
      toast.success("Бүх хариулт амжилттай хадгалагдлаа");
    } catch (error) {
      console.error("Save all answers error:", error);
      toast.error("Хариулт хадгалахад алдаа гарлаа");
    } finally {
      setIsSaving(false);
    }
  }, [selectedAnswers, questions, userId, id]);

  const handleJumpToQuestion = useCallback((qid: number) => {
    document
      .getElementById(`question-container-${qid}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const toggleBookmark = useCallback((qid: number) => {
    setBookmarks((prev) =>
      prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid]
    );
  }, []);

  const examInfoDisplay = useMemo(() => {
    if (examInfo.length === 0) return null;

    const info = examInfo[0];
    return (
      <div className="mb-6 p-4 rounded border border-border">
        <div className="flex justify-between items-start">
          <div className="flex-1">
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
          <Button
            onClick={handleSaveAllAnswers}
            disabled={isSaving}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Хадгалж байна..." : "Бүгдийг хадгалах"}
          </Button>
        </div>
      </div>
    );
  }, [examInfo, isSaving, handleSaveAllAnswers]);

  if (examMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Татаж байна...</div>
      </div>
    );
  }

  if (examMutation.isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-red-500">
          Алдаа гарлаа: {examMutation.error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 ">
      <div className="w-1/6 h-fit sticky top-4 self-start">
        <MiniMap
          questions={questions}
          choosedAnswers={selectedAnswers as Record<number, number>}
          bookmarks={bookmarks}
          onJump={handleJumpToQuestion}
        />
      </div>

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

      <div className="w-1/6 h-fit sticky top-4 self-start">
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
        <h2 className="flex justify-between items-start font-semibold mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <div dangerouslySetInnerHTML={{ __html: question.question_name }} />
          </div>

          <button
            onClick={handleBookmarkClick}
            className={`ml-2 p-1 rounded flex-shrink-0 ${
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

        {(question.que_type_id === 2 || question.que_type_id === 3) && (
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

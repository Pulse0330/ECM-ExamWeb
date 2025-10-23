"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import SingleSelectQuestion from "@/components/question/sinleselect";
import MultiSelectQuestion from "@/components/question/multiselect";
import FillInTheBlankQuestionShadcn from "@/components/question/fillinblank";
import DragAndDropWrapper from "@/components/question/DragAndDropWrapper";
import MatchingByLineWrapper from "@/components/question/matchingWrapper";
import MiniMap from "@/app/exam/minimap";
import ITimer from "@/app/exam/itimer";
import { Flag } from "lucide-react";
import type { Answer, Question, ChoosedAnswer } from "@/types/exam";

type SelectedAnswersType = Record<number, any>;

export default function ExamReviewPage({
  examData,
}: {
  examData: {
    Questions: Question[];
    Answers: Answer[];
    ChoosedAnswer: ChoosedAnswer[];
    ExamInfo: any[];
  };
}) {
  const { id } = useParams();
  const questions = useMemo(() => examData.Questions || [], [examData]);
  const answers = useMemo(() => examData.Answers || [], [examData]);
  const examInfo = useMemo(() => examData.ExamInfo || [], [examData]);

  const [selectedAnswers] = useState<SelectedAnswersType>(() => {
    const prevAnswers: SelectedAnswersType = {};
    examData.ChoosedAnswer.forEach((item) => {
      if ("QueID" in item) {
        prevAnswers[item.QueID] = item.AnsID ?? item.AnsText ?? null;
      }
    });
    return prevAnswers;
  });

  const answersByQuestion = useMemo(() => {
    const map = new Map<number, Answer[]>();
    answers.forEach((answer) => {
      const qid = answer.question_id;
      if (qid !== null) {
        if (!map.has(qid)) map.set(qid, []);
        map.get(qid)!.push(answer);
      }
    });
    return map;
  }, [answers]);

  const getAnswersForQuestion = (questionId: number) =>
    answersByQuestion.get(questionId) || [];

  const matchingData = useMemo(() => {
    const questionsList = answers.filter(
      (q): q is Answer & { refid: number } =>
        q.ref_child_id !== -1 &&
        q.ref_child_id !== null &&
        typeof q.refid === "number"
    );
    const answersList = answers.filter(
      (a): a is Answer & { refid: number } =>
        a.ref_child_id === -1 && typeof a.refid === "number"
    );
    return { questions: questionsList, answers: answersList };
  }, [answers]);

  const toggleBookmark = (qid: number) => {}; // review-д bookmark-д хийх боломжгүй

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 sm:p-4">
      <div className="hidden lg:block lg:w-1/6 h-fit sticky top-4 self-start">
        <MiniMap
          questions={questions}
          choosedAnswers={selectedAnswers}
          bookmarks={[]}
          onJump={(qid) => {
            document
              .getElementById(`question-container-${qid}`)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </div>

      <div className="w-full lg:w-4/6 space-y-4 sm:space-y-6">
        {examInfo.length > 0 && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded border border-border">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              {examInfo[0].title}
            </h1>
            {examInfo[0].descr && <p>{examInfo[0].descr}</p>}
          </div>
        )}

        {questions.map((question) => (
          <div
            id={`question-container-${question.question_id}`}
            key={question.question_id}
            className="mb-4 sm:mb-6 p-3 sm:p-4 border rounded shadow-sm"
          >
            <h2 className="flex justify-between items-start font-semibold mb-2 text-sm sm:text-base">
              <div
                dangerouslySetInnerHTML={{ __html: question.question_name }}
              />
              <Flag size={14} className="text-yellow-400" />
            </h2>

            {question.que_type_id === 1 && (
              <SingleSelectQuestion
                questionId={question.question_id}
                questionText={question.question_name}
                answers={getAnswersForQuestion(question.question_id)}
                selectedAnswer={selectedAnswers[question.question_id]}
                mode="review"
                readOnly={true}
              />
            )}

            {(question.que_type_id === 2 || question.que_type_id === 3) && (
              <MultiSelectQuestion
                questionId={question.question_id}
                questionText={question.question_name}
                answers={getAnswersForQuestion(question.question_id)}
                selectedAnswers={selectedAnswers[question.question_id] || []}
                mode="review"
                readOnly={true}
              />
            )}

            {question.que_type_id === 4 && (
              <FillInTheBlankQuestionShadcn
                questionId={question.question_id.toString()}
                questionText={question.question_name}
                value={selectedAnswers[question.question_id]}
                readOnly={true}
              />
            )}

            {question.que_type_id === 5 && (
              <DragAndDropWrapper
                answers={getAnswersForQuestion(question.question_id)}
                questionId={question.question_id}
                value={selectedAnswers[question.question_id]}
                readOnly={true}
              />
            )}

            {question.que_type_id === 6 && (
              <MatchingByLineWrapper
                questions={matchingData.questions}
                answers={matchingData.answers}
                questionId={question.question_id}
                z
                readOnly={true}
              />
            )}
          </div>
        ))}
      </div>

      <div className="hidden lg:block lg:w-1/6 h-fit sticky top-4 self-start">
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

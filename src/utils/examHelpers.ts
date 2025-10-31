// ==========================================
// 📁 utils/examHelpers.ts
// ==========================================
import type { Answer } from "@/types/exam";

export function getAnsweredQuestionsCount(selectedAnswers: Record<number, any>) {
  return Object.keys(selectedAnswers).filter((key) => {
    const answer = selectedAnswers[Number(key)];
    if (answer === null || answer === undefined) return false;
    if (typeof answer === "string") return answer.trim().length > 0;
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === "object") return Object.keys(answer).length > 0;
    return true;
  }).length;
}

export function getAnswersByQuestion(answers: Answer[]) {
  const map = new Map<number, Answer[]>();
  answers.forEach((answer) => {
    const qid = answer.question_id;
    if (qid !== null) {
      if (!map.has(qid)) map.set(qid, []);
      map.get(qid)!.push(answer);
    }
  });
  return map;
}

export function getMatchingData(answers: Answer[]) {
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
}

export function getDisplayQuestions(
  questions: any[],
  requestedCount: string | null
) {
  if (!requestedCount) return questions;
  const count = parseInt(requestedCount);
  if (isNaN(count) || count <= 0) return questions;
  return questions.slice(0, count);
}
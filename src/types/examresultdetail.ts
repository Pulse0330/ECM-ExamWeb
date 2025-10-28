// types/exam.ts

/**
 * Answer type for all question types
 */
export interface Answer {
  answer_id: number;
  answer_name: string;
  answer_name_html: string;
  answer_descr: string;
  answer_img: string;
  is_true: number; // 0 = false, 1 = true
  exam_que_id: number;
  answer_type: number;
  refid: number;
  ref_child_id: number | null;
  test_id: number;
}

/**
 * Question type
 */
export interface Question {
  exam_id: number;
  row_num: string;
  exam_que_id: number;
  question_img: string;
  que_zaawar: string;
  que_type_id: number; // 1=single, 2=multi, 3=fill, 4=drag, 5=match
  que_onoo: number;
  question_name: string;
  is_src: number;
  source_html: string;
  shinjilgee: number;
  bodolt: number;
  filename: string;
  unelsen: number;
  zad_onoo: number;
  zad_descr: string;
  urltype: string;
}

/**
 * User's chosen answer
 */
export interface ChosenAnswer {
  exam_que_id: number;
  answer_id: number | number[];
  answer: string;
  quetype: number;
}

/**
 * Question with explanation
 */
export interface QuestionExplanation {
  exam_que_id: number;
  descr: string;
  img_file: string;
}

/**
 * Exam result summary
 */
export interface ExamResult {
  test_id: number;
  lesson_name: string;
  test_title: string;
  test_type_name: string;
  test_date: string;
  test_time: string;
  test_ttl: number;
  correct_ttl: number;
  not_answer: number;
  wrong_ttl: number;
  ttl_point: number;
  point: number;
  point_perc: number;
  fname: string;
}

/**
 * Complete exam data response
 */
export interface ExamDataResponse {
  RetResponse: {
    ResponseMessage: string;
    StatusCode: string;
    ResponseCode: string;
    ResponseType: boolean;
  };
  RetDataFirst: ExamResult[];
  RetDataSecond: Question[];
  RetDataThirt: Answer[];
  RetDataFourth: ChosenAnswer[];
  RetDataFifth: QuestionExplanation[];
  RetDataSixth: any;
}

/**
 * Props for SingleSelectQuestion component
 */
export interface SingleSelectQuestionProps {
  questionId: number;
  questionText: string;
  answers: Answer[];
  mode: 'exam' | 'review' | 'practice';
  selectedAnswer: number | null;
  onAnswerChange?: (questionId: number, answerId: number | null) => void;
}

/**
 * Props for MultiSelectQuestion component
 */
export interface MultiSelectQuestionProps {
  questionId: number;
  questionText: string;
  answers: Answer[];
  mode: 'exam' | 'review' | 'practice';
  selectedAnswers: number[];
  onAnswerChange?: (questionId: number, answerIds: number[]) => void;
}

/**
 * Props for FillInTheBlankQuestion component
 */
export interface FillInTheBlankQuestionProps {
  questionId: string;
  questionText: string;
  mode: 'exam' | 'review' | 'practice';
  userAnswer?: string;
  correctAnswer?: string;
  onAnswerChange?: (questionId: string, answer: string) => void;
}

/**
 * Props for DragAndDropQuestion component
 */
export interface DragAndDropQuestionProps {
  questionId: number;
  answers: Answer[];
  mode: 'exam' | 'review' | 'practice';
  userAnswers?: { [key: string]: string };
  onAnswerChange?: (questionId: number, answers: { [key: string]: string }) => void;
}

/**
 * Props for MatchingQuestion component
 */
export interface MatchingQuestionProps {
  questionId: number;
  leftItems: Answer[];
  rightItems: Answer[];
  mode: 'exam' | 'review' | 'practice';
  userMatches?: { [key: number]: number };
  correctMatches?: { [key: number]: number };
  onAnswerChange?: (questionId: number, matches: { [key: number]: number }) => void;
}

/**
 * Question mode type
 */
export type QuestionMode = 'exam' | 'review' | 'practice';

/**
 * Question type enum
 */
export enum QuestionType {
  SINGLE_SELECT = 1,
  MULTI_SELECT = 2,
  FILL_IN_BLANK = 3,
  DRAG_AND_DROP = 4,
  MATCHING = 5
}

/**
 * Helper function to determine question type
 */
export function getQuestionType(typeId: number): string {
  switch (typeId) {
    case QuestionType.SINGLE_SELECT:
      return 'Single Select';
    case QuestionType.MULTI_SELECT:
      return 'Multi Select';
    case QuestionType.FILL_IN_BLANK:
      return 'Fill in the Blank';
    case QuestionType.DRAG_AND_DROP:
      return 'Drag and Drop';
    case QuestionType.MATCHING:
      return 'Matching';
    default:
      return 'Unknown';
  }
}

/**
 * Helper function to check if answer is correct
 */
export function isAnswerCorrect(answer: Answer): boolean {
  return answer.is_true === 1;
}

/**
 * Helper function to get user's answer for a question
 */
export function getUserAnswer(
  questionId: number,
  chosenAnswers: ChosenAnswer[]
): ChosenAnswer | undefined {
  return chosenAnswers.find((ans) => ans.exam_que_id === questionId);
}

/**
 * Helper function to calculate score
 */
export function calculateScore(
  questions: Question[],
  chosenAnswers: ChosenAnswer[],
  allAnswers: Answer[]
): {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  notAnswered: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
} {
  const totalQuestions = questions.length;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let notAnswered = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  questions.forEach((question) => {
    totalPoints += question.que_onoo;
    
    const userAnswer = getUserAnswer(question.exam_que_id, chosenAnswers);
    
    if (!userAnswer) {
      notAnswered++;
      return;
    }

    const questionAnswers = allAnswers.filter(
      (ans) => ans.exam_que_id === question.exam_que_id
    );

    // Check if answer is correct based on question type
    let isCorrect = false;

    if (question.que_type_id === QuestionType.SINGLE_SELECT) {
      const selectedAnswer = questionAnswers.find(
        (ans) => ans.answer_id === userAnswer.answer_id
      );
      isCorrect = selectedAnswer?.is_true === 1;
    } else if (question.que_type_id === QuestionType.MULTI_SELECT) {
      const selectedIds = Array.isArray(userAnswer.answer_id)
        ? userAnswer.answer_id
        : [userAnswer.answer_id];
      const correctIds = questionAnswers
        .filter((ans) => ans.is_true === 1)
        .map((ans) => ans.answer_id);
      
      isCorrect =
        selectedIds.length === correctIds.length &&
        selectedIds.every((id) => correctIds.includes(id));
    }

    if (isCorrect) {
      correctAnswers++;
      earnedPoints += question.que_onoo;
    } else {
      wrongAnswers++;
    }
  });

  const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    notAnswered,
    totalPoints,
    earnedPoints,
    percentage
  };
}
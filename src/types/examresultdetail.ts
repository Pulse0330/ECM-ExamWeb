// ========================
// API Response Types
// ========================

interface ApiResponse {
  RetResponse: {
    ResponseMessage: string;
    StatusCode: string;
    ResponseCode: string;
    ResponseType: boolean;
  };
  RetDataFirst: ExamInfo[];
  RetDataSecond: Question[];
  RetDataThirt: Answer[];
  RetDataFourth: UserAnswer[];
  RetDataFifth: Explanation[];
  RetDataSixth: null;
}

// Exam Info (Шалгалтын ерөнхий мэдээлэл)
interface ExamInfo {
  test_id: number;
  lesson_name: string;
  test_title: string;
  test_type_name: string;
  test_date: string; // ISO date string
  test_time: string; // "HH:MM:SS"
  test_ttl: number; // Нийт асуулт
  correct_ttl: number; // Зөв хариулт
  not_answer: number; // Хариулаагүй
  wrong_ttl: number; // Буруу хариулт
  ttl_point: number; // Нийт оноо
  point: number; // Олсон оноо
  point_perc: number; // Хувь
  fname: string; // Суралцагчийн нэр
}

// Question (Асуулт)
interface Question {
  exam_id: number;
  row_num: string;
  exam_que_id: number;
  question_img: string;
  que_zaawar: string;
  que_type_id: number; // 1=Single, 2-3=Multi, 4=FillBlank, 5=DragDrop, 6=Matching
  que_onoo: number;
  question_name: string; // HTML content
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

// Answer (Хариултууд)
interface Answer {
  answer_id: number;
  answer_name: string;
  answer_name_html: string; // HTML content
  answer_descr: string;
  answer_img: string;
  is_true: number; // 0=буруу, 1=зөв
  exam_que_id: number;
  answer_type: number; // 1=normal, 3=fill-in-box type
  refid: number;
  ref_child_id: number | null; // -1 for matching answers, others for questions
  test_id: number;
}

// User Answer (Хэрэглэгчийн өгсөн хариулт)
interface UserAnswer {
  exam_que_id: number;
  answer_id: number;
  answer: string; // For fill-in-blank or complex answers (JSON string for type 5-6)
  quetype: number; // Same as que_type_id
}

// Explanation (Тайлбар)
interface Explanation {
  exam_que_id: number;
  descr: string; // HTML content
  img_file: string;
}

// ========================
// Helper Types
// ========================

// Grouped data structure
interface GroupedExamData {
  examInfo: ExamInfo;
  questionsByType: Map<number, Question[]>; // Grouped by que_type_id
  answersByQuestion: Map<number, Answer[]>; // Grouped by exam_que_id
  userAnswersByQuestion: Map<number, UserAnswer>; // Mapped by exam_que_id
  explanationsByQuestion: Map<number, Explanation>; // Mapped by exam_que_id
}

// For Type 3 (Fill-in-box) questions
interface FillInBoxAnswer extends Answer {
  answer_name: string; // 'a', 'b', 'c', etc.
  answer_name_html: string; // The actual value to fill
}

// For Type 5 (Drag & Drop)
type DragDropOrder = number[]; // Array of answer_id in correct order

// For Type 6 (Matching)
type MatchingPairs = Record<number, number>; // { question_answer_id: matching_answer_id }

// ========================
// Component Props Types
// ========================

interface ExamResultPageProps {
  testId: number;
  examId: number;
  userId: number;
}

interface QuestionItemProps {
  question: Question;
  answers: Answer[];
  userAnswer?: UserAnswer;
  explanation?: Explanation;
  mode: "review";
}
export interface AnswerItem {
  question_id: number;
  answer_id: number;
  answer_name: string;
  answer_name_html: string;
  ismaths: number;
  answer_descr: string;
  answer_img: string;
  answer_type: number;
  refid: number;
  ref_child_id: number | null;
}

export interface QuestionItem {
  row_num: string;
  question_id: number;
  question_img: string;
  que_type_id: number;
  que_onoo: number;
  question_name: string;
  ismaths: number;
  is_src: number;
  source_name: string | null;
  source_img: string | null;
  is_shinjilgee: number;
  is_bodolt: number;
}

export interface Answer {
  id: string;
  content?: string;
  imageUrl?: string;
  refid?: number;
  isQuestion?: boolean;
  
}

export interface Question {
  id: string;
  question_id: number; 
  content?: string;
  imageUrl?: string;
  que_type_id: number;
   refid?: number; 
}

export interface AnswerResult {
  QueType: number;
  QueID: number;
  AnsID: number;
  Answer: string;
  PageNum: number;
}

export interface ExamFlag {
  exam_id: number;
  flag_name: string;
  flag: number;
}

export interface RetDataResponse {
  RetData: ExamFlag[];
}

export interface RetResponse {
  ResponseMessage: string;
  StatusCode: string;
  ResponseCode: string;
  ResponseType: boolean;
}

export interface ExamInfo {
  id: number;
  title: string;
  descr: string;
  help: string;
  is_date: number;
  end_time: string;
  minut: number;
  que_cnt: number;
  exam_type_name: string;
  exam_type: number;
  start_eid: number;
}

export interface ExamDataResponse {
  RetResponse: RetResponse;
  ExamInfo: ExamInfo[];
  Questions: QuestionItem[];
  Answers: AnswerItem[];
  ChoosedAnswer: AnswerResult[];
  ChoosedFiles: unknown[];
  RetData: ExamFlag[];
}

export interface AnswerData {
  answer_id: number;
  answer_name_html?: string;
  answer_img?: string;
  answer_type: number;
}

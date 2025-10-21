// src/types/examFinish.ts

export interface ExamFinishRequest {
  exam_id: number;
  exam_type: number;
  start_eid: number;
  exam_time: number;
  user_id: number;
}

export interface ExamFinishResponse {
  RetResponse: {
    ResponseCode: string;
    ResponseMessage: string;
    StatusCode: string;
  };
  RetData?: {
    success: boolean;
    score?: number;
  };
}
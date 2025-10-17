// src/lib/api.ts
import api from "./axios";
import { LoginResponseType } from "@/types/login";
import {HomeResponseType} from "@/types/home";
import { ApiExamlistsResponse } from "@/types/examlists";
import { ApiSorillistsResponse } from "@/types/sorillists";
import {UserProfileResponseType} from "@/types/userProfile";
import { ApiExamResponse, SaveAnswerRequest, SaveAnswerResponse } from "@/types/exam";
export const loginRequest = async (
  username: string,
  password: string
): Promise<LoginResponseType> => {
  const { data } = await api.post<LoginResponseType>("/login", {
    username,
    password,
    deviceid: "",
    devicemodel: "",
    
  });
  return data;
};

// ===== HomeScreen request =====


export const getHomeScreen = async (
  userId: number
) :  Promise<HomeResponseType> =>{
  const { data } = await api.post<HomeResponseType>("/gethomescreen", {
    user_id: userId,
  });
  return data;
};


// ===== " Examlists request =====

export const getExamlists = async (
  userId: number
) :  Promise<ApiExamlistsResponse> =>{
  const { data } = await api.post<ApiExamlistsResponse>("/getexamlists", {
    user_id: userId,
    "optype":0,
  });
  return data;
};


// ===== " Sorillists request =====

export const getSorillists = async (
  userId: number
) :  Promise<ApiSorillistsResponse> =>{
  const { data } = await api.post<ApiSorillistsResponse>("/getexamlists", {
    user_id: userId,
    "optype":1,
  });
  return data;
};

// ===== " UserProfile request =====
export const getUserProfile = async (
  userId: number
) :  Promise<UserProfileResponseType> =>{
  const { data } = await api.post<UserProfileResponseType>("/getuserprofile", {
    user_id: userId,
  });
  return data;
};

// ===== " Exam request =====

export const getExamById = async (userId: number, examId: number): Promise<ApiExamResponse> => {
  const { data } = await api.post<ApiExamResponse>("/getexamfill", {
    user_id: userId,
    exam_id: examId,
  });
  return data;
};
// ===== " ExamSave request =====
export const saveAnswer = async (
  request: SaveAnswerRequest
): Promise<SaveAnswerResponse> => {
  let answerId: number | null = null;
  let answerText = "";

  // Determine answer_id and answer based on type
  if (typeof request.answerValue === "number") {
    answerId = request.answerValue;
  } else if (typeof request.answerValue === "string") {
    answerText = request.answerValue;
  } else if (Array.isArray(request.answerValue)) {
    // For multiple choice questions - store all selected answers
    answerId = request.answerValue.length > 0 ? request.answerValue[0] : null;
    answerText = JSON.stringify(request.answerValue);
  } else if (request.answerValue && typeof request.answerValue === "object") {
    // For matching or complex answer types
    answerText = JSON.stringify(request.answerValue);
  }

  const payload = {
    que_type_id: request.queTypeId,
    question_id: request.questionId,
    answer_id: answerId,
    answer: answerText,
    row_num: 1, // Default to 1, can be made dynamic if needed
    exam_id: request.examId,
    user_id: request.userId,
    // conn will be added automatically by axios interceptor
  };

  const { data } = await api.post<SaveAnswerResponse>(
    "/examchoosedanswer",
    payload
  );
  return data;
};





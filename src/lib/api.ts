// src/lib/api.ts
import api from "./axios";
import { LoginResponseType } from "@/types/login";
import {HomeResponseType} from "@/types/home";
import { ApiExamlistsResponse } from "@/types/examlists";
import { ApiSorillistsResponse } from "@/types/sorillists";
import {UserProfileResponseType} from "@/types/userProfile";
import {  ExamFinishResponse } from "@/types/examfinish";
import { ApiExamResponse ,ExamInfo} from "@/types/exam";
import { ExamAnswerResponse } from "@/types/examChoosedAnswer";


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


// ===== " ExamFinish request =====

export const finishExam = async (
  userId: number,
   examInfo: ExamInfo, 
): Promise<ExamFinishResponse> => {
  const { data } = await api.post<ExamFinishResponse>("/examfinish", {
    exam_id: examInfo.id,
    exam_type: examInfo.exam_type,
    start_eid: examInfo.start_eid,
    exam_time: examInfo.minut,
    user_id: userId,
  
  });
  return data;
};
// ===== " ExamSave request =====

export const saveExamAnswer = async (
  userId: number,
  examId: number,
  questionId: number,
  answerId: number,
  queTypeId: number,
  answer: string = "",
  rowNum: number = 1
): Promise<ExamAnswerResponse> => {
  const { data } = await api.post<ExamAnswerResponse>("/examchoosedanswer", {
    que_type_id: queTypeId,
    question_id: questionId,
    answer_id: answerId,
    answer: answer,
    row_num: rowNum,
    exam_id: examId,
    user_id: userId,
  });
  return data;
};

// =====  Get Exam Results =====
export const getExamResults = async (
  testId: number
): Promise<any> => {
  const { data } = await api.post("/getexamresults", {
    test_id: testId,
  });
  return data;
};

// =====  (detailed results) =====
export const getExamResultMore = async (
  testId: number,
  examId: number,
  userId: number
): Promise<any> => {
  const { data } = await api.post("/resexammore", {
    test_id: 16016,
    exam_id: 7900,
    user_id: 223221,
  });
  return data;
};
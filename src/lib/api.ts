// src/lib/api.ts
import api from "./axios";
import { LoginResponseType } from "@/types/login";
import {HomeResponseType} from "@/types/home";
import { ExamlistsResponseTye } from "@/types/examlists";

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
) :  Promise<ExamlistsResponseTye> =>{
  const { data } = await api.post<ExamlistsResponseTye>("/getexamlists", {
    user_id: userId,
    "optype":0,
  });
  return data;
};

// // ===== " SorilList request =====
// export const fetchSorilList = async (userId: number) => {
//   try {
//     // getSorullists-ийг src/lib/api-аас авна
//     const examData = await getSorullists(userId); 

//     if (!examData.RetResponse.ResponseType) {
//       throw new Error("Soril list fetch амжилтгүй: " + examData.RetResponse.ResponseMessage);
//     }

//     return examData;
//   } catch (error: any) {
//     console.error("API алдаа:", error.message || error);
//     throw error;
//   }
// }


// src/lib/axios.ts
import axios from "axios";

// Login-ийн хариу type
export interface LoginType {
  RetResponse: {
    ResponseMessage: string;
    StatusCode: string;
    ResponseCode: string;
    ResponseType: boolean;
  };
  RetData: number; // User ID
}

// Base Axios instance
export const api = axios.create({
  baseURL: "https://ottapp.ecm.mn/api",
  headers: { "Content-Type": "application/json" },
});

// Connection config
export const conn = {
  user: "edusr",
  password: "sql$erver43",
  database: "ikh_ott",
  server: "172.16.1.79",
  pool: { max: 100000, min: 0, idleTimeoutMillis: 30000000 },
  options: { encrypt: false, trustServerCertificate: false },
};

// ===== Login request =====
export const loginRequest = async (
  username: string,
  password: string
): Promise<LoginType> => {
  const { data } = await api.post<LoginType>("/login", {
    username,
    password,
    deviceid: "",
    devicemodel: "",
    conn,
  });

  return data;
};

// ===== HomeScreen request =====
export const getHomeScreen = async (userId: number) => {
  const { data } = await api.post("/gethomescreen", {
    user_id: userId,
    conn,
  });

  return data;
};

// ===== Full dynamic usage example =====
export const fetchHomeScreen = async (username: string, password: string) => {
  try {
    // 1️⃣ Login
    const loginRes = await loginRequest(username, password);
    if (!loginRes.RetResponse.ResponseType) {
      throw new Error("Login failed: " + loginRes.RetResponse.ResponseMessage);
    }

    const userId = loginRes.RetData; // ✅ user id

    // 2️⃣ Get HomeScreen
    const homeData = await getHomeScreen(userId);
    return homeData;
  } catch (error: any) {
    console.error("API Error:", error.message || error);
    throw error;
  }
};

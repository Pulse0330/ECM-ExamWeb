"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface Exam {
  exam_id: number;
  title: string;
  ognoo: string;
  exam_minute: number;
  que_cnt: number;
  teach_name: string;
  ispaydescr: string;
  amount: number;
  ispurchased: number;
  plan_name: string;
}

// SQL connection config (API-д илгээх)
const conn = {
  user: "edusr",
  password: "sql$erver43",
  database: "ikh_ott",
  server: "172.16.1.79",
  pool: { max: 100000, min: 0, idleTimeoutMillis: 30000000 },
  options: { encrypt: false, trustServerCertificate: false },
};

export default function ExamListPage() {
  const userId = useAuthStore((state) => state.userId);
  const [now, setNow] = useState<Date>(new Date());

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // API-г шууд axios-ээр дуудах
  const fetchExams = async (id: number) => {
    const { data } = await axios.post(
      "https://ottapp.ecm.mn/api/getexamlists",
      {
        user_id: id,
        optype: 0,
        conn,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!data.RetResponse.ResponseType) {
      throw new Error(data.RetResponse.ResponseMessage || "API алдаа");
    }

    return data.RetData || [];
  };

  const {
    data: exams,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["exams", userId],
    queryFn: () => fetchExams(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
        <p>Шалгалтын мэдээллийг татаж байна...</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
        <p>API дуудахад алдаа гарлаа</p>
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-950">
      <h1 className="text-3xl font-bold mb-6">Шалгалтын жагсаалт</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams?.map((exam: Exam) => {
          const startTime = new Date(exam.ognoo);
          const endTime = new Date(
            startTime.getTime() + exam.exam_minute * 60000
          );
          const isActive = now >= startTime && now <= endTime;
          const isUpcoming = now < startTime;
          const isPayable =
            exam.ispaydescr === "Төлбөртэй" && exam.ispurchased === 0;

          return (
            <div
              key={exam.exam_id}
              className={`border-2 rounded-xl p-4 shadow-md transition ${
                isPayable
                  ? "border-red-500 bg-white"
                  : isActive
                  ? "border-green-500 bg-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              <h2 className="text-xl font-bold mb-2">{exam.title}</h2>
              <p>Багш: {exam.teach_name}</p>
              <p>Асуулт: {exam.que_cnt}</p>
              <p>Хугацаа: {exam.exam_minute} мин</p>
              <p>Эхлэх: {startTime.toLocaleString()}</p>
              <p>Дуусах: {endTime.toLocaleString()}</p>
              <p>
                Төлбөр:{" "}
                {isPayable
                  ? `${exam.amount.toLocaleString()}₮`
                  : "Төлбөргүй / Төлөгдсөн"}
              </p>
              {isActive && (
                <p className="text-green-600 font-bold">Идэвхтэй шалгалт</p>
              )}
              {isUpcoming && (
                <p className="text-blue-600 font-bold">Удахгүй эхлэх шалгалт</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

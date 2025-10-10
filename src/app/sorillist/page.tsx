"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSorullists } from "@/lib/api"; // <- API чинь энд байна гэж үзлээ
import { useQuery } from "@tanstack/react-query";

export default function ExamListPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const router = useRouter();

  // LocalStorage-с userId авч, цаг шинэчилж байна
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(Number(id));

    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // API дуудах wrapper функц
  const fetchExamListWrapper = async (id: number) => {
    const response = await getSorullists(id);
    return response.RetData || [];
  };

  // React Query ашиглан өгөгдөл татаж байна
  const {
    data: exams,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["examList", userId],
    queryFn: () => fetchExamListWrapper(userId!),
    enabled: !!userId,
  });

  // Харагдах хэсэг
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading exams</div>;
  if (!exams || exams.length === 0) return <div>No exam data found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📝 Exam List</h1>

      {/* JSON хэлбэрээр харуулах */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Raw JSON Data:</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(exams, null, 2)}
        </pre>
      </div>

      {/* Хэрвээ өгөгдөлд тодорхой талбарууд байгаа бол жагсаалтаар харуулах */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Formatted List:</h2>
        <ul className="space-y-3">
          {exams.map((exam: any) => (
            <li
              key={exam.id}
              className="p-4 border rounded bg-white dark:bg-gray-900"
            >
              <div>
                <strong>ID:</strong> {exam.id}
              </div>
              <div>
                <strong>Name:</strong> {exam.name}
              </div>
              <div>
                <strong>Date:</strong> {exam.date}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

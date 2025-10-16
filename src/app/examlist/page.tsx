"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { getExamlists } from "@/lib/api";
import { useRouter } from "next/navigation";
import ExamCard from "./examcard";

export default function ExamListPage() {
  const userId = useAuthStore((s) => s.userId);
  const router = useRouter();
  const now = new Date();

  const [searchTerm, setSearchTerm] = useState("");

  const mutation = useMutation({
    mutationFn: ({ id }: { id: number }) => getExamlists(id),
  });

  useEffect(() => {
    if (userId) mutation.mutate({ id: userId });
  }, [userId]);
  const data = mutation.data?.RetData || [];

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter((exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  return (
    <div className="p-4">
      {/* 🔎 Хайлтын input */}
      <div className="relative mb-6 max-w-md mx-auto">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Шалгалтын нэрээр хайх..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* 🔹 Жагсаалт */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredData.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            {searchTerm
              ? "Тийм нэртэй шалгалт олдсонгүй."
              : "Шалгалт олдсонгүй."}
          </p>
        ) : (
          filteredData.map((exam) => (
            <ExamCard
              key={exam.exam_id}
              exam={exam}
              now={now}
              router={router}
            />
          ))
        )}
      </div>
    </div>
  );
}

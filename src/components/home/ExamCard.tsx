// components/ExamCard.tsx
import React from "react";
import { DashboardCard } from "@/components/home/Dashboard";

interface ExamCardProps {
  title: string;
  teacher: string;
  questions: number;
  minutes: number;
  amount: number;
  flag?: string;
}

export const ExamCard = ({
  title,
  teacher,
  questions,
  minutes,
  amount,
  flag,
}: ExamCardProps) => (
  <DashboardCard>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
      Багш: {teacher}
    </p>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
      Асуулт: {questions} | {minutes} минут
    </p>
    <p className="text-2xl font-bold text-indigo-500 mb-4">
      {amount.toLocaleString()}₮
    </p>
    {flag && (
      <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
        {flag}
      </button>
    )}
  </DashboardCard>
);

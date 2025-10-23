"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import DragAndDrop from "./DragAndDrop";

interface Answer {
  answer_id: number;
  answer_name_html: string;
}

interface DragAndDropWrapperProps {
  answers: Answer[];
  questionId: number;
  examId: number;
  userId: number;
  onOrderChange?: (orderedIds: number[]) => void;
}

export default function DragAndDropWrapper({
  answers,
  questionId,
  examId,
  userId,
  onOrderChange,
}: DragAndDropWrapperProps) {
  const [items, setItems] = useState<Answer[]>(answers);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setItems(answers);
  }, [answers]);

  const handleOrderChange = useCallback(
    (orderedIds: number[]) => {
      console.log("📝 Drag and drop new order:", orderedIds);

      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce: wait 1.5 seconds before calling parent
      saveTimeoutRef.current = setTimeout(() => {
        // Let parent component handle the save
        onOrderChange?.(orderedIds);
      }, 1500);
    },
    [onOrderChange]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div>
      <h3 className="font-semibold mb-2">Зөв дараалалд оруулна уу</h3>
      <DragAndDrop answers={items} onOrderChange={handleOrderChange} />
    </div>
  );
}

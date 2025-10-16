"use client";

import React, { useState, useEffect } from "react";
import DragAndDrop from "./DragAndDrop";

interface Answer {
  answer_id: number;
  answer_name_html: string;
}

interface DragAndDropWrapperProps {
  answers: Answer[];
  onOrderChange?: (orderedIds: number[]) => void;
}

export default function DragAndDropWrapper({
  answers,
  onOrderChange,
}: DragAndDropWrapperProps) {
  const [items, setItems] = useState<Answer[]>(answers);

  useEffect(() => {
    setItems(answers);
  }, [answers]);

  return (
    <div>
      <h3 className="font-semibold mb-2">Зөв дараалалд оруулна уу</h3>

      <DragAndDrop answers={items} />
    </div>
  );
}

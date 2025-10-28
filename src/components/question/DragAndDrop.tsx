"use client";

import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Answer {
  answer_id: number;
  answer_name_html: string;
}

interface Props {
  answers: Answer[];
  droppableId?: string;
  onOrderChange?: (orderedIds: number[]) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  correctIds?: number[];
}

export default function DragAndDrop({
  answers,
  droppableId = "droppable",
  onOrderChange,
  disabled = false,
  showCorrect = false,
  correctIds = [],
}: Props) {
  const [items, setItems] = useState<Answer[]>(answers || []);

  useEffect(() => {
    setItems(answers || []);
  }, [answers]);

  const onDragEnd = (result: DropResult) => {
    if (disabled || !result.destination) return;
    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    setItems(newItems);
    onOrderChange?.(newItems.map((i) => i.answer_id));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {items.map((item, index) => {
              const isCorrect =
                showCorrect && correctIds[index] === item.answer_id;

              return (
                <Draggable
                  key={item.answer_id}
                  draggableId={String(item.answer_id)}
                  index={index}
                  isDragDisabled={disabled}
                >
                  {(providedDraggable, snapshot) => (
                    <div
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "default" }),
                        "w-full mb-2 justify-start transition-colors duration-200 select-none",
                        disabled ? "cursor-default" : "cursor-move",
                        snapshot.isDragging && "bg-accent ring-2 ring-ring/50",
                        isCorrect &&
                          "border-green-500 bg-green-50 text-green-800",
                        showCorrect &&
                          !isCorrect &&
                          "border-red-400 bg-red-50 text-red-700"
                      )}
                      style={providedDraggable.draggableProps.style}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: item.answer_name_html,
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

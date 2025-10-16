// components/question/DragAndDrop.tsx
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

type Props = {
  answers: Answer[];
  droppableId?: string; // олон list-ийг ялгахын тулд
  onOrderChange?: (orderedIds: number[]) => void;
};

export default function DragAndDrop({
  answers,
  droppableId = "droppable",
  onOrderChange,
}: Props) {
  const [items, setItems] = useState<Answer[]>(answers || []);

  // Гаднаас answers өөрчлөгдөхөд state-ийг шинэчлэх
  useEffect(() => {
    setItems(answers || []);
  }, [answers]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);

    setItems(newItems);

    // Шинэ дарааллыг parent руу явуулах
    onOrderChange?.(newItems.map((i) => i.answer_id));
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <span>Зөв дараалалд оруулна уу</span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable
                  key={item.answer_id}
                  draggableId={String(item.answer_id)}
                  index={index}
                >
                  {(providedDraggable, snapshot) => (
                    <div
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "default" }),
                        "w-full cursor-move mb-2 justify-start transition-none",
                        snapshot.isDragging &&
                          "bg-accent ring-[2px] ring-ring/50"
                      )}
                      style={{ ...providedDraggable.draggableProps.style }}
                    >
                      {/* item.answer_name_html нь HTML string байж магад тул анхаар */}
                      {/* Хэрэв HTML гэж байгаа бол dangerouslySetInnerHTML ашиглаж болно, эсвэл энгийн text */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: item.answer_name_html,
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

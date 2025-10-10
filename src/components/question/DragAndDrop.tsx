"use client";

import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Answer {
  answer_id: number;
  answer_name_html: string;
}

export default function DragAndDrop({ answers }: { answers: Answer[] }) {
  const [items, setItems] = useState<Answer[]>(answers);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);

    setItems(newItems);
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <span>Зөв дараалалд оруулна уу</span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable
                  key={item.answer_id}
                  draggableId={item.answer_id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "default" }),
                        "w-full cursor-move mb-2 justify-start transition-none",
                        snapshot.isDragging &&
                          "bg-accent ring-[2px] ring-ring/50"
                      )}
                      style={{
                        ...provided.draggableProps.style,
                      }}
                    >
                      {item.answer_name_html}
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

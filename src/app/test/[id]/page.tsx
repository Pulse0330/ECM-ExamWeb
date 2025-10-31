// "use client";

// import FixedScrollButton from "@/components/FixedScrollButton";
// import React, {
//   useState,
//   useCallback,
//   useMemo,
//   useEffect,
//   useRef,
//   use,
// } from "react";
// import { useParams, useSearchParams, useRouter } from "next/navigation";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import SingleSelectQuestion from "@/components/question/sinleselect";
// import MultiSelectQuestion from "@/components/question/multiselect";
// import FillInTheBlankQuestionShadcn from "@/components/question/fillinblank";
// import DragAndDropWrapper from "@/components/question/DragAndDropWrapper";
// import MatchingByLineWrapper from "@/components/question/matchingWrapper";
// import MiniMap from "@/app/exam/minimap";
// import ITimer from "@/app/exam/itimer";
// import SubmitExamButtonWithDialog from "@/components/question/Submit";
// import {
//   Flag,
//   ChevronUp,
//   ChevronLeft,
//   ChevronRight,
//   AlertTriangle,
// } from "lucide-react";
// import { getExamById, saveExamAnswer, finishExam } from "@/lib/api";
// import { useAuthStore } from "@/stores/authStore";
// import { useExamStore } from "@/stores/examStore";
// import type { ApiExamResponse, Question, Answer } from "@/types/exam";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { getTestIdFromResponse, isExamSubmitSuccess } from "@/types/examfinish";

// export default function Home() {
//   const { id } = useParams();
//   const { userId } = useAuthStore();

//   const { data: examData } = useQuery<ApiExamResponse>({
//     queryKey: ["exam", userId, id],
//     queryFn: () => getExamById(userId!, Number(id)),
//     enabled: !!userId && !!id,
//     staleTime: 5 * 60 * 1000,
//   });

//   const { mutate } = useMutation({
//     mutationFn: (data) => saveExamAnswer(data),
//   });

//   return (
//     <main className="p-6">
//       <FixedScrollButton />
//       {examData?.Questions.map((question, index: number) => {
//         return (
//           <div>
//             {question.que_type_id === 1 && (
//               <SingleSelectQuestion
//                 questionId={question.question_id}
//                 questionText={question.question_name}
//                 answers={question.answers}
//                 mode="exam"
//                 selectedAnswer={selectedAnswer as number | null}
//                 onAnswerChange={mutate}
//               />
//             )}
//           </div>
//         );
//       })}
//     </main>
//   );
// }

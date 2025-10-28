"use client";

import React, { useState } from "react";
import { CheckCircle, Loader2, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { finishExam, getExamResults } from "@/lib/api";
import {
  getTestIdFromResponse,
  isExamSubmitSuccess,
  getResponseMessage,
} from "@/types/examfinish";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ExamInfo } from "@/types/exam";

interface SubmitExamButtonProps {
  userId: number;
  examInfo: ExamInfo;
  totalQuestions: number;
  answeredQuestions: number;
  onSuccess?: (testId: number) => void;
  onError?: (error: string) => void;
}

export default function SubmitExamButtonWithDialog({
  userId,
  examInfo,
  totalQuestions,
  answeredQuestions,
  onSuccess,
  onError,
}: SubmitExamButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);

  const unanswered = totalQuestions - answeredQuestions;
  const allAnswered = unanswered === 0;
  const progressPercentage = Math.round(
    (answeredQuestions / totalQuestions) * 100
  );

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await finishExam(userId, examInfo);

      if (!isExamSubmitSuccess(response)) {
        throw new Error(getResponseMessage(response));
      }

      const testId = getTestIdFromResponse(response);

      if (testId) {
        // Дүнг server-с авах
        const resultData = await getExamResults(testId);
        setExamResult(resultData?.RetData?.[0] || null);
        setResultDialogOpen(true);
        setIsOpen(false);
        onSuccess?.(testId);
      } else {
        throw new Error("Test ID олдсонгүй");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Алдаа гарлаа";
      onError?.(message);
      alert(`❌ Алдаа гарлаа:\n\n${message}`);
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Desktop button */}
      <div className="hidden lg:block sticky top-6 mb-6">
        <Button
          onClick={() => setIsOpen(true)}
          disabled={isSubmitting}
          size="lg"
          className="w-full"
          variant={allAnswered ? "default" : "outline"}
        >
          Шалгалт дуусгах
          {!allAnswered && (
            <Badge variant="secondary" className="ml-2">
              {unanswered} хоосон
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile sticky button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-foreground">
                {answeredQuestions}/{totalQuestions}
              </span>
              <span className="text-muted-foreground font-medium">
                {progressPercentage}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <Button
            onClick={() => setIsOpen(true)}
            disabled={isSubmitting}
            size="lg"
            variant={allAnswered ? "default" : "destructive"}
            className="whitespace-nowrap"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Дуусгах
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-start gap-3 mb-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  allAnswered
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-orange-100 dark:bg-orange-900/30"
                }`}
              >
                {allAnswered ? (
                  <CheckCircle
                    className="text-green-600 dark:text-green-400"
                    size={24}
                  />
                ) : (
                  <AlertTriangle
                    className="text-orange-600 dark:text-orange-400"
                    size={24}
                  />
                )}
              </div>

              <div className="flex-1">
                <AlertDialogTitle className="text-xl mb-1">
                  Шалгалт дуусгах
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Та итгэлтэй байна уу?
                </AlertDialogDescription>
              </div>

              {!isSubmitting && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Үгүй, буцах
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Илгээж байна...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Тийм, дуусгах
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Result Dialog */}
      <AlertDialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <AlertDialogContent className="max-w-md">
          {examResult ? (
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-bold">{examResult.title}</h2>
              <p className="text-sm text-muted-foreground">
                Огноо: {new Date(examResult.test_date).toLocaleString()}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Нийт оноо</p>
                  <p className="text-lg font-bold">{examResult.ttl_point}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Зөв</p>
                  <p className="text-lg font-bold text-green-600">
                    {examResult.correct_ttl}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Буруу</p>
                  <p className="text-lg font-bold text-red-600">
                    {examResult.wrong_ttl}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Үнэлгээ</p>
                  <p className="text-lg font-bold">{examResult.unelgee}</p>
                </div>
              </div>
              <Button
                onClick={() => setResultDialogOpen(false)}
                className="mt-4"
              >
                Буцах
              </Button>
            </div>
          ) : (
            <p>Үр дүнг ачаалж байна...</p>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

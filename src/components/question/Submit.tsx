"use client";

import React, { useState } from "react";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
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
  startEid: number;
  examTime: number;
  examInfo: ExamInfo;
  totalQuestions: number;
  answeredQuestions: number;
}

export default function SubmitExamButtonWithDialog({
  userId,
  startEid,
  examTime,
  examInfo,
  totalQuestions,
  answeredQuestions,
}: SubmitExamButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const unanswered = totalQuestions - answeredQuestions;
  const allAnswered = unanswered === 0;
  const progressPercentage = Math.round(
    (answeredQuestions / totalQuestions) * 100
  );

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("📤 Submitting exam:", {
        userId,
        examId: examInfo.id,
        startEid,
        examTime,
      });

      // POST /examfinish
      const response = await finishExam(userId, examInfo);

      console.log("📥 Exam finish response:", response);

      if (!isExamSubmitSuccess(response)) {
        throw new Error(
          getResponseMessage(response) || "Шалгалт дуусгахад алдаа гарлаа"
        );
      }

      const testId = getTestIdFromResponse(response);

      if (!testId) {
        throw new Error("Test ID олдсонгүй");
      }

      console.log("✅ Exam finished successfully, test_id:", testId);

      // Үр дүн татах
      try {
        const results = await getExamResults(testId);
        console.log("📊 Exam results:", results);

        setExamResult(results.RetData?.[0] || null);
      } catch (resultsError) {
        console.warn("⚠️ Could not fetch results:", resultsError);
        // Үр дүн татаж чадаагүй ч шалгалт дууссан тул үргэлжлүүлнэ
      }

      setIsOpen(false);
      setResultOpen(true);
    } catch (error) {
      console.error("❌ Error finishing exam:", error);
      const message = error instanceof Error ? error.message : "Алдаа гарлаа";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseResult = () => {
    setResultOpen(false);
    // Үр дүн хаахад шалгалтын жагсаалт руу буцах
    router.push("/examdetail");
  };

  return (
    <>
      {/* Шалгалт дуусгах товч */}
      <div className="sticky top-6 mb-6">
        <Button
          onClick={() => setIsOpen(true)}
          disabled={isSubmitting}
          size="lg"
          className="w-full"
          variant={allAnswered ? "default" : "outline"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Илгээж байна...
            </>
          ) : (
            "Шалгалт дуусгах"
          )}
          {!allAnswered && !isSubmitting && (
            <Badge variant="secondary" className="ml-2">
              {unanswered} хоосон
            </Badge>
          )}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Шалгалт дуусгах</AlertDialogTitle>
            <AlertDialogDescription>
              Та шалгалтаа дуусгахдаа итгэлтэй байна уу?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Progress */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Нийт асуулт:</span>
                    <span className="font-semibold">{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Хариулсан:</span>
                    <span className="font-semibold text-green-600">
                      {answeredQuestions}
                    </span>
                  </div>
                  {unanswered > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Хоосон:</span>
                      <span className="font-semibold text-orange-600">
                        {unanswered}
                      </span>
                    </div>
                  )}
                  <Progress value={progressPercentage} className="h-2 mt-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    {progressPercentage}% дууссан
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Warning if not all answered */}
            {!allAnswered && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Та {unanswered} асуултад хариулаагүй байна. Хариулаагүй
                  асуултууд 0 оноотой тооцогдоно.
                </AlertDescription>
              </Alert>
            )}

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
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

      {/* Exam Result Dialog */}
      <AlertDialog open={resultOpen} onOpenChange={setResultOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Шалгалт амжилттай дууслаа
            </AlertDialogTitle>
          </AlertDialogHeader>

          {examResult ? (
            <div className="space-y-4 py-2">
              {/* Exam Info */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">
                    {examResult.title}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>Огноо:</strong>{" "}
                      {new Date(examResult.test_date).toLocaleString("mn-MN")}
                    </p>
                    <p>
                      <strong>Нэр:</strong> {examResult.fname}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Results Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="p-4 bg-green-50 dark:bg-green-950/30">
                    <p className="text-xs text-muted-foreground mb-1">
                      Зөв хариулт
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {examResult.correct_ttl}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="p-4 bg-red-50 dark:bg-red-950/30">
                    <p className="text-xs text-muted-foreground mb-1">
                      Буруу хариулт
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {examResult.wrong_ttl}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Score */}
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Олсон оноо:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {examResult.point}/{examResult.ttl_point}
                      </span>
                    </div>
                    <Progress value={examResult.point_perc} className="h-3" />
                    <p className="text-sm text-center text-muted-foreground">
                      {examResult.point_perc}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Grade */}
              {examResult.unelgee && (
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4 bg-purple-50 dark:bg-purple-950/30">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Үнэлгээ
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        {examResult.unelgee}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Alert>
                <AlertDescription>
                  Шалгалт амжилттай дууслаа. Үр дүнг удахгүй харж болно.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <AlertDialogFooter>
            <Button onClick={handleCloseResult} className="w-full" size="lg">
              Хаах
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

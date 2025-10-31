import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { finishExam, getExamResults } from "@/lib/api";
import { useExamStore } from "@/stores/examStore";
import {
  getTestIdFromResponse,
  isExamSubmitSuccess,
  getResponseMessage,
} from "@/types/examfinish";
import { ExamInfo } from "@/types/exam";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, Send, AlertTriangle } from "lucide-react";

interface SubmitExamButtonProps {
  userId: number;
  startEid: number;
  examTime: number;
  examInfo: ExamInfo;
  totalQuestions: number;
  answeredQuestions: number;
}

const SubmitExamButtonWithDialog: React.FC<SubmitExamButtonProps> = ({
  userId,
  startEid,
  examTime,
  examInfo,
  totalQuestions,
  answeredQuestions,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { setTestId } = useExamStore();

  const unanswered = totalQuestions - answeredQuestions;
  const allAnswered = unanswered === 0;
  const progressPercentage = Math.round(
    (answeredQuestions / totalQuestions) * 100
  );

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await finishExam(userId, examInfo);
      if (!isExamSubmitSuccess(response)) {
        throw new Error(
          getResponseMessage(response) || "Шалгалт дуусгахад алдаа гарлаа"
        );
      }

      const testId = getTestIdFromResponse(response);
      if (!testId) throw new Error("Test ID олдсонгүй");

      setTestId(testId);

      try {
        const results = await getExamResults(testId);
        setExamResult(results.RetData?.[0] || null);
      } catch {
        // үр дүн татахад алдаа
      }

      setIsOpen(false);
      setResultOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Алдаа гарлаа";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetailedResults = () => {
    const savedTestId = examResult?.test_id || useExamStore.getState().testId;
    const examId = examInfo.id;

    if (savedTestId && examId) {
      router.push(`/examdetail/${savedTestId}-${examId}`);
    } else {
      setError("Үр дүн харах боломжгүй байна");
    }
  };

  const handleCloseResult = () => {
    setResultOpen(false);
    router.push("/home");
  };

  return (
    <>
      {/* Button */}
      <Button
        onClick={() => setIsOpen(true)}
        disabled={isSubmitting}
        className="md:hidden"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Send size={14} />
        )}
      </Button>

      {/* Desktop Button */}
      <Button
        onClick={() => setIsOpen(true)}
        disabled={isSubmitting}
        className="hidden md:flex w-full"
        variant={allAnswered ? "default" : "outline"}
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Send size={14} />
        )}
        {!allAnswered && <Badge variant="secondary">{unanswered} хоосон</Badge>}
      </Button>

      {/* Confirmation Dialog */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Шалгалт дуусгах</AlertDialogTitle>
            <AlertDialogDescription>
              Та шалгалтаа дуусгахдаа итгэлтэй байна уу?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Буцах
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle />
              )}
              Дуусгах
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Result Dialog */}
      <AlertDialog open={resultOpen} onOpenChange={setResultOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Шалгалт амжилттай дууслаа</AlertDialogTitle>
          </AlertDialogHeader>
          {examResult ? (
            <Card>
              <CardContent>
                <h3>{examResult.title}</h3>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertDescription>Үр дүн удахгүй харагдана</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <Button onClick={handleCloseResult}>Хаах</Button>
            <Button onClick={handleViewDetailedResults}>Дэлгэрэнгүй</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SubmitExamButtonWithDialog;

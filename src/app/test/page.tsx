"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// -----------------------
// ExamProctor (desktop + mobile friendly)
export const ExamProctor: React.FC<{
  userId: string;
  onSubmit: () => void;
  onLogout?: () => void;
  maxSwitch?: number;
}> = ({ userId, onSubmit, onLogout, maxSwitch = 3 }) => {
  const [switchCount, setSwitchCount] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [blackScreen, setBlackScreen] = useState(false);

  const blockedRef = useRef(false);
  const switchLockRef = useRef(false);

  const handleSwitch = (message?: string) => {
    if (blockedRef.current || switchLockRef.current) return;
    switchLockRef.current = true;

    setSwitchCount((prev) => {
      const next = prev + 1;
      if (next >= maxSwitch) {
        blockedRef.current = true;
        setBlocked(true);
        setDialogMessage("🚫 Та 3 удаа tab сольсон тул шалгалт хаагдана.");
        setBlackScreen(true);

        setTimeout(() => {
          onSubmit();
          onLogout?.();
        }, 500);
      } else {
        setDialogMessage(
          message || `⚠️ Tab / focus loss илэрлээ (${next}/${maxSwitch})`
        );
        setBlackScreen(true);
      }
      return next;
    });

    setTimeout(() => {
      switchLockRef.current = false;
      if (!blockedRef.current) setBlackScreen(false);
    }, 2000);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Desktop + Mobile detection
    const handleBlurOrHide = () =>
      handleSwitch("⚠️ Tab / app switch / focus loss илэрлээ");
    const handleOrientationChange = () =>
      handleSwitch("⚠️ Screen orientation change илэрлээ");
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        handleSwitch("📷 Screenshot desktop-д илэрлээ");
      }
    };

    window.addEventListener("blur", handleBlurOrHide);
    document.addEventListener("visibilitychange", handleBlurOrHide);
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("blur", handleBlurOrHide);
      document.removeEventListener("visibilitychange", handleBlurOrHide);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleDialogClose = () => {
    setDialogMessage(null);
    setBlackScreen(false);
  };

  return (
    <>
      {blackScreen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "black",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "1.5rem",
            textAlign: "center",
          }}
        >
          {blocked
            ? "🚫 Шалгалт хаагдсан байна!"
            : "⚠️ Шалгалт хамгаалалт идэвхтэй байна"}
        </div>
      )}

      <div className="p-4 border rounded-md shadow-md mb-4 bg-card">
        <p className="font-semibold text-sm">
          Tab / focus loss тоо:{" "}
          <span
            className={
              switchCount >= maxSwitch - 1 ? "text-red-600 font-bold" : ""
            }
          >
            {switchCount}
          </span>{" "}
          / {maxSwitch}
        </p>
        {blocked && (
          <p className="text-red-600 font-bold mt-2">🚫 Шалгалт хаагдсан!</p>
        )}
      </div>

      <Dialog open={!!dialogMessage}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>⚠️ Анхааруулга</DialogTitle>
            <p>{dialogMessage}</p>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Ойлголоо</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// -----------------------
// Тест шалгалтын хуудсаг
export default function TestExamPage() {
  const [submitted, setSubmitted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleSubmit = () => {
    setShowDialog(true);
    setSubmitted(true);
  };

  const handleLogout = () => {
    alert("Logout triggered (тестээр)");
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        Тест шалгалт (Desktop + Mobile)
      </h1>

      <ExamProctor
        userId="12345"
        onSubmit={handleSubmit}
        onLogout={handleLogout}
      />

      <Button onClick={handleSubmit} size="lg" className="w-full">
        Шалгалт дуусгах (тестээр)
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Шалгалт дууссан (тест)</DialogTitle>
            <p>Шалгалт амжилттай дууслаа. (Тестийн хувилбар)</p>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Хаах</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {submitted && (
        <p className="mt-4 text-green-600 font-semibold">
          Шалгалт дуусгах үйлдэл дууслаа (тест)
        </p>
      )}
    </div>
  );
}

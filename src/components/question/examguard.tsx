"use client";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExamProctorProps {
  userId: string;
  onSubmit: () => void;
  onLogout?: () => void;
}

export const ExamProctor: React.FC<ExamProctorProps> = ({
  userId,
  onSubmit,
  onLogout,
}) => {
  const [switchCount, setSwitchCount] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [blackScreen, setBlackScreen] = useState(false);

  const blockedRef = useRef(false);
  const screenshotDetectedRef = useRef(false);

  const MAX_SWITCH = 3;

  useEffect(() => {
    const handleScreenshot = () => {
      screenshotDetectedRef.current = true;
      setDialogMessage("📷 Screenshot хийж байна...");
      setBlackScreen(true);
    };

    const handleSwitch = () => {
      if (blockedRef.current) return;
      setSwitchCount((prev) => {
        const next = prev + 1;
        if (next >= MAX_SWITCH) {
          blockedRef.current = true;
          setBlocked(true);
          setDialogMessage("Та 3 удаа tab сольсон тул шалгалт хаагдана.");
          setBlackScreen(true);
        }
        return next;
      });
    };

    const handleVisibility = () => {
      if (document.hidden) {
        handleSwitch();
        setBlackScreen(true);
      }
    };

    const handleBlur = () => {
      handleSwitch();
      setBlackScreen(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        handleScreenshot();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility, {
      passive: true,
    });
    window.addEventListener("blur", handleBlur, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const handleDialogClose = () => {
    setDialogMessage(null);
    setBlackScreen(false);
    if (blockedRef.current) {
      onSubmit();
      onLogout?.();
    }
  };

  return (
    <>
      {/* Black screen overlay */}
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
          }}
        >
          🚫 Шалгалт хамгаалалт идэвхтэй байна
        </div>
      )}

      <div className="p-4 border rounded-md shadow-md mb-4 bg-card">
        <p className="font-semibold text-sm">
          Tab сольсон тоо:{" "}
          <span className={switchCount >= 2 ? "text-red-600 font-bold" : ""}>
            {switchCount}
          </span>{" "}
          / {MAX_SWITCH}
        </p>
        {blocked && (
          <p className="text-red-600 font-bold mt-2">
            🚫 Шалгалт хаагдсан байна!
          </p>
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

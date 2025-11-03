"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Eye, Lock } from "lucide-react";

interface ExamProctorProps {
  onSubmit: () => void;
  onLogout?: () => void;
  maxViolations?: number;
  enableWebcam?: boolean;
  strictMode?: boolean;
  enableFullscreen?: boolean;
}

interface Violation {
  type: string;
  timestamp: Date;
  severity: "low" | "medium" | "high";
}

export const AdvancedExamProctor: React.FC<ExamProctorProps> = ({
  onSubmit,
  onLogout,
  maxViolations = 3,
  enableWebcam = false,
  strictMode = true,
  enableFullscreen = true,
}) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [blocked, setBlocked] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [blackScreen, setBlackScreen] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [mouseLeft, setMouseLeft] = useState(false);

  const blockedRef = useRef<boolean>(false);
  const violationLockRef = useRef<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mouseTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const onSubmitRef = useRef(onSubmit);
  const onLogoutRef = useRef(onLogout);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
    onLogoutRef.current = onLogout;
  }, [onSubmit, onLogout]);

  // ========================
  // Violation Logger
  // ========================
  const logViolation = useCallback(
    (type: string, severity: "low" | "medium" | "high", message: string) => {
      if (blockedRef.current || violationLockRef.current) return;
      violationLockRef.current = true;

      const violation: Violation = {
        type,
        timestamp: new Date(),
        severity,
      };

      setTimeout(() => {
        setViolations((prev) => {
          const newViolations = [...prev, violation];
          const criticalCount = newViolations.filter(
            (v) => v.severity === "high"
          ).length;

          if (criticalCount >= maxViolations) {
            blockedRef.current = true;

            setTimeout(() => {
              setBlocked(true);
              setDialogMessage(
                `🚫 Та ${maxViolations} удаа ноцтой дүрэм зөрчсөн тул шалгалт автоматаар дуусгагдана.`
              );
              setBlackScreen(true);

              setTimeout(() => {
                onSubmitRef.current();
                onLogoutRef.current?.();
              }, 3000);
            }, 0);
          } else {
            setTimeout(() => {
              setDialogMessage(message);
              setBlackScreen(true);

              setTimeout(() => {
                setBlackScreen(false);
                setDialogMessage(null);
              }, 2000);
            }, 0);
          }

          return newViolations;
        });

        setTimeout(() => {
          violationLockRef.current = false;
        }, 1000);
      }, 0);
    },
    [maxViolations]
  );

  // ========================
  // Tab Switch / Blur Detection
  // ========================
  useEffect(() => {
    if (!strictMode) return;

    let isUserInteracting = false;
    let lastFocusTime = Date.now();

    const handleFocus = () => {
      isUserInteracting = true;
      lastFocusTime = Date.now();
    };

    const handleBlur = () => {
      if (
        isUserInteracting &&
        Date.now() - lastFocusTime > 1000 &&
        !blockedRef.current
      ) {
        logViolation("TAB_SWITCH", "high", `⚠️ Өөр цонх руу шилжсэн байна`);
      }
      isUserInteracting = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isUserInteracting && !blockedRef.current) {
        logViolation("TAB_HIDDEN", "high", `⚠️ Шалгалтын цонх нуугдсан байна`);
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [logViolation, strictMode]);

  // ========================
  // Fullscreen Lock
  // ========================
  useEffect(() => {
    if (!enableFullscreen || !strictMode) return;

    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen not supported:", err);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !blockedRef.current) {
        logViolation(
          "FULLSCREEN_EXIT",
          "high",
          "⚠️ Fullscreen горимоос гарсан байна!"
        );
        setTimeout(enterFullscreen, 500);
      }
    };

    setTimeout(enterFullscreen, 500);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, [logViolation, strictMode, enableFullscreen]);

  // Бусад useEffect hooks үргэлжилнэ... (Tab switch, keyboard, mouse гэх мэт)
  // [Өмнөх кодын бүх useEffect-үүдийг энд хадгалаарай, зөвхөн isInitialized шалгалтыг устгасан]

  const criticalViolations = violations.filter(
    (v) => v.severity === "high"
  ).length;

  return (
    <>
      {blackScreen && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          <div className="text-white text-center space-y-4 p-6">
            <AlertTriangle className="w-20 h-20 mx-auto text-red-500 animate-pulse" />
            <h1 className="text-4xl font-bold">
              {blocked ? "🚫 Шалгалт дууссан!" : "⚠️ Анхааруулга"}
            </h1>
            <p className="text-xl max-w-md mx-auto">{dialogMessage}</p>
            {blocked && (
              <p className="text-sm text-gray-400 mt-4">
                Шалгалт автоматаар дуусгагдаж байна...
              </p>
            )}
          </div>
        </div>
      )}

      <div className="fixed top-4 right-4 z-50 space-y-2">
        <Alert
          variant={
            criticalViolations >= maxViolations - 1 ? "destructive" : "default"
          }
          className="w-64 shadow-lg"
        >
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">
              Ноцтой зөрчил: {criticalViolations}/{maxViolations}
            </div>
            {criticalViolations > 0 && criticalViolations < maxViolations && (
              <div className="text-orange-600 dark:text-orange-400 font-medium text-xs mt-1">
                ⚠️ Дахиад {maxViolations - criticalViolations} зөрчил үлдсэн!
              </div>
            )}
            {blocked && (
              <div className="text-red-600 dark:text-red-400 font-bold mt-1">
                🚫 Шалгалт хаагдсан!
              </div>
            )}
          </AlertDescription>
        </Alert>

        {enableWebcam && webcamActive && (
          <div className="w-64 bg-black rounded-lg overflow-hidden border-2 border-green-500 shadow-lg">
            <div className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 text-xs font-semibold">
              <Eye className="w-3 h-3" />
              Камер идэвхтэй
            </div>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full aspect-video"
            />
          </div>
        )}

        {mouseLeft && strictMode && (
          <Alert variant="destructive" className="w-64 shadow-lg animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-xs font-semibold">
                ⚠️ Хулгана цонхноос гарсан байна!
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-card border rounded-lg p-3 w-64 text-xs space-y-1.5 shadow-lg">
          <div className="font-semibold text-sm mb-2">Хамгаалалтын төлөв</div>
          {enableFullscreen && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Lock className="w-3 h-3" />
              <span>Fullscreen идэвхтэй</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Shield className="w-3 h-3" />
            <span>Хамгаалалт идэвхтэй</span>
          </div>
          {enableWebcam && webcamActive && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Eye className="w-3 h-3" />
              <span>Камер ажиллаж байна</span>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!dialogMessage && !blackScreen && !blocked}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Анхааруулга
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-base">{dialogMessage}</p>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-semibold">
                Ноцтой зөрчил: {criticalViolations}/{maxViolations}
              </p>
              {criticalViolations < maxViolations && (
                <p className="text-xs text-muted-foreground mt-1">
                  Дахиад {maxViolations - criticalViolations} зөрчил хийвэл
                  шалгалт автоматаар дуусна.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogMessage(null)}>Ойлголоо</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {process.env.NODE_ENV === "development" && violations.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-card border rounded-lg p-3 max-w-sm max-h-64 overflow-auto text-xs z-50 shadow-lg">
          <div className="font-bold mb-2 flex items-center justify-between">
            <span>Зөрчлийн түүх ({violations.length})</span>
            <button
              onClick={() => setViolations([])}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              Цэвэрлэх
            </button>
          </div>
          {violations.map((v, i) => (
            <div key={i} className="mb-1 text-xs py-1 border-b last:border-0">
              <span
                className={
                  v.severity === "high"
                    ? "text-red-600 font-bold"
                    : v.severity === "medium"
                    ? "text-orange-600 font-medium"
                    : "text-gray-600"
                }
              >
                [{v.severity.toUpperCase()}]
              </span>{" "}
              {v.type} - {v.timestamp.toLocaleTimeString("mn-MN")}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

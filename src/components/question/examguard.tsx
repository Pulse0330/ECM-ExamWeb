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
  userId: string;
  examId: string;
  onSubmit: () => void;
  onLogout?: () => void;
  maxViolations?: number;
  enableWebcam?: boolean;
  strictMode?: boolean;
}

interface Violation {
  type: string;
  timestamp: Date;
  severity: "low" | "medium" | "high";
}

export const AdvancedExamProctor: React.FC<ExamProctorProps> = ({
  userId,
  examId,
  onSubmit,
  onLogout,
  maxViolations = 3,
  enableWebcam = false,
  strictMode = true,
}) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [blocked, setBlocked] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [blackScreen, setBlackScreen] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [mouseLeft, setMouseLeft] = useState(false);

  const blockedRef = useRef(false);
  const violationLockRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mouseTimeoutRef = useRef<NodeJS.Timeout>();

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

      setViolations((prev) => {
        const newViolations = [...prev, violation];

        // Count high severity violations
        const criticalCount = newViolations.filter(
          (v) => v.severity === "high"
        ).length;

        if (criticalCount >= maxViolations) {
          blockedRef.current = true;
          setBlocked(true);
          setDialogMessage(
            `🚫 Та ${maxViolations} удаа дүрэм зөрчсөн тул шалгалт хаагдана.`
          );
          setBlackScreen(true);

          // Auto submit
          setTimeout(() => {
            onSubmit();
            onLogout?.();
          }, 2000);
        } else {
          setDialogMessage(message);
          setBlackScreen(true);
          setTimeout(() => {
            setBlackScreen(false);
            setDialogMessage(null);
          }, 2000);
        }

        // Send to API (optional)
        sendViolationToAPI(violation);

        return newViolations;
      });

      setTimeout(() => {
        violationLockRef.current = false;
      }, 1000);
    },
    [maxViolations, onSubmit, onLogout]
  );

  // ========================
  // API Logger (Placeholder)
  // ========================
  const sendViolationToAPI = (violation: Violation) => {
    // POST to your backend
    console.log("📤 Sending violation to API:", {
      userId,
      examId,
      violation,
    });

    // Example:
    // fetch('/api/exam/violations', {
    //   method: 'POST',
    //   body: JSON.stringify({ userId, examId, violation }),
    // });
  };

  // ========================
  // Tab Switch / Blur Detection
  // ========================
  useEffect(() => {
    const handleBlur = () => {
      logViolation(
        "TAB_SWITCH",
        "high",
        `⚠️ Tab солисон (${violations.length + 1}/${maxViolations})`
      );
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation(
          "TAB_HIDDEN",
          "high",
          `⚠️ Цонх нуугдсан (${violations.length + 1}/${maxViolations})`
        );
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [logViolation, violations.length, maxViolations]);

  // ========================
  // Fullscreen Lock
  // ========================
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.warn("Fullscreen not supported");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && strictMode) {
        logViolation(
          "FULLSCREEN_EXIT",
          "high",
          "⚠️ Fullscreen mode-оос гарсан!"
        );
        enterFullscreen(); // Force back
      }
    };

    enterFullscreen();
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [logViolation, strictMode]);

  // ========================
  // Right Click Block
  // ========================
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logViolation("RIGHT_CLICK", "low", "⚠️ Баруун товч дарах хориотой!");
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [logViolation]);

  // ========================
  // Copy/Paste/Cut Block
  // ========================
  useEffect(() => {
    const blockCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation(
        "COPY_PASTE",
        "medium",
        "⚠️ Copy/Paste хийх оролдлого илэрлээ!"
      );
    };

    document.addEventListener("copy", blockCopyPaste);
    document.addEventListener("paste", blockCopyPaste);
    document.addEventListener("cut", blockCopyPaste);

    return () => {
      document.removeEventListener("copy", blockCopyPaste);
      document.removeEventListener("paste", blockCopyPaste);
      document.removeEventListener("cut", blockCopyPaste);
    };
  }, [logViolation]);

  // ========================
  // Keyboard Shortcuts Block
  // ========================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J (DevTools)
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "u") || // View source
        e.key === "PrintScreen" // Screenshot
      ) {
        e.preventDefault();
        logViolation(
          "KEYBOARD_SHORTCUT",
          "medium",
          "⚠️ Хориглосон товчлуур дарсан байна!"
        );
      }

      // Alt+Tab detection (not reliable, but we try)
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [logViolation]);

  // ========================
  // Mouse Leave Detection
  // ========================
  useEffect(() => {
    const handleMouseLeave = () => {
      setMouseLeft(true);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);

      mouseTimeoutRef.current = setTimeout(() => {
        if (strictMode) {
          logViolation("MOUSE_LEAVE", "medium", "⚠️ Хулгана цонхноос гарсан!");
        }
      }, 3000); // 3 секунд цонхноос гадуур байвал
    };

    const handleMouseEnter = () => {
      setMouseLeft(false);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, [logViolation, strictMode]);

  // ========================
  // DevTools Detection
  // ========================
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        logViolation(
          "DEVTOOLS_OPEN",
          "high",
          "⚠️ Developer Tools нээсэн байна!"
        );
      }
    };

    const interval = setInterval(detectDevTools, 5000);
    return () => clearInterval(interval);
  }, [logViolation]);

  // ========================
  // Webcam Monitoring (Optional)
  // ========================
  useEffect(() => {
    if (!enableWebcam) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setWebcamActive(true);
        }
      } catch (err) {
        console.error("Webcam access denied:", err);
        logViolation("WEBCAM_DENIED", "high", "⚠️ Камер идэвхжүүлж чадсангүй!");
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [enableWebcam, logViolation]);

  // ========================
  // Window Resize Detection (for virtual machines)
  // ========================
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (strictMode) {
          logViolation("WINDOW_RESIZE", "low", "⚠️ Цонхны хэмжээ өөрчлөгдсөн");
        }
      }, 1000);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [logViolation, strictMode]);

  // ========================
  // UI Components
  // ========================
  const criticalViolations = violations.filter(
    (v) => v.severity === "high"
  ).length;

  return (
    <>
      {/* Black Screen Overlay */}
      {blackScreen && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          <div className="text-white text-center space-y-4">
            <AlertTriangle className="w-16 h-16 mx-auto text-red-500" />
            <h1 className="text-3xl font-bold">
              {blocked ? "🚫 Шалгалт хаагдсан!" : "⚠️ Анхааруулга"}
            </h1>
            <p className="text-xl">{dialogMessage}</p>
          </div>
        </div>
      )}

      {/* Monitoring Panel */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {/* Violation Counter */}
        <Alert
          variant={
            criticalViolations >= maxViolations - 1 ? "destructive" : "default"
          }
          className="w-64"
        >
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">
              Зөрчил: {criticalViolations}/{maxViolations}
            </div>
            {blocked && (
              <div className="text-red-600 font-bold mt-1">
                🚫 Шалгалт хаагдсан!
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Webcam Preview */}
        {enableWebcam && webcamActive && (
          <div className="w-64 bg-black rounded-lg overflow-hidden border-2 border-green-500">
            <div className="flex items-center gap-2 bg-green-600 text-white px-2 py-1 text-xs">
              <Eye className="w-3 h-3" />
              Камер идэвхтэй
            </div>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full"
            />
          </div>
        )}

        {/* Mouse Status */}
        {mouseLeft && strictMode && (
          <Alert variant="destructive" className="w-64">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-xs font-semibold">
                ⚠️ Хулгана цонхноос гарсан байна!
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Security Status */}
        <div className="bg-card border rounded-lg p-2 w-64 text-xs space-y-1">
          <div className="flex items-center gap-2 text-green-600">
            <Lock className="w-3 h-3" />
            <span>Fullscreen идэвхтэй</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Shield className="w-3 h-3" />
            <span>Хамгаалалт идэвхтэй</span>
          </div>
        </div>
      </div>

      {/* Warning Dialog */}
      <Dialog open={!!dialogMessage && !blackScreen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Анхааруулга
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-base">{dialogMessage}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Зөрчил: {criticalViolations}/{maxViolations}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogMessage(null)}>Ойлголоо</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Violation Log (for debugging - remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 bg-card border rounded-lg p-3 max-w-sm max-h-64 overflow-auto text-xs z-50">
          <div className="font-bold mb-2">Зөрчлийн түүх:</div>
          {violations.map((v, i) => (
            <div key={i} className="mb-1 text-xs">
              <span
                className={
                  v.severity === "high"
                    ? "text-red-600"
                    : v.severity === "medium"
                    ? "text-orange-600"
                    : "text-gray-600"
                }
              >
                [{v.severity}]
              </span>{" "}
              {v.type} - {v.timestamp.toLocaleTimeString()}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  Ban,
  Monitor,
  Copy,
  Mouse,
  Eye,
  Lock,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

interface ExamRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  examTitle?: string;
  isMobile?: boolean;
}

export default function ExamRulesDialog({
  open,
  onOpenChange,
  onConfirm,
  examTitle,
  isMobile = false,
}: ExamRulesDialogProps) {
  const desktopRules = [
    {
      icon: <Monitor className="w-4 h-4" />,
      title: "Цонх солих / Tab солих",
      severity: "high" as const,
      description: "Өөр цонх эсвэл tab руу шилжихийг хориглоно",
    },
    {
      icon: <Lock className="w-4 h-4" />,
      title: "Fullscreen-ээс гарах",
      severity: "high" as const,
      description: "Fullscreen горимоос гарах оролдлого",
    },
    {
      icon: <Mouse className="w-4 h-4" />,
      title: "Хулгана цонхноос гаргах",
      severity: "medium" as const,
      description: "Хулгана 3 секундээс дээш хугацаагаар цонхноос гаргах",
    },
  ];

  const mobileRules = [
    {
      icon: <Smartphone className="w-4 h-4" />,
      title: "Өөр апп руу шилжих",
      severity: "high" as const,
      description: "Өөр application руу шилжихийг хориглоно",
    },
    {
      icon: <Smartphone className="w-4 h-4" />,
      title: "Утасны чиглэл өөрчлөх",
      severity: "medium" as const,
      description: "Утасны orientation өөрчлөх",
    },
  ];

  const commonRules = [
    {
      icon: <Copy className="w-4 h-4" />,
      title: "Copy / Paste / Cut",
      severity: "medium" as const,
      description: "Хуулах, буулгах, таслах үйлдлүүд",
    },
    {
      icon: <Ban className="w-4 h-4" />,
      title: "DevTools / Inspect",
      severity: "high" as const,
      description: "Developer Tools нээх, баруун товч дарах",
    },
    {
      icon: <Eye className="w-4 h-4" />,
      title: "Текст сонгох",
      severity: "low" as const,
      description: "Текст сонгох, drag хийх үйлдлүүд",
    },
    {
      icon: <Monitor className="w-4 h-4" />,
      title: "Хэвлэх / Screenshot",
      severity: "high" as const,
      description: "Дэлгэцийн зураг авах, хэвлэх оролдлого",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl p-6 sm:p-8 flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Shield className="w-6 h-6 text-blue-600" />
            Шалгалтын дүрэм журам
          </DialogTitle>
          <DialogDescription className="text-base">
            {examTitle && (
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                "{examTitle}"
              </span>
            )}{" "}
            шалгалтыг эхлүүлэхээс өмнө дараах дүрмийг анхааралтай уншина уу.
          </DialogDescription>
        </DialogHeader>

        {/* Main content without scroll */}
        <div className="space-y-4 py-4 flex-1">
          <Alert variant="destructive" className="border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="font-semibold">
              Анхааруулга: 3 удаа ноцтой дүрэм зөрчвөл шалгалт автоматаар
              дуусгагдана!
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" /> Хориотой үйлдлүүд:
            </h3>

            <div className="space-y-3">
              {!isMobile &&
                desktopRules.map((rule, idx) => (
                  <RuleItem key={idx} {...rule} />
                ))}
              {isMobile &&
                mobileRules.map((rule, idx) => (
                  <RuleItem key={idx} {...rule} />
                ))}
              {commonRules.map((rule, idx) => (
                <RuleItem key={idx} {...rule} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Буцах
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Шалгалт эхлүүлэх
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RuleItemProps {
  icon: React.ReactNode;
  title: string;
  severity: "high" | "medium" | "low";
  description: string;
}

function RuleItem({ icon, title, severity, description }: RuleItemProps) {
  const getSeverityColor = () => {
    switch (severity) {
      case "high":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
      case "medium":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800";
      case "low":
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800";
    }
  };

  const getSeverityBadge = () => {
    switch (severity) {
      case "high":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
            НОЦТОЙ
          </span>
        );
      case "medium":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
            ДУНД
          </span>
        );
      case "low":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            БАГА
          </span>
        );
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor()}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          {getSeverityBadge()}
        </div>
        <p className="text-xs opacity-90">{description}</p>
      </div>
    </div>
  );
}

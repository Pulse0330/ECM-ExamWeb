"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react"; // Нүдний icon-ууд нэмсэн
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagicCard } from "@/components/ui/magic-card";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import { cn } from "@/lib/utils";

// Нууц үг солих формын өгөгдлийн интерфейс
interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const { theme } = useTheme();
  const gradientColor = theme === "dark" ? "#262626" : "#D9D9D955";

  const [viewNew, setViewNew] = useState(false); // Шинэ нууц үг харах/нуух
  const [viewConfirm, setViewConfirm] = useState(false); // Баталгаажуулах нууц үг харах/нуух
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues, // Нууц үг баталгаажуулахдаа ашиглана
  } = useForm<ResetPasswordFormData>();

  // Форм илгээх функц
  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      console.log("Password reset data:", data.newPassword);

      // Серверт илгээх үйлдлийг дуурайж 2 секунд хүлээх
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSuccess(true);
    } catch (err) {
      console.error("Reset Password error:", err);
      alert("Нууц үг солих үед алдаа гарлаа.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className={cn(
          "flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4"
        )}
      >
        <NeonGradientCard className="w-full max-w-md shadow-2xl rounded-2xl">
          <Card className="p-0 max-w-full shadow-none border-none">
            <MagicCard
              gradientColor={gradientColor}
              className="p-6 text-center space-y-4"
            >
              <CardTitle className="text-2xl text-green-500">
                Амжилттай
              </CardTitle>
              <CardDescription className="text-base">
                Таны нууц үг амжилттай солигдлоо. Та одоо нэвтэрч болно.
              </CardDescription>
              <Link href="/login">
                <Button className="w-full mt-4">
                  Нэвтрэх хуудас руу шилжих
                </Button>
              </Link>
            </MagicCard>
          </Card>
        </NeonGradientCard>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4"
      )}
    >
      {/* Neon gradient border */}
      <NeonGradientCard className="w-full max-w-md shadow-2xl rounded-2xl">
        {/* ShadCN Card container */}
        <Card className="p-0 max-w-full shadow-none border-none">
          {/* Magic glass effect */}
          <MagicCard gradientColor={gradientColor} className="p-0">
            <CardHeader className="border-b border-border p-4">
              <CardTitle className="text-lg sm:text-xl">
                Нууц үг солих
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Шинэ нууц үгээ оруулж, баталгаажуулна уу.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-4 space-y-4">
                {/* Шинэ Нууц үг */}
                <div className="grid gap-2 relative">
                  <Label htmlFor="newPassword" className="text-sm sm:text-base">
                    Шинэ нууц үг
                  </Label>
                  <Input
                    id="newPassword"
                    type={viewNew ? "text" : "password"}
                    placeholder="********"
                    {...register("newPassword", {
                      required: "Шинэ нууц үг оруулна уу",
                      minLength: {
                        value: 6,
                        message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой",
                      },
                    })}
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-10 text-gray-400"
                    onClick={() => setViewNew(!viewNew)}
                  >
                    {viewNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.newPassword && (
                    <p className="text-xs sm:text-sm text-red-500">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Нууц үг баталгаажуулах */}
                <div className="grid gap-2 relative">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm sm:text-base"
                  >
                    Нууц үг баталгаажуулах
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={viewConfirm ? "text" : "password"}
                    placeholder="********"
                    {...register("confirmPassword", {
                      required: "Нууц үг давтан оруулна уу",
                      validate: (value) =>
                        value === getValues("newPassword") ||
                        "Нууц үг таарахгүй байна",
                    })}
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-10 text-gray-400"
                    onClick={() => setViewConfirm(!viewConfirm)}
                  >
                    {viewConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-xs sm:text-sm text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 border-t border-border flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Түр хүлээнэ үү..." : "Нууц үг солих"}
                </Button>

                <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <Link
                    href="/login"
                    className="text-indigo-500 hover:underline"
                  >
                    Нэвтрэх хуудас руу буцах
                  </Link>
                </div>
              </CardFooter>
            </form>
          </MagicCard>
        </Card>
      </NeonGradientCard>
    </div>
  );
}

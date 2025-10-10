"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { MagicCard } from "@/components/ui/magic-card";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import { cn } from "@/lib/utils";

interface SignUpFormData {
  username: string;
  email: string; // Шинээр нэмсэн
  password: string;
  confirmPassword: string; // Шинээр нэмсэн
}

export default function SignUpForm() {
  const { theme } = useTheme();
  const gradientColor = theme === "dark" ? "#262626" : "#D9D9D955";

  const [viewPassword, setViewPassword] = useState(false); // Нууц үг харах/нуух
  const [viewConfirm, setViewConfirm] = useState(false); // Нууц үг баталгаажуулах харах/нуух
  const [acceptTerms, setAcceptTerms] = useState(false); // Үйлчилгээний нөхцөлийг зөвшөөрөх
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues, // Нууц үг баталгаажуулахдаа ашиглана
  } = useForm<SignUpFormData>();

  // Форм илгээх функц
  const onSubmit = async (data: SignUpFormData) => {
    if (!acceptTerms) {
      alert("Үйлчилгээний нөхцөлийг зөвшөөрөх шаардлагатай.");
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...signUpData } = data; // confirmPassword-г серверт илгээхгүй байж болно
      console.log("Sign Up data:", signUpData);

      // Серверт илгээх үйлдлийг дуурайж 1.5 секунд хүлээх
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Бүртгэл амжилттай үүслээ!");
    } catch (err) {
      console.error("Sign Up error:", err);
      alert("Бүртгүүлэхэд алдаа гарлаа.");
    } finally {
      setIsLoading(false);
    }
  };

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
              <CardTitle className="text-lg sm:text-xl">Бүртгүүлэх</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Имэйл болон нэвтрэх нэрээр шинэ бүртгэл үүсгэнэ үү
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-4 space-y-4">
                {/* Нэвтрэх нэр (Username) */}
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-sm sm:text-base">
                    Нэвтрэх нэр
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Хэрэглэгчийн нэр"
                    {...register("username", {
                      required: "Нэвтрэх нэр оруулна уу",
                      minLength: {
                        value: 3,
                        message: "Хамгийн багадаа 3 тэмдэгт байх ёстой",
                      },
                    })}
                    disabled={isSubmitting}
                  />
                  {errors.username && (
                    <p className="text-xs sm:text-sm text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Имэйл (Email) */}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">
                    Имэйл
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    {...register("email", {
                      required: "Имэйл оруулна уу",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: "Хүчинтэй имэйл хаяг оруулна уу",
                      },
                    })}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-xs sm:text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Нууц үг (Password) */}
                <div className="grid gap-2 relative">
                  <Label htmlFor="password" className="text-sm sm:text-base">
                    Нууц үг
                  </Label>
                  <Input
                    id="password"
                    type={viewPassword ? "text" : "password"}
                    placeholder="********"
                    {...register("password", {
                      required: "Нууц үг оруулна уу",
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
                    onClick={() => setViewPassword(!viewPassword)}
                  >
                    {viewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && (
                    <p className="text-xs sm:text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Нууц үг баталгаажуулах (Confirm Password) */}
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
                        value === getValues("password") ||
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

                {/* Үйлчилгээний нөхцөлийг зөвшөөрөх */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm sm:text-base">
                    <Link
                      href="/terms"
                      className="text-indigo-500 hover:underline"
                    >
                      Үйлчилгээний нөхцөл
                    </Link>
                    -ийг зөвшөөрч байна
                  </Label>
                </div>
              </CardContent>

              <CardFooter className="p-4 border-t border-border flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !acceptTerms} // Нөхцөлийг зөвшөөрөөгүй бол идэвхгүй болгоно
                >
                  {isLoading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}
                </Button>

                <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Таньд бүртгэл байгаа юу?{" "}
                  <Link
                    href="/login" // Нэвтрэх хуудас руу шилжих
                    className="text-indigo-500 hover:underline"
                  >
                    Нэвтрэх
                  </Link>
                </div>

                {/* Нууц үг мартсаныг хассан, учир нь энэ бүртгүүлэх хуудас */}
              </CardFooter>
            </form>
          </MagicCard>
        </Card>
      </NeonGradientCard>
    </div>
  );
}

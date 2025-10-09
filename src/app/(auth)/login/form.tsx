"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {toast} from "sonner";

import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
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

import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { LoginPayload, LoginType } from "@/types/login";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginForm() {
  const { theme } = useTheme();
  const router = useRouter();
  const gradientColor = theme === "dark" ? "#262626" : "#D9D9D955";

  const setUserId = useAuthStore((state) => state.setUserId);

  const [view, setView] = useState(false);
  const [remember, setRemember] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const mutation = useMutation<LoginType, any, LoginPayload>({
    mutationFn: ({ username, password }) => loginRequest(username, password),
    onSuccess: (res) => {
      if (res.RetResponse.ResponseType) {
        localStorage.setItem("userId", res.RetData.toString());
        toast.success("Амжилттай нэвтэрлээ");
        router.push("/home");
      } else {
        toast.error(res.RetResponse.ResponseMessage);
      }
    },
    onError: () => toast.error("Алдаа гарлаа, дахин оролдоно уу"),
  });

  const onSubmit = (data: LoginFormData) => mutation.mutate(data);

  // Theme-д нийцсэн link color
  const linkClass = theme === "dark"
    ? "text-indigo-400 hover:text-indigo-300 underline"
    : "text-indigo-600 hover:text-indigo-800 underline";

  return (
    <div className={cn("flex items-center justify-center min-h-screen px-4")}>
      <NeonGradientCard className="w-full max-w-md shadow-2xl rounded-2xl">
        <Card className="p-0 max-w-full shadow-none border-none">
          <MagicCard gradientColor={gradientColor} className="p-0">
            <CardHeader className="border-b border-border p-4">
              <CardTitle className="text-lg sm:text-xl">Тавтай морилно уу</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Имэйл эсвэл утасны дугаараар нэвтрэнэ үү
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-4 space-y-4">
                {/* Username */}
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-sm sm:text-base">
                    Нэвтрэх нэр
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="ES40100****"
                    {...register("username", { required: "Нэвтрэх нэр оруулна уу" })}
                    disabled={mutation.isPending}
                  />
                  {errors.username && (
                    <p className="text-xs sm:text-sm text-red-500">{errors.username.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="grid gap-2 relative">
                  <Label htmlFor="password" className="text-sm sm:text-base">
                    Нууц үг
                  </Label>
                  <Input
                    id="password"
                    type={view ? "text" : "password"}
                    placeholder="********"
                    {...register("password", { required: "Нууц үг оруулна уу" })}
                    disabled={mutation.isPending}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-10 text-gray-400"
                    onClick={() => setView(!view)}
                  >
                    {view ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && (
                    <p className="text-xs sm:text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(!!checked)}
                  />
                  <Label htmlFor="remember" className="text-sm sm:text-base">Сануулах</Label>
                </div>
              </CardContent>

              <CardFooter className="p-4 border-t border-border flex flex-col gap-3">
                <Button
                  type="submit"
                  className={cn(
                    "w-full",
                    theme === "dark"
                      ? "bg-indigo-500 hover:bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  )}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending  ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
                </Button>

                <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Таньд бүртгэл байхгүй юу?{" "}
                  <Link href="/sign" className={linkClass}>Бүртгүүлэх</Link>
                </div>

                <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <Link href="/forget" className={linkClass}>Нууц үг мартсан уу?</Link>
                </div>

                <AnimatedThemeToggler />
              </CardFooter>
            </form>
          </MagicCard>
        </Card>
      </NeonGradientCard>
    </div>
  );
}

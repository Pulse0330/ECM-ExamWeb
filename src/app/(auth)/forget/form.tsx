"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
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

interface ForgetPasswordFormData {
  email: string;
}

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordFormData>();

  const onSubmit = async (data: ForgetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Reset password for:", data.email);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Нууц үг сэргээх холбоос имэйлээр илгээгдлээ!");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      console.error(err);
      toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6 py-12">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 bg-transparent shadow-none rounded-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <CardHeader className="text-center pb-4 pt-6">
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                Нууц үг сэргээх
              </CardTitle>
              <CardDescription className="text-base text-gray-500 dark:text-gray-400 mt-2">
                Нууц үгээ мартсан бол имэйлээ оруулж сэргээх холбоос авах
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-8">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
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
                  <p className="text-sm text-red-500 mt-1">
                    ⚠️ {errors.email.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-2">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Түр хүлээнэ үү...
                  </span>
                ) : (
                  "Сэргээх холбоос илгээх"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Нууц үг санасан уу?{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-all duration-300 hover:underline underline-offset-4"
                >
                  Нэвтрэх
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import AnimationComponanet from "@/components/animation";
import { Spinner } from "@/components/ui/spinner";

interface SignUpFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [viewPassword, setViewPassword] = useState(false);
  const [viewConfirm, setViewConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<SignUpFormData>();

  const onSubmit = async (data: SignUpFormData) => {
    if (!acceptTerms) {
      toast.error("Үйлчилгээний нөхцөлийг зөвшөөрнө үү");
      return;
    }
    try {
      const { confirmPassword, ...signUpData } = data;
      console.log("Sign Up data:", signUpData);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Бүртгэл амжилттай үүслээ!");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      console.error("Sign Up error:", err);
      toast.error("Бүртгүүлэхэд алдаа гарлаа");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      <AnimationComponanet />

      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 70, damping: 20 }}
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6 py-12"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Бүртгүүлэх</h1>
            <p className="text-sm text-muted-foreground">
              Шинэ бүртгэл үүсгэхийн тулд мэдээллээ оруулна уу
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* Username Field */}
              <Field>
                <FieldLabel htmlFor="username">Нэвтрэх нэр</FieldLabel>
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
                  <p className="text-sm text-destructive mt-1.5">
                    {errors.username.message}
                  </p>
                )}
              </Field>

              {/* Email Field */}
              <Field>
                <FieldLabel htmlFor="email">Имэйл</FieldLabel>
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
                  <p className="text-sm text-destructive mt-1.5">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              {/* Password Field */}
              <Field>
                <FieldLabel htmlFor="password">Нууц үг</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={viewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    {...register("password", {
                      required: "Нууц үг оруулна уу",
                      minLength: {
                        value: 6,
                        message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой",
                      },
                    })}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setViewPassword(!viewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                    aria-label={
                      viewPassword ? "Нууц үг нуух" : "Нууц үг харуулах"
                    }
                  >
                    {viewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1.5">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              {/* Confirm Password Field */}
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Нууц үг баталгаажуулах
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={viewConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    {...register("confirmPassword", {
                      required: "Нууц үг давтан оруулна уу",
                      validate: (value) =>
                        value === getValues("password") ||
                        "Нууц үг таарахгүй байна",
                    })}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setViewConfirm(!viewConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                    aria-label={
                      viewConfirm ? "Нууц үг нуух" : "Нууц үг харуулах"
                    }
                  >
                    {viewConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1.5">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </Field>

              {/* Terms Checkbox */}
              <Field orientation="horizontal" className="items-start">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                  className="mt-0.5"
                />
                <FieldLabel
                  htmlFor="terms"
                  className="text-sm font-normal leading-relaxed cursor-pointer"
                >
                  <Link
                    href="/terms"
                    className="text-primary hover:underline font-medium"
                  >
                    Үйлчилгээний нөхцөл
                  </Link>{" "}
                  болон{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline font-medium"
                  >
                    нууцлалын бодлого
                  </Link>
                  -той танилцаж, зөвшөөрч байна
                </FieldLabel>
              </Field>

              {/* Submit Button */}
              <Field orientation="horizontal" className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !acceptTerms}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      Түр хүлээнэ үү...
                    </>
                  ) : (
                    "Бүртгүүлэх"
                  )}
                </Button>
              </Field>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground">
                Таньд бүртгэл байгаа юу?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Нэвтрэх
                </Link>
              </p>
            </FieldGroup>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

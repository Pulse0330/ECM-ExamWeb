"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { loginRequest } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import AnimationComponanet from "@/components/animation";
import { Spinner } from "@/components/ui/spinner";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setUserId } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ username, password }: LoginFormData) =>
      loginRequest(username, password),
    onSuccess: (res) => {
      setUserId(res.RetData);
      toast.success("Амжилттай нэвтэрлээ");
      router.push("/home");
    },
  });

  const onSubmit = (data: LoginFormData) => mutate(data);

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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Нэвтрэх</h1>
            <p className="text-sm text-muted-foreground">
              Өөрийн бүртгэлээр нэвтэрнэ үү
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
                  placeholder="ES40100****"
                  {...register("username", {
                    required: "Нэвтрэх нэр оруулна уу",
                  })}
                  disabled={isPending}
                />
                {errors.username && (
                  <p className="text-sm text-destructive mt-1.5">
                    {errors.username.message}
                  </p>
                )}
              </Field>

              {/* Password Field */}
              <Field>
                <FieldLabel htmlFor="password">Нууц үг</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    {...register("password", {
                      required: "Нууц үг оруулна уу",
                    })}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    disabled={isPending}
                    aria-label={
                      showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"
                    }
                  >
                    {showPassword ? (
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

              <Field orientation="horizontal" className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending}
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Spinner />
                      Түр хүлээнэ үү...
                    </>
                  ) : (
                    "Нэвтрэх"
                  )}
                </Button>
              </Field>

              <div className="text-center -mt-2">
                <Button asChild variant="link" className="text-sm">
                  <Link href="/forget">Нууц үг мартсан уу?</Link>
                </Button>
              </div>

              <FieldSeparator>
                <p></p>
              </FieldSeparator>

              <p className="text-center text-sm text-muted-foreground">
                Таньд бүртгэл байхгүй юу?{" "}
                <Link
                  href="/sign"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Бүртгүүлэх
                </Link>
              </p>
            </FieldGroup>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {toast} from "sonner";
import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { LoginPayload, LoginType } from "@/types/login";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const setUserId = useAuthStore((state) => state.setUserId);
  const [view, setView] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const mutation = useMutation<LoginType, any, LoginPayload>({
    mutationFn: ({ username, password }) => loginRequest(username, password),
    onSuccess: (res) => {
      if (res.RetResponse.ResponseType) {
        setUserId(res.RetData.toString());
        toast.success("Амжилттай нэвтэрлээ");
        router.push("/home");
      } else {
        toast.error(res.RetResponse.ResponseMessage);
      }
    },
    onError: () => {
      toast.error("Алдаа гарлаа, дахин оролдоно уу");
    },
  });

  const onSubmit = (data: LoginFormData) => mutation.mutate(data);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800"
      >
        <h2 className="text-xl font-bold mb-4">Тавтай морилно уу</h2>

        {/* Username */}
        <div className="mb-4">
          <label htmlFor="username" className="block mb-1">Нэвтрэх нэр</label>
          <input
            id="username"
            type="text"
            className="w-full px-3 py-2 border rounded"
            {...register("username", { required: "Нэвтрэх нэр оруулна уу" })}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <label htmlFor="password" className="block mb-1">Нууц үг</label>
          <input
            id="password"
            type={view ? "text" : "password"}
            className="w-full px-3 py-2 border rounded pr-10"
            {...register("password", { required: "Нууц үг оруулна уу" })}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setView(!view)}
          >
            {view ? "🙈" : "👁️"}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Нэвтрүүлж байна..." : "Нэвтрэх"}
        </button>
      </form>
    </div>
  );
}

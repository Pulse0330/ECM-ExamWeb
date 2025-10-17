"use client";

import React, { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Loader2 } from "lucide-react";

export default function UserProfile() {
  const userId = useAuthStore((s) => s.userId);

  const mutation = useMutation({
    mutationFn: ({ id }: { id: number }) => getUserProfile(id),
  });

  useEffect(() => {
    if (userId) mutation.mutate({ id: userId });
  }, [userId]);

  const user = mutation.data?.RetData?.[0];

  if (mutation.isPending)
    return (
      <div className="flex justify-center items-center min-h-[400px] dark:text-gray-300">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );

  if (!user)
    return (
      <div className="text-center text-muted-foreground dark:text-gray-300 p-12">
        Хэрэглэгчийн мэдээлэл олдсонгүй.
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Header */}
        <CardHeader className="flex flex-col items-center">
          <Avatar className="w-28 h-28 mb-3 rounded-full shadow-lg border-2 border-primary/20">
            <AvatarImage src={user.img_url || ""} alt={user.firstname} />
            <AvatarFallback className="dark:text-gray-300">
              {user.firstname?.[0]}
              {user.lastname?.[0]}
            </AvatarFallback>
          </Avatar>

          <CardTitle className="text-2xl font-semibold dark:text-gray-100">
            {user.fname}
          </CardTitle>
          <p className="text-sm text-muted-foreground dark:text-gray-300">
            {user.email}
          </p>
          <Badge variant="outline" className="mt-2">
            {user.user_code}
          </Badge>
        </CardHeader>

        <Separator className="my-4 border-gray-200 dark:border-gray-600" />

        {/* Profile Info Grid */}
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-left dark:text-gray-300">
            <div className="flex justify-between">
              <span className="text-muted-foreground dark:text-gray-400">
                Овог:
              </span>
              <span>{user.lastname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground dark:text-gray-400">
                Нэр:
              </span>
              <span>{user.firstname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground dark:text-gray-400">
                Утас:
              </span>
              <span>{user.Phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground dark:text-gray-400">
                Нэвтрэх нэр:
              </span>
              <span>{user.login_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground dark:text-gray-400">
                Сургуулийн ID:
              </span>
              <span>{user.school_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground dark:text-gray-400">
                Бүртгэсэн огноо:
              </span>
              <span>{new Date(user.created).toLocaleDateString()}</span>
            </div>
          </div>

          <Separator className="my-4 border-gray-200 dark:border-gray-600" />
        </CardContent>
      </Card>
    </div>
  );
}

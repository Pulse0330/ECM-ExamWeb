import ForgetPasswordPage from "@/app/(auth)/forget/form";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import React from "react";

const ForgetPasswordPageForm: React.FC = () => {
  return (
    <div>
      <ForgetPasswordPage />
      <div className="fixed top-4 right-4 z-50">
        <AnimatedThemeToggler />
      </div>
    </div>
  );
};

export default ForgetPasswordPageForm;

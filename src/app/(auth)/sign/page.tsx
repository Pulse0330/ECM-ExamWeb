import SignUpForm from "@/app/(auth)/sign/form";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import React from "react";

const SignUpPage: React.FC = () => {
  return (
    <div>
      <SignUpForm />
      <div className="fixed top-4 right-4 z-50">
        <AnimatedThemeToggler />
      </div>
    </div>
  );
};

export default SignUpPage;

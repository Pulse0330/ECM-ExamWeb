import LoginForm from "@/app/(auth)/login/form";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import React from "react";

const LoginPage: React.FC = () => {
  return (
    <div>
      <LoginForm />
      <div className="fixed top-4 right-4 z-50"> 
        <AnimatedThemeToggler/>
      </div>
    </div>
  );
};

export default LoginPage;

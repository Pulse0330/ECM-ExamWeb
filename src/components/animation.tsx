"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, Zap } from "lucide-react";
import Image from "next/image";

const data = [
  {
    icon: <Sparkles className="w-6 h-6 text-white" />,
    title: "Хурдан & Найдвартай",
    desc: "Аюулгүй нэвтрэлтийн систем",
    bg: "bg-blue-500/30 dark:bg-blue-400/30",
  },
  {
    icon: <Zap className="w-6 h-6 text-white" />,
    title: "Хялбар Удирдлага",
    desc: "Нэг дороос бүх зүйлийг хянах",
    bg: "bg-purple-500/30 dark:bg-purple-400/30",
  },
];

const bublePosition = [
  { top: 10, left: 10 },
  { top: 18, left: 40 },
  { top: 54, left: 42 },
  { top: 23, left: 23 },
  { top: 56, left: 13 },
  { top: 87, left: 86 },
];

export default function AnimationComponanet() {
  const id = useId();

  return (
    <motion.div
      initial={{ opacity: 0, x: "-100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 25,
        mass: 0.8,
      }}
      className="hidden md:flex flex-1 relative items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 overflow-hidden"
    >
      {/* Floating circles */}
      {bublePosition.map((el, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-sm"
          style={{
            width: `${50 + i * 30}px`,
            height: `${50 + i * 30}px`,
            top: `${el.top}%`,
            left: `${el.left}%`,
          }}
          animate={{
            y: ["0%", "10%", "0%"],
            x: ["0%", "5%", "0%"],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-10 text-center px-8 max-w-lg space-y-8"
      >
        <h1 className="text-5xl font-bold tracking-tight leading-tight text-white dark:text-gray-100">
          Тавтай морилно уу
        </h1>
        <p className="text-xl text-blue-100 dark:text-gray-300 leading-relaxed">
          Манай системд нэвтэрч, бүх үйлчилгээгээ нэг дороос удирдаарай
        </p>

        <div className="grid grid-cols-1 gap-4 mt-12">
          {data.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-4 bg-white/10 dark:bg-gray-800/40 backdrop-blur-md rounded-xl border border-white/20 dark:border-gray-700 cursor-pointer transition-shadow hover:shadow-xl"
            >
              <div
                className={`flex-shrink-0 w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center`}
              >
                {card.icon}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white dark:text-gray-100">
                  {card.title}
                </h3>
                <p className="text-sm text-blue-100 dark:text-gray-300">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, Zap } from "lucide-react";
const data = [
  {
    icon: <Sparkles className="w-6 h-6 text-white" />,
    title: "Хурдан & Найдвартай",
    desc: "Аюулгүй нэвтрэлтийн систем",
    bg: "bg-blue-500/30",
  },
  {
    icon: <Zap className="w-6 h-6 text-white" />,
    title: "Хялбар Удирдлага",
    desc: "Нэг дороос бүх зүйлийг хянах",
    bg: "bg-purple-500/30",
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
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 70, damping: 20 }}
      className={`hidden md:flex flex-1 relative items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden `}
    >
      {/* Floating circles */}
      {bublePosition.map((el, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-white/10`}
          style={{
            width: `${50 + i * 30}px`,
            height: `${50 + i * 30}px`,
            top: `${el.top}%`,
            left: `${el.left}%`,
          }}
          animate={{ y: ["0%", "10%", "0%"], x: ["0%", "5%", "0%"] }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      ))}

      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 text-center text-white px-8 max-w-lg space-y-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl mb-4 shadow-2xl"
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Тавтай морилно уу
        </h1>
        <p className="text-xl text-blue-100 leading-relaxed">
          Манай системд нэвтэрч, бүх үйлчилгээгээ нэг дороос удирдаарай
        </p>

        <div className="grid grid-cols-1 gap-4 mt-12">
          {data.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 cursor-pointer`}
            >
              <div
                className={`flex-shrink-0 w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center`}
              >
                {card.icon}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">{card.title}</h3>
                <p className="text-sm text-blue-100">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

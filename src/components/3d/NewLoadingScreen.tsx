import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  progress: number;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  message = "Initializing quantum engines...",
}) => {
  const [currentLoadingText, setCurrentLoadingText] = useState(0);
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [blinkCursor, setBlinkCursor] = useState(true);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const loadingTexts = [
    "Entangling quantum states...",
    "Stabilizing superposition...",
    "Calculating quantum probabilities...",
    "Preparing Bloch spheres...",
    "Initializing quantum gates...",
    "Loading spaceship controls...",
    "Assembling quantum circuitry...",
  ];

  const quantumCodeSnippets = [
    "// Initializing quantum state",
    "const qubit = new QuantumBit();",
    "qubit.setSuperposition(0.5);",
    "await quantum.entangle(qubit1, qubit2);",
    "if (qubit.measure() === 1) {",
    "  portal.activate(DIMENSION.FOURTH);",
    "}",
    "// Loading quantum dashboard...",
    "import { QuantumEngine } from '@quantum/core';",
    "const game = new QuantumQuest();",
    "await game.initialize();",
  ];

  const quantumAsciiArt = [
    "  ╭────────────────────────╮",
    "  │    QUANTUM QUEST        │",
    "  │                         │",
    "  │      ┌───┐┌───┐        │",
    "  │     ┌┘   └┘   └┐       │",
    "  │    ─┤  ⚛️   ⚛️  ├─      │",
    "  │     └┐   ┌┐   ┌┘       │",
    "  │      └───┘└───┘        │",
    "  │                         │",
    "  ╰────────────────────────╯",
  ];

  // Show different loading texts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoadingText((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for code lines
  useEffect(() => {
    if (progress < 20) return;

    const interval = setInterval(() => {
      if (codeLines.length < quantumCodeSnippets.length) {
        setCodeLines((prev) => [
          ...prev,
          quantumCodeSnippets[prev.length]
        ]);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [progress, codeLines.length]);

  // Auto-scroll code container
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
  }, [codeLines]);

  // Blink cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden font-mono text-sm">
      {/* Grid background */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "linear-gradient(#303030 1px, transparent 1px), linear-gradient(90deg, #303030 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
      />

      {/* Glowing orbs that float around */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full
              ${i % 3 === 0
                ? "w-24 h-24 bg-cyan-500 blur-2xl"
                : i % 2 === 0
                  ? "w-32 h-32 bg-purple-600 blur-3xl"
                  : "w-40 h-40 bg-indigo-700 blur-3xl"
              }`}
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: 0.07,
            }}
            animate={{
              x: [null, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
              y: [null, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [null, 0.1, 0.05],
            }}
            transition={{
              duration: 15 + Math.random() * 15,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-3xl px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mb-12 flex flex-col items-center"
        >
          <h1 className="text-5xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            QUANTUM QUEST
          </h1>
          <p className="text-gray-400 font-light tracking-widest uppercase">THE ENTANGLED ESCAPE</p>
        </motion.div>

        {/* Main content with code blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left column - Code blocks */}
          <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 h-60">
            <div className="flex items-center mb-2">

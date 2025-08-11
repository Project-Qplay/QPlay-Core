import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  progress: number;
  message?: string;
}

const BitKraftStyleLoading: React.FC<LoadingScreenProps> = ({
  progress,
  message = "Initializing quantum engines...",
}) => {
  const [currentLoadingText, setCurrentLoadingText] = useState(0);
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [blinkCursor, setBlinkCursor] = useState(true);
  const [bootPhase, setBootPhase] = useState(0);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const bootSequences = [
    "Initializing quantum processor...",
    "Loading core quantum libraries...",
    "Calibrating qubits...",
    "Stabilizing quantum registers...",
    "Establishing entanglement network...",
  ];

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
    "// QCortex v3.8.5 Quantum Terminal",
    "$ initialize --quantum-core",
    "> Quantum core online. Initializing 512 qubits...",
    "> Stabilization protocol enabled.",
    "$ calibrate --precision=HIGH",
    "> Calibration complete. Error rate: 0.00042%",
    "$ load QuantumQuest.engine",
    "> Loading game environment...",
    "> Preparing quantum entanglement interfaces",
    "$ engage --user-interface",
    "> Quantum Dashboard loading...",
    "> Establishing secure quantum channel...",
  ];

  // Advance boot phases based on progress
  useEffect(() => {
    if (progress < 20) setBootPhase(0);
    else if (progress < 40) setBootPhase(1);
    else if (progress < 60) setBootPhase(2);
    else if (progress < 80) setBootPhase(3);
    else setBootPhase(4);
  }, [progress]);

  // Show different loading texts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoadingText((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for code lines
  useEffect(() => {
    if (progress < 10) return;

    const interval = setInterval(() => {
      if (codeLines.length < quantumCodeSnippets.length) {
        setCodeLines((prev) => [...prev, quantumCodeSnippets[prev.length]]);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [progress, codeLines.length]);

  // Auto-scroll code container
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop =
        codeContainerRef.current.scrollHeight;
    }
  }, [codeLines]);

  // Blink cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Generate random "scanning" effect rows for the visualization
  const generateScanRows = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex space-x-1 my-1">
        {Array.from({ length: 16 }).map((_, i) => {
          const intensity = Math.random();
          let color = "bg-gray-800"; // default dim
          if (intensity > 0.85)
            color = "bg-cyan-400"; // brightest
          else if (intensity > 0.7)
            color = "bg-cyan-600"; // bright
          else if (intensity > 0.5) color = "bg-cyan-900"; // medium

          return (
            <div
              key={i}
              className={`h-1.5 w-4 rounded-sm ${color} transition-colors duration-300`}
            ></div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden font-mono text-sm crt-effect">
      {/* CRT screen effect styles */}
      <style jsx global>{`
        .crt-effect {
          background: radial-gradient(ellipse at center, #0a2e38 0%, #000000 70%);
        }
        .crt-effect:before {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
          background-size: 100% 4px;

      {/* Grid background */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#303030 1px, transparent 1px), linear-gradient(90deg, #303030 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Glowing orbs that float around */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full
              ${
                i % 3 === 0
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

      {/* Content container - unified terminal look */}
      <div className="relative z-10 w-full max-w-4xl px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mb-6 flex flex-col items-center"
        >
          <h1 className="text-4xl sm:text-5xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            QUANTUM QUEST
          </h1>
          <p className="text-gray-400 font-light tracking-wide uppercase text-xs sm:text-sm">
            THE ENTANGLED ESCAPE
          </p>
        </motion.div>

        {/* Main terminal container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-900 bg-opacity-80 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden"
        >
          {/* Terminal header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-2 border-b border-gray-700 flex items-center">
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-gray-300 text-xs sm:text-sm flex-1 text-center font-semibold">
              QCortex Quantum Terminal
            </div>
            <div className="text-gray-400 text-xs">
              {bootSequences[bootPhase]}
            </div>
          </div>

          {/* Terminal content split into two sections */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-80">
            {/* Terminal section - 7 columns on md+ */}
            <div className="md:col-span-7 p-4 border-r border-gray-700">
              <div className="text-purple-300 mb-3 text-xs">
                Boot sequence: Phase {bootPhase + 1}/5
              </div>
              <div
                ref={codeContainerRef}
                className="font-mono text-sm text-gray-300 h-full overflow-y-auto custom-scrollbar pr-4"
              >
                {codeLines.map((line, i) => (
                  <div key={i} className="mb-1">
                    <span
                      className={
                        line.startsWith("//")
                          ? "text-blue-400"
                          : line.startsWith("$")
                            ? "text-green-400"
                            : line.startsWith(">")
                              ? "text-purple-400"
                              : "text-cyan-300"
                      }
                    >
                      {line}
                    </span>
                  </div>
                ))}
                {blinkCursor && (
                  <span className="inline-block w-2 h-4 bg-cyan-400 ml-1"></span>
                )}
              </div>
            </div>

            {/* Quantum visualization section - 5 columns on md+ */}
            <div className="md:col-span-5 bg-black bg-opacity-40 p-4 flex flex-col">
              <div className="text-xs text-gray-400 mb-3">
                Quantum State Visualization
              </div>

              {/* Quantum visualization graphic */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-3 mb-4">
                  {/* Quantum circuit visualization */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="relative">
                        <div
                          className={`h-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-sm ${
                            i < bootPhase * 2 ? "opacity-100" : "opacity-20"
                          }`}
                        ></div>
                        <div
                          className={`absolute top-0 left-0 right-0 bottom-0 bg-cyan-400 animate-pulse rounded-sm ${
                            i === bootPhase * 2 - 1 ? "opacity-50" : "opacity-0"
                          }`}
                        ></div>
                      </div>
                    ))}
                  </div>

                  {/* Quantum processing visualization */}
                  <div className="space-y-1">{generateScanRows()}</div>

                  {/* Qubit states visualization */}
                  <div className="grid grid-cols-8 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => {
                      const active = Math.random() > 0.5;
                      return (
                        <div
                          key={i}
                          className={`h-8 w-full rounded flex items-center justify-center text-xs border ${
                            active
                              ? "border-cyan-500 text-cyan-400 bg-cyan-900 bg-opacity-30"
                              : "border-gray-700 text-gray-500 bg-black bg-opacity-30"
                          }`}
                        >
                          q{i}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress and status section */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>{loadingTexts[currentLoadingText]}</span>
                    <span className="font-mono text-purple-400">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-400">
                      <span className="text-purple-400">system:</span>{" "}
                      {bootSequences[bootPhase]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BitKraftStyleLoading;

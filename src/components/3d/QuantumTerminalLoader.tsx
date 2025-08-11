import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  progress: number;
  message?: string;
  hide_title?: boolean;
}

const QuantumTerminalLoader: React.FC<LoadingScreenProps> = ({
  progress,
  message = "Initializing quantum engines...",
  hide_title,
}) => {
  const [currentLoadingText, setCurrentLoadingText] = useState(0);
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [blinkCursor, setBlinkCursor] = useState(true);
  const [scanPhase, setScanPhase] = useState(0);
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
    "$ status --verbose",
    "> All systems nominal. Ready for user interaction.",
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
    if (progress < 10) return;

    const interval = setInterval(() => {
      if (codeLines.length < quantumCodeSnippets.length) {
        setCodeLines((prev) => [...prev, quantumCodeSnippets[prev.length]]);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [progress, codeLines.length]);

  // Update scan phase based on progress
  useEffect(() => {
    const newPhase = Math.floor(progress / 20);
    setScanPhase(newPhase);
  }, [progress]);

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

  // Check if we should update any DOM elements to hide titles
  React.useEffect(() => {
    if (hide_title) {
      document.body.classList.add("loading-active");
    }

    return () => {
      document.body.classList.remove("loading-active");
    };
  }, [hide_title]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black overflow-hidden font-mono text-sm"
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        isolation: "isolate", // Creates a new stacking context
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 z-1 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#303030 1px, transparent 1px), linear-gradient(90deg, #303030 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />

      {/* CRT screen effect */}
      <div
        className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(10,46,56,0.2),rgba(0,0,0,0.4))]"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      <div
        className="absolute inset-0 z-1 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)",
          backgroundSize: "100% 4px",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />

      {/* Glowing orbs that float around */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
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

      {/* Header */}
      {/* The only title that should be displayed during loading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="z-20 mb-6 flex flex-col items-center relative"
      >
        <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 loader-title">
          QUANTUM QUEST
        </h1>
        <h2 className="text-lg font-medium text-gray-300 loader-subtitle">
          The Entangled Escape
        </h2>
      </motion.div>

      {/* Main terminal */}
      <div className="z-20 w-full max-w-4xl px-4 relative">
        {/* Add style to hide any other titles */}
        <style jsx global>{`
          body.loading-active .main-menu-title {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
        `}</style>
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
              QCortex Quantum Terminal v3.8.5
            </div>
            <div className="text-gray-400 text-xs">
              PHASE {scanPhase + 1}/5:{" "}
              {progress >= 100 ? "COMPLETE" : "IN PROGRESS"}
            </div>
          </div>

          {/* Terminal content */}
          <div className="flex flex-col md:flex-row h-[60vh] max-h-[500px] relative z-30">
            {/* Terminal code section */}
            <div className="flex-1 p-4 border-r border-gray-700 flex flex-col">
              <div className="text-xs text-cyan-500 mb-2">
                QUANTUM CORE {progress >= 60 ? "ONLINE" : "INITIALIZING"}
              </div>
              <div
                ref={codeContainerRef}
                className="font-mono text-sm text-gray-300 h-full overflow-y-auto custom-scrollbar"
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

            {/* Quantum visualization section */}
            <div className="md:w-96 bg-black bg-opacity-40 p-4 flex flex-col">
              <div className="text-xs text-cyan-500 mb-4">
                QUANTUM STATE MONITOR
              </div>

              {/* Quantum visualization */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {/* Wave function visualization */}
                  <div className="mb-6">
                    <div className="text-xs text-gray-500 mb-1">
                      WAVE FUNCTION
                    </div>
                    <div className="h-16 bg-gray-900 rounded-md border border-gray-800 relative overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 100 30">
                        {Array.from({ length: 100 }).map((_, i) => {
                          const height =
                            10 +
                            8 * Math.sin((i + progress) / 10) +
                            6 * Math.cos((i + progress) / 5);
                          return (
                            <line
                              key={i}
                              x1={i}
                              y1={15}
                              x2={i}
                              y2={15 - height * (progress / 200 + 0.5)}
                              stroke={`rgba(${80 + i / 2}, ${200 - i / 2}, 255, 0.7)`}
                              strokeWidth="0.5"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Quantum bit matrix */}
                  <div className="mb-6">
                    <div className="text-xs text-gray-500 mb-1">
                      QUBIT ARRAY
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 8 }).map((_, i) => {
                        // Determine if the qubit should be active based on progress
                        const isActive = i < Math.ceil((progress / 100) * 8);
                        return (
                          <div
                            key={i}
                            className={`h-8 flex items-center justify-center rounded ${
                              isActive
                                ? "bg-cyan-900 bg-opacity-30 border border-cyan-600 text-cyan-300"
                                : "bg-gray-900 border border-gray-800 text-gray-600"
                            }`}
                          >
                            q{i}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scanning visualization */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      QUANTUM SCAN
                    </div>
                    <div className="space-y-1">{generateScanRows()}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>{loadingTexts[currentLoadingText]}</span>
                    <span className="font-mono text-purple-400">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
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
                      {progress >= 100
                        ? "Ready for quantum transport"
                        : "Initializing quantum systems"}
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

export default QuantumTerminalLoader;

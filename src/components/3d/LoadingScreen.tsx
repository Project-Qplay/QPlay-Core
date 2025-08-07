import React from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  progress: number;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  message = "Initializing quantum engines...",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-black overflow-hidden">
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-4xl font-orbitron font-bold text-white mb-2">
            Quantum <span className="text-cyan-400">Quest</span>
          </h2>
          <p className="text-gray-300">{message}</p>
        </motion.div>

        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-400">
          <span>Quantum initialization</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="mt-8 text-center">
          <div className="animate-pulse text-cyan-400 text-xs font-orbitron">
            ⚛️ Entangling quantum particles... Initializing spaceship
            controls...
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* More particles and different sizes/colors */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 5 === 0
                ? "w-2 h-2 bg-cyan-400"
                : i % 4 === 0
                  ? "w-1.5 h-1.5 bg-purple-500"
                  : "w-1 h-1 bg-blue-500"
            }`}
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.7,
              scale: Math.random() * 2 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * 100 + "%"],
              x: [null, (Math.random() - 0.5) * 20 + "%"],
              opacity: [null, Math.random() * 0.5 + 0.2],
              scale: [null, Math.random() * 1.5 + 0.3],
            }}
            transition={{
              duration: Math.random() * 8 + 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;

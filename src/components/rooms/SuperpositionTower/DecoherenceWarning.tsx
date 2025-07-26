import React from "react";
import { AlertTriangle } from "lucide-react";

interface DecoherenceWarningProps {
  decoherenceTimer: number;
  isVisible: boolean;
}

const DecoherenceWarning: React.FC<DecoherenceWarningProps> = ({
  decoherenceTimer,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-xl animate-pulse">
      <div className="flex items-center mb-2">
        <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
        <span className="text-red-300 font-semibold">
          DECOHERENCE WARNING
        </span>
      </div>
      <p className="text-red-200 text-sm mb-2">
        Quantum state unstable! System collapse in: {decoherenceTimer}s
      </p>
      <div className="w-full bg-red-800 rounded-full h-2">
        <div
          className="bg-red-400 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${(decoherenceTimer / 10) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default DecoherenceWarning;
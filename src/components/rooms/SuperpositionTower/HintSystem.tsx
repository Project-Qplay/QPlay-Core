import React from "react";
import { Lightbulb, Eye, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";

interface HintSystemProps {
  showHints: boolean;
  onToggleHints: () => void;
}

const HintSystem: React.FC<HintSystemProps> = ({
  showHints,
  onToggleHints,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center">
          <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
          Quantum Hints
        </h3>
        <button
          onClick={onToggleHints}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            showHints
              ? "bg-yellow-500 text-black"
              : "bg-gray-600 text-gray-300"
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-purple-400" />
          <span>(|0⟩ + |1⟩)/√2 - Superposition (walkable)</span>
        </div>
        <div className="flex items-center space-x-2">
          <ArrowUp className="w-4 h-4 text-blue-400" />
          <span>|0⟩ - Spin up (blocked)</span>
        </div>
        <div className="flex items-center space-x-2">
          <ArrowDown className="w-4 h-4 text-red-400" />
          <span>|1⟩ - Spin down (blocked)</span>
        </div>
        {showHints && (
          <div className="text-yellow-400 text-xs mt-2 p-2 bg-yellow-900/20 rounded">
            💡 Glowing pads show where superposition is needed!
          </div>
        )}
      </div>
    </div>
  );
};

export default HintSystem;
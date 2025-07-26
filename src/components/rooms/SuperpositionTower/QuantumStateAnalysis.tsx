import React from "react";
import { QuantumPad as QuantumPadType, isStateReachable, FLOOR_PATTERNS } from "../../../utils/quantumLogic";

interface QuantumStateAnalysisProps {
  quantumPads: QuantumPadType[];
  currentFloor: number;
  pathStable: boolean;
  interferencePattern: "constructive" | "destructive" | "none";
  attempts: number;
}

const QuantumStateAnalysis: React.FC<QuantumStateAnalysisProps> = ({
  quantumPads,
  currentFloor,
  pathStable,
  interferencePattern,
  attempts,
}) => {
  const superpositionCount = quantumPads.filter((p) => p.state === "superposition").length;
  const isSolvable = isStateReachable(quantumPads, FLOOR_PATTERNS[currentFloor].required);

  return (
    <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500 rounded-xl">
      <h3 className="font-semibold text-purple-300 mb-2">
        Quantum State Analysis
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Superposition pads:</span>
          <span className="text-purple-400">
            {superpositionCount}/{quantumPads.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Path coherence:</span>
          <span className={pathStable ? "text-green-400" : "text-red-400"}>
            {pathStable ? "Stable" : "Unstable"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Interference:</span>
          <span
            className={
              interferencePattern === "constructive"
                ? "text-green-400"
                : interferencePattern === "destructive"
                  ? "text-red-400"
                  : "text-gray-400"
            }
          >
            {interferencePattern === "none" ? "None" : interferencePattern}
          </span>
        </div>
        <div className="flex justify-between">
          <span>State solvability:</span>
          <span className={isSolvable ? "text-green-400" : "text-red-400"}>
            {isSolvable ? "Solvable" : "Impossible"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total attempts:</span>
          <span className="text-gray-400">{attempts}</span>
        </div>
      </div>
    </div>
  );
};

export default QuantumStateAnalysis;
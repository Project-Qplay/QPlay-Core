import React from "react";
import { Clock, Target } from "lucide-react";
import { FLOOR_PATTERNS } from "../../../utils/quantumLogic";

interface FloorProgressProps {
  currentFloor: number;
  totalFloors: number;
  timeLeft: number;
}

const FloorProgress: React.FC<FloorProgressProps> = ({
  currentFloor,
  totalFloors,
  timeLeft,
}) => {
  return (
    <div className="mb-6 p-4 bg-gray-700/50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">
          Floor {currentFloor + 1}/{totalFloors}
        </span>
        <div className="flex items-center text-orange-400">
          <Clock className="w-4 h-4 mr-1" />
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentFloor + 1) / totalFloors) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

interface CurrentObjectiveProps {
  currentFloor: number;
}

const CurrentObjective: React.FC<CurrentObjectiveProps> = ({ currentFloor }) => {
  const pattern = FLOOR_PATTERNS[currentFloor];
  
  return (
    <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
      <h3 className="font-semibold text-green-300 mb-2 flex items-center">
        <Target className="w-4 h-4 mr-2" />
        Floor {currentFloor + 1} Objective
      </h3>
      <p className="text-green-200 text-sm mb-2">{pattern.description}</p>
      <div className="text-xs text-green-400">
        Required sequence:{" "}
        {pattern.required.map((p) => `Pad ${p + 1}`).join(" → ")}
      </div>
    </div>
  );
};

export { FloorProgress, CurrentObjective };
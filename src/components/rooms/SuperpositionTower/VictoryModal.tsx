import React from "react";
import FeedbackButton from "../../FeedbackButton";

interface VictoryModalProps {
  attempts: number;
  timeUsed: number;
  onClose?: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ 
  attempts, 
  timeUsed,
  onClose 
}) => {
  return (
    <div className="mt-6 p-6 bg-green-900/30 border border-green-500 rounded-xl text-center">
      <div className="text-4xl mb-4">🎉</div>
      <p className="text-green-300 font-semibold text-xl mb-2">
        Superposition Tower Conquered!
      </p>
      <p className="text-green-200 text-sm mb-4">
        Extraordinary! You've mastered the quantum art of
        superposition and wave interference. You've proven that
        quantum mechanics allows for paths that classical physics
        would consider impossible. The tower's quantum locks have
        been permanently disabled!
      </p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-green-800/30 p-3 rounded-lg">
          <div className="font-semibold text-green-300">
            Total Attempts:
          </div>
          <div className="text-green-200">{attempts}</div>
        </div>
        <div className="bg-green-800/30 p-3 rounded-lg">
          <div className="font-semibold text-green-300">
            Final Time:
          </div>
          <div className="text-green-200">
            {Math.floor(timeUsed / 60)}:
            {(timeUsed % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </div>
      <div className="mt-4 text-green-400 text-sm mb-4">
        🏆 Achievement Unlocked: Superposition Walker
      </div>
      <FeedbackButton 
        roomId="superposition-tower" 
        className="w-full sm:w-auto"
      />
    </div>
  );
};

export default VictoryModal;
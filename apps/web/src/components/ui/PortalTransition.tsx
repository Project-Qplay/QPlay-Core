import React from 'react';

const PortalTransition: React.FC<{ show: boolean; onEnd: () => void }> = ({ show, onEnd }) => {
  return show ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-700"
      style={{ animation: 'portalZoom 1s forwards' }}
      onAnimationEnd={onEnd}
    >
      <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 via-blue-400 to-pink-400 shadow-2xl animate-spin-slow flex items-center justify-center">
        <span className="text-5xl font-orbitron text-white drop-shadow-lg">🌀</span>
      </div>
      <style>
        {`
          @keyframes portalZoom {
            0% { opacity: 0; transform: scale(0.5);}
            50% { opacity: 1; transform: scale(1.1);}
            100% { opacity: 0; transform: scale(2);}
          }
          .animate-spin-slow {
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  ) : null;
};

export default PortalTransition;

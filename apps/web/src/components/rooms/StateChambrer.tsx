import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Compass, Zap, Timer, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useGame } from "../../contexts/GameContext";
import FeedbackButton from "../FeedbackButton";

// Add global type declarations for Blochy libraries
declare global {
  interface Window {
    Plotly: any;
    math: any;
    gen_bloch_sphere: () => any;
    update_state_plot: (redraw: boolean) => void;
    rotate_state: (axis: string, angle: number) => void;
    STATE: any[];
    BLOCHSPHERE: any;
    PHOSPHOR_ENABLED: boolean;
    PHOSPHOR: any[];
  }
}

interface BlochVector {
  x: number;
  y: number;
  z: number;
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const StateChambrer: React.FC = () => {
  const { completeRoom } = useGame();
  const [measurements, setMeasurements] = useState({ x: 0, y: 0, z: 0 });
  const [measurementCount, setMeasurementCount] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [reconstructedState, setReconstructedState] = useState<BlochVector>({
    x: 0,
    y: 0,
    z: 0,
  });
  const [decoherenceLevel, setDecoherenceLevel] = useState(0.8);
  const [noiseFilter, setNoiseFilter] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isActive, setIsActive] = useState(false);
  const [roomCompleted, setRoomCompleted] = useState(false);
  const [showDecoherence, setShowDecoherence] = useState(false);
  const [isFilterApplying, setIsFilterApplying] = useState(false);
  const blochSphereRef = useRef<HTMLDivElement>(null);
  const [blochSphereLoaded, setBlochSphereLoaded] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Tutorial modal state
  const [showTutorial, setShowTutorial] = useState(true);

  // Enhanced slider performance state
  const sliderRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  // Hidden target state (players need to reconstruct this)
  // const targetState: BlochVector = { x: 0.6, y: 0.8, z: 0.2 };

  //  NEW: Generate a random, normalized Bloch vector for target state
const getRandomTargetState = (): BlochVector => {
  let x = Math.random() * 2 - 1;
  let y = Math.random() * 2 - 1;
  let z = Math.random() * 2 - 1;
  const magnitude = Math.sqrt(x * x + y * y + z * z);
  return { x: x / magnitude, y: y / magnitude, z: z / magnitude };
};

//  Use useState to initialize target only once per session
const [targetState] = useState<BlochVector>(() => getRandomTargetState());

//  Log target only during development
useEffect(() => {
  if (process.env.NODE_ENV === "development") {
    console.log("🎯 Target State:", targetState);
  }
}, [targetState]);

  // Memoized debounce function to prevent recreation
  const stableDebounce = useCallback(
    debounce((value: number) => {
      setNoiseFilter(value);
    }, 100), // Reduced frequency for better performance
    [],
  );

  // Optimized input handler with direct DOM manipulation
  const handleSliderInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);

      // Use requestAnimationFrame for smooth visual updates
      setDisplayValue(value);
      stableDebounce(value);
    },
    [stableDebounce],
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Load Blochy scripts and initialize Bloch sphere with proper error handling
  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Add CSS for zero-lag slider first
        const style = document.createElement("style");
        style.textContent = `
          .slider-no-lag {
            outline: none;
            background: transparent;
            margin: 0;
            padding: 0;
          }

          .slider-no-lag::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: none !important;
            transform: none !important;
          }

          .slider-no-lag::-webkit-slider-thumb:hover {
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
          }

          .slider-no-lag::-webkit-slider-thumb:active {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          .slider-no-lag::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: none !important;
          }

          .slider-no-lag::-moz-range-track {
            background: transparent;
            border: none;
            height: 2px;
          }

          .slider-no-lag,
          .slider-no-lag * {
            transition: none !important;
            animation-duration: 0s !important;
          }
        `;
        document.head.appendChild(style);

        // Load required scripts with better error handling
        const scripts = [
          "/Blochy-main/plotly-2.16.1.min.js",
          "https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.2.1/math.js",
          "/Blochy-main/helper.js",
          "/Blochy-main/quantum.js",
          "/Blochy-main/plot.js",
          "/Blochy-main/ui.js",
        ];

        for (const src of scripts) {
          await new Promise<void>((resolve, reject) => {
            // Check if script already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }

            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => {
              console.warn(`Failed to load script: ${src}`);
              resolve(); // Continue loading other scripts
            };
            document.head.appendChild(script);
          });
        }

        setScriptsLoaded(true);

        // Wait a bit for scripts to initialize
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Initialize global variables with safety checks
        if (typeof window !== "undefined") {
          window.PHOSPHOR_ENABLED = false;
          window.PHOSPHOR = [];

          // Only initialize if math library is available
          if (window.math) {
            window.STATE = [
              window.math.complex(1, 0),
              window.math.complex(0, 0),
            ];
          }

          // Create and draw the Bloch sphere with safety checks
          if (blochSphereRef.current && window.gen_bloch_sphere) {
            try {
              window.BLOCHSPHERE = window.gen_bloch_sphere();
              if (window.update_state_plot) {
                window.update_state_plot(true);
              }
              setBlochSphereLoaded(true);
            } catch (error) {
              console.warn("Failed to initialize Bloch sphere:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading Blochy scripts:", error);
      }
    };

    loadScripts();

    // Cleanup function
    return () => {
      // Clean up any dynamically added scripts and styles
      const scripts = document.querySelectorAll(
        'script[src*="Blochy-main"], script[src*="mathjs"]',
      );
      scripts.forEach((script) => script.remove());
    };
  }, []);

  const performMeasurement = useCallback(
    (axis: "x" | "y" | "z") => {
      if (measurementCount[axis] >= 3) return;

      const noise = (Math.random() - 0.5) * 0.2;
      const measurement = targetState[axis] + noise;

      setMeasurements((prev) => ({ ...prev, [axis]: measurement }));
      setMeasurementCount((prev) => ({ ...prev, [axis]: prev[axis] + 1 }));

      if (!isActive) {
        setIsActive(true);
      }
    },
    [isActive],
  );

const reconstructState = () => {
  const reconstructed: BlochVector = {
    x: measurements.x,
    y: measurements.y,
    z: measurements.z,
  };

  setReconstructedState(reconstructed);

  //  Calculate how close player is to the target
  const distance = Math.sqrt(
    Math.pow(reconstructed.x - targetState.x, 2) +
      Math.pow(reconstructed.y - targetState.y, 2) +
      Math.pow(reconstructed.z - targetState.z, 2),
  );

  //  Provide tiered feedback depending on how close they are
  if (distance < 0.3) {
    setShowDecoherence(true);
  } else if (distance < 0.5) {
    alert("✨ Almost there! Apply the noise filter to refine your guess.");
  } else if (distance < 0.7) {
    alert("⚠️ Not bad! You're getting closer.");
  } else {
    alert("❌ You're far off. Try more accurate measurements.");
  }
};

  const applyNoiseFilter = () => {
    setIsFilterApplying(true);

    setTimeout(() => {
      // Apply the noise filter by scaling the vector
      const cleaned: BlochVector = {
        x: reconstructedState.x * noiseFilter,
        y: reconstructedState.y * noiseFilter,
        z: reconstructedState.z * noiseFilter,
      };

      // Update the reconstructed state
      setReconstructedState(cleaned);

      //  Check if the cleaned state is "pure" enough
      const magnitude = Math.sqrt(
        cleaned.x ** 2 + cleaned.y ** 2 + cleaned.z ** 2,
      );

      if (magnitude > 0.9 && magnitude < 1.1) {
        setRoomCompleted(true);
        completeRoom("state-chamber");
      }

      setIsFilterApplying(false);
    }, 1000);
  };

  const getBlochSphereColor = () => {
    if (showDecoherence && noiseFilter < 0.7) {
      return "from-red-500 to-orange-500";
    }
    return "from-purple-500 to-violet-500";
  };

  // Function to convert Bloch sphere coordinates to Euler angles
  const blochSphereToEuler = (X: number, Y: number, Z: number) => {
    const norm = Math.sqrt(X * X + Y * Y + Z * Z);
    if (norm === 0) {
      return { x: 0, y: 0, z: 0 };
    }
    const x = X / norm;
    const y = Y / norm;
    const z = Z / norm;

    const theta = Math.acos(Math.max(-1, Math.min(1, z))); // Clamp to avoid NaN
    const phi = Math.atan2(y, x);

    return {
      x: 0,
      y: theta,
      z: phi,
    };
  };

  // Update Bloch sphere when reconstructed state changes with safety checks
  useEffect(() => {
    if (
      blochSphereLoaded &&
      scriptsLoaded &&
      (reconstructedState.x !== 0 ||
        reconstructedState.y !== 0 ||
        reconstructedState.z !== 0)
    ) {
      try {
        if (
          window.math &&
          window.STATE &&
          window.rotate_state &&
          window.update_state_plot
        ) {
          // Reset to |0⟩ state
          window.STATE = [window.math.complex(1, 0), window.math.complex(0, 0)];

          // Apply the noise filter to the vector
          const filteredVector = {
            x: reconstructedState.x * noiseFilter,
            y: reconstructedState.y * noiseFilter,
            z: reconstructedState.z * noiseFilter,
          };

          // Convert to Bloch sphere rotation angles
          const rotations = blochSphereToEuler(
            filteredVector.x,
            filteredVector.y,
            filteredVector.z,
          );

          // Rotate the state visually
          window.rotate_state("x", rotations.x);
          window.rotate_state("y", rotations.y);
          window.rotate_state("z", rotations.z);

          // Update plot
          window.update_state_plot(true);
        }
      } catch (error) {
        console.warn("Error updating Bloch sphere:", error);
      }
    }
  }, [
    reconstructedState.x,
    reconstructedState.y,
    reconstructedState.z,
    noiseFilter,
    blochSphereLoaded,
    scriptsLoaded,
  ]);

  useEffect(() => {
  if (timeLeft === 0 && !roomCompleted) {
    alert("⏰ Time’s up! The quantum state has decohered. Try again.");
    setIsActive(false);
    // Optionally: Lock controls or reset game here
  }
}, [timeLeft, roomCompleted]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-6">
      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, pointerEvents: "none" }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-900/95 rounded-2xl border border-purple-500 max-w-3xl w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🔮</div>
                <h2 className="text-2xl font-bold text-purple-400 mb-4">
                  State Chamber Tutorial
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">
                    🔬 The Science
                  </h3>
                  <p className="text-purple-200 text-sm">
                    The Bloch sphere is a holographic representation of quantum
                    states. Your goal is to reconstruct a hidden qubit state by
                    making strategic measurements along the X, Y, and Z axes.
                  </p>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-300 mb-2">
                    🎮 Step-by-Step
                  </h3>
                  <ol className="text-yellow-200 text-sm list-decimal list-inside space-y-1">
                    <li>
                      Perform up to 3 measurements on each axis (X, Y, Z).
                    </li>
                    <li>
                      Analyze your results and reconstruct the quantum state
                      vector.
                    </li>
                    <li>
                      Apply the noise filter to purify your reconstructed state.
                    </li>
                    <li>
                      If your state is close enough to the target, you’ll
                      conquer the chamber!
                    </li>
                  </ol>
                </div>

                <div className="bg-red-900/30 border border-red-500 rounded-xl p-4">
                  <h3 className="font-semibold text-red-300 mb-2">
                    ⚠️ Decoherence Warning
                  </h3>
                  <p className="text-red-200 text-sm">
                    Decoherence can degrade your quantum state. Use the noise
                    filter wisely to isolate the true state before time runs
                    out!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowTutorial(false);
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                <span className="block w-full h-full text-center">
                  Begin Quantum Analysis!
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            STATE CHAMBER
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Navigate the complex world of quantum states using the holographic
            Bloch sphere. Reconstruct the hidden qubit state through strategic
            measurements before decoherence destroys it.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Bloch Sphere Visualization */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <Compass className="w-6 h-6 mr-3 text-purple-400" />
                Holographic Bloch Sphere
              </h2>
              {isActive && (
                <div className="flex items-center text-orange-400">
                  <Timer className="w-5 h-5 mr-2" />
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </div>
              )}
            </div>

            {/* Bloch Sphere Container */}
            <div className="flex justify-center mb-6">
              <div
                ref={blochSphereRef}
                id="myDiv"
                style={{ width: "600px", height: "600px" }}
                className="rounded-lg bg-gray-900/50"
              >
                {!blochSphereLoaded && (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
                      <p>Loading Quantum Bloch Sphere...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden inputs for Blochy scripts */}
            <div style={{ display: "none" }}>
              <input type="hidden" id="spin_color" value="#1a237e" />
              <input type="hidden" id="phosphor_color" value="#1a237e" />
              <input type="hidden" id="phosphor_length" value="10" />
              <input type="hidden" id="north_text" value="0" />
              <input type="hidden" id="south_text" value="1" />
              <input type="hidden" id="export_size" value="800" />
            </div>

            {/* Animated Decoherence Warning Section */}
            {showDecoherence && (
              <div className="mb-6 transform transition-all duration-700 ease-out animate-in slide-in-from-bottom-4 fade-in">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 backdrop-blur-sm">
                  {/* Animated background pulse */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 animate-pulse"></div>

                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-xl border-2 border-red-500/50 animate-pulse"></div>

                  <div className="relative p-4 space-y-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-400 mr-2 animate-bounce" />
                      <span className="text-orange-400 font-semibold animate-pulse">
                        Decoherence Detected!
                      </span>
                      {/* Animated warning dots */}
                      <div className="ml-2 flex space-x-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                        <div
                          className="w-2 h-2 bg-orange-400 rounded-full animate-ping"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4">
                      The quantum state is degrading. Adjust the noise filter to
                      isolate the true state.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-400">
                          Noise Filter:
                        </label>
                        <span className="text-lg font-mono text-cyan-400 transition-colors duration-300 hover:text-cyan-300">
                          {displayValue.toFixed(2)}
                        </span>
                      </div>

                      {/* Zero-lag slider container */}
                      <div className="relative">
                        {/* Background track */}
                        <div className="w-full h-2 bg-gray-700 rounded-lg"></div>

                        {/* Progress indicator with ref for direct manipulation */}
                        <div
                          ref={progressRef}
                          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg pointer-events-none"
                          style={{ width: `${displayValue * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-lg"></div>
                        </div>

                        {/* Input slider with zero styling interference */}
                        <input
                          ref={sliderRef}
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={displayValue}
                          onInput={handleSliderInput} // Use onInput instead of onChange for immediate response
                          className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent cursor-pointer slider-no-lag"
                        />
                      </div>

                      {/* Filter quality indicator */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              displayValue < 0.3
                                ? "bg-red-500"
                                : displayValue < 0.7
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${displayValue * 100}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium transition-colors duration-300 ${
                            displayValue < 0.3
                              ? "text-red-400"
                              : displayValue < 0.7
                                ? "text-yellow-400"
                                : "text-green-400"
                          }`}
                        >
                          {displayValue < 0.3
                            ? "Poor"
                            : displayValue < 0.7
                              ? "Fair"
                              : "Excellent"}
                        </span>
                      </div>

                      {/* Animated Apply Filter Button */}
                      <button
                        onClick={applyNoiseFilter}
                        disabled={isFilterApplying || timeLeft === 0}
                        className={`w-full px-4 py-3 rounded-xl font-semibold text-white
                                 transition-all duration-300 transform hover:scale-105
                                 active:scale-95 disabled:scale-100 disabled:opacity-70
                                 ${
                                   isFilterApplying
                                     ? "bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"
                                     : "bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400"
                                 }
                                 shadow-lg hover:shadow-xl disabled:cursor-not-allowed
                                 relative overflow-hidden`}
                      >
                        {isFilterApplying && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-right"></div>
                        )}
                        <span className="relative flex items-center justify-center">
                          {isFilterApplying ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                              Processing Filter...
                            </>
                          ) : (
                            "Apply Filter"
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Measurement Control Panel */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-yellow-400" />
              Measurement Control Panel
            </h2>

            <div className="space-y-6">
              {["x", "y", "z"].map((axis, index) => (
                <div key={axis} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold capitalize">
                      {axis}-Axis Measurement
                    </label>
                    <span className="text-sm text-gray-400">
                      {measurementCount[axis as keyof typeof measurementCount]}
                      /3 attempts
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() =>
                        performMeasurement(axis as "x" | "y" | "z")
                      }
                     disabled={
  measurementCount[axis as keyof typeof measurementCount] >= 3 || timeLeft === 0
}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300
                               disabled:opacity-50 disabled:cursor-not-allowed ${
                                 axis === "x"
                                   ? "bg-red-500 hover:bg-red-400"
                                   : axis === "y"
                                     ? "bg-green-500 hover:bg-green-400"
                                     : "bg-blue-500 hover:bg-blue-400"
                               }`}
                    >
                      Measure {axis.toUpperCase()}
                    </button>

                    {measurements[axis as keyof typeof measurements] !== 0 && (
                      <div className="text-lg font-mono">
                        {measurements[
                          axis as keyof typeof measurements
                        ].toFixed(3)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

            <button
  onClick={reconstructState}
  disabled={
    Object.values(measurementCount).some((count) => count === 0) || timeLeft === 0
  }
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-violet-500
                         hover:from-purple-400 hover:to-violet-400 disabled:opacity-50
                         disabled:cursor-not-allowed rounded-xl font-semibold text-lg
                         transition-all duration-300 transform hover:scale-105"
              >
                Reconstruct Quantum State
              </button>

              {reconstructedState.x !== 0 && (
                <div className="mt-6 p-4 bg-gray-700/50 rounded-xl">
                  <h3 className="font-semibold mb-2">
                    Reconstructed State Vector:
                  </h3>
                  <div className="font-mono text-sm space-y-1">
                    <div>X: {reconstructedState.x.toFixed(3)}</div>
                    <div>Y: {reconstructedState.y.toFixed(3)}</div>
                    <div>Z: {reconstructedState.z.toFixed(3)}</div>
                    <div className="mt-2 text-cyan-400">
                      |r| ={" "}
                      {Math.sqrt(
                        reconstructedState.x ** 2 +
                          reconstructedState.y ** 2 +
                          reconstructedState.z ** 2,
                      ).toFixed(3)}
                    </div>
                  </div>
                </div>
              )}

              {roomCompleted && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
                  <p className="text-green-300 font-semibold">
                    🎉 State Chamber Conquered!
                  </p>
                  <p className="text-green-200 text-sm mt-2 mb-4">
                    Excellent work! You've successfully reconstructed the
                    quantum state and learned to distinguish between pure and
                    mixed states through decoherence analysis. The Bloch sphere
                    is now yours to command!
                  </p>
                  <FeedbackButton 
                    roomId="state-chamber" 
                    className="w-full sm:w-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateChambrer;

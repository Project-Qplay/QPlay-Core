import React, { useState, useEffect } from "react";
import {
    Zap,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Lightbulb,
    Eye,
    Target,
    CheckCircle,
} from "lucide-react";
import { useGame } from "../../contexts/GameContext";
import FeedbackButton from "../FeedbackButton";

interface QuantumPad {
    id: number;
    state: "up" | "down" | "superposition_plus" | "superposition_minus";
    locked: boolean;
    glowing: boolean;
    phase: number; // For interference calculations
    amplitude: number;
}

const SuperpositionTower: React.FC = () => {
    const { completeRoom, logQuantumMeasurement } = useGame();
    const [currentFloor, setCurrentFloor] = useState(0);
    const [playerPosition, setPlayerPosition] = useState(2); // Middle position
    const [quantumPads, setQuantumPads] = useState<QuantumPad[]>([]);
    const [stepHistory, setStepHistory] = useState<number[]>([]);
    const [roomCompleted, setRoomCompleted] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const [roomStartTime] = useState(Date.now());
    const [attempts, setAttempts] = useState(0);
    const [showTutorial, setShowTutorial] = useState(true);
    const [lastError, setLastError] = useState("");
    const [interferencePattern, setInterferencePattern] = useState<
        "constructive" | "destructive" | "none"
    >("none");
    const [quantumStateCollapsed, setQuantumStateCollapsed] = useState(false);

    // Floor patterns - each floor has a specific solution
    const floorPatterns = [
        { required: [2], description: "Create superposition in the center pad" },
        {
            required: [1, 3],
            description:
                "Two adjacent superposition states for constructive interference",
        },
        {
            required: [0, 2, 4],
            description: "Alternating pattern creates stable quantum bridge",
        },
        {
            required: [1, 2, 3],
            description: "Three consecutive pads form perfect interference pattern",
        },
        {
            required: [0, 1, 3, 4],
            description: "Four-pad configuration for maximum quantum coherence",
        },
    ];

    // Helper function to generate solvable initial states
    const generateSolvableState = (floorIndex: number): QuantumPad[] => {
        const pattern = floorPatterns[floorIndex];
        const newPads: QuantumPad[] = [];

        for (let i = 0; i < 5; i++) {
            const isRequired = pattern.required.includes(i);

            // Phases cannot be random for states |0> and |1>
            // The relative phase is 0 for +|1> and pi for -|1>
            // |0> doesn't have a relative phase

            const newState = Math.random() > 0.5 ? "up" : "down";
            const newPhase = newState === "up"
                            ? (Math.floor(Math.random() * 2) * Math.PI) // For |1>, random phase of 0 or pi
                            : 0; // No phase for |0>, because it has none...

            newPads.push({
                id: i,
                state: newState,
                locked: false,
                glowing: isRequired,
                phase: newPhase,
                amplitude: newPhase !== 0 ? -1.0 : 1.0,
            });
        }

        return newPads;
    };

    // Initialize quantum pads for current floor
    useEffect(() => {
        const pattern = floorPatterns[currentFloor];
        let newPads: QuantumPad[] = generateSolvableState(currentFloor);

        setQuantumPads(newPads);
        setStepHistory([]);
        setPlayerPosition(pattern.required[0]);
        setLastError("");
        setInterferencePattern("none");
        setQuantumStateCollapsed(false);
    }, [currentFloor]);

    const startGame = () => {
        setShowTutorial(false);
    };

    const applyHadamardGate = (padId: number) => {
        if (quantumPads[padId].locked || quantumStateCollapsed) return;

        setQuantumPads((prev) =>
            prev.map((pad) => {
                if (pad.id === padId) {
                    let newState: "up" | "down" | "superposition_plus" | "superposition_minus";
                    let newPhase = pad.phase;
                    let newAmplitude = pad.amplitude;

                    if (pad.state === "up") {
                        newState = "superposition_plus";
                        newPhase = 0;
                        newAmplitude = 1 / Math.sqrt(2);
                    } else if (pad.state === "down") {
                        newState = "superposition_minus";
                        newPhase = Math.PI;
                        newAmplitude = 1 / Math.sqrt(2);
                    } else {
                        // Simulate collapse
                        newState = Math.random() > 0.5 ? "up" : "down";

                        // Phase should stay the same because it's a projective measurement
                        // meaning we keep the term |1> with its coefficient normalized (phase persists through this)...
                        // newPhase = 0;
                        newPhase = newState === "down" ? newPhase : 0;

                        newAmplitude = newPhase !== 0 ? -1.0 : 1.0;
                    }

                    return {
                        ...pad,
                        state: newState,
                        phase: newPhase,
                        amplitude: newAmplitude,
                    };
                }
                return pad;
            }),
        );

        // Update quantum clue board
        if (!quantumPads[padId].state.startsWith("superposition")) {
            setLastError(
                `✨ Hadamard transformation applied to Pad ${padId + 1}! Quantum superposition created.`,
            );
        } else {
            setLastError(
                `📏 Quantum measurement performed on Pad ${padId + 1}! Superposition collapsed to classical state.`,
            );
        }
    };

    const stepOnPad = async (padId: number) => {
        if (quantumStateCollapsed) return;

        const pad = quantumPads[padId];
        const pattern = floorPatterns[currentFloor];

        // Log quantum interaction
        await logQuantumMeasurement("superposition-tower", "pad_interaction", {
            pad_id: padId,
            pad_state: pad.state,
            floor: currentFloor,
            player_position: playerPosition,
            timestamp: new Date().toISOString(),
        });

        // Check if pad is in superposition
        if (!pad.state.startsWith("superposition")) {
            triggerDecoherence(
                `❌ Cannot step on classical state! Pad ${padId + 1} is in ${pad.state === "up" ? "|0⟩" : "|1⟩"} state.`,
            );
            return;
        }

        // Check if this pad is part of the correct pattern
        if (!pattern.required.includes(padId)) {
            triggerDecoherence(
                `❌ Wrong quantum path! Stepping on Pad ${padId + 1} creates decoherence!`,
            );
            return;
        }

        // Check if this is the next correct step in sequence
        const nextRequiredPad = pattern.required[stepHistory.length];
        if (padId !== nextRequiredPad) {
            triggerDecoherence(
                `❌ Incorrect sequence! You must step on Pad ${nextRequiredPad + 1} next to maintain coherence.`,
            );
            return;
        }

        // Successful step!
        const newStepHistory = [...stepHistory, padId];
        setStepHistory(newStepHistory);
        setPlayerPosition(padId);
        setLastError("");

        // Lock the pad and create path segment
        setQuantumPads((prev) =>
            prev.map((pad) => (pad.id === padId ? { ...pad, locked: true } : pad)),
        );

        // Add path segment with interference calculation
        if (newStepHistory.length > 1) {
            const prevPad = newStepHistory[newStepHistory.length - 2];
            const interference = calculateInterference(prevPad, padId);
            setInterferencePattern(interference);
        }

        // Check for constructive interference
        if (newStepHistory.length > 1) {
            if (checkConstructiveInterference(newStepHistory)) {
                setLastError(
                    `✅ Constructive interference achieved! Quantum bridge segment ${newStepHistory.length}/${pattern.required.length} stable.`,
                );
            } else {
                triggerDecoherence(
                    "❌ Quantum path unstable! Destructive interference has cancelled out the superposition!",
                );
                return;
            }
        }

        // Check if floor is complete
        if (newStepHistory.length === pattern.required.length) {
            setTimeout(() => {
                setLastError(
                    `🎉 Floor ${currentFloor + 1} completed! Perfect quantum interference pattern achieved.`,
                );
                if (currentFloor < 4) {
                    setTimeout(() => {
                        setCurrentFloor((prev) => prev + 1);
                    }, 2000);
                } else {
                    setTimeout(async () => {
                        setRoomCompleted(true);

                        // Calculate completion metrics
                        const completionTime = Date.now() - roomStartTime;
                        const score = Math.max(
                            1500 - attempts * 50 - Math.floor(completionTime / 1000),
                            200,
                        );

                        // Log final quantum state measurement
                        await logQuantumMeasurement(
                            "superposition-tower",
                            "tower_completion",
                            {
                                floors_completed: 5,
                                final_path: stepHistory,
                                completion_time: completionTime,
                                total_attempts: attempts,
                            },
                        );

                        // Complete room with metrics
                        await completeRoom("superposition-tower", {
                            time: completionTime,
                            attempts: attempts,
                            score: score,
                        });
                    }, 2000);
                }
            }, 1000);
        }
    };

    const calculateInterference = (
        pad1: number,
        pad2: number,
    ): "constructive" | "destructive" => {
        const phase1 = quantumPads[pad1]?.phase || 0;
        const phase2 = quantumPads[pad2]?.phase || 0;

        // Phases are either 0 or pi
        // Same phase (0,0 or pi, pi) is constructive
        // Different phase (0,pi or pi,0) is destructive
        // No need to check for arbitrary phases for this room...
        
        return phase1 === phase2 ? "constructive" : "destructive";
    };

    const checkConstructiveInterference = (path: number[]): boolean => {
        if (path.length < 2) return true;

        // Check all adjacent pairs in the path
        for (let i = 0; i < path.length - 1; i++) {
            const interference = calculateInterference(path[i], path[i + 1]);
            if (interference === "destructive") return false;
        }
        return true;
    };

    const triggerDecoherence = (message: string) => {
        setQuantumStateCollapsed(true);
        setLastError(message);
        setAttempts((prev) => prev + 1);

        // Reset after showing decoherence effect
        setTimeout(() => {
            resetPath();
        }, 3000);
    };

    const resetPath = () => {
        const pattern = floorPatterns[currentFloor];

        setStepHistory([]);
        setPlayerPosition(pattern.required[0]);
        setInterferencePattern("none");
        setQuantumStateCollapsed(false);
        setLastError(
            "🔄 Quantum system reset with guaranteed solvable configuration.",
        );

        let newPads: QuantumPad[] = generateSolvableState(currentFloor);
        setQuantumPads(newPads);
    };

    const getPadColor = (pad: QuantumPad) => {
        if (quantumStateCollapsed) {
            return "from-red-600 to-red-800 animate-pulse";
        }
        if (pad.locked) {
            return "from-green-500 to-emerald-500";
        }
        switch (pad.state) {
            case "up":
                return "from-blue-500 to-blue-600";
            case "down":
                return "from-red-500 to-red-600";
            case "superposition_plus":
            case "superposition_minus":
                return "from-purple-500 to-pink-500 animate-pulse";
            default:
                return "from-gray-500 to-gray-600";
        }
    };

    const getPadIcon = (state: string) => {
        switch (state) {
            case "up":
                return <ArrowUp className="w-6 h-6" />;
            case "down":
                return <ArrowDown className="w-6 h-6" />;
            case "superposition_plus":
            case "superposition_minus":
                return <RefreshCw className="w-6 h-6 animate-spin" />;
            default:
                return null;
        }
    };

    const getFloorHint = () => {
        return floorPatterns[currentFloor].description;
    };

    const getQuantumStateLabel = (state: string) => {
        switch (state) {
            case "up":
                return "|0⟩";
            case "down":
                return "|1⟩";
            case "superposition_plus":
                return "(|0⟩ + |1⟩)/√2";
            case "superposition_minus":
                return "(|0⟩ - |1⟩)/√2";
            default:
                return "";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Room Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🗼</div>
                    <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        SUPERPOSITION TOWER
                    </h1>
                    <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                        Master quantum superposition and interference to escape the
                        tower. Create stable quantum bridges by applying Hadamard
                        transformations and performing measurements (causing collapses) to step only on superposition states that
                        exhibit constructive interference (phases are the same).
                    </p>
                </div>

                {/* Tutorial Modal */}
                {showTutorial && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900/95 rounded-2xl border border-green-500 max-w-3xl w-full p-8">
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-4">🎓</div>
                                <h2 className="text-2xl font-bold text-green-400 mb-4">
                                    Quantum Superposition Tutorial
                                </h2>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-green-900/30 border border-green-500 rounded-xl p-4">
                                    <h3 className="font-semibold text-green-300 mb-2">
                                        🔬 The Science
                                    </h3>
                                    <p className="text-green-200 text-sm">
                                        Quantum superposition allows particles to exist in multiple
                                        states simultaneously. The Hadamard gate creates
                                        superposition: H|0⟩ = (|0⟩ + |1⟩)/√2. When superposition
                                        states interfere constructively, they create stable quantum
                                        bridges. Destructive interference causes decoherence and
                                        collapse.
                                    </p>
                                </div>

                                <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
                                    <h3 className="font-semibold text-purple-300 mb-2">
                                        🎮 Step-by-Step Process
                                    </h3>
                                    <ol className="text-purple-200 text-sm space-y-1 list-decimal list-inside">
                                        <li>
                                            Apply Hadamard gates (H) to transform classical states
                                            into superposition
                                        </li>
                                        <li>
                                            Step only on superposition pads - they glow when part of
                                            the correct pattern
                                        </li>
                                        <li>
                                            Follow the exact sequence to maintain quantum coherence
                                        </li>
                                        <li>
                                            Watch for constructive interference - wrong steps cause
                                            decoherence
                                        </li>
                                        <li>Complete the pattern to advance to the next floor</li>
                                    </ol>
                                </div>

                                <div className="bg-blue-900 border border-blue-700 rounded-xl p-4">
                                    <h3 className="font-semibold text-blue-600 mb-2">
                                        ⚠️ Decoherence Warning
                                    </h3>
                                    <p className="text-blue-600 text-sm">
                                        Wrong steps trigger decoherence - the quantum state becomes
                                        unstable and you have 10 seconds before complete collapse.
                                        Environmental factors and measurement errors destroy
                                        superposition!
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={startGame}
                                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500
                         hover:from-green-400 hover:to-emerald-400 rounded-xl font-semibold text-lg
                         transition-all duration-300 transform hover:scale-105"
                            >
                                Begin Quantum Escape!
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Quantum Control Panel */}
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center">
                            <Zap className="w-6 h-6 mr-3 text-yellow-400" />
                            Quantum Control Panel
                        </h2>

                        {/* Current Objective */}
                        <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
                            <h3 className="font-semibold text-green-300 mb-2 flex items-center">
                                <Target className="w-4 h-4 mr-2" />
                                Floor {currentFloor + 1} Objective
                            </h3>
                            <p className="text-green-200 text-sm mb-2">{getFloorHint()}</p>
                            <div className="text-xs text-green-400">
                                Required sequence:{" "}
                                {floorPatterns[currentFloor].required
                                    .map((p) => `Pad ${p + 1}`)
                                    .join(" → ")}
                            </div>
                        </div>

                        {/* Quantum State Information */}
                        <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500 rounded-xl">
                            <h3 className="font-semibold text-purple-300 mb-2">
                                Quantum State Analysis
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Superposition pads:</span>
                                    <span className="text-purple-400">
                                        {
                                            quantumPads.filter((p) => p.state.startsWith("superposition"))
                                                .length
                                        }
                                        /5
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
                                        {interferencePattern === "none"
                                            ? "None"
                                            : interferencePattern}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total attempts:</span>
                                    <span className="text-gray-400">{attempts}</span>
                                </div>
                            </div>
                        </div>

                        {/* Hint System */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold flex items-center">
                                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
                                    Quantum Hints
                                </h3>
                                <button
                                    onClick={() => setShowHints(!showHints)}
                                    className={`p-2 rounded-lg transition-colors duration-200 ${showHints
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
                                        💡 Glowing pads show where superposition is needed.<br />
                                        💡 Stepping onto a pad whose phase is different than the one you're on causes interaction with the environment!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={resetPath}
                            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl
                       font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Reset to Solvable State</span>
                        </button>
                    </div>

                    {/* Tower Visualization */}
                    <div className="lg:col-span-2 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold">
                                Quantum Bridge Platform
                            </h2>
                            <div className="text-sm text-gray-400">
                                Progress: {stepHistory.length}/
                                {floorPatterns[currentFloor].required.length} pads
                            </div>
                        </div>

                        {/* Error/Success Messages */}
                        {lastError && (
                            <div
                                className={`mb-6 p-4 rounded-xl border ${lastError.includes("❌") || lastError.includes("⚠️")
                                        ? "bg-red-900/30 border-red-500"
                                        : lastError.includes("✅") || lastError.includes("🎉")
                                            ? "bg-green-900/30 border-green-500"
                                            : lastError.includes("✨")
                                                ? "bg-purple-900/30 border-purple-500"
                                                : "bg-blue-900/30 border-blue-500"
                                    }`}
                            >
                                <p
                                    className={`text-sm font-medium ${lastError.includes("❌") || lastError.includes("⚠️")
                                            ? "text-red-300"
                                            : lastError.includes("✅") || lastError.includes("🎉")
                                                ? "text-green-300"
                                                : lastError.includes("✨")
                                                    ? "text-purple-300"
                                                    : "text-blue-300"
                                        }`}
                                >
                                    {lastError}
                                </p>
                            </div>
                        )}

                        {/* Quantum Pads Grid */}
                        <div className="relative mb-8">
                            <div className="grid grid-cols-5 gap-4 mb-8">
                                {quantumPads.map((pad) => (
                                    <div key={pad.id} className="relative bg-transparent">
                                        {/* Quantum Pad */}
                                        <button
                                            onClick={() => stepOnPad(pad.id)}
                                            disabled={
                                                pad.locked ||
                                                (!pad.state.startsWith("superposition")) ||
                                                quantumStateCollapsed
                                            }
                                            className={
                                                (pad.glowing && showHints)
                                                    ? `w-full h-full rounded-xl flex flex-col items-center justify-center relative overflow-hidden hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg`
                                                    : `w-full h-full rounded-xl flex flex-col items-center justify-center relative overflow-hidden hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed bg-gradient-to-br ${getPadColor(pad)}`
                                            }
                                        >
                                            {getPadIcon(pad.state)}
                                            <div
                                                className="text-xs font-mono mt-1"
                                                style={{
                                                    color: (pad.glowing && showHints)
                                                            ? "#232946"
                                                            : "inherit",
                                                }}
                                            >
                                                {getQuantumStateLabel(pad.state)}
                                            </div>
                                            {pad.state.startsWith("superposition") &&
                                                !pad.locked &&
                                                !quantumStateCollapsed &&
                                                !(
                                                    playerPosition === pad.id ||
                                                    (pad.glowing && showHints)
                                                ) && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                                )}
                                            {pad.locked && (
                                                <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                                                    ✓
                                                </div>
                                            )}
                                            {quantumStateCollapsed && (
                                                <div className="absolute inset-0 bg-red-500/50 animate-pulse flex items-center justify-center">
                                                    <span className="text-white font-bold text-xs">
                                                        COLLAPSED
                                                    </span>
                                                </div>
                                            )}
                                        </button>

                                        {/* Hadamard Gate Button */}
                                        <button
                                            onClick={() => applyHadamardGate(pad.id)}
                                            disabled={pad.locked || quantumStateCollapsed}
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 hover:bg-purple-400
                               disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-sm
                               flex items-center justify-center transition-all duration-200 font-bold
                               border-2 border-white shadow-lg"
                                            title={`Apply Hadamard Gate to Pad ${pad.id + 1}`}
                                        >
                                            H
                                        </button>

                                        {/* Pad Label */}
                                        <div className="text-center mt-2 text-sm text-gray-400">
                                            Pad {pad.id + 1}
                                        </div>

                                        {/* Phase Indicator */}
                                        {pad.state.startsWith("superposition") && (
                                            <div className="text-center mt-1 text-xs text-purple-400">
                                                φ = {(pad.phase / Math.PI).toFixed(1)}π
                                            </div>
                                        )}
                                        
                                        {/* Player Avatar*/}
                                        {playerPosition === pad.id && (
                                            <div className="absolute left-1/2 -translate-x-1/2 mt-2">
                                                <div
                                                    className={`w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400
                                                    rounded-full flex items-center justify-center text-xl transition-all duration-300
                                                    ${quantumStateCollapsed ? "animate-bounce" : "animate-pulse"}`}
                                                >
                                                    🧑‍🚀
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 text-center">
                                                    You
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Path Progress Display */}
                            {stepHistory.length > 0 && (
                                <div className="mt-[120px] p-4 bg-green-900/30 border border-green-500 rounded-xl">
                                    <h3 className="font-semibold mb-2 text-green-300 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Quantum Bridge Progress:
                                    </h3>
                                    <div className="flex items-center space-x-2 flex-wrap mb-2">
                                        {stepHistory.map((padId, index) => (
                                            <React.Fragment key={padId}>
                                                <div className="px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
                                                    Pad {padId + 1}
                                                </div>
                                                {index < stepHistory.length - 1 && (
                                                    <div className="text-green-400">→</div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        {stepHistory.length <
                                            floorPatterns[currentFloor].required.length && (
                                                <>
                                                    <div className="text-green-400">→</div>
                                                    <div className="px-3 py-1 bg-gray-600 rounded-full text-sm">
                                                        Pad{" "}
                                                        {floorPatterns[currentFloor].required[
                                                            stepHistory.length
                                                        ] + 1}
                                                    </div>
                                                </>
                                            )}
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <div className="text-green-400">
                                            ✓ Quantum Coherence: {stepHistory.length}/
                                            {floorPatterns[currentFloor].required.length}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Room Completion */}
                            {roomCompleted && (
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
                                    </div>
                                    <div className="mt-4 text-green-400 text-sm mb-4">
                                        🏆 Achievement Unlocked: Superposition Walker
                                    </div>
                                    <FeedbackButton
                                        roomId="superposition-tower"
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

export default SuperpositionTower;

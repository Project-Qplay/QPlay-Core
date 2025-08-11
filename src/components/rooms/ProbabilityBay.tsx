"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Lock, Unlock, Gauge, Atom } from "lucide-react"
import { useGame } from "../../contexts/GameContext" // Assuming this path is correct
import { motion, AnimatePresence } from "framer-motion"
import FeedbackButton from "../FeedbackButton" // Assuming this path is correct

const DICE_FACE_COUNT = 6
const ROLL_COUNT = 50
const ROLL_DELAY_MS = 40
const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
const LOCKER_NUMBERS = Array.from({ length: DICE_FACE_COUNT }, (_, i) => i + 1)

const ProbabilityBay: React.FC = () => {
  const { completeRoom, logQuantumMeasurement } = useGame()
  const [showTutorial, setShowTutorial] = useState(true)
  const [measurements, setMeasurements] = useState<number[]>([])
  const [classicalMeasurements, setClassicalMeasurements] = useState<number[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [isClassicalRolling, setIsClassicalRolling] = useState(false)
  const [selectedLocker, setSelectedLocker] = useState<number | null>(null)
  const [lockerCode, setLockerCode] = useState("")
  const [showHistogram, setShowHistogram] = useState(false)
  const [showComparison, setShowComparison] = useState(false) // This state might become redundant with gameStage
  const [decoySolved, setDecoySolved] = useState(false)
  const [roomCompleted, setRoomCompleted] = useState(false)
  const [roomStartTime] = useState(Date.now())
  const [attempts, setAttempts] = useState(0)
  const [activeTab, setActiveTab] = useState<"quantum" | "classical">("quantum")
  const [gameStage, setGameStage] = useState<
    "initial" | "quantum_measured" | "classical_measured" | "ready_to_solve" | "solved"
  >("initial")

  // Quantum dice with interference pattern
  const rollQuantumDice = () => {
    if (!(rollQuantumDice as any).weights) {
      // Create interference pattern weights
      const baseWeights = [0.8, 1.2, 0.6, 1.4, 0.9, 1.1] // Non-uniform probabilities
      const noise = Array.from({ length: DICE_FACE_COUNT }, () => Math.random() * 0.3)
      const rawWeights = baseWeights.map((w, i) => w + noise[i])
      const total = rawWeights.reduce((sum, w) => sum + w, 0)
      ;(rollQuantumDice as any).weights = rawWeights.map((w) => w / total)
    }
    const weights = (rollQuantumDice as any).weights
    const random = Math.random()
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i]
      if (random < sum) return i + 1
    }
    return DICE_FACE_COUNT
  }
  ;(rollQuantumDice as any).weights = null as number[] | null

  // Classical fair dice
  const rollClassicalDice = () => {
    return Math.floor(Math.random() * DICE_FACE_COUNT) + 1
  }

  const performMeasurements = async (type: "quantum" | "classical") => {
    if (type === "quantum") {
      setIsRolling(true)
      setMeasurements([])
      ;(rollQuantumDice as any).weights = null // Reset weights for new interference pattern
      const newMeasurements: number[] = []
      for (let i = 0; i < ROLL_COUNT; i++) {
        await new Promise((resolve) => setTimeout(resolve, ROLL_DELAY_MS))
        const result = rollQuantumDice()
        newMeasurements.push(result)
        setMeasurements([...newMeasurements])
      }
      setIsRolling(false)
      setShowHistogram(true)
      setGameStage("quantum_measured") // Update game stage
      await logQuantumMeasurement("probability-bay", "quantum_dice_measurements", {
        measurements: newMeasurements,
        measurement_count: newMeasurements.length,
        timestamp: new Date().toISOString(),
      })
    } else {
      setIsClassicalRolling(true)
      setClassicalMeasurements([])
      const newMeasurements: number[] = []
      for (let i = 0; i < ROLL_COUNT; i++) {
        await new Promise((resolve) => setTimeout(resolve, ROLL_DELAY_MS))
        const result = rollClassicalDice()
        newMeasurements.push(result)
        setClassicalMeasurements([...newMeasurements])
      }
      setIsClassicalRolling(false)
      setGameStage("classical_measured") // Update game stage
    }
  }

  const getDiceIcon = (value: number, isQuantum: boolean) => {
    const Icon = DICE_ICONS[value - 1]
    return (
      <motion.div
        className="relative"
        whileHover={{ scale: 1.1 }}
        animate={
          isQuantum
            ? {
                opacity: [0.8, 1, 0.8],
                transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
              }
            : {}
        }
      >
        <Icon
          className={`w-8 h-8 ${isQuantum ? "text-cyan-400 " + (isRolling ? "quantum-glow" : "") : "text-gray-400"}`}
        />
        {isQuantum && isRolling && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-400 opacity-70"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        )}
      </motion.div>
    )
  }

  const getHistogramData = (measurements: number[]) => {
    const counts = Array(DICE_FACE_COUNT).fill(0)
    measurements.forEach((m) => counts[m - 1]++)
    return counts
  }

  // Modified to be deterministic: returns the smallest number among the most frequent outcomes
  const getExpectedLockerCode = (histogram: number[]): string => {
    if (histogram.length === 0) return ""
    const max = Math.max(...histogram)
    const mostFrequentIndices = histogram.map((c, i) => (c === max ? i : -1)).filter((i) => i !== -1)

    // Return the smallest number among the most frequent outcomes
    const correctIndex = Math.min(...mostFrequentIndices)
    return (correctIndex + 1).toString()
  }

  const calculateScore = (attempts: number, time: number): number => {
    const BASE = 1000
    const ATTEMPT_PENALTY = 100
    const TIME_PENALTY = Math.floor(time / 1000)
    return Math.max(BASE - (attempts - 1) * ATTEMPT_PENALTY - TIME_PENALTY, 100)
  }

  const checkLockerCode = async () => {
    setAttempts((prev) => prev + 1)
    const histogramData = getHistogramData(measurements)
    const expectedCode = getExpectedLockerCode(histogramData)

    if (lockerCode === expectedCode) {
      setDecoySolved(true) // Indicates the code itself was correct
      if (selectedLocker === Number.parseInt(expectedCode)) {
        setRoomCompleted(true)
        setGameStage("solved") // Update game stage to solved
        const completionTime = Date.now() - roomStartTime
        const score = calculateScore(attempts, completionTime)
        await completeRoom("probability-bay", {
          time: completionTime,
          attempts: attempts,
          score: score,
        })
      } else {
        // Correct code, but wrong locker selected (decoy)
        setDecoySolved(true) // This state is already there for decoy
      }
    } else {
      // Incorrect code entered
      setDecoySolved(false) // Reset decoy if previous attempt was a decoy and this one is just wrong
    }
  }

  // Effect to transition gameStage based on measurements
  useEffect(() => {
    if (gameStage === "quantum_measured" && classicalMeasurements.length > 0) {
      setGameStage("ready_to_solve")
    } else if (gameStage === "classical_measured" && measurements.length > 0) {
      setGameStage("ready_to_solve")
    }
  }, [gameStage, measurements.length, classicalMeasurements.length]) // [^1]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-6">
      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-900/95 rounded-2xl border border-yellow-500 max-w-3xl w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎲</div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Probability Bay Tutorial</h2>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">🎲 Classical vs Quantum Systems</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Gauge className="w-5 h-5 mr-2 text-gray-300" />
                        <h4 className="font-semibold text-gray-300">Classical</h4>
                      </div>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Fixed 1/6 probabilities</li>
                        <li>• Independent outcomes</li>
                        <li>• No interference</li>
                        <li>• Deterministic</li>
                      </ul>
                    </div>
                    <div className="bg-cyan-900/30 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Atom className="w-5 h-5 mr-2 text-cyan-300" />
                        <h4 className="font-semibold text-cyan-300">Quantum</h4>
                      </div>
                      <ul className="text-cyan-300 text-sm space-y-1">
                        <li>• Variable probabilities (interference)</li>
                        <li>• Interference patterns emerge over many measurements</li>
                        <li>• Measurement affects system (collapses superposition)</li>
                        <li>• Probabilistic outcomes</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">🎮 How to Solve</h3>
                  <ol className="text-purple-200 text-sm list-decimal list-inside space-y-1">
                    <li>
                      First, measure the **Quantum Dice** multiple times to observe its unique probability distribution.
                    </li>
                    <li>Then, measure the **Classical Dice** to see a standard, uniform distribution.</li>
                    <li>
                      Compare the two histograms. Notice the "interference pattern" in the quantum results – some
                      outcomes are significantly more frequent.
                    </li>
                    <li>Identify the **single most probable outcome** from your **Quantum Measurements**.</li>
                    <li>Select the locker corresponding to this most probable outcome.</li>
                    <li>Enter the number of that most probable outcome into the code input field.</li>
                    <li>Attempt to unlock!</li>
                  </ol>
                </div>
                <div className="bg-red-900/30 border border-red-500 rounded-xl p-4">
                  <h3 className="font-semibold text-red-300 mb-2">⚠️ Quantum Challenge</h3>
                  <p className="text-red-200 text-sm">
                    Only the locker matching the true quantum interference pattern will work. Decoys represent incorrect
                    measurement bases.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Begin Quantum Experiment
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Floating Help Button */}
      {!showTutorial && (
        <button
          onClick={() => setShowTutorial(true)}
          className="fixed bottom-6 right-6 z-40 bg-yellow-600 hover:bg-yellow-500 text-white p-3 rounded-full shadow-xl text-xl"
        >
          ?
        </button>
      )}
      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎲</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            PROBABILITY BAY
          </h1>
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-blue-700 shadow-lg">
            <p className="text-base text-blue-200 font-semibold mb-2">
              <span className="font-orbitron text-lg text-pink-300">Quantum Lab:</span> Compare classical probability
              with quantum measurement effects
            </p>
            <p className="text-base text-blue-100">
              Observe how quantum systems exhibit interference patterns unlike classical randomness.
            </p>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dice Simulator */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <div className="flex border-b border-gray-700 mb-6">
              <button
                className={`flex-1 py-2 font-semibold ${activeTab === "quantum" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400"}`}
                onClick={() => setActiveTab("quantum")}
              >
                <div className="flex items-center justify-center">
                  <Atom className="w-5 h-5 mr-2" />
                  Quantum Dice
                </div>
              </button>
              <button
                className={`flex-1 py-2 font-semibold ${activeTab === "classical" ? "text-gray-300 border-b-2 border-gray-300" : "text-gray-500"}`}
                onClick={() => setActiveTab("classical")}
              >
                <div className="flex items-center justify-center">
                  <Gauge className="w-5 h-5 mr-2" />
                  Classical Dice
                </div>
              </button>
            </div>
            {activeTab === "quantum" ? (
              <>
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Atom className="w-6 h-6 mr-3 text-cyan-400" />
                  Quantum Measurement Simulator
                </h2>
                <div className="text-center mb-6">
                  <button
                    onClick={() => performMeasurements("quantum")}
                    disabled={isRolling || roomCompleted}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isRolling ? "Collapsing Wavefunction..." : "Measure Quantum Dice (n=50)"}
                  </button>
                  {measurements.length > 0 && (
                    <button
                      onClick={() => {
                        setMeasurements([])
                        setShowHistogram(false)
                        setGameStage("initial")
                        setDecoySolved(false) // Reset decoy state on reset
                      }}
                      className="mt-4 ml-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300"
                    >
                      Reset Measurements
                    </button>
                  )}
                </div>
                {measurements.length > 0 && (
                  <div className="mb-6">
                    <p className="text-gray-300 mb-4">Quantum Measurements: {measurements.length}/50</p>
                    <div className="flex flex-wrap gap-2">
                      {measurements.slice(-10).map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center bg-gray-700/50 rounded-lg transition-transform duration-200"
                          style={{
                            width: "48px",
                            height: "48px",
                            minWidth: "48px",
                            minHeight: "48px",
                          }}
                        >
                          {getDiceIcon(result, true)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {showHistogram && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Quantum Probability Distribution</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Notice the interference pattern - some outcomes are enhanced while others are suppressed
                    </p>
                    <div className="space-y-2">
                      {getHistogramData(measurements).map((count, index) => {
                        const percentage = (count / measurements.length) * 100
                        const classicalPercentage = (1 / DICE_FACE_COUNT) * 100
                        const difference = percentage - classicalPercentage
                        const isMostProbable =
                          measurements.length > 0 &&
                          (index + 1).toString() === getExpectedLockerCode(getHistogramData(measurements))

                        return (
                          <div key={index} className="flex items-center">
                            <div className="w-8 text-center">{index + 1}</div>
                            <div
                              className={`flex-1 bg-gray-700 rounded-full h-6 mx-3 relative overflow-hidden ${
                                isMostProbable ? "border-2 border-yellow-400" : ""
                              }`}
                            >
                              <div
                                className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-md ${
                                  isMostProbable ? "bg-yellow-500" : ""
                                }`}
                                style={{
                                  width: `${percentage}%`,
                                }}
                              ></div>
                              <div
                                className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${
                                  isMostProbable ? "text-yellow-200" : ""
                                }`}
                              >
                                {count} ({percentage.toFixed(1)}%)
                              </div>
                            </div>
                            <div
                              className={`w-16 text-xs text-right ${
                                difference > 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {difference > 0 ? "+" : ""}
                              {difference.toFixed(1)}%
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Gauge className="w-6 h-6 mr-3 text-gray-300" />
                  Classical Dice Simulator
                </h2>
                <div className="text-center mb-6">
                  <button
                    onClick={() => performMeasurements("classical")}
                    disabled={isClassicalRolling || roomCompleted}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-400 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isClassicalRolling ? "Rolling Classical Dice..." : "Roll Classical Dice (n=50)"}
                  </button>
                  {classicalMeasurements.length > 0 && (
                    <button
                      onClick={() => {
                        setClassicalMeasurements([])
                        setGameStage("initial")
                      }}
                      className="mt-4 ml-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300"
                    >
                      Reset Rolls
                    </button>
                  )}
                </div>
                {classicalMeasurements.length > 0 && (
                  <>
                    <div className="mb-6">
                      <p className="text-gray-300 mb-4">Classical Rolls: {classicalMeasurements.length}/50</p>
                      <div className="flex flex-wrap gap-2">
                        {classicalMeasurements.slice(-10).map((result, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-center bg-gray-700/50 rounded-lg transition-transform duration-200"
                            style={{
                              width: "48px",
                              height: "48px",
                              minWidth: "48px",
                              minHeight: "48px",
                            }}
                          >
                            {getDiceIcon(result, false)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Classical Probability Distribution</h3>
                      <p className="text-sm text-gray-400 mb-4">Expected uniform distribution (~16.67% per outcome)</p>
                      <div className="space-y-2">
                        {getHistogramData(classicalMeasurements).map((count, index) => {
                          const percentage = (count / classicalMeasurements.length) * 100
                          const expected = (1 / DICE_FACE_COUNT) * 100
                          const difference = percentage - expected
                          return (
                            <div key={index} className="flex items-center">
                              <div className="w-8 text-center">{index + 1}</div>
                              <div className="flex-1 bg-gray-700 rounded-full h-6 mx-3 relative overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r from-gray-500 to-gray-600 shadow-md`}
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                                  {count} ({percentage.toFixed(1)}%)
                                </div>
                              </div>
                              <div
                                className={`w-16 text-xs text-right ${
                                  Math.abs(difference) < 5
                                    ? "text-gray-400"
                                    : difference > 0
                                      ? "text-yellow-400"
                                      : "text-yellow-400"
                                }`}
                              >
                                {difference > 0 ? "+" : ""}
                                {difference.toFixed(1)}%
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          {/* Lockers */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-3 text-yellow-400" />
              Quantum Lockers
            </h2>
            <p className="text-gray-300 mb-6">
              The quantum lockers respond only to the true interference pattern. Use the quantum measurement results
              (not classical) to identify the correct eigenstate.
            </p>

            {/* Guidance Message */}
            {gameStage === "quantum_measured" && classicalMeasurements.length === 0 && (
              <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500 rounded-xl text-center">
                <p className="text-blue-200 font-semibold">
                  Now, switch to the "Classical Dice" tab and roll them to see the difference in probability
                  distribution!
                </p>
              </div>
            )}

            {gameStage === "ready_to_solve" && (
              <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500 rounded-xl text-center">
                <p className="text-yellow-200 font-semibold mb-2">
                  Great! You've observed both classical and quantum behaviors.
                </p>
                <p className="text-yellow-100 text-sm">
                  Compare the histograms. Which outcome is most probable in the{" "}
                  <span className="text-cyan-300">Quantum</span> system? Select that locker and enter its number as the
                  code.
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6">
              {LOCKER_NUMBERS.map((locker) => (
                <div
                  key={locker}
                  onClick={() => !roomCompleted && setSelectedLocker(locker)}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    selectedLocker === locker
                      ? "border-4 border-blue-400 bg-blue-100 shadow-xl ring-2 ring-blue-300 ring-offset-2 animate-pulse text-black"
                      : "border-gray-600 bg-gray-800/50 hover:bg-gray-700/50"
                  } ${roomCompleted ? "cursor-not-allowed" : ""}`}
                >
                  <div className="text-center">
                    {roomCompleted &&
                    locker === Number.parseInt(getExpectedLockerCode(getHistogramData(measurements))) ? (
                      <Unlock className="w-8 h-8 mx-auto text-green-400 animate-pulse" />
                    ) : (
                      <Lock className="w-8 h-8 mx-auto text-gray-400" />
                    )}
                    <p className="mt-2 text-sm">Eigenstate {locker}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <select
                value={lockerCode}
                onChange={(e) => setLockerCode(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-blue-400 focus:outline-none transition-colors duration-200 text-white"
                disabled={roomCompleted || measurements.length === 0}
              >
                <option value="" disabled>
                  Select measured quantum state...
                </option>
                {LOCKER_NUMBERS.map((code) => (
                  <option key={code} value={code}>
                    State {code}
                  </option>
                ))}
              </select>
              <button
                onClick={checkLockerCode}
                disabled={!selectedLocker || !lockerCode || roomCompleted || measurements.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300"
              >
                Attempt Quantum Unlock
              </button>
            </div>
            {decoySolved && !roomCompleted && (
              <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-xl">
                <p className="text-red-300 font-semibold">⚠️ Basis Mismatch!</p>
                <p className="text-red-200 text-sm mt-2">
                  You entered the correct eigenvalue, but the selected locker was not aligned with the true quantum
                  interference pattern. Ensure you select the locker corresponding to the **single most probable
                  outcome** from your quantum measurements.
                </p>
              </div>
            )}
            {roomCompleted && (
              <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
                <p className="text-green-300 font-semibold">🎉 Quantum System Stabilized!</p>
                <p className="text-green-200 text-sm mt-2 mb-4">
                  You've successfully identified the true quantum probability distribution!
                </p>
                <FeedbackButton roomId="probability-bay" className="w-full sm:w-auto" />
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .quantum-glow {
          filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.6));
        }
        .centered-bounce {
          animation: bounce 0.5s infinite alternate;
        }
        @keyframes bounce {
          from {
            transform: translateY(0) rotate(0deg);
          }
          to {
            transform: translateY(-5px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  )
}

export default ProbabilityBay

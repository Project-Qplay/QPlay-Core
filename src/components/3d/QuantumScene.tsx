import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import Spaceship from "./Spaceship";
import LoadingScreen from "./LoadingScreen";
import { QuantumUtils } from "../../utils/three-compatibility"; // Import quantum utilities
// Import auth-related components and context for user sign-in/sign-out functionality
import { useAuth } from "../../contexts/AuthContext";
import { User, LogOut } from "lucide-react";
import AuthModal from "../auth/AuthModal";

// Floating platform component
const QuantumPlatform = ({
  position = [0, 0, 0],
  size = [10, 0.2, 10],
  color = "#7722DD",
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y +=
        Math.sin(state.clock.getElapsedTime() * 0.5) * 0.005;
    }
  });

  return (
    <mesh position={position as any} receiveShadow ref={ref}>
      <boxGeometry args={size as any} />
      <meshStandardMaterial
        color={color}
        metalness={0.6}
        roughness={0.2}
        emissive="#331166"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

// Interactive portal component
const QuantumPortal: React.FC<{
  position: [number, number, number];
  title: string;
  onClick: () => void;
  active?: boolean;
}> = ({ position, title, onClick, active = false }) => {
  const ref = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const hoverRef = useRef(false);

  useFrame((state) => {
    if (!ref.current) return;

    // Rotate the portal
    ref.current.rotation.y += 0.01;

    // Make it float
    ref.current.position.y +=
      Math.sin(state.clock.getElapsedTime() * 0.8) * 0.003;

    // Pulse if hovered or active
    const baseScale = active ? 1.1 : 1;
    const pulseAmount = active ? 0.08 : 0.05;
    const scale =
      hoverRef.current || active
        ? baseScale + Math.sin(state.clock.getElapsedTime() * 4) * pulseAmount
        : baseScale;
    ref.current.scale.set(scale, scale, scale);

    // Animate ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.005;
    }

    // Animate glow intensity
    if (glowRef.current) {
      glowRef.current.intensity = active
        ? 2 + Math.sin(state.clock.getElapsedTime() * 3) * 0.5
        : 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.3;
    }
  });

  return (
    <group
      position={position}
      ref={ref}
      onClick={onClick}
      onPointerOver={() => {
        hoverRef.current = true;
      }}
      onPointerOut={() => {
        hoverRef.current = false;
      }}
    >
      {/* Main portal ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1, 0.2, 16, 32]} />
        <meshStandardMaterial
          color={active ? "#22FFAA" : "#55AAFF"}
          emissive={active ? "#22FFAA" : "#3366FF"}
          emissiveIntensity={1.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Outer decorative ring */}
      <mesh rotation={[Math.PI / 4, 0, Math.PI / 3]}>
        <torusGeometry args={[1.3, 0.05, 8, 32]} />
        <meshStandardMaterial
          color={active ? "#22FFAA" : "#55AAFF"}
          emissive={active ? "#22FFAA" : "#3366FF"}
          emissiveIntensity={0.8}
          transparent={true}
          opacity={0.7}
        />
      </mesh>

      {/* Inner decorative ring */}
      <mesh rotation={[Math.PI / 3, 0, Math.PI / 5]}>
        <torusGeometry args={[0.7, 0.03, 8, 24]} />
        <meshStandardMaterial
          color={active ? "#FFFFFF" : "#AADDFF"}
          emissive={active ? "#FFFFFF" : "#AADDFF"}
          emissiveIntensity={1}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* Portal center */}
      <mesh>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial
          color={active ? "#22FFAA" : "#55AAFF"}
          transparent={true}
          opacity={0.2}
        />
      </mesh>

      {/* Portal label */}
      <Html position={[0, 1.8, 0]} center>
        <div
          className="text-white font-orbitron text-xl bg-black bg-opacity-50 px-4 py-2 rounded-lg html-text"
          style={{
            whiteSpace: "nowrap",
            boxShadow: active ? "0 0 10px #22FFAA" : "0 0 8px #55AAFF",
          }}
        >
          {title}
        </div>
      </Html>

      {/* Inner glow effect */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 0]}
        color={active ? "#22FFAA" : "#55AAFF"}
        intensity={2}
        distance={5}
      />

      {/* Outer ambient glow */}
      <pointLight
        position={[0, 0, 0]}
        color={active ? "#22FFAA" : "#55AAFF"}
        intensity={0.5}
        distance={10}
      />
    </group>
  );
};

// Quantum particle effect - simplified version
const QuantumParticles = ({ count = 50, opacity = 1 }) => {
  const particles = useRef<THREE.Points>(null);

  // Create a simple array for star positions
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Position stars in a sphere around the scene
      const radius = 20 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  // Very simple animation
  useFrame(() => {
    if (particles.current) {
      particles.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#55AAFF"
        transparent
        opacity={0.7}
        sizeAttenuation={true}
      />
    </points>
  );
};

// Main scene component
interface QuantumSceneProps {
  onNavigate: (destination: string) => void;
}

interface AuthOverlayProps {
  onOpenAuthModal: (mode: "signin" | "signup") => void;
}

// Define the ref interface for external function access
export interface QuantumDashboardRef {
  // Method to mark a room as completed and update user progress
  completeRoom: (roomId: string) => void;
  // Method to directly update progress data (for loading saved games)
  updateProgress: (data: {
    completedRooms?: string[];
    currentQuest?: string;
  }) => void;
}

// Simplified camera component that follows the spaceship
const SpaceshipCamera: React.FC<{
  position: THREE.Vector3;
  rotation: THREE.Euler;
}> = ({ position, rotation }) => {
  const { camera } = useThree();

  // Set fixed camera position and offset
  useFrame(() => {
    // Better camera positioning for the new spaceship orientation
    // Camera is now positioned higher up and behind the ship
    camera.position.set(position.x, position.y + 4, position.z + 10);
    camera.lookAt(position.x, position.y, position.z - 8); // Look ahead of the ship
  });

  return null;
};

// Simplified auth overlay component for QuantumScene
const AuthOverlay: React.FC<AuthOverlayProps> = ({ onOpenAuthModal }) => {
  // Get user data and sign out function from auth context
  const { user, signOut } = useAuth();

  return (
    <div className="absolute top-4 right-24 z-[999]">
      {user ? (
        <div className="flex items-center space-x-2 bg-black bg-opacity-50 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-700">
          <span className="text-white font-medium">{user.username}</span>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          className="bg-black bg-opacity-50 backdrop-blur-sm p-3 rounded-full border border-purple-700 hover:bg-purple-900 hover:bg-opacity-50 transition-colors"
          onClick={() => onOpenAuthModal("signin")}
          title="Sign In"
        >
          <User className="w-6 h-6 text-purple-400" />
        </button>
      )}
    </div>
  );
};

export const QuantumDashboard = React.forwardRef<
  QuantumDashboardRef,
  QuantumSceneProps
>(({ onNavigate }, ref) => {
  const [sceneLoading, setSceneLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState<
    "init" | "resources" | "complete"
  >("init");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode] = useState<"signin" | "signup">("signin");
  // Get user data, profile update function, and loading state from AuthContext
  const { user, updateProfile, loading } = useAuth();
  const [spaceshipPosition, setSpaceshipPosition] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 3, 12), // Start position with good view of all portals
  );
  const [spaceshipRotation, setSpaceshipRotation] = useState<THREE.Euler>(
    new THREE.Euler(0, 0, 0),
  );
  const [spaceshipVelocity, setSpaceshipVelocity] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [activePortal, setActivePortal] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState<boolean>(false);
  // Initialize with empty array, will update when user loads
  const [completedRooms, setCompletedRooms] = useState<string[]>([]);
  const [currentQuest, setCurrentQuest] = useState<string>("room1");

  // Controls state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Enhanced loading sequence with phases
  useEffect(() => {
    // Start at 0 - Initialization phase
    setLoadingProgress(0);
    setLoadingPhase("init");

    // Progress to 40% - Initial setup
    const timer1 = setTimeout(() => {
      setLoadingProgress(40);
    }, 500);

    // Progress to 70% - Loading resources phase
    const timer2 = setTimeout(() => {
      setLoadingProgress(70);
      setLoadingPhase("resources");
    }, 1000);

    // Complete loading - Final phase
    const timer3 = setTimeout(() => {
      setLoadingProgress(100);
      setLoadingPhase("complete");
      setTimeout(() => setSceneLoading(false), 500);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Keyboard controls - disabled when auth modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable keyboard controls when auth modal is open
      if (showAuthModal) return;

      if (e.code === "KeyW") keys.current.forward = true;
      if (e.code === "KeyS") keys.current.backward = true;
      if (e.code === "KeyA") keys.current.left = true;
      if (e.code === "KeyD") keys.current.right = true;
      if (e.code === "Space") keys.current.up = true;
      if (e.code === "ShiftLeft") keys.current.down = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.current.forward = false;
      if (e.code === "KeyS") keys.current.backward = false;
      if (e.code === "KeyA") keys.current.left = false;
      if (e.code === "KeyD") keys.current.right = false;
      if (e.code === "Space") keys.current.up = false;
      if (e.code === "ShiftLeft") keys.current.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showAuthModal]);

  // Update completed rooms and current quest when user changes (login/logout)
  // This loads the user's saved progress when they sign in and resets on sign out
  useEffect(() => {
    if (user && user.preferences) {
      // Load user's saved progress from their profile
      setCompletedRooms(user.preferences.completedRooms || []);
      setCurrentQuest(user.preferences.currentQuest || "room1");
    } else {
      // Keep current progress when not logged in (don't reset)
      // Local progress is maintained until the page refreshes
    }
  }, [user]);

  // Update spaceship velocity based on keys
  useEffect(() => {
    const updateVelocity = () => {
      // Don't update velocity when modal is open
      if (showAuthModal) {
        setSpaceshipVelocity({ x: 0, y: 0, z: 0 });
        return;
      }

      const speed = 5;

      // Calculate velocity based on key presses
      let newVelocity = { x: 0, y: 0, z: 0 };

      if (keys.current.forward) newVelocity.z = -speed;
      if (keys.current.backward) newVelocity.z = speed;
      if (keys.current.left) newVelocity.x = -speed;
      if (keys.current.right) newVelocity.x = speed;
      if (keys.current.up) newVelocity.y = speed;
      if (keys.current.down) newVelocity.y = -speed;

      // Apply deceleration when no keys pressed in a direction
      setSpaceshipVelocity(newVelocity);
    };

    const interval = setInterval(updateVelocity, 16); // ~60fps
    return () => clearInterval(interval);
  }, [showAuthModal]);

  // Portal interaction check with hover timer
  useEffect(() => {
    if (!spaceshipPosition) return;

    // Define all portals in the main hub
    const portalPositions: Array<{
      id: string;
      position: THREE.Vector3;
      available: boolean; // Whether this portal should be visible
    }> = [
      { id: "play", position: new THREE.Vector3(0, 2, -5), available: true }, // Center front - always available
      {
        id: "leaderboard",
        position: new THREE.Vector3(-24, 2, -2),
        available: true,
      }, // Left
      { id: "guide", position: new THREE.Vector3(-12, 2, -4), available: true }, // Left-center
      {
        id: "settings",
        position: new THREE.Vector3(12, 2, -4),
        available: true,
      }, // Right-center
      {
        id: "achievements",
        position: new THREE.Vector3(24, 2, -2),
        available: true,
      }, // Right

      // Room completion portals - initially not visible until completed
      {
        id: "room1",
        position: new THREE.Vector3(-28, 2, 0),
        available: completedRooms.includes("room1"),
      },
      {
        id: "room2",
        position: new THREE.Vector3(-14, 2, 2),
        available: completedRooms.includes("room2"),
      },
      {
        id: "room3",
        position: new THREE.Vector3(0, 2, 3),
        available: completedRooms.includes("room3"),
      },
      {
        id: "room4",
        position: new THREE.Vector3(14, 2, 2),
        available: completedRooms.includes("room4"),
      },
      {
        id: "room5",
        position: new THREE.Vector3(28, 2, 0),
        available: completedRooms.includes("room5"),
      },
    ];

    // Filter to only available portals
    const availablePortals = portalPositions.filter(
      (portal) => portal.available,
    );

    // Find closest portal
    let closestPortalId: string | null = null;
    let closestDistance = 5; // Increased minimum distance for widely spaced portals

    availablePortals.forEach((portal) => {
      const distance = portal.position.distanceTo(spaceshipPosition);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPortalId = portal.id;
      }
    });

    setActivePortal(closestPortalId);

    // Track stationary time near portal
    let stationaryTimer: NodeJS.Timeout | null = null;
    let portalActivationInProgress = false;

    const activePortalDetails = availablePortals.find(
      (portal) => portal.id === closestPortalId,
    );

    // If very close to a portal and nearly stationary, start timer
    if (
      closestPortalId &&
      closestDistance < 4 &&
      Math.abs(spaceshipVelocity.x) < 0.2 &&
      Math.abs(spaceshipVelocity.y) < 0.2 &&
      Math.abs(spaceshipVelocity.z) < 0.2 &&
      !transitioning
    ) {
      stationaryTimer = setTimeout(() => {
        if (!portalActivationInProgress) {
          portalActivationInProgress = true;

          if (closestPortalId) {
            if (closestPortalId === "play") {
              // Start the current quest
              if (onNavigate) onNavigate(currentQuest);
            } else if (closestPortalId.startsWith("room")) {
              // Navigate to a completed room
              if (onNavigate) onNavigate(closestPortalId);
            } else {
              // Regular navigation portals
              if (onNavigate) onNavigate(closestPortalId);
            }
          }
        }
      }, 1000); // Wait 1 second while stationary to trigger
    }

    // Also handle Enter key for immediate activation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Enter" &&
        closestPortalId &&
        closestDistance < 5 &&
        !transitioning
      ) {
        if (!portalActivationInProgress) {
          portalActivationInProgress = true;

          if (closestPortalId) {
            if (closestPortalId === "play") {
              // Start the current quest
              if (onNavigate) onNavigate(currentQuest);
            } else if (closestPortalId.startsWith("room")) {
              // Navigate to a completed room
              if (onNavigate) onNavigate(closestPortalId);
            } else {
              // Regular navigation portals
              if (onNavigate) onNavigate(closestPortalId);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (stationaryTimer) clearTimeout(stationaryTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    spaceshipPosition,
    spaceshipVelocity,
    onNavigate,
    transitioning,
    completedRooms,
    currentQuest,
  ]);

  // Expose completeRoom and updateProgress functions via ref
  React.useImperativeHandle(ref, () => ({
    completeRoom: (roomId: string) => {
      if (!completedRooms.includes(roomId)) {
        const updatedRooms = [...completedRooms, roomId];
        setCompletedRooms(updatedRooms);

        // Set the next room as the current quest
        const roomNumber = parseInt(roomId.replace("room", ""));
        let nextQuest = "complete";
        if (roomNumber < 5) {
          nextQuest = `room${roomNumber + 1}`;
        }
        setCurrentQuest(nextQuest);

        // Save progress to user profile if logged in
        if (user) {
          // Update the user profile with the new completed rooms and current quest
          // This persists the data to the backend through the AuthContext
          updateProfile({
            preferences: {
              ...user.preferences,
              completedRooms: updatedRooms,
              currentQuest: nextQuest,
            },
          }).catch((err) => console.error("Failed to save progress:", err));
        }
        // Progress is tracked locally for non-logged-in users, but not persisted
      }
    },
    // Method to update progress data without showing any modals
    updateProgress: (data: {
      completedRooms?: string[];
      currentQuest?: string;
    }) => {
      if (data.completedRooms) setCompletedRooms(data.completedRooms);
      if (data.currentQuest) setCurrentQuest(data.currentQuest);

      // Save to user profile if logged in
      if (user) {
        updateProfile({
          preferences: {
            ...user.preferences,
            ...data,
          },
        }).catch((err) => console.error("Failed to update progress:", err));
      }
    },
  }));

  // Reset spaceship position if needed
  const resetSpaceshipPosition = () => {
    setTransitioning(true);

    // Reset to initial position
    setTimeout(() => {
      setSpaceshipPosition(new THREE.Vector3(0, 3, 12));
      setSpaceshipVelocity({ x: 0, y: 0, z: 0 });
      setTimeout(() => setTransitioning(false), 500);
    }, 500);
  };

  // Handle spaceship movement
  const handleSpaceshipMove = (
    position: THREE.Vector3,
    rotation: THREE.Euler,
  ) => {
    setSpaceshipPosition(position);
    setSpaceshipRotation(rotation);
  };

  if (sceneLoading) {
    const loadingMessage =
      loadingPhase === "init"
        ? "Initializing quantum systems..."
        : loadingPhase === "resources"
          ? "Loading quantum assets and calibrating controls..."
          : "Preparing quantum dashboard for interaction...";

    return (
      <LoadingScreen progress={loadingProgress} message={loadingMessage} />
    );
  }

  // Simple transition effect
  if (transitioning) {
    return (
      <div className="h-screen w-full bg-black">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-10 border-4 border-t-transparent border-purple-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <Canvas
        shadows
        style={{
          opacity: showAuthModal ? 0 : 1,
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        {/* No PerspectiveCamera, just use default camera */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.0} />
        <fog attach="fog" args={["#000", 25, 70]} />
        <hemisphereLight args={["#1a237e", "#311b92", 0.3]} />
        {/* Fixed camera position with simple following */}
        <SpaceshipCamera
          position={spaceshipPosition}
          rotation={spaceshipRotation}
        />
        {/* Enhanced star field for immersion */}
        <Stars
          radius={120}
          depth={60}
          count={8000}
          factor={4}
          saturation={0.1}
          fade
          speed={1}
        />
        {/* Space environment without a main platform */}
        {/* Space environment without background sphere */}
        {/* Main navigation portals */}
        <QuantumPortal
          position={[0, 2, -5]}
          title={
            currentQuest === "complete"
              ? "All Rooms Completed!"
              : completedRooms.length === 0
                ? "Start First Quest"
                : `Play ${currentQuest.replace("room", "Room ")}`
          }
          onClick={() =>
            currentQuest !== "complete" && onNavigate?.(currentQuest)
          }
          active={activePortal === "play"}
        />
        <QuantumPortal
          position={[-24, 2, -2]}
          title="Leaderboard"
          onClick={() => onNavigate?.("leaderboard")}
          active={activePortal === "leaderboard"}
        />
        <QuantumPortal
          position={[-12, 2, -4]}
          title="Quantum Guide"
          onClick={() => onNavigate?.("guide")}
          active={activePortal === "guide"}
        />
        <QuantumPortal
          position={[12, 2, -4]}
          title="Settings"
          onClick={() => onNavigate?.("settings")}
          active={activePortal === "settings"}
        />
        <QuantumPortal
          position={[24, 2, -2]}
          title="Achievements"
          onClick={() => onNavigate?.("achievements")}
          active={activePortal === "achievements"}
        />

        {/* Completed room portals */}
        {completedRooms.includes("room1") && (
          <QuantumPortal
            position={[-28, 2, 0]}
            title="Room 1"
            onClick={() => onNavigate?.("room1")}
            active={activePortal === "room1"}
          />
        )}
        {completedRooms.includes("room2") && (
          <QuantumPortal
            position={[-14, 2, 2]}
            title="Room 2"
            onClick={() => onNavigate?.("room2")}
            active={activePortal === "room2"}
          />
        )}
        {completedRooms.includes("room3") && (
          <QuantumPortal
            position={[0, 2, 3]}
            title="Room 3"
            onClick={() => onNavigate?.("room3")}
            active={activePortal === "room3"}
          />
        )}
        {completedRooms.includes("room4") && (
          <QuantumPortal
            position={[14, 2, 2]}
            title="Room 4"
            onClick={() => onNavigate?.("room4")}
            active={activePortal === "room4"}
          />
        )}
        {completedRooms.includes("room5") && (
          <QuantumPortal
            position={[28, 2, 0]}
            title="Room 5"
            onClick={() => onNavigate?.("room5")}
            active={activePortal === "room5"}
          />
        )}
        {/* Spaceship */}
        <Spaceship
          position={[
            spaceshipPosition.x,
            spaceshipPosition.y,
            spaceshipPosition.z,
          ]}
          rotation={[
            spaceshipRotation.x,
            spaceshipRotation.y,
            spaceshipRotation.z,
          ]}
          scale={0.5}
          velocity={spaceshipVelocity}
          onMove={handleSpaceshipMove}
        />
        {/* Minimal particle effects */}
        <QuantumParticles count={50} />

        {/* Enhanced ambient lighting */}
        <pointLight position={[0, 8, -5]} color="#55AAFF" intensity={1.5} />
        <pointLight position={[0, 5, 5]} color="#5588FF" intensity={1} />
      </Canvas>

      {/* Simple Auth UI Overlay - Just username or sign in button */}
      {/* Simple Auth UI Overlay */}
      <AuthOverlay
        onOpenAuthModal={() => {
          // Set modal state immediately
          setShowAuthModal(true);
          // Force any three.js HTML elements to be hidden
          document.querySelectorAll(".html-text").forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
        }}
      />

      {/* Auth Modal - Only shows when sign in button is clicked */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ isolation: "isolate" }}
        >
          <div
            className="absolute inset-0 bg-black"
            style={{ pointerEvents: "all" }}
            onClick={() => {
              setShowAuthModal(false);
              // Show HTML text elements when modal closes
              document.querySelectorAll(".html-text").forEach((el) => {
                (el as HTMLElement).style.display = "";
              });
            }}
          ></div>
          <div className="relative z-[10000]">
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => {
                setShowAuthModal(false);
                // Show HTML text elements when modal closes
                document.querySelectorAll(".html-text").forEach((el) => {
                  (el as HTMLElement).style.display = "";
                });
              }}
              initialMode="signin"
            />
          </div>
        </div>
      )}

      {/* Hub information - minimalist version */}
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm p-2 rounded-lg border border-purple-700 text-gray-300">
          <div>Quantum Hub</div>
          <div className="text-sm mt-1">
            {currentQuest === "complete"
              ? "All Rooms Complete!"
              : `Next Quest: ${currentQuest.replace("room", "Room ")}`}
          </div>
        </div>
      </div>

      {/* Minimalist Control instructions */}
      <div className="absolute bottom-4 left-4 z-50">
        <div className="text-white bg-black bg-opacity-50 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-700 text-xs">
          <div>WASD - Move | Space/Shift - Up/Down</div>
        </div>
      </div>
    </div>
  );
});

export default QuantumDashboard;

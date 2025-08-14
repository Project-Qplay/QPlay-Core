import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Html, GradientTexture } from "@react-three/drei";
import * as THREE from "three";
import CatModel from "./CatModel";
import LoadingScreen from "./LoadingScreen";
import { QuantumUtils } from "../../utils/three-compatibility.js"; // Import quantum utilities
// Import auth-related components and context for user sign-in/sign-out functionality
import { useAuth } from "../../contexts/AuthContext";
import { User, LogOut } from "lucide-react";
import AuthModal from "../auth/AuthModal";

// Floating platform component
const QuantumPlatform = ({
  position = [0, 0, 0],
  size = [10, 0.2, 10],
  color = "#7722DD",
  rotation = [0, 0, 0],
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y +=
        Math.sin(state.clock.getElapsedTime() * 0.5) * 0.005;
    }
  });

  // Only render if specifically requested - we're removing floors
  if (color === "VISIBLE_PLATFORM") {
    return (
      <mesh
        position={position as any}
        rotation={rotation as any}
        receiveShadow
        castShadow
        ref={ref}
      >
        <boxGeometry args={size as any} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.2}
          emissive="#331166"
          emissiveIntensity={0.2}
          transparent={true}
          opacity={0.7}
        />
      </mesh>
    );
  }
  return null;
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
      <mesh ref={ringRef} position={[0, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1.4, 0.18, 20, 36]} />
        <meshStandardMaterial
          color={active ? "#22FFAA" : "#55AAFF"}
          emissive={active ? "#22FFAA" : "#55AAFF"}
          emissiveIntensity={0.7}
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

      {/* Portal label - stationary, not rotating with portal */}
      <Html
        position={[0, active ? 2.8 : 2.5, 0]} // Raise active portals slightly
        center
        distanceFactor={12}
        transform={false} // Keep text stationary
        sprite={true} // Ensures text always faces camera
      >
        <div
          className="text-white font-orbitron bg-black bg-opacity-50 rounded-lg html-text"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: active ? "46px" : "42px",
            fontWeight: active ? "700" : "600",
            transform: active ? "scale(1.15)" : "scale(1)",
            transition: "all 0.3s ease",
            textShadow: active
              ? "0 0 18px #22FFAA, 0 0 12px #22FFAA, 0 0 20px #22FFAA"
              : "0 0 14px #55AAFF, 0 0 8px #55AAFF",
            backgroundColor: active ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.6)",
            border: active
              ? "3px solid #22FFAA"
              : "3px solid rgba(85, 170, 255, 0.7)",
            padding: "14px 22px",
            borderRadius: "14px",
            letterSpacing: "1px",
            whiteSpace: "nowrap",
            boxShadow: active
              ? "0 0 20px rgba(34, 255, 170, 0.5)"
              : "0 0 16px rgba(85, 170, 255, 0.4)",
          }}
        >
          {title}
        </div>
      </Html>

      {/* Inner glow effect */}
      {/* Enhanced glow effect for isometric view */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 0]}
        color={active ? "#22FFAA" : "#55AAFF"}
        intensity={2.5}
        distance={7}
      />

      {/* Outer ambient glow */}
      <pointLight
        position={[0, 0, 0]}
        color={active ? "#22FFAA" : "#55AAFF"}
        intensity={0.8}
        distance={12}
      />
    </group>
  );
};

// Quantum particle effect - simplified version
// Enhanced quantum particles for gradient background effect
const QuantumParticles = ({ count = 150, opacity = 1 }) => {
  const particles = useRef<THREE.Points>(null);
  const particlesNear = useRef<THREE.Points>(null);
  const particlesFar = useRef<THREE.Points>(null);

  // Create arrays for particle positions at different depths
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Position stars in a sphere around the scene
      const radius = 20 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  // Near particles (bottom layer)
  const positionsNear = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Position near the bottom, creating a floor-like effect
      pos[i3] = (Math.random() - 0.5) * 180; // X spread - wider
      pos[i3 + 1] = -3 - Math.random() * 5; // Y closer to surface for better visibility
      pos[i3 + 2] = (Math.random() - 0.5) * 180; // Z spread - wider
    }
    return pos;
  }, [count]);

  // Far particles (deeper layer)
  const positionsFar = useMemo(() => {
    const pos = new Float32Array(count * 3 * 3); // More particles for deeper layer
    for (let i = 0; i < count * 3; i++) {
      const i3 = i * 3;
      // Position deeper, creating depth
      pos[i3] = (Math.random() - 0.5) * 200; // X spread - much wider
      pos[i3 + 1] = -8 - Math.random() * 12; // Y at bottom - raised for better visibility
      pos[i3 + 2] = (Math.random() - 0.5) * 200; // Z spread - much wider
    }
    return pos;
  }, [count]);

  // Simple animation for particles
  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.y += 0.0005;
      particles.current.rotation.x += 0.0001;
    }
    if (particlesNear.current) {
      particlesNear.current.rotation.y += 0.0001;
    }
    if (particlesFar.current) {
      particlesFar.current.rotation.y += 0.00005;
    }
  });

  return (
    <>
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
          size={0.05}
          color="#AACCFF"
          sizeAttenuation
          transparent
          opacity={opacity}
        />
      </points>

      {/* Near particles - creates floor-like effect */}
      <points ref={particlesNear}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positionsNear}
            count={count}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          color="#9977FF"
          sizeAttenuation
          transparent
          opacity={0.95}
        />
      </points>

      {/* Far particles - deeper layer */}
      <points ref={particlesFar}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positionsFar}
            count={count * 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#5566DD"
          sizeAttenuation
          transparent
          opacity={0.85}
        />
      </points>
    </>
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

// Fixed isometric camera that maintains the same viewing angle regardless of cat position
const IsometricCamera: React.FC<{
  position: THREE.Vector3;
  rotation?: THREE.Euler;
}> = ({ position }) => {
  const { camera } = useThree();

  // Set fixed isometric camera position and orientation
  useFrame(() => {
    // Isometric view parameters - adjusted for gradient floor effect
    const distance = 40; // Distance from the center - increased for better floor view
    const height = 30; // Height above the scene - increased for better floor gradient view

    // Standard isometric angle is approximately 35.264 degrees (arctan(1/sqrt(2)))
    // We use this for both X and Z axes to get the isometric look
    const isoAngle = Math.PI / 4.5; // Slightly less than 45 degrees for better floor view

    // Calculate isometric camera position relative to the scene center
    // This maintains a fixed viewing angle while following the cat's position
    const offsetX = Math.sin(isoAngle) * distance;
    const offsetZ = Math.cos(isoAngle) * distance;

    // Set camera position - maintain fixed offset from cat
    camera.position.set(
      position.x + offsetX,
      position.y + height,
      position.z + offsetZ,
    );

    // Always look at the cat's position
    camera.lookAt(position.x, position.y, position.z);
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
  const [catPosition, setCatPosition] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 0.8, 0), // More elevated from "ground" level for better visibility on gradient floor
  );
  const [catRotation, setCatRotation] = useState<THREE.Euler>(
    new THREE.Euler(0, Math.PI, 0), // Initial rotation
  );
  const [catMovementKeys, setCatMovementKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
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
    enter: false,
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
      if (e.code === "Enter") keys.current.enter = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.current.forward = false;
      if (e.code === "KeyS") keys.current.backward = false;
      if (e.code === "KeyA") keys.current.left = false;
      if (e.code === "KeyD") keys.current.right = false;
      if (e.code === "Space") keys.current.up = false;
      if (e.code === "ShiftLeft") keys.current.down = false;
      if (e.code === "Enter") keys.current.enter = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showAuthModal]);

  // Handle Enter key for portal activation
  useEffect(() => {
    // Direct Enter key handler for portal navigation
    const handleEnterKey = (e: KeyboardEvent) => {
      if (
        e.code === "Enter" &&
        activePortal &&
        !transitioning &&
        !showAuthModal
      ) {
        // Prevent multiple activations
        e.preventDefault();

        // Handle portal navigation
        if (activePortal === "play") {
          // Start the current quest
          onNavigate?.(currentQuest);
        } else {
          // Regular navigation portals
          onNavigate?.(activePortal);
        }
      }
    };

    window.addEventListener("keydown", handleEnterKey);

    return () => {
      window.removeEventListener("keydown", handleEnterKey);
    };
  }, [activePortal, transitioning, onNavigate, currentQuest, showAuthModal]);

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

  // Update cat movement keys based on keyboard input
  useEffect(() => {
    const updateCatMovement = () => {
      // Don't update movement when modal is open or transitioning
      if (showAuthModal || transitioning) {
        setCatMovementKeys({
          forward: false,
          backward: false,
          left: false,
          right: false,
          up: false,
          down: false,
          enter: false,
        });
        return;
      }

      // Update movement keys state based on key presses
      setCatMovementKeys({
        forward: keys.current.forward,
        backward: keys.current.backward,
        left: keys.current.left,
        right: keys.current.right,
        up: false,
        down: false,
      });
    };

    const interval = setInterval(updateCatMovement, 16); // ~60fps

    // Track Enter key presses for portal interaction
    const handlePortalInteraction = () => {
      if (keys.current.enter && activePortal && !transitioning) {
        // Only navigate if Enter is pressed and we're near a portal
        onNavigate?.(activePortal);
      }
    };

    const portalInterval = setInterval(handlePortalInteraction, 100); // Check less frequently

    return () => {
      clearInterval(interval);
      clearInterval(portalInterval);
    };
  }, [showAuthModal]);

  // Portal interaction check with hover timer
  useEffect(() => {
    if (!catPosition) return;

    // Define all portals in the main hub - spread out for better isometric view
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
      const distance = portal.position.distanceTo(catPosition);
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
      !catMovementKeys.forward &&
      !catMovementKeys.backward &&
      !catMovementKeys.left &&
      !catMovementKeys.right &&
      !transitioning
    ) {
      stationaryTimer = setTimeout(() => {
        if (!portalActivationInProgress) {
          portalActivationInProgress = true;

          if (closestPortalId === "play") {
            // Start the current quest
            onNavigate?.(currentQuest);
          } else {
            // Regular navigation portals
            onNavigate?.(closestPortalId);
          }
        }
      }, 1000); // Wait 1 second while stationary to trigger
    }

    return () => {
      if (stationaryTimer) clearTimeout(stationaryTimer);
    };
  }, [
    catPosition,
    catMovementKeys,
    onNavigate,
    transitioning,
    completedRooms,
    currentQuest,
    activePortal,
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

  // Reset cat position if needed
  const resetCatPosition = () => {
    setTransitioning(true);

    // Reset to initial position - center of isometric view
    setTimeout(() => {
      setCatPosition(new THREE.Vector3(0, 0.8, 0));
      setCatRotation(new THREE.Euler(0, Math.PI, 0));
      setCatMovementKeys({
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false,
        enter: false,
      });
      setTimeout(() => setTransitioning(false), 500);
    }, 500);
  };

  // Handle cat movement
  const handleCatMove = (position: THREE.Vector3, rotation: THREE.Euler) => {
    setCatPosition(position);
    setCatRotation(rotation);

    // Keep the cat within reasonable boundaries of the scene
    // Expanded boundaries for isometric view
    const maxDistance = 60;
    if (
      Math.abs(position.x) > maxDistance ||
      Math.abs(position.z) > maxDistance
    ) {
      // If the cat goes too far, gently bring it back to the center
      resetCatPosition();
    }
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
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        style={{
          opacity: showAuthModal ? 0 : 1,
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        {/* Create background gradient scene */}
        <color attach="background" args={["#020212"]} />
        {/* Enhanced lighting for isometric view */}
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[15, 20, 15]}
          intensity={0.85}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <fog attach="fog" args={["#040418", 45, 130]} />
        <hemisphereLight args={["#3355AA", "#221166", 0.5]} />
        {/* Infinite grid floor - more visible */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
          <planeGeometry args={[600, 600, 120, 120]} />
          <meshBasicMaterial
            color="#7788FF"
            opacity={0.25}
            transparent
            wireframe
          />
        </mesh>
        {/* Gradient floor plane - primary */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.3, 0]}>
          <planeGeometry args={[500, 500]} />
          <meshBasicMaterial transparent opacity={0.4}>
            <GradientTexture
              attach="map"
              stops={[0, 0.1, 0.3, 0.7]}
              colors={["#8866FF", "#7755EE", "#6644DD", "#5533BB"]}
            />
          </meshBasicMaterial>
        </mesh>
        {/* Secondary gradient floor for layered effect */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.7, 0]}>
          <planeGeometry args={[700, 700]} />
          <meshBasicMaterial transparent opacity={0.3}>
            <GradientTexture
              attach="map"
              stops={[0, 0.3, 0.6, 0.9]}
              colors={["#9977FF", "#7766EE", "#6655DD", "#5544BB"]}
            />
          </meshBasicMaterial>
        </mesh>
        {/* Additional floor layer for extra visibility */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.0, 0]}>
          <planeGeometry args={[800, 800]} />
          <meshBasicMaterial transparent opacity={0.15}>
            <GradientTexture
              attach="map"
              stops={[0, 0.4, 0.7, 1.0]}
              colors={["#6655EE", "#5544CC", "#4433AA", "#332288"]}
            />
          </meshBasicMaterial>
        </mesh>
        {/* Gradient light sources to create floor illusion */}
        <spotLight
          position={[0, -10, 0]}
          intensity={4}
          distance={70}
          angle={Math.PI / 1.7}
          penumbra={1}
          color="#5566EE"
        />
        <spotLight
          position={[0, -20, -30]}
          intensity={2.5}
          distance={80}
          angle={Math.PI / 2.2}
          penumbra={0.9}
          color="#6633CC"
        />
        {/* Fixed isometric camera */}
        <IsometricCamera position={catPosition} />
        {/* Enhanced star field for immersion */}
        <Stars
          radius={150}
          depth={80}
          count={7000}
          factor={5}
          saturation={0.25}
          fade
          speed={0.3}
        />
        {/* Space environment without a main platform */}
        {/* No physical platforms - we're using particle effects instead */}
        {/* Main navigation portals */}
        <QuantumPortal
          position={[0, 2, -5]}
          title={
            currentQuest === "complete"
              ? "All Rooms Completed!"
              : completedRooms.length === 0
                ? activePortal === "play"
                  ? "▶ Start First Quest ▶"
                  : "Start First Quest"
                : activePortal === "play"
                  ? `▶ Play ${currentQuest.replace("room", "Room ")} ▶`
                  : `Play ${currentQuest.replace("room", "Room ")}`
          }
          onClick={() => onNavigate?.(currentQuest)}
          active={activePortal === "play"}
        />
        <QuantumPortal
          position={[-24, 2, -2]}
          title={
            activePortal === "leaderboard" ? "▶ Leaderboard ▶" : "Leaderboard"
          }
          onClick={() => onNavigate?.("leaderboard")}
          active={activePortal === "leaderboard"}
        />
        <QuantumPortal
          position={[-12, 2, -4]}
          title={
            activePortal === "guide" ? "▶ Quantum Guide ▶" : "Quantum Guide"
          }
          onClick={() => onNavigate?.("guide")}
          active={activePortal === "guide"}
        />
        <QuantumPortal
          position={[12, 2, -4]}
          title={activePortal === "settings" ? "▶ Settings ▶" : "Settings"}
          onClick={() => onNavigate?.("settings")}
          active={activePortal === "settings"}
        />
        <QuantumPortal
          position={[24, 2, -2]}
          title={
            activePortal === "achievements"
              ? "▶ Achievements ▶"
              : "Achievements"
          }
          onClick={() => onNavigate?.("achievements")}
          active={activePortal === "achievements"}
        />
        {/* Completed room portals */}
        {completedRooms.includes("room1") && (
          <QuantumPortal
            position={[-28, 2, 0]}
            title={activePortal === "room1" ? "▶ Room 1 ▶" : "Room 1"}
            onClick={() => onNavigate?.("room1")}
            active={activePortal === "room1"}
          />
        )}
        {completedRooms.includes("room2") && (
          <QuantumPortal
            position={[-14, 2, 2]}
            title={activePortal === "room2" ? "▶ Room 2 ▶" : "Room 2"}
            onClick={() => onNavigate?.("room2")}
            active={activePortal === "room2"}
          />
        )}
        {completedRooms.includes("room3") && (
          <QuantumPortal
            position={[0, 2, 3]}
            title={activePortal === "room3" ? "▶ Room 3 ▶" : "Room 3"}
            onClick={() => onNavigate?.("room3")}
            active={activePortal === "room3"}
          />
        )}
        {completedRooms.includes("room4") && (
          <QuantumPortal
            position={[14, 2, 2]}
            title={activePortal === "room4" ? "▶ Room 4 ▶" : "Room 4"}
            onClick={() => onNavigate?.("room4")}
            active={activePortal === "room4"}
          />
        )}
        {completedRooms.includes("room5") && (
          <QuantumPortal
            position={[28, 2, 0]}
            title={activePortal === "room5" ? "▶ Room 5 ▶" : "Room 5"}
            onClick={() => onNavigate?.("room5")}
            active={activePortal === "room5"}
          />
        )}
        {/* Cat Model - adjusted for isometric view */}
        <CatModel
          position={[catPosition.x, catPosition.y, catPosition.z]}
          rotation={[catRotation.x, catRotation.y, catRotation.z]}
          scale={
            0.06
          } /* Slightly larger for better visibility in isometric view */
          keys={catMovementKeys}
          onMove={handleCatMove}
          freezeAnimation={false}
        />
        {/* No physical platforms - we're using particle effects instead */}
        {/* Enhanced particle effects for gradient floor illusion */}
        <QuantumParticles count={1000} />
        {/* Enhanced ambient lighting for isometric view */}
        <pointLight position={[0, 10, -5]} color="#55AAFF" intensity={1.5} />
        <pointLight position={[0, 8, 5]} color="#5588FF" intensity={1.2} />
        <pointLight position={[-10, 5, 0]} color="#8866FF" intensity={0.8} />
        <pointLight position={[10, 5, 0]} color="#6688FF" intensity={0.8} />
        {/* Additional point lights for atmosphere */}
        <pointLight position={[-20, 4, -10]} color="#33CCFF" intensity={0.6} />
        <pointLight position={[20, 4, -10]} color="#3377FF" intensity={0.6} />
        {/* Floor illumination lights */}
        <pointLight
          position={[0, -5, 0]}
          color="#8866FF"
          intensity={8}
          distance={90}
        />
        <pointLight
          position={[-40, -6, -40]}
          color="#4422BB"
          intensity={3}
          distance={50}
        />
        <pointLight
          position={[40, -6, -40]}
          color="#4422BB"
          intensity={3}
          distance={50}
        />
        <pointLight
          position={[0, -6, -50]}
          color="#332299"
          intensity={3}
          distance={50}
        />
        {/* Additional glow points for more interesting floor effect */}
        <pointLight
          position={[-30, -3, 20]}
          color="#8866FF"
          intensity={2.5}
          distance={35}
        />
        <pointLight
          position={[30, -3, 20]}
          color="#7755EE"
          intensity={2.5}
          distance={35}
        />
        {/* Extra center glow for floor emphasis */}
        <pointLight
          position={[0, -3, 0]}
          color="#AA88FF"
          intensity={3}
          distance={25}
        />
        {/* Extra floor highlights */}
        <pointLight
          position={[-15, -3, -30]}
          color="#5577FF"
          intensity={1.2}
          distance={20}
        />
        <pointLight
          position={[15, -3, -30]}
          color="#5577FF"
          intensity={1.2}
          distance={20}
        />
        <pointLight
          position={[0, -3, 30]}
          color="#6655DD"
          intensity={1.5}
          distance={25}
        />
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
          <div>
            WASD - Move | Space/Shift - Up/Down | Enter - Activate Portal |
            Click - Activate Portal
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuantumDashboard;

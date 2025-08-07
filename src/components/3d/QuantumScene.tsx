import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import Spaceship from "./Spaceship";
import LoadingScreen from "./LoadingScreen";

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
          className="text-white font-orbitron text-xl bg-black bg-opacity-50 px-4 py-2 rounded-lg"
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
const QuantumParticles = ({ count = 50 }) => {
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
  onNavigate?: (destination: string) => void;
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

export const QuantumDashboard: React.FC<QuantumSceneProps> = ({
  onNavigate,
}) => {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [spaceshipPosition, setSpaceshipPosition] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 3, 20), // Start higher up and farther back
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
  const [currentRoom, setCurrentRoom] = useState<number>(0); // Start in the main hub (Room 0)
  const [unlockedRooms, setUnlockedRooms] = useState<number[]>([0]); // Only main hub is unlocked initially
  const [transitioning, setTransitioning] = useState<boolean>(false);

  // Controls state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Simplified loading sequence
  useEffect(() => {
    // Start at 0
    setLoadingProgress(0);

    // Quick progress to 70%
    const timer1 = setTimeout(() => {
      setLoadingProgress(70);
    }, 500);

    // Finish loading after resources are likely ready
    const timer2 = setTimeout(() => {
      setLoadingProgress(100);
      setTimeout(() => setLoading(false), 300);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, []);

  // Update spaceship velocity based on keys
  useEffect(() => {
    const updateVelocity = () => {
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
  }, []);

  // Portal interaction check with hover timer
  useEffect(() => {
    if (!spaceshipPosition) return;

    // Define portal positions for different rooms in 3D space
    // Each room is in a different area of 3D space
    const portalsByRoom: {
      [key: string]: Array<{
        id: string;
        position: THREE.Vector3;
        room: number;
        targetRoom?: number;
      }>;
    } = {
      // Main hub - starting room (Room 0)
      main: [
        { id: "play", position: new THREE.Vector3(8, 2, -10), room: 0 },
        { id: "leaderboard", position: new THREE.Vector3(-8, 2, -10), room: 0 },
        { id: "guide", position: new THREE.Vector3(0, 2, -15), room: 0 },
        {
          id: "room1",
          position: new THREE.Vector3(0, 6, -8),
          room: 0,
          targetRoom: 1,
        }, // Portal to Room 1
      ],
      // Room 1 - first unlocked room (positioned higher in space)
      room1: [
        {
          id: "achievements",
          position: new THREE.Vector3(12, 10, -5),
          room: 1,
        },
        {
          id: "room0",
          position: new THREE.Vector3(0, 10, 0),
          room: 1,
          targetRoom: 0,
        }, // Portal back to main hub
        {
          id: "room2",
          position: new THREE.Vector3(-8, 10, -10),
          room: 1,
          targetRoom: 2,
        }, // Portal to Room 2
      ],
      // Room 2 - second unlocked room (positioned to the left and deeper in space)
      room2: [
        { id: "settings", position: new THREE.Vector3(-20, 2, -20), room: 2 },
        {
          id: "room1",
          position: new THREE.Vector3(-12, 2, -15),
          room: 2,
          targetRoom: 1,
        }, // Portal back to Room 1
      ],
    };

    // Flatten the active portals based on unlocked rooms
    const activePortals = [];

    // Always show the main hub portals
    activePortals.push(...portalsByRoom.main);

    // Add room 1 portals if unlocked
    if (unlockedRooms.includes(1)) {
      activePortals.push(...portalsByRoom.room1);
    }

    // Add room 2 portals if unlocked
    if (unlockedRooms.includes(2)) {
      activePortals.push(...portalsByRoom.room2);
    }

    // Find closest portal
    let closestPortalId: string | null = null;
    let closestDistance = 3; // Minimum distance to trigger interaction

    activePortals.forEach((portal) => {
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

    // Find the active portal details from flattened portal list
    const allPortals: Array<{
      id: string;
      position: THREE.Vector3;
      room: number;
      targetRoom?: number;
    }> = [
      // Main hub portals
      { id: "play", position: new THREE.Vector3(8, 2, -10), room: 0 },
      { id: "leaderboard", position: new THREE.Vector3(-8, 2, -10), room: 0 },
      { id: "guide", position: new THREE.Vector3(0, 2, -15), room: 0 },
      {
        id: "room1",
        position: new THREE.Vector3(0, 6, -8),
        room: 0,
        targetRoom: 1,
      },

      // Room 1 portals
      { id: "achievements", position: new THREE.Vector3(12, 10, -5), room: 1 },
      {
        id: "room0",
        position: new THREE.Vector3(0, 10, 0),
        room: 1,
        targetRoom: 0,
      },
      {
        id: "room2",
        position: new THREE.Vector3(-8, 10, -10),
        room: 1,
        targetRoom: 2,
      },

      // Room 2 portals
      { id: "settings", position: new THREE.Vector3(-20, 2, -20), room: 2 },
      {
        id: "room1",
        position: new THREE.Vector3(-12, 2, -15),
        room: 2,
        targetRoom: 1,
      },
    ];

    const activePortalDetails = allPortals.find(
      (portal) => portal.id === closestPortalId,
    );

    // If very close to a portal and nearly stationary, start timer
    if (
      closestPortalId &&
      closestDistance < 2 &&
      Math.abs(spaceshipVelocity.x) < 0.2 &&
      Math.abs(spaceshipVelocity.y) < 0.2 &&
      Math.abs(spaceshipVelocity.z) < 0.2 &&
      !transitioning
    ) {
      stationaryTimer = setTimeout(() => {
        if (!portalActivationInProgress) {
          portalActivationInProgress = true;

          if (activePortalDetails?.targetRoom !== undefined) {
            // This is a room transition portal
            handleRoomTransition(activePortalDetails.targetRoom);
          } else if (onNavigate) {
            // This is a navigation portal
            onNavigate(closestPortalId!);
          }
        }
      }, 1000); // Wait 1 second while stationary to trigger
    }

    // Also handle Enter key for immediate activation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Enter" &&
        closestPortalId &&
        closestDistance < 2.5 &&
        !transitioning
      ) {
        if (!portalActivationInProgress) {
          portalActivationInProgress = true;

          if (activePortalDetails?.targetRoom !== undefined) {
            // This is a room transition portal
            handleRoomTransition(activePortalDetails.targetRoom);
          } else if (onNavigate) {
            // This is a navigation portal
            onNavigate(closestPortalId);
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
    unlockedRooms,
    currentRoom,
    transitioning,
  ]);

  // Handle room transitions
  const handleRoomTransition = (targetRoom: number) => {
    // Only allow transition to unlocked rooms
    if (!unlockedRooms.includes(targetRoom)) {
      // Unlock the room if it's the next one
      if (targetRoom === Math.max(...unlockedRooms) + 1) {
        setUnlockedRooms([...unlockedRooms, targetRoom]);
      } else {
        return; // Cannot access this room yet
      }
    }

    setTransitioning(true);

    // Define target positions for each room transition
    const roomPositions: { [key: number]: THREE.Vector3 } = {
      0: new THREE.Vector3(0, 3, 10), // Main hub position
      1: new THREE.Vector3(0, 10, 0), // Room 1 position (higher up)
      2: new THREE.Vector3(-15, 3, -15), // Room 2 position (left and deeper)
    };

    // Teleport the spaceship to the new room position
    setTimeout(() => {
      setSpaceshipPosition(roomPositions[targetRoom]);
      setSpaceshipVelocity({ x: 0, y: 0, z: 0 });
      setCurrentRoom(targetRoom);
      setTimeout(() => setTransitioning(false), 500); // Add a small delay before allowing new interactions
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

  if (loading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  // Room transition effect
  if (transitioning) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-center text-blue-400">
          <div className="text-4xl font-orbitron mb-4">
            Quantum Teleportation...
          </div>
          <div className="loading-dots text-2xl">
            {Array(3)
              .fill(".")
              .map((dot, i) => (
                <span
                  key={i}
                  style={
                    {
                      animationDelay: `${i * 0.3}s`,
                      opacity: 0,
                      animation: "fadeInOut 1.5s infinite",
                    } as React.CSSProperties
                  }
                  className="inline-block mx-1"
                >
                  {dot}
                </span>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <Canvas shadows>
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
        {/* Interactive portals - conditionally rendered based on current room */}
        {/* Main hub portals (Room 0) */}
        {currentRoom === 0 && (
          <>
            <QuantumPortal
              position={[8, 2, -10]}
              title="Play Quest"
              onClick={() => onNavigate?.("play")}
              active={activePortal === "play"}
            />
            <QuantumPortal
              position={[-8, 2, -10]}
              title="Leaderboard"
              onClick={() => onNavigate?.("leaderboard")}
              active={activePortal === "leaderboard"}
            />
            <QuantumPortal
              position={[0, 2, -15]}
              title="Quantum Guide"
              onClick={() => onNavigate?.("guide")}
              active={activePortal === "guide"}
            />
            {/* Portal to Room 1 */}
            <QuantumPortal
              position={[0, 6, -8]}
              title={unlockedRooms.includes(1) ? "Enter Lab" : "Locked Lab"}
              onClick={() =>
                unlockedRooms.includes(1) && handleRoomTransition(1)
              }
              active={activePortal === "room1"}
            />
          </>
        )}

        {/* Room 1 portals */}
        {currentRoom === 1 && (
          <>
            <QuantumPortal
              position={[12, 10, -5]}
              title="Achievements"
              onClick={() => onNavigate?.("achievements")}
              active={activePortal === "achievements"}
            />
            {/* Portal back to main hub */}
            <QuantumPortal
              position={[0, 10, 0]}
              title="Return to Hub"
              onClick={() => handleRoomTransition(0)}
              active={activePortal === "room0"}
            />
            {/* Portal to Room 2 */}
            <QuantumPortal
              position={[-8, 10, -10]}
              title={unlockedRooms.includes(2) ? "Deep Space" : "Locked Area"}
              onClick={() =>
                unlockedRooms.includes(2) && handleRoomTransition(2)
              }
              active={activePortal === "room2"}
            />
          </>
        )}

        {/* Room 2 portals */}
        {currentRoom === 2 && (
          <>
            <QuantumPortal
              position={[-20, 2, -20]}
              title="Settings"
              onClick={() => onNavigate?.("settings")}
              active={activePortal === "settings"}
            />
            {/* Portal back to Room 1 */}
            <QuantumPortal
              position={[-12, 2, -15]}
              title="Return to Lab"
              onClick={() => handleRoomTransition(1)}
              active={activePortal === "room1"}
            />
          </>
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

        {/* Room-specific environment elements */}
        {currentRoom === 1 && (
          <>
            {/* Lab environment elements */}
            <mesh position={[0, 8, -5]} rotation={[0, 0, 0]}>
              <torusGeometry args={[8, 0.5, 16, 36]} />
              <meshStandardMaterial color="#3366AA" emissive="#224488" />
            </mesh>
            <pointLight position={[0, 12, -5]} color="#55AAFF" intensity={2} />
          </>
        )}

        {currentRoom === 2 && (
          <>
            {/* Deep space environment elements */}
            <mesh
              position={[-15, 3, -25]}
              rotation={[Math.PI / 4, Math.PI / 4, 0]}
            >
              <octahedronGeometry args={[8, 0]} />
              <meshStandardMaterial
                color="#553388"
                emissive="#442277"
                wireframe={true}
              />
            </mesh>
            <pointLight
              position={[-20, 5, -30]}
              color="#AA66FF"
              intensity={3}
            />
          </>
        )}
      </Canvas>

      {/* Room indicator */}
      <div className="absolute top-4 left-4 text-white font-orbitron bg-black bg-opacity-50 px-4 py-2 rounded">
        {currentRoom === 0 && "Main Hub"}
        {currentRoom === 1 && "Quantum Lab"}
        {currentRoom === 2 && "Deep Space"}
      </div>

      {/* Control instructions */}
      <div className="absolute bottom-4 left-4 text-white font-orbitron bg-black bg-opacity-50 px-4 py-2 rounded text-sm">
        <div>WASD - Move | Space/Shift - Up/Down</div>
        <div>Hover near portal + Enter or stop for 1s to activate</div>
        <div>Unlock new areas by accessing portals to locked rooms</div>
      </div>
    </div>
  );
};

export default QuantumDashboard;

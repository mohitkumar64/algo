"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line, RoundedBox, Html, Bounds } from "@react-three/drei";
import * as THREE from "three";
import { TreeLayout, LayoutNode } from "@/app/types/fibonacci";

const SCALE = 0.02; // scale factor to convert 2D pixel coordinates to 3D units

interface TreeCanvas3DProps {
  layout: TreeLayout | null;
  activeNodeIds: Set<string>;
  computedNodeIds: Set<string>;
  cacheHitNodeIds: Set<string>;
  repeatedInputs: Set<number>;
}

const STATE_COLORS: Record<string, { fill: string; stroke: string; text: string; glow: string }> = {
  waiting: { fill: "#262626", stroke: "#404040", text: "#6b7280", glow: "none" },
  active: { fill: "#1e3a5f", stroke: "#3b82f6", text: "#93c5fd", glow: "#3b82f6" },
  computed: { fill: "#1a2e1a", stroke: "#22c55e", text: "#86efac", glow: "#22c55e" },
  "cache-hit": { fill: "#2d1a3a", stroke: "#a855f7", text: "#d8b4fe", glow: "#a855f7" },
  repeated: { fill: "#2d1f0a", stroke: "#f59e0b", text: "#fcd34d", glow: "#f59e0b" },
};

function getNodeState(
  nodeId: string,
  input: number,
  isCacheHit: boolean,
  isActive: boolean,
  isComputed: boolean,
  isRepeated: boolean
): string {
  if (isActive) return "active";
  if (isCacheHit) return "cache-hit";
  if (isRepeated && isComputed) return "repeated";
  if (isComputed) return "computed";
  return "waiting";
}

function Node3D({ ln, state }: { ln: LayoutNode; state: string }) {
  const colors = STATE_COLORS[state] ?? STATE_COLORS.waiting;
  
  const w = 112 * SCALE;
  const h = 80 * SCALE;
  const depth = 0.2;

  // Center node based on its top-left coordinates in 2D
  const cx = (ln.x + 112 / 2) * SCALE;
  const cy = -(ln.y + 80 / 2) * SCALE; // Invert Y for 3D

  // Adding a slight Z curve based on X position to make it feel more "3D"
  // Nodes further from center X will be slightly pushed back
  const xOffsetFromCenter = cx; // assuming 0 is center, wait we'll center the whole group later
  const cz = Math.abs(xOffsetFromCenter) * 0.1;

  const meshRef = useRef<THREE.Mesh>(null);
  
  // Optional: subtle breathing animation for active nodes
  useFrame(({ clock }) => {
    if (state === "active" && meshRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group position={[cx, cy, cz]}>
      {/* Glow point light if active or computed */}
      {colors.glow !== "none" && (
        <pointLight color={colors.glow} intensity={0.5} distance={2} decay={2} />
      )}
      
      <RoundedBox
        ref={meshRef}
        args={[w, h, depth]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial 
          color={colors.fill} 
          roughness={0.4} 
          metalness={0.1}
          emissive={colors.stroke}
          emissiveIntensity={state !== "waiting" ? 0.3 : 0}
        />
      </RoundedBox>

      {/* Front Face Text */}
      <Text
        position={[0, 0.15, depth / 2 + 0.01]}
        fontSize={0.25}
        color={colors.text}
        anchorX="center"
        anchorY="middle"
      >
        {`fib(${ln.node.input})`}
      </Text>

      {ln.node.result !== undefined ? (
        <Text
          position={[0, -0.15, depth / 2 + 0.01]}
          fontSize={0.4}
          color={colors.stroke}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {ln.node.result.toString()}
        </Text>
      ) : (
        <Text
          position={[0, -0.15, depth / 2 + 0.01]}
          fontSize={0.3}
          color={colors.text}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.4}
        >
          ...
        </Text>
      )}

      {/* Badges */}
      {state === "cache-hit" && (
        <Html position={[w/2 - 0.1, h/2 - 0.1, depth/2]} transform distanceFactor={5} zIndexRange={[100, 0]}>
          <div style={{ background: 'rgba(168, 85, 247, 0.3)', color: '#d8b4fe', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>HIT</div>
        </Html>
      )}
      {state === "repeated" && (
        <Html position={[w/2 - 0.1, h/2 - 0.1, depth/2]} transform distanceFactor={5} zIndexRange={[100, 0]}>
          <div style={{ background: 'rgba(245, 158, 11, 0.3)', color: '#fcd34d', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>DUP</div>
        </Html>
      )}
    </group>
  );
}

function Edges3D({ layout }: { layout: TreeLayout }) {
  const lines = useMemo(() => {
    return layout.edges.map((edge) => {
      // Offset by node half width/height to center the lines just like we did for nodes
      const cx1 = (edge.x1) * SCALE;
      const cy1 = -(edge.y1) * SCALE;
      const cz1 = Math.abs(cx1) * 0.1;

      const cx2 = (edge.x2) * SCALE;
      const cy2 = -(edge.y2) * SCALE;
      const cz2 = Math.abs(cx2) * 0.1;

      return {
        id: `${edge.parentId}-${edge.childId}`,
        points: [[cx1, cy1, cz1 - 0.1], [cx2, cy2, cz2 - 0.1]] as [number, number, number][],
        isDotted: edge.isDotted
      };
    });
  }, [layout]);

  return (
    <group>
      {lines.map((l) => (
        <Line
          key={l.id}
          points={l.points}
          color={l.isDotted ? "#6b21a8" : "#404040"}
          lineWidth={2}
          dashed={l.isDotted}
          dashSize={0.2}
          gapSize={0.1}
          opacity={l.isDotted ? 0.7 : 0.6}
          transparent
        />
      ))}
    </group>
  );
}

export default function TreeCanvas3D({
  layout,
  activeNodeIds,
  computedNodeIds,
  cacheHitNodeIds,
  repeatedInputs,
}: TreeCanvas3DProps) {
  if (!layout) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        <div className="text-center space-y-2">
          <div className="text-4xl">🔮</div>
          <p className="text-sm">Press Play to visualize in 3D</p>
        </div>
      </div>
    );
  }

  // Calculate center of the layout to point the camera at
  const centerX = (layout.width / 2) * SCALE;
  const centerY = -(layout.height / 2) * SCALE;

  return (
    <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing bg-[#111]">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <Bounds key={layout.nodes.length} fit margin={1.2}>
          {/* We group everything and shift it so the orbit controls naturally rotate around the center */}
          <group position={[-centerX, -centerY, 0]}>
            <Edges3D layout={layout} />
            {layout.nodes.map((ln) => {
              const isActive = activeNodeIds.has(ln.node.id);
              const isCacheHit = cacheHitNodeIds.has(ln.node.id);
              const isComputed = computedNodeIds.has(ln.node.id);
              const isRepeated = (ln.node.repeated ?? false) && repeatedInputs.has(ln.node.input);
              const state = getNodeState(
                ln.node.id,
                ln.node.input,
                isCacheHit,
                isActive,
                isComputed,
                isRepeated
              );
              return <Node3D key={ln.node.id} ln={ln} state={state} />;
            })}
          </group>
        </Bounds>
        
        <OrbitControls makeDefault />
      </Canvas>
      <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-black/40 backdrop-blur-sm rounded px-2 py-1 pointer-events-none border border-white/10">
        3D View: Drag to rotate · Scroll to zoom · Right click to pan
      </div>
    </div>
  );
}

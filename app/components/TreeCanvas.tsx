"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { TreeLayout, LayoutNode, LayoutEdge, NodeState } from "@/app/types/fibonacci";

const NODE_W = 112;
const NODE_H = 80;

interface TreeCanvasProps {
  layout: TreeLayout | null;
  activeNodeIds: Set<string>;
  computedNodeIds: Set<string>;
  cacheHitNodeIds: Set<string>;
  repeatedInputs: Set<number>;
}

const STATE_COLORS: Record<string, { fill: string; stroke: string; text: string; glow: string }> = {
  waiting: {
    fill: "#262626",
    stroke: "#404040",
    text: "#6b7280",
    glow: "none",
  },
  active: {
    fill: "#1e3a5f",
    stroke: "#3b82f6",
    text: "#93c5fd",
    glow: "#3b82f6",
  },
  computed: {
    fill: "#1a2e1a",
    stroke: "#22c55e",
    text: "#86efac",
    glow: "#22c55e",
  },
  "cache-hit": {
    fill: "#2d1a3a",
    stroke: "#a855f7",
    text: "#d8b4fe",
    glow: "#a855f7",
  },
  repeated: {
    fill: "#2d1f0a",
    stroke: "#f59e0b",
    text: "#fcd34d",
    glow: "#f59e0b",
  },
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

function NodeCard({
  ln,
  state,
}: {
  ln: LayoutNode;
  state: string;
}) {
  const colors = STATE_COLORS[state] ?? STATE_COLORS.waiting;
  const cx = ln.x + NODE_W / 2;
  const cy = ln.y + NODE_H / 2;
  const rx = NODE_W / 2 - 2;
  const ry = NODE_H / 2 - 2;

  return (
    <g key={ln.node.id}>
      {/* Glow effect */}
      {colors.glow !== "none" && (
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx + 8}
          ry={ry + 8}
          fill={colors.glow}
          opacity={0.15}
        />
      )}
      {/* Card background */}
      <rect
        x={ln.x + 2}
        y={ln.y + 2}
        width={NODE_W - 4}
        height={NODE_H - 4}
        rx={12}
        ry={12}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={1.5}
      />
      {/* fib(n) label */}
      <text
        x={cx}
        y={ln.y + 28}
        textAnchor="middle"
        fill={colors.text}
        fontSize={12}
        fontFamily="monospace"
        fontWeight="600"
      >
        fib({ln.node.input})
      </text>
      {/* Result */}
      {ln.node.result !== undefined ? (
        <text
          x={cx}
          y={ln.y + 54}
          textAnchor="middle"
          fill={colors.stroke}
          fontSize={20}
          fontFamily="monospace"
          fontWeight="700"
        >
          {ln.node.result}
        </text>
      ) : (
        <text
          x={cx}
          y={ln.y + 54}
          textAnchor="middle"
          fill={colors.text}
          fontSize={14}
          fontFamily="monospace"
          opacity={0.4}
        >
          ...
        </text>
      )}
      {/* State badge */}
      {state === "cache-hit" && (
        <>
          <rect
            x={ln.x + NODE_W - 30}
            y={ln.y + 5}
            width={26}
            height={15}
            rx={4}
            fill="#a855f7"
            opacity={0.3}
          />
          <text
            x={ln.x + NODE_W - 17}
            y={ln.y + 16}
            textAnchor="middle"
            fill="#d8b4fe"
            fontSize={9}
            fontWeight="700"
          >
            HIT
          </text>
        </>
      )}
      {state === "repeated" && (
        <>
          <rect
            x={ln.x + NODE_W - 30}
            y={ln.y + 5}
            width={26}
            height={15}
            rx={4}
            fill="#f59e0b"
            opacity={0.3}
          />
          <text
            x={ln.x + NODE_W - 17}
            y={ln.y + 16}
            textAnchor="middle"
            fill="#fcd34d"
            fontSize={9}
            fontWeight="700"
          >
            DUP
          </text>
        </>
      )}
    </g>
  );
}

export default function TreeCanvas({
  layout,
  activeNodeIds,
  computedNodeIds,
  cacheHitNodeIds,
  repeatedInputs,
}: TreeCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vbx: 0, vby: 0 });

  // Auto-fit on layout change
  useEffect(() => {
    if (!layout || !containerRef.current) return;
    const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
    const padding = 30;
    const scaleX = (cw - 2 * padding) / layout.width;
    const scaleY = (ch - 2 * padding) / layout.height;
    const scale = Math.min(scaleX, scaleY, 1);
    const vbW = cw / scale;
    const vbH = ch / scale;
    const vbX = (layout.width - vbW) / 2 + NODE_W / 2;
    const vbY = -padding;
    setViewBox({ x: vbX, y: vbY, w: vbW, h: vbH });
  }, [layout]);

  // Pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vbx: viewBox.x, vby: viewBox.y };
  }, [viewBox]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !containerRef.current) return;
    const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
    const dx = ((panStart.current.x - e.clientX) / cw) * viewBox.w;
    const dy = ((panStart.current.y - e.clientY) / ch) * viewBox.h;
    setViewBox((v) => ({ ...v, x: panStart.current.vbx + dx, y: panStart.current.vby + dy }));
  }, [isPanning, viewBox.w, viewBox.h]);

  const onMouseUp = useCallback(() => setIsPanning(false), []);

  // Zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.88;
    setViewBox((v) => {
      const newW = v.w * factor;
      const newH = v.h * factor;
      return { ...v, w: newW, h: newH };
    });
  }, []);

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        <div className="text-center space-y-2">
          <div className="text-4xl">🌲</div>
          <p className="text-sm">Press Play to visualize</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      >
        <defs>
          <filter id="glow-blue">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#374151" />
          </marker>
        </defs>

        {/* Edges */}
        {layout.edges.map((edge) => (
          <line
            key={`${edge.parentId}-${edge.childId}`}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={edge.isDotted ? "#6b21a8" : "#404040"}
            strokeWidth={edge.isDotted ? 1.5 : 1.5}
            strokeDasharray={edge.isDotted ? "5,4" : undefined}
            opacity={edge.isDotted ? 0.7 : 0.6}
          />
        ))}

        {/* Nodes */}
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
          return <NodeCard key={ln.node.id} ln={ln} state={state} />;
        })}
      </svg>

      {/* Zoom hint */}
      <div className="absolute bottom-3 right-3 text-xs text-gray-600 bg-black/30 rounded px-2 py-1 pointer-events-none">
        Scroll to zoom · Drag to pan
      </div>
    </div>
  );
}

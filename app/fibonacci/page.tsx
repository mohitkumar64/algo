"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Code, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AlgoMode, TreeNode, ExecutionStep, Stats, TreeLayout } from "@/app/types/fibonacci";
import { generateFibonacciTree } from "@/app/lib/fibonacci";
import { layoutTree } from "@/app/lib/layoutTree";
import TreeCanvas from "@/app/components/TreeCanvas";
import Controls from "@/app/components/Controls";
import StatsPanel from "@/app/components/StatsPanel";
import MemoTable from "@/app/components/MemoTable";
import AlgoSidebar from "@/app/components/AlgoSidebar";

// Monaco must be dynamically imported (no SSR)
const MonacoPanel = dynamic(() => import("@/app/components/MonacoPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-full bg-[#1a1a1a] rounded-xl border border-white/10 items-center justify-center text-gray-600 text-sm">
      Loading editor…
    </div>
  ),
});

const SPEED_MAP: Record<number, number> = {
  1: 800,
  2: 400,
  3: 180,
  4: 60,
};

function collectRepeatedInputs(root: TreeNode): Set<number> {
  const counts = new Map<number, number>();
  function walk(node: TreeNode) {
    counts.set(node.input, (counts.get(node.input) ?? 0) + 1);
    node.children.forEach(walk);
  }
  walk(root);
  const repeated = new Set<number>();
  for (const [k, v] of counts) {
    if (v > 1) repeated.add(k);
  }
  return repeated;
}

export default function FibVisualizerPage() {
  const [mode, setMode] = useState<AlgoMode>("recursive");
  const [fibN, setFibN] = useState<number>(6);
  const [speed, setSpeed] = useState<number>(2);

  const [root, setRoot] = useState<TreeNode | null>(null);
  const [layout, setLayout] = useState<TreeLayout | null>(null);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Per-step derived state
  const [activeNodeIds, setActiveNodeIds] = useState<Set<string>>(new Set());
  const [computedNodeIds, setComputedNodeIds] = useState<Set<string>>(new Set());
  const [cacheHitNodeIds, setCacheHitNodeIds] = useState<Set<string>>(new Set());
  const [memoSnapshot, setMemoSnapshot] = useState<Record<number, number>>({});
  const [highlightMemoIndex, setHighlightMemoIndex] = useState<number | undefined>();
  const [repeatedInputs, setRepeatedInputs] = useState<Set<number>>(new Set());

  const [editorVisible, setEditorVisible] = useState<boolean>(true);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef(currentStep);
  stepRef.current = currentStep;

  // ─── Build tree ───────────────────────────────────────────────────────────
  const buildTree = useCallback((n: number, m: AlgoMode) => {
    clearInterval(intervalRef.current!);
    setIsPlaying(false);
    setIsPaused(false);

    const { root, steps, stats } = generateFibonacciTree(n, m);
    const layout = layoutTree(root);
    const repeated = collectRepeatedInputs(root);

    setRoot(root);
    setLayout(layout);
    setSteps(steps);
    setStats(stats);
    setRepeatedInputs(repeated);
    setCurrentStep(0);
    setActiveNodeIds(new Set());
    setComputedNodeIds(new Set());
    setCacheHitNodeIds(new Set());
    setMemoSnapshot({});
    setHighlightMemoIndex(undefined);
  }, []);

  // Build on initial render and on changes
  useEffect(() => {
    buildTree(fibN, mode);
  }, [fibN, mode, buildTree]);

  // ─── Apply step ───────────────────────────────────────────────────────────
  const applyStep = useCallback(
    (stepIndex: number, allSteps: ExecutionStep[]) => {
      if (stepIndex < 0 || stepIndex >= allSteps.length) return;
      const step = allSteps[stepIndex];

      setActiveNodeIds((prev) => {
        const next = new Set(prev);
        if (step.state === "active") {
          next.add(step.nodeId);
        } else {
          next.delete(step.nodeId);
        }
        return next;
      });

      if (step.state === "computed") {
        setComputedNodeIds((prev) => new Set(prev).add(step.nodeId));
      }

      if (step.state === "cache-hit") {
        setCacheHitNodeIds((prev) => new Set(prev).add(step.nodeId));
        // find the input for this node ID — from the step's memoSnapshot
      }

      if (step.memoSnapshot) {
        setMemoSnapshot(step.memoSnapshot);
        if (step.result !== undefined && step.state === "computed") {
          // find newly added key
          const newKey = Object.entries(step.memoSnapshot).find(
            ([, v]) => v === step.result
          );
          if (newKey) setHighlightMemoIndex(Number(newKey[0]));
        } else {
          setHighlightMemoIndex(undefined);
        }
      }
    },
    []
  );

  // ─── Playback ─────────────────────────────────────────────────────────────
  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPlayback = useCallback(() => {
    stopInterval();
    setIsPlaying(true);
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          stopInterval();
          setIsPlaying(false);
          return prev;
        }
        applyStep(next, steps);
        return next;
      });
    }, SPEED_MAP[speed]);
  }, [steps, speed, applyStep]);

  const handlePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      // restart
      setCurrentStep(0);
      setActiveNodeIds(new Set());
      setComputedNodeIds(new Set());
      setCacheHitNodeIds(new Set());
      setMemoSnapshot({});
      setTimeout(() => startPlayback(), 50);
    } else {
      startPlayback();
    }
  }, [currentStep, steps.length, startPlayback]);

  const handlePause = useCallback(() => {
    stopInterval();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    stopInterval();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    setActiveNodeIds(new Set());
    setComputedNodeIds(new Set());
    setCacheHitNodeIds(new Set());
    setMemoSnapshot({});
    setHighlightMemoIndex(undefined);
  }, []);

  const handleStepForward = useCallback(() => {
    stopInterval();
    setIsPlaying(false);
    setIsPaused(true);
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, steps.length - 1);
      applyStep(next, steps);
      return next;
    });
  }, [steps, applyStep]);

  // Cleanup on unmount
  useEffect(() => () => stopInterval(), []);

  // ─── Mode / N change handlers ─────────────────────────────────────────────
  const handleModeChange = (m: AlgoMode) => setMode(m);
  const handleFibNChange = (n: number) => setFibN(n);

  return (
    <main className="flex h-screen bg-[#111111] text-white overflow-hidden">
      {/* Algo Sidebar */}
      <AlgoSidebar
        mode={mode}
        onModeChange={handleModeChange}
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((v) => !v)}
      />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#171717]/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-sm font-bold">
              <Code />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                Fibonacci DP Visualizer
              </h1>
              <p className="text-xs text-gray-500">
                Understand dynamic programming visually
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active mode badge */}
            <div
              className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold border ${mode === "recursive"
                  ? "bg-red-900/20 border-red-800/30 text-red-400"
                  : "bg-emerald-900/20 border-emerald-800/30 text-emerald-400"
                }`}
            >
              {mode === "recursive" ? "O(2\u207f)" : "O(n)"}
            </div>

            {/* Editor toggle */}
            <button
              id="btn-toggle-editor"
              onClick={() => setEditorVisible((v) => !v)}
              title={editorVisible ? "Hide editor" : "Show editor"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-150"
            >
              {editorVisible ? (
                <PanelLeftClose size={14} />
              ) : (
                <PanelLeftOpen size={14} />
              )}
              {editorVisible ? "Hide Editor" : "Show Editor"}
            </button>
          </div>
        </header>

        {/* Three-column workspace */}
        <div className="flex flex-1 overflow-hidden gap-3 p-3">
          {/* LEFT: Monaco Editor — collapsible */}
          <div
            className="flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
            style={{ width: editorVisible ? 320 : 0, opacity: editorVisible ? 1 : 0 }}
          >
            <div className="w-[320px] h-full">
              <MonacoPanel mode={mode} onModeChange={handleModeChange} />
            </div>
          </div>

          {/* CENTER: Tree Canvas + Memo Table below */}
          <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
            {/* Tree panel */}
            <div className="flex-1 rounded-xl border border-white/10 bg-[#171717] relative overflow-hidden min-h-0">
              <div className="absolute top-3 left-3 z-10">
                <span className="text-xs text-gray-500 bg-black/40 rounded-md px-2 py-1 backdrop-blur-sm">
                  fib({fibN}) — {mode === "recursive" ? "Recursive Tree" : "Memoization Tree"}
                </span>
              </div>
              <TreeCanvas
                layout={layout}
                activeNodeIds={activeNodeIds}
                computedNodeIds={computedNodeIds}
                cacheHitNodeIds={cacheHitNodeIds}
                repeatedInputs={repeatedInputs}
              />
            </div>

            {/* Memo table — only in DP mode, below the tree */}
            {mode === "dp" && (
              <div className="flex-shrink-0">
                <MemoTable
                  memoSnapshot={memoSnapshot}
                  fibN={fibN}
                  highlightIndex={highlightMemoIndex}
                />
              </div>
            )}
          </div>

          {/* RIGHT: Controls + Stats */}
          <div className="w-[280px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
            <Controls
              mode={mode}
              fibN={fibN}
              onFibNChange={handleFibNChange}
              speed={speed}
              onSpeedChange={setSpeed}
              isPlaying={isPlaying}
              isPaused={isPaused}
              onPlay={handlePlay}
              onPause={handlePause}
              onReset={handleReset}
              onStepForward={handleStepForward}
              currentStep={currentStep}
              totalSteps={steps.length}
            />

            <StatsPanel
              stats={stats}
              mode={mode}
              currentStep={currentStep}
              totalSteps={steps.length}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

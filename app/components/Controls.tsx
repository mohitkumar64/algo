"use client";

import React from "react";
import {
  Gamepad2,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Hash,
} from "lucide-react";
import { AlgoMode } from "@/app/types/fibonacci";

interface ControlsProps {
  mode: AlgoMode;
  fibN: number;
  onFibNChange: (n: number) => void;
  speed: number;
  onSpeedChange: (s: number) => void;
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  currentStep: number;
  totalSteps: number;
}

export default function Controls({
  mode,
  fibN,
  onFibNChange,
  speed,
  onSpeedChange,
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  currentStep,
  totalSteps,
}: ControlsProps) {
  const isRecursive = mode === "recursive";

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-300 tracking-wide flex items-center gap-2">
        <Gamepad2 size={15} className="text-gray-400" />
        Controls
      </h3>

      {/* Fibonacci N Input */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            <Hash size={12} className="text-gray-500" />
            Fibonacci N
          </label>
          <span
            className={`text-lg font-bold font-mono ${isRecursive ? "text-purple-400" : "text-emerald-400"
              }`}
          >
            fib({fibN})
          </span>
        </div>
        <input
          id="fib-n-slider"
          type="range"
          min={1}
          max={15}
          value={fibN}
          onChange={(e) => onFibNChange(Number(e.target.value))}
          className={`w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 ${isRecursive ? "accent-purple-500" : "accent-emerald-500"
            }`}
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>1</span>
          <span>8</span>
          <span>15</span>
        </div>
      </div>

      {/* Speed Control */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            <Gauge size={12} className="text-gray-500" />
            Speed
          </label>
          <span className="text-xs font-mono text-gray-400">
            {speed === 1 ? "0.5×" : speed === 2 ? "1×" : speed === 3 ? "2×" : "4×"}
          </span>
        </div>
        <input
          id="speed-slider"
          type="range"
          min={1}
          max={4}
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className={`w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 ${isRecursive ? "accent-purple-500" : "accent-emerald-500"
            }`}
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>

      {/* Playback Buttons */}
      <div className="flex gap-2">
        {/* Reset */}
        <button
          id="btn-reset"
          onClick={onReset}
          title="Reset"
          className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-medium transition-all duration-150 border border-white/10 hover:border-white/20 flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        {/* Play / Pause */}
        {!isPlaying || isPaused ? (
          <button
            id="btn-play"
            onClick={onPlay}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150 border flex items-center justify-center gap-1.5 ${isRecursive
                ? "bg-purple-600/80 hover:bg-purple-600 border-purple-500/50 text-white"
                : "bg-emerald-600/80 hover:bg-emerald-600 border-emerald-500/50 text-white"
              }`}
          >
            <Play size={14} fill="currentColor" />
            {isPaused ? "Resume" : "Play"}
          </button>
        ) : (
          <button
            id="btn-pause"
            onClick={onPause}
            className="flex-1 py-2 rounded-lg bg-yellow-600/80 hover:bg-yellow-600 border border-yellow-500/50 text-white text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-1.5"
          >
            <Pause size={14} fill="currentColor" />
            Pause
          </button>
        )}

        {/* Step */}
        <button
          id="btn-step"
          onClick={onStepForward}
          disabled={currentStep >= totalSteps}
          title="Step Forward"
          className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 hover:text-white text-sm font-medium transition-all duration-150 border border-white/10 flex items-center justify-center gap-1.5"
        >
          <SkipForward size={14} />
          Step
        </button>
      </div>

      {/* Mode indicator */}
      <div
        className={`rounded-lg p-3 border text-xs ${isRecursive
            ? "bg-red-950/20 border-red-900/30 text-red-400"
            : "bg-emerald-950/20 border-emerald-900/30 text-emerald-400"
          }`}
      >

      </div>
    </div>
  );
}

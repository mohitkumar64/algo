"use client";

import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { AlgoMode } from "@/app/types/fibonacci";
import { RECURSIVE_CODE, DP_CODE } from "@/app/lib/fibonacci";

interface MonacoPanelProps {
  mode: AlgoMode;
  onModeChange: (mode: AlgoMode) => void;
}

export default function MonacoPanel({ mode, onModeChange }: MonacoPanelProps) {
  const code = mode === "recursive" ? RECURSIVE_CODE : DP_CODE;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-xl overflow-hidden border border-white/10">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-0 border-b border-white/10 bg-[#0d1117]">
        <button
          id="tab-recursive"
          onClick={() => onModeChange("recursive")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 ${
            mode === "recursive"
              ? "bg-[#1e1e2e] text-purple-400 border border-b-0 border-purple-500/40"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Recursive
        </button>
        <button
          id="tab-dp"
          onClick={() => onModeChange("dp")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 ${
            mode === "dp"
              ? "bg-[#1e1e2e] text-emerald-400 border border-b-0 border-emerald-500/40"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Dynamic Programming
        </button>

        <div className="ml-auto flex items-center gap-2 pb-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              mode === "recursive"
                ? "bg-red-900/40 text-red-400"
                : "bg-emerald-900/40 text-emerald-400"
            }`}
          >
            {mode === "recursive" ? "O(2ⁿ)" : "O(n)"}
          </span>
          <span className="text-xs text-gray-600 font-mono">TypeScript</span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 22,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
            renderLineHighlight: "line",
            smoothScrolling: true,
            cursorBlinking: "phase",
            renderWhitespace: "none",
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  );
}

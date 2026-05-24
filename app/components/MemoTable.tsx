"use client";

import React, { useEffect, useRef } from "react";
import { Database } from "lucide-react";

interface MemoTableProps {
  memoSnapshot: Record<number, number>;
  fibN: number;
  highlightIndex?: number;
}

export default function MemoTable({ memoSnapshot, fibN, highlightIndex }: MemoTableProps) {
  const indices = Array.from({ length: fibN + 1 }, (_, i) => i);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightIndex !== undefined && scrollRef.current) {
      const el = scrollRef.current.querySelector(`#memo-cell-${highlightIndex}`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [highlightIndex]);

  const filledCount = Object.keys(memoSnapshot).length;
  const fillPercent = Math.round((filledCount / (fibN + 1)) * 100);

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-emerald-400 tracking-wide flex items-center gap-2">
          <Database size={14} className="text-emerald-500" />
          Memo Table
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">{filledCount}/{fibN + 1} filled</span>
          <span className="text-xs font-mono text-emerald-500 font-bold">{fillPercent}%</span>
        </div>
      </div>

      {/* Index row labels */}
      <div ref={scrollRef} className="overflow-x-auto pb-1">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <td className="pr-2 pb-1">
                <span className="text-xs text-gray-600 font-mono">idx</span>
              </td>
              {indices.map((i) => (
                <th
                  key={i}
                  id={`memo-header-${i}`}
                  className="text-center text-xs text-gray-500 font-mono pb-1 min-w-[48px]"
                >
                  {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pr-2 pt-1">
                <span className="text-xs text-gray-600 font-mono">val</span>
              </td>
              {indices.map((i) => {
                const hasValue = memoSnapshot[i] !== undefined;
                const isHighlighted = i === highlightIndex;
                return (
                  <td
                    key={i}
                    id={`memo-cell-${i}`}
                    className={`
                      border text-center min-w-[48px] h-11 font-mono text-sm font-bold
                      transition-all duration-300 rounded-lg
                      ${
                        isHighlighted
                          ? "border-emerald-400 bg-emerald-900/50 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.3)] scale-105"
                          : hasValue
                          ? "border-emerald-900/50 bg-emerald-950/40 text-emerald-400"
                          : "border-white/5 bg-[#202020] text-gray-700"
                      }
                    `}
                  >
                    {hasValue ? memoSnapshot[i] : "—"}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">Cache fill progress</p>
      </div>
    </div>
  );
}

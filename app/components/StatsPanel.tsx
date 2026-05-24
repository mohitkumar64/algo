"use client";

import React from "react";
import {
  PhoneCall,
  Layers,
  RefreshCw,
  Coins,
  Zap,
  Bookmark,
  Circle,
} from "lucide-react";
import { Stats, AlgoMode } from "@/app/types/fibonacci";

interface StatsPanelProps {
  stats: Stats | null;
  mode: AlgoMode;
  currentStep: number;
  totalSteps: number;
}

function StatCard({
  label,
  value,
  colorClass,
  icon,
}: {
  label: string;
  value: string | number;
  colorClass: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`bg-[#1a1a1a] rounded-xl border p-3 ${colorClass}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="flex-shrink-0">{icon}</span>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold font-mono tracking-tight">{value}</div>
    </div>
  );
}

export default function StatsPanel({
  stats,
  mode,
  currentStep,
  totalSteps,
}: StatsPanelProps) {
  if (!stats) {
    return (
      <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4 text-center text-gray-600 text-sm">
        Statistics will appear here after running.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Complexity + progress */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Complexity</span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-mono font-bold ${mode === "recursive"
                ? "bg-red-900/40 text-red-400 border border-red-800/40"
                : "bg-emerald-900/40 text-emerald-400 border border-emerald-800/40"
              }`}
          >
            {stats.complexity}
          </span>
        </div>
        {totalSteps > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Execution progress</span>
              <span>
                {currentStep}/{totalSteps}
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${mode === "recursive"
                    ? "bg-gradient-to-r from-purple-600 to-purple-400"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                  }`}
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Total Calls"
          value={stats.totalCalls}
          colorClass="border-blue-800/30 text-blue-300"
          icon={<PhoneCall size={13} className="text-blue-400" />}
        />
        <StatCard
          label="Unique Problems"
          value={stats.uniqueSubproblems}
          colorClass="border-violet-800/30 text-violet-300"
          icon={<Layers size={13} className="text-violet-400" />}
        />

        {mode === "recursive" ? (
          <>
            <StatCard
              label="Repeated Calls"
              value={stats.repeatedComputations}
              colorClass="border-orange-800/30 text-orange-300"
              icon={<RefreshCw size={13} className="text-orange-400" />}
            />
            <StatCard
              label="Wasted Work"
              value={`${Math.round(
                (stats.repeatedComputations / stats.totalCalls) * 100
              )}%`}
              colorClass="border-red-800/30 text-red-300"
              icon={<Coins size={13} className="text-red-400" />}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Cache Hits"
              value={stats.cacheHits}
              colorClass="border-emerald-800/30 text-emerald-300"
              icon={<Zap size={13} className="text-emerald-400" />}
            />
            <StatCard
              label="Calls Saved"
              value={stats.savedComputations}
              colorClass="border-teal-800/30 text-teal-300"
              icon={<Bookmark size={13} className="text-teal-400" />}
            />
          </>
        )}
      </div>

      {/* Legend */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-3">
        <h4 className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
          Node color Legend
        </h4>
        <div className="space-y-1.5">
          {[
            { colorClass: "text-blue-500", label: "Active — currently executing" },
            { colorClass: "text-green-500", label: "Computed — result ready" },
            ...(mode === "recursive"
              ? [{ colorClass: "text-amber-500", label: "Duplicated — repeated subproblem" }]
              : [{ colorClass: "text-purple-500", label: "Cache hit — memo lookup" }]),
            { colorClass: "text-gray-700", label: "Waiting — not yet reached" },
          ].map(({ colorClass, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Circle size={10} className={`${colorClass} flex-shrink-0 fill-current`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

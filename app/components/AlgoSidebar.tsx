"use client";

import React from "react";
import {
  GitBranch,
  Zap,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  Network,
  Binary,
  FlaskConical,
  Lock,
} from "lucide-react";
import { AlgoMode } from "@/app/types/fibonacci";

interface AlgoItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  available: boolean;
  mode?: AlgoMode;
  accent: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}

interface AlgoGroup {
  category: string;
  categoryIcon: React.ReactNode;
  items: AlgoItem[];
}

const ALGO_GROUPS: AlgoGroup[] = [
  {
    category: "Dynamic Programming",
    categoryIcon: <Binary size={13} />,
    items: [
      {
        id: "fib-recursive",
        label: "Fibonacci",
        icon: <GitBranch size={14} />,
        badge: "Recursive",
        available: true,
        mode: "recursive",
        accent: "purple",
        activeBg: "bg-purple-600/20",
        activeBorder: "border-purple-500/50",
        activeText: "text-purple-300",
      },
      {
        id: "fib-dp",
        label: "Fibonacci",
        icon: <Zap size={14} />,
        badge: "Memoization",
        available: true,
        mode: "dp",
        accent: "emerald",
        activeBg: "bg-emerald-600/20",
        activeBorder: "border-emerald-500/50",
        activeText: "text-emerald-300",
      },
    ],
  },
  {
    category: "Sorting",
    categoryIcon: <SortAsc size={13} />,
    items: [
      {
        id: "bubble-sort",
        label: "Bubble Sort",
        icon: <SortAsc size={14} />,
        available: false,
        accent: "blue",
        activeBg: "bg-blue-600/20",
        activeBorder: "border-blue-500/50",
        activeText: "text-blue-300",
      },
      {
        id: "merge-sort",
        label: "Merge Sort",
        icon: <SortAsc size={14} />,
        available: false,
        accent: "sky",
        activeBg: "bg-sky-600/20",
        activeBorder: "border-sky-500/50",
        activeText: "text-sky-300",
      },
      {
        id: "quick-sort",
        label: "Quick Sort",
        icon: <SortAsc size={14} />,
        available: false,
        accent: "indigo",
        activeBg: "bg-indigo-600/20",
        activeBorder: "border-indigo-500/50",
        activeText: "text-indigo-300",
      },
    ],
  },
  {
    category: "Graph",
    categoryIcon: <Network size={13} />,
    items: [
      {
        id: "bfs",
        label: "BFS",
        icon: <Network size={14} />,
        available: false,
        accent: "orange",
        activeBg: "bg-orange-600/20",
        activeBorder: "border-orange-500/50",
        activeText: "text-orange-300",
      },
      {
        id: "dfs",
        label: "DFS",
        icon: <Network size={14} />,
        available: false,
        accent: "amber",
        activeBg: "bg-amber-600/20",
        activeBorder: "border-amber-500/50",
        activeText: "text-amber-300",
      },
      {
        id: "dijkstra",
        label: "Dijkstra's",
        icon: <Network size={14} />,
        available: false,
        accent: "rose",
        activeBg: "bg-rose-600/20",
        activeBorder: "border-rose-500/50",
        activeText: "text-rose-300",
      },
    ],
  },
];

interface AlgoSidebarProps {
  mode: AlgoMode;
  onModeChange: (mode: AlgoMode) => void;
  expanded: boolean;
  onToggle: () => void;
}

export default function AlgoSidebar({
  mode,
  onModeChange,
  expanded,
  onToggle,
}: AlgoSidebarProps) {
  const activeItem = ALGO_GROUPS.flatMap((g) => g.items).find(
    (item) => item.mode === mode && item.available
  );

  return (
    <aside
      className="flex-shrink-0 flex flex-col bg-[#0a0f1e] border-r border-white/10 transition-all duration-300 ease-in-out overflow-hidden"
      style={{ width: expanded ? 224 : 56 }}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/10 flex-shrink-0">
        {expanded && (
          <div className="flex items-center gap-2 overflow-hidden">
            <FlaskConical size={15} className="text-purple-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-300 whitespace-nowrap truncate">
              Algorithms
            </span>
          </div>
        )}
        <button
          id="btn-sidebar-toggle"
          onClick={onToggle}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className={`rounded-lg p-1.5 text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-150 flex-shrink-0 ${
            !expanded ? "mx-auto" : ""
          }`}
        >
          {expanded ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      {/* Algorithm groups */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {ALGO_GROUPS.map((group) => (
          <div key={group.category} className="mb-1">
            {/* Category label — only when expanded */}
            {expanded && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600">
                <span className="flex-shrink-0">{group.categoryIcon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest truncate">
                  {group.category}
                </span>
              </div>
            )}
            {!expanded && (
              <div className="h-px bg-white/5 mx-2 my-1" />
            )}

            {/* Items */}
            {group.items.map((item) => {
              const isActive = item.available && item.mode === mode;
              const isDisabled = !item.available;

              return (
                <button
                  key={item.id}
                  id={`algo-${item.id}`}
                  onClick={() => item.available && item.mode && onModeChange(item.mode)}
                  disabled={isDisabled}
                  title={
                    isDisabled
                      ? `${item.label} — Coming Soon`
                      : `${item.label}${item.badge ? ` (${item.badge})` : ""}`
                  }
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 text-left
                    transition-all duration-150 relative group
                    ${
                      isActive
                        ? `${item.activeBg} border-l-2 ${item.activeBorder} ${item.activeText}`
                        : isDisabled
                        ? "text-gray-700 cursor-not-allowed border-l-2 border-transparent"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border-l-2 border-transparent"
                    }
                  `}
                >
                  {/* Icon */}
                  <span className="flex-shrink-0">{item.icon}</span>

                  {/* Label + badge — only when expanded */}
                  {expanded && (
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                      <span className="text-xs font-medium truncate">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {item.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                              isActive
                                ? `bg-white/10 ${item.activeText}`
                                : "bg-white/5 text-gray-600"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isDisabled && (
                          <Lock size={10} className="text-gray-700" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Collapsed tooltip on hover */}
                  {!expanded && (
                    <div className="absolute left-full ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                      <div className="bg-[#1a1f2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 shadow-xl">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1 text-gray-500">
                            · {item.badge}
                          </span>
                        )}
                        {isDisabled && (
                          <span className="ml-1 text-gray-600">
                            (soon)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer version tag */}
      {expanded && (
        <div className="px-3 py-2 border-t border-white/5 flex-shrink-0">
          <span className="text-[10px] text-gray-700 font-mono">
            algoVis v0.1
          </span>
        </div>
      )}
    </aside>
  );
}

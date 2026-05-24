export type NodeState = "waiting" | "active" | "computed" | "cache-hit";
export type AlgoMode = "recursive" | "dp";

export type TreeNode = {
  id: string;
  input: number;
  result?: number;
  children: TreeNode[];
  repeated?: boolean;
  cached?: boolean;
  executionOrder?: number;
  state?: NodeState;
  isFirstOccurrence?: boolean;
};

export type ExecutionStep = {
  nodeId: string;
  state: NodeState;
  result?: number;
  memoSnapshot?: Record<number, number>;
};

export type LayoutNode = {
  node: TreeNode;
  x: number;
  y: number;
};

export type LayoutEdge = {
  parentId: string;
  childId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isDotted?: boolean;
};

export type TreeLayout = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
};

export type Stats = {
  totalCalls: number;
  uniqueSubproblems: number;
  repeatedComputations: number;
  cacheHits: number;
  savedComputations: number;
  complexity: string;
};

import { TreeNode, ExecutionStep, Stats, AlgoMode } from "@/app/types/fibonacci";

let nodeIdCounter = 0;

function generateId(): string {
  return `node_${nodeIdCounter++}`;
}

// ─── RECURSIVE (NO DP) ───────────────────────────────────────────────────────

function buildRecursiveTree(
  n: number,
  seen: Map<number, number>,
  steps: ExecutionStep[]
): TreeNode {
  const id = generateId();
  const node: TreeNode = {
    id,
    input: n,
    children: [],
    state: "waiting",
    executionOrder: steps.length,
  };

  steps.push({ nodeId: id, state: "active" });

  if (n <= 1) {
    const result = n;
    node.result = result;
    node.state = "computed";
    const prevCount = seen.get(n) ?? 0;
    seen.set(n, prevCount + 1);
    if (prevCount > 0) node.repeated = true;
    steps.push({ nodeId: id, state: "computed", result });
    return node;
  }

  const prevCount = seen.get(n) ?? 0;
  seen.set(n, prevCount + 1);
  if (prevCount > 0) node.repeated = true;

  const leftChild = buildRecursiveTree(n - 1, seen, steps);
  const rightChild = buildRecursiveTree(n - 2, seen, steps);

  node.children = [leftChild, rightChild];
  const result = (leftChild.result ?? 0) + (rightChild.result ?? 0);
  node.result = result;
  node.state = "computed";
  steps.push({ nodeId: id, state: "computed", result });

  return node;
}

// ─── DP / MEMOIZATION ────────────────────────────────────────────────────────

function buildMemoTree(
  n: number,
  memo: Map<number, number>,
  firstOccurrence: Map<number, string>,
  steps: ExecutionStep[]
): TreeNode {
  const id = generateId();
  const node: TreeNode = {
    id,
    input: n,
    children: [],
    state: "waiting",
    executionOrder: steps.length,
  };

  steps.push({
    nodeId: id,
    state: "active",
    memoSnapshot: Object.fromEntries(memo),
  });

  if (memo.has(n)) {
    node.result = memo.get(n);
    node.cached = true;
    node.state = "cache-hit";
    steps.push({
      nodeId: id,
      state: "cache-hit",
      result: node.result,
      memoSnapshot: Object.fromEntries(memo),
    });
    return node;
  }

  if (!firstOccurrence.has(n)) {
    firstOccurrence.set(n, id);
    node.isFirstOccurrence = true;
  }

  if (n <= 1) {
    const result = n;
    node.result = result;
    memo.set(n, result);
    node.state = "computed";
    steps.push({
      nodeId: id,
      state: "computed",
      result,
      memoSnapshot: Object.fromEntries(memo),
    });
    return node;
  }

  const leftChild = buildMemoTree(n - 1, memo, firstOccurrence, steps);
  const rightChild = buildMemoTree(n - 2, memo, firstOccurrence, steps);

  node.children = [leftChild, rightChild];
  const result = (leftChild.result ?? 0) + (rightChild.result ?? 0);
  node.result = result;
  memo.set(n, result);
  node.state = "computed";
  steps.push({
    nodeId: id,
    state: "computed",
    result,
    memoSnapshot: Object.fromEntries(memo),
  });

  return node;
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

export function generateFibonacciTree(
  n: number,
  mode: AlgoMode
): { root: TreeNode; steps: ExecutionStep[]; stats: Stats } {
  nodeIdCounter = 0;
  const steps: ExecutionStep[] = [];

  let root: TreeNode;

  if (mode === "recursive") {
    const seen = new Map<number, number>();
    root = buildRecursiveTree(n, seen, steps);

    const totalCalls = steps.filter((s) => s.state === "active").length;
    const repeatedComputations = countRepeated(root);
    const uniqueSubproblems = n + 1;

    return {
      root,
      steps,
      stats: {
        totalCalls,
        uniqueSubproblems,
        repeatedComputations,
        cacheHits: 0,
        savedComputations: 0,
        complexity: `O(2^n) ≈ O(2^${n})`,
      },
    };
  } else {
    const memo = new Map<number, number>();
    const firstOccurrence = new Map<number, string>();
    root = buildMemoTree(n, memo, firstOccurrence, steps);

    const totalCalls = steps.filter((s) => s.state === "active").length;
    const cacheHits = steps.filter((s) => s.state === "cache-hit").length;
    const uniqueComputations = totalCalls - cacheHits;

    return {
      root,
      steps,
      stats: {
        totalCalls,
        uniqueSubproblems: n + 1,
        repeatedComputations: 0,
        cacheHits,
        savedComputations: cacheHits,
        complexity: `O(n) = O(${n})`,
      },
    };
  }
}

function countRepeated(node: TreeNode): number {
  let count = node.repeated ? 1 : 0;
  for (const child of node.children) {
    count += countRepeated(child);
  }
  return count;
}

// ─── CODE STRINGS ────────────────────────────────────────────────────────────

export const RECURSIVE_CODE = `// Fibonacci - Naive Recursion
// Time Complexity: O(2^n) — exponential!
// Every call spawns two more recursive calls.
// Repeated subproblems are computed many times.

function fib(n: number): number {
  // Base cases
  if (n <= 1) return n;

  // Two recursive branches — overlap grows exponentially
  return fib(n - 1) + fib(n - 2);
}

// Example: fib(5)
// fib(5)
//   └─ fib(4)
//        └─ fib(3)          ← computed twice!
//             └─ fib(2)     ← computed 3 times!
//                  └─ fib(1)
//                  └─ fib(0)
//             └─ fib(1)
//        └─ fib(2)
//   └─ fib(3)               ← repeated!

console.log(fib(5)); // 5
`;

export const DP_CODE = `// Fibonacci - Memoization (Top-Down DP)
// Time Complexity: O(n) — linear!
// Each unique subproblem is computed only once.
// Results are cached in a memo map.

const memo = new Map<number, number>();

function fib(n: number): number {
  // Base cases
  if (n <= 1) return n;

  // Check cache first — O(1) lookup
  if (memo.has(n)) {
    return memo.get(n)!; // ← Cache hit! No recursion needed
  }

  // Compute and store result
  const result = fib(n - 1) + fib(n - 2);
  memo.set(n, result); // ← Memoize for future calls

  return result;
}

// Example: fib(5)
// fib(5) → fib(4) → fib(3) → fib(2) → fib(1) [base]
//                                      fib(0) [base]
//                             fib(1) [cache hit ✓]
//                   fib(2) [cache hit ✓]
//          fib(3)  [cache hit ✓]
// Each value computed exactly ONCE!

console.log(fib(5)); // 5
`;

import { TreeNode, TreeLayout, LayoutNode, LayoutEdge } from "@/app/types/fibonacci";

const NODE_WIDTH = 112;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 24;
const VERTICAL_GAP = 88;

// Compute the minimum width required for a subtree
function computeSubtreeWidth(node: TreeNode): number {
  if (node.children.length === 0) return NODE_WIDTH;
  const childrenWidth = node.children.reduce((sum, child) => {
    return sum + computeSubtreeWidth(child) + HORIZONTAL_GAP;
  }, -HORIZONTAL_GAP);
  return Math.max(NODE_WIDTH, childrenWidth);
}

// Recursively assign x, y positions to each node
function assignPositions(
  node: TreeNode,
  x: number,
  y: number,
  layoutNodes: LayoutNode[],
  layoutEdges: LayoutEdge[],
  parentId?: string,
  parentX?: number,
  parentY?: number
): void {
  layoutNodes.push({ node, x, y });

  if (parentId !== undefined && parentX !== undefined && parentY !== undefined) {
    const isCachedChild = node.cached && !node.isFirstOccurrence;
    layoutEdges.push({
      parentId,
      childId: node.id,
      x1: parentX + NODE_WIDTH / 2,
      y1: parentY + NODE_HEIGHT,
      x2: x + NODE_WIDTH / 2,
      y2: y,
      isDotted: isCachedChild,
    });
  }

  if (node.children.length === 0) return;

  const childWidths = node.children.map(computeSubtreeWidth);
  const totalWidth = childWidths.reduce((sum, w) => sum + w, 0) +
    HORIZONTAL_GAP * (node.children.length - 1);

  let childX = x + NODE_WIDTH / 2 - totalWidth / 2;
  const childY = y + NODE_HEIGHT + VERTICAL_GAP;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const childWidth = childWidths[i];
    assignPositions(
      child,
      childX,
      childY,
      layoutNodes,
      layoutEdges,
      node.id,
      x,
      y
    );
    childX += childWidth + HORIZONTAL_GAP;
  }
}

export function layoutTree(root: TreeNode): TreeLayout {
  const layoutNodes: LayoutNode[] = [];
  const layoutEdges: LayoutEdge[] = [];

  const totalWidth = computeSubtreeWidth(root);
  const startX = 0;
  const startY = 20;

  assignPositions(root, startX, startY, layoutNodes, layoutEdges);

  // Calculate bounding box
  let minX = Infinity, maxX = -Infinity;
  let maxY = -Infinity;
  for (const ln of layoutNodes) {
    if (ln.x < minX) minX = ln.x;
    if (ln.x + NODE_WIDTH > maxX) maxX = ln.x + NODE_WIDTH;
    if (ln.y + NODE_HEIGHT > maxY) maxY = ln.y + NODE_HEIGHT;
  }

  const padding = 40;
  const offsetX = -minX + padding;

  // Shift all nodes so minX = padding
  const shiftedNodes = layoutNodes.map((ln) => ({
    ...ln,
    x: ln.x + offsetX,
  }));
  const shiftedEdges = layoutEdges.map((le) => ({
    ...le,
    x1: le.x1 + offsetX,
    x2: le.x2 + offsetX,
  }));

  return {
    nodes: shiftedNodes,
    edges: shiftedEdges,
    width: maxX - minX + 2 * padding,
    height: maxY + padding,
  };
}

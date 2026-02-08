import type { Cube, PieceDef, PieceKey, Face } from "./types";

export const PIECE_DEFS: Record<PieceKey, PieceDef> = {
  A: { name: "A", cubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]], color: "#DB2777", light: "#F9A8D4", dark: "#9D174D", count: 4 },
  B: { name: "B", cubes: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]], color: "#F97316", light: "#FDBA74", dark: "#C2410C", count: 4 },
  C: { name: "C", cubes: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0]], color: "#EF4444", light: "#FCA5A5", dark: "#991B1B", count: 4 },
  D: { name: "D", cubes: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 0, 1]], color: "#8B5CF6", light: "#C4B5FD", dark: "#5B21B6", count: 4 },
  E: { name: "E", cubes: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [2, 1, 0]], color: "#22C55E", light: "#86EFAC", dark: "#15803D", count: 4 },
  F: { name: "F", cubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 0, 1]], color: "#3B82F6", light: "#93C5FD", dark: "#1E40AF", count: 4 },
  G: { name: "G", cubes: [[0, 0, 0], [1, 0, 0], [0, 1, 0]], color: "#EAB308", light: "#FDE047", dark: "#A16207", count: 3 },
};

export const DIRS: Cube[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

export const B36 = "0123456789abcdefghijklmnopqrstuvwxyz";

export const FACES: Face[] = [
  { normal: [0, 0, 1], neighbor: [0, 0, 1], verts: (x, y, z) => [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]] },
  { normal: [0, 0, -1], neighbor: [0, 0, -1], verts: (x, y, z) => [[x, y, z], [x, y + 1, z], [x + 1, y + 1, z], [x + 1, y, z]] },
  { normal: [1, 0, 0], neighbor: [1, 0, 0], verts: (x, y, z) => [[x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]] },
  { normal: [-1, 0, 0], neighbor: [-1, 0, 0], verts: (x, y, z) => [[x, y, z], [x, y, z + 1], [x, y + 1, z + 1], [x, y + 1, z]] },
  { normal: [0, 1, 0], neighbor: [0, 1, 0], verts: (x, y, z) => [[x, y + 1, z], [x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z]] },
  { normal: [0, -1, 0], neighbor: [0, -1, 0], verts: (x, y, z) => [[x, y, z], [x + 1, y, z], [x + 1, y, z + 1], [x, y, z + 1]] },
];

// Camera defaults
export const DEFAULT_THETA = Math.PI / 5;
export const DEFAULT_PHI = Math.PI / 4;

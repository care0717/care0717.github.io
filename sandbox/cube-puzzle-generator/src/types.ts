// ===== TYPE DEFINITIONS =====
export type Cube = [number, number, number];
export type PieceKey = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface PieceDef {
  name: string;
  cubes: Cube[];
  color: string;
  light: string;
  dark: string;
  count: number;
}

export interface PlacedPiece {
  key: PieceKey;
  cubes: Cube[];
}

export interface Puzzle {
  pieces: PlacedPiece[];
  allCubes: Cube[];
}

export interface Camera {
  cam: Cube;
  right: Cube;
  up: Cube;
}

export interface ProjectedPoint {
  sx: number;
  sy: number;
}

export interface Face {
  normal: Cube;
  neighbor: Cube;
  verts: (x: number, y: number, z: number) => Cube[];
}

export interface RenderedFace {
  depth: number;
  verts: ProjectedPoint[];
  color: string;
  stroke: string;
  sw: number;
  key: string;
}

export type RotationFunc = (cube: Cube) => Cube;

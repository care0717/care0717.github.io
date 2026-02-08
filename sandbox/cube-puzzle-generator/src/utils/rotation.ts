import type { Cube, RotationFunc } from "../types";
import { PIECE_DEFS } from "../constants";

// ===== ROTATION FUNCTIONS =====
function rotateX([x, y, z]: Cube): Cube {
  return [x, -z, y];
}

function rotateY([x, y, z]: Cube): Cube {
  return [z, y, -x];
}

function rotateZ([x, y, z]: Cube): Cube {
  return [-y, x, z];
}

function applyRot(cubes: Cube[], rots: RotationFunc[]): Cube[] {
  let r = cubes.map(c => [...c] as Cube);
  for (const f of rots) r = r.map(c => f(c));
  return r;
}

function normalizeCubes(cubes: Cube[]): Cube[] {
  const mx = Math.min(...cubes.map(c => c[0]));
  const my = Math.min(...cubes.map(c => c[1]));
  const mz = Math.min(...cubes.map(c => c[2]));
  return cubes
    .map(c => [c[0] - mx, c[1] - my, c[2] - mz] as Cube)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
}

function cKey(cubes: Cube[]): string {
  return normalizeCubes(cubes).map(c => c.join(",")).join("|");
}

export function getAllOrientations(cubes: Cube[]): Cube[][] {
  const seen = new Set<string>();
  const out: Cube[][] = [];
  const rs: RotationFunc[] = [rotateX, rotateY, rotateZ];

  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      for (let c = 0; c < 4; c++) {
        const seq: RotationFunc[] = [];
        for (let i = 0; i < a; i++) seq.push(rs[0]);
        for (let i = 0; i < b; i++) seq.push(rs[1]);
        for (let i = 0; i < c; i++) seq.push(rs[2]);
        const r = normalizeCubes(applyRot(cubes, seq));
        const k = cKey(r);
        if (!seen.has(k)) {
          seen.add(k);
          out.push(r);
        }
      }
    }
  }

  const extras: RotationFunc[][] = [
    [rotateX, rotateZ], [rotateZ, rotateX], [rotateY, rotateX],
    [rotateX, rotateY], [rotateZ, rotateY], [rotateY, rotateZ],
    [rotateX, rotateX, rotateZ], [rotateX, rotateZ, rotateZ],
    [rotateZ, rotateX, rotateX], [rotateY, rotateX, rotateZ],
    [rotateX, rotateY, rotateZ], [rotateZ, rotateY, rotateX]
  ];

  for (const seq of extras) {
    for (let a = 0; a < 4; a++) {
      const full: RotationFunc[] = [];
      for (let i = 0; i < a; i++) full.push(rotateX);
      full.push(...seq);
      const r = normalizeCubes(applyRot(cubes, full));
      const k = cKey(r);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(r);
      }
    }
  }

  return out;
}

// Precompute all orientations
export const PIECE_ORI: Record<string, Cube[][]> = {};
for (const [k, d] of Object.entries(PIECE_DEFS)) {
  PIECE_ORI[k] = getAllOrientations(d.cubes);
}

// ===== IN-SOURCE TESTS =====
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('normalizeCubes', () => {
    it('should normalize cubes to start at origin', () => {
      const input: Cube[] = [[1, 1, 1], [2, 2, 2]];
      const result = normalizeCubes(input);
      expect(result).toEqual([[0, 0, 0], [1, 1, 1]]);
    });

    it('should handle negative coordinates', () => {
      const input: Cube[] = [[-1, -1, -1], [0, 0, 0]];
      const result = normalizeCubes(input);
      expect(result).toEqual([[0, 0, 0], [1, 1, 1]]);
    });

    it('should sort cubes by x, then y, then z', () => {
      const input: Cube[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0]];
      const result = normalizeCubes(input);
      expect(result).toEqual([[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0]]);
    });

    it('should handle single cube', () => {
      const input: Cube[] = [[5, 5, 5]];
      const result = normalizeCubes(input);
      expect(result).toEqual([[0, 0, 0]]);
    });

    it('should not mutate input array', () => {
      const input: Cube[] = [[1, 1, 1], [2, 2, 2]];
      const original = JSON.parse(JSON.stringify(input));
      normalizeCubes(input);
      expect(input).toEqual(original);
    });
  });

  describe('getAllOrientations', () => {
    it('should return unique orientations for L-shaped piece', () => {
      // L字型: [[0,0,0],[1,0,0],[0,1,0]]
      const cubes: Cube[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
      const orientations = getAllOrientations(cubes);

      // All orientations should be unique
      const keys = new Set(orientations.map(o => cKey(o)));
      expect(keys.size).toBe(orientations.length);

      // L-shaped piece has 12 unique orientations
      expect(orientations.length).toBe(12);
    });

    it('should return all normalized orientations', () => {
      const cubes: Cube[] = [[0, 0, 0], [1, 0, 0]];
      const orientations = getAllOrientations(cubes);

      // Each orientation should start at origin
      for (const orientation of orientations) {
        const minX = Math.min(...orientation.map(c => c[0]));
        const minY = Math.min(...orientation.map(c => c[1]));
        const minZ = Math.min(...orientation.map(c => c[2]));
        expect(minX).toBe(0);
        expect(minY).toBe(0);
        expect(minZ).toBe(0);
      }
    });

    it('should handle single cube (1 orientation)', () => {
      const cubes: Cube[] = [[0, 0, 0]];
      const orientations = getAllOrientations(cubes);

      // Single cube has only 1 unique orientation
      expect(orientations.length).toBe(1);
      expect(orientations[0]).toEqual([[0, 0, 0]]);
    });

    it('should preserve cube count in all orientations', () => {
      const cubes: Cube[] = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]];
      const orientations = getAllOrientations(cubes);

      // Each orientation should have same number of cubes
      for (const orientation of orientations) {
        expect(orientation.length).toBe(cubes.length);
      }
    });

    it('should handle straight line piece (fewer unique orientations)', () => {
      // Straight line: [[0,0,0],[1,0,0],[2,0,0]]
      const cubes: Cube[] = [[0, 0, 0], [1, 0, 0], [2, 0, 0]];
      const orientations = getAllOrientations(cubes);

      // Straight line has 3 unique orientations (one per axis)
      // Due to symmetry, opposite directions produce the same normalized result
      expect(orientations.length).toBe(3);
    });
  });
}

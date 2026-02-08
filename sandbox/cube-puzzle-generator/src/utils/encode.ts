import type { Cube, PlacedPiece, Puzzle, PieceKey } from "../types";
import { B36, PIECE_DEFS, DIRS } from "../constants";
import { PIECE_ORI } from "./rotation";

// ===== VALIDATION =====
function validateContacts(placedPieces: PlacedPiece[], minContact = 2): boolean {
  const cubeOwner = new Map<string, number>();

  for (let i = 0; i < placedPieces.length; i++) {
    for (const c of placedPieces[i].cubes) {
      cubeOwner.set(c.join(","), i);
    }
  }

  for (let i = 0; i < placedPieces.length; i++) {
    let contacts = 0;
    for (const c of placedPieces[i].cubes) {
      for (const [dx, dy, dz] of DIRS) {
        const owner = cubeOwner.get(`${c[0] + dx},${c[1] + dy},${c[2] + dz}`);
        if (owner !== undefined && owner !== i) contacts++;
      }
    }
    if (contacts < minContact) return false;
  }

  return true;
}

// ===== ENCODE / DECODE =====
export function encodePuzzle(pieces: PlacedPiece[]): string {
  const sorted = [...pieces].sort((a, b) => a.key.localeCompare(b.key));
  const pieceKeys = sorted.map(p => p.key).join("");
  let val = 0n;

  for (const p of sorted) {
    const cubes = p.cubes;
    const mx = Math.min(...cubes.map(c => c[0]));
    const my = Math.min(...cubes.map(c => c[1]));
    const mz = Math.min(...cubes.map(c => c[2]));
    const norm = cubes
      .map(c => [c[0] - mx, c[1] - my, c[2] - mz] as Cube)
      .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    const normKey = norm.map(c => c.join(",")).join("|");
    const oris = PIECE_ORI[p.key];

    let oriIdx = 0;
    for (let i = 0; i < oris.length; i++) {
      if (oris[i].map(c => c.join(",")).join("|") === normKey) {
        oriIdx = i;
        break;
      }
    }

    val = val * BigInt(oris.length) + BigInt(oriIdx);
    val = val * 8n + BigInt(mx);
    val = val * 8n + BigInt(my);
    val = val * 8n + BigInt(mz);
  }

  let code = "";
  if (val === 0n) code = "0";
  let v = val;
  while (v > 0n) {
    code = B36[Number(v % 36n)] + code;
    v = v / 36n;
  }

  return `${pieceKeys}-${code}`;
}

export function decodePuzzle(id: string): Puzzle | null {
  try {
    const [pieceKeys, code] = id.split("-");
    if (!pieceKeys || !code) return null;

    const keys = pieceKeys.split("");
    for (const k of keys) {
      if (!(k in PIECE_DEFS)) return null;
    }

    let val = 0n;
    for (const ch of code) {
      const idx = B36.indexOf(ch);
      if (idx < 0) return null;
      val = val * 36n + BigInt(idx);
    }

    const placements: PlacedPiece[] = [];
    for (let i = keys.length - 1; i >= 0; i--) {
      const mz = Number(val % 8n); val /= 8n;
      const my = Number(val % 8n); val /= 8n;
      const mx = Number(val % 8n); val /= 8n;
      const oris = PIECE_ORI[keys[i]];
      const oriIdx = Number(val % BigInt(oris.length));
      val /= BigInt(oris.length);

      if (oriIdx >= oris.length) return null;

      const cubes = oris[oriIdx].map(c => [c[0] + mx, c[1] + my, c[2] + mz] as Cube);
      placements.unshift({ key: keys[i] as PieceKey, cubes });
    }

    return {
      pieces: placements,
      allCubes: placements.flatMap(p => p.cubes)
    };
  } catch {
    return null;
  }
}

export function generatePuzzle(keys: string[], maxAtt = 400): Puzzle | null {
  const gs = 5;
  let attempts = 0;
  let validAttempts = 0;

  for (let att = 0; att < maxAtt; att++) {
    attempts++;
    const occ = new Set<string>();
    const placed: PlacedPiece[] = [];
    const sh = [...keys].sort(() => Math.random() - 0.5);
    let ok = true;

    for (let pi = 0; pi < sh.length; pi++) {
      const pk = sh[pi];
      const orients = [...PIECE_ORI[pk]].sort(() => Math.random() - 0.5);
      let done = false;

      if (pi === 0) {
        const t = orients[0].map(c => [c[0] + 1, c[1] + 1, c[2]] as Cube);
        for (const c of t) occ.add(c.join(","));
        placed.push({ key: pk as PieceKey, cubes: t });
        done = true;
      } else {
        const bnd = new Set<string>();
        for (const o of occ) {
          const [x, y, z] = o.split(",").map(Number);
          for (const [dx, dy, dz] of DIRS) {
            const nk = `${x + dx},${y + dy},${z + dz}`;
            if (!occ.has(nk)) bnd.add(nk);
          }
        }

        outer: for (const orient of orients) {
          const ba = [...bnd].sort(() => Math.random() - 0.5);
          for (const bp of ba.slice(0, 40)) {
            const [bx, by, bz] = bp.split(",").map(Number);
            for (const anc of orient) {
              const dx = bx - anc[0];
              const dy = by - anc[1];
              const dz = bz - anc[2];
              const t = orient.map(c => [c[0] + dx, c[1] + dy, c[2] + dz] as Cube);
              let valid = true;
              let adj = false;

              for (const c of t) {
                if (occ.has(c.join(","))) {
                  valid = false;
                  break;
                }
                if (c[0] < 0 || c[0] >= gs || c[1] < 0 || c[1] >= gs || c[2] < 0 || c[2] >= gs) {
                  valid = false;
                  break;
                }
                for (const [ddx, ddy, ddz] of DIRS) {
                  if (occ.has(`${c[0] + ddx},${c[1] + ddy},${c[2] + ddz}`)) adj = true;
                }
              }

              if (valid && adj) {
                for (const c of t) occ.add(c.join(","));
                placed.push({ key: pk as PieceKey, cubes: t });
                done = true;
                break outer;
              }
            }
          }
        }
      }

      if (!done) {
        ok = false;
        break;
      }
    }

    if (!ok) continue;
    validAttempts++;

    if (!validateContacts(placed, 2)) continue;

    const all = placed.flatMap(p => p.cubes);
    const mx = Math.min(...all.map(c => c[0]));
    const my = Math.min(...all.map(c => c[1]));
    const mz = Math.min(...all.map(c => c[2]));

    const result: Puzzle = {
      pieces: placed.map(p => ({
        ...p,
        cubes: p.cubes.map(c => [c[0] - mx, c[1] - my, c[2] - mz] as Cube)
      })),
      allCubes: all.map(c => [c[0] - mx, c[1] - my, c[2] - mz] as Cube)
    };

    console.log(`生成: ${attempts}回試行 / ${validAttempts}回配置成功`);
    return result;
  }

  return null;
}

// ===== IN-SOURCE TESTS =====
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('validateContacts', () => {
    it('should return true when all pieces meet minimum contact requirement', () => {
      // Two adjacent pieces touching at one face (2 contacts)
      const pieces: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0]] },
        { key: 'B', cubes: [[2, 0, 0], [3, 0, 0]] }
      ];
      const result = validateContacts(pieces, 1);
      expect(result).toBe(true);
    });

    it('should return false when pieces do not meet minimum contact requirement', () => {
      // Two pieces with only 1 contact, but requiring 2
      const pieces: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0]] },
        { key: 'B', cubes: [[1, 0, 0]] }
      ];
      const result = validateContacts(pieces, 2);
      expect(result).toBe(false);
    });

    it('should handle isolated pieces', () => {
      // Two pieces that do not touch at all
      const pieces: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0]] },
        { key: 'B', cubes: [[5, 5, 5], [6, 5, 5]] }
      ];
      const result = validateContacts(pieces, 1);
      expect(result).toBe(false);
    });

    it('should count contacts correctly for L-shaped pieces', () => {
      // L-shaped piece touching another piece
      const pieces: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] },
        { key: 'B', cubes: [[2, 0, 0], [2, 1, 0]] }
      ];
      const result = validateContacts(pieces, 1);
      expect(result).toBe(true);
    });

    it('should use default minContact of 2', () => {
      // Test default parameter
      const pieces: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0]] },
        { key: 'B', cubes: [[2, 0, 0], [3, 0, 0]] }
      ];
      const result = validateContacts(pieces);
      expect(result).toBe(false); // Only 1 contact, default requires 2
    });

    it('should handle single piece (always fails with minContact >= 1)', () => {
      const pieces: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0], [2, 0, 0]] }
      ];
      const result = validateContacts(pieces, 1);
      expect(result).toBe(false); // Single piece has no contacts with other pieces
    });

    it('should allow single piece with minContact of 0', () => {
      const pieces: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0], [2, 0, 0]] }
      ];
      const result = validateContacts(pieces, 0);
      expect(result).toBe(true);
    });
  });

  describe('encodePuzzle', () => {
    it('should encode a simple puzzle', () => {
      const pieces: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]] }
      ];
      const encoded = encodePuzzle(pieces);

      expect(encoded).toBe('A-0');
    });

    it('should sort pieces alphabetically by key', () => {
      const pieces: PlacedPiece[] = [
        { key: 'C', cubes: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0]] },
        { key: 'A', cubes: [[3, 0, 0], [4, 0, 0], [4, 1, 0], [5, 1, 0]] },
        { key: 'B', cubes: [[6, 0, 0], [7, 0, 0], [6, 1, 0], [6, 0, 1]] }
      ];
      const encoded = encodePuzzle(pieces);

      // Keys should be sorted: ABC, and exact encoding
      expect(encoded).toBe('ABC-27y5mo0');
    });

    it('should produce consistent encoding for same puzzle', () => {
      const pieces: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]] }
      ];
      const encoded1 = encodePuzzle(pieces);
      const encoded2 = encodePuzzle(pieces);

      expect(encoded1).toBe(encoded2);
    });

    it('should handle multiple pieces', () => {
      const pieces: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]] },
        { key: 'B', cubes: [[3, 0, 0], [4, 0, 0], [3, 1, 0], [3, 0, 1]] }
      ];
      const encoded = encodePuzzle(pieces);

      expect(encoded).toBe('AB-5c');
    });
  });

  describe('decodePuzzle', () => {
    it('should decode an encoded puzzle correctly', () => {
      const original: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]] }
      ];
      const encoded = encodePuzzle(original);
      const decoded = decodePuzzle(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded!.pieces).toStrictEqual(original);
      expect(decoded!.allCubes).toStrictEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]]);
    });

    it('should return null for invalid format', () => {
      expect(decodePuzzle("invalid")).toBeNull();
      expect(decodePuzzle("A")).toBeNull();
      expect(decodePuzzle("A-")).toBeNull();
      expect(decodePuzzle("-123")).toBeNull();
    });

    it('should return null for invalid piece keys', () => {
      expect(decodePuzzle("XYZ-abc")).toBeNull();
    });

    it('should return null for invalid base36 characters', () => {
      expect(decodePuzzle("A-@@@")).toBeNull();
    });

    it('should handle round-trip encoding/decoding', () => {
      const original: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]] },
        { key: 'B', cubes: [[3, 0, 0], [4, 0, 0], [3, 1, 0], [3, 0, 1]] }
      ];

      const encoded = encodePuzzle(original);
      const decoded = decodePuzzle(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded!.pieces.length).toBe(2);

      // Re-encode and compare
      const reEncoded = encodePuzzle(decoded!.pieces);
      expect(reEncoded).toBe(encoded);
    });

    it('should preserve allCubes in decoded puzzle', () => {
      const original: PlacedPiece[] = [
        { key: 'A', cubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]] }
      ];
      const encoded = encodePuzzle(original);
      const decoded = decodePuzzle(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded).toStrictEqual({
        pieces: [{ key: 'A', cubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]] }],
        allCubes: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]]
      });
    });
  });
}

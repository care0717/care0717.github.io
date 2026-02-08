import type { PieceKey, RenderedFace } from "../types";
import { PIECE_DEFS, FACES, DEFAULT_THETA, DEFAULT_PHI } from "../constants";
import { makeCamera, project3d, dot3, getFaceColor } from "../utils/camera";

interface PiecePreviewProps {
  pieceKey: PieceKey;
  size?: number;
}

export function PiecePreview({ pieceKey, size = 56 }: PiecePreviewProps) {
  const def = PIECE_DEFS[pieceKey];
  const cubes = def.cubes;
  const cam = makeCamera(DEFAULT_THETA, DEFAULT_PHI);
  const S = 10;

  const cubeSet = new Set(cubes.map(c => c.join(",")));
  const cx2 = cubes.reduce((s, c) => s + c[0] + 0.5, 0) / cubes.length;
  const cy2 = cubes.reduce((s, c) => s + c[1] + 0.5, 0) / cubes.length;
  const cz2 = cubes.reduce((s, c) => s + c[2] + 0.5, 0) / cubes.length;

  const faces: RenderedFace[] = [];

  for (const [x, y, z] of cubes) {
    for (const face of FACES) {
      if (dot3(face.normal, cam.cam) <= 0) continue;
      if (cubeSet.has(`${x + face.neighbor[0]},${y + face.neighbor[1]},${z + face.neighbor[2]}`)) continue;

      const verts = face.verts(x, y, z).map(([vx, vy, vz]) =>
        project3d(vx - cx2, vy - cy2, vz - cz2, cam, S)
      );

      const fcx = (x + face.neighbor[0] * 0.5 + 0.5) - cx2;
      const fcy = (y + face.neighbor[1] * 0.5 + 0.5) - cy2;
      const fcz = (z + face.neighbor[2] * 0.5 + 0.5) - cz2;

      faces.push({
        depth: dot3([fcx, fcy, fcz], cam.cam),
        verts,
        color: getFaceColor(face.normal, cam, def),
        stroke: "rgba(0,0,0,0.15)",
        sw: 0.5,
        key: `${x}${y}${z}${face.normal}`
      });
    }
  }

  faces.sort((a, b) => a.depth - b.depth);
  const ox3 = size / 2;
  const oy3 = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {faces.map(f => (
        <polygon
          key={f.key}
          points={f.verts.map(v => `${v.sx + ox3},${v.sy + oy3}`).join(" ")}
          fill={f.color}
          stroke={f.stroke}
          strokeWidth={f.sw}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

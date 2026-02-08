import React, { useRef, useEffect } from "react";
import type { Cube, PlacedPiece, PieceDef, RenderedFace } from "../types";
import { PIECE_DEFS, FACES } from "../constants";
import { makeCamera, project3d, dot3, getFaceColor } from "../utils/camera";

interface IsometricViewProps {
  cubes: Cube[];
  width?: number;
  height?: number;
  showAnswer: boolean;
  pieces: PlacedPiece[];
  theta: number;
  phi: number;
  onDrag: (dx: number, dy: number) => void;
}

export function IsometricView({ cubes, width = 380, height = 340, showAnswer, pieces, theta, phi, onDrag }: IsometricViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = true;
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastPos.current = { x: cx, y: cy };
    if ('touches' in e) e.preventDefault();
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current) return;
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = cx - lastPos.current.x;
    const dy = cy - lastPos.current.y;
    lastPos.current = { x: cx, y: cy };
    onDrag(dx, dy);
    if ('touches' in e) e.preventDefault();
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const opts = { passive: false };
    const handleTouchStart = (e: TouchEvent) => handlePointerDown(e as unknown as React.TouchEvent);
    const handleTouchMove = (e: TouchEvent) => handlePointerMove(e as unknown as React.TouchEvent);

    el.addEventListener('touchstart', handleTouchStart, opts);
    el.addEventListener('touchmove', handleTouchMove, opts);
    el.addEventListener('touchend', handlePointerUp);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handlePointerUp);
    };
  });

  if (!cubes || cubes.length === 0) return null;

  const cubeSet = new Set(cubes.map(c => c.join(",")));
  const colorMap: Record<string, PieceDef> = {};

  if (showAnswer && pieces) {
    for (const p of pieces) {
      for (const c of p.cubes) {
        colorMap[c.join(",")] = PIECE_DEFS[p.key];
      }
    }
  }

  const cam = makeCamera(theta, phi);
  const S = 28;

  const ccx = cubes.reduce((s, c) => s + c[0] + 0.5, 0) / cubes.length;
  const ccy = cubes.reduce((s, c) => s + c[1] + 0.5, 0) / cubes.length;
  const ccz = cubes.reduce((s, c) => s + c[2] + 0.5, 0) / cubes.length;

  const allFaces: RenderedFace[] = [];

  for (const [x, y, z] of cubes) {
    const info = showAnswer ? colorMap[`${x},${y},${z}`] : undefined;

    for (const face of FACES) {
      if (dot3(face.normal, cam.cam) <= 0) continue;
      if (cubeSet.has(`${x + face.neighbor[0]},${y + face.neighbor[1]},${z + face.neighbor[2]}`)) continue;

      const verts = face.verts(x, y, z).map(([vx, vy, vz]) =>
        project3d(vx - ccx, vy - ccy, vz - ccz, cam, S)
      );

      const fcx2 = (x + face.neighbor[0] * 0.5 + 0.5) - ccx;
      const fcy2 = (y + face.neighbor[1] * 0.5 + 0.5) - ccy;
      const fcz2 = (z + face.neighbor[2] * 0.5 + 0.5) - ccz;

      allFaces.push({
        depth: dot3([fcx2, fcy2, fcz2], cam.cam),
        verts,
        color: getFaceColor(face.normal, cam, info),
        stroke: showAnswer ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.35)",
        sw: showAnswer ? 0.6 : 1,
        key: `${x},${y},${z},${face.normal}`
      });
    }
  }

  allFaces.sort((a, b) => a.depth - b.depth);
  const ox = width / 2;
  const oy = height / 2;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", cursor: "grab", userSelect: "none", touchAction: "none" }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
    >
      <rect width={width} height={height} fill="#fff" rx={8} />
      {allFaces.map(f => (
        <polygon
          key={f.key}
          points={f.verts.map(v => `${v.sx + ox},${v.sy + oy}`).join(" ")}
          fill={f.color}
          stroke={f.stroke}
          strokeWidth={f.sw}
          strokeLinejoin="round"
        />
      ))}
      <text
        x={width - 12}
        y={height - 10}
        textAnchor="end"
        fill="#ccc"
        fontSize={11}
        style={{ pointerEvents: "none" }}
      >
        🔄 ドラッグで回転
      </text>
    </svg>
  );
}

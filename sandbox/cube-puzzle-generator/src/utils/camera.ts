import type { Cube, Camera, ProjectedPoint, PieceDef } from "../types";

// ===== 3D CAMERA =====
export function makeCamera(theta: number, phi: number): Camera {
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  return {
    cam: [cp * ct, cp * st, sp],
    right: [-st, ct, 0],
    up: [-sp * ct, -sp * st, cp]
  };
}

export function project3d(x: number, y: number, z: number, cam: Camera, scale: number): ProjectedPoint {
  return {
    sx: (x * cam.right[0] + y * cam.right[1] + z * cam.right[2]) * scale,
    sy: -(x * cam.up[0] + y * cam.up[1] + z * cam.up[2]) * scale
  };
}

export function dot3(a: Cube, b: Cube): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

export function getFaceColor(normal: Cube, cam: Camera, info?: PieceDef): string {
  const light: Cube = [
    cam.cam[0] + 0.3 * cam.right[0] + 0.2 * cam.up[0],
    cam.cam[1] + 0.3 * cam.right[1] + 0.2 * cam.up[1],
    cam.cam[2] + 0.3 * cam.right[2] + 0.2 * cam.up[2]
  ];
  const len = Math.sqrt(light[0] ** 2 + light[1] ** 2 + light[2] ** 2);
  const nl: Cube = [light[0] / len, light[1] / len, light[2] / len];
  const d = Math.max(0, dot3(normal, nl));

  if (info) {
    const base = hexToRgb(info.dark);
    const br = hexToRgb(info.light);
    return `rgb(${Math.round(base[0] + (br[0] - base[0]) * d)},${Math.round(base[1] + (br[1] - base[1]) * d)},${Math.round(base[2] + (br[2] - base[2]) * d)})`;
  }

  return `rgb(${Math.round(140 + 100 * d)},${Math.round(140 + 100 * d)},${Math.round(140 + 100 * d)})`;
}

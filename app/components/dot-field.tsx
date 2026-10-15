"use client";

import { useEffect } from "react";

// Each dot cloud gets a random spot within its own region of the screen
// (x range, y range in %), so the clouds spread out instead of clumping.
const REGIONS: [number, number, number, number][] = [
  [4, 36, 4, 34], // top left
  [62, 96, 4, 32], // top right
  [56, 92, 50, 86], // lower right
  [4, 38, 58, 96], // lower left
  [34, 66, 30, 62], // middle
];

const between = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

// Moves the background dot clouds (see body::before in globals.css) to new random
// positions on each visit. Renders nothing; the CSS defaults apply until it runs.
export default function DotField() {
  useEffect(() => {
    const root = document.documentElement.style;
    REGIONS.forEach(([x1, x2, y1, y2], i) => {
      root.setProperty(`--dots-${i + 1}`, `${between(x1, x2)}% ${between(y1, y2)}%`);
    });
  }, []);
  return null;
}

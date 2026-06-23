// A near-invisible noise layer over the whole page — the "paper" in the
// Cantiere Calmo palette should read as material, not as a flat CSS color.
export function Grain() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full opacity-[0.035] mix-blend-multiply"
    >
      <filter id="cc-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.85 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#cc-grain)" />
    </svg>
  );
}

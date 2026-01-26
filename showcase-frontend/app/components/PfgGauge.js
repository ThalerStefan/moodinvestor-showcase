// /frontend/app/components/PfgGauge.js
// Fear & Greed Gauge (0-100) as an SVG semicircle with pointers & zones.


import { html } from "../utils/dom.js";

/**
 * PfgGauge(props)
 * @param {Object} props
 * @param {number} props.value 0..100 (required)
 * @param {number} [props.size=260] pixel edge length (square, scales responsively)
 * @param {boolean} [props.showTicks=true] Show main markers (0, 50, 100)
 * @param {boolean} [props.compact=false] Compact mode (smaller font)
 * * Color Logic/Labeling:
 * 0-20 Extreme Fear
 * 21-40 Fear
 * 41-60 Neutral
 * 61-80 Greed
 * 81-100 Extreme Greed
 */
export function PfgGauge({ value, size, showTicks = true, compact = false }) {
  // Clamp value to 0..100
  const v = clamp(Math.round(value ?? 0), 0, 100);

  // Determine angular position of the needle (0..100 → -90..90 degrees)
  const needleDeg = mapRange(v, 0, 100, -90, 90);

  // Define geometry: center point and radii
  const cx = size / 2;
  const cy = size / 2;
  // Inner radius of the display ring
  const r = Math.round(size * 0.42);
  // Line width of the ring
  const sw = Math.round(size * 0.10);

  // Zone definitions: percentage ranges and CSS classes
  const zones = [
    { from: 0, to: 20, cls: "z1" },   // Extreme Fear
    { from: 21, to: 40, cls: "z2" },  // Fear
    { from: 41, to: 60, cls: "z3" },  // Neutral
    { from: 61, to: 80, cls: "z4" },  // Greed
    { from: 81, to: 100, cls: "z5" }, // Extreme Greed
  ];

  // Determine text label for the current value
  const label = zoneLabel(v);

  // Determine current zone class (z1..z5) based on the value
  let zoneCls = "z5";
  if (v <= 20) zoneCls = "z1";
  else if (v <= 40) zoneCls = "z2";
  else if (v <= 60) zoneCls = "z3";
  else if (v <= 80) zoneCls = "z4";

  /**
   * Calculates the SVG path for a ring segment between two percentage values.
   * Each segment is drawn as a closed path between outer and inner radius.
   */
  function arcPath(pctA, pctB) {
    const aDeg = mapRange(pctA, 0, 100, -90, 90);
    const bDeg = mapRange(pctB, 0, 100, -90, 90);
    const rOuter = r + sw / 2;
    const rInner = r - sw / 2;
    const A = polar(cx, cy, rOuter, aDeg);
    const B = polar(cx, cy, rOuter, bDeg);
    const C = polar(cx, cy, rInner, bDeg);
    const D = polar(cx, cy, rInner, aDeg);
    const large = Math.abs(bDeg - aDeg) > 180 ? 1 : 0;
    return [
      `M ${A.x} ${A.y}`,
      `A ${rOuter} ${rOuter} 0 ${large} 1 ${B.x} ${B.y}`,
      `L ${C.x} ${C.y}`,
      `A ${rInner} ${rInner} 0 ${large} 0 ${D.x} ${D.y}`,
      "Z",
    ].join(" ");
  }

  /**
   * Generates the numeric labels (e.g., 0, 50, 100) along the arc.
   * Each label is positioned slightly outside the ring.
   */
  const numberValues = showTicks ? [0, 50, 100] : [];
  const numberEls = numberValues.map((n) => {
    const deg = mapRange(n, 0, 100, -90, 90);
    // Positioning the label just outside the outer radius
    const pos = polar(cx, cy, r + sw / 2 + size * 0.08, deg);
    const anchor = "middle";
    return `<text x="${pos.x}" y="${pos.y}" class="tick-label" text-anchor="${anchor}" dy="0.35em">${n}</text>`;
  }).join("");

  /**
   * Calculates the triangular pointer polygon.
   * The pointer starts near the center and points to the current value.
   */
  function pointerPolygon(deg) {
    // Base radius defines the width of the needle at the hub
    const baseR = Math.max(2, size * 0.02);
    const tip = polar(cx, cy, r, deg);
    const left = polar(cx, cy, baseR, deg - 90);
    const right = polar(cx, cy, baseR, deg + 90);
    return `${left.x},${left.y} ${right.x},${right.y} ${tip.x},${tip.y}`;
  }

  // Initial shape of the needle for the current value
  const pointerPts = pointerPolygon(needleDeg);

  // Build the component's DOM structure
  const el = html`
    <div class="pfg-gauge ${compact ? "pfg-compact" : ""}">
      <div class="pfg-info">
        <div class="pfg-bubble ${zoneCls}">${v}</div>
        <div class="pfg-now-text">Jetzt:</div>
        <div class="pfg-now-state ${zoneCls}">${label}</div>
      </div>

      <svg class="pfg-svg" viewBox="0 0 ${size} ${size / 2}" role="img"
           aria-label="Fear & Greed Gauge ${v}/100 (${label})">
        ${zones.map(z => `<path d="${arcPath(z.from, z.to)}" class="zone ${z.cls}"/>`).join("")}

        ${numberEls}

        <g class="needle">
          <polygon points="${pointerPts}" />
          <circle cx="${cx}" cy="${cy}" r="${Math.max(2, size * 0.02)}" class="hub"/>
        </g>
      </svg>

      <div class="pfg-range">
        <span class="left-label"><strong>Extreme Angst</strong></span>
        <span class="right-label"><strong>Extreme Gier</strong></span>
      </div>
    </div>
  `;

  /**
   * Updates the display to show a new value.
   * Adjusts needle, bubble, as well as colors and texts of the status area.
   */
  el.update = (nv) => {
    const next = clamp(Math.round(nv ?? 0), 0, 100);
    const nextDeg = mapRange(next, 0, 100, -90, 90);
    const nextLabel = zoneLabel(next);
    // Determine zone class for the new value
    let cls = "z5";
    if (next <= 20) cls = "z1";
    else if (next <= 40) cls = "z2";
    else if (next <= 60) cls = "z3";
    else if (next <= 80) cls = "z4";

    // Update needle polygon
    const newPts = pointerPolygon(nextDeg);
    const svg = el.querySelector("svg");
    const poly = svg.querySelector(".needle polygon");
    poly.setAttribute("points", newPts);

    // Update bubble text and classes
    const bubble = el.querySelector(".pfg-bubble");
    bubble.textContent = next;
    bubble.className = `pfg-bubble ${cls}`;
    const state = el.querySelector(".pfg-now-state");
    state.textContent = nextLabel;
    state.className = `pfg-now-state ${cls}`;
  };

  return el;
}

// ===== Helper Functions =====
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function mapRange(v, inMin, inMax, outMin, outMax) {
  const t = (v - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}
function polar(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180; // -90° = left
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function zoneLabel(v) {
  if (v <= 20) return "Extreme Angst";
  if (v <= 40) return "Angst";
  if (v <= 60) return "Neutral";
  if (v <= 80) return "Gier";
  return "Extreme Gier";
}
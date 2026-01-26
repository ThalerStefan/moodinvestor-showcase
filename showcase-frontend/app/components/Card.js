// /frontend/app/components/Card.js

import { html } from "../utils/dom.js";


/**
 * Card({ title, body, footer })
 * @param {Object} props
 * @param {string} props.title   - Card title (required)
 * @param {Node}   props.body    - DOM node for body content (optional, but common)
 * @param {string|Node|null} [props.footer=null] - Optional footer (DOM node or HTML string)
 * @returns {HTMLElement}
 */
export function Card({ title, body, footer = null }) {
  const el = html`
    <div class="card shadow-sm mb-1">
      <div class="card-header d-flex align-items-center justify-content-between">
        <span class="fw-semibold">${title}</span>
      </div>
      <div class="card-body"></div>
      ${footer ? `<div class="card-footer">${typeof footer === "string" ? footer : ""}</div>` : ""}
    </div>
  `;

  
  // Safely attach body content (Null-Guard, in case structure has changed)
  const bodyEl = el.querySelector(".card-body");
  if (bodyEl && body) bodyEl.append(body);

  if (footer instanceof Node) {
    const footerEl = el.querySelector(".card-footer");
    if (footerEl) {
      footerEl.innerHTML = ""; // evtl. leeren Platzhalter entfernen
      footerEl.append(footer);
    }
  }

  return el;
}
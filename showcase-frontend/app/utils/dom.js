// render(), el(), qs()...
// /frontend/app/utils/dom.js
// Small, reusable DOM helpers (no dependencies)

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * createElement with HTML string:
 * - Safe mini-helper for creating DOM elements from template strings.
 * - For simple component outputs (cards, navbar, etc.).
 */
export function html(strings, ...vals) {
  const str = strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ""), "");
  const template = document.createElement("template");
  template.innerHTML = str.trim();
  return template.content.firstElementChild;
}

/**
 * Event Delegation:
 * - Attaches a listener to "root" and reacts only if "selector" matches.
 */
export function delegate(root, selector, type, handler) {
  root.addEventListener(type, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}
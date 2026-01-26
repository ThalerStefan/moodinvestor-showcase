// /frontend/app/components/Ticker.js
// Global price ticker directly below the navbar.
// Shows assets with assetId 1..10. Prices are updated live via WebSocket.

import { html } from "../utils/dom.js";
import { getAssetsMarketcap } from "../services/api.js"; 
import { fmt } from "../utils/format.js";
import { getPrice, setPrice, subscribePrices } from "../store.js";
import { flashPrice } from "../utils/priceFlash.js";

export function Ticker() {
  const el = html`
    <div class="price-ticker rounded p-2 mb-3" role="region" aria-label="Preisticker">
      <div class="ticker-viewport">
        <div class="ticker-track" aria-live="polite" aria-busy="true"></div>
      </div>
    </div>
  `;

  const track = el.querySelector(".ticker-track");

  // store latest price per symbol
  const lastTickerPricePerSymbol = new Map();

  // Patch only the ticker badges that match a symbol.
  function patchTickerPrice(symbol, price) {
    const sym = String(symbol || "").trim().toUpperCase();
    if (!sym) return;

    const newNum = Number(price);
    if (!Number.isFinite(newNum)) return;

    const prev = lastTickerPricePerSymbol.get(sym);
    lastTickerPricePerSymbol.set(sym, newNum);

    let direction = null;
    if (prev != null) {
      if (newNum > prev) {
        direction = "up";
      } else if(newNum < prev){
        direction = "down";
      }
    }

    track.querySelectorAll(`[data-ticker-symbol="${sym}"]`).forEach((badge) => {
      badge.textContent = `${sym}-Kurs ${fmt.smartMoney(newNum)}`;
      if (direction) {
        flashPrice(badge, direction);
      }
    });
  }

  // Live updates (WS -> store.setPrice -> subscribePrices -> patch DOM)
  const unsubscribePrices = subscribePrices(({ symbol, price }) => {
    patchTickerPrice(symbol, price);
  });

  // Cleanup hook (router will call destroy() on page change)
  el.destroy = () => unsubscribePrices();

  async function load() {
    track.setAttribute("aria-busy", "true");
    track.innerHTML = "";

    //Build Ticker first with what ever there is, then fetch a backend snapshot once, and fill missing prices + store
    const selectedIdsMin = 1;
    const selectedIdsMax = 10;

    // 1) Build skeleton ticker row immediately (instant render)
    const row = document.createElement("div");
    row.className = "d-inline-flex gap-3 px-3";

    let selected = [];
    try {
      const all = await getAssetsMarketcap(); // returns sorted/ready data from backend (includes price)
      selected = (Array.isArray(all) ? all : [])
        .filter(a => a.assetId >= selectedIdsMin && a.assetId <= selectedIdsMax)
        .sort((a, b) => a.assetId - b.assetId);
    } catch (e) {
      console.error("Ticker snapshot load failed:", e);
      track.removeAttribute("aria-busy");
      return el;
    }

    // 2) Create badges with best-available instant price:
    //    - prefer store/session price (getPrice)
    //    - fallback to backend snapshot price (a.price)
    for (const a of selected) {
      const sym = String(a.symbol || "").trim().toUpperCase();
      if (!sym) continue;

      const storePrice = getPrice(sym);
      const backendPrice = a.price;

      const effective = (storePrice != null) ? storePrice : backendPrice;

      const seed = Number(effective);
      if (Number.isFinite(seed) && !lastTickerPricePerSymbol.has(sym)) {
        lastTickerPricePerSymbol.set(sym, seed);
      }

      // Also make sure store has it (so reload is instant next time)
      if (effective != null) {
        setPrice(sym, effective);
      }

      const text = (effective != null)
        ? `${sym}-Kurs ${fmt.smartMoney(Number(effective))}`
        : `${sym}-Kurs —`;

      const badge = html`
        <span class="badge badge-ticker bg-transparent text-wrap"
              data-tick
              data-ticker-symbol="${sym}">${text}</span>
      `;
      row.append(badge);
    }

    // 3) Endless loop: duplicate content for seamless scrolling
    const rowClone = row.cloneNode(true);

    track.append(row, rowClone);
    track.removeAttribute("aria-busy");
  }

  el.refresh = load;
  load();

  return el;
}
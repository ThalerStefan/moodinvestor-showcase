/**
 * Global State (Theme, Prices, Asset Row Metrics)
 * separate channels for high-frequency streams.
 */

const PRICE_STORAGE_KEY = "mi_prices_v1";
const ASSETROW_STORAGE_KEY = "mi_assetrows_v1";

const TTL_MS = 2 * 60 * 1000; // 2 minutes

const state = {
  theme: localStorage.getItem("mi-theme") || "theme-dark",
};

// Low-frequency listeners (theme/settings)
const listeners = new Set();

// High-frequency channels
const priceMap = new Map();            // symbol -> price
const priceListeners = new Set();      // ({symbol, price}) => void

const assetRowMap = new Map();         // symbol -> { symbol, price, change24h, change7d, marketcap, timestamp, source }
const assetRowListeners = new Set();   // (row) => void

export function getState() {
  return structuredClone(state);
}

export function setState(patch) {
  Object.assign(state, patch);

  if (patch.theme) {
    document.documentElement.classList.remove("theme-dark", "theme-light");
    document.documentElement.classList.add(state.theme);
    localStorage.setItem("mi-theme", state.theme);
  }

  listeners.forEach((fn) => {
    try { fn(getState()); } catch (_) {}
  });
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Load cached prices + asset rows from sessionStorage (TTL-based).
 * Returns true if something was loaded.
 */
export function loadFromSession() {
  let loaded = false;

  // ---- Prices ----
  try {
    const raw = sessionStorage.getItem(PRICE_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.ts && data?.prices) {
        if (Date.now() - data.ts <= TTL_MS) {
          for (const [sym, price] of Object.entries(data.prices)) {
            priceMap.set(String(sym).toUpperCase(), price);
          }
          loaded = priceMap.size > 0 || loaded;
        } else {
          sessionStorage.removeItem(PRICE_STORAGE_KEY);
        }
      }
    }
  } catch {}

  // ---- Asset rows ----
  try {
    const raw = sessionStorage.getItem(ASSETROW_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.ts && data?.rows) {
        if (Date.now() - data.ts <= TTL_MS) {
          for (const [sym, row] of Object.entries(data.rows)) {
            const key = String(sym).toUpperCase();
            if (row && typeof row === "object") {
              assetRowMap.set(key, { ...row, symbol: key });
            }
          }
          loaded = assetRowMap.size > 0 || loaded;
        } else {
          sessionStorage.removeItem(ASSETROW_STORAGE_KEY);
        }
      }
    }
  } catch {}

  return loaded;
}

function savePricesToSession() {
  try {
    const obj = Object.fromEntries(priceMap.entries());
    sessionStorage.setItem(
      PRICE_STORAGE_KEY,
      JSON.stringify({ ts: Date.now(), prices: obj })
    );
  } catch {}
}

function saveAssetRowsToSession() {
  try {
    const obj = Object.fromEntries(assetRowMap.entries());
    sessionStorage.setItem(
      ASSETROW_STORAGE_KEY,
      JSON.stringify({ ts: Date.now(), rows: obj })
    );
  } catch {}
}

/**
 * PRICE CHANNEL
 */
export function setPrice(symbol, price) {
  if (!symbol) return;
  const key = String(symbol).toUpperCase();

  const prev = priceMap.get(key);
  if (prev == price) return; // skip duplicates

  priceMap.set(key, price);
  savePricesToSession();

  priceListeners.forEach((fn) => {
    try { fn({ symbol: key, price }); } catch (_) {}
  });
}

export function getPrice(symbol) {
  if (!symbol) return null;
  return priceMap.get(String(symbol).toUpperCase()) ?? null;
}

export function subscribePrices(fn) {
  priceListeners.add(fn);
  return () => priceListeners.delete(fn);
}

/**
 * ASSET ROW CHANNEL (price + 24h + 7d + marketcap + metadata)
 */
export function setAssetRow(row) {
  if (!row?.symbol) return;

  const key = String(row.symbol).toUpperCase();
  const prev = assetRowMap.get(key);

  // very cheap duplicate skip (only compares relevant fields)
  if (
    prev &&
    prev.price == row.price &&
    prev.change24h == row.change24h &&
    prev.change7d == row.change7d &&
    prev.marketcap == row.marketcap
  ) {
    return;
  }

  const normalized = {
    symbol: key,
    price: row.price ?? null,
    change24h: row.change24h ?? null,
    change7d: row.change7d ?? null,
    marketcap: row.marketcap ?? null,
    timestamp: row.timestamp ?? null,
    source: row.source ?? null,
  };

  assetRowMap.set(key, normalized);
  saveAssetRowsToSession();

  // Also keep the price channel updated (Ticker depends on it)
  if (normalized.price != null) {
    setPrice(key, normalized.price);
  }

  assetRowListeners.forEach((fn) => {
    try { fn(normalized); } catch (_) {}
  });
}

export function getAssetRow(symbol) {
  if (!symbol) return null;
  return assetRowMap.get(String(symbol).toUpperCase()) ?? null;
}

export function subscribeAssetRows(fn) {
  assetRowListeners.add(fn);
  return () => assetRowListeners.delete(fn);
}

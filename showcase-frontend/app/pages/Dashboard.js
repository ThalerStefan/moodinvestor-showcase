// /frontend/app/pages/Dashboard.js
// Dashboard: Ticker + Metrics + Placeholders for Portfolio/PFG

import { html } from "../utils/dom.js";
import { Card } from "../components/Card.js";
import { PfgGauge } from "../components/PfgGauge.js";
import { getPfgTotal, getDashboardTop5, getAssetsMarketcap, getPortfolioPerformance, getCmcUrl, getAssetImageUrl } from "../services/api.js";
import { fmt } from "../utils/format.js";
import { subscribeAssetRows } from "../store.js";
import { flashPrice } from "../utils/priceFlash.js";

// ----------- HELPER -------------
/**
 * Formats a timestamp string returned by the backend into a label that suits the
 * selected range. Range keys correspond to "1D", "1W", "1M", "1Y" and "ALL".
 * The backend returns ISO-8601 strings which are parsed into Date objects.
 */
function formatLabelForRange(rangeKey, isoTimestamp) {
  const d = new Date(isoTimestamp);
  if (rangeKey === "1D") {
    return d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
  }
  if (rangeKey === "1W") {
    return d.toLocaleDateString("de-AT", { weekday: "short", day: "2-digit" });
  }
  if (rangeKey === "1M") {
    return d.toLocaleDateString("de-AT", { day: "2-digit", month: "short" });
  }
  if (rangeKey === "1Y") {
    return d.toLocaleDateString("de-AT", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("de-AT", { month: "short", year: "numeric" });
}

function zoneLabel(v) {
  if (v <= 20) return "Extreme Angst";
  if (v <= 40) return "Angst";
  if (v < 60) return "Neutral";
  if (v <= 80) return "Gier";
  return "Extreme Gier";
}

function zoneDescription(v) {
  // 0–20: Extreme Fear
  if (v <= 20) {
    return `
      <section class="mi-pfg-analysis">
        <div class="mb-3">
          <h6 class="mb-1">Psychologischer Zustand</h6>
          <p class="mb-0 small">
            Du bist stark verunsichert und fokussierst dich vor allem auf mögliche Verluste.
            Negative Nachrichten wiegen schwerer als Chancen.
          </p>
        </div>

        <div class="mb-3">
          <h6 class="mb-1">Typisches Anlegerverhalten</h6>
          <p class="mb-0 small">
            Positionen werden aus Angst geschlossen, Gewinne früh mitgenommen oder Einstiege ganz ausgelassen.
            Cash-Bestände sind tendenziell hoch.
          </p>
        </div>

        <div class="mb-0 border-top pt-3 mt-2">
          <h6 class="mb-1">Empfehlung</h6>
          <p class="mb-0 small fw-semibold">
            Prüfe, ob deine Entscheidungen auf Fakten oder auf purer Verlustangst beruhen.
            Überlege, ob dein Risikomanagement zu deiner Strategie passt.
          </p>
        </div>
      </section>
    `;
  }

  // 21–40: Fear
  if (v <= 40) {
    return `
      <section class="mi-pfg-analysis">
        <div class="mb-3">
          <h6 class="mb-1">Psychologischer Zustand</h6>
          <p class="mb-0 small">
            Du bist skeptisch und defensiv eingestellt. Du zweifelst an deinen Entscheidungen
            und suchst vermehrt Bestätigung von außen.
          </p>
        </div>

        <div class="mb-3">
          <h6 class="mb-1">Typisches Anlegerverhalten</h6>
          <p class="mb-0 small">
            Du reduzierst Positionen, gehst ungern neue Risiken ein und wartest lieber ab.
            Chancen werden eher verpasst als aktiv genutzt.
          </p>
        </div>

        <div class="mb-0 border-top pt-3 mt-2">
          <h6 class="mb-1">Empfehlung</h6>
          <p class="mb-0 small fw-semibold">
            Überprüfe deine langfristige Strategie und entscheide bewusst,
            statt nur auf aktuelle Schlagzeilen zu reagieren.
          </p>
        </div>
      </section>
    `;
  }

  // 41–60: Neutral
  if (v <= 60) {
    return `
      <section class="mi-pfg-analysis">
        <div class="mb-3">
          <h6 class="mb-1">Psychologischer Zustand</h6>
          <p class="mb-0 small">
            Du bist relativ ausgeglichen und nimmst Marktbewegungen wahr,
            ohne dich stark verunsichern oder euphorisieren zu lassen.
          </p>
        </div>

        <div class="mb-3">
          <h6 class="mb-1">Typisches Anlegerverhalten</h6>
          <p class="mb-0 small">
            Entscheidungen orientieren sich eher an deiner Strategie und weniger an spontanen Impulsen.
            Positionsgrößen bleiben meist konstant.
          </p>
        </div>

        <div class="mb-0 border-top pt-3 mt-2">
          <h6 class="mb-1">Empfehlung</h6>
          <p class="mb-0 small fw-semibold">
            Nutze die relative Gelassenheit, um deine Strategie zu überprüfen
            und klare Regeln für Ein- und Ausstiege festzulegen.
          </p>
        </div>
      </section>
    `;
  }

  // 61–80: Greed
  if (v <= 80) {
    return `
      <section class="mi-pfg-analysis">
        <div class="mb-3">
          <h6 class="mb-1">Psychologischer Zustand</h6>
          <p class="mb-0 small">
            Du bist optimistisch und erwartest steigende Kurse.
            Gewinne stehen klar im Vordergrund, Risiken treten in den Hintergrund.
          </p>
        </div>

        <div class="mb-3">
          <h6 class="mb-1">Typisches Anlegerverhalten</h6>
          <p class="mb-0 small">
            Positionen werden aufgestockt, Gewinne laufen gelassen
            und es werden eher aggressivere Einstiege gewählt.
          </p>
        </div>

        <div class="mb-0 border-top pt-3 mt-2">
          <h6 class="mb-1">Empfehlung</h6>
          <p class="mb-0 small fw-semibold">
            Prüfe deine Positionsgrößen und dein Risikolimit.
            Frage dich, ob du auch dann zufrieden wärst, wenn der Markt kurzfristig gegen dich läuft.
          </p>
        </div>
      </section>
    `;
  }

  // 81–100: Extreme Greed
  return `
    <section class="mi-pfg-analysis">
      <div class="mb-3">
        <h6 class="mb-1">Psychologischer Zustand</h6>
        <p class="mb-0 small">
          Du gehst davon aus, dass der Markt weiter stark steigen wird.
          Warnsignale werden leicht ausgeblendet, das Vertrauen in den Trend ist sehr hoch.
        </p>
      </div>

      <div class="mb-3">
        <h6 class="mb-1">Typisches Anlegerverhalten</h6>
        <p class="mb-0 small">
          Hohe Hebel, große Positionsgrößen und spätes Nachkaufen in bereits stark gelaufene Märkte
           sind in dieser Phase typisch.
        </p>
      </div>

      <div class="mb-0 border-top pt-3 mt-2">
        <h6 class="mb-1">Empfehlung</h6>
        <p class="mb-0 small fw-semibold">
          Überprüfe, ob dein Risiko noch zu deiner finanziellen Situation passt.
          Definiere klare Exit-Regeln, statt nur auf weiter steigende Kurse zu vertrauen.
        </p>
      </div>
    </section>
  `;
}


// ---------- View ----------
export function DashboardPage() {
  const page = html`<div class="vstack gap-3 mt-3"></div>`;

  // --- State for Asset-Pagination ---
  let assetData = [];
  let assetRowsPerPage = 10;
  let assetCurrentPage = 1;

  // Small in-memory cache
  const cmcUrlCache = new Map();
  const imageUrlCache = new Map();

  /**
   * Original order + sort/filter state
   * Key: "symbol", "name", "price", "change24h", "change7d", "marketcap"
   * sortDir: 0 = none, 1 = asc, -1 = desc
   */
  let assetDataOriginal = [];
  let assetSearchTerm = "";
  let assetSortKey = null;
  let assetSortDir = 0;

  // Sort configuration
  const ASSET_SORT_KEYS = {
    symbol: { type: "text" },
    name: { type: "text" },
    price: { type: "num" },
    change24h: { type: "num" },
    change7d: { type: "num" },
    marketcap: { type: "num" },
  };

  // Sort-icon helper
  function sortIconClass(dir) {
    if (dir === 1) {
      return "fa-solid fa-sort-up";
    }
    if (dir === -1) {
      return "fa-solid fa-sort-down";
    }
    return "fa-solid fa-sort";
  }

  // null-save getters for sorting
  function getSortValue(row, key) {
    if (!row) return null;
    const v = row[key];
    if (v == null) return null;
    return v;
  }

  // compare helper (text/num)
  function compareValues(a, b, type) {
    const aNull = a == null || a === "";
    const bNull = b == null || b === "";
    if (aNull && bNull) return 0;
    if (aNull) return 1;
    if (bNull) return -1;

    if (type === "num") {
      const aNumeric = Number(a);
      const bNumeric = Number(b);
      const aBad = !Number.isFinite(aNumeric);
      const bBad = !Number.isFinite(bNumeric);

      if (aBad && bBad) return 0;
      if (aBad) return 1;
      if (bBad) return -1;
      return aNumeric - bNumeric;
    }

    // text
    return String(a).localeCompare(String(b), "de-AT", { sensitivity: "base" });
  }

  // Apply search + sort, return view list
  function buildAssetViewList() {
    const base = Array.isArray(assetDataOriginal) ? assetDataOriginal : [];

    const term = String(assetSearchTerm || "").trim().toLowerCase();
    let filtered = base;

    if (term) {
      filtered = base.filter((r) => {
        const sym = String(r?.symbol ?? "").toLowerCase();
        const name = String(r?.name ?? "").toLowerCase();

        //option to extend for searching in numeric fields

        return sym.includes(term) || name.includes(term);
      });
    }

    if (!assetSortKey || assetSortDir === 0) {
      return filtered;
    }

    const cfg = ASSET_SORT_KEYS[assetSortKey] || { type: "text" };
    const dir = assetSortDir;

    // stable sort: decorate - sort - undecorate
    const decorated = filtered.map((row, idx) => ({ row, idx }));
    decorated.sort((x, y) => {
      const ax = getSortValue(x.row, assetSortKey);
      const by = getSortValue(y.row, assetSortKey);
      const c = compareValues(ax, by, cfg.type);
      if (c !== 0) {
        return c * dir;
      }
      return x.idx - y.idx;
    });

    return decorated.map((d) => d.row);
  }

  async function getImageUrlForSymbol(symbol) {
    const sym = String(symbol || "").trim().toUpperCase();
    if (!sym) return null;

    if (imageUrlCache.has(sym)) return imageUrlCache.get(sym);

    try {
      const url = await getAssetImageUrl(sym);
      const clean = (typeof url === "string" ? url.trim() : "");
      imageUrlCache.set(sym, clean || null);
      return clean || null;
    } catch (e) {
      imageUrlCache.set(sym, null);
      console.warn(`Image URL lookup failed for ${sym}:`, e);
      return null;
    }
  }

  // Prefetch images for a list of symbols
  async function preloadAssetImages(symbols, { concurrency = 8 } = {}) {
    const uniq = Array.from(
      new Set((symbols || []).map(s => String(s || "").trim().toUpperCase()).filter(Boolean))
    );

    let i = 0;
    async function worker() {
      while (i < uniq.length) {
        const sym = uniq[i++];
        if (imageUrlCache.has(sym)) continue;
        await getImageUrlForSymbol(sym);
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, uniq.length) }, () => worker());
    await Promise.all(workers);
  }

  // CMC-URL opener
  async function openCmcForSymbol(symbol) {
    const sym = String(symbol || "").trim().toUpperCase();
    if (!sym) {
      return;
    }

    try {
      if (cmcUrlCache.has(sym)) {
        const cached = cmcUrlCache.get(sym);
        if (cached) {
          window.open(cached, "_blank", "noopener");
        }
        return;
      }

      const url = await getCmcUrl(sym);
      const clean = (typeof url === "string" ? url.trim() : "");
      if (clean) {
        cmcUrlCache.set(sym, clean);
        window.open(clean, "_blank", "noopener");
      } else {
        cmcUrlCache.set(sym, null);
        console.warn(`No official CMC URL returned for symbol ${sym}`)
      }
    } catch (e) {
      cmcUrlCache.set(sym, null);
      console.warn(`Failed to load official CMC URL for ${sym}:`, e)
    }
  }

  // Store latest price per symbol
  const lastPriceBySymbol = new Map();

  // Live price patching: update only visible price cells in the asset table
  // If price up - flash up; if price down - flash down
  function patchAssetPrice(symbol, price) {
    const sym = String(symbol || "").trim().toUpperCase();
    if (!sym) return;

    const newNum = Number(price);
    if (!Number.isFinite(newNum)) return;

    const prev = lastPriceBySymbol.get(sym);
    lastPriceBySymbol.set(sym, newNum);

    let direction = null;
    if (prev != null) {
      if (newNum > prev) {
        direction = "up";
      } else if (newNum < prev) {
        direction = "down";
      }
    }

    page.querySelectorAll(`[data-price-symbol="${sym}"]`).forEach((el) => {
      el.textContent = fmt.money(newNum);
      if (direction) {
        flashPrice(el, direction);
      }
    });
  }

  function applySignedColor(el, value) {
    if (!el) return;
    el.classList.remove("text-success", "text-danger");

    const num = Number(value);
    if (!Number.isFinite(num)) return;

    if (num > 0) el.classList.add("text-success");
    else if (num < 0) el.classList.add("text-danger");
  }

  function patchAssetRow(row) {
    const sym = String(row?.symbol || "").trim().toUpperCase();
    if (!sym) return;

    // price (existing flash logic)
    patchAssetPrice(sym, row.price);

    // 24h
    page.querySelectorAll(`[data-ch24-symbol="${sym}"]`).forEach((el) => {
      el.textContent = fmt.pct(row.change24h);
      applySignedColor(el, row.change24h);
    });

    // 7d
    page.querySelectorAll(`[data-ch7-symbol="${sym}"]`).forEach((el) => {
      el.textContent = fmt.pct(row.change7d);
      applySignedColor(el, row.change7d);
    });

    // marketcap
    page.querySelectorAll(`[data-mcap-symbol="${sym}"]`).forEach((el) => {
      el.textContent = fmt.moneyRounded(row.marketcap);
    });
  }


  // Subscribe once per Dashboard mount
  const unsubscribeAssetRows = subscribeAssetRows((row) => {
    patchAssetRow(row);
  });

  page.destroy = () => unsubscribeAssetRows();




  // ===== TOP-ROW =====
  const rowTop = html`<div id="row-top" class="row g-3 align-items-stretch"></div>`;

  // LEFT: Chart + Top-5
  const leftCol = html`<div id="leftCol" class="col-lg-7 d-flex flex-column gap-3"></div>`;

  const chartBodyEl = html`
    <div id="chartBody" class="d-flex flex-column gap-2">
      <div class="d-flex flex-wrap align-items-center gap-2">
        
          <button class="btn btn-sm btn-outline-primary" data-range="1D">1 Day</button>
          <button class="btn btn-sm btn-outline-primary active" data-range="1W">1 Week</button>
          <button class="btn btn-sm btn-outline-primary" data-range="1M">1 Month</button>
          <button class="btn btn-sm btn-outline-primary" data-range="1Y">1 Year</button>
          <button class="btn btn-sm btn-outline-primary" data-range="ALL">Overall</button>
        
        <div class="ms-auto text-end">
          <div class="small text-secondary">Gesamtwert</div>
          <div id="portfolioTotal" class="fs-5 fw-bold">-</div>
        </div>
      </div>

      <div class="mi-chart-wrapper">
        <canvas id="portfolioChart" aria-label="Portfolio Performance"></canvas>
      </div>
    </div>
  `;
  const chartCard = Card({ title: "Portfolio-Performance", body: chartBodyEl });

  const topBody = html`
    <div id="topBody" class="table-responsive">
      <table class="table table-sm align-middle table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Symbol</th>
            <th>Name</th>
            <th class="text-end">Menge</th>
            <th class="text-end">Wert</th>
          </tr>
        </thead>
        <tbody id="top5Rows">
          <tr><td colspan="5" class="text-center py-4 text-muted">Lade Top-Positionen…</td></tr>
        </tbody>
      </table>
    </div>
  `;
  const topCard = Card({ title: "Top-5 Positionen (nach Marktwert)", body: topBody });

  leftCol.append(chartCard, topCard);

  // RIGHT: Gauge + Explanation
  const rightCol = html`<div class="col-lg-5 d-flex flex-column gap-3"></div>`;
  const gaugeShell = html`<div class="d-flex justify-content-center py-2"></div>`;
  const gauge = PfgGauge({ value: 50, size: 337 });
  gaugeShell.append(gauge);
  const gaugeCard = Card({ title: "Personal Fear & Greed Index", body: gaugeShell });

  // The value comes exclusively in #pfgZone (see getPfgTotal())
  const explainBody = html`
    <div class="small">
      <div class="mb-2">
        Aktuelle Zone: <strong><span id="pfgZone">-</span></strong>
      </div>
    
      <div id="pfgExplain"></div>

      

    </div>
  `;
  const explainCard = Card({ title: "Was bedeutet der aktuelle Bereich?", body: explainBody });

  rightCol.append(gaugeCard, explainCard);
  rowTop.append(leftCol, rightCol);
  page.append(rowTop);

  // ===== Buttons =====
  const actions = html`
    <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between">
      <div class="d-flex flex-wrap gap-2 justify-content-start">
        <button class="btn btn-outline-primary btn-sm" id="btnNewTxn"><i class="fa-solid fa-plus"></i> Transaktion</button>
        <button class="btn btn-outline-primary btn-sm" id="btnNewEmotion"><i class="fa-solid fa-plus"></i> Emotion-Log</button>
        <button class="btn btn-outline-primary btn-sm" id="btnAcademy"><i class="fa-solid fa-graduation-cap"></i> MoodInvestor-Academy</button>
      </div>

      <div class="ms-auto d-flex align-items-center gap-2">
        <i class="fa-solid fa-magnifying-glass text-secondary"></i>
        <input id="assetSearch" type="search" class="form-control form-control-sm" placeholder="Suche..." style="max-width: 320px;" aria-label="Assets durchsuchen" />
      </div>
    </div>
  `;
  page.append(actions);

  // ===== Asset-Liste =====
  const allAssetsBody = html`
  <div>
    <div id="allAssetsBody" class="table-responsive mb-2">
      <table class="table table-sm align-middle table-hover">
        <thead>
          <tr>
            <th>#</th>

            <th></th>

            <th class="mi-sortable" data-sort-key="symbol" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Symbol">
              <i class="fa-solid fa-sort" data-sort-icon="symbol"></i> Symbol
            </th>

            <th class="mi-sortable" data-sort-key="name" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Name">
              <i class="fa-solid fa-sort" data-sort-icon="name"></i> Name
            </th>

            <th></th>

            <th class="text-end mi-sortable" data-sort-key="price" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Preis">
              <i class="fa-solid fa-sort" data-sort-icon="price"></i> Preis
            </th>

            <th class="text-end mi-sortable" data-sort-key="change24h" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach 24h Änderung">
              <i class="fa-solid fa-sort" data-sort-icon="change24h"></i> 24h
            </th>

            <th class="text-end mi-sortable" data-sort-key="change7d" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach 7d Änderung">
              <i class="fa-solid fa-sort" data-sort-icon="change7d"></i> 7d
            </th>

            <th class="text-end mi-sortable" data-sort-key="marketcap" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Marketcap">
              <i class="fa-solid fa-sort" data-sort-icon="marketcap"></i> Marketcap
            </th>
          </tr>
        </thead>
        <tbody id="assetRows">
          <tr>
            <td colspan="9" class="text-center py-4 text-muted">
              Lade Assets...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-2">
      <div id="assetPageInfo" class="small">
        Zeige 0 bis 0 von 0 Assets
      </div>
      <div class="d-flex align-items-center gap-2">
        <nav aria-label="Asset-Seiten">
          <ul class="pagination pagination-sm mb-0 pageNav" id="assetPageNav"></ul>
        </nav>
        <label for="assetRowsPerPage" class="form-label mb-0 small">
          Zeilen pro Seite:
        </label>
        <select id="assetRowsPerPage" class="form-select form-select-sm w-auto">
          <option value="10" selected>10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
</div>
  `;
  const allAssetsCard = Card({ title: "Alle verfügbaren Assets", body: allAssetsBody })
  page.append(allAssetsCard);

  const assetTbody = page.querySelector("#assetRows");
  const assetPageInfoEl = page.querySelector("#assetPageInfo");
  const assetPageNavEl = page.querySelector("#assetPageNav");
  const assetRowsPerPageEl = page.querySelector("#assetRowsPerPage");

  // DOM refs for search + sort header
  const assetSearchEl = page.querySelector("#assetSearch");
  const assetThead = page.querySelector("#allAssetsBody thead");

  // ===== Load data / wire up =====

  // Load the Personal Fear & Greed Index and update the gauge and explanation
  async function loadPfg() {
    try {
      const { value } = await getPfgTotal();
      const fresh = PfgGauge({ value, size: 375 });
      gauge.replaceWith(fresh);
      page.querySelector("#pfgZone").textContent = `${zoneLabel(value)} (${value})`;
      page.querySelector("#pfgExplain").innerHTML = zoneDescription(value);
    } catch (e) {
      console.error("Failed to load PFG:", e);
    }
  }

  // Load Top-5 psoitions and portfolio performance for a given range,
  // then render chart and table
  async function loadTop5AndPerformance(range) {

    // Default range falls back to "1W" if none provided
    const chosenRange = range || "1W";
    try {
      const [top5, perf] = await Promise.all([
        getDashboardTop5(),
        getPortfolioPerformance(chosenRange),
      ]);

      renderTop5(top5);
      renderPerformance(chosenRange, perf);
    } catch (e) {
      console.error("Failed to load Top-5 or performance:", e);
    }
  }

  // Load the full asset table from backend
  async function loadAssets() {
    assetData = [];
    assetDataOriginal = [];
    assetCurrentPage = 1;

    // search / sort hardreset on reload
    assetSearchTerm = "";
    assetSortKey = null;
    assetSortDir = 0;

    try {
      const assets = await getAssetsMarketcap();
      assetData = Array.isArray(assets) ? assets : [];
      assetDataOriginal = assetData.slice(); // remember original order

      for (const a of assetDataOriginal) {
        const sym = String(a?.symbol || "").trim().toUpperCase();
        const p = Number(a?.price);
        if (sym && Number.isFinite(p) && !lastPriceBySymbol.has(sym)) {
          lastPriceBySymbol.set(sym, p);
        }
      }


      renderAssetTable();
      updateAssetSortIcons();

      // preload ALL images once (background), then re-render once
      preloadAssetImages(assetDataOriginal.map(a => a.symbol), { concurrency: 8 })
        .then(() => {
          if (assetTbody?.isConnected) {
            renderAssetTable();
          }
        })
        .catch((e) => console.warn("Asset image preload failed:", e));

    } catch (e) {
      console.error("Failed to load assets:", e);
      assetData = [];
      assetDataOriginal = [];
      renderAssetTable();
      updateAssetSortIcons();
    }
  }

  // Kick off initial data loads
  loadPfg();

  // Default chart range = 1 Week
  loadTop5AndPerformance("1W");
  loadAssets();

  // Setup range button click handlers to reload Top-5 and performance for selected range
  chartCard.querySelectorAll("[data-range]").forEach((btn) => {
    btn.addEventListener("click", () => {
      chartCard.querySelectorAll("[data-range]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const range = btn.getAttribute("data-range");
      loadTop5AndPerformance(range);
    });
  });

  // Buttons
  actions.querySelector("#btnNewTxn")?.addEventListener("click", () => {
    history.pushState({}, "", "/frontend/transactions?new=1");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  actions.querySelector("#btnNewEmotion")?.addEventListener("click", () => {
    history.pushState({}, "", "/frontend/emotions?new=1");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  actions.querySelector("#btnAcademy")?.addEventListener("click", () => {
    history.pushState({}, "", "/frontend/academy");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });


  // --- Asset-Pagination Events ---
  assetRowsPerPageEl.addEventListener("change", () => {
    assetRowsPerPage = Number(assetRowsPerPageEl.value) || 10;
    assetCurrentPage = 1;
    renderAssetTable();
  });

  assetPageNavEl.addEventListener("click", (ev) => {
    ev.preventDefault();
    const a = ev.target.closest("a");
    if (!a) return;
    const page = Number(a.dataset.page);
    if (!Number.isFinite(page)) return;
    assetCurrentPage = page;
    renderAssetTable();
  });

  // search input - filter table
  assetSearchEl?.addEventListener("input", () => {
    assetSearchTerm = assetSearchEl.value || "";
    assetCurrentPage = 1;
    renderAssetTable();
  });

  // sort header click + keyboard support
  function cycleSortForKey(key) {
    if (!ASSET_SORT_KEYS[key]) return;

    if (assetSortKey !== key) {
      assetSortKey = key;
      assetSortDir = 1;  // first click = asc
    } else {
      // same key - cycle asc - desc - none
      if (assetSortDir === 1) {
        assetSortDir = -1;
      } else if (assetSortDir === -1) {
        assetSortDir = 0;
        assetSortKey = null;
      } else {
        assetSortDir = 1;
      }
    }

    assetCurrentPage = 1;
    updateAssetSortIcons();
    renderAssetTable();
  }

  function updateAssetSortIcons() {
    // set all to "none"
    Object.keys(ASSET_SORT_KEYS).forEach((k) => {
      const icon = page.querySelector(`[data-sort-icon="${k}"]`);
      if (!icon) return;

      icon.className = sortIconClass(0);
    });

    if (assetSortKey && assetSortDir !== 0) {
      const active = page.querySelector(`[data-sort-icon="${assetSortKey}"]`);
      if (active) {
        active.className = sortIconClass(assetSortDir);
      }
    }
  }

  assetThead?.addEventListener("click", (ev) => {
    const th = ev.target.closest("th[data-sort-key]");
    if (!th) return;
    const key = th.getAttribute("data-sort-key");
    cycleSortForKey(key);
  });

  assetThead.addEventListener("keydown", (ev) => {
    const isEnter = ev.key === "Enter";
    const isSpace = ev.key === " " || ev.key === "Spacebar";
    if (!isEnter && !isSpace) return;

    const th = ev.target.closest("th[data-sort-key]");
    if (!th) return;

    ev.preventDefault();
    const key = th.getAttribute("data-sort-key");
    cycleSortForKey(key);
  });


  // --------------- Rendering functions ------------------

  function renderTop5(list) {
    const tbody = page.querySelector("#top5Rows");
    tbody.innerHTML = "";
    const rows = Array.isArray(list) ? list : [];
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Keine Positionen gefunden.</td></tr>`;
      return;
    }
    rows.forEach((r, idx) => {
      const qty = Number(r.quantity ?? r.qty ?? 0);
      const val = Number(r.value ?? 0);
      const tr = html`
        <tr>
          <td>${idx + 1}</td>
          <td>${r.symbol}</td>
          <td>${r.name}</td>
          <td class="text-end">${fmt.qty(qty)}</td>
          <td class="text-end">${fmt.smartMoney(val)}</td>
        </tr>
      `;
      tbody.append(tr);
    });
  }

  function renderPerformance(rangeKey, perf) {
    const ctx = page.querySelector("#portfolioChart");
    const labels = (perf?.timestamps || []).map((ts) => formatLabelForRange(rangeKey, ts));
    const data = (perf?.values || []).map((v) => Number(v));

    // Update total value display
    const totalEl = page.querySelector("#portfolioTotal");
    if (totalEl) {
      const totalNum = Number(perf?.total ?? 0);
      totalEl.textContent = fmt.moneyRounded(totalNum);
    }

    // Destroy previous chart instance if exists
    if (renderPerformance._chart) {
      renderPerformance._chart.destroy();
    }

    if (!window.Chart) {
      console.error("Chart.js not loaded: window.Chart is undefined");
    }

    renderPerformance._chart = new window.Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Portfolio-Wert (aggregiert)",
          data,
          tension: 0.25,
          pointRadius: 2,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--bs-body-color').trim(),
            },
            grid: {
              color: getComputedStyle(document.body).getPropertyValue('--bs-border-color').trim(),
            },
          },
          y: {
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--bs-body-color').trim(),
              callback: (v) => fmt.moneyRounded(v),
            },
            grid: {
              color: getComputedStyle(document.body).getPropertyValue('--bs-border-color').trim(),
            },
          },
        },
        plugins: {
          legend: {
            display: false,
            labels: {
              color: getComputedStyle(document.body).getPropertyValue('--bs-body-color').trim(),
            },
          },
        },
      },
    });
  }

  function renderAssetPagination(viewList) {
    const total = viewList.length;
    const totalPages = Math.max(1, Math.ceil(total / assetRowsPerPage));
    const start = total === 0 ? 0 : (assetCurrentPage - 1) * assetRowsPerPage + 1;
    const end = Math.min(assetCurrentPage * assetRowsPerPage, total);

    assetPageInfoEl.textContent = `Zeige ${start} bis ${end} von ${total} Assets`;
    assetPageNavEl.innerHTML = "";

    const makeLi = (label, pageNum, { disabled = false, active = false } = {}) => {
      const li = document.createElement("li");
      li.className = `page-item${disabled ? " disabled" : ""}${active ? " active" : ""}`;
      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.textContent = label;
      if (!disabled) {
        a.dataset.page = String(pageNum);
      }
      li.appendChild(a);
      return li;
    };

    // Back
    assetPageNavEl.appendChild(makeLi("Zurück", assetCurrentPage - 1, { disabled: assetCurrentPage === 1 }));

    const totalPagesLocal = totalPages;
    const startPage = Math.max(1, assetCurrentPage - 2);
    const endPage = Math.min(totalPagesLocal, assetCurrentPage + 2);

    if (startPage > 1) {
      assetPageNavEl.appendChild(makeLi("1", 1, { active: 1 === assetCurrentPage }));
      if (startPage > 2) {
        const liDots = document.createElement("li");
        liDots.className = "page-item disabled";
        liDots.innerHTML = '<span class="page-link">...</span>';
        assetPageNavEl.appendChild(liDots);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      assetPageNavEl.appendChild(makeLi(String(p), p, { active: p === assetCurrentPage }));
    }

    if (endPage < totalPagesLocal) {
      if (endPage < totalPagesLocal - 1) {
        const liDots2 = document.createElement("li");
        liDots2.className = "page-item disabled";
        liDots2.innerHTML = '<span class="page-link">...</span>';
        assetPageNavEl.appendChild(liDots2);
      }
      assetPageNavEl.appendChild(makeLi(String(totalPagesLocal), totalPagesLocal, { active: totalPagesLocal === assetCurrentPage }));
    }

    // Next
    assetPageNavEl.appendChild(makeLi("Weiter", assetCurrentPage + 1, { disabled: assetCurrentPage === totalPagesLocal }));
  }


  async function renderAssetTable() {
    assetTbody.innerHTML = "";

    // Build view list (search + sort)
    const viewList = buildAssetViewList();
    const total = viewList.length;

    if (!total) {
      assetTbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-4 text-muted">
            Keine Assets gefunden.
          </td>
        </tr>
      `;
      renderAssetPagination(viewList);
      return;
    }

    const totalPages = Math.max(1, Math.ceil(total / assetRowsPerPage));
    if (assetCurrentPage > totalPages) assetCurrentPage = totalPages;
    if (assetCurrentPage < 1) assetCurrentPage = 1;

    const start = (assetCurrentPage - 1) * assetRowsPerPage;
    const end = Math.min(start + assetRowsPerPage, total);
    const slice = viewList.slice(start, end);

    slice.forEach((row, idx) => {
      const globalIndex = start + idx;

      // Determine CSS class based on 24h and 7d change values from backend
      const ch24Class = row.change24h != null ? (row.change24h >= 0 ? "text-success" : "text-danger") : "";
      const ch7Class = row.change7d != null ? (row.change7d >= 0 ? "text-success" : "text-danger") : "";

      const sym = String(row.symbol || "").trim().toUpperCase();
      const imgUrl = imageUrlCache.get(sym) || null;

      const IMG_FALLBACK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

      const seed = Number(row.price);
      if (Number.isFinite(seed) && !lastPriceBySymbol.has(sym)) {
        lastPriceBySymbol.set(sym, seed);
      }

      const tr = html`
        <tr>
          <td>${globalIndex + 1}</td>
          <td>
            <img data-asset-img="${sym}" src="${imgUrl || IMG_FALLBACK}" alt="${row.symbol}" width="25" height="25" loading="lazy" style="border-radius:50%; object-fit:cover;" />
          </td>
          <td><a href="#" data-symbol="${row.symbol}">${row.symbol}</a></td>
          <td>${row.name}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" data-goto-txn="${row.symbol}">
              <i class="fa-solid fa-plus"></i> Trans.
            </button>
          </td>

          <td class="text-end" data-price-symbol="${sym}">
            ${fmt.money(row.price)}
          </td>

          <td class="text-end ${ch24Class}" data-ch24-symbol="${sym}">
            ${fmt.pct(row.change24h)}
          </td>
          <td class="text-end ${ch7Class}" data-ch7-symbol="${sym}">
            ${fmt.pct(row.change7d)}
          </td>
          <td class="text-end" data-mcap-symbol="${sym}">
            ${fmt.moneyRounded(row.marketcap)}
          </td>
        </tr>
      `;

      // uses in-memory cache for url
      const symbolLink = tr.querySelector("a[data-symbol]");
      if (symbolLink) {
        symbolLink.addEventListener("click", (ev) => {
          ev.preventDefault();
          const symbol = symbolLink.getAttribute("data-symbol");
          openCmcForSymbol(symbol);
        });
      }

      // Transaction button navigation
      tr.querySelector("[data-goto-txn]")?.addEventListener("click", () => {
        const path = `/frontend/transactions?new=1&asset=${encodeURIComponent(row.symbol)}`;
        history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });

      assetTbody.append(tr);
    });

    renderAssetPagination(viewList);
  }

  updateAssetSortIcons();

  return page;
}
// TransactionTable.js

import { html } from "../utils/dom.js";
import { Card } from "../components/Card.js";
import { fmt } from "../utils/format.js";
import { getTxns, getApiBase, getTxnStats, getCmcUrl } from "../services/api.js";
import { subscribeAssetRows } from "../store.js";
import { flashPrice } from "../utils/priceFlash.js";

export function createTransactionTable({ assets = [], onNew, onUpdate, onError } = {}) {
  let allTxns = [];
  let selectedIds = new Set();
  let rowsPerPage = 10;
  let currentPage = 1;

  let statsRows = [];
  let statsRowsPerPage = 5;
  let statsCurrentPage = 1;

  // ----- Search / Sort State (Dashboard-like) -----
  let txnSearchTerm = "";
  let txnSortKey = null;
  let txnSortDir = 0; // 0 none, 1 asc, -1 desc

  let statsSearchTerm = "";
  let statsSortKey = null;
  let statsSortDir = 0;

  // Small in-memory cache (CMC URL)
  const cmcUrlCache = new Map();

  // Price memory for flash direction in stats
  const lastStatsPriceBySymbol = new Map();

  // Mappings assetId -> Asset
  const assetMap = new Map();
  for (const a of assets) {
    const id = a.assetId != null ? a.assetId : a.id;
    if (id != null) assetMap.set(Number(id), a);
  }

  // Mapping: SYMBOL -> assetId
  const symbolToId = new Map();
  for (const a of assets) {
    const sym = String(a.symbol || a.assetSymbol || "").toUpperCase();
    const id = a.assetId != null ? Number(a.assetId) : Number(a.id);
    if (sym && !Number.isNaN(id)) symbolToId.set(sym, id);
  }

  // Get assetId for a tx
  function getTxAssetId(tx) {
    if (!tx) return null;
    if (tx.assetId != null) return Number(tx.assetId);
    if (tx.idAsset != null) return Number(tx.idAsset);
    if (tx.asset?.assetId != null) return Number(tx.asset.assetId);
    if (tx.asset?.id != null) return Number(tx.asset.id);

    const sym = String(
      tx.symbol || tx.assetSymbol || tx.asset?.symbol || tx.asset?.assetSymbol || ""
    ).toUpperCase();
    if (sym && symbolToId.has(sym)) return symbolToId.get(sym);
    return null;
  }

  // Sort icon helper (same idea as Dashboard)
  function sortIconClass(dir) {
    if (dir === 1) return "fa-solid fa-sort-up";
    if (dir === -1) return "fa-solid fa-sort-down";
    return "fa-solid fa-sort";
  }

  function compareValues(a, b, type) {
    const aNull = a == null || a === "";
    const bNull = b == null || b === "";
    if (aNull && bNull) return 0;
    if (aNull) return 1;
    if (bNull) return -1;

    if (type === "num") {
      const an = Number(a);
      const bn = Number(b);
      const aBad = !Number.isFinite(an);
      const bBad = !Number.isFinite(bn);
      if (aBad && bBad) return 0;
      if (aBad) return 1;
      if (bBad) return -1;
      return an - bn;
    }

    // text
    return String(a).localeCompare(String(b), "de-AT", { sensitivity: "base" });
  }

  function normalizeSearchTerm(v) {
    return String(v ?? "").trim().toLowerCase();
  }

  // Normalize date for searching:
  // - ISO as given
  // - de-AT date + dateTime variants
  function dateSearchTokens(isoTs) {
    if (!isoTs) return "";
    const d = new Date(isoTs);
    if (Number.isNaN(d.getTime())) return String(isoTs);

    const deDate = d.toLocaleDateString("de-AT"); // e.g. 28.12.2025
    const deDate2 = d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }); // 28.12.
    const deDateTime = d.toLocaleString("de-AT"); // includes time
    const iso = String(isoTs);
    return `${iso} ${deDate} ${deDate2} ${deDateTime}`;
  }

  // Build a "searchIndex" for a tx row
  function buildTxnSearchIndex(tx) {
    const aid = getTxAssetId(tx);
    const asset = (aid != null ? assetMap.get(aid) : null) || {};
    const symbol = asset.symbol || tx.symbol || tx.assetSymbol || asset.assetSymbol || (tx.asset && (tx.asset.symbol || tx.asset.assetSymbol)) || "";
    const name = asset.name || asset.assetName || "";

    const side = String(tx.side || "").toUpperCase();
    const qty = Number(tx.quantity);
    const price = Number(tx.price);
    const total = Number.isFinite(qty) && Number.isFinite(price) ? qty * price : "";
    const pfg = Number(tx.pfgValue ?? tx.pfg ?? "");

    // Make numbers searchable even if user types "0.1" or "10000"
    const numTokens = [
      Number.isFinite(qty) ? String(qty) : "",
      Number.isFinite(price) ? String(price) : "",
      Number.isFinite(total) ? String(total) : "",
      Number.isFinite(pfg) ? String(pfg) : "",
    ].join(" ");

    return normalizeSearchTerm(
      [
        dateSearchTokens(tx.timestamp),
        symbol,
        name,
        side,
        numTokens,
      ].join(" ")
    );
  }

  // Build searchIndex for stats row
  function buildStatsSearchIndex(r) {
    const sym = String(r?.symbol ?? "");
    const name =
      (r.asset && (r.asset.name || r.asset.assetName)) ||
      "";

    const tokens = [
      sym,
      name,
      r.currentPrice != null ? String(r.currentPrice) : "",
      r.weightedPfg != null ? String(r.weightedPfg) : "",
      r.currentQty != null ? String(r.currentQty) : "",
      r.avgBuyPrice != null ? String(r.avgBuyPrice) : "",
    ].join(" ");

    return normalizeSearchTerm(tokens);
  }

  // Dashboard-like stable sort helper
  function stableSort(list, key, dir, type, getValue) {
    if (!key || dir === 0) return list;

    const decorated = list.map((row, idx) => ({ row, idx }));
    decorated.sort((x, y) => {
      const ax = getValue(x.row, key);
      const by = getValue(y.row, key);
      const c = compareValues(ax, by, type);
      if (c !== 0) return c * dir;
      return x.idx - y.idx;
    });
    return decorated.map((d) => d.row);
  }

  // ----- Sort Config -----
  const TXN_SORT_KEYS = {
    timestamp: { type: "num" }, // compare Date.getTime()
    symbol: { type: "text" },
    side: { type: "text" },
    quantity: { type: "num" },
    price: { type: "num" },
    total: { type: "num" },
    pfg: { type: "num" },
  };

  const STATS_SORT_KEYS = {
    symbol: { type: "text" },
    name: { type: "text" },
    currentPrice: { type: "num" },
    weightedPfg: { type: "num" },
    currentQty: { type: "num" },
    avgBuyPrice: { type: "num" },
  };

  function cycleSort(currentKey, currentDir, newKey) {
    // returns { key, dir }
    if (currentKey !== newKey) {
      return { key: newKey, dir: 1 };
    }
    if (currentDir === 1) return { key: newKey, dir: -1 };
    if (currentDir === -1) return { key: null, dir: 0 };
    return { key: newKey, dir: 1 };
  }

  // ----- CMC URL opener (cached) -----
  async function openCmcForSymbol(symbol) {
    const sym = String(symbol || "").trim().toUpperCase();
    if (!sym) return;

    try {
      if (cmcUrlCache.has(sym)) {
        const cached = cmcUrlCache.get(sym);
        if (cached) window.open(cached, "_blank", "noopener");
        return;
      }

      const url = await getCmcUrl(sym);
      const clean = (typeof url === "string" ? url.trim() : "");
      if (clean) {
        cmcUrlCache.set(sym, clean);
        window.open(clean, "_blank", "noopener");
      } else {
        cmcUrlCache.set(sym, null);
        console.warn(`No official CMC URL returned for symbol ${sym}`);
      }
    } catch (e) {
      cmcUrlCache.set(sym, null);
      console.warn(`Failed to load official CMC URL for ${sym}:`, e);
    }
  }

  // ----- Root element -----
  const root = html`<div class="vstack gap-4"></div>`;

 
  //  STATISTICS (TOP)


  const statsHeaderRow = html`
    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
      <div class="ms-auto d-flex align-items-center gap-2">
        <i class="fa-solid fa-magnifying-glass text-secondary"></i>
        <input id="statsSearch" type="search" class="form-control form-control-sm" placeholder="Suchen..." style="max-width: 320px;" aria-label="Statistik durchsuchen" />
      </div>
    </div>
  `;

  const statsTable = html`
    <table class="table table-sm align-middle table-hover mb-0">
      <thead>
        <tr>
          <th style="width: 3%;">#</th>

          <th class="mi-sortable" data-stats-sort-key="symbol" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Asset">
            <i class="fa-solid fa-sort" data-stats-sort-icon="symbol"></i> Asset
          </th>

          <th class="mi-sortable" data-stats-sort-key="currentPrice" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach aktuellem Preis">
            <i class="fa-solid fa-sort" data-stats-sort-icon="currentPrice"></i> Aktueller Preis
          </th>

          <th class="mi-sortable" data-stats-sort-key="weightedPfg" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Ø PFG">
            <i class="fa-solid fa-sort" data-stats-sort-icon="weightedPfg"></i> Ø PFG
          </th>

          <th class="text-end mi-sortable" data-stats-sort-key="currentQty" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Bestand">
            <i class="fa-solid fa-sort" data-stats-sort-icon="currentQty"></i> Bestand
          </th>

          <th class="text-end mi-sortable" data-stats-sort-key="avgBuyPrice" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Ø Kaufpreis">
            <i class="fa-solid fa-sort" data-stats-sort-icon="avgBuyPrice"></i> Ø Kaufpreis
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;
  const statsTableBody = statsTable.querySelector("tbody");

  const statsPaginationBar = html`
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-2">
      <div id="statsPageInfo" class="small">Zeige 0 bis 0 von 0 Assets</div>
      <div class="d-flex align-items-center gap-2">
        <nav aria-label="Asset-Seiten">
          <ul class="pagination pagination-sm mb-0" id="statsPageNav"></ul>
        </nav>
        <label for="statsRowsPerPage" class="form-label mb-0 small">Zeilen pro Seite:</label>
        <select id="statsRowsPerPage" class="form-select form-select-sm w-auto">
          <option value="5" selected>5</option>
          <option value="10">10</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  `;

  const statsWrapper = html`<div class="table-responsive"></div>`;
  statsWrapper.append(statsHeaderRow, statsTable, statsPaginationBar);
  const statsCard = Card({ title: "Statistik", body: statsWrapper });

  // TRANSACTION TABLE
  const tableWrapper = html`<div class="table-responsive"></div>`;

  // Toolbar
  const tableToolBar = html`
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2" id="toolbar">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="selectAll" />
        <label class="form-check-label" for="selectAll">Alle Transaktionen auswählen</label>
      </div>

      <div class="ms-auto d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-danger d-none" id="btnDeleteSelected">Löschen</button>
        <button class="btn btn-sm btn-outline-warning d-none" id="btnUpdateSelected">Update</button>

        <button class="btn btn-sm btn-outline-primary" id="btnNew">
          <i class="fa-solid fa-plus"></i> Transaktion
        </button>

        <div class="d-flex align-items-center gap-2">
          <i class="fa-solid fa-magnifying-glass text-secondary"></i>
          <input id="txnSearch" type="search" class="form-control form-control-sm" placeholder="Suchen..." style="max-width: 340px;" aria-label="Transaktionen durchsuchen" />
        </div>
      </div>
    </div>
  `;
  tableWrapper.append(tableToolBar);

  const tableEl = html`
    <table class="table table-sm align-middle table-hover">
      <thead>
        <tr>
          <th style="width: 1%;"></th>

          <th class="mi-sortable" data-txn-sort-key="timestamp" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Datum">
            <i class="fa-solid fa-sort" data-txn-sort-icon="timestamp"></i> Datum
          </th>

          <th class="mi-sortable" data-txn-sort-key="symbol" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Asset">
            <i class="fa-solid fa-sort" data-txn-sort-icon="symbol"></i> Asset
          </th>

          <th class="mi-sortable" data-txn-sort-key="side" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Typ">
            <i class="fa-solid fa-sort" data-txn-sort-icon="side"></i> Typ
          </th>

          <th class="text-end mi-sortable" data-txn-sort-key="quantity" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Menge">
            <i class="fa-solid fa-sort" data-txn-sort-icon="quantity"></i> Menge
          </th>

          <th class="text-end mi-sortable" data-txn-sort-key="price" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Preis">
            <i class="fa-solid fa-sort" data-txn-sort-icon="price"></i> Preis
          </th>

          <th class="text-end mi-sortable" data-txn-sort-key="total" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach Gesamtwert">
            <i class="fa-solid fa-sort" data-txn-sort-icon="total"></i> Gesamtwert
          </th>

          <th class="text-end mi-sortable" data-txn-sort-key="pfg" role="button" tabindex="0" style="cursor:pointer; user-select:none;" title="Sortieren nach PFG">
            <i class="fa-solid fa-sort" data-txn-sort-icon="pfg"></i> PFG
          </th>
        </tr>
      </thead>
      <tbody id="txnRows"></tbody>
    </table>
  `;

  const initialTbody = tableEl.querySelector("#txnRows");
  initialTbody.innerHTML = `
    <tr>
      <td colspan="8" class="text-center py-4 text-muted">Lade Transaktionen...</td>
    </tr>
  `;

  tableWrapper.append(tableEl);

  const paginationBar = html`
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-2">
      <div id="pageInfo">Zeige 0 bis 0 von 0 Einträgen</div>
      <div class="d-flex align-items-center gap-2">

        <nav aria-label="Seiten">
          <ul class="pagination pagination-sm mb-0" id="pageNav"></ul>
        </nav>

        <label for="rowsPerPage" class="form-label mb-0 small">Zeilen pro Seite:</label>
        <select id="rowsPerPage" class="form-select form-select-sm w-auto">
          <option value="10" selected>10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="500">500</option>
        </select>
      </div>
    </div>
  `;
  tableWrapper.append(paginationBar);

  const tableCard = Card({ title: "Transaktionen", body: tableWrapper });

  root.append(statsCard, tableCard);

  // build view lists
  function getTxnSortValue(tx, key) {
    if (!tx) return null;

    if (key === "timestamp") {
      const t = new Date(tx.timestamp).getTime();
      return Number.isFinite(t) ? t : null;
    }

    const aid = getTxAssetId(tx);
    const asset = (aid != null ? assetMap.get(aid) : null) || {};
    const symbol =
      asset.symbol ||
      tx.symbol ||
      tx.assetSymbol ||
      asset.assetSymbol ||
      (tx.asset && (tx.asset.symbol || tx.asset.assetSymbol)) ||
      "";

    if (key === "symbol") return symbol || null;
    if (key === "side") return String(tx.side || "").toUpperCase() || null;
    if (key === "quantity") return Number(tx.quantity);
    if (key === "price") return Number(tx.price);
    if (key === "total") return Number(tx.quantity) * Number(tx.price);
    if (key === "pfg") return Number(tx.pfgValue ?? tx.pfg);

    return null;
  }

  function buildTxnViewList() {
    const base = Array.isArray(allTxns) ? allTxns : [];
    const term = normalizeSearchTerm(txnSearchTerm);

    let filtered = base;

    if (term) {
      filtered = base.filter((tx) => buildTxnSearchIndex(tx).includes(term));
    }

    // Default: keep old behavior when no explicit sort: newest first
    if (!txnSortKey || txnSortDir === 0) {
      return filtered.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    const cfg = TXN_SORT_KEYS[txnSortKey] || { type: "text" };
    return stableSort(filtered, txnSortKey, txnSortDir, cfg.type, getTxnSortValue);
  }

  function getStatsSortValue(r, key) {
    if (!r) return null;
    if (key === "symbol") return r.symbol ?? null;

    const name =
      (r.asset && (r.asset.name || r.asset.assetName)) ||
      "";
    if (key === "name") return name || null;

    if (key === "currentPrice") return r.currentPrice;
    if (key === "weightedPfg") return r.weightedPfg;
    if (key === "currentQty") return r.currentQty;
    if (key === "avgBuyPrice") return r.avgBuyPrice;

    return null;
  }

  function buildStatsViewList() {
    const base = Array.isArray(statsRows) ? statsRows : [];
    const term = normalizeSearchTerm(statsSearchTerm);

    let filtered = base;
    if (term) {
      filtered = base.filter((r) => buildStatsSearchIndex(r).includes(term));
    }

    if (!statsSortKey || statsSortDir === 0) {
      return filtered;
    }

    const cfg = STATS_SORT_KEYS[statsSortKey] || { type: "text" };
    return stableSort(filtered, statsSortKey, statsSortDir, cfg.type, getStatsSortValue);
  }

  // Render transaction table
  function updateTxnSortIcons() {
    Object.keys(TXN_SORT_KEYS).forEach((k) => {
      const icon = root.querySelector(`[data-txn-sort-icon="${k}"]`);
      if (!icon) return;
      icon.className = sortIconClass(0);
    });

    if (txnSortKey && txnSortDir !== 0) {
      const active = root.querySelector(`[data-txn-sort-icon="${txnSortKey}"]`);
      if (active) active.className = sortIconClass(txnSortDir);
    }
  }

  function renderTable() {
    const tbody = tableEl.querySelector("#txnRows");
    tbody.innerHTML = "";
    selectedIds.clear();

    const viewList = buildTxnViewList();
    const total = viewList.length;

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    if (total === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            Keine Transaktionen gefunden.
          </td>
        </tr>
      `;
      updateSelectionControls();
      renderPagination(viewList);
      return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, total);
    const slice = viewList.slice(start, end);

    for (const tx of slice) {
      const id = tx.txnId != null ? tx.txnId : tx.id;

      const aid = getTxAssetId(tx);
      const asset = (aid != null ? assetMap.get(aid) : null) || {};

      const symbol = asset.symbol || tx.symbol || tx.assetSymbol || asset.assetSymbol || (tx.asset && (tx.asset.symbol || tx.asset.assetSymbol)) || "";

      const side = String(tx.side || "").toUpperCase();
      const qty = Number(tx.quantity) || 0;
      const price = Number(tx.price) || 0;
      const totalPrice = qty * price;
      const qtyFormatted =
        side === "SELL" ? "- " + fmt.number(qty, { digits: 8 }) : fmt.number(qty, { digits: 8 });

      const pfg = Number(tx.pfgValue ?? tx.pfg ?? 0);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input class="form-check-input row-select" type="checkbox" data-id="${id}" /></td>
        <td>${fmt.dateTime(tx.timestamp)}</td>
        <td>
          <a href="#" class="mi-asset-link" data-open-url="${String(symbol).toUpperCase()}">${symbol}</a>
        </td>
        <td>${side}</td>
        <td class="text-end">${qtyFormatted}</td>
        <td class="text-end">${fmt.money(price)}</td>
        <td class="text-end">${fmt.money(totalPrice)}</td>
        <td class="text-end">${fmt.number(pfg, { digits: 0 })}</td>
      `;

      tr.querySelector("[data-open-url]")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // prevent showing note
        openCmcForSymbol(symbol);
      });

      // Click row toggles note row 
      tr.addEventListener("click", (e) => {
        if (e.target.closest(".row-select")) return;

        const existingNote = tr.nextElementSibling;
        if (existingNote && existingNote.classList.contains("txn-note-row")) {
          existingNote.remove();
          return;
        }

        // close other open notes
        tbody.querySelectorAll(".txn-note-row").forEach((n) => n.remove());

        const noteText = tx.note || tx.comment || tx.remarks || "(Keine Notiz)";
        const noteRow = document.createElement("tr");
        noteRow.className = "txn-note-row";
        noteRow.innerHTML = `
          <td colspan="8" class="text-muted small px-4 py-2">
            <strong>Notiz:</strong> ${noteText}
          </td>
        `;
        tr.insertAdjacentElement("afterend", noteRow);
      });

      tbody.append(tr);
    }

    updateSelectionControls();
    renderPagination(viewList);
  }

  function renderPagination(viewList) {
    const nf = new Intl.NumberFormat("de-AT");
    const total = viewList.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, total);

    const infoEl = paginationBar.querySelector("#pageInfo");
    infoEl.textContent = `Zeige ${nf.format(start)} bis ${nf.format(end)} von ${nf.format(total)} Einträgen`;

    const nav = paginationBar.querySelector("#pageNav");
    nav.innerHTML = "";

    const makeLi = (label, page, { disabled = false, active = false } = {}) => {
      const li = document.createElement("li");
      li.className = `page-item${disabled ? " disabled" : ""}${active ? " active" : ""}`;
      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.textContent = label;
      if (!disabled) a.dataset.page = String(page);
      li.appendChild(a);
      return li;
    };

    nav.appendChild(makeLi("Zurück", currentPage - 1, { disabled: currentPage === 1 }));

    const last = totalPages;
    const windowSize = 2;
    const startPage = Math.max(1, currentPage - windowSize);
    const endPage = Math.min(last, currentPage + windowSize);

    const addPage = (p) => nav.appendChild(makeLi(String(p), p, { active: p === currentPage }));
    const addDots = () => {
      const li = document.createElement("li");
      li.className = "page-item disabled";
      li.innerHTML = `<span class="page-link">…</span>`;
      nav.appendChild(li);
    };

    if (startPage > 1) addPage(1);
    if (startPage > 2) addDots();
    for (let p = startPage; p <= endPage; p++) addPage(p);
    if (endPage < last - 1) addDots();
    if (endPage < last) addPage(last);

    nav.appendChild(makeLi("Vor", currentPage + 1, { disabled: currentPage === last }));

    nav.onclick = (e) => {
      const a = e.target.closest("a.page-link[data-page]");
      if (!a) return;
      e.preventDefault();
      const next = parseInt(a.dataset.page, 10);
      if (Number.isNaN(next)) return;
      currentPage = next;
      renderTable();
    };
  }

  function updateSelectionControls() {
    const rowCheckboxes = tableEl.querySelectorAll(".row-select");
    selectedIds.clear();

    rowCheckboxes.forEach((cb) => {
      const id = cb.dataset.id;
      if (cb.checked) selectedIds.add(id);
    });

    const allChecked = rowCheckboxes.length > 0 && selectedIds.size === rowCheckboxes.length;

    const deleteBtn = tableToolBar.querySelector("#btnDeleteSelected");
    if (selectedIds.size > 0) {
      deleteBtn.classList.remove("d-none");
      deleteBtn.textContent = `Löschen (${selectedIds.size})`;
    } else {
      deleteBtn.classList.add("d-none");
    }

    const updateBtn = tableToolBar.querySelector("#btnUpdateSelected");
    if (selectedIds.size === 1) {
      updateBtn.classList.remove("d-none");
      updateBtn.textContent = `Update`;
    } else {
      updateBtn.classList.add("d-none");
    }

    const selectAllCb = tableToolBar.querySelector("#selectAll");
    if (selectAllCb) selectAllCb.checked = allChecked;
  }

  // Render stats-table
  function updateStatsSortIcons() {
    Object.keys(STATS_SORT_KEYS).forEach((k) => {
      const icon = root.querySelector(`[data-stats-sort-icon="${k}"]`);
      if (!icon) return;
      icon.className = sortIconClass(0);
    });

    if (statsSortKey && statsSortDir !== 0) {
      const active = root.querySelector(`[data-stats-sort-icon="${statsSortKey}"]`);
      if (active) active.className = sortIconClass(statsSortDir);
    }
  }

  function renderStatsTable() {
    statsTableBody.innerHTML = "";

    const viewList = buildStatsViewList();
    const total = viewList.length;

    if (total === 0) {
      statsTableBody.innerHTML =
        '<tr><td colspan="6" class="text-center py-3 text-muted">Keine Statistik-Einträge gefunden.</td></tr>';
      renderStatsPagination(viewList);
      return;
    }

    const totalPages = Math.max(1, Math.ceil(total / statsRowsPerPage));
    if (statsCurrentPage > totalPages) statsCurrentPage = totalPages;
    if (statsCurrentPage < 1) statsCurrentPage = 1;

    const start = (statsCurrentPage - 1) * statsRowsPerPage;
    const end = Math.min(start + statsRowsPerPage, total);
    const slice = viewList.slice(start, end);

    slice.forEach((row, idx) => {
      const index = start + idx + 1;

      const symbol = row.symbol || row.assetId;
      const assetName =
        (row.asset && (row.asset.name || row.asset.assetName)) ||
        symbol ||
        row.assetId;

      // seed last price for flash if missing
      if (row.currentPrice != null && !lastStatsPriceBySymbol.has(String(symbol).toUpperCase())) {
        lastStatsPriceBySymbol.set(String(symbol).toUpperCase(), Number(row.currentPrice));
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="text-muted">${index}</td>

        <td>
          <a href="#" class="mi-asset-link" data-open-url="${String(symbol).toUpperCase()}">
            ${symbol} - ${assetName}
          </a>
        </td>

        <td data-stats-price-symbol="${String(symbol).toUpperCase()}">
          ${row.currentPrice != null ? fmt.smartMoney(row.currentPrice) : "—"}
        </td>

        <td>
          ${row.weightedPfg != null ? fmt.number(row.weightedPfg, { digits: 0 }) : "—"}
        </td>

        <td class="text-end">
          ${
            row.currentQty != null
              ? (typeof fmt.qty === "function" ? fmt.qty(row.currentQty) : fmt.number(row.currentQty, { digits: 8 }))
              : "—"
          }
        </td>

        <td class="text-end">
          ${row.avgBuyPrice != null ? fmt.smartMoney(row.avgBuyPrice) : "—"}
        </td>
      `;

      tr.querySelector("[data-open-url]")?.addEventListener("click", (e) => {
        e.preventDefault();
        openCmcForSymbol(symbol);
      });

      statsTableBody.append(tr);
    });

    renderStatsPagination(viewList);
  }

  function renderStatsPagination(viewList) {
    const nf = new Intl.NumberFormat("de-AT");
    const infoEl = statsPaginationBar.querySelector("#statsPageInfo");
    const nav = statsPaginationBar.querySelector("#statsPageNav");
    nav.innerHTML = "";

    const total = viewList.length;
    if (total === 0) {
      infoEl.textContent = "Zeige 0 bis 0 von 0 Assets";
      return;
    }

    const totalPages = Math.max(1, Math.ceil(total / statsRowsPerPage));
    if (statsCurrentPage > totalPages) statsCurrentPage = totalPages;
    if (statsCurrentPage < 1) statsCurrentPage = 1;

    const start = (statsCurrentPage - 1) * statsRowsPerPage + 1;
    const end = Math.min(statsCurrentPage * statsRowsPerPage, total);
    infoEl.textContent = `Zeige ${nf.format(start)} bis ${nf.format(end)} von ${nf.format(total)} Assets`;

    const makeLi = (label, page, { disabled = false, active = false } = {}) => {
      const li = document.createElement("li");
      li.className = `page-item${disabled ? " disabled" : ""}${active ? " active" : ""}`;
      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.textContent = label;
      if (!disabled) a.dataset.page = String(page);
      li.appendChild(a);
      return li;
    };

    nav.appendChild(makeLi("Zurück", statsCurrentPage - 1, { disabled: statsCurrentPage === 1 }));

    const last = totalPages;
    const windowSize = 2;
    const startPage = Math.max(1, statsCurrentPage - windowSize);
    const endPage = Math.min(last, statsCurrentPage + windowSize);

    const addPage = (p) => nav.appendChild(makeLi(String(p), p, { active: p === statsCurrentPage }));
    const addDots = () => {
      const li = document.createElement("li");
      li.className = "page-item disabled";
      li.innerHTML = '<span class="page-link">…</span>';
      nav.appendChild(li);
    };

    if (startPage > 1) addPage(1);
    if (startPage > 2) addDots();
    for (let p = startPage; p <= endPage; p++) addPage(p);
    if (endPage < last - 1) addDots();
    if (endPage < last) addPage(last);

    nav.appendChild(makeLi("Vor", statsCurrentPage + 1, { disabled: statsCurrentPage === last }));

    nav.onclick = (e) => {
      const a = e.target.closest("a.page-link[data-page]");
      if (!a) return;
      e.preventDefault();
      const next = parseInt(a.dataset.page, 10);
      if (Number.isNaN(next)) return;
      statsCurrentPage = next;
      renderStatsTable();
    };
  }

  // Live price patch + flash (stats)
  function patchStatsPrice(symbol, price) {
    const sym = String(symbol || "").trim().toUpperCase();
    if (!sym) return;

    const newNum = Number(price);
    if (!Number.isFinite(newNum)) return;

    const prev = lastStatsPriceBySymbol.get(sym);
    lastStatsPriceBySymbol.set(sym, newNum);

    let direction = null;
    if (prev != null) {
      if (newNum > prev) direction = "up";
      else if (newNum < prev) direction = "down";
    }

    const row = statsRows.find((r) => String(r.symbol || "").toUpperCase() === sym);
    if (row) row.currentPrice = newNum;

    // Patch only visible cells
    root.querySelectorAll(`[data-stats-price-symbol="${sym}"]`).forEach((el) => {
      el.textContent = fmt.smartMoney(newNum);
      if (direction) flashPrice(el, direction);
    });

    // If user currently sorts by currentPrice, re-render to keep order correct
    if (statsSortKey === "currentPrice" && statsSortDir !== 0) {
      renderStatsTable();
    }
  }

  const unsubscribeAssetRows = subscribeAssetRows((row) => {
    patchStatsPrice(row?.symbol, row?.price);
  });

  // Ensure cleanup when component gets removed
  root.destroy = () => {
    try { unsubscribeAssetRows?.(); } catch {}
  };

  // Data loading
  async function updateStats() {
    try {
      const stats = await getTxnStats();
      const rows = Array.isArray(stats)
        ? stats.map((stat) => {
            const aid = stat.assetId != null ? Number(stat.assetId) : null;
            const asset = (aid != null ? assetMap.get(aid) : null) || {};
            const symbol = stat.symbol || asset.symbol || asset.assetSymbol || "";

            return {
              assetId: aid,
              asset,
              symbol,
              weightedPfg:
                stat.weightedPfg != null && !Number.isNaN(stat.weightedPfg)
                  ? Number(stat.weightedPfg)
                  : null,
              avgBuyPrice:
                stat.averageBuyPrice != null && !Number.isNaN(stat.averageBuyPrice)
                  ? Number(stat.averageBuyPrice)
                  : null,
              currentQty:
                stat.currentQuantity != null && !Number.isNaN(stat.currentQuantity)
                  ? Number(stat.currentQuantity)
                  : null,
              currentPrice:
                stat.currentPrice != null && !Number.isNaN(stat.currentPrice)
                  ? Number(stat.currentPrice)
                  : null,
            };
          })
        : [];

      // keep backend order as default
      statsRows = rows;
      statsCurrentPage = 1;
      renderStatsTable();
    } catch (err) {
      console.error("Failed to load transaction statistics:", err);
      statsRows = [];
      renderStatsTable();
    }
  }

  async function reload() {
    try {
      const list = await getTxns();
      allTxns = Array.isArray(list) ? list : [];

      currentPage = 1;
      renderTable();

      await updateStats();
    } catch (err) {
      console.error("Fehler beim Laden der Transaktionen:", err);

      const tbody = tableEl.querySelector("#txnRows");
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            Transaktionen konnten nicht geladen werden.
          </td>
        </tr>
      `;

      statsRows = [];
      renderStatsTable();

      if (typeof onError === "function") onError(err);
    }
  }

  // Event bindings

  // TXN: search
  tableToolBar.querySelector("#txnSearch")?.addEventListener("input", (e) => {
    txnSearchTerm = e.target.value || "";
    currentPage = 1;
    renderTable();
  });

  // STATS: search
  statsHeaderRow.querySelector("#statsSearch")?.addEventListener("input", (e) => {
    statsSearchTerm = e.target.value || "";
    statsCurrentPage = 1;
    renderStatsTable();
  });

  // Rows per page
  paginationBar.querySelector("#rowsPerPage").addEventListener("change", (e) => {
    rowsPerPage = parseInt(e.target.value, 10) || 10;
    currentPage = 1;
    renderTable();
  });

  // Stats rows per page
  statsPaginationBar.querySelector("#statsRowsPerPage").addEventListener("change", (e) => {
    statsRowsPerPage = parseInt(e.target.value, 10) || 5;
    statsCurrentPage = 1;
    renderStatsTable();
  });

  // New transaction button
  tableToolBar.querySelector("#btnNew").addEventListener("click", () => {
    if (typeof onNew === "function") onNew();
  });

  // Delete selected
  tableToolBar.querySelector("#btnDeleteSelected").addEventListener("click", async () => {
    if (selectedIds.size === 0) return;

    const confirmMsg =
      selectedIds.size === 1
        ? "Möchtest du die ausgewählte Transaktion wirklich löschen?"
        : `Möchtest du die ${selectedIds.size} ausgewählten Transaktionen wirklich löschen?`;

    if (!confirm(confirmMsg)) return;

    const base = getApiBase();
    for (const id of Array.from(selectedIds)) {
      try {
        await fetch(`${base}/api/txns/${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Fehler beim Löschen der Transaktion", id, err);
      }
    }

    await reload();
  });

  // Update selected
  tableToolBar.querySelector("#btnUpdateSelected").addEventListener("click", async () => {
    if (selectedIds.size !== 1) return;

    const id = Array.from(selectedIds)[0];
    const tx = allTxns.find((t) => String(t.txnId ?? t.id) === String(id));
    if (!tx) return;

    if (typeof onUpdate === "function") onUpdate(tx);
  });

  // Select all
  tableToolBar.querySelector("#selectAll").addEventListener("change", (e) => {
    const checked = e.target.checked;
    tableEl.querySelectorAll(".row-select").forEach((cb) => (cb.checked = checked));
    updateSelectionControls();
  });

  // Row checkbox delegation
  tableEl.addEventListener("change", (e) => {
    if (e.target.classList.contains("row-select")) updateSelectionControls();
  });

  // TXN: sort clicks + keyboard
  const txnThead = tableEl.querySelector("thead");

  function setTxnSort(key) {
    const next = cycleSort(txnSortKey, txnSortDir, key);
    txnSortKey = next.key;
    txnSortDir = next.dir;
    currentPage = 1;
    updateTxnSortIcons();
    renderTable();
  }

  txnThead?.addEventListener("click", (ev) => {
    const th = ev.target.closest("th[data-txn-sort-key]");
    if (!th) return;
    const key = th.getAttribute("data-txn-sort-key");
    if (!TXN_SORT_KEYS[key]) return;
    setTxnSort(key);
  });

  txnThead?.addEventListener("keydown", (ev) => {
    const isEnter = ev.key === "Enter";
    const isSpace = ev.key === " " || ev.key === "Spacebar";
    if (!isEnter && !isSpace) return;

    const th = ev.target.closest("th[data-txn-sort-key]");
    if (!th) return;

    ev.preventDefault();
    const key = th.getAttribute("data-txn-sort-key");
    if (!TXN_SORT_KEYS[key]) return;
    setTxnSort(key);
  });

  // STATS: sort clicks + keyboard
  const statsThead = statsTable.querySelector("thead");

  function setStatsSort(key) {
    const next = cycleSort(statsSortKey, statsSortDir, key);
    statsSortKey = next.key;
    statsSortDir = next.dir;
    statsCurrentPage = 1;
    updateStatsSortIcons();
    renderStatsTable();
  }

  statsThead?.addEventListener("click", (ev) => {
    const th = ev.target.closest("th[data-stats-sort-key]");
    if (!th) return;
    const key = th.getAttribute("data-stats-sort-key");
    if (!STATS_SORT_KEYS[key]) return;
    setStatsSort(key);
  });

  statsThead?.addEventListener("keydown", (ev) => {
    const isEnter = ev.key === "Enter";
    const isSpace = ev.key === " " || ev.key === "Spacebar";
    if (!isEnter && !isSpace) return;

    const th = ev.target.closest("th[data-stats-sort-key]");
    if (!th) return;

    ev.preventDefault();
    const key = th.getAttribute("data-stats-sort-key");
    if (!STATS_SORT_KEYS[key]) return;
    setStatsSort(key);
  });

  // Initial icons
  updateTxnSortIcons();
  updateStatsSortIcons();

  // Initial load
  reload();

  return {
    element: root,
    reload,
    getSelected: () => Array.from(selectedIds),
  };
}

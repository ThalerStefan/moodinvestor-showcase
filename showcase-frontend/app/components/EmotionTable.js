// /frontend/app/components/EmotionTable.js

import { html } from "../utils/dom.js";
import { Card } from "../components/Card.js";

export function createEmotionTable({ onNew, onEdit, onDelete } = {}) {
  let allEntries = [];
  let viewEntries = [];

  // Selection across current page 
  let selectedIds = new Set();

  // Pagination
  let rowsPerPage = 10;
  let currentPage = 1;

  // Search term (notes excluded)
  let searchTerm = "";

  // 3-state sort
  let sortKey = null; // "day" | "mood" | null
  let sortDir = 0; // 0 none, 1 asc, -1 desc

  // Helpers
  function normalize(v) {
    return String(v ?? "").trim().toLowerCase();
  }

  function formatDayForDisplay(day) {
    if (!day) return "";
    const [y, m, d] = day.split("-").map((s) => Number(s));
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("de-AT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function buildDateTokens(day) {
    // Allows searching by: "2025-12-28" - "28.12.2025" - "28.12"
    if (!day) return "";
    const d = new Date(day);
    if (Number.isNaN(d.getTime())) return String(day);

    const iso = String(day);
    const de = d.toLocaleDateString("de-AT");
    const deShort = d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" });

    return `${iso} ${de} ${deShort}`;
  }

  function moodIcon(scale) {
    switch (Number(scale)) {
      case 1:
        return "😢";
      case 2:
        return "🙁";
      case 3:
        return "😐";
      case 4:
        return "🙂";
      case 5:
        return "😄";
      default:
        return "";
    }
  }

  // Notes EXCLUDED 
  function buildSearchIndex(entry) {
    const day = entry?.day || "";
    const mood = entry?.mood ?? "";
    const moodText =
      mood === 1 ? "sehr schlecht" :
      mood === 2 ? "eher schlecht" :
      mood === 3 ? "neutral" :
      mood === 4 ? "gut" :
      mood === 5 ? "sehr gut" : "";

    return normalize(`${buildDateTokens(day)} ${mood} ${moodText}`);
  }

  function getEntryId(entry) {
    return entry?.id ?? entry?.day; // fallback: day
  }

  function cycleSort(newKey) {
    if (sortKey !== newKey) {
      sortKey = newKey;
      sortDir = 1;
      return;
    }
    if (sortDir === 1) {
      sortDir = -1;
      return;
    }
    sortKey = null;
    sortDir = 0;
  }

  function sortIconClass(key) {
    if (sortKey !== key || sortDir === 0) return "fa-solid fa-sort";
    if (sortDir === 1) return "fa-solid fa-sort-up";
    return "fa-solid fa-sort-down";
  }

  // UI
  const root = html`<div class="vstack gap-3"></div>`;
  const tableWrapper = html`<div class="table-responsive"></div>`;

  // Toolbar
  const toolbar = html`
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">

      <!-- LEFT -->
      <div class="form-check mb-0">
        <input class="form-check-input" type="checkbox" id="selectAll" />
        <label class="form-check-label small" for="selectAll">Alle auswählen</label>
      </div>

      <!-- RIGHT: hidden buttons, +entry, search (far right) -->
      <div class="d-flex align-items-center gap-2 ms-auto">
        <button class="btn btn-sm btn-outline-danger d-none" id="btnDelete">Löschen</button>
        <button class="btn btn-sm btn-outline-warning d-none" id="btnEdit">Update</button>

        <button class="btn btn-sm btn-outline-primary" id="btnNew">
          <i class="fa-solid fa-plus"></i> Eintrag
        </button>

        <div class="d-flex align-items-center gap-2">
          <i class="fa-solid fa-magnifying-glass text-secondary"></i>
          <input id="search" type="search" class="form-control form-control-sm" placeholder="Suche..." style="max-width: 320px;" />
        </div>
      </div>
    </div>
  `;

  const tableEl = html`
    <table class="table table-sm align-middle table-hover">
      <thead>
        <tr>
          <th style="width: 1%"></th>

          <th
            data-sort="day"
            role="button"
            tabindex="0"
            style="cursor:pointer; user-select:none;"
            title="Sort by date"
          >
            <i class="${sortIconClass("day")}" data-sort-icon="day"></i>
            Datum/Uhrzeit
          </th>

          <th
            data-sort="mood"
            role="button"
            tabindex="0"
            style="cursor:pointer; user-select:none;"
            title="Sort by mood"
          >
            <i class="${sortIconClass("mood")}" data-sort-icon="mood"></i>
            Stimmung
          </th>

          <th>Notiz</th>
        </tr>
      </thead>
      <tbody id="emoRows"></tbody>
    </table>
  `;

  const paginationBar = html`
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-2">
      <div id="pageInfo" class="small">Zeige 0 bis 0 von 0 Einträgen</div>
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
        </select>
      </div>
    </div>
  `;

  tableWrapper.append(toolbar, tableEl, paginationBar);

  const tableCard = Card({ title: "Emotion-Log", body: tableWrapper });
  root.append(tableCard);

  // Elements
  const selectAllEl = toolbar.querySelector("#selectAll");
  const btnNewEl = toolbar.querySelector("#btnNew");
  const btnEditEl = toolbar.querySelector("#btnEdit");
  const btnDeleteEl = toolbar.querySelector("#btnDelete");
  const searchEl = toolbar.querySelector("#search");

  const tbodyEl = tableEl.querySelector("#emoRows");
  const theadEl = tableEl.querySelector("thead");

  const pageNavEl = paginationBar.querySelector("#pageNav");
  const pageInfoEl = paginationBar.querySelector("#pageInfo");
  const rowsPerPageEl = paginationBar.querySelector("#rowsPerPage");

  // Data pipeline: search + sort
 function applySearchAndSort() {
    const raw = (searchTerm || "").trim();
    const term = normalize(raw);

    /* Special case:
    * If user types EXACTLY "1".."5", treat it as a mood filter.
    * This guarantees:
    * - "5" => only entries with mood === 5
    * - "4" => only entries with mood === 4
    * But dates still work because we only trigger this when it's exactly one digit.
    */
    const isExactMood = /^[1-5]$/.test(raw);

    // 1) Search (notes excluded)
    let searched;
    if (!term) {
        searched = allEntries.slice();
    } else if (isExactMood) {
        const wanted = Number(raw);
        searched = allEntries.filter((e) => Number(e.mood) === wanted);
    } else {
        searched = allEntries.filter((e) => buildSearchIndex(e).includes(term));
    }

    // 2) Sort
    // If sorting is OFF: default order newest first
    if (!sortKey || sortDir === 0) {
        viewEntries = searched.sort((a, b) => new Date(b.day) - new Date(a.day));
    } else {
        viewEntries = searched.sort((a, b) => {
        let av = null;
        let bv = null;

        if (sortKey === "day") {
            av = new Date(a.day).getTime();
            bv = new Date(b.day).getTime();
        } else if (sortKey === "mood") {
            av = Number(a.mood);
            bv = Number(b.mood);
        }

        const aBad = av == null || Number.isNaN(av);
        const bBad = bv == null || Number.isNaN(bv);
        if (aBad && bBad) return 0;
        if (aBad) return 1;
        if (bBad) return -1;

        if (av < bv) return -1 * sortDir;
        if (av > bv) return 1 * sortDir;
        return 0;
        });
    }

    currentPage = 1;
    }


  function updateSortIcons() {
    ["day", "mood"].forEach((key) => {
      const icon = theadEl.querySelector(`[data-sort-icon="${key}"]`);
      if (icon) icon.className = sortIconClass(key);
    });
  }

  
  // Render
  function renderTable() {
    tbodyEl.innerHTML = "";

    const total = viewEntries.length;

    if (total === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td colspan="4" class="text-center py-4 text-muted">
          Keine Einträge gefunden.
        </td>
      `;
      tbodyEl.appendChild(tr);

      selectedIds.clear();
      updateSelectionControls();

      currentPage = 1;
      pageInfoEl.textContent = `Zeige 0 bis 0 von 0 Einträgen`;
      pageNavEl.innerHTML = "";
      return;
    }

    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, total);
    const slice = viewEntries.slice(start, end);

    for (const entry of slice) {
      const id = getEntryId(entry);
      const day = entry.day;
      const mood = Number(entry.mood);
      const icon = moodIcon(mood);

      const noteShort = entry.note
        ? entry.note.length > 60
          ? entry.note.slice(0, 60) + "…"
          : entry.note
        : "–";

      const tr = document.createElement("tr");
      tr.dataset.id = id;

      tr.innerHTML = `
        <td><input type="checkbox" class="form-check-input row-select" data-id="${id}" /></td>
        <td>${formatDayForDisplay(day)}</td>
        <td>${mood} ⟶ ${icon ? `<span class="ms-1">${icon}</span>` : ""}</td>
        <td>${noteShort}</td>
      `;

      // Checkbox change updates selection
      const cb = tr.querySelector(".row-select");
      cb.addEventListener("change", () => {
        const rid = cb.dataset.id;
        if (cb.checked) selectedIds.add(rid);
        else selectedIds.delete(rid);
        updateSelectionControls();
      });

      // Row click toggles full note row (note is not searched)
      tr.addEventListener("click", (ev) => {
        if (ev.target.closest(".row-select")) return;

        const nextRow = tr.nextElementSibling;
        if (nextRow && nextRow.classList.contains("emo-note-row")) {
          nextRow.remove();
          return;
        }

        // Close any other open note rows
        tbodyEl.querySelectorAll(".emo-note-row").forEach((n) => n.remove());

        const noteRow = document.createElement("tr");
        noteRow.className = "emo-note-row";
        noteRow.innerHTML = `
          <td colspan="4" class="text-muted small px-4 py-2">
            <strong>Notiz:</strong> ${entry.note || "(Keine Notiz)"}
          </td>
        `;
        tr.insertAdjacentElement("afterend", noteRow);
      });

      tbodyEl.appendChild(tr);
    }

    updateSelectionControls();
    renderPagination();
  }

  function updateSelectionControls() {
    // Toggle buttons visibility based on selection
    if (selectedIds.size > 0) {
      btnDeleteEl.classList.remove("d-none");
      btnDeleteEl.textContent = `Löschen (${selectedIds.size})`;
    } else {
      btnDeleteEl.classList.add("d-none");
      btnDeleteEl.textContent = "Löschen";
    }

    btnEditEl.classList.toggle("d-none", selectedIds.size !== 1);

    // Sync checkbox states and row highlighting
    const pageRows = tbodyEl.querySelectorAll(".row-select");
    let allVisibleSelected = pageRows.length > 0;

    pageRows.forEach((cb) => {
      const rid = cb.dataset.id;
      const checked = selectedIds.has(rid);
      cb.checked = checked;

      const row = cb.closest("tr");
      if (row) row.classList.toggle("table-active", checked);
      if (!checked) allVisibleSelected = false;
    });

    selectAllEl.checked = allVisibleSelected;
  }

  function renderPagination() {
    const total = viewEntries.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    const start = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, total);

    pageInfoEl.textContent = `Zeige ${start} bis ${end} von ${total} Einträgen`;
    pageNavEl.innerHTML = "";

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

    pageNavEl.appendChild(makeLi("Zurück", currentPage - 1, { disabled: currentPage === 1 }));

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pageNavEl.appendChild(makeLi("1", 1, { active: 1 === currentPage }));
      if (startPage > 2) {
        const dots = document.createElement("li");
        dots.className = "page-item disabled";
        dots.innerHTML = '<span class="page-link">…</span>';
        pageNavEl.appendChild(dots);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      pageNavEl.appendChild(makeLi(String(p), p, { active: p === currentPage }));
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots2 = document.createElement("li");
        dots2.className = "page-item disabled";
        dots2.innerHTML = '<span class="page-link">…</span>';
        pageNavEl.appendChild(dots2);
      }
      pageNavEl.appendChild(makeLi(String(totalPages), totalPages, { active: totalPages === currentPage }));
    }

    pageNavEl.appendChild(makeLi("Weiter", currentPage + 1, { disabled: currentPage === totalPages }));
  }

  // Public API
  function setData(entries) {
    allEntries = Array.isArray(entries) ? entries.slice() : [];
    selectedIds.clear();
    applySearchAndSort();
    updateSortIcons();
    renderTable();
  }

  // Events
  searchEl.addEventListener("input", () => {
    searchTerm = searchEl.value || "";
    applySearchAndSort();
    renderTable();
  });

  rowsPerPageEl.addEventListener("change", () => {
    rowsPerPage = Number(rowsPerPageEl.value) || 10;
    currentPage = 1;
    renderTable();
  });

  pageNavEl.addEventListener("click", (ev) => {
    ev.preventDefault();
    const a = ev.target.closest("a");
    if (!a) return;
    const page = Number(a.dataset.page);
    if (!Number.isFinite(page)) return;
    currentPage = page;
    renderTable();
  });

  selectAllEl.addEventListener("change", () => {
    const checked = selectAllEl.checked;
    const pageRows = tbodyEl.querySelectorAll(".row-select");
    pageRows.forEach((cb) => {
      const rid = cb.dataset.id;
      cb.checked = checked;
      if (checked) selectedIds.add(rid);
      else selectedIds.delete(rid);
    });
    updateSelectionControls();
  });

  btnNewEl.addEventListener("click", () => {
    if (typeof onNew === "function") onNew();
  });

  btnEditEl.addEventListener("click", () => {
    if (selectedIds.size !== 1) return;
    const id = Array.from(selectedIds)[0];
    const entry = allEntries.find((e) => String(getEntryId(e)) === String(id));
    if (entry && typeof onEdit === "function") onEdit(entry);
  });

  btnDeleteEl.addEventListener("click", () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    if (typeof onDelete === "function") onDelete(ids);
  });

  function handleSort(key) {
    cycleSort(key);
    applySearchAndSort();
    updateSortIcons();
    renderTable();
  }

  theadEl.addEventListener("click", (ev) => {
    const th = ev.target.closest("th[data-sort]");
    if (!th) return;
    handleSort(th.dataset.sort);
  });

  theadEl.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    const th = ev.target.closest("th[data-sort]");
    if (!th) return;
    ev.preventDefault();
    handleSort(th.dataset.sort);
  });

  return {
    element: root,
    setData,
  };
}

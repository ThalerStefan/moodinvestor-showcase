/**
 * TransactionFormular.js
 * * This file implements a form for recording new transactions
 * including the five PFG questions. The form is displayed as a Bootstrap modal
 * and provides callback hooks so the calling page can reload data
 * after successful saving.
 */

import { html } from "../utils/dom.js";
import { postTxn, getApiBase } from "../services/api.js";
import { authFetch } from "../services/authFetch.js";

export function createTransactionForm({ assets = [], onSaved, onClose } = {}) {
  const pfgQuestions = [
    {
      key: "q1",
      label: "How confident do you feel about this decision?<br>(1 = I have strong doubts / 5 = I am completely convinced)",
    },
    {
      key: "q2",
      label: "How optimistic are you regarding the future price development of this asset?<br>(1 = Very pessimistic / 5 = Very optimistic)",
    },
    {
      key: "q3",
      label: "How much do current market movements or news influence your decision?<br>(1 = I act impulsively out of fear / 5 = I act completely independently and rationally)",
    },
    {
      key: "q4",
      label: "How much is the desire for profit maximization driving you right now?<br>(1 = Not at all / 5 = Very strongly)",
    },
    {
      key: "q5",
      label: "How strong is your urge to act immediately to avoid missing out (FOMO)?<br>(1 = I feel no pressure to act / 5 = I definitely want to act now)",
    },
  ];

  const DEFAULT_QTY_INVALID_MSG = "Please enter a valid quantity &gt; 0.";

  let mode = "create";  // create / update
  let currentTxnId = null;

  function toInputDateTimeLocal(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }

  // Helper to create the option list for a select element
  function buildAssetOptions() {
    const frag = document.createDocumentFragment();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = "Choose Asset...";
    frag.appendChild(placeholder);

    for (const a of assets) {
      const sym = a.symbol || a.assetSymbol || a.id || "";
      const name = a.name || a.assetName || sym;

      const opt = document.createElement("option");
      opt.value = String(sym);
      opt.textContent = `${sym} - ${name}`;
      frag.appendChild(opt);
    }

    return frag;
  }

  // Helper: "now" in format for datetime-local (local time, rounded)
  function nowForDateTimeLocal(minutesStep = 1) {
    const d = new Date();
    d.setSeconds(0, 0);
    if (minutesStep > 1) {
      d.setMinutes(d.getMinutes() - (d.getMinutes() % minutesStep));
    }
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }

  // Create the modal skeleton - only displayed when open() is called
  const modalEl = html`
    <div class="modal fade" tabindex="-1" aria-labelledby="modalTxnTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalTxnTitle">Neue Transaktion</h5>
            <button type="button" class="btn-close" aria-label="Schließen"></button>
          </div>
          <div class="modal-body">
            <form class="vstack gap-3" id="txnForm">

                <div>
                    <label class="form-label">Datum &amp; Uhrzeit</label>
                    <input type="datetime-local" class="form-control" name="timestamp" required />
                    <div class="form-text">Voreingestellt: jetzt – kann angepasst werden.</div>
                </div>

              <div>
                <label class="form-label">Asset<span class="text-danger">*</span></label>
                <select class="form-select" name="symbol" required></select>
                <div class="invalid-feedback">Bitte wähle ein Asset aus.</div>
              </div>


              <div>
                <label class="form-label">Typ<span class="text-danger">*</span></label>
                <select class="form-select" name="side" required>
                  <option value="" disabled selected>Bitte auswählen …</option>
                  <option value="BUY">Kauf</option>
                  <option value="SELL">Verkauf</option>
                </select>
                <div class="invalid-feedback">Bitte wähle Kauf oder Verkauf aus.</div>
              </div>
              <div>
                <label class="form-label">Menge<span class="text-danger">*</span></label>
                <input type="number" class="form-control" name="quantity" min="0.00000001" step="0.00000001" required />
                <div class="invalid-feedback">${DEFAULT_QTY_INVALID_MSG}</div>
              </div>
              <div>
                <label class="form-label">Buy/Sell-Preis in $<span class="text-danger">*</span></label>
                <input type="number" class="form-control" name="price" min="0.0001" step="0.0001" required />
                <div class="invalid-feedback">Bitte gib einen gültigen Preis &gt; 0 ein.</div>
              </div>
              <div>
                <label class="form-label">Notiz</label>
                <textarea class="form-control" name="note" rows="2" maxlength="255" placeholder="Optional – max. 255 Zeichen"></textarea>
                <div class="form-text">Max. 255 Zeichen.</div>
              </div>
              <div class="vstack gap-3">
                ${pfgQuestions.map((q) => {
    return `
                    <div>
                      <label class="form-label">${q.label}<span class="text-danger">*</span></label>
                      <div class="d-flex flex-wrap gap-3" role="group">
                        ${[1, 2, 3, 4, 5].map((val) => {
      return `
                          <div class="form-check form-check-inline">
                              <input class="form-check-input" type="radio" name="${q.key}" id="${q.key}-${val}" value="${val}" required />
                              <label class="form-check-label" for="${q.key}-${val}">${val}</label>
                          </div>`;
    }).join("")}
                      </div>
                    </div>
                  `;
  }).join("")}
              </div>
            </form>
          </div>
          <div class="modal-footer d-flex justify-content-between">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="submit" class="btn btn-sm btn-primary" form="txnForm">Speichern</button>
          </div>
        </div>
      </div>
    </div>
    `;

  const formEl = modalEl.querySelector("#txnForm");
  const titleEl = modalEl.querySelector("#modalTxnTitle");
  const submitBtn = modalEl.querySelector("button[type='submit']");

  // Populate asset options
  const assetSelect = modalEl.querySelector("select[name='symbol']");
  if (assetSelect) assetSelect.append(buildAssetOptions());

  // Pre-fill date
  function updateTimestamp() {
    const input = modalEl.querySelector("input[name='timestamp']");
    if (input) {
      input.value = nowForDateTimeLocal(1);
    }
  }

  // Validation
  function validateForm(form) {
    let valid = true;

    // Asset & Side
    const assetSel = form.elements["symbol"];
    if (!assetSel || !assetSel.value) {
      assetSel?.classList.add("is-invalid");
      valid = false;
    } else assetSel.classList.remove("is-invalid");

    // Quantity
    const qtyInput = form.elements["quantity"];
    const qty = parseFloat(qtyInput?.value);
    const qtyFeedback = qtyInput?.nextElementSibling; // <div class="invalid-feedback">

    if (!qtyInput || isNaN(qty) || qty <= 0) {
      if (qtyFeedback) qtyFeedback.textContent = DEFAULT_QTY_INVALID_MSG;
      qtyInput?.classList.add("is-invalid");
      valid = false;
    } else {
      qtyInput.classList.remove("is-invalid");
      if (qtyFeedback) qtyFeedback.textContent = DEFAULT_QTY_INVALID_MSG;
    }

    // Price
    const priceInput = form.elements["price"];
    const price = parseFloat(priceInput?.value);
    if (!priceInput || isNaN(price) || price <= 0) {
      priceInput?.classList.add("is-invalid");
      valid = false;
    } else priceInput.classList.remove("is-invalid");

    // PFG
    for (const q of pfgQuestions) {
      const radios = form.querySelectorAll(`input[name='${q.key}']`);
      const checked = Array.from(radios).find((r) => r.checked);
      if (!checked) {
        radios[0]?.classList.add("is-invalid");
        valid = false;
      } else {
        radios.forEach((r) => r.classList.remove("is-invalid"));
      }
    }

    // Note
    const noteEl = form.elements["note"];
    if (noteEl && noteEl.value && noteEl.value.length > 255) {
      noteEl.classList.add("is-invalid");
      valid = false;
    } else noteEl?.classList.remove("is-invalid");

    // Date/Time
    const tsInput = form.elements["timestamp"];
    if (!tsInput || !tsInput.value) valid = false;

    return valid;
  }

  // Submit 
  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target.closest("form");
    if (!validateForm(form)) return;

    const fd = new FormData(form);
    const symbol = fd.get("symbol");
    const side = fd.get("side");
    const quantity = parseFloat(fd.get("quantity"));
    const price = parseFloat(fd.get("price"));
    const note = (fd.get("note") || "").trim() || undefined;
    const tsLocal = fd.get("timestamp"); // "YYYY-MM-DDTHH:mm" (local)

    const timestamp = tsLocal ? new Date(tsLocal).toISOString().slice(0, 19) : new Date().toISOString().slice(0, 19);

    const pfg = pfgQuestions.map((q) => {
      const v = fd.get(q.key);
      return v != null ? Number(v) : undefined;
    });

    const payload = {
      symbol,
      side,
      quantity,
      price,
      note,
      pfg,
      timestamp,
    };

    try {
      if (mode === "update" && currentTxnId != null) {
        const base = getApiBase();
        const res = await authFetch(
          `${base}/api/txns/${encodeURIComponent(currentTxnId)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(
            msg || `Fehler beim Update (${res.status})`
          );
        }
      } else {
        await postTxn(payload);
      }
      if (typeof onSaved === "function") onSaved(payload);
      close();
    } catch (e) {
      console.error("Transaction speichern fehlgeschlagen:", e);

      const msg = String(e?.message || "");

      if (msg.includes("SELL überschreitet Bestand") || msg.includes("ststus\":409") || e.status === 409) {
        const qtyInput = form.elements["quantity"];
        const qtyFeedback = qtyInput?.nextElementSibling;

        if (qtyFeedback) {
          qtyFeedback.textContent = "Die eingegebene Menge übersteigt den aktuellen Bestand!";
        }
        if (qtyInput) {
          qtyInput.classList.add("is-invalid");
          qtyInput.focus();
        }
        return;
      }

      alert(e?.message || "Fehler beim Speichern der Transaktion.");
    }
  }

  // Initialization
  formEl?.addEventListener("submit", handleSubmit);

  const closeBtn = modalEl.querySelector(".btn-close");
  const cancelBtn = modalEl.querySelector("[data-bs-dismiss='modal']");
  function handleClose() {
    formEl?.reset();
    formEl?.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
    if (typeof onClose === "function") onClose();
  }
  closeBtn?.addEventListener("click", () => bsModal?.hide());
  cancelBtn?.addEventListener("click", () => bsModal?.hide());

  // Bootstrap modal control
  let bsModal;

  function showModal() {
    if (!bsModal) {
      bsModal = new bootstrap.Modal(modalEl, { backdrop: "static" });
      modalEl.addEventListener("hidden.bs.modal", () => handleClose());
    }
    bsModal.show();
  }

  function openCreate({preselectSymbol} = {}) {
    mode = "create";
    currentTxnId = null;

    handleClose();                // Clear form / reset validation
    updateTimestamp();            // Set now

    if (titleEl) titleEl.textContent = "Neue Transaktion";
    if (submitBtn) submitBtn.textContent = "Speichern";

    // Preselect asset if provided
    const symbolSel = formEl.elements["symbol"];
    if (symbolSel && preselectSymbol) {
      const sym = String(preselectSymbol).trim().toUpperCase();
      const optExists = Array.from(symbolSel.options).some(o => o.value === sym);
      if (optExists) {
        symbolSel.value = sym;
      }
    }

    showModal();
  }

  function openForUpdate(tx) {
    if (!tx) return;

    mode = "update";
    currentTxnId = tx.txnId ?? tx.id ?? null;

    handleClose(); // reset

    if (titleEl) titleEl.textContent = "Transaktion bearbeiten";
    if (submitBtn) submitBtn.textContent = "Update";

    // Timestamp
    const tsInput = formEl.elements["timestamp"];
    if (tsInput) tsInput.value = toInputDateTimeLocal(tx.timestamp);

    // Symbol
    const sym =
      (tx.symbol ||
        tx.assetSymbol ||
        (tx.asset && (tx.asset.symbol || tx.asset.assetSymbol)) ||
        "").toString();
    const symbolSel = formEl.elements["symbol"];
    if (symbolSel && sym) {
      symbolSel.value = sym;
    }

    // Side
    const sideSel = formEl.elements["side"];
    if (sideSel && tx.side) {
      sideSel.value = tx.side.toUpperCase();
    }

    // Quantity / Price / Note
    if (formEl.elements["quantity"]) formEl.elements["quantity"].value = tx.quantity;
    if (formEl.elements["price"]) formEl.elements["price"].value = tx.price;
    if (formEl.elements["note"]) formEl.elements["note"].value = tx.note || "";

    // PFG if available (e.g. q1..q5 in response)
    for (const [index, q] of pfgQuestions.entries()) {
      const val =
        tx[q.key] ??
        (Array.isArray(tx.pfgAnswers) ? tx.pfgAnswers[index] : undefined);

      // Clear selection
      formEl
        .querySelectorAll(`input[name='${q.key}']`)
        .forEach((r) => (r.checked = false));

      if (val != null) {
        const radio = formEl.querySelector(
          `input[name='${q.key}'][value='${val}']`
        );
        if (radio) radio.checked = true;
      }
    }

    showModal();
  }

  // "open" remains the Create for external calls
  function open(opts) {
    openCreate(opts);
  }

  function close() {
    document.activeElement?.blur();
    bsModal?.hide();
  }


  return { element: modalEl, open, openForUpdate, close };
}
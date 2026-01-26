// EmotionForm.js

import { html } from "../utils/dom.js";
import { upsertEmotion, updateEmotion, deleteEmotion } from "../services/api.js";

const scaleText = {
  1: "sehr schlecht",
  2: "eher schlecht",
  3: "neutral",
  4: "gut",
  5: "sehr gut",
};

/** Creates the modal component for emotion input */
export function createEmotionForm({ onSaved, onDelete } = {}) {
  let mode = "create";
  let currentId = null; // ID of the current entry (only set in update mode)
  let currentDay = null;

 
  function formatDate(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }



  const modalEl = html`
    <div class="modal fade" tabindex="-1" aria-labelledby="emotionModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-md">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="emotionModalTitle">Neuer Emotionseintrag</h5>
            <button type="button" class="btn-close" aria-label="Schließen"></button>
          </div>
          <div class="modal-body">
            <form id="emotionForm" class="vstack gap-3">
              <!-- Info -->
              <div class="form-text text-warning "><strong>Achtung:<br></strong>Aktuell ist nur ein Eintrag pro Tag möglich! Wenn für dieses Datum bereits ein Eintrag vorhanden ist, wird dieser durch jeden weiteren Eintrag überschrieben.</div>
              <!-- Date -->
              <div>
                <label class="form-label">Datum</label>
                <input type="date" class="form-control" name="day" required readonly />
                <div class="form-text">Wird automatisch auf heute gesetzt.</div>
              </div>
              <!-- Mood Factor -->
              <div>
                <label class="form-label">Stimmungsfaktor (1–5)</label>
                <input type="range" class="form-range" name="moodScale" min="1" max="5" step="1" value="3" />
                <div class="d-flex justify-content-between small text-muted">
                  <span>1 – sehr schlecht</span>
                  <span>3 – neutral</span>
                  <span>5 – sehr gut</span>
                </div>
                <div class="small text-center fw-semibold mt-3" id="emotionLiveLabel">Auswahl: 3 – neutral</div>
              </div>
              <!-- Note -->
              <div>
                <label class="form-label">Notiz</label>
                <textarea class="form-control" name="note" rows="8" maxlength="2500" placeholder="Was geht dir gerade durch den Kopf? Markt, Nachrichten, private Situation…"></textarea>
                <div class="form-text text-end"><span id="emotionCharCount">0</span>/2500</div>
              </div>
            </form>
          </div>
          <div class="modal-footer d-flex justify-content-between">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <div class="d-flex gap-2">
              <!-- Delete only visible in update mode -->
              <button type="button" class="btn btn-sm btn-danger d-none" id="emotionDeleteBtn">Löschen</button>
              <button type="submit" class="btn btn-sm btn-primary" form="emotionForm" id="emotionSubmitBtn">Speichern</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const formEl = modalEl.querySelector("#emotionForm");
  const titleEl = modalEl.querySelector("#emotionModalTitle");
  const dayInput = modalEl.querySelector("input[name='day']");
  const moodInput = modalEl.querySelector("input[name='moodScale']");
  const noteInput = modalEl.querySelector("textarea[name='note']");
  const liveLabel = modalEl.querySelector("#emotionLiveLabel");
  const charCountEl = modalEl.querySelector("#emotionCharCount");
  const deleteBtn = modalEl.querySelector("#emotionDeleteBtn");

  const closeBtn = modalEl.querySelector(".btn-close");
  const cancleBtn = modalEl.querySelector("[data-bs-dismiss='modal']");

  function handleClose() {
    mode = "create";
    currentId = null;
    currentDay = null;
    titleEl.textContent = "Neuer Emotionseintrag";

    const today = new Date();
    dayInput.value = formatDate(today);
    moodInput.value = "3";
    updateLiveLabel();
    noteInput.value = "";
    updateCharCount();
    deleteBtn.classList.add("d-none");
  }

  let bsModal;

  function showModal() {
    if(!bsModal) {
      bsModal = new bootstrap.Modal(modalEl, { backdrop: "static"}); 
      modalEl.addEventListener("hidden.bs.modal", () => handleClose());
    }
    bsModal.show();
  }

  closeBtn?.addEventListener("click", () => {
    document.activeElement?.blur();
    bsModal?.hide();
  });
  cancleBtn?.addEventListener("click", () => {
    bsModal?.hide();
  document.activeElement?.blur();
  });

  function updateLiveLabel() {
    const scale = Number(moodInput.value);
    const desc = scaleText[scale] || "";
    liveLabel.textContent = `Auswahl: ${scale} – ${desc}`;
  }

  function updateCharCount() {
    const len = noteInput.value?.length || 0;
    charCountEl.textContent = String(len);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const day = dayInput.value;
    const scale = Number(moodInput.value);
    const mood = scale;
    const noteRaw = noteInput.value?.trim();
    const note = noteRaw && noteRaw.length > 0 ? noteRaw : null;
    try {
      const dto = { day, mood, note };
      let saved;
      if (mode === "update" && currentId != null) {
        // Update mode: current entry update
        saved = await updateEmotion(currentId, dto);
      } else {
        saved = await upsertEmotion(dto);
      }
      document.activeElement?.blur();
      bsModal?.hide();
      if (typeof onSaved === "function") onSaved(saved);
    } catch (err) {
      console.error("Error saving emotion log:", err);
      alert(
        "Fehler beim Speichern des Emotion-Logs. Bitte versuche es erneut."
      );
    }
  }

  function handleDelete() {
    if (currentId == null) return;
    if (!confirm("Möchtest du diesen Eintrag wirklich löschen?")) return;
    // Backend delete call
    deleteEmotion(currentId)
      .catch((err) => {
        console.error("Error while deleting the emotion log:", err);
        alert("Fehler beim Löschen des Emotion-Logs. Bitte versuche es erneut.");
      })
      .finally(() => {
        document.activeElement?.blur();
        bsModal?.hide();
        if (typeof onDelete === "function") onDelete(currentId);
      });
  }

  function open(entry) {
    if (entry && typeof entry === "object") {
      // Update mode
      mode = "update";
      currentId = entry.id;
      currentDay = entry.day;
      titleEl.textContent = "Emotion-Log bearbeiten";
      dayInput.value = entry.day;
      moodInput.value = String(entry.mood);
      updateLiveLabel();
      noteInput.value = entry.note || "";
      updateCharCount();
      deleteBtn.classList.remove("d-none");
    } else {
      // Create mode
      mode = "create";
      currentId = null;
      currentDay = null;
      titleEl.textContent = "Neuer Emotion-Log";
      const today = new Date();
      dayInput.value = formatDate(today);
      moodInput.value = "3";
      updateLiveLabel();
      noteInput.value = "";
      updateCharCount();
      deleteBtn.classList.add("d-none");
    }
    showModal();
  }


  moodInput.addEventListener("input", updateLiveLabel);
  noteInput.addEventListener("input", updateCharCount);
  formEl.addEventListener("submit", handleSubmit);
  deleteBtn.addEventListener("click", handleDelete);




  return {
    element: modalEl,
    open,
  };
}
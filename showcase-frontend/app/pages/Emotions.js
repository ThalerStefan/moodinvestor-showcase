// /frontend/app/pages/Emotions.js

import { html } from "../utils/dom.js";
import { Card } from "../components/Card.js";
import { getEmotions, deleteEmotion, getEmotionSummary } from "../services/api.js";
import { createEmotionForm } from "../components/EmotionForm.js";
import { createEmotionTable } from "../components/EmotionTable.js";

// Scale mapping used for labels (fallbacks if backend sends only numeric values)
const scaleDescriptions = {
  1: "sehr schlecht",
  2: "eher schlecht",
  3: "neutral",
  4: "gut",
  5: "sehr gut",
};

export function EmotionsPage() {
  const page = html`<div id="page" class="vstack gap-4 mt-3"></div>`;

  // Helper 
  function getQueryParams() {
    return new URLSearchParams(location.search || "");
  }

  function moodLabelFromAverage(avg) {
    if (avg == null || Number.isNaN(avg)) return "—";

    const v = Number(avg);

    if (v >= 4.5) return "sehr gut";
    if (v >= 3.8) return "überwiegend gut";
    if (v >= 2.8) return "neutral";
    if (v >= 2.0) return "überwiegend schlecht";
    return "sehr schlecht";
  }



  
  // 1) KPI ROW (compact, no chart here)
  const kpiRow = html`
    <div class="row g-3">
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="small">Heutige Stimmung</div>
            <div id="kpiToday" class="fs-3 fw-bold">—</div>
            <div id="kpiTodayDesc" class="small text-secondary">—</div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="small">Ø Stimmung 7 Tage</div>
            <div id="kpiAvg7" class="fs-3 fw-bold">—</div>
            <div id="kpiAvg7Desc" class="small text-secondary">—</div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="small">Einträge im Monat</div>
            <div id="kpiCountMonth" class="fs-3 fw-bold">—</div>
            <div id="kpiAvgMonth" class="small text-secondary">Ø Monat: —</div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="small">Tage unter 3</div>
            <div id="kpiBelowNeutral" class="fs-3 fw-bold">—</div>
            <div class="small text-secondary">Anteil im Zeitraum</div>
          </div>
        </div>
      </div>
    </div>
  `;
  page.append(kpiRow);


  // 2) Chart card
  const statusBody = html`
    <div class="vstack gap-2">
      <div class="d-flex justify-content-end">
        <small class="text-muted fw-bold" id="emoLastUpdate">Letztes Update: —</small>
      </div>
      <div style="height: 260px;">
        <canvas id="emotionChart" aria-label="Emotionsverlauf" role="img"></canvas>
      </div>
    </div>
  `;

  const statusCard = Card({
    title: "Mood trend (letzte 60 Tage)",
    body: statusBody,
  });
  page.append(statusCard);

  // 3) Insights grid (2x2 cards) + "Mood factors" collapse
  const insightsBody = html`
    <div class="vstack gap-3">
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="small">Ø Stimmung im aktuellen Monat</div>
              <div id="insAvgMonth" class="fs-5 fw-bold">—</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="small">Häufigste Stimmung</div>
              <div id="insMostFreq" class="fs-5 fw-bold">—</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="small">Anteil unter 3</div>
              <div id="insBelow3" class="fs-5 fw-bold">—</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="small">Aktivster Wochentag</div>
              <div id="insWeekday" class="fs-5 fw-bold">—</div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center">
        <button
          class="btn btn-sm btn-outline-primary"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#moodFactorsCollapse"
          aria-expanded="false"
          aria-controls="moodFactorsCollapse"
        >
          Stimmungsfaktoren
        </button>
      </div>

      <div class="collapse" id="moodFactorsCollapse">
        <div class="card card-body">
          <p class="mb-1"><strong>1</strong> = sehr schlecht – „Ich bin gestresst/überfordert, fühle Angst.“</p>
          <p class="mb-1"><strong>2</strong> = eher schlecht – „Ich bin unsicher, misstrauisch.“</p>
          <p class="mb-1"><strong>3</strong> = neutral – „Ich beobachte, fühle mich okay.“</p>
          <p class="mb-1"><strong>4</strong> = gut – „Ich bin zuversichtlich, aber nicht überdreht.“</p>
          <p class="mb-0"><strong>5</strong> = sehr gut – „Ich bin extrem positiv gestimmt, fühle Euphorie.“</p>
        </div>
      </div>
    </div>
  `;

  const insightsCard = Card({
    title: "Insights",
    body: insightsBody,
  });
  page.append(insightsCard);

  // 4) Table + modal
  let form;

  const tableComp = createEmotionTable({
    onNew: () => form.open(),
    onEdit: (entry) => form.open(entry),
    onDelete: (ids) => handleDelete(ids),
  });
  page.append(tableComp.element);

  // Modal for create/update
  form = createEmotionForm({
    onSaved: () => loadData(),
    onDelete: (id) => handleDelete([id]),
  });
  page.append(form.element);

  // State
  let allEntries = [];
  let chart = null;

  function fmtPercent(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    return `${Math.round(n)}%`;
  }

  // Render: Summary -> KPIs + Chart
  function updateFromSummary(summary) {
    const kpiTodayEl = page.querySelector("#kpiToday");
    const kpiTodayDescEl = page.querySelector("#kpiTodayDesc");
    const kpiAvg7El = page.querySelector("#kpiAvg7");
    const kpiAvg7DescEl = page.querySelector("#kpiAvg7Desc")
    const kpiCountMonthEl = page.querySelector("#kpiCountMonth");
    const kpiAvgMonthEl = page.querySelector("#kpiAvgMonth");
    const kpiBelowNeutralEl = page.querySelector("#kpiBelowNeutral");

    const insAvgMonthEl = page.querySelector("#insAvgMonth");
    const insMostFreqEl = page.querySelector("#insMostFreq");
    const insMostFreqDescEl = page.querySelector("#insMostFreqDesc");
    const insBelow3El = page.querySelector("#insBelow3");
    const insWeekdayEl = page.querySelector("#insWeekday");

    const lastUpdateEl = page.querySelector("#emoLastUpdate");
    const ctx = page.querySelector("#emotionChart")?.getContext("2d");

    // Destroy previous chart to avoid duplicates
    if (chart) {
      chart.destroy();
      chart = null;
    }

    // Fallback: no summary -> neutral UI
    if (!summary) {
      if (kpiTodayEl) kpiTodayEl.textContent = "—";
      if (kpiTodayDescEl) kpiTodayDescEl.textContent = "—";
      if (kpiAvg7El) kpiAvg7El.textContent = "—";
      if (kpiCountMonthEl) kpiCountMonthEl.textContent = "—";
      if (kpiAvgMonthEl) kpiAvgMonthEl.textContent = "Ø Monat: —";
      if (kpiBelowNeutralEl) kpiBelowNeutralEl.textContent = "—";

      if (insAvgMonthEl) insAvgMonthEl.textContent = "—";
      if (insMostFreqEl) insMostFreqEl.textContent = "—";
      if (insMostFreqDescEl) insMostFreqDescEl.textContent = "—";
      if (insBelow3El) insBelow3El.textContent = "—";
      if (insWeekdayEl) insWeekdayEl.textContent = "—";

      if (lastUpdateEl) lastUpdateEl.textContent = "Letztes Update: —";

      // Neutral chart (60 days, value 3)
      if (ctx) {
        const today = new Date();
        const labels = [];
        const data = [];
        for (let i = 59; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          labels.push(d.toLocaleDateString("de-AT"));
          data.push(3);
        }
        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [{ label: "Stimmungsverlauf (neutral)", data, tension: 0.2, pointRadius: 0, borderWidth: 2 }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: { color: getComputedStyle(document.body).getPropertyValue("--bs-body-color").trim() },
                grid: { color: getComputedStyle(document.body).getPropertyValue("--bs-border-color").trim() },
              },
              y: {
                min: 1,
                max: 5,
                ticks: { color: getComputedStyle(document.body).getPropertyValue("--bs-body-color").trim(), stepSize: 1 },
                grid: { color: getComputedStyle(document.body).getPropertyValue("--bs-border-color").trim() },
              },
            },
          },
        });
      }
      return;
    }

    // KPIs
    const tm = summary.todayMood;
    const tDesc = summary.todayMoodDescription || (tm != null ? scaleDescriptions[tm] : null);

    if (kpiTodayEl) kpiTodayEl.textContent = tm != null ? String(tm) : "—";
    if (kpiTodayDescEl) kpiTodayDescEl.textContent = tm != null ? `— ${tDesc || ""}` : "—";

    if (kpiAvg7El) kpiAvg7El.textContent = summary.averageLast7 != null ? Number(summary.averageLast7).toFixed(1) : "—";
    if (kpiAvg7DescEl) kpiAvg7DescEl.textContent = summary.averageLast7 != null ? `— ${moodLabelFromAverage(summary.averageLast7)}` : "—";

    if (kpiCountMonthEl) kpiCountMonthEl.textContent = summary.countCurrentMonth != null ? String(summary.countCurrentMonth) : "0";
    if (kpiAvgMonthEl) kpiAvgMonthEl.textContent = summary.averageMonthMood != null ? `Ø Monat: ${Number(summary.averageMonthMood).toFixed(1)}` : "Ø Monat: —";
    if (kpiBelowNeutralEl) kpiBelowNeutralEl.textContent = summary.percentageBelowNeutral != null ? fmtPercent(summary.percentageBelowNeutral) : "—";

    // Insights
    if (insAvgMonthEl) insAvgMonthEl.textContent = summary.averageMonthMood != null ? Number(summary.averageMonthMood).toFixed(1) : "—";
    if (insMostFreqEl) insMostFreqEl.textContent = summary.mostFrequentMood != null ? String(summary.mostFrequentMood) : "—";
    if (insMostFreqDescEl) {
      const desc = summary.mostFrequentMoodDescription || (summary.mostFrequentMood != null ? scaleDescriptions[summary.mostFrequentMood] : "");
      insMostFreqDescEl.textContent = desc ? `— ${desc}` : "—";
    }
    if (insBelow3El) insBelow3El.textContent = summary.percentageBelowNeutral != null ? fmtPercent(summary.percentageBelowNeutral) : "—";
    if (insWeekdayEl) insWeekdayEl.textContent = summary.mostFrequentDay || "—";

    // Last update: last label date (labels are ISO yyyy-MM-dd)
    if (lastUpdateEl) {
      if (Array.isArray(summary.labels) && summary.labels.length) {
        const lastLabel = summary.labels[summary.labels.length - 1];
        const dateObj = new Date(lastLabel);
        lastUpdateEl.textContent = `Letztes Update: ${dateObj.toLocaleDateString("de-AT")}`;
      } else {
        lastUpdateEl.textContent = "Letztes Update: —";
      }
    }

    // Chart
    if (!ctx) return;
    const labels = Array.isArray(summary.labels)
      ? summary.labels.map((s) => new Date(s).toLocaleDateString("de-AT"))
      : [];
    const data = Array.isArray(summary.moods) ? summary.moods.map((v) => Number(v)) : [];

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Stimmungsverlauf",
            data,
            tension: 0.2,
            pointRadius: 2,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: getComputedStyle(document.body).getPropertyValue("--bs-body-color").trim() },
            grid: { color: getComputedStyle(document.body).getPropertyValue("--bs-border-color").trim() },
          },
          y: {
            min: 1,
            max: 5,
            ticks: { color: getComputedStyle(document.body).getPropertyValue("--bs-body-color").trim(), stepSize: 1 },
            grid: { color: getComputedStyle(document.body).getPropertyValue("--bs-border-color").trim() },
          },
        },
      },
    });
  }

  // Data load
  async function loadData() {
    try {
      const [list, summary] = await Promise.all([getEmotions(), getEmotionSummary(60)]);

      allEntries = Array.isArray(list) ? list.slice() : [];
      tableComp.setData(allEntries);

      updateFromSummary(summary || null);
    } catch (err) {
      console.error("Failed to load emotions:", err);

      tableComp.setData([]);
      updateFromSummary(null);
    }
  }

  // Delete handler
  async function handleDelete(idsToDelete) {
    if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) return;

    if (!confirm("Möchtest du die ausgewählten Einträge wirklich entfernen?")) return;

    try {
      await Promise.all(idsToDelete.map((id) => deleteEmotion(id)));
      await loadData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Fehler beim Löschen der Einträge. Bitte versuche es erneut.");
    }
  }

  // Initial load
  loadData();

  // Open form 
  const params = getQueryParams();
  const isNew = params.get("new") === "1";

  if (isNew) form.open();

  if (isNew) {
    params.delete("new");
    const qs = params.toString();
    const newPath = qs ? `${location.pathname}?${qs}` : location.pathname;
    history.replaceState(null, "", newPath);
  }
  return page;
}

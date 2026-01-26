// /frontend/app/components/Navbar.js
// Responsive navbar with hash routing and theme toggle (Dark/Light).

import { html } from "../utils/dom.js";
import { getState, setState, subscribe } from "../store.js";
import { Ticker } from "./Ticker.js";

export function Navbar() {
  const state = getState();

  const el = html`
  <div class="container-flex fixed-on-navbar-top">
    <nav class="navbar navbar-expand-lg border-bottom">

        <div class="container">
          <a class="navbar-brand d-flex align-items-center gap-2" href="/frontend/dashboard">
            <img src="./assets/img/Logo Light-Theme.png" alt="MoodInvestor" height="35" class="d-none theme-light-inline"/>
            <img src="./assets/img/Logo Dark-Theme.png"  alt="MoodInvestor" height="35" class="d-none theme-dark-inline"/>
          </a>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#miNav" aria-controls="miNav" aria-expanded="false" aria-label="Navigation umschalten">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="miNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 align-items-end">

              <!-- Dashboard -->
              <li class="nav-item">
                <a class="nav-link" href="/frontend/dashboard"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>
              </li>

              <!-- Txn-Dropdown -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="txnDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fa-solid fa-money-bill-trend-up"></i> Transaktionen
                </a>
                <ul class="dropdown-menu" aria-labelledby="txnDropdown">
                  <li><a class="dropdown-item" href="/frontend/transactions?new=1">Neue Transaktion</a></li>
                  <li><a class="dropdown-item" href="/frontend/transactions">Transaktionen anzeigen</a></li>
                </ul>
              </li>

              <!-- Emotion-Dropdown -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="emoDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fa-regular fa-pen-to-square"></i> Emotion-Log
                </a>
                <ul class="dropdown-menu" aria-labelledby="emoDropdown">
                  <li><a class="dropdown-item" href="/frontend/emotions?new=1">Neue Emotion eintragen</a></li>
                  <li><a class="dropdown-item" href="/frontend/emotions">Verlauf anzeigen</a></li>
                </ul>
              </li>

              <!-- Academy-Dropdown -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="academyDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fa-solid fa-graduation-cap"></i> Academy
                </a>
                <ul class="dropdown-menu" aria-labelledby="academyDropdown">
                  <li><a class="dropdown-item" href="/frontend/academy?cat=Alle">Alle</a></li>
                  <li><a class="dropdown-item" href="/frontend/academy?cat=Bitcoin%20%26%20Crypto">Bitcoin & Crypto</a></li>
                  <li><a class="dropdown-item" href="/frontend/academy?cat=Investieren">Investieren</a></li>
                  <li><a class="dropdown-item" href="/frontend/academy?cat=Emotionen">Emotionen</a></li>
                  <li><a class="dropdown-item" href="/frontend/academy?cat=Strategien">Strategien</a></li>
                  <li><a class="dropdown-item" href="/frontend/academy?cat=Videos">Videos</a></li>
                </ul>
              </li>

            </ul>

            <!-- Theme-Toggle -->
            <div style="float: right;" class="d-flex align-items-center gap-2">
              <button type="button"class="btn btn-sm" id="themeToggle" aria-label="Theme umschalten">
                ${state.theme === "theme-dark" ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`}
              </button>
              <button id="mi-signout-btn" class="btn btn-sm border d-none" type="button">
                <i class="fa-solid fa-arrow-right-from-bracket me-2"></i>Sign out
              </button>
            </div>
          </div>
        </div>

    </nav>

    <div class="container" id="navbarTicker"></div>

  </div>
  `;

  // ------------ Logo-Sync ------------
  function syncLogos() {
    const isDark =
      document.documentElement.classList.contains("theme-dark") ||
      document.body?.classList.contains("theme-dark");

    const darkImg = el.querySelector(".theme-dark-inline");
    const lightImg = el.querySelector(".theme-light-inline");

    if (darkImg) darkImg.classList.toggle("d-none", !isDark);
    if (lightImg) lightImg.classList.toggle("d-none", isDark);
  }
  syncLogos();

  // ------------ Theme-Toggle ------------
  el.querySelector("#themeToggle")?.addEventListener("click", () => {
    const next = document.documentElement.classList.contains("theme-dark")
      ? "theme-light"
      : "theme-dark";
    setState({ theme: next });
    location.reload();
  });

  el.querySelector("#navbarTicker")?.appendChild(Ticker());

  subscribe((s) => {
    const btn = el.querySelector("#themeToggle");
    if (btn) btn.innerHTML = s.theme === "theme-dark" ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
    syncLogos();
  });

  // ------------ Clerk Sign out ---------------
  const signOutBtn = el.querySelector("#mi-signout-btn");

  function isSignedIn() {
    return !!(window.Clerk && window.Clerk.user);
  }

  function syncSignOutVisibility() {
    if (!signOutBtn) return;
    signOutBtn.classList.toggle("d-none", !isSignedIn());
  }

  // initial sync
  syncSignOutVisibility();

  // keep in sync
  const authSyncInterval = setInterval(syncSignOutVisibility, 1000);

  // cleanup hook
  el.destroy = () => {
    clearInterval(authSyncInterval);
  }

  signOutBtn.addEventListener("click", async () => {
    const clerk = window.Clerk;
    if (!clerk) return;

    try {
      signOutBtn.disabled = true;

      // Clerk sign out
      await clerk.signOut();

      // Redirect to auth page
      history.pushState({}, "", "/frontend/auth");
      window.dispatchEvent(new PopStateEvent("popstate"));

      // Hard reload to clear any cached state/UI
      location.reload();
    } catch (e) {
      console.error("Sign out failed:", e);
      signOutBtn.disabled = false;
      syncSignOutVisibility();
    }
  })

  return el;
}

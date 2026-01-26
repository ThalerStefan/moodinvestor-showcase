// /frontend/app/pages/Auth.js
// Auth page for History-API SPA (NO hash routing)
// Path: /frontend/auth
// Supports mode=signin | mode=signup via query string

import { html } from "../utils/dom.js";

function getMode() {
  const qs = new URLSearchParams(location.search);
  return (qs.get("mode") || "signin").toLowerCase();
}

function setMode(mode) {
  const qs = new URLSearchParams(location.search);
  if (mode === "signup") qs.set("mode", "signup");
  else qs.delete("mode");

  const query = qs.toString();
  const path = query ? `/frontend/auth?${query}` : `/frontend/auth`;
  history.pushState({}, "", path);
}

function getActiveTheme() {
  const root = document.documentElement;
  if (root.classList.contains("theme-light")) return "light";
  return "dark";
}


export function AuthPage() {
  const clerk = window.Clerk;

  if (!clerk) {
    return html`
      <div class="alert alert-danger">
        Clerk is not loaded.
      </div>
    `;
  }

  // Already signed in → router will redirect, just show placeholder
  if (clerk.user) {
    return html`
      <div class="text-center my-5">
        Redirecting…
      </div>
    `;
  }

  const LOGO = {
    dark: "/assets/img/Logo Dark-Theme.png",
    light: "/assets/img/Logo Light-Theme.png",
  }

  const node = html`
    <div class="row justify-content-center mt-3">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card mi-card shadow-sm">
          <div class="card-body p-4">

            <div class="d-flex justify-content-center align-items-center mb-3">
              <div class="d-flex align-items-center gap-2">
                <img id="mi-auth-logo" src="${LOGO[getActiveTheme()]}" alt="MoodInvestor" style="height: 80px; width: auto; display: block;" />
              </div>
            </div>

            <div class="d-flex justify-content-center">
              <div id="clerk-host"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  const host = node.querySelector("#clerk-host");

  const logoEl = node.querySelector("#mi-auth-logo");

  let mounted = null; // "signin" | "signup"

  function unmount() {
    try {
      if (mounted === "signin") clerk.unmountSignIn(host);
      if (mounted === "signup") clerk.unmountSignUp(host);
    } catch { }
    host.innerHTML = "";
    mounted = null;
  }

  async function mount(mode) {
    if (mounted === mode) return;

    unmount();

    // Ensure Clerk is ready
    if (typeof clerk.load === "function") {
      try {
        await clerk.load();
      } catch { }
      
    }

    if (mode === "signup") {
      clerk.mountSignUp(host, {
        signInUrl: "/frontend/auth",
        forceRedirectUrl: "/frontend/dashboard",
        fallbackRedirectUrl: "/frontend/dashboard",
      });
    } else {
      clerk.mountSignIn(host, {
        signUpUrl: "/frontend/auth?mode=signup",
        forceRedirectUrl: "/frontend/dashboard",
        fallbackRedirectUrl: "/frontend/dashboard",
      });
    }

    mounted = mode;
  }

  function syncLogoToTheme() {
    if (!logoEl) return;
    const theme = getActiveTheme();
    const nextSrc = LOGO[theme] || LOGO.dark;
    if (logoEl.getAttribute("src") !== nextSrc) {
      logoEl.setAttribute("src", nextSrc);
    }
  }

  // Observe class changes on <html> (theme toggles usually change classes there)
  const themeObserver = new MutationObserver(() => {
    syncLogoToTheme();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });



  // Initial mount
  mount(getMode());

  // Cleanup hook for router
  node.destroy = () => {
    try {
      themeObserver.disconnect();
    } catch { }
    
    unmount();
  };

  return node;
}

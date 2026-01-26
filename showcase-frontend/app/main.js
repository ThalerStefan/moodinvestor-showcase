// /frontend/app/main.js

import { $ } from "./utils/dom.js";
import { Navbar } from "../app/components/Navbar.js";
import { Footer } from "../app/components/Footer.js";
import { loadFromSession } from "./store.js";
import { startPriceStream } from "./services/wsPrices.js";
import { ensureClerkReady } from "./services/clerk.js";  
import * as Router from "./router.js";
import { waitForClerkReady } from "./services/clerkReady.js";

// makes prices instantly available after reload
loadFromSession();

// Fallback error handling
window.addEventListener("error", (e) => {
  console.error("Global error:", e.error || e.message || e);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason || e);
});

async function boot() {

  try {
    await waitForClerkReady();
  } catch (e) {
    console.warn("[Auth] Clerk not ready:", e);
  }


  const navMount = $("#app-navbar");
  const footMount = $("#app-footer");

  if (!navMount || !footMount) {
    console.error("One mount is missing (#app-navbar / #app-footer).");
    return;
  }

  // Navbar
  navMount.innerHTML = "";
  navMount.append(Navbar());

  // Footer
  footMount.innerHTML = "";
  footMount.append(Footer());

  
  await ensureClerkReady();


  Router.start();

  if (!location.pathname.endsWith("/auth")) {
    startPriceStream();
  }
}

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "backToTopBtn") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

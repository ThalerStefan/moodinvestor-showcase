// History-Router (/frontend/dashboard etc.)
// /frontend/app/utils/router.js
// Minimal hash router with guards for 404 and redirects.

import { $, html } from "./utils/dom.js";

const routes = {
    "": () => import("../app/pages/Dashboard.js").then((m) => m.DashboardPage()),
    "dashboard": () => import("../app/pages/Dashboard.js").then((m) => m.DashboardPage()),
    "transactions": () => import("../app/pages/Transactions.js").then((m) => m.TransactionsPage()),
    "emotions": () => import("../app/pages/Emotions.js").then((m) => m.EmotionsPage()),
    "academy": () => import("../app/pages/Academy.js").then((m) => m.AcademyPage()),
    "article": () => import("../app/pages/Article.js").then((m) => m.ArticlePage()),
    "auth": () => import("../app/pages/Auth.js").then((m) => m.AuthPage()),
};

// --- CONFIG: base path of your app (matches <base href="/frontend/">) ---
const BASE = "/frontend";

// --- After-login storage (now stores PATHS, not hashes) ---
function getAfterLoginPath() {
    return sessionStorage.getItem("MI_AFTER_LOGIN_PATH") || `${BASE}/dashboard`;
}
function setAfterLoginPath(path) {
    sessionStorage.setItem("MI_AFTER_LOGIN_PATH", path || `${BASE}/dashboard`);
}
function clearAfterLoginPath() {
    sessionStorage.removeItem("MI_AFTER_LOGIN_PATH");
}

function isAuthRoute(routeKey) {
    return routeKey === "auth";
}

// Convert current location to { routeKey, searchParams }
function parseLocation() {
    // Example:
    // location.pathname: /frontend/auth
    // location.search: ?mode=signup
    let path = location.pathname || "/";
    if (path.startsWith(BASE)) path = path.slice(BASE.length); // -> "/auth"
    if (path.startsWith("/")) path = path.slice(1); // -> "auth"

    path = path.replace(/\/+$/, "");

    const routeKey = (path || "").toLowerCase(); // "" => dashboard
    const query = new URLSearchParams(location.search || "");
    return { routeKey, query };
}

// Build a full app path under BASE
function toAppPath(routeKey, queryString = "") {
    const key = routeKey ? `/${routeKey}` : "/dashboard";
    return `${BASE}${key}${queryString}`;
}

// Track current mounted page node to call its destroy() on route changes
let currentPageNode = null;

function cleanupCurrentPage() {
    try {
        if (currentPageNode && typeof currentPageNode.destroy === "function") {
            currentPageNode.destroy();
        }
    } catch (e) {
        console.warn("Page cleanup failed:", e);
    } finally {
        currentPageNode = null;
    }
}

// Central navigation helper
function navigate(path, { replace = false } = {}) {
    if (!path.startsWith(BASE)) {
        // allow passing "/auth" or "auth"
        if (path.startsWith("/")) path = `${BASE}${path}`;
        else path = `${BASE}/${path}`;
    }

    const current = location.pathname + location.search;
    if (current === path) return;

    if (replace) history.replaceState({}, "", path);
    else history.pushState({}, "", path);

    // Trigger render immediately (popstate doesn't fire on pushState)
    render();
}

async function render() {
    const mount = $("#app-root");
    if (!mount) {
        console.error("#app-root not found");
        return;
    }



    const { routeKey, query } = parseLocation();

    // ----- CLERK READY ASSUMPTION -----
    // main.js already does: await ensureClerkReady(); Router.start();
    // So we do NOT poll / setTimeout here (that causes navigation flood).
    const clerk = window.Clerk;
    const isClerkReady = !!clerk && clerk.loaded === true;

    if (!isClerkReady) {
        mount.innerHTML = "";
        mount.append(
            html`
        <div class="text-center my-5">
          <div class="spinner-border" role="status" aria-label="Loading"></div>
          <div class="text-muted small mt-2">Loading authentication…</div>
        </div>
      `
        );
        return;
    }

    const isSignedIn = !!clerk.user;

    // ----- AUTH GUARD -----
    // 1) Not signed in: everything except /auth -> /auth (remember destination)
    if (!isSignedIn && !isAuthRoute(routeKey)) {
        setAfterLoginPath(location.pathname + location.search);
        navigate(toAppPath("auth"), { replace: true });
        return;
    }

    // 2) Signed in: /auth should not be shown -> go to remembered path
    if (isSignedIn && isAuthRoute(routeKey)) {
        const target = getAfterLoginPath();
        clearAfterLoginPath();
        navigate(target, { replace: true });
        return;
    }


    // Cleanup previous page
    cleanupCurrentPage();


    // ----- PAGE RESOLVE -----
    // default route: dashboard
    const key = routeKey === "" ? "dashboard" : routeKey;
    const pageFactory = routes[key] || routes["dashboard"];

    mount.innerHTML = "";
    mount.append(
        html`
      <div class="text-center my-5">
        <div class="spinner-border" role="status" aria-label="Loading"></div>
      </div>
    `
    );

    try {
        const node = await pageFactory({ query }); // optional: your pages can ignore arg
        currentPageNode = node;
        mount.innerHTML = "";
        mount.append(node);
    } catch (e) {
        console.error("Render error:", e);
        mount.innerHTML = `
      <div class="alert alert-warning" role="alert">
        Seite konnte nicht geladen werden: ${e?.message || e}
      </div>
    `;
    }
}

export function start() {
    // Back/forward
    window.addEventListener("popstate", render);

    // Cleanup on unload
    window.addEventListener("beforeunload", cleanupCurrentPage);

    // intercept internal <a href="/frontend/..."> clicks
    document.addEventListener("click", (e) => {
        const a = e.target?.closest?.("a");
        if (!a) return;

        const href = a.getAttribute("href");
        if (!href) return;

        // Ignore new tab / external / downloads / mailto / hash-only
        if (
            a.target === "_blank" ||
            href.startsWith("http") ||
            href.startsWith("mailto:") ||
            href.startsWith("#")
        ) {
            return;
        }

        // Only intercept links within our app base
        const isInternal =
            href.startsWith(BASE) ||
            href.startsWith("/auth") ||
            href.startsWith("/dashboard") ||
            href.startsWith("/transactions") ||
            href.startsWith("/emotions") ||
            href.startsWith("/academy") ||
            href.startsWith("/article");

        if (!isInternal) return;

        // We will handle routing ourselves
        e.preventDefault();

        const clerk = window.Clerk;
        const isSignedIn = !!(clerk && clerk.loaded === true && clerk.user);

        // Normalize href to full app path
        const targetHref = href.startsWith(BASE)
            ? href
            : href.startsWith("/")
                ? `${BASE}${href}`
                : `${BASE}/${href}`;

        // If signed out: redirect to auth (and remember destination)
        if (!isSignedIn && !targetHref.startsWith(`${BASE}/auth`)) {
            setAfterLoginPath(targetHref);
            navigate(toAppPath("auth"), { replace: true });
            return;
        }

        // Otherwise go normally
        navigate(targetHref);
    });


    // If user opens "/frontend/" -> go dashboard
    if (location.pathname === BASE || location.pathname === `${BASE}/`) {
        navigate(toAppPath("dashboard"), { replace: true });
        return;
    }

    render();
}

// Export navigate for other modules if needed (e.g., Navbar buttons)
export const go = navigate;

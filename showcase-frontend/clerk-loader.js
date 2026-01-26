(async () => {

    // Load config (dev defaults can live in repo, prod is injected at container start)
    const res = await fetch("./config.json", { cache: "no-store" });
    const cfg = await res.json();

    const host = window.location.hostname;

    // Decide based on hostname
    const isLocal =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.endsWith(".localhost");

    const publishableKey = isLocal
        ? cfg.CLERK_PUBLISHABLE_KEY_DEV
        : cfg.CLERK_PUBLISHABLE_KEY_PROD;

    const scriptUrl = isLocal
        ? cfg.CLERK_SCRIPT_URL_DEV
        : cfg.CLERK_SCRIPT_URL_PROD;

    if (!publishableKey || !scriptUrl) {
        console.error("Clerk config missing:", { isLocal, publishableKey, scriptUrl, cfg });
        throw new Error("Clerk config missing (config.json)");
    }

    // Inject Clerk script
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = scriptUrl;
    s.setAttribute("data-clerk-publishable-key", publishableKey);

    document.head.appendChild(s);
})();
// /frontend/app/pages/Academy.js (v1.0)
// Internal articles are fetched from AcademyContent.js

import { html } from "../utils/dom.js";
import { academyContentItems as contentItems, academyArticles, } from "../components/AcademyContent.js";

// Reads the "cat" parameter
function getCategoryFromUrl() {
  const params = new URLSearchParams(location.search || "");
  return params.get("cat") || "Alle";
}


// Helper: Reads the "article" parameter from the current URL 
// returns NULL if none is set
function getCurrentArticleIdFromUrl() {
  const params = new URLSearchParams(location.search || "");
  return params.get("article") || null;
}

// Determines the source label of a content item
// Internal: MI-Logo, External: URL
function createSourceLabel(item) {
  const span = document.createElement("span");
  span.className = "badge mi-source-badge";

  // Internal content (MoodInvestor / own academy)
  if (item.type === "internal") {
    const imgLight = document.createElement("img");
    imgLight.src = "./assets/img/Logo Light-Theme.png";
    imgLight.alt = "MoodInvestor";
    imgLight.height = 14;
    imgLight.className = "theme-light-inline";

    const imgDark = document.createElement("img");
    imgDark.src = "./assets/img/Logo Dark-Theme.png";
    imgDark.alt = "MoodInvestor";
    imgDark.height = 14;
    imgDark.className = "theme-dark-inline";

    // Insert both logos – CSS hides one of them
    span.append(imgLight, imgDark);

    const text = document.createElement("span");
    // text.textContent = "Intern";
    text.className = "mi-source-text";
    span.append(text);

  } else {
    // External source with link icon
    const icon = document.createElement("span");
    icon.textContent = "🔗";
    icon.className = "mi-source-icon";
    span.append(icon);

    let label = "Extern";
    try {
      const url = new URL(item.url);
      label = url.hostname.replace(/^www\./, "");
    } catch {
      // Fallback remains "Extern"
    }

    const text = document.createElement("span");
    text.textContent = label;
    text.className = "mi-source-text";
    span.append(text);
  }

  return span;
}


// Creates a single responsive content card
function createContentCard(item) {
  const col = document.createElement("div");
  col.className = "col-12 col-md-6 col-lg-4 d-flex mb-4";

  const card = document.createElement("div");
  card.className = "card card-hover mb-4 flex-fill h-100";

  const isInternal = item.type === "internal";
  const isVideo =
    item.category === "Videos" ||
    /youtube\.com|youtu\.be/.test(item.url || "");

  // ---------- Clickable image area ----------
  //
  // For internal content: link, same SPA
  // For external content: New tab
  const imageLink = document.createElement("a");
  imageLink.href = item.url;
  imageLink.className = "ratio ratio-16x9 overflow-hidden d-block";

  if (isInternal) {
    imageLink.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState(null, "", item.url);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  } else {
    imageLink.target = "_blank";
    imageLink.rel = "noopener noreferrer";
  }

  if (item.image) {
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title || "";
    img.className = "w-100 h-100 object-fit-cover rounded-top";
    imageLink.append(img);
  } else {
    // Fallback: gray area with icon
    const placeholder = document.createElement("div");
    placeholder.className =
      "w-100 h-100 bg-secondary-subtle d-flex align-items-center justify-content-center";
    const icon = document.createElement("span");
    icon.className = "fs-1 opacity-50";
    icon.textContent = item.icon || "📄";
    placeholder.append(icon);
    imageLink.append(placeholder);
  }

  card.append(imageLink);

  // ---------- Body ----------
  const body = document.createElement("div");
  body.className = "card-body d-flex flex-column justify-content-between";

  const cat = document.createElement("span");
  cat.className = "badge bg-secondary mb-2";
  cat.textContent = item.category;
  body.append(cat);

  const title = document.createElement("h5");
  title.className = "card-title";
  title.textContent = item.title;
  body.append(title);

  const teaser = document.createElement("p");
  teaser.className = "card-text text-muted mb-3 flex-grow-1";
  teaser.textContent = item.teaser;
  body.append(teaser);

  card.append(body);

  // ---------- Footer: Source + Button ----------
  const footer = document.createElement("div");
  footer.className =
    "card-footer d-flex justify-content-between align-items-center bg-transparent border-top-0 pt-0 pb-3 px-3";

  const sourceLabel = createSourceLabel(item);
  footer.append(sourceLabel);

  const btn = document.createElement("a");
  btn.className = "btn btn-sm btn-outline-primary";
  btn.href = item.url;

  if (isInternal) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState(null, "", item.url);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  } else {
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
  }
  
  if (isInternal) {
    btn.textContent = "Lesen";
  } else if (isVideo) {
    btn.textContent = "Video ansehen";
  } else {
    btn.textContent = "Zum Artikel";
  }

  footer.append(btn);
  card.append(footer);

  col.append(card);
  return col;
}

// Renders the card grid for the given category
// gridEl is passed from outside (e.g., the gridContainer element from AcademyPage)
function renderContentGrid(category, gridEl) {
  const grid = gridEl || document.getElementById("mi-academy-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const items = contentItems.filter((it) => {
    if (!category || category === "Alle") return true;
    return it.category === category;
  });

  for (const it of items) {
    grid.append(createContentCard(it));
  }

  // If no matches, show a brief note
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "col-12 text-center py-5";
    empty.innerHTML =
      '<div class="alert alert-info">Keine Inhalte in dieser Kategorie.</div>';
    grid.append(empty);
  }
}



// Renders - if available - the detail view of an article
// containerEl is passed from outside
function renderArticleDetail(articleId, containerEl) {
  const container = containerEl || document.getElementById("mi-academy-article");
  if (!container) return;

  container.innerHTML = "";

  if (!articleId) return;

  const article = academyArticles?.[articleId];
  if (!article) {
    const alert = document.createElement("div");
    alert.className = "alert alert-warning mt-3";
    alert.textContent = "Der angeforderte Artikel konnte nicht gefunden werden.";
    container.append(alert);
    return;
  }

  const card = document.createElement("article");
  card.className = "card shadow-sm mt-3";

  const header = document.createElement("div");
  header.className = "card-header d-flex justify-content-between align-items-center flex-wrap gap-2";

  const title = document.createElement("h2");
  title.className = "h5 mb-0";
  title.textContent = article.title || "Artikel";
  header.append(title);

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "btn btn-sm btn-outline-secondary";
  backBtn.textContent = "Zur Übersicht";

  backBtn.addEventListener("click", () => {
    history.pushState(null, "", "/frontend/academy");

    // Clear detail view, show overview
    container.innerHTML = "";
    const grid = document.getElementById("mi-academy-grid");
    if (grid) {
      grid.style.display = "";
    }
  });

  header.append(backBtn);
  card.append(header);

  const body = document.createElement("div");
  body.className = "card-body";

  if (article.bodyNode instanceof Node) {
    body.append(article.bodyNode);
  } else if (typeof article.html === "string") {
    body.innerHTML = article.html;
  } else if (typeof article.text === "string") {
    const p = document.createElement("p");
    p.textContent = article.text;
    body.append(p);
  } else {
    const p = document.createElement("p");
    p.textContent =
      "Für diesen Artikel sind noch keine Inhalte hinterlegt. Bitte in AcademyContent.js ergänzen.";
    body.append(p);
  }

  card.append(body);
  container.append(card);
}


// Main function for the Academy page. Returns a fully constructed page container
export function AcademyPage() {
  const page = html`<div class="vstack gap-4 mt-3"></div>`;

  // 1) Hero Section
  const hero = html`
    <section class="card border-0 shadow-sm">
      <div class="card-body py-5 px-4 px-md-5">
        <h1 class="display-5 fw-bold mb-3">MoodInvestor Academy</h1>
        <p class="lead">
          Lerne, wie du beim Investieren einen kühlen Kopf bewahrst und deine Emotionen in den Griff bekommst.
        </p>
        <p class="mb-0">
          Hier findest du fundierte Artikel, Strategien und Videos zu Bitcoin, Investments und Emotionsmanagement –
          sowohl eigene Inhalte als auch verlässliche Quellen aus dem Web.
        </p>
      </div>
    </section>
  `;
  page.append(hero);

  // 2) Tabs/Categories
  const categories = ["Alle", "Emotionen", "Investieren", "Bitcoin & Crypto", "Strategien", "Videos"];
  const navWrapper = document.createElement("div");
  navWrapper.className = "mt-3";

  const ul = document.createElement("ul");
  ul.className = "nav nav-tabs flex-wrap gap-2";
  ul.setAttribute("role", "tablist");

  categories.forEach((cat, idx) => {
    const li = document.createElement("li");
    li.className = "nav-item fw-bold";

    const btn = document.createElement("button");
    btn.className = `nav-link ${idx === 0 ? "active" : ""}`;
    btn.type = "button";
    btn.setAttribute("data-category", cat);
    btn.textContent = cat;

    li.append(btn);
    ul.append(li);
  });


  navWrapper.append(ul);
  page.append(navWrapper);

  // 3) Container for article detail view
  const articleContainer = document.createElement("div");
  articleContainer.id = "mi-academy-article";
  page.append(articleContainer);

  // 4) Grid container for cards
  const gridContainer = document.createElement("div");
  gridContainer.id = "mi-academy-grid";
  gridContainer.className = "row row-cols-1 row-cols-md-2 row-cols-lg-3 mt-3";
  page.append(gridContainer);

  // Initial rendering
  // a) Directly fill card grid with category "Alle"
  const initialCat = getCategoryFromUrl();

  // Set tabs visually
  ul.querySelectorAll(".nav-link").forEach((lnk) => {
    const cat = lnk.getAttribute("data-category");
    lnk.classList.toggle("active", cat === initialCat);
  });

  // Load cards
  renderContentGrid(initialCat, gridContainer);


  // b) If ?article=… is set, load article detail
  const initialArticleId = getCurrentArticleIdFromUrl();
  if (initialArticleId) {
    renderArticleDetail(initialArticleId, articleContainer);
  }

  // Event delegation for tab clicks
  ul.addEventListener("click", (ev) => {
    const target = ev.target.closest(".nav-link");
    if (!target) return;
    ev.preventDefault();

    ul.querySelectorAll(".nav-link").forEach((lnk) =>
      lnk.classList.remove("active"),
    );
    target.classList.add("active");

    const cat = target.getAttribute("data-category");
    renderContentGrid(cat, gridContainer);

    // Write category into URL (keep article param cleared)
    const params = new URLSearchParams(location.search || "");
    if (cat && cat !== "Alle") params.set("cat", cat);
    else params.delete("cat");
    params.delete("article");

    const qs = params.toString();
    history.pushState(null, "", qs ? `/frontend/academy?${qs}` : "/frontend/academy");
  });

  return page;
}
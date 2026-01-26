// /frontend/app/pages/Articles.js
// Detail page for internal academy articles

import { html } from "../utils/dom.js";
import { academyContentItems as contentItems, academyArticles } from "../components/AcademyContent.js";

// Reads the "article" parameter from the hash
function getArticleIdFromHash() {
    const raw = location.hash || "";
    const [, query = ""] = raw.split("?");
    const params = new URLSearchParams(query);
    const articleId = params.get("article");
    return articleId || null;
}

// Retrieves metadata (category, image, teaser) from the content items
function findMetaByArticleId(articleId) {
    if (!articleId) return null;
    return contentItems.find((item) => item.id === articleId) || null;
}

// Rough reading time estimation from HTML/text (approx. 200 words/minute)
function estimateReadingTime(article) {
    let raw = "";

    if (typeof article.html === "string") {
        raw = article.html;
    } else if (typeof article.text === "string") {
        raw = article.text;
    } else {
        return null;
    }

    const textOnly = raw.replace(/<[^>]+>/g, " ");
    const words = textOnly.trim().split(/\s+/).filter(Boolean).length;
    if (!words) return null;

    const minutes = Math.max(1, Math.round(words / 200));
    return minutes;
}

export function ArticlePage() {
    const articleId = getArticleIdFromHash();
    const article = articleId ? academyArticles?.[articleId] : null;
    const meta = findMetaByArticleId(articleId);

    const page = html`<div class="vstack gap-4"></div>`;

    // In case no or an unknown article was requested
    if (!article || !articleId) {
        const alert = html`
      <div class="alert alert-warning mt-3">
        Der angeforderte Artikel konnte nicht gefunden werden.
        <div class="mt-2">
          <a href="#/academy" class="btn btn-sm btn-outline-secondary">
            Zur Academy-Übersicht
          </a>
        </div>
      </div>
    `;
        page.append(alert);
        return page;
    }

    // Estimate reading time
    const readingMinutes = estimateReadingTime(article);
    const readingText = readingMinutes
        ? `ca. ${readingMinutes} Min. Lesezeit`
        : "";

    const categoryLabel = meta?.category || "Academy";

    // Main Card
    const card = document.createElement("article");
    card.className = "card shadow-sm";

    const header = document.createElement("div");
    header.className = "card-header  border-0 pb-0";

    const titleEl = document.createElement("h1");
    titleEl.className = "h3 mb-2";
    titleEl.textContent = article.title || "Artikel";

    header.append(titleEl);

    // Meta line: Author, reading time, category
    const metaLine = document.createElement("p");
    metaLine.className = "text-muted small mb-3";

    const parts = [];
    parts.push("von Stefan Thaler");
    if (readingText) parts.push(readingText);
    if (categoryLabel) parts.push(`Kategorie: ${categoryLabel}`);

    metaLine.textContent = parts.join(" · ");
    header.append(metaLine);

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

    // Footer with navigation back to academy
    const footer = document.createElement("div");
    footer.className =
        "card-footer d-flex flex-wrap gap-2 justify-content-between align-items-center bg-transparent border-0 pt-0";

    // Back to category
    const backToCategory = document.createElement("a");
    backToCategory.className = "btn btn-sm btn-outline-secondary";
    backToCategory.textContent = `Zur Kategorie „${categoryLabel}“`;
    backToCategory.href = `#/academy?cat=${encodeURIComponent(
        categoryLabel,
    )}`;

    // Back to general academy overview
    const backToOverview = document.createElement("a");
    backToOverview.className = "btn btn-sm btn-outline-primary";
    backToOverview.textContent = "Zur Academy-Übersicht";
    backToOverview.href = "#/academy";

    footer.append(backToCategory, backToOverview);
    card.append(footer);

    page.append(card);
    return page;
}
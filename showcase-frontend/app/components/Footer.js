// /frontend/app/components/Footer.js

import { html } from "../utils/dom.js";

export function Footer() {
  return html`
    <div class="footer py-4">
      <div class="container d-flex justify-content-between align-items-center">
        <div class="col-4 text-start">
          <small>&copy; ${new Date().getFullYear()} MoodInvestor</small>
        </div>

        <div class="col-7 text-end pe-3">
          <a href="https://www.stefan-thaler.at" target="_blank" class="small">Powered by Thaler Finance & Crypto</a>
        </div>

        <div class="col-1 text-end">
          <button id="backToTopBtn" class="btn btn-outline-secondary py-1 px-2" style="font-size: 18px;">︿</button>
        </div>
      </div>
    </div>
  `;
}

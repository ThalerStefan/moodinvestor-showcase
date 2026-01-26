// Transactions.js – Transaction Dashboard
//
// This page shows a filterable table of all transactions as well as
// statistics and includes a form for creating new
// transactions. The layout is based on the provided
// scribbles. For clear structuring, the form and
// table logic are outsourced to separate modules.

import { html } from "../utils/dom.js";
import { getAssets } from "../services/api.js";
import { createTransactionForm } from "../components/TransactionFormular.js";
import { createTransactionTable } from "../components/TransactionTable.js";

/**
 * Main function for the transactions page. It builds the DOM 
 * synchronously and then loads the required data asynchronously.
 * @returns {HTMLElement}
 */
export function TransactionsPage() {
  const page = html`<div id="page" class="vstack gap-4 mt-3"></div>`;

  // Spinner during loading process
  const loading = html`
    <div class="text-center my-5">
      <div class="spinner-border" role="status" aria-label="Loading"></div>
    </div>
  `;
  page.append(loading);


  function getQueryParams() {
    return new URLSearchParams(location.search || "");
  }

  (async () => {
    let assets = [];
    try {
      assets = await getAssets();
    } catch (e) {
      console.error("Loading assets failed:", e);
      assets = []; // continue anyway
    }

    let form;
    const table = createTransactionTable({
      assets,
      onNew: () => form?.open(),
      onUpdate: (tx) => form?.openForUpdate(tx),

      // Important:
      // DO NOT show anything globally.
      // onError is NO LONGER used.
      onError: () => { }
    });

    form = createTransactionForm({
      assets,
      onSaved: () => table.reload(),
    });

    loading.remove();
    page.append(table.element);

    document.body.append(form.element);


    const params = getQueryParams();

    const isNew = params.get("new") === "1";
    const asset = params.get("asset");

    if (isNew) {
      form.open({ preselectSymbol: asset });
    }

    // Clean URL 
    if (isNew) {
      params.delete("new");
      params.delete("asset");

      const qs = params.toString();
      const newPath = qs ? `${location.pathname}?${qs}` : location.pathname;
      history.replaceState(null, "", newPath);
    }

  })();


  return page;
}
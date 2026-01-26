// Currency / Date formatting
// /frontend/app/utils/format.js
// Central formatting (numbers, dates, currencies)

export const fmt = {
  /**
   * Formats numbers as monetary values.
   * - locale = display format (e.g., "de-AT")
   * - currency = ISO code of the currency (e.g., "USD", "EUR", "BTC" etc.)
   */
  money(v, { currency = "USD", locale = "de-AT" } = {}) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 8,
    }).format(v ?? 0);
  },

  moneyRounded(v, { currency = "USD", locale = "de-AT" } = {}) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(v ?? 0);
  },


  /**
   * Combination method: Automatically chooses between money() and moneyRounded().
   * - If there are multiple leading zeros after the decimal point (e.g., 0.00000435),
   * money() is used.
   * - Otherwise moneyRounded().
   */
  smartMoney(v, { currency = "USD", locale = "de-AT" } = {}) {
    if (v == null || isNaN(v)) return "—";

    const expandNumber = (n) => {
      if (typeof n === "string") n = Number(n.replace(",", "."));
      if (!Number.isFinite(n)) return "";
      const s = String(n);
      if (/[eE]/.test(s)) {
        const abs = Math.abs(n);
        const decimals = Math.min(20, Math.max(6, Math.ceil(-Math.log10(abs)) + 2));
        return n.toFixed(decimals);
      }
      return s;
    };

    const hasLeadingZerosAfterDecimal = (n) => {
      const s = expandNumber(n);
      const dec = s.split(".")[1] || "";
      return /^0{2,}\d*[1-9]/.test(dec);
    };

    return hasLeadingZerosAfterDecimal(v)
      ? this.money(v, { currency, locale })
      : this.moneyRounded(v, { currency, locale });
  },

  /**
   * Formats quantities / amounts with up to 8 decimal places.
   */
  qty(v, { locale = "de-AT" } = {}) {
    return v == null
      ? "—"
      : new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }).format(v);
  },

  /**
   * Formats percentages to 2 decimal places.
   */
  pct(v, { digits = 2, locale = "de-AT" } = {}) {
    if (v == null || !isFinite(v)) {
      return "—";
    }

    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(v)} %`;
  },


  /**
   * Plain number representation with configurable decimal places.
   */
  number(v, { digits = 2, locale = "de-AT" } = {}) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(v ?? 0);
  },

  /**
   * Date & time format (remains on de-AT)
   */
  dateTime(iso, { locale = "de-AT" } = {}) {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  },
};
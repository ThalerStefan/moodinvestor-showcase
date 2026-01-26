// Utility to flash a price element on change (up/down) and fade back

export function flashPrice(el, direction) {
    if (!el) return;

    const upClass = "mi-price-flash-up";
    const downClass = "mi-price-flash-down";

    // Remove both first (if updates come quickly)
    el.classList.remove(upClass, downClass);

    // Force reflow so animation can restart even with same class
    void el.offsetWidth;

    if (direction === "up") el.classList.add(upClass);
    if (direction === "down") el.classList.add(downClass);
}
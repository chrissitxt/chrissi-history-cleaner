const TIP_DELAY = 250;
const TIP_GAP = 6;
const TIP_MARGIN = 8;

export const $ = id => document.getElementById(id);

// one tooltip for all info icons, below the icon or above if there's no room
export function initTooltips() {
    const tooltip = $("tooltip");
    let timeout = null;

    const place = el => {
        tooltip.textContent = el.dataset.tip;
        const box = el.getBoundingClientRect();
        const tip = tooltip.getBoundingClientRect();
        const left = Math.min(Math.max(TIP_MARGIN, box.left + box.width / 2 - tip.width / 2), window.innerWidth - tip.width - TIP_MARGIN);
        const below = box.bottom + TIP_GAP;
        const top = below + tip.height > window.innerHeight - TIP_MARGIN ? box.top - tip.height - TIP_GAP : below;
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${Math.max(TIP_MARGIN, top)}px`;
        tooltip.classList.add("visible");
    };
    const hide = () => {
        clearTimeout(timeout);
        tooltip.classList.remove("visible");
    };

    document.querySelectorAll(".info").forEach(el => {
        el.setAttribute("aria-label", el.dataset.tip);
        el.addEventListener("mouseenter", () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => place(el), TIP_DELAY);
        });
        el.addEventListener("mouseleave", hide);
    });
}

// stuff the popup and the settings page both use

const TIP_DELAY = 250;
const TIP_GAP = 6;
const TIP_MARGIN = 8;

export function setToggle(el, on) {
    el.classList.toggle('on', !!on);
    el.setAttribute('aria-checked', String(!!on));
}

// one tooltip for all info icons, below the icon or above if there's no room
export function initTooltips() {
    const tooltip = document.getElementById('tooltip');
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
        tooltip.classList.add('visible');
    };
    const show = el => {
        clearTimeout(timeout);
        timeout = setTimeout(() => place(el), TIP_DELAY);
    };
    const hide = () => {
        clearTimeout(timeout);
        tooltip.classList.remove('visible');
    };

    document.querySelectorAll('.info').forEach(el => {
        el.setAttribute('aria-label', el.dataset.tip);
        el.addEventListener('mouseenter', () => show(el));
        el.addEventListener('focus', () => show(el));
        el.addEventListener('mouseleave', hide);
        el.addEventListener('blur', hide);
    });
}

// starfield background
export function initStarfield(count) {
    const layer = document.getElementById('starfield');
    if (!layer) return;

    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const size = 1 + Math.random() * 2.5;
        const driftDuration = 40 + Math.random() * 40;
        const twinkleDuration = 3 + Math.random() * 4;

        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';
        star.style.setProperty('--drift-x', (Math.random() * 50 - 25).toFixed(1) + 'vw');
        star.style.setProperty('--drift-y', (Math.random() * 50 - 25).toFixed(1) + 'vh');
        star.style.setProperty('--star-min', (0.05 + Math.random() * 0.1).toFixed(2));
        star.style.setProperty('--star-max', (0.25 + Math.random() * 0.35).toFixed(2));
        star.style.animationDuration = `${driftDuration.toFixed(1)}s, ${twinkleDuration.toFixed(1)}s`;
        star.style.animationDelay = `${(Math.random() * -driftDuration).toFixed(1)}s, ${(Math.random() * -twinkleDuration).toFixed(1)}s`;

        layer.appendChild(star);
    }
}

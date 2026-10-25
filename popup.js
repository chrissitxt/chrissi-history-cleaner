import { loadSettings } from "./settings.js";
import { $, initTooltips } from "./ui.js";

const FEEDBACK_DELAY = 2000;

const clearBtn = $("clearNow");
const lastClearedEl = $("lastCleared");
const timerRow = $("timerRow");
const countdown = $("countdown");

const settings = await loadSettings();
let status = { lastCleared: settings.lastCleared, nextClear: null };
let feedbackTimeout = null;
let refreshing = false;

function anythingSelected() {
    return Object.values(settings.dataTypes).some(Boolean);
}

function render() {
    document.querySelectorAll("[data-hours]").forEach(el => {
        el.setAttribute("aria-pressed", String(Number(el.dataset.hours) === settings.interval));
    });
    clearBtn.disabled = !anythingSelected();
}

function formatAgo(ms) {
    const minutes = Math.round(ms / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
}

function formatCountdown(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = n => String(n).padStart(2, "0");
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// runs every second, once the timer hits zero i ask for a fresh status
function renderStatus() {
    if (!anythingSelected()) lastClearedEl.textContent = "Nothing selected";
    else lastClearedEl.textContent = status.lastCleared ? formatAgo(Date.now() - status.lastCleared) : "Never";

    timerRow.hidden = !(settings.interval && status.nextClear);
    if (timerRow.hidden) return;

    const remaining = status.nextClear - Date.now();
    countdown.textContent = formatCountdown(remaining);
    if (remaining <= 0 && !refreshing) {
        refreshing = true;
        setTimeout(async () => {
            status = await chrome.runtime.sendMessage({ type: "status" });
            refreshing = false;
            renderStatus();
        }, 1500);
    }
}

document.querySelectorAll("[data-setting]").forEach(el => {
    const key = el.dataset.setting;
    el.checked = settings[key];
    el.addEventListener("change", () => {
        settings[key] = el.checked;
        chrome.storage.local.set({ [key]: el.checked });
    });
});

document.querySelectorAll("[data-hours]").forEach(el => {
    el.addEventListener("click", async () => {
        settings.interval = Number(el.dataset.hours);
        render();
        status = await chrome.runtime.sendMessage({ type: "set-interval", hours: settings.interval });
        renderStatus();
    });
});

clearBtn.addEventListener("click", async () => {
    clearBtn.disabled = true;
    status = await chrome.runtime.sendMessage({ type: "clear-now" });
    renderStatus();

    clearBtn.classList.add("done");
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
        clearBtn.classList.remove("done");
        clearBtn.disabled = !anythingSelected();
    }, FEEDBACK_DELAY);
});

$("openSettings").addEventListener("click", () => chrome.runtime.openOptionsPage());

render();
initTooltips();
status = await chrome.runtime.sendMessage({ type: "status" });
renderStatus();
setInterval(renderStatus, 1000);

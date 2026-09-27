import { loadSettings } from './settings.js';
import { setToggle, initTooltips, initStarfield } from './ui.js';

const clearBtn = document.getElementById('clearNow');
const lastClearedEl = document.getElementById('lastCleared');
const timerRow = document.getElementById('timerRow');
const countdown = document.getElementById('countdown');
const TRASH_ICON = clearBtn.innerHTML;
const FEEDBACK_DELAY = 2000;

const CHECK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12l5 5l10 -10" /></svg>';

const settings = await loadSettings();
let status = { lastCleared: settings.lastCleared, nextClear: null };
let feedbackTimeout = null;
let refreshing = false;

function anythingSelected() {
    return Object.values(settings.dataTypes).some(Boolean);
}

function render() {
    document.querySelectorAll('[data-setting]').forEach(el => setToggle(el, settings[el.dataset.setting]));
    document.querySelectorAll('[data-hours]').forEach(el => {
        const active = Number(el.dataset.hours) === settings.interval;
        el.classList.toggle('active', active);
        el.setAttribute('aria-pressed', String(active));
    });
    clearBtn.disabled = !anythingSelected();
}

function formatAgo(ms) {
    const minutes = Math.round(ms / 60000);
    if (minutes < 1) return 'just now';
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
    const pad = n => String(n).padStart(2, '0');
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// runs every second, once the timer hits zero i ask for a fresh status
function renderStatus() {
    if (!anythingSelected()) lastClearedEl.textContent = 'nothing selected';
    else lastClearedEl.textContent = status.lastCleared ? formatAgo(Date.now() - status.lastCleared) : 'never';

    timerRow.hidden = !(settings.interval && status.nextClear);
    if (timerRow.hidden) return;

    const remaining = status.nextClear - Date.now();
    countdown.textContent = formatCountdown(remaining);
    if (remaining <= 0 && !refreshing) {
        refreshing = true;
        setTimeout(async () => {
            status = await chrome.runtime.sendMessage({ type: 'status' });
            refreshing = false;
            renderStatus();
        }, 1500);
    }
}

document.querySelectorAll('[data-setting]').forEach(el => {
    el.addEventListener('click', () => {
        const key = el.dataset.setting;
        settings[key] = !settings[key];
        chrome.storage.local.set({ [key]: settings[key] });
        render();
    });
});

document.querySelectorAll('[data-hours]').forEach(el => {
    el.addEventListener('click', async () => {
        settings.interval = Number(el.dataset.hours);
        render();
        status = await chrome.runtime.sendMessage({ type: 'set-interval', hours: settings.interval });
        renderStatus();
    });
});

clearBtn.addEventListener('click', async () => {
    clearBtn.disabled = true;
    status = await chrome.runtime.sendMessage({ type: 'clear-now' });
    renderStatus();

    clearBtn.innerHTML = CHECK_ICON;
    clearBtn.classList.add('done');
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
        clearBtn.innerHTML = TRASH_ICON;
        clearBtn.classList.remove('done');
        clearBtn.disabled = !anythingSelected();
    }, FEEDBACK_DELAY);
});

document.getElementById('openSettings').addEventListener('click', () => chrome.runtime.openOptionsPage());

render();
initTooltips();
initStarfield(20);
status = await chrome.runtime.sendMessage({ type: 'status' });
renderStatus();
setInterval(renderStatus, 1000);

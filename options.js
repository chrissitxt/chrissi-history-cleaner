import { loadSettings } from './settings.js';
import { setToggle, initTooltips, initStarfield } from './ui.js';

const settings = await loadSettings();

function render() {
    document.querySelectorAll('[data-type]').forEach(el => setToggle(el, settings.dataTypes[el.dataset.type]));
}

document.querySelectorAll('[data-type]').forEach(el => {
    el.addEventListener('click', () => {
        const type = el.dataset.type;
        settings.dataTypes[type] = !settings.dataTypes[type];
        chrome.storage.local.set({ dataTypes: settings.dataTypes });
        render();
    });
});

render();
initTooltips();
initStarfield(40);

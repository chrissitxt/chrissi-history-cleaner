import { loadSettings } from "./settings.js";
import { initTooltips } from "./ui.js";

const settings = await loadSettings();

document.querySelectorAll("[data-type]").forEach(el => {
    el.checked = settings.dataTypes[el.dataset.type];
    el.addEventListener("change", () => {
        settings.dataTypes[el.dataset.type] = el.checked;
        chrome.storage.local.set({ dataTypes: settings.dataTypes });
    });
});

initTooltips();

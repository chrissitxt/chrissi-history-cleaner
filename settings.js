// everything chromium counts as "cookies and other site data"
const SITE_DATA = ['cookies', 'localStorage', 'indexedDB', 'cacheStorage', 'serviceWorkers', 'fileSystems'];

export const DATA_TYPES = {
    history: ['history'],
    siteData: SITE_DATA,
    cache: ['cache'],
    downloads: ['downloads'],
    formData: ['formData']
};

export const DEFAULTS = {
    pauseHistory: false,
    clearOnStartup: false,
    interval: 0,
    timerStart: null,
    lastCleared: null,
    dataTypes: {
        history: true,
        siteData: false,
        cache: true,
        downloads: true,
        formData: false
    }
};

export async function loadSettings() {
    const stored = await chrome.storage.local.get(DEFAULTS);
    return { ...stored, dataTypes: { ...DEFAULTS.dataTypes, ...stored.dataTypes } };
}

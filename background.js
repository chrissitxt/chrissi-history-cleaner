import { DATA_TYPES, loadSettings } from './settings.js';

const ALARM = 'auto-clear';
const HOUR = 60 * 60 * 1000;

// chromium can't be told to stop writing history, so i just delete every visit the moment it lands
chrome.history.onVisited.addListener(async item => {
    const { pauseHistory } = await loadSettings();
    if (!pauseHistory || !item.lastVisitTime) return;
    chrome.history.deleteRange({ startTime: item.lastVisitTime - 1, endTime: item.lastVisitTime + 1 });
});

async function syncAlarm() {
    const { interval, timerStart } = await loadSettings();
    await chrome.alarms.clear(ALARM);
    if (!interval) return;

    const due = (timerStart || Date.now()) + interval * HOUR;
    // chrome doesn't fire alarms sooner than 30 seconds
    const delayInMinutes = Math.max(0.5, (due - Date.now()) / 60000);
    chrome.alarms.create(ALARM, { delayInMinutes, periodInMinutes: interval * 60 });
}

async function restartTimer() {
    await chrome.storage.local.set({ timerStart: Date.now() });
    await syncAlarm();
}

async function clearData() {
    const { dataTypes } = await loadSettings();
    const selected = {};

    for (const [key, types] of Object.entries(DATA_TYPES)) {
        if (dataTypes[key]) types.forEach(type => { selected[type] = true; });
    }

    if (Object.keys(selected).length) {
        await chrome.browsingData.remove({ since: 0 }, selected);
        await chrome.storage.local.set({ lastCleared: Date.now() });
    }
    await restartTimer();
}

async function getStatus() {
    const { lastCleared } = await loadSettings();
    const alarm = await chrome.alarms.get(ALARM);
    return { lastCleared, nextClear: alarm ? alarm.scheduledTime : null };
}

// extensions don't notice the browser closing, so i clear on the next start instead
// the timer starts over here too
chrome.runtime.onStartup.addListener(async () => {
    const { clearOnStartup } = await loadSettings();
    if (clearOnStartup) await clearData();
    else await restartTimer();
});

chrome.runtime.onInstalled.addListener(restartTimer);

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === ALARM) clearData();
});

async function handleMessage(message) {
    if (message.type === 'clear-now') {
        await clearData();
    } else if (message.type === 'set-interval') {
        await chrome.storage.local.set({ interval: message.hours });
        await restartTimer();
    }
    return getStatus();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message).then(sendResponse);
    // needed so the popup can wait for the answer
    return true;
});

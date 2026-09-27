# History Cleaner

a lightweight chromium extension that pauses your browsing history and clears browsing data automatically.

## what it does

- pause history: every new visit gets deleted the moment it's recorded
- clear on startup: wipes the selected data every time the browser opens
- auto clear: every 2, 4 or 8 hours, with a live countdown in the popup
- choose what gets cleared in the settings page: browsing history, cookies and other site data, cached images and files, download history, autofill form data

## good to know

- chromium doesn't let extensions stop history from being written, so pausing works by deleting each visit right after it happens
- extensions get no reliable signal when the browser closes, so "on close" happens on the next start instead
- the auto clear timer only runs while the browser is open and starts over after every restart
- tabs restored from your last session create new history entries after the startup clear
- clearing cookies and other site data logs you out almost everywhere, it's marked as not recommended
- site settings can't be cleared by extensions, chromium only allows that from its own settings page
- saved passwords are never touched
- if sync is on, deleted history can also disappear from your other synced devices

## privacy

- the extension never sends anything anywhere. no analytics, no tracking, no accounts
- it only asks for `history`, `browsingData`, `alarms` and `storage`, none of which can read the content of the pages you visit
- settings are saved with `chrome.storage.local`, which is never synced
- the one exception: the popup and the settings page load inter from google fonts, which means google sees your ip address, nothing about your browsing

## install

1. download this repo (code, then download zip) and unzip it, or clone it
2. open `chrome://extensions` and turn on developer mode
3. click "load unpacked" and pick the folder

to update, download the new version, replace the folder and hit the reload icon on the extension in `chrome://extensions`. your settings stay.

works in any chromium browser (chrome, brave, edge, helium, ...)

i'm planning to publish it on the chrome web store and other extension stores, until then it has to be loaded unpacked like this

## permissions

- `history`: to delete visits while paused
- `browsingData`: to clear the selected data
- `alarms`: for the auto clear timer
- `storage`: to remember your settings

## license

mit, see [LICENSE](LICENSE)

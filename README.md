# One Pace Extended Cuts — Stremio Addon

A companion Stremio addon for [OnePaceStremio](https://github.com/fedew04/OnePaceStremio) (`com.onepace.fedew`) that automatically monitors the official [One Pace RSS Feed](https://onepace.net/en/releases/rss.xml) and provides streams for **Extended Cuts**.

When both addons are installed in Stremio, navigating to any One Pace episode (e.g. *Egghead 21*) will display the Extended Cut option right alongside regular stream choices:
- **Left Column (Source):** `One Pace` / `Addon`
- **Right Column (Title):** `Extended Cut`

---

## Features

1. **RSS Feed Synchronization:** Automatically fetches and parses `https://onepace.net/en/releases/rss.xml`.
2. **Category Filtering:** Selects only releases tagged with `<category domain="https://onepace.net/releases">variant/extended</category>` while explicitly excluding any tagged with `<category domain="https://onepace.net/releases">outdated</category>`.
3. **Automated Naming Conversion:** The RSS feed titles (e.g., `Egghead 21 Extended Cut`, `Reverse Mountain 02 Extended Cut`) do not use Stremio IDs. This addon maps 36+ One Pace story arcs to their exact Stremio episode ID conventions (`EH_21`, `RM_2`, `AR_10`, `WA_55`, etc.).
4. **Seamless Integration:** Uses manifest resources scoped to One Pace series ID prefixes (`EH`, `RO`, `WA`, `AR`, etc.), ensuring it merges into the existing One Pace catalog.

---

## How to Run & Host

### Option 1: Live Dynamic Addon (Node.js / Cloud / Serverless)

The dynamic server periodically refreshes the RSS feed (cached in memory for 15 minutes) and serves streams on demand.

```bash
# 1. Install dependencies
npm install

# 2. Start the HTTP server
npm start
```
By default, the server runs on port `7000`. You can install it in Stremio by entering:
`http://localhost:7000/manifest.json`

#### Deploying to Serverless (Vercel / Render / Railway)
A `serverless.js` entrypoint is included. You can deploy directly to Node/Serverless platforms.

---

### Option 2: Static Export (GitHub Pages / Cloudflare Pages)

Because `OnePaceStremio` is hosted as static JSON files on GitHub Pages, you can also export this addon as static files!

```bash
npm run build
```
This generates a `./dist` folder containing:
- `dist/manifest.json`
- `dist/stream/series/EH_21.json`
- `dist/stream/series/AR_10.json`
- ...and all active extended cuts.

You can host the contents of `./dist` on GitHub Pages or any CDN.

---

## Technical Mapping Reference

Example mappings performed automatically by the addon:
| RSS Release Title | Parsed Arc | Parsed Number | Stremio Video ID |
| :--- | :--- | :--- | :--- |
| `Egghead 21 Extended Cut` | Egghead | 21 | `EH_21` |
| `Reverse Mountain 02 Extended Cut` | Reverse Mountain | 2 | `RM_2` |
| `Arlong Park 10 Extended Cut` | Arlong Park | 10 | `AR_10` |
| `Wano 55 Extended Cut` | Wano | 55 | `WA_55` |

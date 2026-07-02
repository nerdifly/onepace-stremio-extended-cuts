const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");

const ARC_TO_PREFIX = {
    "romance dawn": "RO",
    "orange town": "OR",
    "syrup village": "SY",
    "gaimon": "GA",
    "baratie": "BA",
    "arlong park": "AR",
    "the adventures of buggy's crew": "BUGGYS_CREW",
    "buggy's crew": "BUGGYS_CREW",
    "loguetown": "LO",
    "reverse mountain": "RM",
    "whiskey peak": "WH",
    "the trials of koby-meppo": "COVER_KOBYMEPPO",
    "koby-meppo": "COVER_KOBYMEPPO",
    "little garden": "LI",
    "drum island": "DI",
    "arabasta": "AL",
    "alabasta": "AL",
    "jaya": "JA",
    "skypiea": "SK",
    "long ring long land": "LR",
    "water seven": "WS",
    "water 7": "WS",
    "enies lobby": "EN",
    "post-enies lobby": "PEN",
    "post enies lobby": "PEN",
    "thriller bark": "TB",
    "sabaody archipelago": "SAB",
    "sabaody": "SAB",
    "amazon lily": "AM",
    "impel down": "IM",
    "the adventures of the straw hats": "COVER_SHSS",
    "marineford": "MA",
    "post-war": "PW",
    "post war": "PW",
    "return to sabaody": "RTS",
    "fish-man island": "FI",
    "fishman island": "FI",
    "punk hazard": "PH",
    "dressrosa": "DR",
    "zou": "ZO",
    "whole cake island": "WC",
    "reverie": "REV",
    "wano": "WA",
    "egghead": "EH"
};

const SORTED_ARCS = Object.keys(ARC_TO_PREFIX).sort((a, b) => b.length - a.length);

const manifest = {
    id: "com.onepace.extended",
    version: "1.0.0",
    name: "One Pace Extended Cuts",
    description: "Provides Extended Cuts for One Pace episodes, working seamlessly alongside the official One Pace Stremio addon.",
    logo: "https://onepace.net/_next/static/media/logo.0bbcd6da.svg",
    resources: [
        {
            name: "stream",
            types: ["series"],
            idPrefixes: [
                "RO", "OR", "SY", "GA", "BA", "AR", "BUGGYS_CREW", "LO", "RM", "WH",
                "COVER_KOBYMEPPO", "LI", "DI", "AL", "JA", "SK", "LR", "WS", "EN",
                "PEN", "TB", "SAB", "AM", "IM", "COVER_SHSS", "MA", "PW", "RTS",
                "FI", "PH", "DR", "ZO", "WC", "REV", "WA", "EH", "pp"
            ]
        }
    ],
    types: ["series"],
    catalogs: []
};

async function generateStaticAddon() {
    const distDir = path.join(__dirname, "dist");
    const streamDir = path.join(distDir, "stream", "series");

    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(streamDir, { recursive: true });

    // Write manifest.json
    fs.writeFileSync(path.join(distDir, "manifest.json"), JSON.stringify(manifest, null, 2));

    console.log("Fetching RSS feed from https://onepace.net/en/releases/rss.xml ...");
    const resp = await fetch("https://onepace.net/en/releases/rss.xml", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    });

    if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status}`);
    }

    const xmlText = await resp.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const obj = parser.parse(xmlText);

    const items = obj?.rss?.channel?.item;
    if (!items) {
        console.log("No items found in RSS feed.");
        return;
    }

    const itemList = Array.isArray(items) ? items : [items];
    const newMap = {};

    for (const item of itemList) {
        let cats = item.category || [];
        if (!Array.isArray(cats)) cats = [cats];
        const catTexts = cats.map(c => (typeof c === "object" ? c["#text"] : c));

        if (catTexts.includes("variant/extended") && !catTexts.includes("outdated")) {
            const title = item.title || "";
            const titleLower = title.toLowerCase();
            const infoHash = item["torrent:infoHash"];

            if (!infoHash) continue;

            for (const arc of SORTED_ARCS) {
                if (titleLower.startsWith(arc)) {
                    const remainder = title.slice(arc.length).trim();
                    const match = remainder.match(/^(\d+)/);
                    if (match) {
                        const epNum = parseInt(match[1], 10);
                        const prefix = ARC_TO_PREFIX[arc];
                        const videoId = `${prefix}_${epNum}`;

                        if (!newMap[videoId]) {
                            newMap[videoId] = [];
                        }
                        newMap[videoId].push({
                            name: "One Pace\nAddon",
                            title: "Extended Cut",
                            infoHash: infoHash
                        });
                        break;
                    }
                }
            }
        }
    }

    let count = 0;
    for (const [videoId, streams] of Object.entries(newMap)) {
        const filePath = path.join(streamDir, `${videoId}.json`);
        fs.writeFileSync(filePath, JSON.stringify({ streams }, null, 2));
        count++;
    }

    console.log(`Successfully exported static addon to ./dist/ (${count} episode stream files written).`);
}

generateStaticAddon().catch(err => {
    console.error("Error generating static addon:", err);
    process.exit(1);
});

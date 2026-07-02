const { serveHTTP } = require("stremio-addon-sdk");
const addonInterface = require("./addon");

const PORT = process.env.PORT || 7070;
serveHTTP(addonInterface, { port: PORT });
console.log(`[OnePaceExtended] Addon running on http://localhost:${PORT}/manifest.json`);

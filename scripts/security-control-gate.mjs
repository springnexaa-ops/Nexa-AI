import { readFileSync } from "node:fs";
const entry = readFileSync("src/entry.ts","utf8");
const required = [
  "Strict-Transport-Security","Content-Security-Policy","X-Content-Type-Options",
  "X-Frame-Options","Referrer-Policy","Permissions-Policy","Cross-Origin-Opener-Policy",
  "Cross-Origin-Resource-Policy","X-Robots-Tag","no-store"
];
const missing = required.filter(x => !entry.includes(x));
if (missing.length) { console.error("Missing security controls:", missing.join(", ")); process.exit(1); }
if (/access-control-allow-origin","\*"/i.test(entry)) { console.error("Wildcard CORS is forbidden."); process.exit(1); }
if (!/ADMIN_TOKEN/.test(entry) || !/PBKDF2/.test(readFileSync("src/index-v3.ts","utf8"))) { console.error("Core authentication controls missing."); process.exit(1); }
console.log("Security control gate passed.");
import { spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const steps = [
  ["Whitespace check", "git", ["diff", "--check"]],
  ["Cloudflare-only security gate", npm, ["run", "security:cloudflare-only"]],
  ["Security controls", npm, ["run", "security:controls"]],
  ["TypeScript + UI + medical tests", npm, ["test"]],
  ["Cloudflare deployment dry-run", npm, ["run", "cf:dry-run"]]
];

console.log("NEXA pre-main validation");
console.log("========================");
console.log("This command performs validation only. It never deploys.");

for (const [name, command, args] of steps) {
  console.log("\n[CHECK] " + name);
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.error) {
    console.error("[FAIL] " + name + ": " + result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error("[FAIL] " + name);
    process.exit(result.status ?? 1);
  }
  console.log("[PASS] " + name);
}

console.log("\nNEXA pre-main validation PASSED.");
console.log("Safe to push/merge to main.");

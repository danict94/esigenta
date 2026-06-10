const fs = require("node:fs");
const path = require("node:path");

const repo = process.cwd();
const logRoot = process.argv[2];

const files = [
  "apps/web/src/components/navigation/navbar.tsx",
  "apps/web/src/components/layout/footer.tsx",
  "apps/web/src/components/privacy/cookie-consent.tsx",
  "apps/web/src/components/funnel/funnel-ui.tsx",
  "apps/web/src/components/funnel/photo-upload-step.tsx",
];

const backupRoot = path.join(logRoot, "backup");
fs.mkdirSync(backupRoot, { recursive: true });

const summary = [];

function patchLinks(source) {
  return source.replace(/<Link\b((?:(?!>).)*?)>/gs, (full, attrs) => {
    if (/\bprefetch\s*=/.test(full)) return full;
    return `<Link${attrs} prefetch={false}>`;
  });
}

for (const file of files) {
  const abs = path.join(repo, file);
  if (!fs.existsSync(abs)) {
    summary.push({ file, status: "missing", patched: 0 });
    continue;
  }

  const backup = path.join(backupRoot, file);
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  fs.copyFileSync(abs, backup);

  const before = fs.readFileSync(abs, "utf8");
  const beforeMissing = [...before.matchAll(/<Link\b((?:(?!>).)*?)>/gs)]
    .filter((m) => !/\bprefetch\s*=/.test(m[0])).length;

  const after = patchLinks(before);
  const afterMissing = [...after.matchAll(/<Link\b((?:(?!>).)*?)>/gs)]
    .filter((m) => !/\bprefetch\s*=/.test(m[0])).length;

  if (after !== before) {
    fs.writeFileSync(abs, after, "utf8");
  }

  summary.push({
    file,
    status: after !== before ? "changed" : "unchanged",
    patched: beforeMissing - afterMissing,
    missingBefore: beforeMissing,
    missingAfter: afterMissing,
  });
}

fs.writeFileSync(
  path.join(logRoot, "patch-summary.json"),
  JSON.stringify(summary, null, 2),
  "utf8"
);

console.table(summary);
import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(appDir, "../..");

function loadEnvFile(
  path: string,
  override = false,
) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8")
    .split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (
      !trimmed ||
      trimmed.startsWith("#")
    ) {
      continue;
    }

    const separatorIndex =
      trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed
      .slice(0, separatorIndex)
      .trim()
      .replace(/^export\s+/, "");

    const rawValue = trimmed
      .slice(separatorIndex + 1)
      .trim();

    const value = rawValue.replace(
      /^(['"])(.*)\1$/,
      "$2",
    );

    if (
      key &&
      (override || !process.env[key])
    ) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(workspaceRoot, ".env"));
loadEnvFile(resolve(appDir, ".env.local"), true);

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;

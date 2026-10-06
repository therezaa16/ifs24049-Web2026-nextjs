import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function readEnvValue(content: string, key: string): string | undefined {
  for (const line of content.split("\n")) {
    const separator = line.indexOf("=");
    if (separator < 0) continue;
    if (line.slice(0, separator).trim() !== key) continue;

    const value = line.slice(separator + 1).trim();
    if (value) return value;
  }

  return undefined;
}

function getPort(): string {
  if (process.env.APP_PORT) return process.env.APP_PORT.trim();
  if (process.env.PORT) return process.env.PORT.trim();

  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      return readEnvValue(content, "APP_PORT") ?? readEnvValue(content, "PORT") ?? "3000";
    } catch {
      // fallback jika file .env tidak dapat dibaca
    }
  }

  return "3000";
}

const action = process.argv[2] || "dev";
const port = getPort();

const nextArgs = action === "start" ? ["start", "-p", port] : ["dev", "--turbopack", "-p", port];

const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, ...nextArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: port,
    APP_PORT: port,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

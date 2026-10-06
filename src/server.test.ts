import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";

const spawnMock = vi.fn();
const existsSyncMock = vi.fn();
const readFileSyncMock = vi.fn();

vi.mock("node:child_process", () => {
  const spawn = (...args: unknown[]) => spawnMock(...args);
  return { default: { spawn }, spawn };
});

vi.mock("node:fs", () => ({
  default: {
    existsSync: (...args: unknown[]) => existsSyncMock(...args),
    readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
  },
}));

describe("server launcher", () => {
  const originalArgv = process.argv;
  let child: EventEmitter;
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let killSpy: ReturnType<typeof vi.spyOn>;

  async function launch(action?: string) {
    process.argv = action ? ["bun", "server.ts", action] : ["bun", "server.ts"];
    vi.resetModules();
    await import("./server");
  }

  beforeEach(() => {
    vi.clearAllMocks();
    child = new EventEmitter();
    spawnMock.mockReturnValue(child);
    existsSyncMock.mockReturnValue(false);
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
    killSpy = vi.spyOn(process, "kill").mockImplementation((() => true) as never);
    vi.stubEnv("APP_PORT", "");
    vi.stubEnv("PORT", "");
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.unstubAllEnvs();
    exitSpy.mockRestore();
    killSpy.mockRestore();
  });

  it("should start dev mode on the default port", async () => {
    await launch();

    const args = spawnMock.mock.calls[0][1] as string[];
    expect(args.slice(1)).toEqual(["dev", "--turbopack", "-p", "3000"]);
  });

  it("should start production mode on APP_PORT", async () => {
    vi.stubEnv("APP_PORT", " 4100 ");

    await launch("start");

    const args = spawnMock.mock.calls[0][1] as string[];
    expect(args.slice(1)).toEqual(["start", "-p", "4100"]);
    expect(spawnMock.mock.calls[0][2].env).toMatchObject({ PORT: "4100", APP_PORT: "4100" });
  });

  it("should use PORT when APP_PORT is not set", async () => {
    vi.stubEnv("PORT", "4200");

    await launch("start");

    expect((spawnMock.mock.calls[0][1] as string[]).slice(-1)[0]).toBe("4200");
  });

  it.each([
    ["APP_PORT", "COMMENT\nOTHER=1\nAPP_PORT=\n APP_PORT = 4300 \r\n", "4300"],
    ["PORT", "PORT=4400\n", "4400"],
    ["no port", "FOO=bar\n", "3000"],
  ])("should resolve the port from the .env file (%s)", async (_label, content, expected) => {
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(content);

    await launch();

    expect((spawnMock.mock.calls[0][1] as string[]).slice(-1)[0]).toBe(expected);
  });

  it("should fall back to 3000 when .env cannot be read", async () => {
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockImplementation(() => {
      throw new Error("denied");
    });

    await launch();

    expect((spawnMock.mock.calls[0][1] as string[]).slice(-1)[0]).toBe("3000");
  });

  it("should exit with the child exit code", async () => {
    await launch();

    child.emit("exit", 2, null);

    expect(exitSpy).toHaveBeenCalledWith(2);
  });

  it("should exit with 0 when the child has no exit code", async () => {
    await launch();

    child.emit("exit", null, null);

    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should forward the signal that stopped the child", async () => {
    await launch();

    child.emit("exit", null, "SIGTERM");

    expect(killSpy).toHaveBeenCalledWith(process.pid, "SIGTERM");
  });
});

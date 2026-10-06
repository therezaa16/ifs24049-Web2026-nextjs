import { describe, it, expect, vi, afterEach } from "vitest";

describe("config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("should use the Delcom API as default base url and port 3000", async () => {
    vi.stubEnv("NEXT_PUBLIC_DELCOM_BASEURL", "");
    vi.stubEnv("APP_PORT", "");
    vi.stubEnv("PORT", "");
    vi.resetModules();

    const config = await import("./config");

    expect(config.DELCOM_BASEURL).toBe("https://open-api.delcom.org/api/v1");
    expect(config.APP_PORT).toBe("3000");
  });

  it("should read values from the environment", async () => {
    vi.stubEnv("NEXT_PUBLIC_DELCOM_BASEURL", "https://example.test/api");
    vi.stubEnv("APP_PORT", "4000");
    vi.resetModules();

    const config = await import("./config");

    expect(config.DELCOM_BASEURL).toBe("https://example.test/api");
    expect(config.APP_PORT).toBe("4000");
  });

  it("should fall back to PORT when APP_PORT is empty", async () => {
    vi.stubEnv("APP_PORT", "");
    vi.stubEnv("PORT", "5000");
    vi.resetModules();

    const config = await import("./config");

    expect(config.APP_PORT).toBe("5000");
  });
});

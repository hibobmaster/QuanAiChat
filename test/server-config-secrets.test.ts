/**
 * @jest-environment node
 */

describe("server config secret logging", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("does not print configured api keys to logs", async () => {
    const apiKey = "sk-test-secret-value";
    process.env.OPENAI_API_KEY = apiKey;

    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getServerSideConfig } = await import("../app/config/server");

    expect(getServerSideConfig().apiKey).toBe(apiKey);
    expect(log).toHaveBeenCalledWith("[Server Config] using 1 of 1 api key");
    expect(
      log.mock.calls.some((args) =>
        args.some((arg) => String(arg).includes(apiKey)),
      ),
    ).toBe(false);
  });
});

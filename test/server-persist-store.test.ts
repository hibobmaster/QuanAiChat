/**
 * @jest-environment node
 */

describe("createPersistStore on the server", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("uses in-memory state without touching browser storage", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { createPersistStore } = await import("../app/utils/store");

    const useStore = createPersistStore(
      { count: 0 },
      (set, get) => ({
        increment() {
          set({ count: get().count + 1 });
        },
      }),
      {
        name: "server-test-store",
        version: 1,
      },
    );

    expect(useStore.getState().count).toBe(0);
    useStore.getState().increment();
    expect(useStore.getState().count).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining("localStorage"),
    );

    warn.mockRestore();
  });
});

import { DEFAULT_MODELS } from "../app/constant";

describe("Google default models", () => {
  test("includes gemini-3.1-flash-lite", () => {
    expect(
      DEFAULT_MODELS.some(
        (model) =>
          model.name === "gemini-3.1-flash-lite" &&
          model.provider.providerName === "Google",
      ),
    ).toBe(true);
  });
});

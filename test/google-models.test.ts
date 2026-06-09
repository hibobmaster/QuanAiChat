import { DEFAULT_MODELS } from "../app/constant";

describe("Google default models", () => {
  test("uses gemini-3.5-flash as the first Google model", () => {
    expect(
      DEFAULT_MODELS.find((model) => model.provider.providerName === "Google")
        ?.name,
    ).toBe("gemini-3.5-flash");
  });

  test.each(["gemini-3.1-flash-lite", "gemini-3.5-flash"])(
    "includes %s",
    (modelName) => {
      expect(
        DEFAULT_MODELS.some(
          (model) =>
            model.name === modelName &&
            model.provider.providerName === "Google",
        ),
      ).toBe(true);
    },
  );
});

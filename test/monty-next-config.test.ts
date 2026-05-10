import fs from "fs";
import path from "path";

describe("Monty Next.js bundling config", () => {
  test("keeps Monty's native binding package external to the server bundle", () => {
    const config = fs.readFileSync(
      path.join(process.cwd(), "next.config.mjs"),
      "utf-8",
    );

    expect(config).toContain("serverExternalPackages");
    expect(config).toContain('"@pydantic/monty"');
  });
});

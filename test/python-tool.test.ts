const montyRunMock = jest.fn();
const montyConstructorMock = jest.fn();

jest.mock("@pydantic/monty", () => ({
  Monty: class {
    constructor(code: string, options: unknown) {
      montyConstructorMock(code, options);
    }

    run(options: unknown) {
      return montyRunMock(options);
    }
  },
  MontyRuntimeError: class extends Error {},
  MontySyntaxError: class extends Error {},
  MontyTypingError: class extends Error {},
}));

import { runSandboxedPython } from "../app/tools/python";

describe("sandboxed Python tool", () => {
  beforeEach(() => {
    montyRunMock.mockReset();
    montyConstructorMock.mockClear();
    montyRunMock.mockReturnValue(3);
  });

  test("runs code without inputs", () => {
    expect(runSandboxedPython({ code: "1 + 2" })).toEqual({ output: 3 });
    expect(montyConstructorMock).toHaveBeenCalledWith(
      "1 + 2",
      expect.objectContaining({
        inputs: [],
      }),
    );
    expect(montyRunMock).toHaveBeenCalledWith(
      expect.not.objectContaining({
        inputs: expect.anything(),
      }),
    );
  });

  test("runs code with declared inputs", () => {
    expect(
      runSandboxedPython({
        code: "x + 2",
        inputs: { x: 1 },
      }),
    ).toEqual({ output: 3 });
  });
});

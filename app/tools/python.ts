import {
  Monty,
  MontyRuntimeError,
  MontySyntaxError,
  MontyTypingError,
} from "@pydantic/monty";

const MAX_CODE_LENGTH = 12_000;

const DEFAULT_LIMITS = {
  maxAllocations: 100_000,
  maxDurationSecs: 3,
  maxMemory: 8 * 1024 * 1024,
  maxRecursionDepth: 200,
};

export type RunPythonInput = {
  code: string;
  inputs?: Record<string, unknown>;
};

export type RunPythonResult = {
  output: unknown;
};

export function assertRunPythonInput(value: unknown): RunPythonInput {
  if (!value || typeof value !== "object") {
    throw new Error("Request body must be an object");
  }

  const input = value as Record<string, unknown>;
  if (typeof input.code !== "string" || input.code.trim().length === 0) {
    throw new Error("code must be a non-empty string");
  }

  if (input.code.length > MAX_CODE_LENGTH) {
    throw new Error(`code must be ${MAX_CODE_LENGTH} characters or less`);
  }

  if (
    input.inputs !== undefined &&
    (!input.inputs ||
      typeof input.inputs !== "object" ||
      Array.isArray(input.inputs))
  ) {
    throw new Error("inputs must be a JSON object when provided");
  }

  return {
    code: input.code,
    inputs: (input.inputs as Record<string, unknown> | undefined) ?? {},
  };
}

export function formatMontyError(error: unknown) {
  if (error instanceof MontyTypingError) {
    return {
      error: "type_error",
      message: error.displayDiagnostics("concise"),
    };
  }

  if (error instanceof MontySyntaxError || error instanceof MontyRuntimeError) {
    return {
      error: "python_error",
      message: error.display("type-msg"),
    };
  }

  return {
    error: "execution_error",
    message: error instanceof Error ? error.message : String(error),
  };
}

export function runSandboxedPython(input: RunPythonInput): RunPythonResult {
  const inputs = input.inputs ?? {};
  const inputNames = Object.keys(inputs);
  const monty = new Monty(input.code, {
    inputs: inputNames,
    scriptName: "run_python.py",
  });

  return {
    output: monty.run({
      ...(inputNames.length > 0 ? { inputs } : {}),
      limits: DEFAULT_LIMITS,
    }),
  };
}

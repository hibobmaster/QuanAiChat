import { NextResponse } from "next/server";

import {
  assertRunPythonInput,
  formatMontyError,
  runSandboxedPython,
} from "@/app/tools/python";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = assertRunPythonInput(await request.json());
    return NextResponse.json(runSandboxedPython(input));
  } catch (error) {
    return NextResponse.json(formatMontyError(error), { status: 400 });
  }
}

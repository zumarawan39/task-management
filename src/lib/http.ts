import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { zodMessage } from "@/lib/validators";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ data: null, error }, { status });
}

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new HttpError(401, "Sign in required");
  return id;
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Request body must be JSON");
  }
}

export function fromError(error: unknown) {
  if (error instanceof ZodError) return fail(zodMessage(error), 400);
  if (error instanceof HttpError) return fail(error.message, error.status);
  console.error(error);
  return fail("Something went wrong", 500);
}

export function isDuplicateKey(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

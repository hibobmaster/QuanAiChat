import md5 from "spark-md5";
import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "@/app/config/server";
import { corsPreflight, withCors } from "../cors";

async function handle(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return corsPreflight(req);
  }

  const serverConfig = getServerSideConfig();
  const storeUrl = () =>
    `https://api.cloudflare.com/client/v4/accounts/${serverConfig.cloudflareAccountId}/storage/kv/namespaces/${serverConfig.cloudflareKVNamespaceId}`;
  const storeHeaders = () => ({
    Authorization: `Bearer ${serverConfig.cloudflareKVApiKey}`,
  });
  if (req.method === "POST") {
    const clonedBody = await req.text();
    const hashedCode = md5.hash(clonedBody).trim();
    const body: {
      key: string;
      value: string;
      expiration_ttl?: number;
    } = {
      key: hashedCode,
      value: clonedBody,
    };
    try {
      const ttl = parseInt(serverConfig.cloudflareKVTTL as string);
      if (ttl > 60) {
        body["expiration_ttl"] = ttl;
      }
    } catch (e) {
      console.error(e);
    }
    const res = await fetch(`${storeUrl()}/bulk`, {
      headers: {
        ...storeHeaders(),
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify([body]),
    });
    const result = await res.json();
    console.log("save data", result);
    if (result?.success) {
      return withCors(
        NextResponse.json(
          { code: 0, id: hashedCode, result },
          { status: res.status },
        ),
        req,
      );
    }
    return withCors(
      NextResponse.json(
        { error: true, msg: "Save data error" },
        { status: 400 },
      ),
      req,
    );
  }
  if (req.method === "GET") {
    const id = req?.nextUrl?.searchParams?.get("id");
    const res = await fetch(`${storeUrl()}/values/${id}`, {
      headers: storeHeaders(),
      method: "GET",
    });
    return withCors(
      new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: new Headers(res.headers),
      }),
      req,
    );
  }
  return withCors(
    NextResponse.json({ error: true, msg: "Invalid request" }, { status: 400 }),
    req,
  );
}

export const POST = handle;
export const GET = handle;
export const OPTIONS = handle;

export const runtime = "edge";

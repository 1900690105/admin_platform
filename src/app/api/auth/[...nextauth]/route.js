import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimiter } from "@/utils/rateLimiter";

const handler = NextAuth(authOptions);

export async function POST(req, ctx) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!rateLimiter(ip, 10, 60000)) {
    return new Response("Too many login attempts", { status: 429 });
  }

  return handler(req, ctx);
}

export async function GET(req, ctx) {
  return handler(req, ctx);
}

import { NextRequest } from "next/server";

export function verifyApiSecret(request: NextRequest): boolean {
  const secret = process.env.CONTENT_API_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7) === secret;
  }

  return request.headers.get("x-api-key") === secret;
}

import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import crypto from "node:crypto";

export async function GET(req: NextRequest) {
  const { origin } = new URL(req.url);
  const configuredBase = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_BASE_URL;
  let base = (configuredBase?.trim()) || origin;
  try {
    const u = new URL(base);
    // Force https in production (non-localhost)
    if (u.hostname !== "localhost") {
      base = `https://${u.host}`;
    } else {
      base = u.origin;
    }
  } catch {
    base = origin;
  }
  const redirectUri = `${base}/api/auth/callback`;

  const state = crypto.randomUUID().replace(/-/g, "");
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const session = await getSession();
  session.state = state;
  session.nonce = nonce;
  await session.save();

  const authUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", process.env.LINE_CHANNEL_ID || "");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "openid profile");
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("prompt", "consent");
  const botPrompt = process.env.LINE_BOT_PROMPT?.toLowerCase();
  if (botPrompt === "normal" || botPrompt === "aggressive") {
    authUrl.searchParams.set("bot_prompt", botPrompt);
  }

  return Response.redirect(authUrl.toString(), 302);
}

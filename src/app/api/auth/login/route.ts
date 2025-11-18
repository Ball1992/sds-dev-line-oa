import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import crypto from "node:crypto";

export async function GET(req: NextRequest) {

  const redirectUri = `https://sds-dev-line-oa-a0743540111e.herokuapp.com/api/auth/callback`;

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

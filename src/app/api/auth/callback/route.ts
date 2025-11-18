import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const session = await getSession();

  if (error) {
    // User denied or error in consent screen
    session.user = null;
    await session.save();
    return Response.redirect(`${origin}/?error=${encodeURIComponent(error)}`, 302);
  }

  if (!code || !state) {
    return new Response("Missing code or state", { status: 400 });
  }

  if (!session.state || state !== session.state) {
    return new Response("Invalid state", { status: 400 });
  }

  const redirectUri = `${origin}/api/auth/callback`;

  try {
    // Exchange authorization code for tokens
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINE_CHANNEL_ID || "",
      client_secret: process.env.LINE_CHANNEL_SECRET || "",
    });

    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return new Response(`Token exchange failed: ${text}`, { status: 400 });
    }

    const tokenJson = (await tokenRes.json()) as {
      access_token: string;
      id_token?: string;
      expires_in: number;
      scope: string;
      token_type: string;
      refresh_token?: string;
    };

    // Fetch profile using access token
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
      },
      cache: "no-store",
    });

    if (!profileRes.ok) {
      const text = await profileRes.text();
      return new Response(`Get profile failed: ${text}`, { status: 400 });
    }

    const profile = (await profileRes.json()) as {
      userId: string;
      displayName: string;
      pictureUrl?: string;
      statusMessage?: string;
    };

    // Optional: verify id_token to check nonce
    if (tokenJson.id_token && session.nonce) {
      const verifyBody = new URLSearchParams({
        id_token: tokenJson.id_token,
        client_id: process.env.LINE_CHANNEL_ID || "",
      });
      const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: verifyBody,
      });
      if (verifyRes.ok) {
        const verified = (await verifyRes.json()) as { nonce?: string };
        if (verified.nonce && verified.nonce !== session.nonce) {
          return new Response("Invalid nonce", { status: 400 });
        }
      }
    }

    // Persist user in session
    session.user = {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
    };
    session.state = undefined;
    session.nonce = undefined;
    await session.save();

    return Response.redirect(`${origin}/`, 302);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(`Callback error: ${message}`, { status: 500 });
  }
}

import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { origin } = new URL(req.url);
  const session = await getSession();
  session.destroy();
  return Response.redirect(`${origin}/`, 302);
}

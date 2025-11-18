import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    return Response.json({ user: session.user ?? null });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    return new Response(JSON.stringify({ error: message, stack }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

import { cookies } from "next/headers";
import { getIronSession, IronSession, SessionOptions } from "iron-session";

export type SessionData = {
  user?: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  } | null;
  state?: string;
  nonce?: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: "linecrm_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  // Cast to any to satisfy differing Next.js versions (sync vs async cookies()) typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookieStore = (await cookies()) as any;
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

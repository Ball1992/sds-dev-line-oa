"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import LiffBottomBar from "@/components/LiffBottomBar";
import { useLiff } from "@/hooks/useLiff";

type User = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
} | null;

export default function HomeClient() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const { closeWindow, sendMessages, openWindow } = useLiff();

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setUser(d.user);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleHome = () => {
    window.location.href = '/';
  };

  const handleShare = () => {
    openWindow(window.location.href, false);
  };

  const handleSendMessage = () => {
    sendMessages([
      {
        type: 'text',
        text: 'Hello from LINE CRM! 👋'
      }
    ]);
  };

  const handleClose = () => {
    closeWindow();
  };

  const bottomBarButtons = [
    { label: 'Home', icon: '🏠', onClick: handleHome },
    { label: 'Share', icon: '📤', onClick: handleShare },
    { label: 'Send', icon: '💬', onClick: handleSendMessage },
    { label: 'Close', icon: '✖️', onClick: handleClose },
  ];

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <a className={styles.primary} href="/api/auth/login">
        Login with LINE
      </a>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", paddingBottom: 80 }}>
        {user.pictureUrl ? (
          <Image src={user.pictureUrl} alt={user.displayName} width={96} height={96} style={{ borderRadius: 9999 }} />
        ) : null}
        <div>
          <strong>Display Name:</strong> {user.displayName}
        </div>
        <div>
          <strong>User ID:</strong> {user.userId}
        </div>
        <a className={styles.secondary} href="/api/auth/logout">
          Logout
        </a>
      </div>
      <LiffBottomBar buttons={bottomBarButtons} />
    </>
  );
}

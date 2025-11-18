'use client';

import { useEffect, useState } from 'react';
import liff, { type Liff } from '@line/liff';

interface LiffState {
  isLoggedIn: boolean;
  isInClient: boolean;
  isReady: boolean;
  profile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
  } | null;
}

export const useLiff = () => {
  const [liffState, setLiffState] = useState<LiffState>({
    isLoggedIn: false,
    isInClient: false,
    isReady: false,
    profile: null,
  });

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          console.error('LIFF ID is not configured');
          return;
        }

        await liff.init({ liffId });

        // Check if LIFF is running inside LINE app
        const isInClient = liff.isInClient();
        
        // Check if user is logged in
        const isLoggedIn = liff.isLoggedIn();

        let profile = null;
        if (isLoggedIn) {
          profile = await liff.getProfile();
        }

        setLiffState({
          isLoggedIn,
          isInClient,
          isReady: true,
          profile,
        });
      } catch (error) {
        console.error('LIFF initialization failed', error);
        setLiffState(prev => ({ ...prev, isReady: true }));
      }
    };

    initLiff();
  }, []);

  const login = () => {
    if (liffState.isReady) {
      liff.login();
    }
  };

  const logout = () => {
    if (liffState.isReady && liffState.isLoggedIn) {
      liff.logout();
      setLiffState(prev => ({ ...prev, isLoggedIn: false, profile: null }));
    }
  };

  const closeWindow = () => {
    if (liffState.isReady && liffState.isInClient) {
      liff.closeWindow();
    }
  };

  const openWindow = (url: string, external = false) => {
    if (liffState.isReady) {
      liff.openWindow({
        url,
        external,
      });
    }
  };

  const sendMessages = async (messages: Parameters<Liff['sendMessages']>[0]) => {
    if (liffState.isReady && liffState.isInClient) {
      try {
        await liff.sendMessages(messages);
      } catch (error) {
        console.error('Failed to send messages', error);
      }
    }
  };

  return {
    ...liffState,
    login,
    logout,
    closeWindow,
    openWindow,
    sendMessages,
    liff,
  };
};

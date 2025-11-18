'use client';

import { useLiff } from '@/hooks/useLiff';
import styles from './LiffBottomBar.module.css';

interface BottomBarButton {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

interface LiffBottomBarProps {
  buttons: BottomBarButton[];
}

export default function LiffBottomBar({ buttons }: LiffBottomBarProps) {
  const { isReady, isInClient } = useLiff();

  // Only show the bottom bar when LIFF is ready and running inside LINE app
  if (!isReady || !isInClient) {
    return null;
  }

  return (
    <div className={styles.bottomBar}>
      <div className={styles.buttonContainer}>
        {buttons.map((button, index) => (
          <button
            key={index}
            className={styles.button}
            onClick={button.onClick}
            disabled={button.disabled}
          >
            {button.icon && <span className={styles.icon}>{button.icon}</span>}
            <span className={styles.label}>{button.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

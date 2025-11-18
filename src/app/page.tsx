import styles from "./page.module.css";
import HomeClient from "./HomeClient";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>LINE Login Demo</h1>
        <HomeClient />
      </main>
    </div>
  );
}

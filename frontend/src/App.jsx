import React, { useState } from "react";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [query, setQuery] = useState("");
  const [animeList, setAnimeList] = useState([]);
  const [playerUrl, setPlayerUrl] = useState("");
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:443";

  const search = async () => {
    if (!query) return;
    setLoading(true);
    setHasSearched(true);
    setPlayerUrl("");
    try {
      const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setAnimeList(data);
    } catch (e) {
      alert("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setHasSearched(false);
    setAnimeList([]);
    setPlayerUrl("");
    setQuery("");
  };

  return (
    <div style={styles.container}>
      <Analytics />
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.isolatedLogoWrapper}>
        <img src="/chillyanime.png" alt="Logo Decor" style={styles.isolatedLogo} />
      </div>

      <header style={styles.header}>
        <div style={styles.navContent}>

          <div style={styles.logoWrapper} onClick={goHome}>
            <h1 style={styles.logoText}>
              CHILLY<span style={styles.logoAccent}>ANIME</span>
            </h1>
            <div style={styles.logoDot}></div>
          </div>

          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.input}
              placeholder="Найти аниме..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <button
              style={styles.searchBtn}
              onClick={search}
              disabled={loading}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ff6b81"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ff4757"}
            >
              {loading ? "..." : "Поиск"}
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {playerUrl ? (
          <div style={styles.playerSection}>
            <div style={styles.playerHeader}>
              <button style={styles.backBtn} onClick={() => setPlayerUrl("")}>← Назад</button>
              <h2 style={styles.activeTitle}>{activeItem?.title}</h2>
            </div>
            <div style={styles.videoCard}>
              <iframe src={playerUrl} style={styles.iframe} frameBorder="0" allowFullScreen title="player" />
            </div>
          </div>
        ) : (
          <>
            {!hasSearched && (
              <div style={styles.hero}>
                <h2 style={styles.heroTitle}>Твой уютный уголок аниме</h2>
                <p style={styles.heroSub}>Введи название в поиске выше, чтобы начать просмотр</p>
              </div>
            )}

            {loading ? (
              <div style={styles.grid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} style={styles.skeletonCard}></div>
                ))}
              </div>
            ) : (
              <div style={styles.grid}>
                {animeList.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ ...styles.card, animation: `fadeInUp 0.5s ease forwards ${index * 0.05}s`, opacity: 0 }}
                    onClick={() => {
                      setActiveItem(item);
                      const params = new URLSearchParams({
                        shikimori_id: item.shikimoriId || "",
                        title: item.originalTitle || item.title,
                        types: "anime-serial,anime"
                      });
                      setPlayerUrl(`https://kodik.info/find-player?${params.toString()}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <div style={styles.posterBox}>
                      <img src={item.poster.startsWith('http') ? item.poster : `${apiUrl}${item.poster}`} alt={item.title} style={styles.posterImg} />
                      <div style={styles.cardOverlay}><div style={styles.playIcon}>▶</div></div>
                      <div style={styles.badge}>{item.year}</div>
                    </div>
                    <div style={styles.cardInfo}>
                      <h3 style={styles.cardTitle}>{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span style={styles.footerItem}>ALPHA VERSION 0.0.1</span>
          <span style={styles.footerDivider}></span>
          <a href="https://t.me/chilly_anime" target="_blank" rel="noreferrer" style={styles.footerItem}>✈ TELEGRAM</a>
        </div>
      </footer>

      <style>{`
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  body { margin: 0; background: #08080a; -webkit-tap-highlight-color: transparent; }
  
  /* Планшетная и мобильная адаптация */
  @media (max-width: 768px) {
    header { top: 0 !important; width: 100% !important; border-radius: 0 !important; border-left: none; border-right: none; }
    .searchContainer { order: 2; flex-basis: 100%; } /* Поиск на всю ширину под логотипом */
  }

  /* Чтобы карточки при наведении не только дергались, но и плавно увеличивались (только для мышки) */
  @media (min-width: 1024px) {
    div[style*="cursor: pointer"]:hover {
      transform: translateY(-5px);
      border-color: rgba(255, 71, 87, 0.3) !important;
    }
  }
`}</style>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#08080a",
    color: "#ffffff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflowX: "hidden"
  },
  blob1: { position: "fixed", top: "-10%", left: "-5%", width: "min(500px, 100vw)", height: "min(500px, 100vw)", background: "radial-gradient(circle, rgba(255, 71, 87, 0.1) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 },

  header: {
    position: "sticky",
    top: "10px",
    zIndex: 100,
    margin: "0 auto",
    width: "95%",
    maxWidth: "1200px",
    borderRadius: "16px",
    backdropFilter: "blur(25px)",
    backgroundColor: "rgba(15, 15, 20, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "10px 15px",
    boxSizing: "border-box"
  },

  navContent: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px"
  },

  logoWrapper: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
  logoText: { fontSize: "clamp(1.1rem, 4vw, 1.4rem)", fontWeight: "900", margin: 0, letterSpacing: "-1px" },
  logoAccent: { color: "#ff4757" },

  searchContainer: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "2px 2px 2px 10px",
    flex: "1 1 300px",
    maxWidth: "100%"
  },

  input: { background: "none", border: "none", padding: "8px", color: "#fff", outline: "none", flex: 1, fontSize: "16px" }, // 16px предотвращает авто-зум на iPhone
  searchBtn: { background: "#ff4757", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },

  main: {
    maxWidth: "1200px",
    width: "100%",
    margin: "20px auto",
    padding: "0 15px",
    boxSizing: "border-box",
    zIndex: 1,
    flex: 1
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(clamp(150px, 45vw, 220px), 1fr))",
    gap: "clamp(10px, 3vw, 25px)"
  },

  hero: { textAlign: "center", marginTop: "15vh", padding: "0 20px" },
  heroTitle: { fontSize: "clamp(1.5rem, 8vw, 2.5rem)", fontWeight: "800", marginBottom: "10px" },
  heroSub: { fontSize: "clamp(0.9rem, 4vw, 1.1rem)", color: "rgba(255,255,255,0.5)" },

  card: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "transform 0.3s", border: "1px solid rgba(255, 255, 255, 0.05)" },
  posterBox: { position: "relative", aspectRatio: "2/3" },
  posterImg: { width: "100%", height: "100%", objectFit: "cover" },
  cardTitle: {
    padding: "10px",
    fontSize: "clamp(0.8rem, 3.5vw, 0.95rem)",
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  playerSection: { width: "100%" },
  playerHeader: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" },
  activeTitle: { fontSize: "clamp(1.1rem, 5vw, 1.5rem)", margin: 0 },
  videoCard: { width: "100%", aspectRatio: "16/9", borderRadius: "12px", overflow: "hidden", background: "#000" },

  footer: { padding: "30px 0", textAlign: "center" },
  footerContent: {
    display: "inline-flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "15px",
    padding: "10px 20px",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "20px"
  },

  isolatedLogoWrapper: {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    zIndex: 1000,
    display: "none",
    "@media (min-width: 768px)": { display: "block" }
  },
  isolatedLogo: { width: "100px", opacity: 0.6 }
};
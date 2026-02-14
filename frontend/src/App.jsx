import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from './components/Card';
import { PlayerSection } from './components/PlayerSection';
import { SearchHeader } from './components/SearchHeader';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap');
  
  body {
    font-family: 'Manrope', sans-serif;
    background: #020305;
    margin: 0;
    overflow-x: hidden;
    color: #f8fafc;
    -webkit-font-smoothing: antialiased;
  }
  
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #F43F5E; }

  /* ФОН */
  .space-bg {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: radial-gradient(circle at 50% 120%, #1e1b4b 0%, #000000 70%);
    z-index: -10; pointer-events: none;
  }

  /* Слой 1: Крупные яркие звезды (Добавил больше точек) */
  .stars-lg {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-image: 
        radial-gradient(2.5px 2.5px at 50px 50px, #fff, transparent),
        radial-gradient(2px 2px at 150px 250px, #fff, transparent),
        radial-gradient(2.5px 2.5px at 300px 100px, rgba(255,255,255,0.9), transparent),
        radial-gradient(2px 2px at 450px 50px, #fff, transparent),
        radial-gradient(2px 2px at 350px 350px, #fff, transparent),
        radial-gradient(2.5px 2.5px at 100px 400px, #fff, transparent),
        radial-gradient(2px 2px at 250px 450px, rgba(255,255,255,0.8), transparent),
        radial-gradient(2px 2px at 480px 480px, #fff, transparent);
    background-size: 500px 500px;
    background-repeat: repeat;
    animation: drift 100s linear infinite;
    opacity: 0.95;
  }

  /* Слой 2: Мелкая россыпь (Увеличил плотность в 3 раза) */
  .stars-sm {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-image: 
        radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 90px 80px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1.5px 1.5px at 200px 20px, rgba(255,255,255,0.6), transparent),
        radial-gradient(1px 1px at 240px 180px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 300px 250px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 380px 10px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1.5px 1.5px at 400px 300px, rgba(255,255,255,0.6), transparent),
        radial-gradient(1px 1px at 450px 150px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 50px 350px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 120px 450px, rgba(255,255,255,0.7), transparent);
    background-size: 500px 500px;
    background-repeat: repeat;
    animation: drift 150s linear infinite;
    opacity: 0.6;
  }

  @keyframes drift {
    from { background-position: 0 0; }
    to { background-position: 500px 500px; }
  }
`;

export default function App() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "" });
  const [animeList, setAnimeList] = useState([]);
  const [popularList, setPopularList] = useState([]);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("anime_history") || "[]"); }
    catch (e) { return []; }
  });
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetch(`${apiUrl}/popular`)
      .then(res => res.json())
      .then(data => setPopularList(Array.isArray(data) ? data : []))
      .catch(err => console.error("Ошибка:", err));
  }, []);

  useEffect(() => { if (filters.genre) search(); }, [filters.genre]);

  const search = async () => {
    if (!query.trim() && !filters.genre) return;
    setLoading(true); setHasSearched(true);
    try {
      const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(query)}&genre=${filters.genre}`);
      const data = await res.json();
      setAnimeList(Array.isArray(data) ? data : []);
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCardClick = (item) => {
    setActiveItem(item);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    setHistory(prev => {
      const id = item.shikimoriId || item.id;
      const filtered = prev.filter(h => (h.shikimoriId || h.id) !== id);
      const updated = [item, ...filtered].slice(0, 15);
      localStorage.setItem("anime_history", JSON.stringify(updated));
      return updated;
    });
  };

  const goHome = () => {
    setActiveItem(null); setQuery(""); setFilters({ genre: "" }); setHasSearched(false); setAnimeList([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayedList = useMemo(() => hasSearched ? animeList : popularList, [hasSearched, animeList, popularList]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{globalStyles}</style>

      <div className="space-bg">
        <div className="stars-lg"></div>
        <div className="stars-sm"></div>
      </div>

      <div style={{ flex: 1, zIndex: 1 }}>
        {!activeItem ? (
          <SearchHeader query={query} setQuery={setQuery} onSearch={search} filters={filters} setFilters={setFilters} onGoHome={goHome} />
        ) : (
          <nav style={{
            padding: '20px 4vw', display: 'flex', alignItems: 'center',
            background: 'rgba(5, 5, 10, 0.9)', backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            position: 'sticky', top: 0, zIndex: 100, justifyContent: 'space-between'
          }}>
            <div onClick={goHome} style={{ fontSize: '1.5rem', fontWeight: '800', cursor: 'pointer', letterSpacing: '-1px' }}>
              CHILLY<span style={{ color: '#F43F5E' }}>ANIME</span>
            </div>
            <button
              onClick={() => setActiveItem(null)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                padding: '8px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600'
              }}
            >
              ✕ Назад
            </button>
          </nav>
        )}

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          {activeItem && <div style={{ paddingTop: '20px' }}><PlayerSection item={activeItem} /></div>}

          <section ref={resultsRef} style={{ marginTop: activeItem ? '40px' : '-40px', position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
              {hasSearched ? `Результаты поиска` : (
                <><span style={{ width: '12px', height: '12px', background: '#F43F5E', borderRadius: '50%', boxShadow: '0 0 15px #F43F5E' }}></span> В тренде</>
              )}
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Загрузка...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' }}>
                {displayedList.map((item, idx) => (
                  <Card key={item.id || idx} item={item} onClick={handleCardClick} />
                ))}
              </div>
            )}
          </section>

          {history.length > 0 && (
            <section style={{ marginTop: '80px', padding: '40px 0' }}>
              <h3 style={{ color: '#64748b', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '20px', fontWeight: '800', letterSpacing: '2px' }}>История</h3>
              <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }} className="hide-scroll">
                {history.map((item, idx) => (
                  <div key={`hist-${item.id || idx}`} style={{ minWidth: '180px', maxWidth: '180px' }}>
                    <Card item={item} onClick={handleCardClick} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer style={{
        textAlign: 'center', padding: '80px 20px 40px', marginTop: 'auto',
        background: 'linear-gradient(0deg, #020305 30%, transparent 100%)',
        color: '#64748b', position: 'relative', zIndex: 10
      }}>
        <div style={{ marginBottom: '15px', fontWeight: '800', letterSpacing: '2px', color: '#F43F5E', textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.8 }}>
          ⚡ Alpha Build
        </div>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: '600' }}>
          Chilly Anime © 2026
        </p>
        <div>
          <a
            href="https://t.me/chilly_anime"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#60a5fa'}
            onMouseLeave={e => e.target.style.color = '#3B82F6'}
          >
            Telegram
          </a>
        </div>
      </footer>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { Card } from './components/Card';
import { PlayerSection } from './components/PlayerSection';
import { SearchHeader } from './components/SearchHeader';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap');
  
  body {
    font-family: 'Manrope', sans-serif;
    background: #000000;
    margin: 0;
    overflow-x: hidden;
    color: #f8fafc;
  }
  
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #F43F5E; }

  /* --- КОСМОС: ФОН --- */
  .space-bg {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: #020308;
    z-index: -10; pointer-events: none;
    overflow: hidden;
  }

  /* --- ЗВЕЗДЫ: ДИНАМИЧНЫЙ ПОЛЕТ И СВЕЧЕНИЕ --- */
  .stars { 
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
  }
  
  /* Слой 1: Крупные и яркие, летят быстрее */
  .star-layer-1 {
    background-image: 
      radial-gradient(1.5px 1.5px at 10% 20%, #ffffff, transparent),
      radial-gradient(2px 2px at 80% 40%, rgba(255,255,255,0.9), transparent),
      radial-gradient(2.5px 2.5px at 40% 60%, #ffffff, transparent),
      radial-gradient(1.5px 1.5px at 90% 90%, rgba(255,255,255,0.7), transparent),
      radial-gradient(2.5px 2.5px at 30% 80%, rgba(59, 130, 246, 1), transparent);
    background-size: 300px 300px;
    /* drop-shadow дает реальное свечение звездам */
    filter: drop-shadow(0 0 8px #ffffff) drop-shadow(0 0 15px rgba(244, 63, 94, 0.4));
    animation: flyStars 40s linear infinite;
  }
  
  /* Слой 2: Средние, летят чуть медленнее */
  .star-layer-2 {
    background-image: 
      radial-gradient(1.5px 1.5px at 50% 10%, rgba(255,255,255,0.8), transparent),
      radial-gradient(2px 2px at 20% 70%, rgba(255,255,255,0.9), transparent),
      radial-gradient(1.5px 1.5px at 70% 30%, #ffffff, transparent),
      radial-gradient(2px 2px at 85% 65%, rgba(244, 63, 94, 0.9), transparent);
    background-size: 400px 400px;
    filter: drop-shadow(0 0 6px rgba(255,255,255,0.8));
    animation: flyStars 70s linear infinite;
  }

  /* Слой 3: Звездная пыль */
  .star-layer-3 {
    background-image: radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.5), transparent);
    background-size: 80px 80px;
    animation: flyStars 120s linear infinite;
  }

  /* Анимация бесконечного полета через космос */
  @keyframes flyStars {
    from { background-position: 0 0; }
    to { background-position: -1000px 1000px; }
  }

  /* --- КОСМИЧЕСКИЕ ТУМАННОСТИ (ДЫМКА) --- */
  .cosmic-entity {
    position: absolute; border-radius: 50%;
    filter: blur(150px);
    animation: floatEntity 30s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
  }
  .entity-blue { width: 80vw; height: 80vw; background: #0c1b4a; top: -30%; left: -20%; opacity: 0.15; }
  .entity-red { width: 70vw; height: 70vw; background: #4a071c; bottom: -20%; right: -20%; animation-delay: -10s; animation-direction: alternate-reverse; opacity: 0.15; }

  @keyframes floatEntity {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(5vw, -5vh) scale(1.1); }
  }

  /* --- МАГИЯ КАРТОЧЕК --- */
  .glass-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .glass-card:hover { 
    transform: translateY(-10px) scale(1.02); 
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.9), 0 0 20px rgba(244, 63, 94, 0.15); 
    border-color: rgba(244, 63, 94, 0.3) !important; 
    z-index: 10; 
  }
  .glass-card img { transition: transform 0.6s ease; }
  .glass-card:hover img { transform: scale(1.05); }
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{globalStyles}</style>

      {/* ФОН: Глубокий космос с летящими звездами */}
      <div className="space-bg">
        <div className="cosmic-entity entity-blue"></div>
        <div className="cosmic-entity entity-red"></div>

        <div className="stars star-layer-3"></div>
        <div className="stars star-layer-2"></div>
        <div className="stars star-layer-1"></div>
      </div>

      <div style={{ flex: 1, zIndex: 1 }}>
        {!activeItem ? (
          <SearchHeader query={query} setQuery={setQuery} onSearch={search} filters={filters} setFilters={setFilters} onGoHome={goHome} />
        ) : (
          <nav style={{
            padding: '30px 50px',
            display: 'flex', alignItems: 'center',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)',
            position: 'sticky', top: 0, zIndex: 100, justifyContent: 'space-between',
            pointerEvents: 'none'
          }}>
            <div onClick={goHome} style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px', cursor: 'pointer', pointerEvents: 'auto', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
              CHILLY<span style={{ color: '#F43F5E' }}>ANIME</span>
            </div>
            <button
              onClick={() => setActiveItem(null)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                color: '#fff', padding: '10px 22px', borderRadius: '14px', cursor: 'pointer',
                fontWeight: '600', transition: 'all 0.3s', pointerEvents: 'auto', backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.transform = 'translateY(0)'; }}
            >
              ✕ Вернуться
            </button>
          </nav>
        )}

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px' }}>
          {activeItem && <div style={{ paddingTop: '20px' }}><PlayerSection item={activeItem} /></div>}

          <section ref={resultsRef} style={{ marginTop: activeItem ? '40px' : '-40px', position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
              {hasSearched ? `Результаты поиска` : (
                <><span style={{ width: '12px', height: '12px', background: '#F43F5E', borderRadius: '50%', boxShadow: '0 0 15px #F43F5E' }}></span> В тренде</>
              )}
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px', color: '#64748b', fontSize: '1.2rem' }}>Сканируем звездные системы...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '30px' }}>
                {(hasSearched ? animeList : popularList).map((item, idx) => (
                  <Card key={item.id || idx} item={item} onClick={handleCardClick} />
                ))}
              </div>
            )}
          </section>

          {history.length > 0 && (
            <section style={{ marginTop: '100px', padding: '40px 0' }}>
              <h3 style={{ color: '#64748b', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px', fontWeight: '800' }}>История просмотров</h3>
              <div style={{ display: 'flex', gap: '25px', overflowX: 'auto', paddingBottom: '30px', paddingRight: '20px' }} className="hide-scroll">
                {history.map((item, idx) => (
                  <div key={`hist-${item.id || idx}`} style={{ minWidth: '200px', maxWidth: '200px' }}>
                    <Card item={item} onClick={handleCardClick} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer style={{
        textAlign: 'center', padding: '80px 20px 40px', marginTop: '40px',
        background: 'linear-gradient(0deg, #000 0%, rgba(0,0,0,0) 100%)',
        color: '#64748b', position: 'relative', zIndex: 10
      }}>
        <div style={{ marginBottom: '10px', fontWeight: '800', letterSpacing: '2px', color: '#F43F5E', textTransform: 'uppercase', fontSize: '0.8rem' }}>⚡ Alpha Build</div>
        <p style={{ margin: 0 }}>Создано с душой. Баги кидать в <a href="https://t.me/chilly_anime" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', borderBottom: '1px dashed #fff' }}>Telegram</a>.</p>
      </footer>
    </div>
  );
}
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Card } from './components/Card';
import { PlayerSection } from './components/PlayerSection';
import { SearchHeader } from './components/SearchHeader';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const globalStyles = (isLow) => `
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

  .space-bg {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: radial-gradient(circle at 50% 120%, #1e1b4b 0%, #000000 70%);
    z-index: -10; pointer-events: none;
  }

  .stars-lg, .stars-sm {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-repeat: repeat;
    animation: ${isLow ? 'none' : 'drift'} 100s linear infinite;
  }

  .stars-lg {
    background-image: 
        radial-gradient(2.5px 2.5px at 50px 50px, #fff, transparent),
        radial-gradient(2px 2px at 150px 250px, #fff, transparent),
        radial-gradient(2.5px 2.5px at 300px 100px, rgba(255,255,255,0.9), transparent);
    background-size: 500px 500px;
    opacity: 0.9;
  }

  .stars-sm {
    background-image: 
        radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.7), transparent),
        radial-gradient(1px 1px at 90px 80px, rgba(255,255,255,0.7), transparent);
    background-size: 500px 500px;
    opacity: 0.5;
    animation-duration: 150s;
  }

  @keyframes drift {
    from { background-position: 0 0; }
    to { background-position: 500px 500px; }
  }

  .horizontal-scroll-container {
    display: flex;
    gap: 15px;
    overflow-x: auto;
    padding: 10px 0 20px 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .horizontal-scroll-container::-webkit-scrollbar {
    display: none;
  }

  .load-more-btn {
    display: block; margin: 40px auto; padding: 12px 40px;
    background: transparent; color: #fff;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 30px; font-weight: 700; cursor: pointer;
    transition: all 0.3s ease;
  }
  .load-more-btn:hover {
    background: #fff; color: #000; border-color: #fff;
    box-shadow: 0 0 20px rgba(255,255,255,0.3);
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease forwards;
    opacity: 0;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Home = ({ onCardClick, lowGraphics, toggleGraphics, searchState }) => {
  const {
    query, setQuery,
    filters, setFilters,
    animeList, setAnimeList,
    hasSearched, setHasSearched,
    popularList, setPopularList,
    page, setPage
  } = searchState;

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const resultsRef = useRef(null);

  const favorites = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("anime_favorites") || "[]"); } catch { return []; }
  }, []);

  const history = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("anime_history") || "[]"); } catch { return []; }
  }, []);

  // Загрузка популярных при первом входе
  useEffect(() => {
    document.title = "Chilly Anime — Смотри аниме без лагов";
    if (popularList.length === 0) {
      setLoading(true);
      fetch(`${apiUrl}/popular?page=1`)
        .then(res => res.json())
        .then(data => {
          setPopularList(Array.isArray(data) ? data : []);
          setLoading(false);
        }).catch(() => setLoading(false));
    }
  }, [popularList.length, setPopularList]);

  // Функция поиска и подгрузки
  const fetchData = useCallback(async (pageNum = 1, isNewSearch = false) => {
    if (isNewSearch) {
      setLoading(true);
      setAnimeList([]);
    } else {
      setLoadingMore(true);
    }

    const endpoint = hasSearched || (isNewSearch && query.trim())
      ? `${apiUrl}/search?q=${encodeURIComponent(query)}&genre=${filters.genre}&page=${pageNum}`
      : `${apiUrl}/popular?page=${pageNum}`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const newData = Array.isArray(data) ? data : [];

      if (hasSearched || isNewSearch) {
        setAnimeList(prev => isNewSearch ? newData : [...prev, ...newData]);
        if (isNewSearch) {
          setHasSearched(true);
          setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      } else {
        setPopularList(prev => pageNum === 1 ? newData : [...prev, ...newData]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, filters, hasSearched, setAnimeList, setPopularList, setHasSearched]);

  // Поиск при нажатии на жанр
  useEffect(() => {
    if (filters.genre) {
      setPage(1);
      fetchData(1, true);
    }
  }, [filters.genre, fetchData, setPage]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, false);
  };

  const displayedList = hasSearched ? animeList : popularList;

  return (
    <>
      <Helmet><title>Chilly Anime — Смотри аниме без лагов</title></Helmet>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', zIndex: 1, position: 'relative' }}>
        <SearchHeader
          query={query} setQuery={setQuery}
          onSearch={() => { setPage(1); fetchData(1, true); }}
          filters={filters} setFilters={setFilters}
          onGoHome={() => { setHasSearched(false); setQuery(""); setFilters({ genre: "" }); setPage(1); }}
          lowGraphics={lowGraphics} toggleGraphics={toggleGraphics}
        />

        <section ref={resultsRef} style={{ marginTop: '20px', position: 'relative', zIndex: 2 }}>
          {/* Индикатор загрузки теперь появляется ПЕРЕД контентом, если это новый поиск */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '1.1rem', fontWeight: '600' }}>
              <div className="spinner" style={{ border: '3px solid rgba(244, 63, 94, 0.2)', borderTop: '3px solid #F43F5E', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
              Ищем тайтлы...
            </div>
          )}

          {!loading && (
            <>
              {favorites.length > 0 && !hasSearched && (
                <div style={{ marginBottom: '50px' }} className="fade-in">
                  <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.4rem)', marginBottom: '15px', fontWeight: '800' }}>❤️ Избранное</h2>
                  <div className="horizontal-scroll-container">
                    {favorites.map((item, idx) => (
                      <div key={`fav-${item.id}-${idx}`} style={{ minWidth: '150px', maxWidth: '150px', flexShrink: 0 }}>
                        <Card item={item} onClick={onCardClick} lowGraphics={lowGraphics} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', marginBottom: '25px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
                {hasSearched ? `Результаты поиска` : <><span style={{ width: '10px', height: '10px', background: '#F43F5E', borderRadius: '50%', boxShadow: '0 0 15px #F43F5E' }}></span> В тренде</>}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }} className="fade-in">
                {displayedList.map((item, idx) => (
                  <Card key={`${item.id}-${idx}`} item={item} onClick={onCardClick} lowGraphics={lowGraphics} />
                ))}
              </div>

              {displayedList.length > 0 && (
                <button className="load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Загрузка...' : 'Показать еще'}
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [cinemaMode, setCinemaMode] = useState(false);
  const [lowGraphics, setLowGraphics] = useState(() => localStorage.getItem("low_graphics") === "true");

  // СОСТОЯНИЕ ВЫНЕСЕНО СЮДА ДЛЯ СОХРАНЕНИЯ ПОИСКА ПРИ НАЖАТИИ "НАЗАД"
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "" });
  const [animeList, setAnimeList] = useState([]);
  const [popularList, setPopularList] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);

  const toggleGraphics = () => {
    const newVal = !lowGraphics;
    setLowGraphics(newVal);
    localStorage.setItem("low_graphics", newVal.toString());
  };

  const resetSearch = () => {
    setHasSearched(false);
    setQuery("");
    setFilters({ genre: "" });
    setPage(1);
  };

  const handleCardClick = (item) => {
    const id = item.shikimoriId || item.id;
    navigate(`/watch/${id}`, { state: { item } });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{globalStyles(lowGraphics)}</style>
      <div className="space-bg"><div className="stars-lg"></div><div className="stars-sm"></div></div>

      <div style={{ flex: 1, zIndex: 1, position: 'relative' }}>
        <Routes>
          <Route path="/" element={
            <Home
              onCardClick={handleCardClick}
              lowGraphics={lowGraphics}
              toggleGraphics={toggleGraphics}
              searchState={{
                query, setQuery,
                filters, setFilters,
                animeList, setAnimeList,
                popularList, setPopularList,
                hasSearched, setHasSearched,
                page, setPage
              }}
            />
          } />
          <Route path="/watch/:id" element={
            <PlayerSection
              cinemaMode={cinemaMode}
              setCinemaMode={setCinemaMode}
              lowGraphics={lowGraphics}
              toggleGraphics={toggleGraphics}
              resetSearch={resetSearch}
            />
          } />
        </Routes>
      </div>

      <footer style={{
        textAlign: 'center', padding: '40px 20px', marginTop: 'auto',
        background: 'linear-gradient(0deg, #020305 30%, transparent 100%)',
        color: '#64748b', position: 'relative', zIndex: 10,
        opacity: cinemaMode ? 0 : 1, transition: 'opacity 0.5s'
      }}>
        <div style={{ marginBottom: '10px', fontWeight: '800', letterSpacing: '2px', color: '#F43F5E', textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.8 }}>⚡ Alpha Build</div>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: '600' }}>Chilly Anime © 2026</p>
        <div><a href="https://t.me/chilly_anime" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>Telegram</a></div>
      </footer>
    </div>
  );
}
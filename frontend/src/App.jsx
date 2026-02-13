import React, { useState, useEffect, useRef } from 'react';
import { Card } from './components/Card';
import { PlayerSection } from './components/PlayerSection';
import { SearchHeader } from './components/SearchHeader';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "" });
  const [animeList, setAnimeList] = useState([]);
  const [popularList, setPopularList] = useState([]);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("anime_history") || "[]");
    } catch (e) { return []; }
  });
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const resultsRef = useRef(null);

  useEffect(() => {
    fetch(`${apiUrl}/popular`)
      .then(res => res.json())
      .then(data => setPopularList(Array.isArray(data) ? data : []))
      .catch(err => console.error("Ошибка популярных:", err));
  }, []);

  useEffect(() => {
    if (filters.genre) search();
  }, [filters.genre]);

  const search = async () => {
    if (!query.trim() && !filters.genre) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(query)}&genre=${filters.genre}`);
      const data = await res.json();
      setAnimeList(Array.isArray(data) ? data : []);
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      console.error("Ошибка поиска:", e);
    } finally {
      setLoading(false);
    }
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

  // Функция для возврата на главную
  const goHome = () => {
    setActiveItem(null);          // Закрываем плеер
    setQuery("");                 // Очищаем строку поиска
    setFilters({ genre: "" });    // Сбрасываем фильтры жанров
    setHasSearched(false);        // Убираем статус "результаты поиска"
    setAnimeList([]);             // Очищаем результаты
    window.scrollTo({ top: 0, behavior: "smooth" }); // Скроллим вверх
  };

  return (
    <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <div style={{ flex: 1 }}>
        {!activeItem ? (
          <SearchHeader
            query={query}
            setQuery={setQuery}
            onSearch={search}
            filters={filters}
            setFilters={setFilters}
            onGoHome={goHome} // Передаем функцию в компонент
          />
        ) : (
          <nav style={{ padding: '20px 50px', display: 'flex', alignItems: 'center', background: '#0b0f19', borderBottom: '1px solid rgba(255,255,255,0.05)', justifyContent: 'space-between' }}>
            {/* Вешаем клик на логотип в режиме плеера */}
            <div onClick={goHome} style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px', cursor: 'pointer' }}>
              CHILLY<span style={{ color: '#F43F5E' }}>ANIME</span>
            </div>
            <button onClick={() => setActiveItem(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}>
              ✕ Закрыть плеер
            </button>
          </nav>
        )}

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          {activeItem && (
            <div style={{ paddingTop: '40px' }}>
              <PlayerSection item={activeItem} playerUrl={activeItem?.vibixUrl} />
            </div>
          )}

          <section ref={resultsRef} style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '25px', fontWeight: '700' }}>
              {hasSearched ? `Результаты поиска` : "Популярно сейчас"}
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Поиск и подгрузка плееров...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' }}>
                {(hasSearched ? animeList : popularList).map((item, idx) => (
                  <Card key={item.id || idx} item={item} onClick={handleCardClick} />
                ))}
              </div>
            )}
          </section>

          {history.length > 0 && (
            <section style={{ marginTop: '80px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px' }}>
              <h3 style={{ color: '#4b5563', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '25px' }}>Вы недавно смотрели</h3>
              <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                {history.map((item, idx) => (
                  <div key={`hist-${item.id || idx}`} style={{ minWidth: '180px' }}>
                    <Card item={item} onClick={handleCardClick} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer style={{
        textAlign: 'center', padding: '30px 20px', marginTop: '60px',
        borderTop: '1px solid rgba(255,255,255,0.05)', background: '#070a11', color: '#64748b', fontSize: '0.9rem'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          ⚡ Alpha Version
        </div>
        <p style={{ margin: 0 }}>
          Проект находится на стадии тестирования. Нашли баг или есть идея? Пишите в наш{' '}
          <a href="https://t.me/chilly_anime" target="_blank" rel="noopener noreferrer" style={{ color: '#F43F5E', textDecoration: 'none', fontWeight: 'bold' }}>
            Telegram
          </a>
        </p>
      </footer>
    </div>
  );
}
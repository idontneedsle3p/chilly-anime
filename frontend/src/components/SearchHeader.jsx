import React from 'react';

const styles = {
    navbar: {
        padding: '20px 50px',
        display: 'flex',
        alignItems: 'center',
        background: '#0b0f19',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
    // Добавили cursor: 'pointer', чтобы было понятно, что это кнопка
    logo: { fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px', cursor: 'pointer' },
    hero: {
        height: '50vh',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', background: '#0b0f19',
    },
    title: { fontSize: '3rem', fontWeight: '800', marginBottom: '15px', color: '#fff' },
    subtitle: { color: '#64748b', fontSize: '1rem', marginBottom: '40px' },
    searchContainer: {
        width: '100%', maxWidth: '600px', display: 'flex',
        background: '#161d2b', borderRadius: '12px', padding: '6px',
        border: '1px solid rgba(255,255,255,0.1)'
    },
    input: { flex: 1, background: 'transparent', border: 'none', padding: '12px 20px', color: '#fff', fontSize: '1rem', outline: 'none' },
    button: { background: '#F43F5E', color: '#fff', border: 'none', padding: '0 25px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' },
    genres: { display: 'flex', gap: '10px', marginTop: '25px' },
    genreTab: {
        padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem',
        border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
        transition: 'all 0.2s'
    }
};

const GENRES = [
    { id: "1", name: "Экшен" },
    { id: "4", name: "Комедия" },
    { id: "10", name: "Фэнтези" },
    { id: "22", name: "Романтика" }
];

// Получаем onGoHome из пропсов
export const SearchHeader = ({ query, setQuery, onSearch, filters, setFilters, onGoHome }) => (
    <>
        <nav style={styles.navbar}>
            {/* Вешаем событие клика на логотип */}
            <div style={styles.logo} onClick={onGoHome}>
                CHILLY<span style={{ color: '#F43F5E' }}>ANIME</span>
            </div>
        </nav>
        <div style={styles.hero}>
            <h1 style={styles.title}>Все аниме в одном поиске</h1>
            <p style={styles.subtitle}>Твои любимые тайтлы всегда под рукой. Просто введи название.</p>
            <div style={styles.searchContainer}>
                <input
                    style={styles.input} placeholder="Найти аниме..." value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                />
                <button style={styles.button} onClick={onSearch}>Поиск</button>
            </div>
            <div style={styles.genres}>
                {GENRES.map(g => (
                    <button
                        key={g.id}
                        onClick={() => setFilters({ genre: filters.genre === g.id ? "" : g.id })}
                        style={{
                            ...styles.genreTab,
                            background: filters.genre === g.id ? '#F43F5E' : '#161d2b',
                            color: filters.genre === g.id ? '#fff' : '#64748b'
                        }}
                    >
                        {g.name}
                    </button>
                ))}
            </div>
        </div>
    </>
);
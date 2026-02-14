import React from 'react';

const styles = {
    navbar: {
        padding: '20px 4vw', display: 'flex', alignItems: 'center',
        background: 'transparent',
        position: 'absolute', top: 0, width: '100%', zIndex: 10,
        boxSizing: 'border-box'
    },
    logo: { fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px', cursor: 'pointer', textShadow: '0 0 20px rgba(255,255,255,0.2)' },
    hero: {
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        background: 'transparent',
        padding: '0 20px', paddingTop: '60px'
    },
    title: {
        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
        fontWeight: '800', marginBottom: '15px', color: '#fff',
        letterSpacing: '-2px', lineHeight: '1.1'
    },
    subtitle: { color: '#94a3b8', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '600px', lineHeight: '1.5' },

    searchContainer: {
        width: '100%', maxWidth: '600px', display: 'flex',
        background: 'rgba(20, 20, 30, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px', padding: '6px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
    },
    input: { flex: 1, background: 'transparent', border: 'none', padding: '15px 20px', color: '#fff', fontSize: '1.1rem', outline: 'none', fontFamily: 'inherit' },
    button: {
        background: '#F43F5E',
        color: '#fff', border: 'none', padding: '0 30px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s',
        boxShadow: '0 4px 15px rgba(244, 63, 94, 0.3)'
    },
    genres: { display: 'flex', gap: '10px', marginTop: '30px', flexWrap: 'wrap', justifyContent: 'center' },
    genreTab: {
        padding: '8px 20px', borderRadius: '25px', fontSize: '0.85rem', fontWeight: '600',
        border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s ease',
        background: 'rgba(255,255,255,0.05)'
    }
};

const GENRES = [
    { id: "1", name: "🔥 Экшен" }, { id: "4", name: "😂 Комедия" },
    { id: "10", name: "✨ Фэнтези" }, { id: "22", name: "❤️ Романтика" }
];

export const SearchHeader = ({ query, setQuery, onSearch, filters, setFilters, onGoHome }) => (
    <>
        <nav style={styles.navbar}>
            <div style={styles.logo} onClick={onGoHome}>CHILLY<span style={{ color: '#F43F5E' }}>ANIME</span></div>
        </nav>
        <div style={styles.hero}>
            <h1 style={styles.title}>
                Привет, это Chilly.<br />
                <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.6)' }}>
                    Твой личный кинотеатр.
                </span>
            </h1>
            <p style={styles.subtitle}>Приятного просмотра!</p>
            <div style={styles.searchContainer}>
                <input
                    style={styles.input} placeholder="Поиск тайтлов..." value={query}
                    onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                />
                <button
                    style={styles.button} onClick={onSearch}
                    onMouseEnter={e => e.target.style.opacity = '0.9'}
                    onMouseLeave={e => e.target.style.opacity = '1'}
                >GO</button>
            </div>
            <div style={styles.genres}>
                {GENRES.map(g => {
                    const isActive = filters.genre === g.id;
                    return (
                        <button
                            key={g.id} onClick={() => setFilters({ genre: isActive ? "" : g.id })}
                            style={{
                                ...styles.genreTab,
                                background: isActive ? '#F43F5E' : 'rgba(255,255,255,0.03)',
                                color: isActive ? '#fff' : '#cbd5e1',
                                borderColor: isActive ? '#F43F5E' : 'rgba(255,255,255,0.1)',
                                boxShadow: isActive ? '0 0 15px rgba(244, 63, 94, 0.4)' : 'none'
                            }}
                        >
                            {g.name}
                        </button>
                    );
                })}
            </div>
        </div>
    </>
);
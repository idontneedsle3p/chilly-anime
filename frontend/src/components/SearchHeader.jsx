import React from 'react';

const styles = {
    navbar: {
        padding: '25px 50px', display: 'flex', alignItems: 'center',
        background: 'transparent', /* УБРАЛИ СПЛОШНОЙ ЦВЕТ */
        position: 'absolute', top: 0, width: '100%', zIndex: 10
    },
    logo: { fontSize: '1.8rem', fontWeight: '800', color: '#fff', letterSpacing: '-1.5px', cursor: 'pointer', textShadow: '0 0 20px rgba(255,255,255,0.2)' },
    hero: {
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        background: 'transparent', /* ВОТ ЗДЕСЬ БЫЛ ЖЕСТКИЙ ЦВЕТ, КОТОРЫЙ РЕЗАЛ ЭКРАН */
        padding: '0 20px', paddingTop: '80px'
    },
    title: { fontSize: '4.5rem', fontWeight: '800', marginBottom: '15px', color: '#fff', letterSpacing: '-2px', lineHeight: '1.1' },
    subtitle: { color: '#94a3b8', fontSize: '1.2rem', marginBottom: '50px', maxWidth: '600px', lineHeight: '1.5' },
    searchContainer: {
        width: '100%', maxWidth: '700px', display: 'flex',
        background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
        borderRadius: '20px', padding: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
    },
    input: { flex: 1, background: 'transparent', border: 'none', padding: '18px 25px', color: '#fff', fontSize: '1.1rem', outline: 'none', fontFamily: 'inherit' },
    button: { background: '#F43F5E', color: '#fff', border: 'none', padding: '0 35px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s', boxShadow: '0 10px 20px -10px #F43F5E' },
    genres: { display: 'flex', gap: '12px', marginTop: '40px', flexWrap: 'wrap', justifyContent: 'center' },
    genreTab: {
        padding: '10px 25px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: '600',
        border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)'
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
            <h1 style={styles.title}>Привет, это Chilly.<br /><span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>Приятного просмотра!</span></h1>
            <p style={styles.subtitle}>Твой личный кинозал.</p>
            <div style={styles.searchContainer}>
                <input
                    style={styles.input} placeholder="Например: Магическая битва..." value={query}
                    onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                />
                <button
                    style={styles.button} onClick={onSearch}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >Найти</button>
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
                                borderColor: isActive ? '#F43F5E' : 'rgba(255,255,255,0.1)'
                            }}
                            onMouseEnter={e => !isActive && (e.target.style.background = 'rgba(255,255,255,0.1)')}
                            onMouseLeave={e => !isActive && (e.target.style.background = 'rgba(255,255,255,0.03)')}
                        >
                            {g.name}
                        </button>
                    );
                })}
            </div>
        </div>
    </>
);
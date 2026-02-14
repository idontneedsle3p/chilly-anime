import React from 'react';

// SearchHeader.jsx - замени стили в начале файла
const styles = {
    navbar: {
        padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'transparent',
        width: '100%', zIndex: 10,
        boxSizing: 'border-box'
    },
    logo: { fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px', cursor: 'pointer', textShadow: '0 0 20px rgba(255,255,255,0.2)' },
    hero: {
        minHeight: '40vh', // Уменьшил высоту, чтобы не было лишнего пустого места
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        background: 'transparent',
        padding: '0 20px', paddingTop: '40px' // Уменьшил отступ сверху
    },
    title: {
        fontSize: 'clamp(2rem, 5vw, 3.5rem)', // Сделал чуть компактнее
        fontWeight: '800', marginBottom: '10px', color: '#fff',
        letterSpacing: '-1px', lineHeight: '1.2'
    },
    subtitle: { color: '#94a3b8', fontSize: '1.1rem', marginBottom: '30px', maxWidth: '600px', lineHeight: '1.5', fontWeight: '600' },

    searchContainer: {
        width: '100%', maxWidth: '600px', display: 'flex',
        background: 'rgba(255, 255, 255, 0.03)', // Сделал фон как в кнопках плеера
        backdropFilter: 'blur(10px)',
        borderRadius: '16px', padding: '6px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
    },
    input: { flex: 1, background: 'transparent', border: 'none', padding: '12px 20px', color: '#fff', fontSize: '1.1rem', outline: 'none', fontFamily: 'inherit' },
    button: {
        background: '#F43F5E',
        color: '#fff', border: 'none', padding: '0 25px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s',
        boxShadow: '0 4px 15px rgba(244, 63, 94, 0.3)'
    },
    genres: { display: 'flex', gap: '10px', marginTop: '25px', flexWrap: 'wrap', justifyContent: 'center' },
    genreTab: {
        padding: '8px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', // Квадратнее, как в плеере
        border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s ease',
        background: 'rgba(255,255,255,0.05)', color: '#fff'
    }
};

const GENRES = [
    { id: "1", name: "🔥 Экшен" }, { id: "4", name: "😂 Комедия" },
    { id: "10", name: "✨ Фэнтези" }, { id: "22", name: "❤️ Романтика" }
];

export const SearchHeader = ({ query, setQuery, onSearch, filters, setFilters, onGoHome, lowGraphics, toggleGraphics }) => (
    <>
        <nav style={styles.navbar}>
            <div style={styles.logo} onClick={onGoHome}>CHILLY<span style={{ color: '#F43F5E' }}>ANIME</span></div>
            <button
                onClick={toggleGraphics}
                title={lowGraphics ? "Включить эффекты" : "Экономный режим"}
                style={{
                    background: lowGraphics ? '#F43F5E' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', padding: '8px 12px', borderRadius: '10px',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: '800'
                }}
            >
                ⚡ {lowGraphics ? 'BOOST' : 'ECO'}
            </button>
        </nav>
        <div style={styles.hero}>
            <h1 style={styles.title}>Привет, это Chilly</h1>
            <p style={styles.subtitle}>Твой личный кинотеатр. Приятного просмотра!</p>
            <div style={styles.searchContainer}>
                <input
                    style={styles.input} placeholder="Поиск тайтлов..." value={query}
                    onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                />
                <button style={styles.button} onClick={onSearch}>GO</button>
            </div>
            <div style={styles.genres}>
                {GENRES.map(g => {
                    const isActive = filters.genre === g.id;
                    return (
                        <button
                            key={g.id} onClick={() => setFilters({ genre: isActive ? "" : g.id })}
                            style={{
                                ...styles.genreTab,
                                background: isActive ? '#F43F5E' : 'rgba(255,255,255,0.05)',
                                color: isActive ? '#fff' : '#cbd5e1',
                                borderColor: isActive ? '#F43F5E' : 'rgba(255,255,255,0.1)',
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
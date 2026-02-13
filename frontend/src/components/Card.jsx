import React from 'react';

const styles = {
    card: {
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '2/3', // Идеальная пропорция для аниме-постеров
        background: '#161d2b',
        transition: 'transform 0.2s ease',
        border: '1px solid rgba(255,255,255,0.05)'
    },
    poster: { width: '100%', height: '100%', objectFit: 'cover' },
    rating: {
        position: 'absolute', top: '10px', right: '10px',
        background: 'rgba(0,0,0,0.8)', color: '#fbbf24',
        padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold'
    },
    overlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '60%',
        background: 'linear-gradient(to top, rgba(11,15,25,1) 0%, rgba(11,15,25,0.8) 40%, transparent 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '15px'
    },
    title: { color: '#fff', fontSize: '1rem', fontWeight: '700', margin: '0 0 5px 0', lineHeight: '1.2' },
    year: { color: '#94a3b8', fontSize: '0.8rem', margin: 0 }
};

export const Card = ({ item, onClick }) => (
    <div
        style={styles.card}
        onClick={() => onClick(item)}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <img src={item.poster} style={styles.poster} alt="" loading="lazy" />
        <div style={styles.rating}>★ {item.rating}</div>
        <div style={styles.overlay}>
            <p style={styles.title}>{item.title}</p>
            <p style={styles.year}>{item.year}</p>
        </div>
    </div>
);
import React from 'react';

const styles = {
    card: {
        position: 'relative', borderRadius: '18px', overflow: 'hidden', cursor: 'pointer',
        aspectRatio: '2/3', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    poster: { width: '100%', height: '100%', objectFit: 'cover' },
    ratingBadge: {
        position: 'absolute', top: '12px', right: '12px',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fbbf24',
        padding: '6px 10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800',
        border: '1px solid rgba(255,255,255,0.1)'
    },
    overlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
        background: 'linear-gradient(to top, rgba(3,7,18,0.95) 0%, rgba(3,7,18,0.6) 50%, transparent 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px'
    },
    title: { color: '#fff', fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0', lineHeight: '1.3', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
    year: { color: '#94a3b8', fontSize: '0.85rem', margin: 0, fontWeight: '600' }
};

export const Card = ({ item, onClick }) => (
    <div className="glass-card" style={styles.card} onClick={() => onClick(item)}>
        <img src={item.poster} style={styles.poster} alt="" loading="lazy" />
        <div style={styles.ratingBadge}>★ {item.rating}</div>
        <div style={styles.overlay}>
            <p style={styles.title}>{item.title}</p>
            <p style={styles.year}>{item.year} • {item.status}</p>
        </div>
    </div>
);
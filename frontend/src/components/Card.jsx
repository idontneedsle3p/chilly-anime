import React, { memo } from 'react';

const styles = {
    card: {
        position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
        aspectRatio: '2/3',
        background: 'rgba(30, 30, 40, 0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    poster: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
    ratingBadge: {
        position: 'absolute', top: '10px', right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: '#fbbf24',
        padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800',
        border: '1px solid rgba(255,255,255,0.1)'
    },
    overlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '15px'
    },
    title: { color: '#fff', fontSize: '1rem', fontWeight: '700', margin: '0 0 4px 0', lineHeight: '1.3', textShadow: '0 2px 4px rgba(0,0,0,0.8)' },
    year: { color: '#cbd5e1', fontSize: '0.8rem', margin: 0, fontWeight: '600', opacity: 0.9 }
};

export const Card = memo(({ item, onClick }) => (
    <div
        style={styles.card}
        onClick={() => onClick(item)}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.6)';
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.5)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        }}
    >
        <img
            src={item.poster}
            style={styles.poster}
            alt=""
            loading="lazy"
        />
        <div style={styles.ratingBadge}>{item.rating}</div>
        <div style={styles.overlay}>
            <p style={styles.title}>{item.title}</p>
            <p style={styles.year}>{item.year} • {item.status}</p>
        </div>
    </div>
));
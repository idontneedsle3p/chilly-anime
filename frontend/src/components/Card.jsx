import React, { memo } from 'react';

export const Card = memo(({ item, onClick, lowGraphics }) => {
    const styles = {
        card: {
            position: 'relative', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
            aspectRatio: '2/3', background: 'rgba(30, 30, 40, 0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        },
        poster: { width: '100%', height: '100%', objectFit: 'cover' },
        ratingBadge: {
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(0,0,0,0.8)', color: '#fbbf24',
            padding: '3px 7px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800'
        },
        overlay: {
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px'
        }
    };

    return (
        <div
            style={styles.card} onClick={() => onClick(item)}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                if (!lowGraphics) e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.6)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <img src={item.poster} style={styles.poster} alt="" loading="lazy" />
            <div style={styles.ratingBadge}>{item.rating}</div>
            <div style={styles.overlay}>
                <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700', margin: 0, lineHeight: '1.2' }}>{item.title}</p>
            </div>
        </div>
    );
});
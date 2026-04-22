import React, { useMemo } from 'react';
import './Stone.jsx.css';

const Stone = ({ message, index }) => {
  // Fukinsei (Asymmetry): Every stone has a slightly different offset
  const offsetClass = index % 3 === 0 ? 'offset-left' : index % 3 === 1 ? 'offset-right' : 'offset-center';
  
  const isSent = message.status === 'sent';
  const displayDate = new Date(message.scheduled_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Generate a unique organic path for each stone
  const stonePath = useMemo(() => {
    const seed = index * 123.45;
    const r1 = 45 + (Math.sin(seed) * 5);
    const r2 = 45 + (Math.cos(seed * 0.8) * 8);
    const r3 = 45 + (Math.sin(seed * 1.5) * 6);
    const r4 = 45 + (Math.cos(seed * 2.1) * 7);
    
    return `M 50,5 
            C ${50+r1},5 ${100-5},${50-r2} 95,50 
            C 95,${50+r3} ${50+r4},95 50,95 
            C ${50-r1},95 5,${50+r2} 5,50 
            C 5,${50-r3} ${50-r4},5 50,5 Z`;
  }, [index]);

  return (
    <div className={`stone-entry ${offsetClass}`}>
      <div className="stone-marker-wrapper">
        <svg viewBox="0 0 100 100" className="stone-svg">
          <path d={stonePath} fill="var(--ui-stone)" />
          {/* Subtle inner texture/depth */}
          <path d={stonePath} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" transform="scale(0.95) translate(2.5, 2.5)" />
        </svg>
      </div>
      <div className="stone-content">
        <span className="timestamp">{displayDate}</span>
        <h3 className="editorial">{message.title || 'untitled thought'}</h3>
        {isSent && message.decrypted_content && (
          <p className="body-text">{message.decrypted_content}</p>
        )}
        {!isSent && (
          <div className="locked-indicator ui-text">sealed in silence</div>
        )}
      </div>
    </div>
  );
};

export default Stone;

import React from 'react'
import './DearMELogo.css'

const DearMELogo = ({ className = '' }) => {
    return (
        <div className={`logo-container ${className}`}>
            {/* SVG Constellation Background */}
            <svg className="constellation-layer" viewBox="0 0 300 150">
                {/* Connection Lines */}
                <polyline points="40,100 80,40 220,50 260,110" className="star-line" />

                {/* Main Gold Stars */}
                <circle cx="40" cy="100" r="2" className="star-gold twinkle-slow" />
                <circle cx="80" cy="40" r="3" className="star-gold twinkle-fast" />
                <circle cx="220" cy="50" r="2.5" className="star-gold twinkle-slow" />
                <circle cx="260" cy="110" r="2" className="star-gold twinkle-fast" />

                {/* Tiny White Sparkles */}
                <circle cx="150" cy="20" r="1" className="star-white" opacity="0.5" />
                <circle cx="180" cy="130" r="1" className="star-white" opacity="0.5" />

                {/* Cross Star Shape (Sparkle) */}
                <path d="M50 30 L51 25 L52 30 L57 31 L52 32 L51 37 L50 32 L45 31 Z" fill="white" opacity="0.8" className="twinkle-fast" />
            </svg>

            {/* Main Logo Text */}
            <h1 className="logo-text">DearMe</h1>
        </div>
    )
}

export default DearMELogo

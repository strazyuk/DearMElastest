import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './NavSlider.css'

const NavSlider = () => {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine active tab based on current route
    const isVault = location.pathname === '/vault'

    const handleToggle = (toVault) => {
        if (toVault) {
            navigate('/vault')
        } else {
            navigate('/dashboard')
        }
    }

    return (
        <div className="nav-slider-container">
            <div className="nav-slider-track">
                {/* Animated background slider */}
                <div className={`nav-slider-background ${isVault ? 'vault-active' : 'write-active'}`} />

                {/* Option Buttons */}
                <button
                    className={`nav-slider-option ${!isVault ? 'active' : ''}`}
                    onClick={() => handleToggle(false)}
                >
                    <span className="material-symbols-outlined">edit_note</span>
                    <span className="nav-slider-label">Write</span>
                </button>

                <button
                    className={`nav-slider-option ${isVault ? 'active' : ''}`}
                    onClick={() => handleToggle(true)}
                >
                    <span className="material-symbols-outlined">inventory_2</span>
                    <span className="nav-slider-label">Vault</span>
                </button>
            </div>
        </div>
    )
}

export default NavSlider

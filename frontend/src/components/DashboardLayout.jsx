import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NavSlider from './NavSlider'
import DearMELogo from './DearMELogo'
import './DashboardLayout.css'

const DashboardLayout = () => {
    const { signOut, user } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="dashboard-layout">
            {/* Persistent Header */}
            <header className="dashboard-header">
                <div className="header-logo float-element">
                    <DearMELogo className="dashboard-logo-custom" />
                </div>

                <NavSlider />

                <div className="header-actions">
                    {/* Only show on vault page or always? Let's check logic. 
               For now, keeping the logout button constant. 
               Vault page had specific actions, we might need to conditionally render them or 
               move them to the specific page content. 
               The prompt implies the NAV is the slider. 
               I'll keep the basic layout simple for now.
           */}
                    <button
                        onClick={handleSignOut}
                        className="header-btn"
                        title="Sign Out"
                    >
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    )
}

export default DashboardLayout

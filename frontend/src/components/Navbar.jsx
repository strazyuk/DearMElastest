import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'
import DearMELogo from './DearMELogo'

const Navbar = () => {
    const { user, signOut } = useAuth()

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-brand">
                    <DearMELogo className="navbar-logo-custom" />
                </Link>

                <div className="navbar-menu">
                    <Link to="/dashboard" className="navbar-link">
                        Dashboard
                    </Link>
                    <Link to="/vault" className="navbar-link">
                        Vault
                    </Link>
                </div>

                <div className="navbar-user">
                    <span className="user-email">{user?.email}</span>
                    <button onClick={handleSignOut} className="btn-icon" title="Sign Out">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar

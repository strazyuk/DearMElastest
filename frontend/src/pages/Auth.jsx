import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import './Auth.css'
import DearMELogo from '../components/DearMELogo'

const Auth = () => {
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const { signIn, signUp, signInWithGoogle } = useAuth()
    const navigate = useNavigate()

    const handleGoogleSignIn = async () => {
        try {
            setError('')
            setLoading(true)
            await signInWithGoogle()
        } catch (err) {
            setError(err.message || 'Failed to sign in with Google')
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validate password confirmation for signup
        if (isSignUp && password !== confirmPassword) {
            setError('The passphrases must align. Please check and try again.')
            return
        }

        setLoading(true)

        try {
            if (isSignUp) {
                await signUp(email, password)
            } else {
                await signIn(email, password)
            }
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container ethereal-bg">
            {/* Ambient orbs */}
            <div className="ambient-orb orb-1"></div>
            <div className="ambient-orb orb-2"></div>

            <main className="auth-main">
                <div className="auth-card-wrapper">
                    <div className="glass-card auth-card">
                        {/* Top glow */}
                        <div className="card-glow"></div>

                        {/* Header */}
                        <div className="auth-header">
                            <div className="auth-icon-wrapper">
                                <DearMELogo className="auth-logo-custom" />
                            </div>
                            <h1 className="auth-title font-serif italic">DearME</h1>
                            <p className="auth-subtitle">
                                {isSignUp
                                    ? 'Step into the river of time'
                                    : 'Welcome back, time traveller'}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="auth-form">
                            {/* Email Field */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Traveller
                                </label>
                                <div className="input-underline">
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="input-field"
                                        placeholder="Who are you?"
                                        disabled={loading}
                                    />
                                    <span className="material-symbols-outlined input-icon">person_outline</span>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    {isSignUp ? 'Choose Passphrase' : 'Passphrase'}
                                </label>
                                <div className="input-underline">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="input-field"
                                        placeholder={isSignUp ? "Create your secret..." : "The secret word..."}
                                        minLength={6}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field - Only for Sign Up */}
                            {isSignUp && (
                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        Confirm Passphrase
                                    </label>
                                    <div className="input-underline">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="input-field"
                                            placeholder="Repeat the secret..."
                                            minLength={6}
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="password-toggle"
                                        >
                                            <span className="material-symbols-outlined">
                                                {showPassword ? 'visibility' : 'visibility_off'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && <div className="error-message">{error}</div>}

                            {/* Submit Button */}
                            <div className="form-actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    <div className="btn-shimmer"></div>
                                    <span className="btn-text">
                                        {loading ? <LoadingSpinner /> : isSignUp ? 'Begin Journey' : 'Resume Journey'}
                                    </span>
                                    {!loading && (
                                        <span className="material-symbols-outlined btn-arrow">arrow_forward</span>
                                    )}
                                </button>

                                <div className="auth-divider">or</div>

                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    className="btn-google"
                                    disabled={loading}
                                >
                                    <img
                                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                        alt="Google"
                                        className="google-icon"
                                    />
                                    <span>
                                        {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                                    </span>
                                </button>

                                {/* Toggle Links */}
                                <div className="auth-links">
                                    <a href="#" className="auth-link">Forgotten path?</a>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsSignUp(!isSignUp)
                                            setError('')
                                            setConfirmPassword('')
                                        }}
                                        className="auth-link-toggle"
                                        disabled={loading}
                                    >
                                        <span className="link-text-muted">
                                            {isSignUp ? 'Already exploring?' : 'New here?'}
                                        </span>
                                        <span className="link-text-accent">
                                            {isSignUp ? 'Sign In' : 'Begin'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="auth-footer">
                        <p>© 2026 DearME. Echoes of tomorrow.</p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Auth

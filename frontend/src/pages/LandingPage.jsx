import { Link } from 'react-router-dom'
import './LandingPage.css'
import DearMELogo from '../components/DearMELogo'

const LandingPage = () => {
    return (
        <div className="landing-root aurora-bg">
            {/* Starfield particles */}
            <div className="starfield">
                <div className="star star-1"></div>
                <div className="star star-2"></div>
                <div className="star star-3"></div>
            </div>

            {/* Navigation */}
            <header className="landing-nav">
                <div className="nav-logo">
                    <DearMELogo className="nav-logo-custom" />
                </div>
                <div className="nav-links">
                    <a href="#how-it-works">The Journey</a>
                    <a href="#peace-of-mind">Peace of Mind</a>
                    <a href="#about">Our Promise</a>
                    <Link to="/auth" className="nav-signin-btn">Sign In</Link>
                </div>
                <button className="mobile-menu-btn">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </header>

            <main>
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-bg-image"></div>
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="pulse-dot"></span>
                            Your Personal Time Capsule
                        </div>
                        <h1 className="hero-title serif">
                            Whisper to the <br />
                            <span className="text-gradient italic">Stars of Tomorrow</span>
                        </h1>
                        <p className="hero-subtitle">
                            Cast your hopes, dreams, and memories into the river of time.
                            We keep them safe until you meet them again.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/auth" className="btn-primary">
                                <span className="material-symbols-outlined">history_edu</span>
                                Begin
                            </Link>
                        </div>
                    </div>

                </section>

                {/* Value Props Section */}
                <section className="values-section">
                    <div className="values-grid">
                        <div className="value-item group">
                            <div className="value-icon purple">
                                <span className="material-symbols-outlined">spa</span>
                            </div>
                            <h3 className="serif">Peace of Mind</h3>
                            <p>Release your burdens and dreams. Knowing they are safe brings a quiet calm to the present moment.</p>
                        </div>
                        <div className="value-item group">
                            <div className="value-icon indigo">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <h3 className="serif">Sealed in Time</h3>
                            <p>Your words are wrapped in a digital cocoon, unreachable by anyone—even us—until the moment you choose.</p>
                        </div>
                        <div className="value-item group">
                            <div className="value-icon blue">
                                <span className="material-symbols-outlined">auto_awesome</span>
                            </div>
                            <h3 className="serif">A Gift to Yourself</h3>
                            <p>The most profound conversations are often the ones we have with ourselves across the distance of time.</p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="how-it-works" id="how-it-works">
                    <div className="decorative-blob"></div>
                    <div className="section-container">
                        <div className="section-header centered">
                            <h2 className="serif italic">The Journey of a Thought</h2>
                            <p>Sending a message to the future is a simple, sacred act.</p>
                        </div>
                        <div className="steps-grid">
                            <div className="glass-panel step-card">
                                <div className="step-number serif">1</div>
                                <div className="step-icon purple">
                                    <span className="material-symbols-outlined">flight</span>
                                </div>
                                <h3 className="serif">Reflect & Compose</h3>
                                <p>Pour your heart out. Be honest, be raw, be hopeful. Attach a photo of the sunset, or a song that moves you today.</p>
                            </div>
                            <div className="glass-panel step-card">
                                <div className="step-number serif">2</div>
                                <div className="step-icon indigo">
                                    <span className="material-symbols-outlined">hourglass_top</span>
                                </div>
                                <h3 className="serif">Set the Moment</h3>
                                <p>Select a date when the time will be right. A birthday, an anniversary, or just a random Tuesday ten years from now.</p>
                            </div>
                            <div className="glass-panel step-card">
                                <div className="step-number serif">3</div>
                                <div className="step-icon blue">
                                    <span className="material-symbols-outlined">mark_email_read</span>
                                </div>
                                <h3 className="serif">The Reunion</h3>
                                <p>Forget about it. Live your life. When the stars align on your chosen date, your past self will reach out to say hello.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security / Peace of Mind Section */}
                <section className="security-section" id="peace-of-mind">
                    <div className="section-container security-grid">
                        <div className="security-image">
                            <div className="image-wrapper">
                                <div className="image-overlay"></div>
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGO7SLmtuzLGoVtjtqPtqQecHLegLpH3EnuErkkYeU-5AQ5zevQQvWehZ2iWvVqI6yO56G77tnMueBYwrTxOqtTjTIR_-KejwKkBE96dXvBza9sK1xAuYkHLOdZeSzXwSTg4hmKbHxVjIlgpdFL2MzmRVvPdnKw7oIgfylndZOwI2ylqrgvRVjFHmzzeTUnh2Hn1R-Q9EhcF4H4AC-dFPVt7281n-X7CqUFBgXtw4cLvCbCEYDyuEN9KUOrpHpuoFScGmLwz70"
                                    alt="Ethereal landscape with mist"
                                />
                                <div className="glass-panel floating-shield">
                                    <div className="shield-icon">
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                    <div>
                                        <p className="shield-title serif italic">Safely sealed away.</p>
                                        <p className="shield-subtitle">Like a message in a bottle cast into a digital ocean, only you can uncork it when it washes ashore.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="security-content">
                            <h2 className="serif">
                                Rest easy.<br />
                                <span className="text-muted italic">Your secrets are safe.</span>
                            </h2>
                            <p>
                                We believe that your private thoughts are sacred territory. We have built a sanctuary where your words are encrypted and sealed the moment they leave your fingertips.
                            </p>
                            <div className="security-features">
                                <div className="feature-item group">
                                    <span className="material-symbols-outlined">key_off</span>
                                    <div>
                                        <h4 className="serif">Only Your Eyes</h4>
                                        <p>We hold the envelope, but we don't have the letter opener. The key to your memories belongs to you alone.</p>
                                    </div>
                                </div>
                                <div className="feature-item group">
                                    <span className="material-symbols-outlined">cloud_done</span>
                                    <div>
                                        <h4 className="serif">Protected in the Void</h4>
                                        <p>Your message traverses time in a state of suspended animation, invisible to the world until its awakening.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonial */}
                <section className="testimonial-section">
                    <div className="testimonial-glow"></div>
                    <div className="testimonial-container">
                        <span className="material-symbols-outlined quote-icon">format_quote</span>
                        <h2 className="serif italic">
                            "I wrote to myself during a storm. Reading it five years later in the sunlight reminded me that seasons always change. It was a gentle hug from my past self."
                        </h2>
                        <div className="testimonial-author">
                            <div className="author-avatar-wrapper">
                                <div
                                    className="author-avatar"
                                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBxFSBZuCJxeag_PRX7DQ_qli5cdU2Xxs0nUW24kFWqiuFHLJ5N6vlKCFt8UzazrMRyjv2BBGX0HQCS-MLxA3gjMTpe2AMlBOHg3osrtbRvrrNi_kvWqohWFfWQj8Elgw--jzv6SPY1ydtuht2N-cja0byUr30Ke-rS8OF9DdjPll_RduSb9rCL4FzqtdbIfRD28nh1XwoOUDDQNMf0mBzI_nu_bfHCHg5YnDj0T-gUYVlGt4BuAzH1iyzqHJzprsMRnzohwCPT')` }}
                                ></div>
                            </div>
                            <div>
                                <p className="author-name">Sarah Jenkins</p>
                                <p className="author-since">Sent a message in 2019</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <div className="glass-panel cta-card">
                        <h2 className="serif">Leave a note for tomorrow.</h2>
                        <p>The person you will become is waiting to hear from who you are today. Create a bridge across time.</p>
                        <Link to="/auth" className="btn-cta">
                            Begin Your Letter
                        </Link>
                        <p className="cta-note">Start for free • Secure forever</p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <DearMELogo className="footer-logo-custom" />
                        </div>
                        <p>An ethereal archive for your most precious thoughts, waiting patiently for the future.</p>
                    </div>
                    <div className="footer-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Support</a>
                        <a href="#">Manifesto</a>
                    </div>
                    <div className="footer-copyright">
                        © 2026 DEARME INC.
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage

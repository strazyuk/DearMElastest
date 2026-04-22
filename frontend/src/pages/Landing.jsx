import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import HankoButton from '../components/HankoButton';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 1.5, ease: [0.2, 0, 0, 1] }
  };

  return (
    <div className="landing-container">
      {/* Background Graphic Motifs */}
      <motion.div className="landing-enso-bg" style={{ y: y1 }}>
        <img src="/images/enso.png" alt="" />
      </motion.div>
      <div className="landing-koi-bg">
        <img src="/images/sumi_e_koi.png" alt="" className="koi-static-motif motif-peripheral" />
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-bg" 
          style={{ 
            backgroundImage: 'url(/images/hero_sumie.png)', 
            y: y2 
          }}
        ></motion.div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.div className="hero-kana editorial" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: 3 }}>
            静寂
          </motion.div>
          <motion.h1 
            className="hero-title editorial"
            initial={{ opacity: 0, letterSpacing: '0.4em' }}
            animate={{ opacity: 1, letterSpacing: '-0.02em' }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
          >
            DearME
          </motion.h1>
          <motion.p 
            className="ui-text hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            A Digital Zendo for the preservation of thought.
          </motion.p>
        </div>
      </section>

      {/* Ritual Section: The Three Steps */}
      <section className="ritual-overview-section">
        <motion.div className="ritual-step" {...fadeIn}>
          <span className="step-number editorial">01</span>
          <div className="step-title-group">
            <h3 className="editorial">The Intention</h3>
            <span className="subtitle-jp">意図</span>
          </div>
          <p className="body-text">Cast your thoughts into the stillness of the Empty Room. Write with the deliberate care of a scholar.</p>
        </motion.div>

        <motion.div className="ritual-step" {...fadeIn} transition={{ delay: 0.3 }}>
          <span className="step-number editorial">02</span>
          <div className="step-title-group">
            <h3 className="editorial">The Seal</h3>
            <span className="subtitle-jp">封印</span>
          </div>
          <p className="body-text">Press your digital hanko onto the page. Once sealed, a message belongs to the future, untouchable by the present.</p>
        </motion.div>

        <motion.div className="ritual-step" {...fadeIn} transition={{ delay: 0.6 }}>
          <span className="step-number editorial">03</span>
          <div className="step-title-group">
            <h3 className="editorial">The Preservation</h3>
            <span className="subtitle-jp">保存</span>
          </div>
          <p className="body-text">Your words rest in the Garden, hidden until the appointed time. Slowness is not a delay—it is a feature.</p>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section">
        <motion.div className="philosophy-item" {...fadeIn}>
          <div className="philosophy-header-group">
            <h2 className="editorial-header">Kanso</h2>
            <span className="japanese-vertical-label">簡素</span>
          </div>
          <span className="ui-text">Elimination of Non-essential</span>
          <p className="body-text">A sanctuary free from notification, competition, and noise. Here, only your reflection remains.</p>
        </motion.div>

        <div className="vertical-divider"></div>

        <motion.div className="philosophy-item" {...fadeIn} transition={{ delay: 0.3 }}>
          <div className="philosophy-header-group">
            <h2 className="editorial-header">Shibui</h2>
            <span className="japanese-vertical-label">渋い</span>
          </div>
          <span className="ui-text">The Grace of Slowness</span>
          <p className="body-text">Information that breathes. We prioritize the quality of your focus over the quantity of your interactions.</p>
        </motion.div>

        <div className="vertical-divider"></div>

        <motion.div className="philosophy-item" {...fadeIn} transition={{ delay: 0.6 }}>
          <div className="philosophy-header-group">
            <h2 className="editorial-header">Seijaku</h2>
            <span className="japanese-vertical-label">静寂</span>
          </div>
          <span className="ui-text">The Gift of Stillness</span>
          <p className="body-text">Connect with your future self across the bridge of time. A ritual of sealing, preserved in silence.</p>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div {...fadeIn} className="cta-content">
          <HankoButton onClick={() => navigate('/auth')}>
            <div className="hanko-content">
              <span className="hanko-label-en">enter</span>
              <span className="hanko-label-jp">入る</span>
            </div>
          </HankoButton>
          <div className="ui-text mt-8">The gate is open.</div>
        </motion.div>
      </section>

      <footer className="landing-footer ui-text">
        <span>© 2026 Monastery of the Mind</span>
        <span>Version 3.2 · The Koi Pond Aesthetic</span>
      </footer>
    </div>
  );
};

export default Landing;

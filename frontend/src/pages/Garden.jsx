import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import { messageApi } from '../services/api';
import Stone from '../components/Stone';
import HankoButton from '../components/HankoButton';
import './Garden.css';

const Garden = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgsData, quoteData] = await Promise.all([
          messageApi.getMessages(),
          messageApi.getQuote()
        ]);
        setMessages(msgsData.messages || []);
        setQuote(quoteData);
      } catch (error) {
        console.error('The wind has moved it.', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="garden-loading">
        <div className="enso"></div>
      </div>
    );
  }

  return (
    <div className="garden-page">
      {/* Background Motifs */}
      <div className="enso-watermark-fixed">
        <img src="/images/enso.png" alt="" />
      </div>

      <header className="garden-header">
        <div className="header-title-container">
          <div className="vertical-title-group">
            <h1 className="editorial vertical-text">The Garden</h1>
            <span className="japanese-title editorial">庭</span>
          </div>
          <div className="ui-text garden-subtitle">Archive of Stillness</div>
        </div>
        <div className="header-actions">
          <div className="depart-link-group" onClick={handleLogout}>
            <span>depart</span>
            <span className="subtitle-jp">退室</span>
          </div>
          <HankoButton onClick={() => navigate('/compose')}>Compose</HankoButton>
        </div>
      </header>

      <main className="garden-stream">
        {messages.length === 0 ? (
          <div className="empty-garden-elevated">
            <div className="sand-pattern-bg" style={{ backgroundImage: 'url(/images/sand.png)' }}></div>
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 2 }}
               className="empty-content"
            >
              <h2 className="editorial">The sand is raked.</h2>
              <p className="body-text ui-stone-text">Choose your words with the same care as a gardener selects a stone.</p>
              <span className="begin-link ui-text mt-8" onClick={() => navigate('/compose')}>Begin the ritual.</span>
            </motion.div>
          </div>
        ) : (
          <div className="stones-container">
            {messages.map((msg, index) => (
              <Stone key={msg.id} message={msg} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Garden;

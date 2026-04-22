import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { messageApi } from '../services/api';
import HankoButton from '../components/HankoButton';
import './EmptyRoom.css';

const EmptyRoom = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [date, setDate] = useState('');
  const [isSealing, setIsSealing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [quote, setQuote] = useState(null);
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const quoteData = await messageApi.getQuote();
        setQuote(quoteData);
      } catch (error) {
        console.error('The wind has moved it.', error);
      }
    };
    fetchQuote();
  }, []);

  const handleSeal = async () => {
    if (!content || !recipient || !date) return;
    
    setIsSealing(true);
    // Mimic ink drying / fading into paper (1.5s as per PRD)
    setTimeout(async () => {
      try {
        await messageApi.createMessage({
          content,
          title: title || 'Untitled',
          recipient_email: recipient,
          scheduled_date: new Date(date).toISOString(),
        });
        navigate('/garden');
      } catch (error) {
        console.error('The path is blocked.', error);
        setIsSealing(false);
      }
    }, 1500);
  };

  return (
    <div className={`empty-room ${isFocused ? 'focused' : ''} ${isSealing ? 'sealing' : ''}`}>
      {/* Background Graphic Motif: 綴 (Tsuzuru - to compose) */}
      <div className="room-kanji-bg editorial">
        <span>綴</span>
      </div>

      <div className="room-header ui-text">
        <div className="back-link-group" onClick={() => navigate('/garden')} style={{ cursor: 'pointer' }}>
          <span>back to garden</span>
          <span className="subtitle-jp">庭に戻る</span>
        </div>

        <div className="back-link-group" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <span>depart</span>
          <span className="subtitle-jp">退室</span>
        </div>
      </div>

      <main className="writing-surface">
        <div className="writing-container-elevated">
          <input 
            type="text" 
            className="title-input editorial" 
            placeholder="a name for this thought"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          <textarea
            ref={textareaRef}
            className="content-area body-text"
            placeholder="speak into the stillness..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>
      </main>

      <aside className="room-quote-sidebar">
        {quote && (
          <div className="editorial ritual-quote-alt">
            <div className="quote-mark">“</div>
            <p className="quote-text">{quote.quote}</p>
            <footer className="ui-text">— {quote.author}</footer>
          </div>
        )}

        <div className="room-metadata-area-sidebar">
          <div className="metadata-inputs">
            <div className="input-group">
              <span className="ui-text">to:</span>
              <input 
                type="email" 
                className="ui-input" 
                placeholder="future@self.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="input-group">
              <span className="ui-text">until:</span>
              <input 
                type="date" 
                className="ui-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sidebar-action flex-col-center">
            <HankoButton onClick={handleSeal} disabled={isSealing || !content}>
              <div className="hanko-content">
                <span className="hanko-label-en">{isSealing ? 'sealing...' : 'seal'}</span>
                <span className="hanko-label-jp">封印</span>
              </div>
            </HankoButton>
          </div>
        </div>
      </aside>

      {/* Raked sand texture watermark */}
      <div className="raked-sand-watermark">
         <img src="/images/sand.png" alt="" />
      </div>
    </div>
  );
};

export default EmptyRoom;

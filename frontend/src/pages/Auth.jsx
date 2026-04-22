import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import HankoButton from '../components/HankoButton';
import './Auth.css';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('A path has been created. Check your inbox.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/garden');
      }
    } catch (error) {
      setMessage('The path is blocked.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-koi-bg">
        <img src="/images/sumi_e_koi.png" alt="" className="koi-static-motif motif-auth" />
      </div>
      <div className="auth-card">
        <h1 className="editorial">{isSignUp ? 'Begin the Journey' : 'Return to Stillness'}</h1>
        
        <form onSubmit={handleAuth}>
          <div className="input-group">
            <span className="ui-text">spirit</span>
            <input 
              type="email" 
              className="ui-input" 
              placeholder="email@shrine.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <span className="ui-text">key</span>
            <input 
              type="password" 
              className="ui-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="auth-actions">
            <HankoButton disabled={loading}>
              <div className="hanko-content">
                <span className="hanko-label-en">{loading ? '...' : (isSignUp ? 'create' : 'enter')}</span>
                <span className="hanko-label-jp">{isSignUp ? '創る' : '入る'}</span>
              </div>
            </HankoButton>
          </div>
        </form>

        {message && <div className="auth-message ui-text">{message}</div>}

        <div className="auth-toggle ui-text">
          <span onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'already a pilgrim? enter' : 'new to the garden? begin'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;

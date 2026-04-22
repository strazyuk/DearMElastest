import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import Auth from './pages/Auth';
import Garden from './pages/Garden';
import EmptyRoom from './pages/EmptyRoom';
import Landing from './pages/Landing';
import './index.css';

const ProtectedRoute = ({ children, session }) => {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="garden-loading">
        <div className="enso"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="zen-app-wrapper">
        <Routes>
          <Route path="/" element={!session ? <Landing /> : <Navigate to="/garden" />} />
          <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/garden" />} />
          
          <Route 
            path="/garden" 
            element={
              <ProtectedRoute session={session}>
                <Garden />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/compose" 
            element={
              <ProtectedRoute session={session}>
                <EmptyRoom />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<div className="empty-room editorial">The wind has moved it. (404)</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

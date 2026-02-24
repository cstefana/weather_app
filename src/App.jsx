import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Landing from './Landing/Landing.jsx';
import Login from './Login/Login.jsx';
import Weather from './Weather/Weather.jsx';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowLogin(false);
        navigate('/app', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  if (session === undefined) return null;

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={session ? <Navigate to="/app" replace /> : <Landing />}
        />
        <Route
          path="/login"
          element={session ? <Navigate to="/app" replace /> : <Login />}
        />
        <Route
          path="/app"
          element={
            <Weather
              userId={session?.user?.id ?? null}
              onSignOut={session ? handleSignOut : null}
              onSignIn={!session ? () => setShowLogin(true) : null}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
}

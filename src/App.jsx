import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login/Login.jsx';
import Weather from './Weather/Weather.jsx';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowLogin(false); // auto-close overlay on successful login
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (session === undefined) return null;

  return (
    <>
      <Weather
        userId={session?.user?.id ?? null}
        onSignOut={session ? handleSignOut : null}
        onSignIn={!session ? () => setShowLogin(true) : null}
      />
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
}

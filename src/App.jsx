import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from './supabaseClient';
import { setSession, selectSession, selectIsLoading } from './store/authSlice';
import { setShowLogin, selectShowLogin } from './store/uiSlice';
import Landing from './Landing/Landing.jsx';
import Login from './Login/Login.jsx';
import Weather from './Weather/Weather.jsx';

export default function App() {
  const dispatch   = useDispatch();
  const session    = useSelector(selectSession);
  const isLoading  = useSelector(selectIsLoading);
  const showLogin  = useSelector(selectShowLogin);
  const navigate   = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session));
      if (session) {
        dispatch(setShowLogin(false));
        navigate('/app', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  if (isLoading) return null;

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
              onSignIn={!session ? () => dispatch(setShowLogin(true)) : null}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showLogin && <Login onClose={() => dispatch(setShowLogin(false))} />}
    </>
  );
}


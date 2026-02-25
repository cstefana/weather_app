import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from './supabaseClient';
import { setSession, setRole, selectSession, selectIsLoading, selectUserRole } from './store/authSlice';
import { setShowLogin, selectShowLogin } from './store/uiSlice';
import Landing from './Landing/Landing.jsx';
import Login from './Login/Login.jsx';
import Weather from './Weather/Weather.jsx';
import Contact from './Contact/Contact.jsx';
import Dashboard from './Dashboard/Dashboard.jsx';

export default function App() {
  const dispatch   = useDispatch();
  const session    = useSelector(selectSession);
  const isLoading  = useSelector(selectIsLoading);
  const showLogin  = useSelector(selectShowLogin);
  const userRole   = useSelector(selectUserRole);
  const navigate   = useNavigate();

  useEffect(() => {
    const fetchRole = async (userId) => {
      if (!userId) {
        dispatch(setRole(null));
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        console.log('Fetched user role:', data.role);
        dispatch(setRole(data.role));
      } else {
        console.log('Failed to fetch user role or no role found:', error);
        dispatch(setRole(null));
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
      if (session?.user?.id) {
        fetchRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      dispatch(setSession(session));
      if (session) {
        fetchRole(session.user.id);
        dispatch(setShowLogin(false));
        if (window.location.pathname === '/' || window.location.pathname === '/login') {
          navigate('/app', { replace: true });
        }
      } else {
        dispatch(setRole(null));
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
        <Route
          path="/dashboard"
          element={
            session && userRole === 'admin' ? (
              <Dashboard />
            ) : session && userRole === undefined ? (
              <div>Loading...</div>
            ) : (
              <Navigate to="/app" replace />
            )
          }
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showLogin && <Login onClose={() => dispatch(setShowLogin(false))} />}
    </>
  );
}


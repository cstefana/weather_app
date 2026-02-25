import {useState} from 'react';
import {supabase} from '../supabaseClient';
import './Login.css';

export default function Login({ onClose }) {
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const switchMode = (next) => {
        setMode(next);
        setError('');
        setSuccess('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const {error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        }

        setLoading(false);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError('');

        const {data, error} = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            // if data.user exists but session is null, they need to confirm email
            if (data.user && !data.session) {
                setSuccess(
                    'Account created! Please check your email for a confirmation link.',
                );
            } else {
                setSuccess('Account created and logged in!');
            }
        }
        setLoading(false);
    };

    return (
        <div className={`login-page${onClose ? ' login-page--overlay' : ''}`}>
            <div className='login-card'>
                {onClose && (
                    <button className='login-close-btn' onClick={onClose} title='Close'>
                        ✕
                    </button>
                )}
                <div className='login-header'>
                    <div className='weather-icon'>🌦</div>
                    <h1>RainCheck</h1>
                    <p>
                        {mode === 'login'
                            ? 'The only app that encourages you to cancel plans.'
                            : 'Create your free account'}
                    </p>
                </div>

                {error && <p className='login-error'>{error}</p>}
                {success && <p className='login-success'>{success}</p>}

                <form
                    className='login-form'
                    onSubmit={mode === 'login' ? handleLogin : handleSignup}
                >
                    <div className='input-group'>
                        <label htmlFor='email'>Email</label>
                        <input
                            id='email'
                            type='email'
                            placeholder='you@example.com'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='input-group'>
                        <label htmlFor='password'>Password</label>
                        <input
                            id='password'
                            type='password'
                            placeholder='••••••••'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {mode === 'signup' && (
                        <div className='input-group'>
                            <label htmlFor='confirmPassword'>
                                Confirm Password
                            </label>
                            <input
                                id='confirmPassword'
                                type='password'
                                placeholder='••••••••'
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                        </div>
                    )}
                    <button
                        className='login-btn'
                        type='submit'
                        disabled={loading}
                    >
                        {loading
                            ? mode === 'login'
                                ? 'Signing in…'
                                : 'Creating account…'
                            : mode === 'login'
                              ? 'Sign In'
                              : 'Create Account'}
                    </button>
                    <button
                        type='button'
                        className='login-btn-secondary'
                        onClick={() =>
                            switchMode(mode === 'login' ? 'signup' : 'login')
                        }
                    >
                        {mode === 'login'
                            ? 'Create a new account'
                            : 'Already have an account? Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}

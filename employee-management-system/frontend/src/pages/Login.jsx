import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import { login, parseError } from '../services/employeeService.js';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (sessionStorage.getItem('emsCredentials')) return <Navigate to="/employees" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(username, password);
      navigate('/employees', { replace: true });
    } catch (cause) {
      setError(parseError(cause).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <form className="card login-card" onSubmit={submit}>
        <p className="brand login-brand">EMS</p>
        <h1>Administrator sign in</h1>
        <p className="muted">Sign in to manage employee records.</p>
        <Alert>{error}</Alert>
        <label className="field">
          <span>Username</span>
          <input autoComplete="username" value={username}
            onChange={(event) => setUsername(event.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <span className="password-input">
            <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password}
              onChange={(event) => setPassword(event.target.value)} required />
            <button
              type="button"
              className="password-visibility"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
                  <path d="M9.9 5.2A10.9 10.9 0 0112 5c5 0 9 4 10 7-.4 1.3-1.4 2.7-2.8 3.9M6.2 6.2C3.9 7.5 2.5 9.5 2 12c1 3 5 7 10 7 1 0 2-.2 2.9-.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </span>
        </label>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

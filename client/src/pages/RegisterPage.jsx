import { useState } from 'react';
import { ErrorMessage } from '../components/ErrorMessage';

export function RegisterPage({ onRegister, onNavigateToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await onRegister(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#0F172A',
    background: '#FAFAFA',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dde8ff 0%, #e8eeff 50%, #dde8ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif"
    }}>
      {/* Logo & Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ marginBottom: '12px' }}>
          <svg width="52" height="52" viewBox="0 0 56 56" fill="none">
            <rect x="4" y="8" width="32" height="24" rx="6" fill="#3B82F6"/>
            <path d="M10 20h20M10 27h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <rect x="18" y="20" width="28" height="20" rx="5" fill="#1D4ED8"/>
            <path d="M24 30h16M24 36h10" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          color: '#0F172A',
          margin: '0 0 8px 0',
          letterSpacing: '-0.5px'
        }}>SecureChat</h1>
        <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
          End-to-end encrypted messaging
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 8px 40px rgba(37, 99, 235, 0.12)',
        padding: '36px',
        width: '100%',
        maxWidth: '440px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#0F172A',
          margin: '0 0 24px 0'
        }}>Create Account</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={loading}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3B82F6'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '6px 0 0 0' }}>At least 3 characters</p>
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              disabled={loading}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3B82F6'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '6px 0 0 0' }}>At least 8 characters</p>
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={loading}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3B82F6'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#93C5FD' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginTop: '4px'
            }}
            onMouseEnter={e => !loading && (e.target.style.background = '#1D4ED8')}
            onMouseLeave={e => !loading && (e.target.style.background = '#2563EB')}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: '#64748B', fontSize: '14px' }}>
            Already have an account?{' '}
          </span>
          <button
            onClick={onNavigateToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563EB',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              padding: 0
            }}
          >
            Login
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#64748B',
        fontSize: '13px'
      }}>
        <span>🔒</span>
        <span>Secured with AES-256 encryption</span>
      </div>
    </div>
  );
}
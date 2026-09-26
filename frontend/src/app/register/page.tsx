'use client';

import { useState } from 'react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (res.ok) {
        window.location.href = '/login';
      } else {
        const text = await res.text();
        setError(text || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <h2 className="heading-gradient" style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>Join Deriva</h2>
        <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '32px' }}>Start learning options trading today</p>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#d1d5db' }}>Username</label>
            <input 
              type="text" 
              className="input-modern" 
              placeholder="trader123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#d1d5db' }}>Email Address</label>
            <input 
              type="email" 
              className="input-modern" 
              placeholder="trader@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#d1d5db' }}>Password</label>
            <input 
              type="password" 
              className="input-modern" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
            Create Account
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}

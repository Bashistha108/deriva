'use client';

import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login API call
    console.log("Logging in with", email);
    window.location.href = '/dashboard';
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <h2 className="heading-gradient" style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '32px' }}>Sign in to continue your trading journey</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            Sign In
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
          Don't have an account? <a href="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register here</a>
        </div>
      </div>
    </div>
  );
}

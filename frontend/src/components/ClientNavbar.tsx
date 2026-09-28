'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientNavbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          setIsAuthenticated(true);
          const user = await res.json();
          const isAdminUser = user.authorities && user.authorities.some((auth: any) => auth.authority === 'ROLE_ADMIN');
          setIsAdmin(isAdminUser);
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed');
    }
  };

  return (
    <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Left side: Logo + Navigation Links */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="/" className="heading-gradient" style={{ fontSize: '24px', textDecoration: 'none' }}>Deriva</a>
          
          {isAuthenticated && (
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <a href="/dashboard" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</a>
              <a href="/portfolio" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 500 }}>Portfolio</a>
              <a href="/chain" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 500 }}>Options Chain</a>
              <a href="/learning" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 500 }}>Learning</a>
              {isAdmin && (
                <a href="/admin" style={{ color: 'var(--warning)', textDecoration: 'none', fontWeight: 500 }}>Admin Console</a>
              )}
            </div>
          )}
        </div>

        {/* Right side: Authentication */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {!isAuthenticated ? (
            <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Login</a>
          ) : (
            <button 
              onClick={handleLogout} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--danger)', 
                fontWeight: 600, 
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

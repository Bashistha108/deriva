'use client';

import { useEffect, useState } from 'react';
import PositionTable from '@/components/PositionTable';

export default function Portfolio() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cashBalance, setCashBalance] = useState<number | null>(null);
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          setIsAuthenticated(true);
          fetchCashBalance();
          fetchPositions();
        } else {
          window.location.href = '/login';
        }
      } catch (err) {
        window.location.href = '/login';
      }
    };

    const fetchCashBalance = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/portfolio/cash`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setCashBalance(data.balance);
        }
      } catch (err) {}
    };

    const fetchPositions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/portfolio/positions`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setPositions(data);
        }
      } catch (err) {}
    };

    checkAuth();
  }, []);

  if (!isAuthenticated) return null;

  // Calculate portfolio metrics
  let totalCostBasis = 0;
  let totalRealizedPnl = 0;
  positions.forEach(p => {
      const multiplier = p.type === 'OPTION' ? (p.contractMultiplier || 100) : (p.contractMultiplier || 1);
      totalCostBasis += (p.averageEntryPrice || 0) * Math.abs(p.quantity) * multiplier;
      totalRealizedPnl += (p.realizedPnl || 0);
  });

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 className="heading-gradient" style={{ fontSize: '36px', marginBottom: '32px' }}>Your Portfolio</h1>
      
      <div className="glass" style={{ borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Net Liquidation (Cash)</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>
            {cashBalance !== null ? `$${cashBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '...'}
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Total Cost Basis</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>
            ${totalCostBasis.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Realized P&L</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: totalRealizedPnl > 0 ? 'var(--success)' : totalRealizedPnl < 0 ? 'var(--danger)' : 'var(--foreground)' }}>
            {totalRealizedPnl > 0 ? '+' : ''}${totalRealizedPnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Portfolio Delta</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>0.00</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Portfolio Gamma</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>0.00</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Portfolio Theta</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>0.00</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Portfolio Vega</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>0.00</div>
        </div>
      </div>

      <h2 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 600 }}>Active Positions</h2>
      
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <PositionTable positions={positions} />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import PositionTable from '@/components/PositionTable';

export default function Portfolio() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cashBalance, setCashBalance] = useState<number | null>(null);
  const [positions, setPositions] = useState<any[]>([]);

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

    checkAuth();

    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchCashBalance();
        fetchPositions();
      }
    }, 5000); // poll every 5s

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  // Calculate portfolio metrics
  let totalCostBasis = 0;
  let totalRealizedPnl = 0;
  let totalUnrealizedPnl = 0;
  let portDelta = 0;
  let portGamma = 0;
  let portTheta = 0;
  let portVega = 0;

  positions.forEach(p => {
      const multiplier = p.type === 'OPTION' ? (p.contractMultiplier || 100) : (p.contractMultiplier || 1);
      const cost = (p.averageEntryPrice || 0) * p.quantity * multiplier;
      totalCostBasis += cost; // For net liquidation logic
      totalRealizedPnl += (p.realizedPnl || 0);
      totalUnrealizedPnl += (p.unrealizedPnl || 0);
      portDelta += (p.delta || 0) * p.quantity * multiplier;
      portGamma += (p.gamma || 0) * p.quantity * multiplier;
      portTheta += (p.theta || 0) * p.quantity * multiplier;
      portVega += (p.vega || 0) * p.quantity * multiplier;
  });

  const totalPnl = totalRealizedPnl + totalUnrealizedPnl;
  const portfolioValue = totalCostBasis + totalUnrealizedPnl;
  const netLiquidation = (cashBalance || 0) + portfolioValue;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 className="heading-gradient" style={{ fontSize: '36px', marginBottom: '32px' }}>Your Portfolio</h1>
      
      <div className="glass" style={{ borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Net Liquidation</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>
            ${netLiquidation.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Cash Balance</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>
            {cashBalance !== null ? `$${cashBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '...'}
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Total P&L (Real+Unreal)</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: totalPnl > 0 ? 'var(--success)' : totalPnl < 0 ? 'var(--danger)' : 'var(--foreground)' }}>
            {totalPnl > 0 ? '+' : ''}${totalPnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Total Cost Basis</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>
            {totalCostBasis < 0 ? '-' : ''}${Math.abs(totalCostBasis).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Portfolio Delta</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>{portDelta.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Portfolio Gamma</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>{portGamma.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Portfolio Theta</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>{portTheta.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Portfolio Vega</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>{portVega.toFixed(2)}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 600 }}>Active Positions</h2>
      
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <PositionTable positions={positions} />
      </div>
    </div>
  );
}

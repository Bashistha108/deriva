'use client';

import { useEffect, useState, useRef } from 'react';
import PositionTable from '@/components/PositionTable';

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cashBalance, setCashBalance] = useState<number | null>(null);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [newBalanceInput, setNewBalanceInput] = useState('');

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

  const handleUpdateBalance = async () => {
    if (!newBalanceInput || isNaN(Number(newBalanceInput))) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/portfolio/cash/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: Number(newBalanceInput) })
      });
      if (res.ok) {
        setCashBalance(Number(newBalanceInput));
        setIsEditingBalance(false);
        setNewBalanceInput('');
      }
    } catch (err) {}
  };

  if (!isAuthenticated) return null; // or loading

  // Calculate portfolio metrics
  let totalCostBasis = 0;
  let totalRealizedPnl = 0;
  positions.forEach(p => {
      const multiplier = p.type === 'OPTION' ? (p.contractMultiplier || 100) : (p.contractMultiplier || 1);
      totalCostBasis += (p.averageEntryPrice || 0) * Math.abs(p.quantity) * multiplier;
      totalRealizedPnl += (p.realizedPnl || 0);
  });

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '1400px' }}>
      <h1 className="serif-heading" style={{ fontSize: '32px', marginBottom: '32px' }}>
        Portfolio Dashboard
      </h1>
      
      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-header" style={{ margin: 0 }}>Cash Balance</div>
            {isEditingBalance ? (
               <div style={{ display: 'flex', gap: '4px' }}>
                 <button onClick={handleUpdateBalance} style={{ background: 'var(--success)', border: 'none', borderRadius: '4px', padding: '2px 8px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                 <button onClick={() => setIsEditingBalance(false)} style={{ background: '#333', border: 'none', borderRadius: '4px', padding: '2px 8px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
               </div>
            ) : (
               <button onClick={() => { setIsEditingBalance(true); setNewBalanceInput(cashBalance?.toString() || '0'); }} style={{ background: 'transparent', border: '1px solid #333', borderRadius: '4px', padding: '2px 8px', color: '#888', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
            )}
          </div>
          {isEditingBalance ? (
             <input type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} style={{ marginTop: '16px', background: '#141414', border: '1px solid #333', color: '#fff', padding: '4px 8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} autoFocus />
          ) : (
             <div className="card-value" style={{ marginTop: '16px' }}>{cashBalance !== null ? `$${cashBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '...'}</div>
          )}
          <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>Paper Trading Funds</div>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-header" style={{ margin: 0 }}>Realized P/L</div>
            <div style={{ color: 'var(--foreground)', fontSize: '14px' }}>-</div>
          </div>
          <div className="card-value" style={{ color: totalRealizedPnl > 0 ? 'var(--success)' : totalRealizedPnl < 0 ? 'var(--danger)' : 'var(--foreground)', marginTop: '16px' }}>
            {totalRealizedPnl > 0 ? '+' : ''}${totalRealizedPnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-header" style={{ margin: 0 }}>Buying Power</div>
            <div style={{ color: '#888', fontSize: '14px' }}>~</div>
          </div>
          <div className="card-value" style={{ marginTop: '16px' }}>$0.00</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-header" style={{ margin: 0 }}>Margin Usage</div>
            <div style={{ color: '#888', fontSize: '14px' }}>❖</div>
          </div>
          <div className="card-value" style={{ marginTop: '16px' }}>$0.00</div>
        </div>
      </div>

      {/* Middle Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">P/L Chart</div>
          <div style={{ flex: 1, border: '1px dashed var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', background: '#141414' }}>
            ↗ [P/L Chart Visualization Area]
          </div>
        </div>
        <div className="card">
          <div className="card-header" style={{ marginBottom: '24px' }}>Portfolio Greeks</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#141414', padding: '16px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Delta (Δ)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>0.0</div>
            </div>
            <div style={{ background: '#141414', padding: '16px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Gamma (Γ)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>0.0</div>
            </div>
            <div style={{ background: '#141414', padding: '16px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Theta (Θ)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>0.0</div>
            </div>
            <div style={{ background: '#141414', padding: '16px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Vega (ν)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>0.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header" style={{ marginBottom: '16px' }}>Live Watchlist</div>
          <LiveWatchlist />
        </div>
        
        <div className="card">
          <div className="card-header" style={{ marginBottom: '16px' }}>Activity</div>
          <div style={{ fontSize: '12px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ opacity: 0.7 }}>💼</span> Positions
          </div>
          <div style={{ marginBottom: '32px' }}>
            <PositionTable positions={positions} />
          </div>

          <div style={{ fontSize: '12px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ opacity: 0.7 }}>⚯</span> Recent Trades
          </div>
          <table style={{ width: '100%', fontSize: '13px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#888', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Symbol</th>
                <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Side</th>
                <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Price</th>
                <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={{ padding: '16px 0', color: '#888', textAlign: 'center' }}>No recent trades</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LiveWatchlist() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const prevPrices = useRef<Record<string, number>>({});
  const flashTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/market-data/current`);
        if (res.ok) {
          const data = await res.json();
          
          setPrices(prev => {
            const newFlashes: Record<string, 'up' | 'down'> = {};
            let hasChanges = false;

            Object.entries(data).forEach(([symbol, newPriceObj]) => {
              const newPrice = Number(newPriceObj);
              const oldPrice = prevPrices.current[symbol];
              
              if (oldPrice !== undefined && oldPrice !== newPrice) {
                hasChanges = true;
                const direction = newPrice > oldPrice ? 'up' : 'down';
                newFlashes[symbol] = direction;
                
                if (flashTimeouts.current[symbol]) clearTimeout(flashTimeouts.current[symbol]);
                flashTimeouts.current[symbol] = setTimeout(() => {
                  setFlashes(curr => {
                    const updated = { ...curr };
                    delete updated[symbol];
                    return updated;
                  });
                }, 500);
              }
              prevPrices.current[symbol] = newPrice;
            });

            if (hasChanges) {
              setFlashes(curr => ({ ...curr, ...newFlashes }));
            }
            return data as Record<string, number>;
          });
        }
      } catch (err) {}
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 1000); 
    return () => {
      clearInterval(interval);
      Object.values(flashTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  if (Object.keys(prices).length === 0) return <div style={{color: '#9ca3af', fontSize: '13px'}}>Awaiting market open...</div>;

  return (
    <table style={{ width: '100%', fontSize: '13px', textAlign: 'left', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ color: '#888', borderBottom: '1px solid var(--border)' }}>
          <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Symbol</th>
          <th style={{ padding: '12px 0', fontWeight: 'normal' }}>Price</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(prices).slice(0, 10).map(([symbol, price]) => {
          const flash = flashes[symbol];
          let bgColor = 'transparent';
          let color = '#fff';
          if (flash === 'up') {
            bgColor = 'rgba(34, 197, 94, 0.2)';
            color = 'var(--success)';
          } else if (flash === 'down') {
            bgColor = 'rgba(239, 68, 68, 0.2)';
            color = 'var(--danger)';
          }

          return (
            <tr key={symbol} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: bgColor, transition: 'background 0.3s' }}>
              <td style={{ padding: '12px 8px', color: '#fff' }}>{symbol}</td>
              <td style={{ padding: '12px 8px', color: color }}>${Number(price).toFixed(2)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

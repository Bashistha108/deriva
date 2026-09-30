'use client';

import { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [closedPositions, setClosedPositions] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          setIsAuthenticated(true);
          fetchClosedPositions();
        } else {
          window.location.href = '/login';
        }
      } catch (err) {
        window.location.href = '/login';
      }
    };

    const fetchClosedPositions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/portfolio/closed-positions`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setClosedPositions(data);
        }
      } catch (err) {}
    };

    checkAuth();
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '1400px' }}>
      <h1 className="serif-heading" style={{ fontSize: '32px', marginBottom: '32px' }}>
        Trading History
      </h1>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>Closed Positions</div>
        
        {closedPositions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
            No closed positions yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', color: '#9ca3af' }}>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>Symbol</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>Avg Open</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'right' }}>Realized P/L</th>
                </tr>
              </thead>
              <tbody>
                {closedPositions.map((pos) => {
                  const isProfit = pos.realizedPnl > 0;
                  const isLoss = pos.realizedPnl < 0;
                  
                  return (
                    <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="row-hover">
                      <td style={{ padding: '16px 12px', fontWeight: 600, color: '#e5e7eb' }}>
                        {pos.type === 'OPTION' 
                          ? `${pos.symbol} ${new Date(pos.expirationDate).toLocaleDateString()} $${pos.strikePrice} ${pos.optionType}`
                          : pos.symbol}
                      </td>
                      <td style={{ padding: '16px 12px', color: '#9ca3af' }}>{pos.type}</td>
                      <td style={{ padding: '16px 12px', fontFamily: 'monospace' }}>
                        ${pos.averageEntryPrice ? pos.averageEntryPrice.toFixed(2) : '0.00'}
                      </td>
                      <td style={{ 
                        padding: '16px 12px', 
                        fontFamily: 'monospace', 
                        fontWeight: 600,
                        textAlign: 'right',
                        color: isProfit ? 'var(--success)' : (isLoss ? 'var(--danger)' : 'var(--foreground)') 
                      }}>
                        {isProfit ? '+' : ''}${pos.realizedPnl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .row-hover:hover { background: rgba(255,255,255,0.05); }
      `}} />
    </div>
  );
}

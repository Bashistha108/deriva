'use client';

const mockPositions: any[] = [];

export default function Portfolio() {
  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 className="heading-gradient" style={{ fontSize: '36px', marginBottom: '32px' }}>Your Portfolio</h1>
      
      <div className="glass" style={{ borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'flex', gap: '48px' }}>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Net Liquidation</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>$0.00</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Day P&L</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>$0.00</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Portfolio Delta</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>0.00</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Portfolio Theta</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>0.00</div>
        </div>
      </div>

      <h2 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 600 }}>Active Positions</h2>
      
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border)', fontSize: '14px', color: '#9ca3af' }}>
              <th style={{ padding: '16px' }}>Position</th>
              <th style={{ padding: '16px' }}>Qty</th>
              <th style={{ padding: '16px' }}>Avg Price</th>
              <th style={{ padding: '16px' }}>Mark</th>
              <th style={{ padding: '16px' }}>P&L</th>
              <th style={{ padding: '16px' }}>Delta</th>
              <th style={{ padding: '16px' }}>Theta</th>
              <th style={{ padding: '16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockPositions.map((pos) => {
              const pnlColor = pos.pnl >= 0 ? 'var(--success)' : 'var(--danger)';
              const isLong = pos.side === 'Long';
              const sideColor = isLong ? 'var(--success)' : 'var(--danger)';
              
              return (
                <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600 }}>{pos.instrument} {pos.strike} {pos.type}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Exp: {pos.expiration}</div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>
                    <span style={{ color: sideColor }}>{isLong ? '+' : '-'}{pos.qty}</span>
                  </td>
                  <td style={{ padding: '16px' }}>${pos.avgPrice.toFixed(2)}</td>
                  <td style={{ padding: '16px' }}>${pos.currentPrice.toFixed(2)}</td>
                  <td style={{ padding: '16px', fontWeight: 600, color: pnlColor }}>
                    {pos.pnl > 0 ? '+' : ''}${pos.pnl.toFixed(2)} ({pos.pnlPct}%)
                  </td>
                  <td style={{ padding: '16px' }}>{pos.delta}</td>
                  <td style={{ padding: '16px' }}>{pos.theta}</td>
                  <td style={{ padding: '16px' }}>
                    <button style={{ 
                      padding: '6px 12px', 
                      background: 'rgba(255,255,255,0.1)', 
                      border: 'none', 
                      borderRadius: '4px',
                      color: 'white',
                      cursor: 'pointer'
                    }}>
                      Close
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

const mockExpirations = ["2026-10-16", "2026-10-23", "2026-11-20"];
const mockStrikes = [
  { strike: 410, callBid: 12.50, callAsk: 12.70, putBid: 1.10, putAsk: 1.15, callIV: "24.5%", putIV: "25.1%", callVol: 1420, putVol: 340 },
  { strike: 415, callBid: 9.20, callAsk: 9.40, putBid: 2.30, putAsk: 2.35, callIV: "23.2%", putIV: "23.8%", callVol: 2100, putVol: 890 },
  { strike: 420, callBid: 6.40, callAsk: 6.55, putBid: 4.50, putAsk: 4.60, callIV: "22.1%", putIV: "22.5%", callVol: 5600, putVol: 4100 },
  { strike: 425, callBid: 4.10, callAsk: 4.25, putBid: 7.20, putAsk: 7.40, callIV: "21.8%", putIV: "21.9%", callVol: 3200, putVol: 1200 },
  { strike: 430, callBid: 2.50, callAsk: 2.65, putBid: 10.60, putAsk: 10.85, callIV: "21.5%", putIV: "21.2%", callVol: 1800, putVol: 450 },
];

export default function OptionsChain() {
  const [selectedExp, setSelectedExp] = useState(mockExpirations[0]);
  
  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-gradient" style={{ fontSize: '36px', marginBottom: '8px' }}>SPY Options Chain</h1>
          <div style={{ color: '#d1d5db', fontSize: '18px' }}>Current Price: <span style={{ color: 'var(--success)', fontWeight: 600 }}>$421.45</span></div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {mockExpirations.map(exp => (
            <button 
              key={exp}
              onClick={() => setSelectedExp(exp)}
              style={{
                padding: '8px 16px',
                background: selectedExp === exp ? 'var(--primary)' : 'var(--surface)',
                color: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: selectedExp === exp ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>
      
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border)' }}>
              <th colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#60a5fa', fontWeight: 600 }}>CALLS</th>
              <th style={{ padding: '16px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', width: '100px' }}>STRIKE</th>
              <th colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#a78bfa', fontWeight: 600 }}>PUTS</th>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '12px', color: '#9ca3af' }}>
              <th style={{ padding: '12px 16px' }}>Vol</th>
              <th style={{ padding: '12px 16px' }}>IV</th>
              <th style={{ padding: '12px 16px' }}>Bid</th>
              <th style={{ padding: '12px 16px' }}>Ask</th>
              <th style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)' }}></th>
              <th style={{ padding: '12px 16px' }}>Bid</th>
              <th style={{ padding: '12px 16px' }}>Ask</th>
              <th style={{ padding: '12px 16px' }}>IV</th>
              <th style={{ padding: '12px 16px' }}>Vol</th>
            </tr>
          </thead>
          <tbody>
            {mockStrikes.map((row) => {
              const isITMCall = row.strike < 421.45;
              const isITMPut = row.strike > 421.45;
              
              return (
                <tr key={row.strike} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'pointer' }} className="row-hover">
                  <td style={{ padding: '12px 16px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>{row.callVol}</td>
                  <td style={{ padding: '12px 16px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.callIV}</td>
                  <td style={{ padding: '12px 16px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', fontWeight: 500, color: 'var(--danger)' }}>{row.callBid.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', fontWeight: 500, color: 'var(--success)' }}>{row.callAsk.toFixed(2)}</td>
                  
                  <td style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)', textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>{row.strike}</td>
                  
                  <td style={{ padding: '12px 16px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', fontWeight: 500, color: 'var(--danger)' }}>{row.putBid.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', fontWeight: 500, color: 'var(--success)' }}>{row.putAsk.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.putIV}</td>
                  <td style={{ padding: '12px 16px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent' }}>{row.putVol}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <style dangerouslySetInnerHTML={{__html: `
          .row-hover:hover { background: rgba(255,255,255,0.02) !important; }
        `}} />
      </div>
    </div>
  );
}

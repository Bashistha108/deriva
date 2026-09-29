'use client';

import { useState, useEffect, useRef } from 'react';

export default function OptionsChain() {
  const [mounted, setMounted] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [selectedSymbol, setSelectedSymbol] = useState<string>("SPY");
  
  // Selected option leg for the right panel
  const [selectedLegs, setSelectedLegs] = useState<any[]>([]);
  const [isProfileCollapsed, setIsProfileCollapsed] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [chainData, setChainData] = useState<Record<string, any[]>>({});
  const [selectedExp, setSelectedExp] = useState<string>('');
  
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const prevPrices = useRef<Record<string, number>>({});
  const flashTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Fetch prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/market-data/current`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          
          setPrices(prev => {
            const newFlashes: Record<string, 'up' | 'down'> = {};
            let hasChanges = false;
            let firstSymbol = Object.keys(data)[0];

            if (Object.keys(prev).length === 0 && firstSymbol && !data[selectedSymbol]) {
               setSelectedSymbol(firstSymbol);
            }

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
            return data;
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

  // Fetch options chain from backend
  useEffect(() => {
    const fetchChain = async () => {
      if (!selectedSymbol) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/market-data/options/${selectedSymbol}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setChainData(data);
          
          const dates = Object.keys(data).sort();
          if (dates.length > 0 && (!selectedExp || !dates.includes(selectedExp))) {
            setSelectedExp(dates[0]);
          }
        }
      } catch (err) {}
    };
    fetchChain();
    const interval = setInterval(fetchChain, 2000); // refresh chain pricing every 2s
    return () => clearInterval(interval);
  }, [selectedSymbol, selectedExp]);

  const currentPrice = prices[selectedSymbol] || 420.00;

  const handleLegClick = (strike: number, type: 'Call'|'Put', price: number, side: 'Buy'|'Sell') => {
    setSelectedLegs(prev => {
      const existingIndex = prev.findIndex(l => l.strike === strike && l.type === type && l.side === side);
      if (existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex); // Deselect if already selected
      }
      return [...prev, { strike, type, price, side, symbol: selectedSymbol }];
    });
  };
  
  const isLegSelected = (strike: number, type: 'Call'|'Put', side: 'Buy'|'Sell') => {
    return selectedLegs.some(l => l.strike === strike && l.type === type && l.side === side);
  };
  
  const availableExps = Object.keys(chainData).sort();
  const strikes = chainData[selectedExp] || [];

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
      {/* LEFT SIDEBAR: WATCHLIST */}
      <div className="watchlist-panel" style={{ borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', overflowY: 'auto' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
          <h3 className="watchlist-title" style={{ margin: 0, fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Watchlist</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {Object.entries(prices).map(([symbol, price]) => {
            const flash = flashes[symbol];
            let bgColor = selectedSymbol === symbol ? 'rgba(59, 130, 246, 0.15)' : 'transparent';
            let color = 'var(--success)';
            
            if (flash === 'up') {
              bgColor = 'rgba(34, 197, 94, 0.3)';
            } else if (flash === 'down') {
              bgColor = 'rgba(239, 68, 68, 0.3)';
              color = 'var(--danger)';
            }

            return (
              <div 
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: bgColor,
                  borderLeft: selectedSymbol === symbol ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'background 0.3s'
                }}
                className="row-hover"
              >
                <span style={{ fontWeight: 600, color: '#e5e7eb' }}>{symbol}</span>
                <span className="watchlist-price" style={{ color: color, fontWeight: 500, fontFamily: 'monospace', fontSize: '14px' }}>${Number(price).toFixed(2)}</span>
              </div>
            );
          })}
          {Object.keys(prices).length === 0 && (
             <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Awaiting market data...</div>
          )}
        </div>
      </div>

      {/* CENTER: OPTIONS CHAIN */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '24px', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {selectedSymbol} Options
              <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '12px', fontWeight: 600 }}>LIVE</span>
            </h1>
            <div style={{ color: '#d1d5db', fontSize: '16px' }}>Current Price: <span style={{ color: 'var(--success)', fontWeight: 600 }}>${currentPrice.toFixed(2)}</span></div>
          </div>
          
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', width: '100%' }}>
            {availableExps.map(exp => (
              <button 
                key={exp}
                onClick={() => setSelectedExp(exp)}
                style={{
                  padding: '6px 12px',
                  background: selectedExp === exp ? 'var(--primary)' : 'transparent',
                  color: selectedExp === exp ? 'white' : '#9ca3af',
                  border: '1px solid',
                  borderColor: selectedExp === exp ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  whiteSpace: 'nowrap'
                }}
              >
                {exp}
              </button>
            ))}
            {availableExps.length === 0 && <span style={{color: '#9ca3af', fontSize: '13px', padding: '6px'}}>No Expirations Available</span>}
          </div>
        </div>
        
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflowX: 'auto', overflowY: 'hidden' }}>
          <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--surface)' }}>
                <th colSpan={7} className="serif-heading" style={{ padding: '16px', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>Calls</th>
                <th className="serif-heading" style={{ padding: '16px', width: '100px', borderBottom: '1px solid var(--border)' }}>Strike</th>
                <th colSpan={7} className="serif-heading" style={{ padding: '16px', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>Puts</th>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)', color: '#888', background: 'var(--surface)' }}>
                {/* Calls */}
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Bid</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Ask</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Vol</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>OI</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>IV</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Delta</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal', borderRight: '1px solid var(--border)' }}>Vega</th>
                {/* Strike */}
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}></th>
                {/* Puts */}
                <th style={{ padding: '12px 8px', fontWeight: 'normal', borderLeft: '1px solid var(--border)' }}>Bid</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Ask</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Vol</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>OI</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>IV</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Delta</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Vega</th>
              </tr>
            </thead>
            <tbody>
              {strikes.map((row) => {
                const isITMCall = row.strike < currentPrice;
                const isITMPut = row.strike > currentPrice;
                
                return (
                  <tr key={row.strike} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="row-hover">
                    {/* CALL GREEKS & DATA */}
                    <td 
                      onClick={() => handleLegClick(row.strike, 'Call', row.callBid, 'Sell')}
                      className={`trade-cell ${isLegSelected(row.strike, 'Call', 'Sell') ? 'selected-leg' : ''}`}
                      style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' }}
                    >{row.callBid?.toFixed(2) || '0.00'}</td>
                    
                    <td 
                      onClick={() => handleLegClick(row.strike, 'Call', row.callAsk, 'Buy')}
                      className={`trade-cell ${isLegSelected(row.strike, 'Call', 'Buy') ? 'selected-leg' : ''}`}
                      style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' }}
                    >{row.callAsk?.toFixed(2) || '0.00'}</td>

                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.callVol || 0}</td>
                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.callOI || 0}</td>
                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.callIV || '0%'}</td>
                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#999' }}>{row.callDelta?.toFixed(4) || '0.0000'}</td>
                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#999', borderRight: '1px solid var(--border)' }}>{row.callVega?.toFixed(4) || '0.0000'}</td>
                    
                    {/* STRIKE */}
                    <td style={{ padding: '12px 8px', background: 'var(--surface)', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{row.strike}</td>
                    
                    {/* PUT GREEKS & DATA */}
                    <td 
                      onClick={() => handleLegClick(row.strike, 'Put', row.putBid, 'Sell')}
                      className={`trade-cell ${isLegSelected(row.strike, 'Put', 'Sell') ? 'selected-leg' : ''}`}
                      style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#fff', cursor: 'pointer', fontFamily: 'monospace', borderLeft: '1px solid var(--border)' }}
                    >{row.putBid?.toFixed(2) || '0.00'}</td>
                    
                    <td 
                      onClick={() => handleLegClick(row.strike, 'Put', row.putAsk, 'Buy')}
                      className={`trade-cell ${isLegSelected(row.strike, 'Put', 'Buy') ? 'selected-leg' : ''}`}
                      style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' }}
                    >{row.putAsk?.toFixed(2) || '0.00'}</td>
                    
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.putVol || 0}</td>
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.putOI || 0}</td>
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.putIV || '0%'}</td>
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#999' }}>{row.putDelta?.toFixed(4) || '0.0000'}</td>
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#999' }}>{row.putVega?.toFixed(4) || '0.0000'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT SIDEBAR: PERFORMANCE PROFILE */}
      <div style={{ width: isProfileCollapsed ? '40px' : '320px', borderLeft: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', padding: isProfileCollapsed ? '24px 8px' : '24px', display: 'flex', flexDirection: 'column', zIndex: 5, transition: 'width 0.3s, padding 0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          {!isProfileCollapsed && <h3 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', color: '#d1d5db', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Performance Profile</h3>}
          <button onClick={() => setIsProfileCollapsed(!isProfileCollapsed)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: isProfileCollapsed ? '100%' : 'auto' }}>
            {isProfileCollapsed ? '◀' : '▶'}
          </button>
        </div>
        
        {!isProfileCollapsed && (
          selectedLegs.length > 0 ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {selectedLegs.map((leg, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '12px', padding: '2px 6px', borderRadius: '4px', background: leg.side === 'Buy' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: leg.side === 'Buy' ? 'var(--success)' : 'var(--danger)' }}>{leg.side.toUpperCase()}</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{leg.strike} {leg.type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '13px' }}>
                    <span>{leg.symbol}</span>
                    <span style={{ color: 'var(--foreground)', fontWeight: 600, fontFamily: 'monospace' }}>${leg.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#9ca3af', fontSize: '14px' }}>
                <span>Net Premium</span>
                <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                  {(() => {
                    const net = selectedLegs.reduce((acc, leg) => acc + (leg.price * (leg.side === 'Buy' ? -1 : 1)), 0);
                    return (net > 0 ? 'Credit $' : 'Debit $') + Math.abs(net * 100).toFixed(2);
                  })()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button 
                onClick={() => setSelectedLegs([])}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--foreground)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear
              </button>
              <button className="btn-primary" style={{ flex: 2, padding: '12px', fontSize: '14px', fontWeight: 600, borderRadius: '8px' }}>
                Submit Order
              </button>
            </div>
          </div>
          ) : (
            <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px', fontSize: '14px', padding: '24px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px' }}>
              Select any Bid or Ask price from the options chain to build a multi-leg strategy.
            </div>
          )
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .row-hover:hover { background: rgba(255,255,255,0.05) !important; }
        .trade-cell:hover { background: rgba(59, 130, 246, 0.2) !important; box-shadow: inset 0 0 0 1px var(--primary); }
        .selected-leg { background: rgba(59, 130, 246, 0.3) !important; box-shadow: inset 0 0 0 2px var(--primary) !important; }
        /* Watchlist responsive */
        .watchlist-panel { width: 280px; transition: width 0.3s; }
        @media (max-width: 1024px) {
          .watchlist-panel { width: 80px !important; }
          .watchlist-price { display: none !important; }
          .watchlist-title { display: none !important; }
        }
        /* Custom scrollbar for left panel */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}

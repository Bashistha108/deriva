'use client';

import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

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
  const [strikeSortDirection, setStrikeSortDirection] = useState<'asc' | 'desc'>('asc');
  
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

  const [watchedSymbols, setWatchedSymbols] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const [instRes, watchRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/market-data/instruments`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/watchlists`, { credentials: 'include' })
        ]);
        
        if (instRes.ok && watchRes.ok) {
          const instruments = await instRes.json();
          const watchlists = await watchRes.json();
          
          let activeWatchlist = Array.isArray(watchlists) ? watchlists[0] : null;
          if (activeWatchlist && activeWatchlist.items) {
             const watchedIds = new Set(activeWatchlist.items.map((i: any) => i.instrumentId));
             const watchedSyms = instruments.filter((inst: any) => watchedIds.has(inst.id)).map((inst: any) => inst.symbol);
             setWatchedSymbols(new Set(watchedSyms));
          }
        }
      } catch (e) {
        console.error("Failed to fetch watchlist", e);
      }
    };
    fetchWatchlist();
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

  const handleLegClick = (strike: number, type: 'Call'|'Put', price: number, side: 'Buy'|'Sell', delta: number = 0, gamma: number = 0, theta: number = 0, vega: number = 0) => {
    setSelectedLegs(prev => {
      const existingIndex = prev.findIndex(l => l.strike === strike && l.type === type && l.side === side);
      if (existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex); // Deselect if already selected
      }
      return [...prev, { strike, type, price, side, symbol: selectedSymbol, delta, gamma, theta, vega }];
    });
  };

  const handleSubmitOrder = async () => {
    if (selectedLegs.length === 0) return;
    
    const requests = selectedLegs.map(leg => ({
      symbol: selectedSymbol,
      strike: leg.strike,
      expiration: selectedExp,
      optionType: leg.type.toUpperCase(),
      side: leg.side.toUpperCase(),
      type: 'MARKET',
      quantity: 1,
      limitPrice: null
    }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/trading/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requests)
      });
      
      if (res.ok) {
        alert('Order submitted successfully!');
        setSelectedLegs([]);
      } else {
        alert('Failed to submit order. Please check if you are logged in.');
      }
    } catch (e) {
      console.error('Error submitting order', e);
      alert('Error submitting order.');
    }
  };
  
  const isLegSelected = (strike: number, type: 'Call'|'Put', side: 'Buy'|'Sell') => {
    return selectedLegs.some(l => l.strike === strike && l.type === type && l.side === side);
  };
  
  const availableExps = Object.keys(chainData).sort();
  const strikes = [...(chainData[selectedExp] || [])].sort((a, b) => {
    return strikeSortDirection === 'asc' ? a.strike - b.strike : b.strike - a.strike;
  });

  const detectStrategy = (legs: any[]) => {
    if (legs.length === 1) {
      return legs[0].side === 'Buy' ? `Long ${legs[0].type}` : `Short ${legs[0].type}`;
    }
    
    const sorted = [...legs].sort((a, b) => a.strike - b.strike);
    
    if (legs.length === 2) {
      const [l1, l2] = sorted;
      const isSameType = l1.type === l2.type;
      const q1 = l1.side === 'Buy' ? 1 : -1;
      const q2 = l2.side === 'Buy' ? 1 : -1;
      
      if (isSameType) {
        if (q1 !== q2) {
           if (l1.type === 'Call') {
             if (q1 > 0 && q2 < 0) return "Bull Call Spread";
             if (q1 < 0 && q2 > 0) return "Bear Call Spread";
           } else {
             if (q1 > 0 && q2 < 0) return "Bull Put Spread";
             if (q1 < 0 && q2 > 0) return "Bear Put Spread";
           }
           return "Spread";
        }
      } else {
        if (l1.strike === l2.strike) {
          if (q1 > 0 && q2 > 0) return "Long Straddle";
          if (q1 < 0 && q2 < 0) return "Short Straddle";
        } else {
          if (q1 > 0 && q2 > 0) return "Long Strangle";
          if (q1 < 0 && q2 < 0) return "Short Strangle";
        }
      }
    } else if (legs.length === 4) {
       const puts = sorted.filter(l => l.type === 'Put');
       const calls = sorted.filter(l => l.type === 'Call');
       if (puts.length === 2 && calls.length === 2) {
          const outerLong = (puts[0].side === 'Buy' && calls[1].side === 'Buy' && puts[1].side === 'Sell' && calls[0].side === 'Sell');
          const innerLong = (puts[0].side === 'Sell' && calls[1].side === 'Sell' && puts[1].side === 'Buy' && calls[0].side === 'Buy');
          if (outerLong) return "Short Iron Condor";
          if (innerLong) return "Long Iron Condor";
       }
       return "Iron Condor";
    }
    
    return "Custom Strategy";
  };

  const generatePayoffData = () => {
    if (selectedLegs.length === 0) return [];
    
    const strikesArray = selectedLegs.map(l => l.strike);
    const minStrike = Math.min(...strikesArray, currentPrice);
    const maxStrike = Math.max(...strikesArray, currentPrice);
    
    const range = Math.max(maxStrike - minStrike, currentPrice * 0.15);
    const startPrice = Math.max(0, minStrike - range);
    const endPrice = maxStrike + range;
    
    const data = [];
    const step = (endPrice - startPrice) / 100;
    
    for (let p = startPrice; p <= endPrice; p += step) {
      let profit = 0;
      selectedLegs.forEach(leg => {
        let legPayoff = 0;
        if (leg.type === 'Call') {
          legPayoff = Math.max(0, p - leg.strike);
        } else {
          legPayoff = Math.max(0, leg.strike - p);
        }
        
        const netPremium = leg.price || 0;
        const pnl = legPayoff - netPremium;
        profit += pnl * (leg.side === 'Buy' ? 1 : -1) * 100;
      });
      data.push({ price: p, profit: profit });
    }
    return data;
  };

  const payoffData = generatePayoffData();
  const breakevens: number[] = [];
  if (payoffData.length > 1) {
    for (let i = 1; i < payoffData.length; i++) {
      if ((payoffData[i-1].profit <= 0 && payoffData[i].profit >= 0) || (payoffData[i-1].profit >= 0 && payoffData[i].profit <= 0)) {
         const p1 = payoffData[i-1].price;
         const p2 = payoffData[i].price;
         const y1 = payoffData[i-1].profit;
         const y2 = payoffData[i].profit;
         if (y1 === y2) {
            breakevens.push(p1);
         } else {
            const be = p1 - y1 * (p2 - p1) / (y2 - y1);
            if (breakevens.length === 0 || Math.abs(breakevens[breakevens.length - 1] - be) > 0.01) {
              breakevens.push(be);
            }
         }
      }
    }
  }

  let maxProfitVal = 0;
  let maxLossVal = 0;
  let isMaxProfitInfinite = false;
  let isMaxLossInfinite = false;

  if (payoffData.length > 1) {
    const profitArr = payoffData.map(d => d.profit);
    maxProfitVal = Math.max(...profitArr);
    maxLossVal = Math.min(...profitArr);

    const firstDiff = payoffData[0].profit - payoffData[1].profit;
    const lastDiff = payoffData[payoffData.length - 1].profit - payoffData[payoffData.length - 2].profit;

    if (firstDiff > 1 || lastDiff > 1) isMaxProfitInfinite = true;
    if (firstDiff < -1 || lastDiff < -1) isMaxLossInfinite = true;
  }

  const positionGreeks = selectedLegs.reduce((acc, leg) => {
    const mult = leg.side === 'Buy' ? 1 : -1;
    acc.delta += (leg.delta || 0) * mult;
    acc.gamma += (leg.gamma || 0) * mult;
    acc.theta += (leg.theta || 0) * mult;
    acc.vega += (leg.vega || 0) * mult;
    return acc;
  }, { delta: 0, gamma: 0, theta: 0, vega: 0 });

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
      {/* LEFT SIDEBAR: WATCHLIST */}
      <div className="watchlist-panel" style={{ borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', overflowY: 'auto' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
          <h3 className="watchlist-title" style={{ margin: 0, fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Watchlist</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {Object.entries(prices)
            .filter(([symbol]) => watchedSymbols.has(symbol))
            .map(([symbol, price]) => {
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
                <th colSpan={9} className="serif-heading" style={{ padding: '16px', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>Calls</th>
                <th onClick={() => setStrikeSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')} className="serif-heading" style={{ padding: '16px', width: '100px', borderBottom: '1px solid var(--border)', cursor: 'pointer', userSelect: 'none' }}>
                  Strike {strikeSortDirection === 'asc' ? '▲' : '▼'}
                </th>
                <th colSpan={9} className="serif-heading" style={{ padding: '16px', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>Puts</th>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)', color: '#888', background: 'var(--surface)' }}>
                {/* Calls */}
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Bid</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Ask</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Vol</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>OI</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>IV</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Delta</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Gamma</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Theta</th>
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
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Gamma</th>
                <th style={{ padding: '12px 8px', fontWeight: 'normal' }}>Theta</th>
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
                      onClick={() => handleLegClick(row.strike, 'Call', row.callBid, 'Sell', row.callDelta, row.callGamma, row.callTheta, row.callVega)}
                      className={`trade-cell trade-cell-sell ${isLegSelected(row.strike, 'Call', 'Sell') ? 'selected-leg-sell' : ''}`}
                      style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' }}
                    >{row.callBid?.toFixed(2) || '0.00'}</td>
                    
                    <td 
                      onClick={() => handleLegClick(row.strike, 'Call', row.callAsk, 'Buy', row.callDelta, row.callGamma, row.callTheta, row.callVega)}
                      className={`trade-cell trade-cell-buy ${isLegSelected(row.strike, 'Call', 'Buy') ? 'selected-leg-buy' : ''}`}
                      style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' }}
                    >{row.callAsk?.toFixed(2) || '0.00'}</td>

                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.callVol || 0}</td>
                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.callOI || 0}</td>
                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.callIV || '0%'}</td>
                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#999' }}>{row.callDelta?.toFixed(4) || '0.0000'}</td>
                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#999' }}>{row.callGamma?.toFixed(4) || '0.0000'}</td>
                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#999' }}>{row.callTheta?.toFixed(4) || '0.0000'}</td>
                    <td style={{ padding: '12px 8px', background: isITMCall ? 'rgba(59, 130, 246, 0.05)' : 'transparent', color: '#999', borderRight: '1px solid var(--border)' }}>{row.callVega?.toFixed(4) || '0.0000'}</td>
                    
                    {/* STRIKE */}
                    <td style={{ padding: '12px 8px', background: 'var(--surface)', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{row.strike}</td>
                    
                    {/* PUT GREEKS & DATA */}
                    <td 
                      onClick={() => handleLegClick(row.strike, 'Put', row.putBid, 'Sell', row.putDelta, row.putGamma, row.putTheta, row.putVega)}
                      className={`trade-cell trade-cell-sell ${isLegSelected(row.strike, 'Put', 'Sell') ? 'selected-leg-sell' : ''}`}
                      style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#fff', cursor: 'pointer', fontFamily: 'monospace', borderLeft: '1px solid var(--border)' }}
                    >{row.putBid?.toFixed(2) || '0.00'}</td>
                    
                    <td 
                      onClick={() => handleLegClick(row.strike, 'Put', row.putAsk, 'Buy', row.putDelta, row.putGamma, row.putTheta, row.putVega)}
                      className={`trade-cell trade-cell-buy ${isLegSelected(row.strike, 'Put', 'Buy') ? 'selected-leg-buy' : ''}`}
                      style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' }}
                    >{row.putAsk?.toFixed(2) || '0.00'}</td>
                    
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.putVol || 0}</td>
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.putOI || 0}</td>
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#9ca3af' }}>{row.putIV || '0%'}</td>
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#999' }}>{row.putDelta?.toFixed(4) || '0.0000'}</td>
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#999' }}>{row.putGamma?.toFixed(4) || '0.0000'}</td>
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#999' }}>{row.putTheta?.toFixed(4) || '0.0000'}</td>
                    <td style={{ padding: '12px 8px', background: isITMPut ? 'rgba(167, 139, 250, 0.05)' : 'transparent', color: '#999' }}>{row.putVega?.toFixed(4) || '0.0000'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT SIDEBAR: PERFORMANCE PROFILE */}
      <div style={{ width: isProfileCollapsed ? '40px' : '320px', borderLeft: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', padding: isProfileCollapsed ? '24px 8px' : '24px', display: 'flex', flexDirection: 'column', zIndex: 5, transition: 'width 0.3s, padding 0.3s', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          {!isProfileCollapsed && <h3 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', color: '#d1d5db', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Performance Profile</h3>}
          <button onClick={() => setIsProfileCollapsed(!isProfileCollapsed)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: isProfileCollapsed ? '100%' : 'auto' }}>
            {isProfileCollapsed ? '◀' : '▶'}
          </button>
        </div>
        
        {!isProfileCollapsed && (
          selectedLegs.length > 0 ? (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{detectStrategy(selectedLegs)}</h4>
              </div>
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

            {/* PAYOFF GRAPH */}
            <div style={{ height: '180px', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px', overflow: 'hidden' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payoffData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="price" stroke="#888" tickFormatter={(val) => `$${val}`} style={{ fontSize: '11px' }} />
                  <YAxis stroke="#888" tickFormatter={(val) => `$${val}`} style={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                    labelFormatter={(label) => `Price: $${Number(label).toFixed(2)}`}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'P/L']}
                  />
                  <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                  <ReferenceLine x={currentPrice} stroke="rgba(59, 130, 246, 0.5)" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="profit" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* BREAKEVENS & MAX PROFIT / LOSS */}
            <div style={{ marginBottom: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Breakeven(s):</span>
              <span style={{ fontWeight: 600 }}>{breakevens.length > 0 ? breakevens.map(b => `$${b.toFixed(2)}`).join(', ') : 'N/A'}</span>
            </div>
            
            <div style={{ marginBottom: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Max Profit:</span>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                {isMaxProfitInfinite ? 'Infinite' : `$${maxProfitVal.toFixed(2)}`}
              </span>
            </div>
            <div style={{ marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Max Loss:</span>
              <span style={{ fontWeight: 600, color: 'var(--danger)' }}>
                {isMaxLossInfinite ? 'Infinite' : `$${Math.abs(maxLossVal).toFixed(2)}`}
              </span>
            </div>

            {/* GREEKS */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><span style={{ color: '#9ca3af', fontSize: '12px', display: 'block' }}>Delta</span><span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{positionGreeks.delta.toFixed(4)}</span></div>
              <div><span style={{ color: '#9ca3af', fontSize: '12px', display: 'block' }}>Gamma</span><span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{positionGreeks.gamma.toFixed(4)}</span></div>
              <div><span style={{ color: '#9ca3af', fontSize: '12px', display: 'block' }}>Theta</span><span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{positionGreeks.theta.toFixed(4)}</span></div>
              <div><span style={{ color: '#9ca3af', fontSize: '12px', display: 'block' }}>Vega</span><span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{positionGreeks.vega.toFixed(4)}</span></div>
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
              <button 
                onClick={handleSubmitOrder}
                className="btn-primary" 
                style={{ flex: 2, padding: '12px', fontSize: '14px', fontWeight: 600, borderRadius: '8px' }}
              >
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
        .trade-cell-buy:hover { background: rgba(59, 130, 246, 0.2) !important; box-shadow: inset 0 0 0 1px var(--primary); }
        .trade-cell-sell:hover { background: rgba(239, 68, 68, 0.2) !important; box-shadow: inset 0 0 0 1px var(--danger); }
        .selected-leg-buy { background: rgba(59, 130, 246, 0.3) !important; box-shadow: inset 0 0 0 2px var(--primary) !important; }
        .selected-leg-sell { background: rgba(239, 68, 68, 0.2) !important; box-shadow: inset 0 0 0 2px var(--danger) !important; }
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

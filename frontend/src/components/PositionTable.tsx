'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type Position = {
  id: string;
  symbol?: string;
  name?: string;
  type?: "STOCK" | "OPTION";
  expirationDate?: string;
  strikePrice?: number;
  optionType?: "CALL" | "PUT";
  contractMultiplier?: number;
  quantity: number;
  averageEntryPrice: number;
  realizedPnl: number;
  currentPrice?: number;
  unrealizedPnl?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
};

const detectStrategy = (legs: Position[]) => {
  if (legs.length === 1) {
    const typeName = legs[0].optionType ? legs[0].optionType.charAt(0) + legs[0].optionType.slice(1).toLowerCase() : '';
    return legs[0].quantity > 0 ? `Long ${typeName}` : `Short ${typeName}`;
  }
  
  const sorted = [...legs].sort((a, b) => (a.strikePrice || 0) - (b.strikePrice || 0));
  
  if (legs.length === 2) {
    const [l1, l2] = sorted;
    const isSameType = l1.optionType === l2.optionType;
    const q1 = l1.quantity;
    const q2 = l2.quantity;
    
    if (isSameType) {
      if (Math.sign(q1) !== Math.sign(q2)) {
        if (Math.abs(q1) === Math.abs(q2)) {
          if (l1.optionType === 'CALL') {
            if (q1 > 0 && q2 < 0) return "Bull Call Spread";
            if (q1 < 0 && q2 > 0) return "Bear Call Spread";
          } else {
            if (q1 > 0 && q2 < 0) return "Bull Put Spread";
            if (q1 < 0 && q2 > 0) return "Bear Put Spread";
          }
          return "Spread";
        } else {
          const longQty = q1 > 0 ? q1 : q2;
          const shortQty = q1 < 0 ? Math.abs(q1) : Math.abs(q2);
          if (longQty > shortQty) {
              return "Long Ratio Spread";
          } else {
              return "Short Ratio Spread";
          }
        }
      }
    } else {
      if (l1.strikePrice === l2.strikePrice) {
        if (q1 > 0 && q2 > 0) return "Long Straddle";
        if (q1 < 0 && q2 < 0) return "Short Straddle";
      } else {
        if (q1 > 0 && q2 > 0) return "Long Strangle";
        if (q1 < 0 && q2 < 0) return "Short Strangle";
      }
    }
  } else if (legs.length === 3) {
     const isSameType = sorted.every(l => l.optionType === sorted[0].optionType);
     if (isSameType) {
        const q1 = sorted[0].quantity;
        const q2 = sorted[1].quantity;
        const q3 = sorted[2].quantity;
        if (q1 > 0 && q2 < 0 && q3 > 0) return "Long Butterfly";
        if (q1 < 0 && q2 > 0 && q3 < 0) return "Short Butterfly";
     }
  } else if (legs.length === 4) {
     const puts = sorted.filter(l => l.optionType === 'PUT');
     const calls = sorted.filter(l => l.optionType === 'CALL');
     if (puts.length === 2 && calls.length === 2) {
        const pSorted = [...puts].sort((a,b) => (a.strikePrice||0) - (b.strikePrice||0));
        const cSorted = [...calls].sort((a,b) => (a.strikePrice||0) - (b.strikePrice||0));
        
        const outerLong = (pSorted[0].quantity > 0 && cSorted[1].quantity > 0 && pSorted[1].quantity < 0 && cSorted[0].quantity < 0);
        const innerLong = (pSorted[0].quantity < 0 && cSorted[1].quantity < 0 && pSorted[1].quantity > 0 && cSorted[0].quantity > 0);
        if (outerLong) return "Long Iron Condor";
        if (innerLong) return "Short Iron Condor";
     }
     return "Iron Condor";
  }
  
  return "Options";
};

const getDte = (dateStr?: string) => {
    if (!dateStr) return '-';
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))) + 'd';
};

export default function PositionTable({ positions }: { positions: Position[] }) {
  const [expandedSymbols, setExpandedSymbols] = useState<Record<string, boolean>>({});
  const [expandedExpiries, setExpandedExpiries] = useState<Record<string, boolean>>({});

  const toggleSymbol = (symbol: string) => {
    setExpandedSymbols(prev => ({ ...prev, [symbol]: !prev[symbol] }));
  };

  const toggleExpiry = (key: string) => {
    setExpandedExpiries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const grouped: Record<string, { stocks: Position[], options: Record<string, Position[]> }> = {};

  positions.forEach(pos => {
    const sym = pos.symbol || 'Unknown';
    if (!grouped[sym]) {
      grouped[sym] = { stocks: [], options: {} };
    }
    if (pos.type === 'OPTION') {
      const exp = pos.expirationDate || 'No Expiry';
      if (!grouped[sym].options[exp]) {
        grouped[sym].options[exp] = [];
      }
      grouped[sym].options[exp].push(pos);
    } else {
      grouped[sym].stocks.push(pos);
    }
  });

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleClosePosition = async (legs: Position[]) => {
      try {
          const requests = legs.map(pos => {
              const side = pos.quantity > 0 ? 'SELL' : 'BUY';
              return {
                  symbol: pos.symbol,
                  strike: pos.strikePrice,
                  expiration: pos.expirationDate,
                  optionType: pos.optionType,
                  side: side,
                  type: 'MARKET',
                  quantity: Math.abs(pos.quantity)
              };
          });
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/trading/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(requests)
          });
          if (res.ok) {
              window.location.reload();
          } else {
              alert('Failed to close position.');
          }
      } catch (e) {
          alert('Error closing position.');
      }
  };

  if (positions.length === 0) {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border)', fontSize: '14px', color: '#9ca3af' }}>
            <th style={{ padding: '16px' }}>Position</th>
            <th style={{ padding: '16px' }}>DTE</th>
            <th style={{ padding: '16px' }}>Qty</th>
            <th style={{ padding: '16px' }}>Avg Price</th>
            <th style={{ padding: '16px' }}>Live Price</th>
            <th style={{ padding: '16px' }}>Cost Basis</th>
            <th style={{ padding: '16px' }}>Unrealized P&L</th>
            <th style={{ padding: '16px' }}>Realized P&L</th>
            <th style={{ padding: '16px' }}>P&L %</th>
            <th style={{ padding: '16px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={10} style={{ padding: '24px 16px', color: '#888', textAlign: 'center' }}>No active positions found.</td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
      <thead>
        <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border)', fontSize: '14px', color: '#9ca3af' }}>
            <th style={{ padding: '16px' }}>Position</th>
            <th style={{ padding: '16px' }}>DTE</th>
            <th style={{ padding: '16px' }}>Qty</th>
            <th style={{ padding: '16px' }}>Avg Price</th>
            <th style={{ padding: '16px' }}>Live Price</th>
            <th style={{ padding: '16px' }}>Cost Basis</th>
            <th style={{ padding: '16px' }}>Unrealized P&L</th>
            <th style={{ padding: '16px' }}>Realized P&L</th>
            <th style={{ padding: '16px' }}>P&L %</th>
            <th style={{ padding: '16px' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(grouped).sort().map(symbol => {
          const group = grouped[symbol];
          const isSymbolExpanded = expandedSymbols[symbol];
          
          let totalCost = 0;
          let totalRealized = 0;
          let totalUnrealized = 0;
          
          group.stocks.forEach(p => {
             totalCost += p.averageEntryPrice * p.quantity * (p.contractMultiplier || 1);
             totalRealized += p.realizedPnl;
             totalUnrealized += (p.unrealizedPnl || 0);
          });
          Object.values(group.options).flat().forEach(p => {
             totalCost += p.averageEntryPrice * p.quantity * (p.contractMultiplier || 100);
             totalRealized += p.realizedPnl;
             totalUnrealized += (p.unrealizedPnl || 0);
          });
          
          const totalPnlPct = totalCost !== 0 ? (totalUnrealized / Math.abs(totalCost)) * 100 : 0;

          return (
            <React.Fragment key={symbol}>
              <tr 
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.02)' }}
                onClick={() => toggleSymbol(symbol)}
              >
                <td style={{ padding: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSymbolExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {symbol}
                </td>
                <td colSpan={4}></td>
                <td style={{ padding: '16px', fontWeight: 600, color: '#fff' }}>
                  {totalCost < 0 ? '-' : ''}{formatMoney(Math.abs(totalCost))}
                </td>
                <td style={{ padding: '16px', fontWeight: 600, color: totalUnrealized > 0 ? 'var(--success)' : totalUnrealized < 0 ? 'var(--danger)' : '#fff' }}>
                  {totalUnrealized > 0 ? '+' : ''}{formatMoney(totalUnrealized)}
                </td>
                <td style={{ padding: '16px', fontWeight: 600, color: totalRealized > 0 ? 'var(--success)' : totalRealized < 0 ? 'var(--danger)' : '#fff' }}>
                  {totalRealized > 0 ? '+' : ''}{formatMoney(totalRealized)}
                </td>
                <td style={{ padding: '16px', fontWeight: 600, color: totalPnlPct > 0 ? 'var(--success)' : totalPnlPct < 0 ? 'var(--danger)' : '#fff' }}>
                  {totalPnlPct > 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
                </td>
                <td style={{ padding: '16px' }}></td>
              </tr>

              {isSymbolExpanded && (
                <>
                  {group.stocks.map(pos => {
                    const sideColor = pos.quantity > 0 ? 'var(--success)' : 'var(--danger)';
                    const unrealizedColor = (pos.unrealizedPnl || 0) > 0 ? 'var(--success)' : (pos.unrealizedPnl || 0) < 0 ? 'var(--danger)' : '#fff';
                    const realizedColor = pos.realizedPnl > 0 ? 'var(--success)' : pos.realizedPnl < 0 ? 'var(--danger)' : '#fff';
                    const costBasis = pos.averageEntryPrice * pos.quantity * (pos.contractMultiplier || 1);
                    const pnlPct = costBasis !== 0 ? ((pos.unrealizedPnl || 0) / Math.abs(costBasis)) * 100 : 0;
                    const pnlPctColor = pnlPct > 0 ? 'var(--success)' : pnlPct < 0 ? 'var(--danger)' : '#fff';
                    
                    return (
                      <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px 12px 48px', color: '#ccc' }}>Stock</td>
                        <td style={{ padding: '12px 16px' }}>-</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                          <span style={{ color: sideColor }}>{pos.quantity > 0 ? '+' : ''}{pos.quantity}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{formatMoney(pos.averageEntryPrice)}</td>
                        <td style={{ padding: '12px 16px' }}>{formatMoney(pos.currentPrice || 0)}</td>
                        <td style={{ padding: '12px 16px' }}>{costBasis < 0 ? '-' : ''}{formatMoney(Math.abs(costBasis))}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: unrealizedColor }}>
                          {(pos.unrealizedPnl || 0) > 0 ? '+' : ''}{formatMoney(pos.unrealizedPnl || 0)}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: realizedColor }}>
                          {pos.realizedPnl > 0 ? '+' : ''}{formatMoney(pos.realizedPnl)}
                        </td>
                        <td style={{ padding: '12px 16px', color: pnlPctColor }}>
                           {pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleClosePosition([pos]); }} style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--danger)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Close</button>
                        </td>
                      </tr>
                    );
                  })}

                  {Object.keys(group.options).sort().map(expiry => {
                    const expKey = `${symbol}-${expiry}`;
                    const isExpExpanded = expandedExpiries[expKey];
                    const expLegs = group.options[expiry];
                    
                    const strategyName = detectStrategy(expLegs);

                    let expTotalCost = 0;
                    let expTotalRealized = 0;
                    let expTotalUnrealized = 0;
                    let expDelta = 0;
                    let expGamma = 0;
                    let expTheta = 0;
                    let expVega = 0;
                    
                    expLegs.forEach(p => {
                        const m = p.contractMultiplier || 100;
                        expTotalCost += p.averageEntryPrice * p.quantity * m;
                        expTotalRealized += p.realizedPnl;
                        expTotalUnrealized += (p.unrealizedPnl || 0);
                        expDelta += (p.delta || 0) * p.quantity * m;
                        expGamma += (p.gamma || 0) * p.quantity * m;
                        expTheta += (p.theta || 0) * p.quantity * m;
                        expVega += (p.vega || 0) * p.quantity * m;
                    });
                    
                    const expPnlPct = expTotalCost !== 0 ? (expTotalUnrealized / Math.abs(expTotalCost)) * 100 : 0;

                    return (
                      <React.Fragment key={expKey}>
                        <tr 
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
                          onClick={() => toggleExpiry(expKey)}
                        >
                          <td style={{ padding: '12px 16px 12px 40px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isExpExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <div>
                                <div>{expiry} ({strategyName})</div>
                                {isExpExpanded && (
                                   <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                                      Δ: {expDelta.toFixed(2)} | Γ: {expGamma.toFixed(2)} | Θ: {expTheta.toFixed(2)} | V: {expVega.toFixed(2)}
                                   </div>
                                )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{getDte(expiry)}</td>
                          <td colSpan={3}></td>
                          <td style={{ padding: '12px 16px' }}>{expTotalCost < 0 ? '-' : ''}{formatMoney(Math.abs(expTotalCost))}</td>
                          <td style={{ padding: '12px 16px', color: expTotalUnrealized > 0 ? 'var(--success)' : expTotalUnrealized < 0 ? 'var(--danger)' : '#fff' }}>
                            {expTotalUnrealized > 0 ? '+' : ''}{formatMoney(expTotalUnrealized)}
                          </td>
                          <td style={{ padding: '12px 16px', color: expTotalRealized > 0 ? 'var(--success)' : expTotalRealized < 0 ? 'var(--danger)' : '#fff' }}>
                            {expTotalRealized > 0 ? '+' : ''}{formatMoney(expTotalRealized)}
                          </td>
                          <td style={{ padding: '12px 16px', color: expPnlPct > 0 ? 'var(--success)' : expPnlPct < 0 ? 'var(--danger)' : '#fff' }}>
                            {expPnlPct > 0 ? '+' : ''}{expPnlPct.toFixed(2)}%
                          </td>
                          <td style={{ padding: '12px 16px', display: 'flex', gap: '4px' }}>
                             <button onClick={(e) => { e.stopPropagation(); handleClosePosition(expLegs); }} style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--danger)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Close All</button>
                             <button style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--primary)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Roll</button>
                          </td>
                        </tr>

                        {isExpExpanded && expLegs.map(pos => {
                          const sideColor = pos.quantity > 0 ? 'var(--success)' : 'var(--danger)';
                          const unrealizedColor = (pos.unrealizedPnl || 0) > 0 ? 'var(--success)' : (pos.unrealizedPnl || 0) < 0 ? 'var(--danger)' : '#fff';
                          const realizedColor = pos.realizedPnl > 0 ? 'var(--success)' : pos.realizedPnl < 0 ? 'var(--danger)' : '#fff';
                          const costBasis = pos.averageEntryPrice * pos.quantity * (pos.contractMultiplier || 100);
                          const pnlPct = costBasis !== 0 ? ((pos.unrealizedPnl || 0) / Math.abs(costBasis)) * 100 : 0;
                          const pnlPctColor = pnlPct > 0 ? 'var(--success)' : pnlPct < 0 ? 'var(--danger)' : '#fff';
                          
                          return (
                            <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '12px 16px 12px 64px', color: '#ccc' }}>
                                {pos.strikePrice} {pos.optionType}
                              </td>
                              <td style={{ padding: '12px 16px' }}>{getDte(pos.expirationDate)}</td>
                              <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                                <span style={{ color: sideColor }}>{pos.quantity > 0 ? '+' : ''}{pos.quantity}</span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>{formatMoney(pos.averageEntryPrice)}</td>
                              <td style={{ padding: '12px 16px' }}>{formatMoney(pos.currentPrice || 0)}</td>
                              <td style={{ padding: '12px 16px' }}>{costBasis < 0 ? '-' : ''}{formatMoney(Math.abs(costBasis))}</td>
                              <td style={{ padding: '12px 16px', color: unrealizedColor }}>
                                {(pos.unrealizedPnl || 0) > 0 ? '+' : ''}{formatMoney(pos.unrealizedPnl || 0)}
                              </td>
                              <td style={{ padding: '12px 16px', color: realizedColor }}>
                                {pos.realizedPnl > 0 ? '+' : ''}{formatMoney(pos.realizedPnl)}
                              </td>
                              <td style={{ padding: '12px 16px', color: pnlPctColor }}>
                                {pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                              </td>
                              <td style={{ padding: '12px 16px', display: 'flex', gap: '4px' }}>
                                <button onClick={(e) => { e.stopPropagation(); handleClosePosition([pos]); }} style={{ padding: '4px 8px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Close</button>
                                <button style={{ padding: '4px 8px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Roll</button>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

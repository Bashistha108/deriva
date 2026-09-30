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
          return "Ratio Spread";
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
        const outerLong = (puts[0].quantity > 0 && calls[1].quantity > 0 && puts[1].quantity < 0 && calls[0].quantity < 0);
        const innerLong = (puts[0].quantity < 0 && calls[1].quantity < 0 && puts[1].quantity > 0 && calls[0].quantity > 0);
        if (outerLong) return "Short Iron Condor";
        if (innerLong) return "Long Iron Condor";
     }
     return "Iron Condor";
  }
  
  return "Options";
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

  // Grouping
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

  if (positions.length === 0) {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border)', fontSize: '14px', color: '#9ca3af' }}>
            <th style={{ padding: '16px' }}>Position</th>
            <th style={{ padding: '16px' }}>Qty</th>
            <th style={{ padding: '16px' }}>Avg Price</th>
            <th style={{ padding: '16px' }}>Cost Basis</th>
            <th style={{ padding: '16px' }}>P&L</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={5} style={{ padding: '24px 16px', color: '#888', textAlign: 'center' }}>No active positions found.</td>
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
          <th style={{ padding: '16px' }}>Qty</th>
          <th style={{ padding: '16px' }}>Avg Price</th>
          <th style={{ padding: '16px' }}>Cost Basis</th>
          <th style={{ padding: '16px' }}>Realized P&L</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(grouped).sort().map(symbol => {
          const group = grouped[symbol];
          const isSymbolExpanded = expandedSymbols[symbol];
          
          let totalCost = 0;
          let totalPnl = 0;
          group.stocks.forEach(p => {
             totalCost += p.averageEntryPrice * Math.abs(p.quantity) * (p.contractMultiplier || 1);
             totalPnl += p.realizedPnl;
          });
          Object.values(group.options).flat().forEach(p => {
             totalCost += p.averageEntryPrice * Math.abs(p.quantity) * (p.contractMultiplier || 100);
             totalPnl += p.realizedPnl;
          });

          return (
            <React.Fragment key={symbol}>
              {/* Symbol Header */}
              <tr 
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.02)' }}
                onClick={() => toggleSymbol(symbol)}
              >
                <td style={{ padding: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSymbolExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {symbol}
                </td>
                <td style={{ padding: '16px' }}></td>
                <td style={{ padding: '16px' }}></td>
                <td style={{ padding: '16px', fontWeight: 600 }}>{formatMoney(totalCost)}</td>
                <td style={{ padding: '16px', fontWeight: 600, color: totalPnl > 0 ? 'var(--success)' : totalPnl < 0 ? 'var(--danger)' : '#fff' }}>
                  {totalPnl > 0 ? '+' : ''}{formatMoney(totalPnl)}
                </td>
              </tr>

              {/* Expanded Symbol View */}
              {isSymbolExpanded && (
                <>
                  {/* Stocks */}
                  {group.stocks.map(pos => {
                    const sideColor = pos.quantity > 0 ? 'var(--success)' : 'var(--danger)';
                    const pnlColor = pos.realizedPnl > 0 ? 'var(--success)' : pos.realizedPnl < 0 ? 'var(--danger)' : '#fff';
                    const costBasis = pos.averageEntryPrice * Math.abs(pos.quantity) * (pos.contractMultiplier || 1);
                    return (
                      <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px 12px 48px', color: '#ccc' }}>Stock</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                          <span style={{ color: sideColor }}>{pos.quantity > 0 ? '+' : ''}{pos.quantity}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{formatMoney(pos.averageEntryPrice)}</td>
                        <td style={{ padding: '12px 16px' }}>{formatMoney(costBasis)}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: pnlColor }}>
                          {pos.realizedPnl > 0 ? '+' : ''}{formatMoney(pos.realizedPnl)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Options */}
                  {Object.keys(group.options).sort().map(expiry => {
                    const expKey = `${symbol}-${expiry}`;
                    const isExpExpanded = expandedExpiries[expKey];
                    const expLegs = group.options[expiry];
                    
                    const strategyName = detectStrategy(expLegs);

                    let expTotalCost = 0;
                    let expTotalPnl = 0;
                    expLegs.forEach(p => {
                        expTotalCost += p.averageEntryPrice * Math.abs(p.quantity) * (p.contractMultiplier || 100);
                        expTotalPnl += p.realizedPnl;
                    });

                    return (
                      <React.Fragment key={expKey}>
                        <tr 
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer' }}
                          onClick={() => toggleExpiry(expKey)}
                        >
                          <td style={{ padding: '12px 16px 12px 40px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isExpExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            {expiry} ({strategyName})
                          </td>
                          <td style={{ padding: '12px 16px' }}></td>
                          <td style={{ padding: '12px 16px' }}></td>
                          <td style={{ padding: '12px 16px' }}>{formatMoney(expTotalCost)}</td>
                          <td style={{ padding: '12px 16px', color: expTotalPnl > 0 ? 'var(--success)' : expTotalPnl < 0 ? 'var(--danger)' : '#fff' }}>
                            {expTotalPnl > 0 ? '+' : ''}{formatMoney(expTotalPnl)}
                          </td>
                        </tr>

                        {isExpExpanded && expLegs.map(pos => {
                          const sideColor = pos.quantity > 0 ? 'var(--success)' : 'var(--danger)';
                          const pnlColor = pos.realizedPnl > 0 ? 'var(--success)' : pos.realizedPnl < 0 ? 'var(--danger)' : '#fff';
                          const costBasis = pos.averageEntryPrice * Math.abs(pos.quantity) * (pos.contractMultiplier || 100);
                          return (
                            <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '12px 16px 12px 64px', color: '#ccc' }}>
                                {pos.strikePrice} {pos.optionType}
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                                <span style={{ color: sideColor }}>{pos.quantity > 0 ? '+' : ''}{pos.quantity}</span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>{formatMoney(pos.averageEntryPrice)}</td>
                              <td style={{ padding: '12px 16px' }}>{formatMoney(costBasis)}</td>
                              <td style={{ padding: '12px 16px', color: pnlColor }}>
                                {pos.realizedPnl > 0 ? '+' : ''}{formatMoney(pos.realizedPnl)}
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

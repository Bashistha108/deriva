'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function WatchlistPage() {
  const [instruments, setInstruments] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const prevPrices = useRef<Record<string, number>>({});
  const flashTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const router = useRouter();

  useEffect(() => {
    fetchData();

    // Poll prices
    const fetchPrices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/market-data/current`, { credentials: 'include' });
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
            return data;
          });
        }
      } catch (e) {
        // ignore
      }
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all instruments
      const instRes = await fetch('http://localhost:8080/api/market-data/instruments', { credentials: 'include' });
      if (instRes.status === 401 || instRes.status === 403) {
        router.push('/login');
        return;
      }
      const instData = await instRes.json();
      setInstruments(Array.isArray(instData) ? instData : []);

      // Fetch user watchlists
      const watchRes = await fetch('http://localhost:8080/api/watchlists', { credentials: 'include' });
      const watchlists = await watchRes.json();

      let activeWatchlist = Array.isArray(watchlists) ? watchlists[0] : null;
      if (!activeWatchlist) {
        // Create a default watchlist
        const createRes = await fetch('http://localhost:8080/api/watchlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: '"My Watchlist"'
        });
        activeWatchlist = await createRes.json();
      }
      setWatchlist(activeWatchlist);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const toggleWatchlist = async (instrumentId: number, isWatched: boolean) => {
    if (!watchlist) return;
    
    // Optimistic update
    const updatedWatchlist = { ...watchlist };
    if (isWatched) {
        updatedWatchlist.items = updatedWatchlist.items.filter((i: any) => i.instrumentId !== instrumentId);
    } else {
        updatedWatchlist.items.push({ instrumentId });
    }
    setWatchlist(updatedWatchlist);

    try {
      if (isWatched) {
        await fetch(`http://localhost:8080/api/watchlists/${watchlist.id}/items/${instrumentId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } else {
        await fetch(`http://localhost:8080/api/watchlists/${watchlist.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(instrumentId)
        });
      }
    } catch (e) {
      console.error('Failed to toggle', e);
      // Revert on fail (refresh)
      fetchData();
    }
  };

  if (loading) return <div style={{ padding: '40px', color: '#fff' }}>Loading Watchlist...</div>;

  const watchedIds = new Set(watchlist?.items?.map((i: any) => i.instrumentId) || []);

  return (
    <div style={{ padding: '40px', background: 'var(--background)', minHeight: '100vh', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>Watchlist Management</h1>
        <button 
          onClick={() => router.push('/chain')}
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          Back to Options Chain
        </button>
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)', color: '#9ca3af', fontSize: '13px', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px' }}>Symbol</th>
              <th style={{ padding: '16px' }}>Type</th>
              <th style={{ padding: '16px' }}>Price</th>
              <th style={{ padding: '16px' }}>Watchlist Status</th>
            </tr>
          </thead>
          <tbody>
            {instruments.map(inst => {
              const isWatched = watchedIds.has(inst.id);
              return (
                <tr key={inst.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{inst.symbol}</td>
                  <td style={{ padding: '16px', color: '#9ca3af' }}>{inst.type || inst.instrumentType}</td>
                  <td style={{ 
                    padding: '16px', 
                    fontFamily: 'monospace', 
                    fontWeight: 500,
                    color: flashes[inst.symbol] === 'up' ? '#10b981' : flashes[inst.symbol] === 'down' ? '#ef4444' : 'inherit',
                    transition: 'color 0.3s'
                  }}>
                    {prices[inst.symbol] ? `$${prices[inst.symbol].toFixed(2)}` : '---'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => toggleWatchlist(inst.id, isWatched)}
                      style={{ 
                        background: isWatched ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                        color: isWatched ? '#ef4444' : '#3b82f6', 
                        border: `1px solid ${isWatched ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                        padding: '6px 16px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      {isWatched ? 'Remove' : 'Add to Watchlist'}
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

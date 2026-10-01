'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, LineSeries } from 'lightweight-charts';

export default function ChartPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const router = useRouter();
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '1h' | '1D'>('1D');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [instrumentId, setInstrumentId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [watchedSymbols, setWatchedSymbols] = useState<Set<string>>(new Set());
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  // Watchlist & Prices
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
      } catch (e) {}
    };
    fetchWatchlist();
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/market-data/current`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setPrices(data);
        }
      } catch (err) {}
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 1000);
    return () => clearInterval(interval);
  }, []);


  // 1. Fetch instrument ID
  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/market-data/instruments`, { credentials: 'include' });
        if (res.ok) {
          const instruments = await res.json();
          const match = instruments.find((i: any) => i.symbol.toLowerCase() === (symbol as string).toLowerCase());
          if (match) {
            setInstrumentId(match.id);
          } else {
            console.error('Instrument not found');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (symbol) fetchInstrument();
  }, [symbol]);

  // 2. Fetch History Data
  useEffect(() => {
    const fetchHistory = async () => {
      if (!instrumentId) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/market-data/${instrumentId}/history`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          // Sort by timestamp
          data.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          setHistory(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
    // Poll every 5s for new history
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [instrumentId]);

  // 3. Aggregate data by timeframe
  const chartData = useMemo(() => {
    if (history.length === 0) return [];
    
    // Group into OHLC bars
    let intervalMs = 60 * 1000;
    if (timeframe === '5m') intervalMs = 5 * 60 * 1000;
    if (timeframe === '1h') intervalMs = 60 * 60 * 1000;
    if (timeframe === '1D') intervalMs = 24 * 60 * 60 * 1000;

    const bars: Record<number, any> = {};

    history.forEach(tick => {
      const ts = new Date(tick.timestamp).getTime();
      const roundedTs = Math.floor(ts / intervalMs) * intervalMs;
      const price = Number(tick.price);
      
      if (!bars[roundedTs]) {
        let timeVal: any = roundedTs / 1000;
        if (timeframe === '1D') {
            const d = new Date(roundedTs);
            timeVal = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        }
        bars[roundedTs] = {
          time: timeVal,
          open: price,
          high: price,
          low: price,
          close: price,
          _unix: roundedTs // for sorting
        };
      } else {
        const bar = bars[roundedTs];
        if (price > bar.high) bar.high = price;
        if (price < bar.low) bar.low = price;
        bar.close = price;
      }
    });

    const finalBars = Object.values(bars).sort((a: any, b: any) => a._unix - b._unix).map(({ _unix, ...rest }: any) => {
        return rest;
    });

    return finalBars;
  }, [history, timeframe]);

  // Drawing state
  const drawingStateRef = useRef<{ isDrawing: boolean, isDragging: boolean, startPoint: any, activeLine: any, lines: any[], lastCrosshair: any }>({
    isDrawing: false,
    isDragging: false,
    startPoint: null,
    activeLine: null,
    lines: [],
    lastCrosshair: null,
  });

  useEffect(() => {
    drawingStateRef.current.isDrawing = isDrawing;
    if (!isDrawing) {
      drawingStateRef.current.isDragging = false;
      drawingStateRef.current.startPoint = null;
      drawingStateRef.current.activeLine = null;
      if (chartRef.current) {
          chartRef.current.applyOptions({ handleScroll: true, handleScale: true });
      }
    } else {
      if (chartRef.current) {
          chartRef.current.applyOptions({ handleScroll: false, handleScale: false });
      }
    }
  }, [isDrawing]);

  // 4. Initialize & Update Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (!chartRef.current) {
        const chartOptions = {
          layout: {
            background: { type: ColorType.Solid, color: '#111111' },
            textColor: '#d1d5db',
          },
          grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
          },
          crosshair: {
            mode: CrosshairMode.Normal,
          },
          rightPriceScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          timeScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            timeVisible: true,
            secondsVisible: false,
          },
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        };
        chartRef.current = createChart(chartContainerRef.current, chartOptions);

        // Drawing state internals
        let activeDrawing = false;
        let activeStartPoint: any = null;
        let activeLineSeries: any = null;

        // Click handler for drawing (2-click approach like TradingView default)
        chartRef.current.subscribeClick((param: any) => {
           if (!drawingStateRef.current.isDrawing) return;
           if (!param.point) return;
           if (!seriesRef.current) return;

           const price = seriesRef.current.coordinateToPrice(param.point.y);
           const time = param.time;
           
           // Can't easily map logical to time if it's out of bounds, require valid time
           if (price === null || !time) return;

           if (!drawingStateRef.current.startPoint) {
               // First click
               drawingStateRef.current.startPoint = { time: time, value: price };
               
               const lineSeries = chartRef.current.addSeries(LineSeries, {
                   color: '#f59e0b',
                   lineWidth: 2,
                   crosshairMarkerVisible: false,
                   lastValueVisible: false,
                   priceLineVisible: false,
               });
               drawingStateRef.current.activeLine = lineSeries;
           } else {
               // Second click
               if (drawingStateRef.current.activeLine) {
                   drawingStateRef.current.lines.push(drawingStateRef.current.activeLine);
               }
               drawingStateRef.current.startPoint = null;
               drawingStateRef.current.activeLine = null;
           }
        });

        // Mouse move handler for preview
        chartRef.current.subscribeCrosshairMove((param: any) => {
           if (!drawingStateRef.current.isDrawing || !drawingStateRef.current.startPoint || !drawingStateRef.current.activeLine) return;
           if (!param.point) return;

           const price = seriesRef.current.coordinateToPrice(param.point.y);
           const time = param.time;
           if (price !== null && time) {
               const t1Str = String(drawingStateRef.current.startPoint.time);
               const t2Str = String(time);
               
               if (t1Str !== t2Str) {
                   const endPoint = { time: time, value: price };
                   const data = [drawingStateRef.current.startPoint, endPoint].sort((a, b) => {
                       const t1 = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
                       const t2 = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
                       return t1 - t2;
                   });
                   drawingStateRef.current.activeLine.setData(data);
               }
           }
        });

        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
              height: chartContainerRef.current.clientHeight,
            });
          }
        };
        window.addEventListener('resize', handleResize);
    }


    // Update series type if needed
    if (!seriesRef.current || seriesRef.current._chartType !== chartType) {
        if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
        }
        
        if (chartType === 'candle') {
            seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
                upColor: '#22c55e',
                downColor: '#ef4444',
                borderVisible: false,
                wickVisible: true,
                wickUpColor: '#22c55e',
                wickDownColor: '#ef4444',
            });
        } else {
            seriesRef.current = chartRef.current.addSeries(LineSeries, {
                color: '#3b82f6',
                lineWidth: 2,
            });
        }
        seriesRef.current._chartType = chartType;
    }

    if (seriesRef.current && chartData.length > 0) {
      if (chartType === 'line') {
          seriesRef.current.setData(chartData.map((d: any) => ({ time: d.time, value: d.close })));
      } else {
          seriesRef.current.setData(chartData);
      }
    }
  }, [chartData, chartType]); 

  // 5. Live update the last bar with current price
  useEffect(() => {
      if (!seriesRef.current || chartData.length === 0) return;
      
      const rawPrice = prices[symbol.toUpperCase()];
      if (rawPrice !== undefined && rawPrice !== null) {
          const currentPrice = Number(rawPrice);
          const lastBar = { ...chartData[chartData.length - 1] };
          if (chartType === 'line') {
              seriesRef.current.update({ time: lastBar.time, value: currentPrice });
          } else {
              lastBar.close = currentPrice;
              if (currentPrice > lastBar.high) lastBar.high = currentPrice;
              if (currentPrice < lastBar.low) lastBar.low = currentPrice;
              seriesRef.current.update(lastBar);
          }
      }
  }, [prices, symbol, chartData, chartType]);

  // Also cleanup chart when component unmounts entirely
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        if (chartRef.current._cleanupDrawEvents) {
            chartRef.current._cleanupDrawEvents();
        }
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    }
  }, []);

  // 6. Clear drawn lines helper
  const clearLines = () => {
    if (chartRef.current) {
      drawingStateRef.current.lines.forEach(l => {
        chartRef.current.removeSeries(l);
      });
      drawingStateRef.current.lines = [];
      drawingStateRef.current.startPoint = null;
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR: WATCHLIST */}
      <div className="watchlist-panel" style={{ width: '280px', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', overflowY: 'auto' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
          <h3 style={{ margin: 0, fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Watchlist</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {Object.entries(prices)
            .filter(([sym]) => watchedSymbols.has(sym))
            .map(([sym, price]) => (
              <div 
                key={sym}
                onClick={() => router.push(`/chart/${sym}`)}
                style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: symbol.toUpperCase() === sym ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  borderLeft: symbol.toUpperCase() === sym ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'background 0.3s'
                }}
              >
                <span style={{ fontWeight: 600, color: '#e5e7eb' }}>{sym}</span>
                <span style={{ color: 'var(--success)', fontWeight: 500, fontFamily: 'monospace', fontSize: '14px' }}>${Number(price).toFixed(2)}</span>
              </div>
          ))}
          {Object.keys(prices).length === 0 && (
             <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Awaiting market data...</div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: CHART */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{symbol.toUpperCase()}</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setChartType('candle')}
                style={{
                  padding: '6px 12px',
                  background: chartType === 'candle' ? 'var(--primary)' : 'transparent',
                  color: chartType === 'candle' ? 'white' : '#9ca3af',
                  border: '1px solid',
                  borderColor: chartType === 'candle' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                Candle
              </button>
              <button
                onClick={() => setChartType('line')}
                style={{
                  padding: '6px 12px',
                  background: chartType === 'line' ? 'var(--primary)' : 'transparent',
                  color: chartType === 'line' ? 'white' : '#9ca3af',
                  border: '1px solid',
                  borderColor: chartType === 'line' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  marginRight: '16px'
                }}
              >
                Line
              </button>
              {(['1m', '5m', '1h', '1D'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: '6px 12px',
                    background: timeframe === tf ? 'var(--primary)' : 'transparent',
                    color: timeframe === tf ? 'white' : '#9ca3af',
                    border: '1px solid',
                    borderColor: timeframe === tf ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px', marginLeft: '8px' }}>
              <button
                onClick={() => setIsDrawing(!isDrawing)}
                style={{
                  padding: '6px 12px',
                  background: isDrawing ? 'var(--warning)' : 'transparent',
                  color: isDrawing ? '#000' : '#f59e0b',
                  border: '1px solid var(--warning)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {isDrawing ? 'Drawing...' : 'Draw Line'}
              </button>
              {drawingStateRef.current?.lines.length > 0 && (
                <button
                  onClick={clearLines}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  Clear Lines
                </button>
              )}
            </div>
          </div>
          <button 
            onClick={() => router.push('/chain')}
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            Options Chain
          </button>
        </div>

        {/* Chart Container */}
        <div style={{ flex: 1, position: 'relative', padding: '16px' }}>
          {loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <span style={{ color: '#9ca3af', fontSize: '18px' }}>Loading chart data...</span>
            </div>
          )}
          <div ref={chartContainerRef} style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }} />
        </div>
      </div>
    </div>
  );
}

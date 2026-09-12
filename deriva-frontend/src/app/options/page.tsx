"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Minus, X, TrendingUp, TrendingDown, Settings, ChevronRight, ChevronLeft } from "lucide-react";

type Leg = {
  id: string;
  type: "CALL" | "PUT";
  strike: number;
  expiration: string;
  side: "BUY" | "SELL";
  price: number;
  qty: number;
};

export default function OptionsChain() {
  const [watchlist, setWatchlist] = useState<string[]>(["SOXS", "VXX", "SOXX", "XLK", "SOXL", "USO", "GOOG", "BABA", "NIO", "AMD", "MSFT", "AMZN", "AAPL", "NFLX"]);
  const [tickerInput, setTickerInput] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("SOXS");
  
  const [underlyingPrice, setUnderlyingPrice] = useState(43.37);
  const [priceChange, setPriceChange] = useState(-2.97);
  const [priceChangePercent, setPriceChangePercent] = useState(-6.41);
  
  const [expirations, setExpirations] = useState<{ts: number, date: string}[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<number | null>(null);
  
  const [calls, setCalls] = useState<any[]>([]);
  const [puts, setPuts] = useState<any[]>([]);
  const [strikes, setStrikes] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [selectedLegs, setSelectedLegs] = useState<Leg[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPayoffGraph = () => {
    if (selectedLegs.length === 0) return null;
    
    // Generate data points
    const minPrice = underlyingPrice * 0.7;
    const maxPrice = underlyingPrice * 1.3;
    const steps = 50;
    const stepSize = (maxPrice - minPrice) / steps;
    const points = [];
    
    let minPL = 0;
    let maxPL = 0;
    
    for (let i = 0; i <= steps; i++) {
      const p = minPrice + (i * stepSize);
      let pl = selectedLegs.reduce((acc, leg) => {
        let legVal = 0;
        if (leg.type === "CALL") legVal = Math.max(0, p - leg.strike);
        if (leg.type === "PUT") legVal = Math.max(0, leg.strike - p);
        
        // if BUY, we paid leg.price. if SELL, we received leg.price
        const cost = leg.side === "BUY" ? leg.price : -leg.price;
        const val = leg.side === "BUY" ? legVal : -legVal;
        
        return acc + ((val - cost) * leg.qty * 100);
      }, 0);
      
      points.push({ price: p, pl });
      if (pl < minPL) minPL = pl;
      if (pl > maxPL) maxPL = pl;
    }
    
    // SVG padding
    const w = 260;
    const h = 120;
    const padX = 10;
    const padY = 10;
    
    // Normalize coordinates
    const getX = (price: number) => padX + ((price - minPrice) / (maxPrice - minPrice)) * (w - 2 * padX);
    const getY = (pl: number) => padY + (1 - (pl - minPL) / (maxPL - minPL || 1)) * (h - 2 * padY);
    
    const polylinePoints = points.map(pt => `${getX(pt.price)},${getY(pt.pl)}`).join(' ');
    const zeroY = getY(0);
    
    return (
      <div className="mt-4 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#2a2a2a] rounded p-2 flex flex-col items-center">
        <svg width={w} height={h} className="overflow-visible">
          {/* Zero line */}
          <line x1={padX} y1={zeroY} x2={w - padX} y2={zeroY} stroke="#888" strokeWidth="1" strokeDasharray="4 4" />
          {/* Payoff line */}
          <polyline points={polylinePoints} fill="none" stroke="#3b82f6" strokeWidth="2" />
          {/* Current price marker */}
          <line x1={getX(underlyingPrice)} y1={padY} x2={getX(underlyingPrice)} y2={h - padY} stroke="#a3a3a3" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      </div>
    );
  };

  useEffect(() => {
    fetchOptionsChain(selectedTicker);
  }, [selectedTicker]);

  useEffect(() => {
    if (selectedExpiry) {
      fetchOptionsChain(selectedTicker, selectedExpiry);
    }
  }, [selectedExpiry]);

  const fetchOptionsChain = async (ticker: string, dateTs?: number) => {
    setLoading(true);
    try {
      const url = `http://localhost:8080/api/v1/options/${ticker}/raw${dateTs ? `?date=${dateTs}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const result = data.optionChain?.result?.[0];
        if (result) {
          setUnderlyingPrice(result.quote?.regularMarketPrice || 0);
          setPriceChange(result.quote?.regularMarketChange || 0);
          setPriceChangePercent(result.quote?.regularMarketChangePercent || 0);
          
          if (!dateTs) {
             const exps = (result.expirationDates || []).map((ts: number) => {
                const date = new Date(ts * 1000);
                const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
                return { ts, date: formatter.format(date).replace(',', " '") }; // e.g. Sep 11 '26
             });
             setExpirations(exps);
             if (exps.length > 0 && !selectedExpiry) {
                setSelectedExpiry(exps[0].ts);
             }
          }
          
          const options = result.options?.[0];
          if (options) {
             setCalls(options.calls || []);
             setPuts(options.puts || []);
             
             const callStrikes = (options.calls || []).map((c: any) => c.strike);
             const putStrikes = (options.puts || []).map((p: any) => p.strike);
             const uniqueStrikes = Array.from(new Set([...callStrikes, ...putStrikes])).sort((a, b) => a - b);
             setStrikes(uniqueStrikes);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch options chain", e);
    } finally {
      setLoading(false);
    }
  };

  const addTickerToWatchlist = () => {
    const t = tickerInput.toUpperCase().trim();
    if (t && !watchlist.includes(t)) {
      setWatchlist([t, ...watchlist]);
      setSelectedTicker(t);
      setSelectedExpiry(null);
    }
    setTickerInput("");
  };

  const handleLegClick = (type: "CALL" | "PUT", strike: number, side: "BUY" | "SELL", price: number) => {
    if (!price || price === 0) return;
    const expObj = expirations.find(e => e.ts === selectedExpiry);
    const expDate = expObj ? expObj.date : "";
    const id = `${type}-${strike}-${side}`;
    setSelectedLegs(prev => {
      const exists = prev.find(l => l.id === id);
      if (exists) {
        // Toggle off if already selected
        return prev.filter(l => l.id !== id);
      }
      return [...prev, { id, type, strike, expiration: expDate, side, price, qty: 1 }];
    });
    // When a leg is added, automatically open the sidebar if not open
    setIsSidebarOpen(true);
  };

  const removeLeg = (id: string) => setSelectedLegs(prev => prev.filter(l => l.id !== id));
  const updateLegQty = (id: string, delta: number) => {
    setSelectedLegs(prev => prev.map(l => l.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l));
  };

  const netCost = selectedLegs.reduce((acc, leg) => acc + (leg.side === "BUY" ? leg.price * leg.qty : -leg.price * leg.qty), 0);
  const isCredit = netCost < 0;

  // Render mock greeks if Yahoo doesn't provide them
  const renderMockGreek = (type: string, strike: number, isCall: boolean) => {
    // Generate pseudo-realistic greeks based on moneyness for visual purposes
    const moneyness = strike / (underlyingPrice || 1);
    let delta = 0, gamma = 0.05, theta = -0.25, vega = 0.01;
    
    if (isCall) {
       delta = moneyness < 1 ? Math.max(0.01, 1 - Math.pow(moneyness, 4)) : Math.max(0.01, 0.5 * Math.pow(1/moneyness, 8));
    } else {
       delta = moneyness > 1 ? Math.min(-0.01, -1 + Math.pow(1/moneyness, 4)) : Math.min(-0.01, -0.5 * Math.pow(moneyness, 8));
    }
    
    switch(type) {
      case 'delta': return delta.toFixed(3);
      case 'gamma': return (gamma * Math.exp(-Math.abs(1-moneyness)*10)).toFixed(5);
      case 'theta': return (theta * Math.exp(-Math.abs(1-moneyness)*5)).toFixed(3);
      case 'vega': return (vega * Math.exp(-Math.abs(1-moneyness)*3)).toFixed(3);
      case 'change': return ((Math.random() * 100) - 50).toFixed(2) + "%"; // Mock change
      default: return "-";
    }
  };

  const [watchlistData, setWatchlistData] = useState<Record<string, { price: number, change: number, changePercent: number }>>({});
  
  useEffect(() => {
    // Fetch quotes for all watchlist items
    watchlist.forEach(sym => {
      fetch(`http://localhost:8080/api/v1/options/${sym}/raw`)
        .then(res => res.json())
        .then(data => {
          const result = data.optionChain?.result?.[0]?.quote;
          if (result) {
            setWatchlistData(prev => ({
              ...prev,
              [sym]: {
                price: result.regularMarketPrice || 0,
                change: result.regularMarketChange || 0,
                changePercent: result.regularMarketChangePercent || 0
              }
            }));
          }
        })
        .catch(e => console.error(`Failed to fetch quote for ${sym}`, e));
    });
  }, [watchlist]);

  return (
    <div className="flex h-[calc(100vh-65px)] bg-white dark:bg-[#111111] text-gray-800 dark:text-[#b3b3b3] text-sm font-sans overflow-hidden">
      
      {/* Left Sidebar - Watchlist */}
      <div className="w-64 border-r border-gray-300 dark:border-[#2a2a2a] flex flex-col bg-gray-50 dark:bg-[#161616]">
        <div className="flex items-center justify-between p-3 border-b border-gray-300 dark:border-[#2a2a2a] bg-gray-200 dark:bg-[#1e1e1e]">
          <span className="font-semibold text-gray-900 dark:text-white">HauptWatchlist</span>
          <Settings className="w-4 h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
        </div>
        <div className="flex items-center justify-between p-2 text-xs text-gray-500 dark:text-[#808080] border-b border-gray-300 dark:border-[#2a2a2a]">
          <span>Fin Instrument</span>
          <span>Last / Change %</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {watchlist.map(sym => {
            const data = watchlistData[sym] || { price: 0, change: 0, changePercent: 0 };
            return (
            <div 
              key={sym} 
              className={`flex justify-between items-center p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a2a2a] ${selectedTicker === sym ? 'bg-gray-200 dark:bg-[#2a2a2a] border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
              onClick={() => { setSelectedTicker(sym); setSelectedExpiry(null); }}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 dark:text-[#e0e0e0]">{sym}</span>
                <span className="text-[10px] text-red-700 dark:text-red-500 bg-red-100 dark:bg-[#331111] px-1 rounded w-max mt-0.5">NT</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-gray-900 dark:text-white">{data.price ? data.price.toFixed(2) : '-'}</span>
                <span className={data.change >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
                  {data.changePercent ? `${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%` : '-'}
                </span>
              </div>
            </div>
          )})}
        </div>
        <div className="p-2 border-t border-gray-300 dark:border-[#2a2a2a]">
          <div className="flex items-center gap-2 bg-white dark:bg-[#222222] border border-gray-300 dark:border-transparent rounded p-1">
            <Plus className="w-4 h-4 text-gray-500" />
            <input 
              className="bg-transparent border-none outline-none text-gray-900 dark:text-white w-full text-xs" 
              placeholder="Add Symbol"
              value={tickerInput}
              onChange={e => setTickerInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTickerToWatchlist()}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Header / Tabs */}
        <div className="flex items-center gap-6 px-4 py-2 border-b border-gray-300 dark:border-[#2a2a2a] bg-gray-100 dark:bg-[#1a1a1a] text-xs font-semibold">
          <span className="cursor-pointer hover:text-gray-900 dark:hover:text-white">Charts</span>
          <span className="cursor-pointer text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1">Options</span>
          <span className="cursor-pointer hover:text-gray-900 dark:hover:text-white">Connections</span>
          <span className="cursor-pointer hover:text-gray-900 dark:hover:text-white">News</span>
          <span className="cursor-pointer hover:text-gray-900 dark:hover:text-white">Fundamentals</span>
        </div>

        {/* Sub Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-[#1e1e1e] border-b border-gray-300 dark:border-[#2a2a2a]">
          <div className="flex items-center gap-4">
             <span className="text-gray-900 dark:text-white font-bold">{selectedTicker}</span>
             <span className="text-gray-900 dark:text-white">{underlyingPrice.toFixed(2)}</span>
             <span className={priceChange >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
               {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)} {priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
             </span>
          </div>
          <div className="flex gap-2">
            <select className="bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white border border-gray-400 dark:border-[#333] rounded px-2 py-1 text-xs outline-none">
              <option>Calls/Puts</option>
            </select>
            <select className="bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white border border-gray-400 dark:border-[#333] rounded px-2 py-1 text-xs outline-none">
              <option>40 Strikes</option>
            </select>
            <div className="flex border border-gray-400 dark:border-[#333] rounded overflow-hidden">
               {expirations.slice(0, 3).map(exp => (
                 <button 
                   key={exp.ts}
                   onClick={() => setSelectedExpiry(exp.ts)}
                   className={`px-3 py-1 text-xs ${selectedExpiry === exp.ts ? 'bg-gray-300 dark:bg-[#333333] text-gray-900 dark:text-white font-semibold' : 'bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#222]'}`}
                 >
                   {exp.date}
                 </button>
               ))}
               <select 
                 className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white px-2 outline-none text-xs border-l border-gray-400 dark:border-[#333]"
                 onChange={(e) => setSelectedExpiry(Number(e.target.value))}
                 value={selectedExpiry || ''}
               >
                 <option value="" disabled>More...</option>
                 {expirations.slice(3).map(exp => (
                   <option key={exp.ts} value={exp.ts}>{exp.date}</option>
                 ))}
               </select>
            </div>
          </div>
        </div>

        {/* Options Chain Table */}
        <div className="flex-1 overflow-auto bg-white dark:bg-[#111]">
          {loading ? (
             <div className="flex items-center justify-center h-full text-gray-500 dark:text-[#666]">Loading options data...</div>
          ) : (
             <table className="w-full text-xs text-right border-collapse">
               <thead className="sticky top-0 z-10 bg-gray-200 dark:bg-[#1e1e1e] text-gray-600 dark:text-[#808080]">
                 <tr>
                   <th colSpan={7} className="py-2 border-b border-r border-gray-300 dark:border-[#2a2a2a] text-center bg-gray-200 dark:bg-[#181818]">
                     <div className="flex justify-between px-2">
                       <span></span>
                       <span className="font-bold text-gray-800 dark:text-white">Calls</span>
                       <span></span>
                     </div>
                   </th>
                   <th className="py-2 border-b border-r border-gray-300 dark:border-[#2a2a2a] bg-gray-100 dark:bg-[#111] text-center px-4 font-bold text-gray-800 dark:text-white">Strike</th>
                   <th colSpan={7} className="py-2 border-b border-gray-300 dark:border-[#2a2a2a] text-center bg-gray-200 dark:bg-[#181818]">
                     <div className="flex justify-between px-2">
                       <span></span>
                       <span className="font-bold text-gray-800 dark:text-white">Puts</span>
                       <span></span>
                     </div>
                   </th>
                 </tr>
                 <tr className="border-b border-gray-300 dark:border-[#2a2a2a] bg-gray-100 dark:bg-[#161616]">
                   {/* Calls */}
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Bid</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Ask</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Change %</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Delta</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Gamma</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Theta</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Vega</th>
                   {/* Center */}
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#111]"></th>
                   {/* Puts */}
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Bid</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Ask</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Change %</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Delta</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Gamma</th>
                   <th className="font-normal py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a]">Theta</th>
                   <th className="font-normal py-1 px-2">Vega</th>
                 </tr>
               </thead>
               <tbody>
                 {strikes.map((strike, idx) => {
                   const call = calls[idx];
                   const put = puts[idx];
                   const isCallITM = call?.inTheMoney;
                   const isPutITM = put?.inTheMoney;
                   
                   const hasCallBuy = selectedLegs.some(l => l.strike === strike && l.type === "CALL" && l.side === "BUY");
                   const hasCallSell = selectedLegs.some(l => l.strike === strike && l.type === "CALL" && l.side === "SELL");
                   const hasPutBuy = selectedLegs.some(l => l.strike === strike && l.type === "PUT" && l.side === "BUY");
                   const hasPutSell = selectedLegs.some(l => l.strike === strike && l.type === "PUT" && l.side === "SELL");

                   const itmBg = 'bg-blue-50/50 dark:bg-[#151a1f]';

                   // Highlighting logic for IBKR style (Bid = Sell = Red, Ask = Buy = Blue)
                   const getCellBg = (isITM: boolean, side: "BUY"|"SELL"|null) => {
                      if (side === "BUY") return 'bg-blue-200 dark:bg-blue-900/60 font-bold';
                      if (side === "SELL") return 'bg-red-200 dark:bg-red-900/60 font-bold';
                      return isITM ? itmBg : '';
                   };

                   return (
                     <tr key={strike} className="border-b border-gray-200 dark:border-[#222] hover:bg-gray-50 dark:hover:bg-[#1f1f1f] group cursor-pointer transition-colors">
                       {/* CALLS */}
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${getCellBg(isCallITM, hasCallSell ? "SELL" : null)}`} onClick={() => handleLegClick("CALL", strike, "SELL", call?.bid)}>
                         <span className="text-red-600 dark:text-red-400 px-1 rounded inline-block w-full">{call?.bid?.toFixed(2) || '-'}</span>
                       </td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${getCellBg(isCallITM, hasCallBuy ? "BUY" : null)}`} onClick={() => handleLegClick("CALL", strike, "BUY", call?.ask)}>
                         <span className="text-blue-600 dark:text-blue-400 px-1 rounded inline-block w-full">{call?.ask?.toFixed(2) || '-'}</span>
                       </td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${isCallITM ? itmBg : ''}`}>{renderMockGreek('change', strike, true)}</td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${isCallITM ? itmBg : ''}`}>{renderMockGreek('delta', strike, true)}</td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${isCallITM ? itmBg : ''}`}>{renderMockGreek('gamma', strike, true)}</td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${isCallITM ? itmBg : ''}`}>{renderMockGreek('theta', strike, true)}</td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${isCallITM ? itmBg : ''}`}>{renderMockGreek('vega', strike, true)}</td>
                       
                       {/* STRIKE */}
                       <td className="py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] bg-gray-100 dark:bg-[#1a1a1a] text-center group-hover:bg-gray-200 dark:group-hover:bg-[#333] transition-colors relative">
                          {Math.abs(strike - underlyingPrice) < 0.5 && <div className="absolute left-0 top-1/2 w-full h-[1px] bg-gray-400 dark:bg-gray-500 z-0"></div>}
                          <div className="flex flex-col items-center justify-center relative z-10">
                            <span className="font-bold text-gray-900 dark:text-[#e0e0e0] leading-tight">{strike.toFixed(1)}</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                              IV: {call?.impliedVolatility ? (call.impliedVolatility * 100).toFixed(1) + '%' : '-'}
                            </span>
                          </div>
                       </td>
                       
                       {/* PUTS */}
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${getCellBg(isPutITM, hasPutSell ? "SELL" : null)}`} onClick={() => handleLegClick("PUT", strike, "SELL", put?.bid)}>
                         <span className="text-red-600 dark:text-red-400 px-1 rounded inline-block w-full">{put?.bid?.toFixed(2) || '-'}</span>
                       </td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${getCellBg(isPutITM, hasPutBuy ? "BUY" : null)}`} onClick={() => handleLegClick("PUT", strike, "BUY", put?.ask)}>
                         <span className="text-blue-600 dark:text-blue-400 px-1 rounded inline-block w-full">{put?.ask?.toFixed(2) || '-'}</span>
                       </td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${isPutITM ? itmBg : ''}`}>{renderMockGreek('change', strike, false)}</td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${isPutITM ? itmBg : ''}`}>{renderMockGreek('delta', strike, false)}</td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${isPutITM ? itmBg : ''}`}>{renderMockGreek('gamma', strike, false)}</td>
                       <td className={`py-1 px-2 border-r border-gray-300 dark:border-[#2a2a2a] ${isPutITM ? itmBg : ''}`}>{renderMockGreek('theta', strike, false)}</td>
                       <td className={`py-1 px-2 ${isPutITM ? itmBg : ''}`}>{renderMockGreek('vega', strike, false)}</td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
          )}
        </div>
        
        {/* Expand Sidebar Button (Only visible if sidebar is closed) */}
        {!isSidebarOpen && (
          <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 rounded-l-lg p-1.5 cursor-pointer z-30 shadow-lg"
            onClick={() => setIsSidebarOpen(true)}
            title="Open Performance Profile"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Right Sidebar - Strategy Profile */}
      <div 
        className={`border-l border-gray-300 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#161616] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-full overflow-hidden'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-[#2a2a2a] bg-gray-200 dark:bg-[#1e1e1e]">
           <h3 className="text-gray-900 dark:text-white font-bold whitespace-nowrap">Performance Profile</h3>
           <div 
             className="cursor-pointer bg-gray-300 hover:bg-gray-400 dark:bg-[#333] dark:hover:bg-[#444] rounded-full p-1 min-w-[24px]"
             onClick={() => setIsSidebarOpen(false)}
           >
             <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
           </div>
        </div>
        
        <div className="p-4 border-b border-gray-300 dark:border-[#2a2a2a]">
          <div className="flex justify-between text-xs mt-2">
             <div className="flex flex-col items-center">
                <span className="text-gray-500 dark:text-[#808080]">Max Loss</span>
                <span className="text-red-600 dark:text-red-500 font-bold">{selectedLegs.length ? (isCredit ? 'Unlimited' : (netCost).toFixed(2)) : '-'}</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-gray-500 dark:text-[#808080]">Break Even</span>
                <span className="text-gray-900 dark:text-white font-bold">-</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-gray-500 dark:text-[#808080]">Max Return</span>
                <span className="text-green-600 dark:text-green-500 font-bold text-lg leading-none">∞</span>
             </div>
          </div>
          {/* Payoff Graph */}
          {renderPayoffGraph()}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs mb-2 text-gray-500 dark:text-[#808080] font-semibold uppercase tracking-wider">Selected Legs</div>
          {selectedLegs.length === 0 ? (
             <div className="text-center text-gray-500 dark:text-gray-600 py-8 text-xs italic">
               Select Bid/Ask to add legs
             </div>
          ) : (
            selectedLegs.map(leg => (
               <div key={leg.id} className="bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#333] rounded p-2 mb-2 relative shadow-sm">
                 <X className="absolute top-2 right-2 w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => removeLeg(leg.id)} />
                 <div className="font-bold text-gray-900 dark:text-white pr-6">
                   <span className={leg.side === 'BUY' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}>{leg.side}</span> {leg.qty} {leg.expiration} {leg.strike} {leg.type}
                 </div>
                 <div className="flex justify-between items-center mt-3">
                   <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#111] rounded px-2 py-1">
                     <Minus className="w-3 h-3 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" onClick={() => updateLegQty(leg.id, -1)} />
                     <span className="w-4 text-center font-semibold">{leg.qty}</span>
                     <Plus className="w-3 h-3 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" onClick={() => updateLegQty(leg.id, 1)} />
                   </div>
                   <span className="text-gray-900 dark:text-white font-mono">@ {leg.price.toFixed(2)}</span>
                 </div>
               </div>
            ))
          )}

          {selectedLegs.length > 0 && (
             <div className="mt-4 pt-4 border-t border-gray-300 dark:border-[#333]">
                <div className="flex justify-between items-center font-bold text-gray-900 dark:text-white text-base">
                   <span>Net {isCredit ? 'Credit' : 'Debit'}:</span>
                   <span className={isCredit ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                     ${Math.abs(netCost).toFixed(2)}
                   </span>
                </div>
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-sm transition-colors shadow-sm"
                  onClick={() => { alert('Order submitted successfully (mock)'); setSelectedLegs([]); }}>
                  Submit Order
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

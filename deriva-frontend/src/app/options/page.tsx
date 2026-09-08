"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Minus, X, TrendingUp, TrendingDown, Settings } from "lucide-react";

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
      if (exists) return prev;
      return [...prev, { id, type, strike, expiration: expDate, side, price, qty: 1 }];
    });
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
    const moneyness = strike / underlyingPrice;
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

  return (
    <div className="flex h-screen bg-[#111111] text-[#b3b3b3] text-sm font-sans overflow-hidden">
      
      {/* Left Sidebar - Watchlist */}
      <div className="w-64 border-r border-[#2a2a2a] flex flex-col bg-[#161616]">
        <div className="flex items-center justify-between p-3 border-b border-[#2a2a2a] bg-[#1e1e1e]">
          <span className="font-semibold text-white">HauptWatchlist</span>
          <Settings className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
        <div className="flex items-center justify-between p-2 text-xs text-[#808080] border-b border-[#2a2a2a]">
          <span>Fin Instrument</span>
          <span>Last / Change %</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {watchlist.map(sym => (
            <div 
              key={sym} 
              className={`flex justify-between items-center p-2 cursor-pointer hover:bg-[#2a2a2a] ${selectedTicker === sym ? 'bg-[#2a2a2a] border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
              onClick={() => { setSelectedTicker(sym); setSelectedExpiry(null); }}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-[#e0e0e0]">{sym}</span>
                <span className="text-[10px] text-red-500 bg-[#331111] px-1 rounded w-max mt-0.5">NT</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white">{sym === selectedTicker ? underlyingPrice.toFixed(2) : (Math.random() * 500).toFixed(2)}</span>
                <span className={sym === selectedTicker ? (priceChange >= 0 ? "text-green-500" : "text-red-500") : "text-green-500"}>
                  {sym === selectedTicker ? `${priceChangePercent > 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%` : `+${(Math.random() * 5).toFixed(2)}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-2 bg-[#222222] rounded p-1">
            <Plus className="w-4 h-4 text-gray-500" />
            <input 
              className="bg-transparent border-none outline-none text-white w-full text-xs" 
              placeholder="Add Symbol"
              value={tickerInput}
              onChange={e => setTickerInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTickerToWatchlist()}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header / Tabs */}
        <div className="flex items-center gap-6 px-4 py-2 border-b border-[#2a2a2a] bg-[#1a1a1a] text-xs">
          <span className="cursor-pointer hover:text-white">Charts</span>
          <span className="cursor-pointer text-blue-400 border-b-2 border-blue-400 pb-1">Options</span>
          <span className="cursor-pointer hover:text-white">Connections</span>
          <span className="cursor-pointer hover:text-white">News</span>
          <span className="cursor-pointer hover:text-white">Fundamentals</span>
        </div>

        {/* Sub Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#2a2a2a]">
          <div className="flex items-center gap-4">
             <span className="text-white font-bold">{selectedTicker}</span>
             <span className="text-white">{underlyingPrice.toFixed(2)}</span>
             <span className={priceChange >= 0 ? "text-green-500" : "text-red-500"}>
               {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)} {priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
             </span>
          </div>
          <div className="flex gap-2">
            <select className="bg-[#2a2a2a] text-white border border-[#333] rounded px-2 py-1 text-xs outline-none">
              <option>Calls/Puts</option>
            </select>
            <select className="bg-[#2a2a2a] text-white border border-[#333] rounded px-2 py-1 text-xs outline-none">
              <option>40 Strikes</option>
            </select>
            <div className="flex border border-[#333] rounded overflow-hidden">
               {expirations.slice(0, 3).map(exp => (
                 <button 
                   key={exp.ts}
                   onClick={() => setSelectedExpiry(exp.ts)}
                   className={`px-3 py-1 text-xs ${selectedExpiry === exp.ts ? 'bg-[#333333] text-white' : 'bg-[#1a1a1a] hover:bg-[#222]'}`}
                 >
                   {exp.date}
                 </button>
               ))}
               <select 
                 className="bg-[#1a1a1a] text-white px-2 outline-none text-xs border-l border-[#333]"
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
        <div className="flex-1 overflow-auto bg-[#111]">
          {loading ? (
             <div className="flex items-center justify-center h-full text-[#666]">Loading options data...</div>
          ) : (
             <table className="w-full text-xs text-right border-collapse">
               <thead className="sticky top-0 z-10 bg-[#1e1e1e] text-[#808080]">
                 <tr>
                   <th colSpan={8} className="py-2 border-b border-r border-[#2a2a2a] text-center bg-[#181818]">
                     <div className="flex justify-between px-2">
                       <span></span>
                       <span>Calls</span>
                       <span></span>
                     </div>
                   </th>
                   <th className="py-2 border-b border-r border-[#2a2a2a] bg-[#111] text-center px-4">Strike</th>
                   <th colSpan={7} className="py-2 border-b border-[#2a2a2a] text-center bg-[#181818]">
                     <div className="flex justify-between px-2">
                       <span></span>
                       <span>Puts</span>
                       <span></span>
                     </div>
                   </th>
                 </tr>
                 <tr className="border-b border-[#2a2a2a] bg-[#161616]">
                   {/* Calls */}
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Bid</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Ask</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Change %</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Delta</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Gamma</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Theta</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Vega</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a] text-white font-bold">IV</th>
                   {/* Center */}
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a] bg-[#111]"></th>
                   {/* Puts */}
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Bid</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Ask</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Change %</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Delta</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Gamma</th>
                   <th className="font-normal py-1 px-2 border-r border-[#2a2a2a]">Theta</th>
                   <th className="font-normal py-1 px-2">Vega</th>
                 </tr>
               </thead>
               <tbody>
                 {strikes.map((strike, idx) => {
                   const call = calls.find(c => c.strike === strike);
                   const put = puts.find(p => p.strike === strike);
                   const isCallITM = strike < underlyingPrice;
                   const isPutITM = strike > underlyingPrice;
                   
                   return (
                     <tr key={strike} className="border-b border-[#222] hover:bg-[#1f1f1f] group cursor-pointer">
                       {/* CALLS */}
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isCallITM ? 'bg-[#151a1f]' : ''}`} onClick={() => handleLegClick("CALL", strike, "SELL", call?.bid)}>
                         <span className="text-blue-400 hover:bg-blue-900/30 px-1 rounded">{call?.bid?.toFixed(2) || '-'}</span>
                       </td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isCallITM ? 'bg-[#151a1f]' : ''}`} onClick={() => handleLegClick("CALL", strike, "BUY", call?.ask)}>
                         <span className="text-red-400 hover:bg-red-900/30 px-1 rounded">{call?.ask?.toFixed(2) || '-'}</span>
                       </td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isCallITM ? 'bg-[#151a1f]' : ''}`}>{renderMockGreek('change', strike, true)}</td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isCallITM ? 'bg-[#151a1f]' : ''}`}>{renderMockGreek('delta', strike, true)}</td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isCallITM ? 'bg-[#151a1f]' : ''}`}>{renderMockGreek('gamma', strike, true)}</td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isCallITM ? 'bg-[#151a1f]' : ''}`}>{renderMockGreek('theta', strike, true)}</td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isCallITM ? 'bg-[#151a1f]' : ''}`}>{renderMockGreek('vega', strike, true)}</td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] font-bold text-white ${isCallITM ? 'bg-[#151a1f]' : ''}`}>
                         {call?.impliedVolatility ? (call.impliedVolatility * 100).toFixed(1) + '%' : '-'}
                       </td>
                       
                       {/* STRIKE */}
                       <td className="py-1 px-2 border-r border-[#2a2a2a] bg-[#1a1a1a] text-center text-[#e0e0e0] group-hover:bg-[#333] transition-colors relative">
                          {Math.abs(strike - underlyingPrice) < 0.5 && <div className="absolute left-0 top-1/2 w-full h-[1px] bg-gray-500 z-0"></div>}
                          <span className="relative z-10 bg-[#1a1a1a] group-hover:bg-[#333] px-1">{strike.toFixed(1)}</span>
                       </td>
                       
                       {/* PUTS */}
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isPutITM ? 'bg-[#151a1f]' : ''}`} onClick={() => handleLegClick("PUT", strike, "SELL", put?.bid)}>
                         <span className="text-blue-400 hover:bg-blue-900/30 px-1 rounded">{put?.bid?.toFixed(2) || '-'}</span>
                       </td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isPutITM ? 'bg-[#151a1f]' : ''}`} onClick={() => handleLegClick("PUT", strike, "BUY", put?.ask)}>
                         <span className="text-red-400 hover:bg-red-900/30 px-1 rounded">{put?.ask?.toFixed(2) || '-'}</span>
                       </td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isPutITM ? 'bg-[#151a1f]' : ''}`}>{renderMockGreek('change', strike, false)}</td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isPutITM ? 'bg-[#151a1f]' : ''}`}>{renderMockGreek('delta', strike, false)}</td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isPutITM ? 'bg-[#151a1f]' : ''}`}>{renderMockGreek('gamma', strike, false)}</td>
                       <td className={`py-1 px-2 border-r border-[#2a2a2a] ${isPutITM ? 'bg-[#151a1f]' : ''}`}>{renderMockGreek('theta', strike, false)}</td>
                       <td className={`py-1 px-2 ${isPutITM ? 'bg-[#151a1f]' : ''}`}>{renderMockGreek('vega', strike, false)}</td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
          )}
        </div>
      </div>

      {/* Right Sidebar - Strategy Profile */}
      <div className="w-80 border-l border-[#2a2a2a] bg-[#161616] flex flex-col">
        <div className="p-4 border-b border-[#2a2a2a]">
          <h3 className="text-white font-bold mb-2">Performance Profile</h3>
          <div className="flex justify-between text-xs mt-4">
             <div className="flex flex-col items-center">
                <span className="text-[#808080]">Max Loss</span>
                <span className="text-red-500 font-bold">{selectedLegs.length ? (isCredit ? 'Unlimited' : (netCost).toFixed(2)) : '-'}</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-[#808080]">Break Even</span>
                <span className="text-white font-bold">-</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-[#808080]">Max Return</span>
                <span className="text-green-500 font-bold text-lg">∞</span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs mb-2 text-[#808080]">Selected Legs</div>
          {selectedLegs.map(leg => (
             <div key={leg.id} className="bg-[#1e1e1e] border border-[#333] rounded p-2 mb-2 relative">
               <X className="absolute top-2 right-2 w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeLeg(leg.id)} />
               <div className="font-semibold text-white">
                 <span className={leg.side === 'BUY' ? 'text-blue-400' : 'text-red-400'}>{leg.side}</span> {leg.qty} {leg.expiration} {leg.strike} {leg.type}
               </div>
               <div className="flex justify-between items-center mt-2">
                 <div className="flex items-center gap-2 bg-[#111] rounded px-1">
                   <Minus className="w-3 h-3 cursor-pointer" onClick={() => updateLegQty(leg.id, -1)} />
                   <span className="w-4 text-center">{leg.qty}</span>
                   <Plus className="w-3 h-3 cursor-pointer" onClick={() => updateLegQty(leg.id, 1)} />
                 </div>
                 <span className="text-white">@ {leg.price.toFixed(2)}</span>
               </div>
             </div>
          ))}

          {selectedLegs.length > 0 && (
             <div className="mt-4 pt-4 border-t border-[#333]">
                <div className="flex justify-between items-center font-bold text-white">
                   <span>Net {isCredit ? 'Credit' : 'Debit'}:</span>
                   <span className={isCredit ? 'text-green-500' : 'text-red-500'}>
                     ${Math.abs(netCost).toFixed(2)}
                   </span>
                </div>
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-sm transition-colors"
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

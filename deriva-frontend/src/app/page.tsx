"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Clock, Layers } from "lucide-react";

export default function Dashboard() {
  const [netLiq, setNetLiq] = useState(150000.00);
  const [dayPnL, setDayPnL] = useState(1250.50);
  const [buyingPower, setBuyingPower] = useState(50000.00);
  const [marginUsage, setMarginUsage] = useState(100000.00);
  
  const [watchlist, setWatchlist] = useState([
    { symbol: "AAPL", price: 150.25, change: 1.5 },
    { symbol: "TSLA", price: 250.10, change: -2.1 },
    { symbol: "MSFT", price: 310.40, change: 0.8 },
  ]);

  const [recentTrades, setRecentTrades] = useState([
    { id: 1, symbol: "AAPL", side: "BUY", qty: 100, price: 149.50, time: "10:30 AM" },
    { id: 2, symbol: "TSLA", side: "SELL", qty: 50, price: 252.00, time: "11:15 AM" },
  ]);

  const [openOrders, setOpenOrders] = useState([
    { id: 1, symbol: "MSFT", side: "BUY", type: "LMT", qty: 200, price: 305.00, status: "WORKING" },
  ]);

  const [greeks, setGreeks] = useState({ delta: 150.5, gamma: -25.4, theta: -10.2, vega: 40.1 });
  const [riskAlerts, setRiskAlerts] = useState(["Margin utilization approaching 80%", "High volatility in TSLA position"]);

  useEffect(() => {
    let stompClient: any;
    const connectWebSocket = async () => {
      const { Client } = await import('@stomp/stompjs');
      stompClient = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        reconnectDelay: 5000,
        onConnect: () => {
          stompClient.subscribe('/topic/market-data', (message: any) => {
             const data = JSON.parse(message.body);
             // In a real app we'd map this, for now just update watchlist randomly to show life
             setWatchlist((prev) => 
               prev.map(item => ({ ...item, price: item.price + (Math.random() - 0.5) }))
             );
          });
          
          stompClient.subscribe('/topic/portfolio', (message: any) => {
             const data = JSON.parse(message.body);
             if (data.netLiquidation) setNetLiq(data.netLiquidation);
             if (data.dayPnL) setDayPnL(data.dayPnL);
          });
        }
      });
      stompClient.activate();
    };
    
    connectWebSocket();
    
    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 bg-[#121212] min-h-screen text-white">
      <h1 className="text-3xl font-bold tracking-tight text-white">Portfolio Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#b3b3b3]">Net Liquidation</CardTitle>
            <DollarSign className="h-4 w-4 text-[#888]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${netLiq.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-[#888]">+2.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#b3b3b3]">Day P/L</CardTitle>
            {dayPnL >= 0 ? <TrendingUp className="h-4 w-4 text-[#00ff00]" /> : <TrendingDown className="h-4 w-4 text-[#ff4444]" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dayPnL >= 0 ? 'text-[#00ff00]' : 'text-[#ff4444]'}`}>
              ${dayPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#b3b3b3]">Buying Power</CardTitle>
            <Activity className="h-4 w-4 text-[#888]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#b3b3b3]">Margin Usage</CardTitle>
            <Layers className="h-4 w-4 text-[#888]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${marginUsage.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader>
            <CardTitle>P/L Chart</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] w-full flex items-center justify-center bg-[#111] rounded-md border border-[#2a2a2a] border-dashed">
              <span className="text-[#888] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> [P/L Chart Visualization Area]
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader>
            <CardTitle>Portfolio Greeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-4 bg-[#111] border border-[#2a2a2a] rounded-lg">
                <span className="text-sm text-[#b3b3b3] font-semibold">Delta (Δ)</span>
                <span className="text-xl font-bold text-white">{greeks.delta}</span>
              </div>
              <div className="flex flex-col p-4 bg-[#111] border border-[#2a2a2a] rounded-lg">
                <span className="text-sm text-[#b3b3b3] font-semibold">Gamma (Γ)</span>
                <span className="text-xl font-bold text-white">{greeks.gamma}</span>
              </div>
              <div className="flex flex-col p-4 bg-[#111] border border-[#2a2a2a] rounded-lg">
                <span className="text-sm text-[#b3b3b3] font-semibold">Theta (Θ)</span>
                <span className="text-xl font-bold text-white">{greeks.theta}</span>
              </div>
              <div className="flex flex-col p-4 bg-[#111] border border-[#2a2a2a] rounded-lg">
                <span className="text-sm text-[#b3b3b3] font-semibold">Vega (ν)</span>
                <span className="text-xl font-bold text-white">{greeks.vega}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader>
            <CardTitle>Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a2a2a] hover:bg-[#222]">
                  <TableHead className="text-[#b3b3b3]">Symbol</TableHead>
                  <TableHead className="text-right text-[#b3b3b3]">Price</TableHead>
                  <TableHead className="text-right text-[#b3b3b3]">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((sym) => {
                  const data = watchlistData[sym] || { price: 0, change: 0, changePercent: 0 };
                  return (
                    <TableRow key={sym} className="border-[#2a2a2a] hover:bg-[#222]">
                      <TableCell className="font-medium text-white">{sym}</TableCell>
                      <TableCell className="text-right text-white">
                        {data.price ? `$${data.price.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className={`text-right ${data.change >= 0 ? 'text-[#00ff00]' : 'text-[#ff4444]'}`}>
                        {data.change > 0 ? "+" : ""}{data.change.toFixed(2)} ({data.changePercent > 0 ? "+" : ""}{data.changePercent.toFixed(2)}%)
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-2 bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="mb-4">
               <h3 className="text-sm font-semibold text-[#b3b3b3] mb-2 flex items-center gap-2">
                 <Clock className="w-4 h-4" /> Open Orders
               </h3>
               <Table>
                 <TableHeader>
                   <TableRow className="border-[#2a2a2a] hover:bg-[#222]">
                     <TableHead className="text-[#b3b3b3]">Symbol</TableHead>
                     <TableHead className="text-[#b3b3b3]">Side</TableHead>
                     <TableHead className="text-[#b3b3b3]">Qty</TableHead>
                     <TableHead className="text-[#b3b3b3]">Status</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {openOrders.map(o => (
                     <TableRow key={o.id} className="border-[#2a2a2a] hover:bg-[#222]">
                       <TableCell className="text-white">{o.symbol}</TableCell>
                       <TableCell className={o.side === 'BUY' ? 'text-[#3399ff]' : 'text-[#ff4444]'}>{o.side}</TableCell>
                       <TableCell className="text-white">{o.qty}</TableCell>
                       <TableCell className="text-[#888]">{o.status}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
             <div>
               <h3 className="text-sm font-semibold text-[#b3b3b3] mb-2 flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Recent Trades
               </h3>
               <Table>
                 <TableHeader>
                   <TableRow className="border-[#2a2a2a] hover:bg-[#222]">
                     <TableHead className="text-[#b3b3b3]">Symbol</TableHead>
                     <TableHead className="text-[#b3b3b3]">Side</TableHead>
                     <TableHead className="text-[#b3b3b3]">Price</TableHead>
                     <TableHead className="text-[#b3b3b3]">Time</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {recentTrades.map(t => (
                     <TableRow key={t.id} className="border-[#2a2a2a] hover:bg-[#222]">
                       <TableCell className="text-white">{t.symbol}</TableCell>
                       <TableCell className={t.side === 'BUY' ? 'text-[#3399ff]' : 'text-[#ff4444]'}>{t.side}</TableCell>
                       <TableCell className="text-white">${t.price.toFixed(2)}</TableCell>
                       <TableCell className="text-[#888]">{t.time}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
          </CardContent>
        </Card>
      </div>

      {riskAlerts.length > 0 && (
        <Card className="bg-[#2a1111] border-[#ff4444] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#ff4444] flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" /> Active Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-[#ff8888]">
              {riskAlerts.map((alert, idx) => (
                <li key={idx}>{alert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

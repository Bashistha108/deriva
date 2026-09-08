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

  // Step 10: WebSocket Connection Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist((prev) => 
        prev.map(item => ({ ...item, price: item.price + (Math.random() - 0.5) }))
      );
      setDayPnL(prev => prev + (Math.random() * 10 - 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold tracking-tight">Portfolio Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Step 1: Portfolio Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Liquidation</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${netLiq.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day P/L</CardTitle>
            {dayPnL >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dayPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${dayPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Buying Power Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buying Power</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        {/* Step 5: Margin Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Usage</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${marginUsage.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Step 2: P/L Chart (Placeholder) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>P/L Chart</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] w-full flex items-center justify-center bg-gray-100 rounded-md border border-dashed">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> [P/L Chart Visualization Area]
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Portfolio Greeks */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Portfolio Greeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500 font-semibold">Delta (Δ)</span>
                <span className="text-xl font-bold">{greeks.delta}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500 font-semibold">Gamma (Γ)</span>
                <span className="text-xl font-bold">{greeks.gamma}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500 font-semibold">Theta (Θ)</span>
                <span className="text-xl font-bold">{greeks.theta}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500 font-semibold">Vega (ν)</span>
                <span className="text-xl font-bold">{greeks.vega}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Step 6: Watchlist */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell className="font-medium">{item.symbol}</TableCell>
                    <TableCell className={`text-right ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${item.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Step 7 & 8: Recent Trades & Open Orders */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="mb-4">
               <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                 <Clock className="w-4 h-4" /> Open Orders
               </h3>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Symbol</TableHead>
                     <TableHead>Side</TableHead>
                     <TableHead>Qty</TableHead>
                     <TableHead>Status</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {openOrders.map(o => (
                     <TableRow key={o.id}>
                       <TableCell>{o.symbol}</TableCell>
                       <TableCell className={o.side === 'BUY' ? 'text-blue-600' : 'text-red-600'}>{o.side}</TableCell>
                       <TableCell>{o.qty}</TableCell>
                       <TableCell>{o.status}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
             <div>
               <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Recent Trades
               </h3>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Symbol</TableHead>
                     <TableHead>Side</TableHead>
                     <TableHead>Price</TableHead>
                     <TableHead>Time</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {recentTrades.map(t => (
                     <TableRow key={t.id}>
                       <TableCell>{t.symbol}</TableCell>
                       <TableCell className={t.side === 'BUY' ? 'text-blue-600' : 'text-red-600'}>{t.side}</TableCell>
                       <TableCell>${t.price.toFixed(2)}</TableCell>
                       <TableCell>{t.time}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 9: Risk Alerts */}
      {riskAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-800 flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" /> Active Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-red-700">
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

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function Trades() {
  const [activeTab, setActiveTab] = useState("ALL"); // OPEN, PENDING, FILLED, CLOSED, ALL
  
  const trades = [
    { id: "T1", symbol: "AAPL", strategy: "Iron Condor", side: "SELL", qty: 10, price: 1.50, status: "FILLED", pnl: 250.00, returnPct: 15.5, holdPeriod: "2 Days", fees: 2.60 },
    { id: "T2", symbol: "TSLA", strategy: "Call Calendar", side: "BUY", qty: 5, price: 3.20, status: "OPEN", pnl: -15.00, returnPct: -2.1, holdPeriod: "5 Days", fees: 1.30 },
    { id: "T3", symbol: "MSFT", strategy: "Single Leg Put", side: "BUY", qty: 20, price: 0.85, status: "CLOSED", pnl: -1700.00, returnPct: -100.0, holdPeriod: "14 Days", fees: 13.00 },
    { id: "T4", symbol: "SPY", strategy: "Vertical Spread", side: "SELL", qty: 50, price: 2.10, status: "PENDING", pnl: 0, returnPct: 0, holdPeriod: "0 Days", fees: 0 },
  ];

  const filtered = activeTab === "ALL" ? trades : trades.filter(t => t.status === activeTab);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Trades & Analytics</h1>

      {/* Step 14: Performance Analytics */}
      <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle></CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600">65.4%</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Profit Factor</CardTitle></CardHeader>
           <CardContent><div className="text-2xl font-bold">1.85</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">YTD Commisions</CardTitle></CardHeader>
           <CardContent><div className="text-2xl font-bold text-red-600">$145.20</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Hold Time</CardTitle></CardHeader>
           <CardContent><div className="text-2xl font-bold">8.5 Days</div></CardContent>
         </Card>
      </div>

      {/* Tabs (Steps 2-6) */}
      <div className="flex gap-2 border-b pb-2">
        {["ALL", "OPEN", "PENDING", "FILLED", "CLOSED"].map(tab => (
          <Button 
            key={tab} 
            variant={activeTab === tab ? "default" : "ghost"} 
            onClick={() => setActiveTab(tab)}
            className="font-semibold"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Table (Steps 7-13) */}
      <Card>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">P/L</TableHead>
              <TableHead className="text-right">Return %</TableHead>
              <TableHead className="text-right">Hold Time</TableHead>
              <TableHead className="text-right">Fees</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-bold">{t.symbol}</TableCell>
                <TableCell>{t.strategy}</TableCell>
                <TableCell className={t.side === 'BUY' ? 'text-blue-600 font-bold' : 'text-red-600 font-bold'}>{t.side}</TableCell>
                <TableCell>{t.qty}</TableCell>
                <TableCell>${t.price.toFixed(2)}</TableCell>
                <TableCell>
                   <span className="px-2 py-1 text-xs rounded-full bg-slate-100 font-semibold">{t.status}</span>
                </TableCell>
                <TableCell className={`text-right font-bold ${t.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${t.pnl.toFixed(2)}
                </TableCell>
                <TableCell className={`text-right font-bold ${t.returnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {t.returnPct}%
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{t.holdPeriod}</TableCell>
                <TableCell className="text-right text-muted-foreground">${t.fees.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

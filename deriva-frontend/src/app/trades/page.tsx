"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";

export default function Trades() {
  const trades = [
    { id: "T1", time: "09:30:05", symbol: "AAPL", type: "Option", side: "SELL", qty: 10, price: 1.50, commission: 2.60, netAmount: 1500.00, realizedPnL: 250.00 },
    { id: "T2", time: "10:15:20", symbol: "TSLA", type: "Option", side: "BUY", qty: 5, price: 3.20, commission: 1.30, netAmount: 1600.00, realizedPnL: -15.00 },
    { id: "T3", time: "11:05:12", symbol: "MSFT", type: "Stock", side: "BUY", qty: 20, price: 0.85, commission: 13.00, netAmount: 17.00, realizedPnL: -170.00 },
    { id: "T4", time: "14:20:45", symbol: "SPY", type: "Option", side: "SELL", qty: 50, price: 2.10, commission: 0.00, netAmount: 10500.00, realizedPnL: 0 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-[#121212] min-h-screen text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Trades Ledger</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#2a2a2a] bg-[#1e1e1e] text-white hover:bg-[#2a2a2a] hover:text-white"><Filter className="w-4 h-4 mr-2"/> Filter</Button>
          <Button variant="outline" className="border-[#2a2a2a] bg-[#1e1e1e] text-white hover:bg-[#2a2a2a] hover:text-white"><Download className="w-4 h-4 mr-2"/> Export</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm text-[#b3b3b3]">Total Trades (YTD)</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-white">1,245</p></CardContent>
        </Card>
        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm text-[#b3b3b3]">Win Rate</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-[#00ff00]">68.5%</p></CardContent>
        </Card>
        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm text-[#b3b3b3]">Total Commissions</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-[#ff4444]">$845.50</p></CardContent>
        </Card>
        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm text-[#b3b3b3]">Realized P/L</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-[#00ff00]">+$12,450.00</p></CardContent>
        </Card>
      </div>

      <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a2a] hover:bg-[#222]">
                <TableHead className="text-[#b3b3b3]">Time</TableHead>
                <TableHead className="text-[#b3b3b3]">Symbol</TableHead>
                <TableHead className="text-[#b3b3b3]">Type</TableHead>
                <TableHead className="text-[#b3b3b3]">Side</TableHead>
                <TableHead className="text-right text-[#b3b3b3]">Qty</TableHead>
                <TableHead className="text-right text-[#b3b3b3]">Price</TableHead>
                <TableHead className="text-right text-[#b3b3b3]">Commission</TableHead>
                <TableHead className="text-right text-[#b3b3b3]">Net Amount</TableHead>
                <TableHead className="text-right text-[#b3b3b3]">Realized P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map(t => (
                <TableRow key={t.id} className="border-[#2a2a2a] hover:bg-[#222]">
                  <TableCell className="text-white">{t.time}</TableCell>
                  <TableCell className="font-semibold text-white">{t.symbol}</TableCell>
                  <TableCell className="text-[#888]">{t.type}</TableCell>
                  <TableCell className={t.side === 'BUY' ? 'text-[#3399ff]' : 'text-[#ff4444]'}>{t.side}</TableCell>
                  <TableCell className="text-right text-white">{t.qty}</TableCell>
                  <TableCell className="text-right text-white">${t.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-[#ff4444]">${t.commission.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-white font-mono">
                    {t.side === 'BUY' ? '-' : '+'}${Math.abs(t.netAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${t.realizedPnL > 0 ? 'text-[#00ff00]' : t.realizedPnL < 0 ? 'text-[#ff4444]' : 'text-[#888]'}`}>
                    {t.realizedPnL === 0 ? '-' : t.realizedPnL > 0 ? `+$${t.realizedPnL.toFixed(2)}` : `-$${Math.abs(t.realizedPnL).toFixed(2)}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

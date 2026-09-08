"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Search, Plus, Minus, X, BarChart } from "lucide-react";

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
  // State for order panel
  const [selectedLegs, setSelectedLegs] = useState<Leg[]>([]);
  const [underlyingPrice] = useState(150.25);

  // Mock Option Data
  const strikes = [140, 145, 150, 155, 160];
  const expirations = ["2026-10-16", "2026-11-20"];
  const [selectedExpiry, setSelectedExpiry] = useState(expirations[0]);

  const handleLegClick = (type: "CALL" | "PUT", strike: number, side: "BUY" | "SELL", price: number) => {
    const id = `${type}-${strike}-${side}`;
    setSelectedLegs(prev => {
      const exists = prev.find(l => l.id === id);
      if (exists) return prev;
      return [...prev, { id, type, strike, expiration: selectedExpiry, side, price, qty: 1 }];
    });
  };

  const updateLegQty = (id: string, delta: number) => {
    setSelectedLegs(prev => prev.map(l => l.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l));
  };

  const removeLeg = (id: string) => {
    setSelectedLegs(prev => prev.filter(l => l.id !== id));
  };

  // Step 15: Net debit/credit
  const netCost = selectedLegs.reduce((acc, leg) => acc + (leg.side === "BUY" ? leg.price * leg.qty : -leg.price * leg.qty), 0);
  const isCredit = netCost < 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Step 1: Watchlist on the left */}
      <div className="w-64 border-r bg-gray-50 p-4 flex flex-col gap-4 overflow-y-auto">
        <h2 className="font-bold text-lg flex items-center gap-2"><Search className="w-4 h-4" /> Watchlist</h2>
        {["AAPL", "TSLA", "MSFT", "SPY"].map(sym => (
          <div key={sym} className="flex justify-between items-center p-2 hover:bg-gray-200 rounded cursor-pointer">
            <span className="font-semibold">{sym}</span>
            <span className="text-sm text-gray-500">$150.00</span>
          </div>
        ))}
      </div>

      {/* Main Center Area: Options Chain */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Step 2 & 3: Underlying Header & Price Info */}
        <div className="border-b p-6 bg-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">AAPL <span className="text-xl text-gray-500 font-normal">Apple Inc.</span></h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold">${underlyingPrice.toFixed(2)}</span>
              <span className="text-green-600 font-semibold flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> +1.25 (0.8%)</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">IV Rank</div>
              <div className="font-bold text-lg">45.2%</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Volume</div>
              <div className="font-bold text-lg">12.5M</div>
            </div>
          </div>
        </div>

        {/* Step 4: Expiration Blocks */}
        <div className="p-4 bg-gray-50 border-b flex gap-2">
          {expirations.map(exp => (
            <Button 
              key={exp} 
              variant={selectedExpiry === exp ? "default" : "outline"}
              onClick={() => setSelectedExpiry(exp)}
            >
              {exp}
            </Button>
          ))}
        </div>

        {/* Step 5 - 10: Calls, Strikes, Puts Table */}
        <div className="flex-1 overflow-auto p-4">
          <Table className="border">
            <TableHeader className="bg-gray-100 sticky top-0 z-10">
              <TableRow>
                <TableHead colSpan={4} className="text-center border-r bg-blue-50 text-blue-900 font-bold">CALLS</TableHead>
                <TableHead className="text-center font-bold bg-gray-200 border-r w-24">STRIKE</TableHead>
                <TableHead colSpan={4} className="text-center bg-purple-50 text-purple-900 font-bold">PUTS</TableHead>
              </TableRow>
              <TableRow className="text-xs">
                {/* Calls Header */}
                <TableHead className="text-right">IV/Vol</TableHead>
                <TableHead className="text-right">Δ / Γ</TableHead>
                <TableHead className="text-right">Bid</TableHead>
                <TableHead className="text-right border-r">Ask</TableHead>
                {/* Strike */}
                <TableHead className="text-center border-r"></TableHead>
                {/* Puts Header */}
                <TableHead className="text-left">Bid</TableHead>
                <TableHead className="text-left">Ask</TableHead>
                <TableHead className="text-left">Δ / Γ</TableHead>
                <TableHead className="text-left">IV/Vol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strikes.map(strike => (
                <TableRow key={strike} className="hover:bg-gray-50">
                  {/* Call Data (Step 8) */}
                  <TableCell className="text-right text-gray-500 text-xs">35% / 1.2K</TableCell>
                  <TableCell className="text-right text-gray-500 text-xs">0.45 / 0.02</TableCell>
                  {/* Step 9 & 10: Clickable Bid/Ask */}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-600 font-mono w-full justify-end" onClick={() => handleLegClick("CALL", strike, "SELL", 3.20)}>3.20</Button>
                  </TableCell>
                  <TableCell className="text-right border-r">
                     <Button variant="ghost" size="sm" className="text-blue-600 font-mono w-full justify-end" onClick={() => handleLegClick("CALL", strike, "BUY", 3.30)}>3.30</Button>
                  </TableCell>

                  {/* Step 6: Strike */}
                  <TableCell className="text-center font-bold bg-gray-100 border-r">
                    {strike}
                  </TableCell>

                  {/* Put Data */}
                  <TableCell className="text-left">
                    <Button variant="ghost" size="sm" className="text-red-600 font-mono w-full justify-start" onClick={() => handleLegClick("PUT", strike, "SELL", 2.80)}>2.80</Button>
                  </TableCell>
                  <TableCell className="text-left">
                    <Button variant="ghost" size="sm" className="text-blue-600 font-mono w-full justify-start" onClick={() => handleLegClick("PUT", strike, "BUY", 2.90)}>2.90</Button>
                  </TableCell>
                  <TableCell className="text-left text-gray-500 text-xs">-0.35 / 0.02</TableCell>
                  <TableCell className="text-left text-gray-500 text-xs">38% / 800</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Step 11: Order/Position Panel on the right */}
      <div className="w-96 border-l bg-white flex flex-col">
        <div className="p-4 border-b bg-gray-900 text-white font-bold">Strategy Builder</div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Step 12: Selected Legs */}
          {selectedLegs.length === 0 ? (
             <div className="text-center text-gray-500 py-10">Click a Bid/Ask to add legs</div>
          ) : (
             <div className="flex flex-col gap-2">
               {selectedLegs.map(leg => (
                 <Card key={leg.id} className="p-3 flex flex-col gap-2 relative">
                   <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-gray-400" onClick={() => removeLeg(leg.id)}>
                     <X className="w-4 h-4" />
                   </Button>
                   <div className="font-bold">
                     <span className={leg.side === 'BUY' ? 'text-blue-600' : 'text-red-600'}>{leg.side}</span> {leg.qty} {leg.expiration} {leg.strike} {leg.type}
                   </div>
                   <div className="flex justify-between items-center mt-2">
                     {/* Step 13: Quantity controls */}
                     <div className="flex items-center gap-2">
                       <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateLegQty(leg.id, -1)}><Minus className="w-3 h-3"/></Button>
                       <span className="w-6 text-center font-mono">{leg.qty}</span>
                       <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateLegQty(leg.id, 1)}><Plus className="w-3 h-3"/></Button>
                     </div>
                     {/* Step 14: Price controls */}
                     <Input className="w-20 h-8 text-right font-mono" defaultValue={leg.price.toFixed(2)} />
                   </div>
                 </Card>
               ))}
             </div>
          )}
        </div>

        {selectedLegs.length > 0 && (
          <div className="p-4 border-t bg-gray-50 flex flex-col gap-4">
            {/* Step 15: Net debit/credit */}
            <div className="flex justify-between items-center text-xl font-bold">
               <span>Net {isCredit ? 'Credit' : 'Debit'}</span>
               <span className={isCredit ? 'text-green-600' : 'text-red-600'}>${Math.abs(netCost).toFixed(2)}</span>
            </div>

            {/* Step 16 - 19: Greeks, Max Profit, Max Loss, Breakeven */}
            <div className="grid grid-cols-2 gap-2 text-sm border-t pt-4">
               <div className="flex justify-between"><span className="text-gray-500">Max Profit</span><span className="font-mono">$500.00</span></div>
               <div className="flex justify-between"><span className="text-gray-500">Max Loss</span><span className="font-mono text-red-600">Infinite</span></div>
               <div className="flex justify-between"><span className="text-gray-500">Breakeven</span><span className="font-mono">148.50</span></div>
               <div className="flex justify-between"><span className="text-gray-500">Net Delta</span><span className="font-mono">0.45</span></div>
            </div>

            {/* Step 20: Interactive P/L Chart */}
            <div className="h-32 bg-white border rounded flex items-center justify-center text-gray-400 mt-2">
               <BarChart className="w-6 h-6 mr-2"/> P/L Graph View
            </div>

            <Button className="w-full mt-2 font-bold" size="lg">Review Order</Button>
          </div>
        )}
      </div>
    </div>
  );
}

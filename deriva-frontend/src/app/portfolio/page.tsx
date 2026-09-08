"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Activity, Target, ShieldAlert } from "lucide-react";

export default function PortfolioAnalysis() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-[#121212] min-h-screen text-white">
      <h1 className="text-3xl font-bold tracking-tight text-white">Portfolio Risk Analysis</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#2a1111] border-[#ff4444] text-white">
          <CardHeader className="pb-2">
             <CardTitle className="text-[#ff4444] flex items-center text-sm"><ShieldAlert className="w-4 h-4 mr-2"/> High Concentration Risk</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-[#ff8888]">TSLA accounts for 45% of total portfolio Delta.</p></CardContent>
        </Card>
        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm text-[#b3b3b3] flex items-center"><Activity className="w-4 h-4 mr-2"/> Beta-Weighted Delta</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-white">+150.25</p></CardContent>
        </Card>
        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm text-[#b3b3b3] flex items-center"><Target className="w-4 h-4 mr-2"/> Margin/Equity Ratio</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-white">62.5%</p></CardContent>
        </Card>
      </div>

      <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
        <CardHeader><CardTitle>Aggregate Greeks Exposure</CardTitle></CardHeader>
        <CardContent>
           <div className="grid grid-cols-5 gap-4 text-center">
             <div className="p-4 bg-[#111] border border-[#2a2a2a] rounded-lg"><b className="text-[#b3b3b3]">Delta</b><br/><span className="text-white font-semibold">+150.25</span></div>
             <div className="p-4 bg-[#111] border border-[#2a2a2a] rounded-lg"><b className="text-[#b3b3b3]">Gamma</b><br/><span className="text-white font-semibold">-25.40</span></div>
             <div className="p-4 bg-[#111] border border-[#2a2a2a] rounded-lg"><b className="text-[#b3b3b3]">Theta</b><br/><span className="text-white font-semibold">-10.20</span></div>
             <div className="p-4 bg-[#111] border border-[#2a2a2a] rounded-lg"><b className="text-[#b3b3b3]">Vega</b><br/><span className="text-white font-semibold">+40.10</span></div>
             <div className="p-4 bg-[#111] border border-[#2a2a2a] rounded-lg"><b className="text-[#b3b3b3]">Rho</b><br/><span className="text-white font-semibold">+5.00</span></div>
           </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader><CardTitle>Concentration Analysis</CardTitle></CardHeader>
          <CardContent>
             <div className="h-48 flex items-center justify-center border border-[#2a2a2a] border-dashed rounded-md bg-[#111] text-[#888]">
               [Pie Chart: TSLA 45%, AAPL 30%, MSFT 25%]
             </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
          <CardHeader><CardTitle>Expected P/L Distribution</CardTitle></CardHeader>
          <CardContent>
             <div className="h-48 flex items-center justify-center border border-[#2a2a2a] border-dashed rounded-md bg-[#111] text-[#888]">
               [Bell Curve / Histogram Visualization]
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1e1e1e] border-[#2a2a2a] text-white">
        <CardHeader><CardTitle>Stress Testing Scenarios (Price & Volatility)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a2a] hover:bg-[#222]">
                <TableHead className="text-[#b3b3b3]">Scenario</TableHead>
                <TableHead className="text-right text-[#b3b3b3]">Est. P/L</TableHead>
                <TableHead className="text-right text-[#b3b3b3]">Margin Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-[#2a2a2a] hover:bg-[#222]">
                <TableCell className="text-white">SPY -5% / Volatility +20% (Crash)</TableCell>
                <TableCell className="text-right text-[#ff4444] font-bold">-$15,400.00</TableCell>
                <TableCell className="text-right text-[#ff4444]">+$25,000.00</TableCell>
              </TableRow>
              <TableRow className="border-[#2a2a2a] hover:bg-[#222]">
                <TableCell className="text-white">SPY +5% / Volatility -10% (Rally)</TableCell>
                <TableCell className="text-right text-[#00ff00] font-bold">+$5,200.00</TableCell>
                <TableCell className="text-right text-[#00ff00]">-$5,000.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4 h-32 flex items-center justify-center border border-[#2a2a2a] border-dashed rounded-md bg-[#111] text-[#888]">
             [Risk Heatmap Matrix]
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Activity, Target, ShieldAlert } from "lucide-react";

export default function PortfolioAnalysis() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Portfolio Risk Analysis</h1>
      
      {/* Step 2 & 12: Risk Summary & Alerts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
             <CardTitle className="text-red-800 flex items-center text-sm"><ShieldAlert className="w-4 h-4 mr-2"/> High Concentration Risk</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-red-700">TSLA accounts for 45% of total portfolio Delta.</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
             <CardTitle className="text-sm text-muted-foreground flex items-center"><Activity className="w-4 h-4 mr-2"/> Beta-Weighted Delta</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">+150.25</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
             <CardTitle className="text-sm text-muted-foreground flex items-center"><Target className="w-4 h-4 mr-2"/> Margin/Equity Ratio</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">62.5%</p></CardContent>
        </Card>
      </div>

      {/* Step 3: Greeks Dashboard */}
      <Card>
        <CardHeader><CardTitle>Aggregate Greeks Exposure</CardTitle></CardHeader>
        <CardContent>
           <div className="grid grid-cols-5 gap-4 text-center">
             <div className="p-4 bg-gray-50 rounded-lg"><b>Delta</b><br/>+150.25</div>
             <div className="p-4 bg-gray-50 rounded-lg"><b>Gamma</b><br/>-25.40</div>
             <div className="p-4 bg-gray-50 rounded-lg"><b>Theta</b><br/>-10.20</div>
             <div className="p-4 bg-gray-50 rounded-lg"><b>Vega</b><br/>+40.10</div>
             <div className="p-4 bg-gray-50 rounded-lg"><b>Rho</b><br/>+5.00</div>
           </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Step 4 & 5: Exposure & Concentration Analysis */}
        <Card>
          <CardHeader><CardTitle>Concentration Analysis</CardTitle></CardHeader>
          <CardContent>
             <div className="h-48 flex items-center justify-center border border-dashed rounded-md bg-slate-50 text-muted-foreground">
               [Pie Chart: TSLA 45%, AAPL 30%, MSFT 25%]
             </div>
          </CardContent>
        </Card>

        {/* Step 6: P/L Distribution */}
        <Card>
          <CardHeader><CardTitle>Expected P/L Distribution</CardTitle></CardHeader>
          <CardContent>
             <div className="h-48 flex items-center justify-center border border-dashed rounded-md bg-slate-50 text-muted-foreground">
               [Bell Curve / Histogram Visualization]
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 7, 8, 9, 10, 11: Stress Testing & Heatmap */}
      <Card>
        <CardHeader><CardTitle>Stress Testing Scenarios (Price & Volatility)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Scenario</TableHead>
                <TableHead className="text-right">Est. P/L</TableHead>
                <TableHead className="text-right">Margin Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>SPY -5% / Volatility +20% (Crash)</TableCell>
                <TableCell className="text-right text-red-600 font-bold">-$15,400.00</TableCell>
                <TableCell className="text-right text-red-600">+$25,000.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SPY +5% / Volatility -10% (Rally)</TableCell>
                <TableCell className="text-right text-green-600 font-bold">+$5,200.00</TableCell>
                <TableCell className="text-right text-green-600">-$5,000.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4 h-32 flex items-center justify-center border border-dashed rounded-md bg-slate-50 text-muted-foreground">
             [Risk Heatmap Matrix]
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

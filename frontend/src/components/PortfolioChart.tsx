import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function PortfolioChart({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        No historical data available.
      </div>
    );
  }

  const initialEquity = history[0]?.totalEquity || 0;

  const data = history.map(h => ({
    time: new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    equity: h.totalEquity,
    pctChange: initialEquity ? ((h.totalEquity - initialEquity) / initialEquity) * 100 : 0
  }));

  // Find min and max for y-axis domain
  const minEquity = Math.min(...data.map(d => d.equity));
  const maxEquity = Math.max(...data.map(d => d.equity));
  const padding = (maxEquity - minEquity) * 0.1 || 1000;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isPositive = dataPoint.pctChange >= 0;
      const color = isPositive ? 'var(--success)' : 'var(--danger)';
      
      return (
        <div style={{ backgroundColor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#888' }}>{label}</p>
          <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>
            ${dataPoint.equity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
          <p style={{ margin: 0, fontSize: '14px', color }}>
            {isPositive ? '+' : ''}{dataPoint.pctChange.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#666" 
            tick={{ fill: '#888', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            domain={[minEquity - padding, maxEquity + padding]} 
            stroke="#666" 
            tick={{ fill: '#888', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="equity" 
            stroke="var(--primary)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorEquity)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 className="heading-gradient" style={{ fontSize: '36px', marginBottom: '8px' }}>Trading Dashboard</h1>
      <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Welcome back. Market is currently open.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '18px', color: '#d1d5db', marginBottom: '8px' }}>Portfolio Value</h3>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>$10,420.50</div>
          <div style={{ color: 'var(--success)', marginTop: '8px', fontSize: '14px', fontWeight: 500 }}>+ $420.50 (4.2%) All time</div>
        </div>
        
        <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '18px', color: '#d1d5db', marginBottom: '8px' }}>Buying Power</h3>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>$8,150.00</div>
          <div style={{ color: '#9ca3af', marginTop: '8px', fontSize: '14px' }}>Available for trading</div>
        </div>
        
        <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '18px', color: '#d1d5db', marginBottom: '8px' }}>Active Positions</h3>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)' }}>4</div>
          <div style={{ color: 'var(--warning)', marginTop: '8px', fontSize: '14px' }}>2 expiring this week</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 70px)', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 24px',
      background: 'radial-gradient(circle at 50% 50%, #1a2235, var(--background))'
    }}>
      <h1 className="heading-gradient" style={{ fontSize: '64px', marginBottom: '24px', lineHeight: 1.1 }}>
        Master Options Trading
      </h1>
      <p style={{ fontSize: '20px', color: '#9ca3af', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.6 }}>
        Deriva is a simulated options market. Read the courses, track your learning, and trade synthetic options in a real-time reactive environment.
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <a href="/register" className="btn-primary" style={{ textDecoration: 'none' }}>
          Start Learning Free
        </a>
        <a href="/dashboard" style={{ 
          padding: '12px 24px', 
          border: '1px solid var(--border)', 
          borderRadius: '8px', 
          color: 'var(--foreground)', 
          textDecoration: 'none',
          fontWeight: 600
        }}>
          Explore Market
        </a>
      </div>
    </div>
  );
}

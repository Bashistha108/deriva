'use client';

const mockCourses = [
  { id: '1', title: 'Options Basics', description: 'Understand calls, puts, strikes, and expirations.', progress: 100 },
  { id: '2', title: 'The Greeks', description: 'Delta, Gamma, Theta, Vega, and Rho explained.', progress: 40 },
  { id: '3', title: 'Basic Strategies', description: 'Covered calls, cash-secured puts, and vertical spreads.', progress: 0 },
  { id: '4', title: 'Advanced Strategies', description: 'Iron condors, butterflies, and calendar spreads.', progress: 0 },
];

export default function LearningHub() {
  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 className="heading-gradient" style={{ fontSize: '36px', marginBottom: '8px' }}>Learning Hub</h1>
          <p style={{ color: '#9ca3af' }}>Master the theory before you trade.</p>
        </div>
        
        <div className="glass" style={{ padding: '16px 24px', borderRadius: '12px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Overall Progress</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)' }}>35%</div>
          </div>
          <div style={{ width: '150px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '35%', height: '100%', background: 'var(--primary)' }}></div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {mockCourses.map((course) => (
          <div key={course.id} className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>{course.title}</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px', flex: 1 }}>{course.description}</p>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Progress</span>
                <span style={{ fontWeight: 600, color: course.progress === 100 ? 'var(--success)' : 'var(--foreground)' }}>
                  {course.progress}%
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${course.progress}%`, 
                  height: '100%', 
                  background: course.progress === 100 ? 'var(--success)' : 'var(--primary)' 
                }}></div>
              </div>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', background: course.progress === 100 ? 'transparent' : undefined, border: course.progress === 100 ? '1px solid var(--border)' : undefined, color: course.progress === 100 ? 'var(--foreground)' : undefined }}>
              {course.progress === 100 ? 'Review Course' : course.progress > 0 ? 'Continue Learning' : 'Start Course'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

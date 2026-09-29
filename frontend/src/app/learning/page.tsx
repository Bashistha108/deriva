'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LearningHub() {
  const [courses, setCourses] = useState<any[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8080/api/learning/courses', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        let globalCompleted = 0;
        let globalTotal = 0;

        // Map backend courses to the UI format
        const formatted = data.map((c: any) => {
          let courseCompleted = 0;
          let courseTotal = 0;

          if (c.sections) {
            c.sections.forEach((s: any) => {
              if (s.lessons) courseTotal += s.lessons.length;
            });
          }

          if (courseTotal > 0) {
            try {
              const saved = localStorage.getItem(`course_progress_${c.id}`);
              if (saved) {
                const completed = JSON.parse(saved);
                if (Array.isArray(completed)) {
                  // Make sure we only count valid lessons
                  courseCompleted = completed.length;
                }
              }
            } catch (e) {}
          }

          globalTotal += courseTotal;
          globalCompleted += courseCompleted;

          const progress = courseTotal > 0 ? Math.round((courseCompleted / courseTotal) * 100) : 0;

          return {
            id: c.id,
            title: c.title,
            description: c.description,
            slug: c.slug,
            progress: Math.min(progress, 100)
          };
        });
        setCourses(formatted);
        setOverallProgress(globalTotal > 0 ? Math.round((globalCompleted / globalTotal) * 100) : 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load courses', err);
        setLoading(false);
      });
  }, []);
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
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)' }}>{overallProgress}%</div>
          </div>
          <div style={{ width: '150px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${overallProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading courses...</div>
      ) : courses.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No courses available yet. Check back soon!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {courses.map((course) => (
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
              
              <button 
                className="btn-primary" 
                onClick={() => router.push(`/learning/${course.id}`)}
                style={{ width: '100%', background: course.progress === 100 ? 'transparent' : undefined, border: course.progress === 100 ? '1px solid var(--border)' : undefined, color: course.progress === 100 ? 'var(--foreground)' : undefined }}>
                {course.progress === 100 ? 'Review Course' : course.progress > 0 ? 'Continue Learning' : 'Start Course'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

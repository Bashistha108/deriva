'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`course_progress_${courseId}`);
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved));
      } catch (e) {}
    }
  }, [courseId]);

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newCompleted = prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId];
      localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newCompleted));
      return newCompleted;
    });
  };

  useEffect(() => {
    fetch(`http://localhost:8080/api/learning/courses/${courseId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        setLoading(false);
        // Default to first lesson if available
        if (data.sections && data.sections.length > 0) {
          for (const section of data.sections) {
            if (section.lessons && section.lessons.length > 0) {
              setActiveLesson(section.lessons[0]);
              setActiveSection(section);
              break;
            }
          }
        }
      })
      .catch(err => {
        console.error('Failed to load course details', err);
        setLoading(false);
      });
  }, [courseId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(59, 130, 246, 0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!course) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Course not found.</div>;
  }

  // Find next and previous lessons for navigation
  let allLessons: { lesson: any, section: any }[] = [];
  if (course.sections) {
    course.sections.forEach((s: any) => {
      if (s.lessons) {
        s.lessons.forEach((l: any) => allLessons.push({ lesson: l, section: s }));
      }
    });
  }
  
  const currentIndex = allLessons.findIndex(l => l.lesson.id === activeLesson?.id);
  const prevLessonObj = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLessonObj = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const totalLessons = allLessons.length;
  const completedCount = completedLessons.length;
  const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  const navigateToLesson = (lesson: any, section: any) => {
    setActiveLesson(lesson);
    setActiveSection(section);
    // Scroll to top of content
    const contentArea = document.getElementById('main-content-scroll');
    if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 72px)', margin: '0', overflow: 'hidden' }}>
      {/* Sidebar Navigation */}
      <div className="glass" style={{ width: '340px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)', borderRadius: '0', background: 'rgba(0,0,0,0.3)', zIndex: 10 }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => router.push('/learning')} style={{ background: 'none', border: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', marginBottom: '20px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Hub
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', lineHeight: '1.4' }}>{course.title}</h2>
          <div style={{ marginTop: '16px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercentage}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', transition: 'width 0.3s ease' }}></div>
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', fontWeight: 500 }}>{progressPercentage}% Complete</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
          {course.sections?.map((section: any, index: number) => (
            <div key={section.id} style={{ marginBottom: '24px' }}>
              <div style={{ padding: '0 24px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#6b7280', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#3b82f6' }}>{String(index + 1).padStart(2, '0')}</span> 
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {section.lessons?.map((lesson: any, lIndex: number) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isCompleted = completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigateToLesson(lesson, section)}
                      style={{
                        textAlign: 'left',
                        padding: '14px 24px 14px 40px',
                        background: isActive ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
                        color: isActive ? '#60a5fa' : '#d1d5db',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: isActive ? 600 : 400,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseOver={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = 'white'; } }}
                      onMouseOut={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d1d5db'; } }}
                    >
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: isActive ? '2px solid #3b82f6' : (isCompleted ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.2)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isActive ? 'rgba(59, 130, 246, 0.2)' : (isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'transparent') }}>
                        {isCompleted && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                      </div>
                      <span style={{ lineHeight: '1.4' }}>{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div id="main-content-scroll" style={{ flex: 1, overflowY: 'auto', background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)', scrollBehavior: 'smooth' }}>
        {activeLesson ? (
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 40px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{course.title}</span>
              <span style={{ color: '#6b7280' }}>/</span>
              <span>{activeSection?.title}</span>
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'white', marginBottom: '48px', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
              {activeLesson.title}
            </h1>
            
            {/* The Rich Text Output */}
            <div 
              className="lesson-content"
              style={{ flex: 1, fontSize: '18px', lineHeight: '1.8', color: '#d1d5db' }}
              dangerouslySetInnerHTML={{ __html: activeLesson.content || '<p style="color: #6b7280; font-style: italic;">No content available for this lesson.</p>' }}
            />

            {/* Injected CSS for beautiful typography inside lesson content */}
            <style dangerouslySetInnerHTML={{__html: `
              .lesson-content h1, .lesson-content h2, .lesson-content h3 { color: white; font-weight: 700; margin-top: 2.5em; margin-bottom: 1em; line-height: 1.3; }
              .lesson-content h1 { font-size: 2.5em; letter-spacing: -0.5px; }
              .lesson-content h2 { font-size: 1.75em; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5em; letter-spacing: -0.3px; }
              .lesson-content h3 { font-size: 1.25em; color: #f3f4f6; }
              .lesson-content p { margin-bottom: 1.5em; font-size: 1.125rem; }
              .lesson-content ul, .lesson-content ol { margin-bottom: 1.5em; padding-left: 1.5em; font-size: 1.125rem; }
              .lesson-content li { margin-bottom: 0.5em; }
              .lesson-content li::marker { color: #60a5fa; }
              .lesson-content a { color: #60a5fa; text-decoration: none; border-bottom: 1px solid rgba(96, 165, 250, 0.3); transition: all 0.2s; font-weight: 500; }
              .lesson-content a:hover { border-color: #60a5fa; background: rgba(59, 130, 246, 0.1); }
              .lesson-content blockquote { border-left: 4px solid #3b82f6; margin-left: 0; color: #9ca3af; font-style: italic; background: rgba(59, 130, 246, 0.05); padding: 1.5em; border-radius: 0 12px 12px 0; margin-bottom: 1.5em; }
              .lesson-content blockquote p { margin-bottom: 0; }
              .lesson-content img { max-width: 100%; border-radius: 12px; margin: 2.5em 0; box-shadow: 0 12px 40px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); }
              .lesson-content table { width: 100%; border-collapse: collapse; margin-bottom: 2.5em; background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden; }
              .lesson-content th, .lesson-content td { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 16px; text-align: left; }
              .lesson-content th { background: rgba(0,0,0,0.3); color: white; font-weight: 600; }
              .lesson-content pre { background: rgba(0,0,0,0.4); padding: 20px; border-radius: 12px; overflow-x: auto; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1.5em; }
              .lesson-content code { font-family: monospace; font-size: 0.9em; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; color: #93c5fd; }
              .lesson-content pre code { background: transparent; padding: 0; color: #e5e7eb; }
              .lesson-content hr { border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 3em 0; }
            `}} />

            {/* Bottom Navigation */}
            <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                {prevLessonObj && (
                  <button 
                    onClick={() => navigateToLesson(prevLessonObj.lesson, prevLessonObj.section)}
                    style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left', padding: '16px', borderRadius: '12px', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Previous</span>
                    <span style={{ fontSize: '16px', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                      {prevLessonObj.lesson.title}
                    </span>
                  </button>
                )}
              </div>
              
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <button 
                  className={completedLessons.includes(activeLesson.id) ? "" : "btn-primary"} 
                  onClick={() => toggleLessonComplete(activeLesson.id)}
                  style={{ 
                    padding: '14px 32px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    boxShadow: completedLessons.includes(activeLesson.id) ? 'none' : '0 8px 24px rgba(59, 130, 246, 0.3)',
                    background: completedLessons.includes(activeLesson.id) ? 'rgba(16, 185, 129, 0.1)' : undefined,
                    color: completedLessons.includes(activeLesson.id) ? '#10b981' : undefined,
                    border: completedLessons.includes(activeLesson.id) ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {completedLessons.includes(activeLesson.id) ? (
                    <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> Completed</>
                  ) : (
                    <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> Mark Complete</>
                  )}
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                {nextLessonObj && (
                  <button 
                    onClick={() => navigateToLesson(nextLessonObj.lesson, nextLessonObj.section)}
                    style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', cursor: 'pointer', textAlign: 'right', padding: '16px', borderRadius: '12px', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Up Next</span>
                    <span style={{ fontSize: '16px', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {nextLessonObj.lesson.title}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            No lessons available in this course yet.
          </div>
        )}
      </div>
    </div>
  );
}

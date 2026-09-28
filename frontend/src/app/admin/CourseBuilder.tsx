'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function CourseBuilder({ courseId, onBack }: { courseId: string, onBack: () => void }) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lesson Edit State
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState('');
  
  // Section Create State
  const [newSectionTitle, setNewSectionTitle] = useState('');
  
  // Lesson Create State
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [activeSectionForNewLesson, setActiveSectionForNewLesson] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/learning/courses/${courseId}`, { credentials: 'include' });
      if (res.ok) {
        setCourse(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`http://localhost:8080/api/learning/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...course, status: newStatus }),
      });
      if (res.ok) {
        setCourse({ ...course, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    try {
      const res = await fetch(`http://localhost:8080/api/learning/courses/${courseId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          title: newSectionTitle, 
          description: '', 
          sortOrder: course.sections ? course.sections.length : 0 
        }),
      });
      if (res.ok) {
        setNewSectionTitle('');
        fetchCourse();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addLesson = async (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    try {
      const slug = newLessonTitle.toLowerCase().replace(/\s+/g, '-');
      const res = await fetch(`http://localhost:8080/api/learning/courses/sections/${sectionId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          title: newLessonTitle, 
          slug, 
          content: 'Start writing your lesson here...', 
          sortOrder: 0 
        }),
      });
      if (res.ok) {
        setNewLessonTitle('');
        setActiveSectionForNewLesson(null);
        fetchCourse();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveLessonContent = async () => {
    if (!editingLesson) return;
    try {
      const res = await fetch(`http://localhost:8080/api/learning/courses/lessons/${editingLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...editingLesson, content: lessonContent }),
      });
      if (res.ok) {
        setEditingLesson(null);
        fetchCourse();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !course) return <div className="text-white">Loading course builder...</div>;

  // If editing a lesson, show full screen editor
  if (editingLesson) {
    return (
      <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', color: 'white' }}>Editing: {editingLesson.title}</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setEditingLesson(null)} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', color: 'white', background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
            <button onClick={saveLessonContent} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>Save Content</button>
          </div>
        </div>
        
        <div data-color-mode="dark">
          <MDEditor
            value={lessonContent}
            onChange={(val) => setLessonContent(val || '')}
            height={600}
            preview="live"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <button onClick={onBack} style={{ color: '#9ca3af', marginBottom: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>← Back to Courses</button>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{course.title}</h2>
          <p style={{ color: '#9ca3af' }}>/{course.slug}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: course.status === 'PUBLISHED' ? '#22c55e' : '#f59e0b', fontWeight: 'bold' }}>
            {course.status}
          </span>
          <button 
            onClick={toggleStatus}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              background: course.status === 'PUBLISHED' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              color: course.status === 'PUBLISHED' ? '#f59e0b' : '#22c55e',
              border: `1px solid ${course.status === 'PUBLISHED' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {course.status === 'PUBLISHED' ? 'Unpublish to Draft' : 'Publish Course'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {course.sections && course.sections.length > 0 ? course.sections.map((section: any) => (
          <div key={section.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', color: 'white', fontWeight: 600 }}>{section.title}</h3>
              <button 
                onClick={() => setActiveSectionForNewLesson(section.id)}
                style={{ fontSize: '13px', background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
                + Add Lesson
              </button>
            </div>
            
            {/* Lessons List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
              {section.lessons && section.lessons.length > 0 ? section.lessons.map((lesson: any) => (
                <div key={lesson.id} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#d1d5db' }}>{lesson.title}</span>
                  <button 
                    onClick={() => {
                      setEditingLesson(lesson);
                      setLessonContent(lesson.content || '');
                    }}
                    style={{ background: 'rgba(59, 130, 246, 0.2)', border: 'none', color: '#60a5fa', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                    Edit Content
                  </button>
                </div>
              )) : <div style={{ color: '#6b7280', fontSize: '13px' }}>No lessons in this section.</div>}

              {activeSectionForNewLesson === section.id && (
                <form onSubmit={(e) => addLesson(e, section.id)} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Lesson Title"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="input-modern"
                    style={{ flex: 1, padding: '8px 12px' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>Save</button>
                  <button type="button" onClick={() => setActiveSectionForNewLesson(null)} style={{ background: 'none', color: '#9ca3af', border: 'none', cursor: 'pointer' }}>Cancel</button>
                </form>
              )}
            </div>
          </div>
        )) : <div style={{ color: '#9ca3af' }}>No sections added yet.</div>}

        {/* Add Section Form */}
        <div style={{ marginTop: '16px' }}>
          <form onSubmit={addSection} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="New Section Title..." 
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="input-modern"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px', borderRadius: '8px' }}>
              Add Section
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

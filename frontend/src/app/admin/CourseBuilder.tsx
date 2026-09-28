'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

const EditableTitle = ({ initialValue, onSave, fontSize, fontWeight, color = 'white' }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(initialValue);
  const [isHovered, setIsHovered] = useState(false);

  if (isEditing) {
    return (
      <input 
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => { setIsEditing(false); onSave(val); }}
        onKeyDown={e => { if (e.key === 'Enter') { setIsEditing(false); onSave(val); } }}
        style={{ 
          background: 'rgba(255,255,255,0.05)', 
          color: 'white', 
          border: '1px solid rgba(59, 130, 246, 0.5)', 
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
          outline: 'none', 
          padding: '6px 12px', 
          borderRadius: '8px', 
          fontSize, 
          fontWeight, 
          width: '100%',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(4px)'
        }}
      />
    );
  }
  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        cursor: 'pointer',
        padding: '6px 12px',
        marginLeft: '-12px',
        borderRadius: '8px',
        background: isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'all 0.2s ease'
      }} 
      onClick={() => setIsEditing(true)} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Click to edit"
    >
      <span style={{ fontSize, fontWeight, color }}>{val}</span>
      <svg 
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ 
          opacity: isHovered ? 0.8 : 0, 
          transform: isHovered ? 'translateX(0)' : 'translateX(-4px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          color: '#60a5fa' 
        }}
      >
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>
    </div>
  );
};

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

  const updateCourseTitle = async (newTitle: string) => {
    if (!newTitle.trim() || newTitle === course.title) return;
    try {
      const res = await fetch(`http://localhost:8080/api/learning/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...course, title: newTitle }),
      });
      if (res.ok) fetchCourse();
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

  const updateSectionTitle = async (sectionId: string, newTitle: string, currentTitle: string) => {
    if (!newTitle.trim() || newTitle === currentTitle) return;
    try {
      const section = course.sections.find((s: any) => s.id === sectionId);
      const res = await fetch(`http://localhost:8080/api/learning/courses/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...section, title: newTitle }),
      });
      if (res.ok) fetchCourse();
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

  const updateLessonTitle = async (lessonId: string, sectionId: string, newTitle: string, currentTitle: string) => {
    if (!newTitle.trim() || newTitle === currentTitle) return;
    try {
      const section = course.sections.find((s: any) => s.id === sectionId);
      const lesson = section.lessons.find((l: any) => l.id === lessonId);
      const res = await fetch(`http://localhost:8080/api/learning/courses/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...lesson, title: newTitle }),
      });
      if (res.ok) fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  const saveLessonContent = async () => {
    if (!editingLesson) return;
    
    const contentToSave = lessonContent;
      
    try {
      const res = await fetch(`http://localhost:8080/api/learning/courses/lessons/${editingLesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...editingLesson, content: contentToSave }),
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('http://localhost:8080/api/learning/files/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          const dataUrl = data.url;
          setLessonContent(prev => prev + `\n<img src="${dataUrl}" style="max-width: 100%; border-radius: 8px;" alt="${file.name}" />\n`);
        }
      } catch (err) {
        console.error('Upload failed', err);
      }
    }
  };

  // If editing a lesson, show full screen editor
  if (editingLesson) {
    const editorConfig = {
      readonly: false,
      theme: 'dark',
      height: 'auto',
      width: '100%',
      uploader: {
        insertImageAsBase64URI: true
      },
      style: {
        background: 'transparent',
        color: '#fff'
      }
    };

    return (
      <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .jodit-container:not(.jodit_inline) {
            border: 1px solid rgba(255,255,255,0.05) !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
            min-height: 500px !important;
            background: transparent !important;
          }
          .jodit-workplace {
            background: rgba(0,0,0,0.2) !important;
            overflow: visible !important;
          }
          .jodit-toolbar__box {
            background: rgba(0,0,0,0.6) !important;
            backdrop-filter: blur(12px) !important;
            border-bottom: 1px solid rgba(255,255,255,0.08) !important;
            position: sticky !important;
            top: 0;
            z-index: 50;
          }
          .jodit-wysiwyg {
            background: transparent !important;
            color: #e5e7eb !important;
            padding: 40px !important;
            font-size: 16px;
            line-height: 1.7;
            min-height: 500px !important;
          }
          .jodit-status-bar {
            display: none !important;
          }
          .jodit-toolbar-button__button:hover {
            background: rgba(255,255,255,0.1) !important;
          }
        `}} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', color: 'white' }}>Editing: {editingLesson.title}</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <label title="Attach Image / File" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', color: '#e5e7eb', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
              Upload to Server
              <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} id="md-file-upload" />
            </label>
            <button onClick={() => setEditingLesson(null)} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', color: 'white', background: 'rgba(255,255,255,0.1)', border: 'none' }}>Cancel</button>
            <button onClick={saveLessonContent} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>Save Content</button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flex: 1 }}>
          <div style={{ flex: 1, borderRadius: '12px' }}>
            <JoditEditor
              value={lessonContent}
              config={editorConfig}
              onBlur={newContent => setLessonContent(newContent)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <button onClick={onBack} style={{ color: '#9ca3af', marginBottom: '16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Courses
          </button>
          <EditableTitle 
            initialValue={course.title} 
            onSave={updateCourseTitle} 
            fontSize="28px" 
            fontWeight="800" 
          />
          <p style={{ color: '#9ca3af', marginTop: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontFamily: 'monospace' }}>/{course.slug}</span>
          </p>
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
          <div key={section.id} style={{ 
            padding: '24px', 
            background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
            borderRadius: '16px', 
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <EditableTitle 
                initialValue={section.title} 
                onSave={(newTitle: string) => updateSectionTitle(section.id, newTitle, section.title)} 
                fontSize="20px" 
                fontWeight="700" 
              />
              <button 
                onClick={() => setActiveSectionForNewLesson(section.id)}
                style={{ fontSize: '14px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa', cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Lesson
              </button>
            </div>
            
            {/* Lessons List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {section.lessons && section.lessons.length > 0 ? section.lessons.map((lesson: any) => (
                <div key={lesson.id} 
                  style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.2s ease' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.25)'}
                >
                  <div style={{ flex: 1 }}>
                    <EditableTitle 
                      initialValue={lesson.title} 
                      onSave={(newTitle: string) => updateLessonTitle(lesson.id, section.id, newTitle, lesson.title)} 
                      fontSize="16px" 
                      color="#e5e7eb"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      setEditingLesson(lesson);
                      
                      // Convert old markdown images to HTML for the new editor
                      let content = lesson.content || '';
                      // 1. Handle markdown image syntax (even if there are newlines/spaces between the ] and ()
                      content = content.replace(/!\[([^\]]*)\]\s*\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%; border-radius:8px; margin: 10px 0;" />');
                      // 2. Catch any orphaned raw data URIs floating in the text and turn them into images too
                      content = content.replace(/(?<!src=["'])(data:image\/[a-zA-Z0-9+;/=]+)/g, '<img src="$1" style="max-width:100%; border-radius:8px; margin: 10px 0;" />');
                      
                      setLessonContent(content);
                    }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit
                  </button>
                </div>
              )) : <div style={{ color: '#6b7280', fontSize: '14px', padding: '12px' }}>No lessons in this section.</div>}

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

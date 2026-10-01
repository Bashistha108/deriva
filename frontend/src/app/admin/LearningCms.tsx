'use client';

import { useState, useEffect } from 'react';
import CourseBuilder from './CourseBuilder';

export default function LearningCms() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCourses = () => {
    fetch('http://localhost:8080/api/learning/courses/all', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Failed to load courses', err));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const meRes = await fetch('http://localhost:8080/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) throw new Error('You must be logged in as an admin to create courses.');
      const meData = await meRes.json();
      const userId = meData.id;

      const res = await fetch('http://localhost:8080/api/learning/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, slug, description, createdBy: userId }),
      });
      if (!res.ok) throw new Error('Failed to create course. Ensure the slug is unique.');
      
      setSuccess('Course created successfully!');
      fetchCourses();
      
      setTimeout(() => {
        setIsCreating(false);
        setTitle('');
        setSlug('');
        setDescription('');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/learning/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete course');
      fetchCourses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // If a course is selected for editing, show the full Course Builder
  if (editingCourseId) {
    return (
      <CourseBuilder 
        courseId={editingCourseId} 
        onBack={() => {
          setEditingCourseId(null);
          fetchCourses(); // refresh the list to show updated publish status/etc
        }} 
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'white' }}>Course Management</h2>
        <button 
          onClick={() => {
            setIsCreating(!isCreating);
            setTitle('');
            setSlug('');
            setDescription('');
          }}
          className="btn-primary" 
          style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '8px' }}
        >
          {isCreating ? 'Cancel' : '+ Create New Course'}
        </button>
      </div>

      {isCreating && (
        <div className="glass" style={{ padding: '24px', borderRadius: '16px', animation: 'fadeIn 0.3s ease-out' }}>
          <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '16px' }}>New Course Details</h3>
          
          {error && <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          {success && <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{success}</div>}

          <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Course Title</label>
              <input 
                type="text" 
                required
                className="input-modern" 
                placeholder="e.g., Options Trading Masterclass"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>URL Slug</label>
              <input 
                type="text" 
                required
                className="input-modern" 
                placeholder="e.g., options-trading-masterclass"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Description</label>
              <textarea 
                required
                className="input-modern" 
                placeholder="Brief description of what students will learn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ padding: '12px', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Saving...' : 'Save Course'}
            </button>
          </form>
        </div>
      )}

      {!isCreating && (
        <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              <p style={{ marginBottom: '16px' }}>No courses created yet.</p>
              <p style={{ fontSize: '14px' }}>Click the "Create New Course" button to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {courses.map((c, i) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '4px' }}>
                      {c.title}
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '10px', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: c.status === 'PUBLISHED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: c.status === 'PUBLISHED' ? '#22c55e' : '#f59e0b'
                      }}>
                        {c.status}
                      </span>
                    </h4>
                    <span style={{ fontSize: '12px', color: '#9ca3af', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px' }}>/{c.slug}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setEditingCourseId(c.id)}
                      style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      Builder
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(c.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

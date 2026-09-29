'use client';

import { useState, useEffect } from 'react';
import LearningCms from './LearningCms';



export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [simulationState, setSimulationState] = useState('RUNNING');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(user => {
        setCurrentUserId(user.id);
        const isAdminUser = user.authorities && user.authorities.some((auth: any) => auth.authority === 'ROLE_ADMIN');
        if (isAdminUser) {
          setIsAdmin(true);
          fetch('http://localhost:8080/api/admin/users', { credentials: 'include' })
            .then(res => {
              if (!res.ok) {
                console.error('Failed to fetch users, status:', res.status);
                return [];
              }
              return res.json();
            })
            .then(data => {
              setUsers(Array.isArray(data) ? data : []);
            })
            .catch(err => {
              console.error("Failed to fetch users", err);
              setUsers([]);
            });
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => setIsAdmin(false));

    fetch('http://localhost:8080/api/market-data/simulation/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSimulationState(data.status))
      .catch(err => console.error("Failed to fetch simulation status", err));
  }, []);

  const handleRoleChange = (userId: string, newRole: string) => {
    fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to update role');
      })
      .then(updatedUser => {
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
      })
      .catch(err => console.error(err));
  };

  const handleStatusChange = (userId: string, enabled: boolean) => {
    fetch(`http://localhost:8080/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to update status');
      })
      .then(updatedUser => {
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
      })
      .catch(err => console.error(err));
  };

  if (isAdmin === null) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Verifying permissions...</div>;
  }

  if (isAdmin === false) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--danger)', marginBottom: '16px' }}>Access Denied</h1>
        <p style={{ color: '#9ca3af' }}>You must have administrator privileges to view this page.</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ marginTop: '24px' }}>Return Home</button>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'User Management' },
    { id: 'learning', label: 'CMS (Learning)' },
    { id: 'simulation', label: 'Market Simulation' },
    { id: 'audit', label: 'Audit Logs' },
  ];

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 className="heading-gradient" style={{ fontSize: '36px', marginBottom: '8px' }}>Admin Control Center</h1>
      <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Platform management and simulation controls.</p>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid var(--border)',
              color: activeTab === tab.id ? 'white' : '#9ca3af',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 500,
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === 'users' && (
        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Registered Users</h2>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Invite User</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', fontSize: '14px', color: '#9ca3af' }}>
                <th style={{ padding: '16px 24px' }}>Username</th>
                <th style={{ padding: '16px 24px' }}>Email</th>
                <th style={{ padding: '16px 24px' }}>Role</th>
                <th style={{ padding: '16px 24px' }}>Balance</th>
                <th style={{ padding: '16px 24px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(users) ? users : []).map((user) => (
                <tr key={user.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{user.username}</td>
                  <td style={{ padding: '16px 24px', color: '#9ca3af' }}>{user.email}</td>
                  <td style={{ padding: '16px 24px' }}>
                    {currentUserId === user.id ? (
                      <span style={{ 
                        padding: '4px 8px', 
                        background: user.role === 'ADMIN' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                        color: user.role === 'ADMIN' ? 'var(--warning)' : 'var(--primary)', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 600 
                      }}>
                        {user.role}
                      </span>
                    ) : (
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={{
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          border: '1px solid var(--border)',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>$0.00</td>
                  <td style={{ padding: '16px 24px' }}>
                    {currentUserId === user.id ? (
                      <span style={{ color: user.enabled ? 'var(--success)' : 'var(--danger)', fontSize: '14px' }}>
                        {user.enabled ? 'Active' : 'Inactive'}
                      </span>
                    ) : (
                      <select 
                        value={user.enabled ? 'true' : 'false'} 
                        onChange={(e) => handleStatusChange(user.id, e.target.value === 'true')}
                        style={{
                          background: 'rgba(0,0,0,0.5)',
                          color: user.enabled ? 'var(--success)' : 'var(--danger)',
                          border: '1px solid var(--border)',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="true" style={{ color: 'var(--success)' }}>Active</option>
                        <option value="false" style={{ color: 'var(--danger)' }}>Inactive</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {activeTab === 'simulation' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Simulation Engine</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>Current State</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: simulationState === 'RUNNING' ? 'var(--success)' : 'var(--warning)' }}>
                  {simulationState}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => {
                    fetch('http://localhost:8080/api/market-data/simulation/resume', { method: 'POST', credentials: 'include' })
                      .then(() => setSimulationState('RUNNING'))
                      .catch(err => console.error("Failed to resume simulation", err));
                  }}
                  disabled={simulationState === 'RUNNING'}
                  style={{ background: simulationState === 'RUNNING' ? 'transparent' : 'var(--success)', border: simulationState === 'RUNNING' ? '1px solid var(--border)' : 'none', color: simulationState === 'RUNNING' ? '#6b7280' : 'white', padding: '8px 16px', borderRadius: '4px', cursor: simulationState === 'RUNNING' ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                >
                  Start
                </button>
                <button 
                  onClick={() => {
                    fetch('http://localhost:8080/api/market-data/simulation/pause', { method: 'POST', credentials: 'include' })
                      .then(() => setSimulationState('PAUSED'))
                      .catch(err => console.error("Failed to pause simulation", err));
                  }}
                  disabled={simulationState === 'PAUSED'}
                  style={{ background: simulationState === 'PAUSED' ? 'transparent' : 'var(--warning)', border: simulationState === 'PAUSED' ? '1px solid var(--border)' : 'none', color: simulationState === 'PAUSED' ? '#6b7280' : 'black', padding: '8px 16px', borderRadius: '4px', cursor: simulationState === 'PAUSED' ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                >
                  Pause
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Tick Interval (ms)</label>
              <input type="number" className="input-modern" defaultValue={500} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Global Volatility Multiplier</label>
              <input type="number" className="input-modern" defaultValue={1.0} step={0.1} />
            </div>
            <button className="btn-primary" style={{ marginTop: '24px', width: '100%' }}>Update Parameters</button>
          </div>
        </div>
      )}
      
      {activeTab === 'learning' && (
        <LearningCms />
      )}
      
      {activeTab === 'audit' && (
        <div className="glass" style={{ padding: '48px', borderRadius: '16px', textAlign: 'center', color: '#9ca3af' }}>
          Interface configuration for {activeTab} goes here.
        </div>
      )}
    </div>
  );
}

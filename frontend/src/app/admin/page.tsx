'use client';

import { useState } from 'react';

const mockUsers = [
  { id: '1', email: 'trader1@example.com', role: 'USER', balance: 10420.50, active: true },
  { id: '2', email: 'trader2@example.com', role: 'USER', balance: 5000.00, active: true },
  { id: '3', email: 'admin@deriva.com', role: 'ADMIN', balance: 0.00, active: true },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [simulationState, setSimulationState] = useState('RUNNING');

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
                <th style={{ padding: '16px 24px' }}>Email</th>
                <th style={{ padding: '16px 24px' }}>Role</th>
                <th style={{ padding: '16px 24px' }}>Balance</th>
                <th style={{ padding: '16px 24px' }}>Status</th>
                <th style={{ padding: '16px 24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{user.email}</td>
                  <td style={{ padding: '16px 24px' }}>
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
                  </td>
                  <td style={{ padding: '16px 24px' }}>${user.balance.toFixed(2)}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ color: user.active ? 'var(--success)' : 'var(--danger)', fontSize: '14px' }}>
                      {user.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
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
                  onClick={() => setSimulationState('RUNNING')}
                  disabled={simulationState === 'RUNNING'}
                  style={{ background: simulationState === 'RUNNING' ? 'transparent' : 'var(--success)', border: simulationState === 'RUNNING' ? '1px solid var(--border)' : 'none', color: simulationState === 'RUNNING' ? '#6b7280' : 'white', padding: '8px 16px', borderRadius: '4px', cursor: simulationState === 'RUNNING' ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                >
                  Start
                </button>
                <button 
                  onClick={() => setSimulationState('PAUSED')}
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
      
      {(activeTab === 'learning' || activeTab === 'audit') && (
        <div className="glass" style={{ padding: '48px', borderRadius: '16px', textAlign: 'center', color: '#9ca3af' }}>
          Interface configuration for {activeTab} goes here.
        </div>
      )}
    </div>
  );
}

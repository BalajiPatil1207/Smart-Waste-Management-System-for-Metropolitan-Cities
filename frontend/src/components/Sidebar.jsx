import React, { useState } from 'react';
import { Server, Route, LayoutDashboard, ClipboardList, Cpu, Gamepad2, Layers } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function Sidebar({
    fleetData, 
    activeBinId, 
    setActiveBinId, 
    showRoute, 
    toggleRoute, 
    isRouting, 
    binsNeedingPickup, 
    getStatusMeaning,
    setIsLoggedIn,
    currentView,
    setCurrentView
}) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    return (
        <aside className="fleet-sidebar glass-panel">
            <h2 className="sidebar-title" style={{ marginBottom: '1.5rem' }}><Server size={24} color="#38bdf8"/> Fleet Management</h2>
            
            {/* Navigation Menu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '0.8rem', borderRadius: '8px',
                  background: currentView === 'dashboard' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: currentView === 'dashboard' ? '1px solid #38bdf8' : '1px solid transparent',
                  color: currentView === 'dashboard' ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'
                }}
              >
                <LayoutDashboard size={18} /> Live Dashboard
              </button>

              <button 
                id="tour-simulator"
                onClick={() => setCurrentView('simulator')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '0.8rem', borderRadius: '8px',
                  background: currentView === 'simulator' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: currentView === 'simulator' ? '1px solid #38bdf8' : '1px solid transparent',
                  color: currentView === 'simulator' ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'
                }}
              >
                <Cpu size={18} /> Hardware Simulator
              </button>

              <button 
                id="tour-reports"
                onClick={() => setCurrentView('reports')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '0.8rem', borderRadius: '8px',
                  background: currentView === 'reports' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: currentView === 'reports' ? '1px solid #38bdf8' : '1px solid transparent',
                  color: currentView === 'reports' ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'
                }}
              >
                <ClipboardList size={18} /> Dispatch Reports
              </button>

              <button 
                id="tour-separation"
                onClick={() => setCurrentView('separation')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '0.8rem', borderRadius: '8px',
                  background: currentView === 'separation' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: currentView === 'separation' ? '1px solid #38bdf8' : '1px solid transparent',
                  color: currentView === 'separation' ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'
                }}
              >
                <Layers size={18} /> Bin Separation
              </button>

              <button 
                id="tour-segregation"
                onClick={() => setCurrentView('segregation')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '0.8rem', borderRadius: '8px',
                  background: currentView === 'segregation' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: currentView === 'segregation' ? '1px solid #38bdf8' : '1px solid transparent',
                  color: currentView === 'segregation' ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'
                }}
              >
                <Gamepad2 size={18} /> Waste Segregation
              </button>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button onClick={() => setShowLogoutConfirm(true)} className="logout-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    Logout
                </button>
            </div>

            <ConfirmModal 
                isOpen={showLogoutConfirm} 
                onClose={() => setShowLogoutConfirm(false)} 
                onConfirm={() => {
                    setIsLoggedIn(false); 
                    localStorage.removeItem("isLoggedIn");
                }} 
            />
        </aside>
    );
}

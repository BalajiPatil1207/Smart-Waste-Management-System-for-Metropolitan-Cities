import React, { useState } from 'react';
import { Server, Route, LayoutDashboard, ClipboardList, Cpu } from 'lucide-react';
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
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                Select a Smart Bin to monitor real-time analytics and map location.
            </p>

            <button 
                id="tour-route"
                className={`route-btn ${showRoute ? 'active' : ''}`} 
                onClick={toggleRoute}
                disabled={isRouting}
            >
                <Route size={18}/> {isRouting ? 'Calculating Best Route...' : (showRoute ? 'Hide Route' : 'Optimize Truck Route')}
            </button>
            
            {showRoute && binsNeedingPickup.length === 0 && (
                <div style={{ color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem' }}>No bins need immediate pickup!</div>
            )}

            <div className="bin-list" id="tour-bins">
                {Object.values(fleetData).sort((a, b) => a.Bin_ID.localeCompare(b.Bin_ID)).map(bin => {
                    let dotColor = "#34d399";
                    if(bin.Fill_Level > 80 || bin.Methane_PPM > 350) dotColor = "#f87171";
                    else if(bin.Fill_Level > 50) dotColor = "#fbbf24";
                    
                    return (
                        <div key={bin.Bin_ID} className={`bin-item ${activeBinId === bin.Bin_ID ? 'active' : ''}`} onClick={() => setActiveBinId(bin.Bin_ID)}>
                            <div className="bin-item-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="status-dot" style={{ backgroundColor: dotColor }}></div>
                                    <strong>{bin.Bin_ID}</strong>
                                </div>
                                <span className="bin-item-level">{bin.Fill_Level}%</span>
                            </div>
                            <div className="bin-item-sub">
                                <strong style={{ color: dotColor }}>{bin.Status}</strong> <br/>
                                <span style={{ opacity: 0.8, fontSize: '0.75rem', marginTop: '3px', display: 'inline-block' }}>👉 {getStatusMeaning(bin.Status)}</span>
                            </div>
                        </div>
                    );
                })}
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

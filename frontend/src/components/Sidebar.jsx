import React, { useState } from 'react';
import { Server, Route } from 'lucide-react';
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
    setIsLoggedIn
}) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    return (
        <aside className="fleet-sidebar glass-panel">
            <h2 className="sidebar-title"><Server size={24} color="#38bdf8"/> Fleet Management</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                Select a Smart Bin from the list below to monitor its real-time analytics, fill status, and live map location.
            </p>

            <button 
                className={`route-btn ${showRoute ? 'active' : ''}`} 
                onClick={toggleRoute}
                disabled={isRouting}
            >
                <Route size={18}/> {isRouting ? 'Calculating Best Route...' : (showRoute ? 'Hide Route' : 'Optimize Truck Route')}
            </button>
            
            {showRoute && binsNeedingPickup.length === 0 && (
                <div style={{ color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem' }}>No bins need immediate pickup!</div>
            )}

            <div className="bin-list">
                {Object.values(fleetData).map(bin => {
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

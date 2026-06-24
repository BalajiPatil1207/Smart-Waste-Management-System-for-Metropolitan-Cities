import React, { useState, useEffect } from 'react';
import { MapPin, Wifi, WifiOff } from 'lucide-react';

export default function DashboardHeader({ 
    handlePingDevice, 
    statusClass, 
    getStatusMeaning, 
    activeBin, 
    handleLidToggle, 
    projection,
    fleetData,
    setActiveBinId
}) {
    const [isPinging, setIsPinging] = useState(false);
    const [isHardwareOnline, setIsHardwareOnline] = useState(true);

    // Track live connection based on last received timestamp
    useEffect(() => {
        if (!activeBin || !activeBin.Timestamp) return;

        const interval = setInterval(() => {
            const timeDiff = Date.now() - new Date(activeBin.Timestamp).getTime();
            // If data is older than 25 seconds, assume hardware is disconnected
            setIsHardwareOnline(timeDiff <= 25000);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeBin]);

    const onPing = async () => {
        setIsPinging(true);
        await handlePingDevice();
        setTimeout(() => setIsPinging(false), 1500);
    };

    return (
        <header className="header glass-panel" style={{ flexWrap: 'wrap', gap: '15px' }}>
            <h1><MapPin size={36} color="#38bdf8" /> Metropolitan Smart Waste System</h1>
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                
                {/* Active Bin Select Dropdown */}
                {fleetData && setActiveBinId && (
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        padding: '0.4rem 0.8rem', background: 'rgba(56, 189, 248, 0.1)', 
                        border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px' 
                    }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#38bdf8' }}>Active Bin:</span>
                        <select 
                            value={activeBin.Bin_ID}
                            onChange={(e) => setActiveBinId(e.target.value)}
                            style={{
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.85rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                background: 'rgba(15, 23, 42, 0.8)',
                                color: '#fff',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {Object.values(fleetData).sort((a,b)=>a.Bin_ID.localeCompare(b.Bin_ID)).map(bin => (
                                <option key={bin.Bin_ID} value={bin.Bin_ID} style={{ background: '#0f172a' }}>
                                    {bin.Bin_ID} ({bin.Fill_Level}%)
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Rate Projection Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                    <div className={`status-badge ${statusClass}`} title={getStatusMeaning(activeBin.Status)}>
                        <div className="pulse-dot"></div>
                        {activeBin.Status}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                        📈 Overflow: <span style={{ color: projection && (projection.includes('Overflow') || projection.includes('left') || projection.includes('min')) ? '#f43f5e' : '#10b981', fontWeight: 'bold' }}>{projection}</span>
                    </div>
                </div>

                {/* Remote Lid Actuation Toggle */}
                <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '0.4rem 0.8rem', background: 'rgba(56, 189, 248, 0.1)', 
                    border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px' 
                }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#38bdf8' }}>Lid Cover:</span>
                    <button 
                        onClick={() => handleLidToggle && handleLidToggle(activeBin.Bin_ID, activeBin.Lid_Status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                        style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            background: activeBin.Lid_Status === 'OPEN' ? '#ef4444' : '#10b981',
                            color: '#fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        {activeBin.Lid_Status === 'OPEN' ? '🔓 OPEN' : '🔒 CLOSED'}
                    </button>
                </div>

                {/* Hardware Connection Badge */}
                <div 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '0.5rem 1rem', borderRadius: '50px',
                    background: isHardwareOnline ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                    border: `1px solid ${isHardwareOnline ? '#34d399' : '#f87171'}`,
                    color: isHardwareOnline ? '#34d399' : '#f87171',
                    fontWeight: 'bold', fontSize: '0.9rem',
                    transition: 'all 0.3s'
                  }}
                  title={isHardwareOnline ? "Receiving live telemetry from NodeMCU/Sensors" : "Connection lost! Check device power and Wi-Fi."}
                >
                    {isHardwareOnline ? (
                        <><Wifi size={16} /> Device: Online</>
                    ) : (
                        <><WifiOff size={16} /> Device: Offline</>
                    )}
                </div>

                <button id="tour-ping" onClick={onPing} className="ping-btn" disabled={isPinging} style={{ opacity: isPinging ? 0.7 : 1 }}>
                    {isPinging ? "📡 Pinging Fleet..." : "📡 Ping Fleet"}
                </button>
            </div>
        </header>
    );
}

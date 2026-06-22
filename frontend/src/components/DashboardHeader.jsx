import React, { useState, useEffect } from 'react';
import { MapPin, Wifi, WifiOff } from 'lucide-react';

export default function DashboardHeader({ handlePingDevice, statusClass, getStatusMeaning, activeBin }) {
    const [isPinging, setIsPinging] = useState(false);
    const [isHardwareOnline, setIsHardwareOnline] = useState(true);

    // Track live connection based on last received timestamp
    useEffect(() => {
        if (!activeBin || !activeBin.Timestamp) return;

        const interval = setInterval(() => {
            const timeDiff = Date.now() - new Date(activeBin.Timestamp).getTime();
            // If data is older than 15 seconds, assume hardware is disconnected
            setIsHardwareOnline(timeDiff <= 15000);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeBin]);

    const onPing = async () => {
        setIsPinging(true);
        await handlePingDevice();
        setTimeout(() => setIsPinging(false), 1500);
    };

    return (
        <header className="header glass-panel">
            <h1><MapPin size={36} color="#38bdf8" /> Metropolitan Smart Waste System</h1>
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                
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
                        <><Wifi size={16} /> Hardware: Online</>
                    ) : (
                        <><WifiOff size={16} /> Hardware: Offline</>
                    )}
                </div>

                <button id="tour-ping" onClick={onPing} className="ping-btn" disabled={isPinging} style={{ opacity: isPinging ? 0.7 : 1 }}>
                    {isPinging ? "📡 Pinging Fleet..." : "📡 Ping Fleet Data"}
                </button>
                <div className={`status-badge ${statusClass}`} title={getStatusMeaning(activeBin.Status)}>
                    <div className="pulse-dot"></div>
                    {activeBin.Status} — {getStatusMeaning(activeBin.Status)}
                </div>
            </div>
        </header>
    );
}

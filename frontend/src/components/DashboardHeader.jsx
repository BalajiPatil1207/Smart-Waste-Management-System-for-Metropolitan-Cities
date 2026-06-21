import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

export default function DashboardHeader({ handlePingDevice, statusClass, getStatusMeaning, activeBin }) {
    const [isPinging, setIsPinging] = useState(false);

    const onPing = async () => {
        setIsPinging(true);
        await handlePingDevice();
        setTimeout(() => setIsPinging(false), 1500);
    };

    return (
        <header className="header glass-panel">
            <h1><MapPin size={36} color="#38bdf8" /> Metropolitan Smart Waste System</h1>
            <div className="header-actions">
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

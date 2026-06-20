import React from 'react';
import { MapPin } from 'lucide-react';

export default function DashboardHeader({ handlePingDevice, statusClass, getStatusMeaning, activeBin }) {
    return (
        <header className="header glass-panel">
            <h1><MapPin size={36} color="#38bdf8" /> Metropolitan Smart Waste System</h1>
            <div className="header-actions">
                <button onClick={handlePingDevice} className="ping-btn">📡 Ping Fleet Data</button>
                <div className={`status-badge ${statusClass}`} title={getStatusMeaning(activeBin.Status)}>
                    <div className="pulse-dot"></div>
                    {activeBin.Status} — {getStatusMeaning(activeBin.Status)}
                </div>
            </div>
        </header>
    );
}

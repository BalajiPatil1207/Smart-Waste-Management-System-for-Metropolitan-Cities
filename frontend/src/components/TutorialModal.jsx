import React from 'react';

export default function TutorialModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="modal-content glass-panel" style={{ maxWidth: '600px', textAlign: 'left', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ color: '#38bdf8', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
                    📖 How This Project Works
                </h3>
                
                <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                    <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <strong style={{ color: '#34d399', fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>1. Hardware Simulation (IoT)</strong> 
                        Smart Bins measure garbage fill level, temperature, and methane gas using sensors. This data is continuously generated and sent to the backend.
                    </div>

                    <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <strong style={{ color: '#fbbf24', fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>2. Node-RED Backend Engine</strong> 
                        Data is collected, processed, and routed via APIs/MQTT. Node-RED acts as the brain, identifying critical events like overflowing bins or toxic gas detection.
                    </div>

                    <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <strong style={{ color: '#38bdf8', fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>3. Real-Time Dashboard</strong> 
                        This React frontend fetches the latest data every 2 seconds. It updates the live stats, dynamic charts, and color-coded status badges instantly.
                    </div>

                    <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <strong style={{ color: '#c084fc', fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>4. Map Tracking & Routing</strong> 
                        Bins are tracked via GPS. The "Optimize Truck Route" feature uses OpenStreetMap (OSRM) APIs to calculate the shortest driving path for garbage trucks to pick up only the bins that need attention.
                    </div>

                    <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <strong style={{ color: '#f87171', fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>5. Automated Dispatch</strong> 
                        When a bin exceeds 95% capacity, the system automatically assigns a garbage truck and logs the event in the Dispatch Reports tab.
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn-confirm" style={{ width: '100%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
}

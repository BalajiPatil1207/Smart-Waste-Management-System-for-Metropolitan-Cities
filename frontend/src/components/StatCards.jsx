import React, { useState, useEffect } from 'react';
import { Trash2, Thermometer, Battery, Wind, Truck, CheckCircle } from 'lucide-react';

export default function StatCards({ activeBin }) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  // Reset state when changing bins
  useEffect(() => {
    setIsDispatching(false);
    setDispatched(false);
  }, [activeBin.Bin_ID]);

  const handleDispatch = () => {
    setIsDispatching(true);
    // Simulate API call and truck dispatch time (2 seconds)
    setTimeout(() => {
      setIsDispatching(false);
      setDispatched(true);
      // Reset after 10 seconds
      setTimeout(() => setDispatched(false), 10000);
    }, 2000);
  };

  return (
    <div className="grid-top">
      <div className="glass-panel stat-card" style={activeBin.Fill_Level > 80 ? { border: '1px solid rgba(248, 113, 113, 0.5)', boxShadow: '0 0 15px rgba(248, 113, 113, 0.15)' } : {}}>
        <div className="stat-header"><span>Garbage Level</span><Trash2 size={24} color={activeBin.Fill_Level > 80 ? "#f87171" : "#38bdf8"} /></div>
        <div className="stat-value" style={{ color: activeBin.Fill_Level > 80 ? '#f87171' : '#f8fafc' }}>
          {activeBin.Fill_Level}<span className="stat-unit">%</span>
        </div>
        <div className="stat-sub" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span>Predicted Full: {activeBin.Fill_Level > 80 ? 'Immediately' : (100 - activeBin.Fill_Level) + ' hrs'}</span>
          
          {/* Dispatch Truck Button for Critical Bins */}
          {activeBin.Fill_Level > 80 && (
            <button 
              onClick={handleDispatch}
              disabled={isDispatching || dispatched}
              style={{
                background: dispatched ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                border: `1px solid ${dispatched ? '#34d399' : '#f87171'}`,
                color: dispatched ? '#34d399' : '#f87171',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: (isDispatching || dispatched) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                transition: 'all 0.3s ease',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              {isDispatching ? (
                <>⏳ Dispatching Truck...</>
              ) : dispatched ? (
                <><CheckCircle size={16} /> Truck MH-12-SW-101 Dispatched!</>
              ) : (
                <><Truck size={16} /> Dispatch Collection Truck</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-header"><span>Inside Temperature</span><Thermometer size={24} color="#fbbf24" /></div>
        <div className="stat-value">{activeBin.Temperature}<span className="stat-unit">°C</span></div>
        <div className="stat-sub">Fire Risk: {activeBin.Temperature > 45 ? 'HIGH' : 'Low'}</div>
      </div>

      <div className="glass-panel stat-card" style={activeBin.Methane_PPM > 300 ? { border: '1px solid rgba(248, 113, 113, 0.5)' } : {}}>
        <div className="stat-header"><span>Methane Gas (Odor)</span><Wind size={24} color={activeBin.Methane_PPM > 300 ? "#f87171" : "#34d399"} /></div>
        <div className="stat-value" style={{ color: activeBin.Methane_PPM > 300 ? '#f87171' : '#f8fafc' }}>
          {activeBin.Methane_PPM}<span className="stat-unit"> PPM</span>
        </div>
        <div className="stat-sub">Air Quality: {activeBin.Methane_PPM > 300 ? 'Hazardous' : 'Safe'}</div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-header"><span>Battery Status</span><Battery size={24} color={activeBin.Battery_Level < 20 ? '#f87171' : '#34d399'} /></div>
        <div className="stat-value">{activeBin.Battery_Level}<span className="stat-unit">%</span></div>
        <div className="stat-sub">{activeBin.Battery_Level < 20 ? 'Needs charging soon' : 'Healthy'}</div>
      </div>
    </div>
  );
}

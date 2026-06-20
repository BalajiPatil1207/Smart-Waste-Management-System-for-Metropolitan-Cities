import React from 'react';
import { Trash2, Thermometer, Battery, Wind } from 'lucide-react';

export default function StatCards({ activeBin }) {
  return (
    <div className="grid-top">
      <div className="glass-panel stat-card">
        <div className="stat-header"><span>Garbage Level</span><Trash2 size={24} color="#38bdf8" /></div>
        <div className="stat-value" style={{ color: activeBin.Fill_Level > 80 ? '#f87171' : '#f8fafc' }}>
          {activeBin.Fill_Level}<span className="stat-unit">%</span>
        </div>
        <div className="stat-sub">Predicted Full: {activeBin.Fill_Level > 80 ? 'Immediately' : (100 - activeBin.Fill_Level) + ' hrs'}</div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-header"><span>Inside Temperature</span><Thermometer size={24} color="#fbbf24" /></div>
        <div className="stat-value">{activeBin.Temperature}<span className="stat-unit">°C</span></div>
        <div className="stat-sub">Fire Risk: {activeBin.Temperature > 45 ? 'HIGH' : 'Low'}</div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-header"><span>Methane Gas (Odor)</span><Wind size={24} color="#34d399" /></div>
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

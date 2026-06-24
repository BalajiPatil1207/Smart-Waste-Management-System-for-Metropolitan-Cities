import React from 'react';
import { Layers, Truck, CalendarCheck, MapPin, ShieldAlert, AlertTriangle, CheckCircle2, Thermometer, Battery, Wind, Eye } from 'lucide-react';

export default function BinSeparation({
    fleetData,
    setActiveBinId,
    setCurrentView,
    getStatusMeaning,
    onDispatchTruck,
    toggleRoute,
    showRoute
}) {
    const bins = Object.values(fleetData).sort((a, b) => a.Bin_ID.localeCompare(b.Bin_ID));

    // Categorize bins
    const criticalBins = bins.filter(bin => bin.Fill_Level >= 80 || bin.Status === "Critical Full" || bin.Status === "Toxic Odor");
    const moderateBins = bins.filter(bin => (bin.Fill_Level >= 50 && bin.Fill_Level < 80) || bin.Status === "Moderate" || bin.Status === "Low Battery");
    const normalBins = bins.filter(bin => bin.Fill_Level < 50 && bin.Status !== "Critical Full" && bin.Status !== "Toxic Odor" && bin.Status !== "Moderate" && bin.Status !== "Low Battery");

    const handleLocateOnMap = (binId) => {
        setActiveBinId(binId);
        setCurrentView('dashboard');
    };

    const renderBinCard = (bin, categoryColor, categoryIcon, actionText, actionButtonText, actionButtonHandler, isUrgent) => {
        let dotColor = "#34d399";
        if (bin.Fill_Level > 80 || bin.Methane_PPM > 350) dotColor = "#f87171";
        else if (bin.Fill_Level > 50) dotColor = "#fbbf24";

        return (
            <div 
                key={bin.Bin_ID} 
                className="glass-panel pop-in" 
                style={{
                    padding: '1.5rem',
                    border: `1px solid rgba(255, 255, 255, 0.08)`,
                    borderTop: `4px solid ${categoryColor}`,
                    background: 'rgba(15, 23, 42, 0.55)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ backgroundColor: dotColor }}></div>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>{bin.Bin_ID}</span>
                    </div>
                    <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '12px', 
                        background: `${categoryColor}22`, 
                        color: categoryColor,
                        border: `1px solid ${categoryColor}44`
                    }}>
                        {bin.Status}
                    </span>
                </div>

                {/* Progress / Fill Level */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#94a3b8' }}>
                        <span>Fill Level</span>
                        <span style={{ fontWeight: 'bold', color: dotColor }}>{bin.Fill_Level}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${bin.Fill_Level}%`, height: '100%', background: categoryColor, borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
                    </div>
                </div>

                {/* Micro Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Wind size={14} color="#38bdf8" />
                        <span>Gas: <strong style={{ color: bin.Methane_PPM > 350 ? '#f87171' : '#34d399' }}>{bin.Methane_PPM} PPM</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Battery size={14} color="#a78bfa" />
                        <span>Battery: <strong>{bin.Battery_Level}%</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Thermometer size={14} color="#f43f5e" />
                        <span>Temp: <strong>{bin.Temperature}°C</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Eye size={14} color="#60a5fa" />
                        <span>Lid: <strong>{bin.Lid_Status}</strong></span>
                    </div>
                </div>

                {/* Recommendation Alert Box */}
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: `${categoryColor}10`,
                    border: `1px solid ${categoryColor}25`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: categoryColor,
                    marginTop: '0.5rem'
                }}>
                    {categoryIcon}
                    <span>{actionText}</span>
                </div>

                {/* Actions Grid */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button 
                        onClick={() => handleLocateOnMap(bin.Bin_ID)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexGrow: 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#94a3b8';
                        }}
                        title="Locate Bin on Live Map"
                    >
                        <MapPin size={16} style={{ marginRight: '5px' }} /> Map View
                    </button>
                    {actionButtonText && (
                        <button 
                            onClick={() => actionButtonHandler(bin.Bin_ID)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                background: isUrgent ? '#ef4444' : 'rgba(251, 191, 36, 0.15)',
                                border: isUrgent ? 'none' : '1px solid #fbbf24',
                                color: isUrgent ? '#fff' : '#fbbf24',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                flexGrow: 2,
                                transition: 'all 0.2s',
                                boxShadow: isUrgent ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
                            }}
                            onMouseOver={(e) => {
                                if (isUrgent) {
                                    e.currentTarget.style.background = '#dc2626';
                                } else {
                                    e.currentTarget.style.background = 'rgba(251, 191, 36, 0.25)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (isUrgent) {
                                    e.currentTarget.style.background = '#ef4444';
                                } else {
                                    e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)';
                                }
                            }}
                        >
                            {isUrgent ? <Truck size={16} /> : <CalendarCheck size={16} />}
                            {actionButtonText}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const handlePlanPickup = () => {
        // Switch to route optimization
        if (!showRoute) {
            toggleRoute();
        }
        setCurrentView('dashboard');
    };

    return (
        <div className="glass-panel pop-in" style={{ padding: '2rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.2rem' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', marginBottom: '0.4rem', fontSize: '1.8rem' }}>
                        <Layers size={28} /> Smart Bin Separation Panel
                    </h2>
                    <p style={{ color: '#94a3b8', margin: 0 }}>
                        Monitor and separate smart bins dynamically based on fill levels and urgent pickup status.
                    </p>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(15, 23, 42, 0.4)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Fleet Bins</span>
                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#cbd5e1' }}>{bins.length}</span>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 'bold' }}>Critical (Urgent)</span>
                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#ef4444' }}>{criticalBins.length}</span>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 'bold' }}>Moderate (Planned)</span>
                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fbbf24' }}>{moderateBins.length}</span>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 'bold' }}>Normal / Empty</span>
                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981' }}>{normalBins.length}</span>
                </div>
            </div>

            {/* Bins Categorization Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
                
                {/* 1. CRITICAL CATEGORY */}
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', borderBottom: '1px solid rgba(248, 113, 113, 0.15)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        <ShieldAlert size={20} /> Critical Level Bins (Action Required)
                    </h3>
                    {criticalBins.length === 0 ? (
                        <p style={{ color: '#64748b', fontStyle: 'italic', paddingLeft: '0.5rem' }}>No bins are currently at critical level.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                            {criticalBins.map(bin => renderBinCard(
                                bin,
                                '#ef4444',
                                <ShieldAlert size={16} />,
                                "👉 URGENT: Dispatch Truck!",
                                "Dispatch Truck",
                                onDispatchTruck,
                                true
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. MODERATE CATEGORY */}
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', borderBottom: '1px solid rgba(251, 191, 36, 0.15)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        <AlertTriangle size={20} /> Moderate Level Bins (Planning Phase)
                    </h3>
                    {moderateBins.length === 0 ? (
                        <p style={{ color: '#64748b', fontStyle: 'italic', paddingLeft: '0.5rem' }}>No bins are currently at moderate level.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                            {moderateBins.map(bin => renderBinCard(
                                bin,
                                '#fbbf24',
                                <AlertTriangle size={16} />,
                                "👉 Plan Pickup Soon",
                                "Plan Pickup",
                                handlePlanPickup,
                                false
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. NORMAL CATEGORY */}
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', borderBottom: '1px solid rgba(52, 211, 153, 0.15)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        <CheckCircle2 size={20} /> Normal / Low Level Bins (Stable)
                    </h3>
                    {normalBins.length === 0 ? (
                        <p style={{ color: '#64748b', fontStyle: 'italic', paddingLeft: '0.5rem' }}>No bins are currently at normal/low level.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                            {normalBins.map(bin => renderBinCard(
                                bin,
                                '#10b981',
                                <CheckCircle2 size={16} />,
                                "👉 Monitoring / No Action Needed",
                                null,
                                null,
                                false
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

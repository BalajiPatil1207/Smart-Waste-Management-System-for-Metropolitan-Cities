import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { AlertTriangle } from 'lucide-react';
import L from 'leaflet';

const DEPOT_LOCATION = [28.6100, 77.2000];

function MapUpdater({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
  }, [lat, lng, map]);
  return null;
}

export default function MapSection({ 
    activeBin, 
    fleetData, 
    showRoute, 
    routeCoords, 
    greenIcon, 
    redIcon, 
    orangeIcon, 
    getStatusMeaning,
    isFullMap,
    setIsFullMap
}) {
    return (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: isFullMap ? 'calc(100vh - 180px)' : 'auto' }}>
            <div className="chart-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={20} color="#fbbf24" /> Live Map Tracking
                </span>
                <button 
                  onClick={() => setIsFullMap(!isFullMap)} 
                  style={{ 
                    padding: '6px 12px', 
                    background: 'rgba(56, 189, 248, 0.1)', 
                    border: '1px solid #38bdf8', 
                    borderRadius: '6px', 
                    color: '#38bdf8', 
                    fontWeight: '600', 
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#38bdf8';
                    e.target.style.color = '#0f172a';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(56, 189, 248, 0.1)';
                    e.target.style.color = '#38bdf8';
                  }}
                >
                  {isFullMap ? 'Back to Dashboard' : 'View Full Map'}
                </button>
            </div>
            <div className="map-wrapper" style={{ flexGrow: 1, borderRadius: '12px', overflow: 'hidden', minHeight: '300px' }}>
                <MapContainer center={[activeBin.Latitude, activeBin.Longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                    
                    {showRoute && (
                        <Marker position={DEPOT_LOCATION}>
                            <Popup><strong>Garbage Truck Depot</strong></Popup>
                        </Marker>
                    )}

                    {Object.values(fleetData).map(bin => {
                        let markerIcon = greenIcon;
                        if (bin.Status === "Critical Full" || bin.Status === "Toxic Odor") markerIcon = redIcon;
                        else if (bin.Status === "Moderate" || bin.Status === "Low Battery") markerIcon = orangeIcon;

                        return (
                            <Marker 
                                key={bin.Bin_ID} 
                                position={[bin.Latitude, bin.Longitude]}
                                icon={markerIcon}
                            >
                                <Popup>
                                    <strong>{bin.Bin_ID}</strong><br/>
                                    Fill: {bin.Fill_Level}%<br/>
                                    Status: {bin.Status}<br/>
                                    <em>({getStatusMeaning(bin.Status)})</em>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {showRoute && routeCoords.length > 0 && (
                        <Polyline positions={routeCoords} color="#f87171" weight={4} dashArray="10, 10" />
                    )}

                    <MapUpdater lat={activeBin.Latitude} lng={activeBin.Longitude} />
                </MapContainer>
            </div>
        </div>
    );
}

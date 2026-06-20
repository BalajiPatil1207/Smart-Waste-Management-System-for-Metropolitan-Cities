import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Trash2, AlertTriangle, MapPin, Download, Server, Route } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import newly extracted components
import LoginScreen from './components/LoginScreen';
import StatCards from './components/StatCards';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DEPOT_LOCATION = [28.6100, 77.2000]; // Base Station / Truck Depot

function MapUpdater({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
  }, [lat, lng, map]);
  return null;
}

export default function App() {
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [fleetData, setFleetData] = useState({});
  const [activeBinId, setActiveBinId] = useState(null);
  
  // Persistent History (Data Saving)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("binHistory");
    return saved ? JSON.parse(saved) : {};
  });

  const [showRoute, setShowRoute] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [isRouting, setIsRouting] = useState(false);
  const chartRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === "admin" && password.trim() === "password123") {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Use admin / password123");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/bins');
        if (res.ok) {
          const data = await res.json();
          if (Object.keys(data).length > 0) {
             setFleetData(data);
             setActiveBinId(prev => prev || Object.keys(data)[0]);
             
             setHistory(prev => {
                let newHist = { ...prev };
                Object.values(data).forEach(bin => {
                   const time = new Date(bin.Timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second:'2-digit', hour12: true });
                   if (!newHist[bin.Bin_ID]) newHist[bin.Bin_ID] = [];
                   
                   const lastPt = newHist[bin.Bin_ID][newHist[bin.Bin_ID].length - 1];
                   if (!lastPt || lastPt.time !== time) {
                       newHist[bin.Bin_ID] = [...newHist[bin.Bin_ID], { time, level: bin.Fill_Level, gas: bin.Methane_PPM }];
                       if (newHist[bin.Bin_ID].length > 15) newHist[bin.Bin_ID] = newHist[bin.Bin_ID].slice(-15);
                   }
                });
                localStorage.setItem("binHistory", JSON.stringify(newHist)); // Save to LocalStorage
                return newHist;
             });
          }
        }
      } catch (err) {
        console.error("Failed to fetch API", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handlePingDevice = async () => {
    try { await fetch('/api/trigger'); } catch (err) {}
  };

  const handleDownloadPdf = async () => {
    const element = chartRef.current;
    const activeBin = fleetData[activeBinId];
    if (!element || !activeBin) return;
    try {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0f172a' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        pdf.setFontSize(18);
        pdf.text(`Smart Bin Analytics Report - ID: ${activeBin.Bin_ID}`, 15, 15);
        pdf.setFontSize(11);
        pdf.text(`Date & Time: ${new Date().toLocaleString()}`, 15, 22);
        pdf.text(`Status: ${activeBin.Status} | Fill: ${activeBin.Fill_Level}%`, 15, 28);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 30; 
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 15, 35, pdfWidth, pdfHeight);
        pdf.save(`Bin_${activeBin.Bin_ID}_Report.pdf`);
    } catch (err) { console.error(err); }
  };

  const getStatusMeaning = (status) => {
    switch(status) {
        case "Empty": return "No Action Needed";
        case "Moderate": return "Plan Pickup Soon";
        case "Critical Full": return "URGENT: Dispatch Truck!";
        case "Toxic Odor": return "HAZARD: Clean Immediately";
        case "Low Battery": return "Maintenance Required";
        default: return "Monitoring...";
    }
  };

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <LoginScreen 
         handleLogin={handleLogin}
         username={username} setUsername={setUsername}
         password={password} setPassword={setPassword}
         loginError={loginError}
      />
    );
  }

  if (Object.keys(fleetData).length === 0 || !activeBinId) {
    return <div className="loading">Initializing Smart City Fleet Link...</div>;
  }

  const activeBin = fleetData[activeBinId];
  const activeHistory = history[activeBinId] || [];

  let statusClass = "status-normal";
  if (activeBin.Status === "Critical Full" || activeBin.Status === "Toxic Odor") statusClass = "status-critical";
  else if (activeBin.Status === "Moderate" || activeBin.Status === "Low Battery") statusClass = "status-warning";

  // --- AI ROUTE OPTIMIZATION ---
  const binsNeedingPickup = Object.values(fleetData).filter(b => b.Fill_Level > 80 || b.Status === "Critical Full");
  
  const toggleRoute = async () => {
    if (showRoute) {
      setShowRoute(false);
      setRouteCoords([]);
      return;
    }
    
    if (binsNeedingPickup.length === 0) {
      setShowRoute(true);
      return;
    }
    
    setIsRouting(true);
    const points = [DEPOT_LOCATION, ...binsNeedingPickup.map(b => [b.Latitude, b.Longitude]), DEPOT_LOCATION];
    const coordsString = points.map(p => `${p[1]},${p[0]}`).join(';');
    
    try {
      // Use OSRM API to get actual street roads instead of straight lines
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
         setRouteCoords(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
      } else {
         setRouteCoords(points); // Fallback to straight lines
      }
    } catch (err) {
      setRouteCoords(points); // Fallback
    }
    setIsRouting(false);
    setShowRoute(true);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
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
        
        {/* Logout at bottom of sidebar */}
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem("isLoggedIn"); }} className="logout-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              Logout
            </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="dashboard-container">
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

        {/* Refactored Component */}
        <StatCards activeBin={activeBin} />

        <div className="grid-charts">
          <div className="glass-panel">
            <div className="chart-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trash2 size={20} /> Fill Level & Odor History</span>
              <button onClick={handleDownloadPdf} className="ping-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <Download size={16}/> Download PDF Report
              </button>
            </div>
            <div className="chart-container" style={{ width: '100%', minHeight: '300px', padding: '10px' }} ref={chartRef}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activeHistory}>
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} /><stop offset="95%" stopColor="#38bdf8" stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.8} /><stop offset="95%" stopColor="#34d399" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" yAxisId="left" />
                  <YAxis stroke="#94a3b8" yAxisId="right" orientation="right" />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="level" stroke="#38bdf8" fillOpacity={1} fill="url(#colorLevel)" name="Fill Level (%)" isAnimationActive={false} />
                  <Area yAxisId="right" type="monotone" dataKey="gas" stroke="#34d399" fillOpacity={1} fill="url(#colorGas)" name="Gas (PPM)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="chart-title"><AlertTriangle size={20} color="#fbbf24" /> Live Map Tracking</div>
            <div className="map-wrapper" style={{ flexGrow: 1, borderRadius: '12px', overflow: 'hidden', minHeight: '300px' }}>
              <MapContainer center={[activeBin.Latitude, activeBin.Longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                
                {/* Depot Marker */}
                {showRoute && (
                  <Marker position={DEPOT_LOCATION}>
                     <Popup><strong>Garbage Truck Depot</strong></Popup>
                  </Marker>
                )}

                {/* Bin Markers */}
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

                {/* AI Route Polyline along streets */}
                {showRoute && routeCoords.length > 0 && (
                  <Polyline positions={routeCoords} color="#f87171" weight={4} dashArray="10, 10" />
                )}

                <MapUpdater lat={activeBin.Latitude} lng={activeBin.Longitude} />
              </MapContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

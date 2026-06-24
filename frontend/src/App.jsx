import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HelpCircle } from 'lucide-react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Import Custom Components
import LandingScreen from './components/LandingScreen';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import StatCards from './components/StatCards';
import ChartSection from './components/ChartSection';
import MapSection from './components/MapSection';
import DispatchReport from './components/DispatchReport';
import HardwareSimulator from './components/HardwareSimulator';
import WasteSegregation from './components/WasteSegregation';
import BinSeparation from './components/BinSeparation';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
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

const DEPOT_LOCATION = [28.6100, 77.2000];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");
  const [showLanding, setShowLanding] = useState(() => localStorage.getItem("isLoggedIn") !== "true");
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [dispatchLogs, setDispatchLogs] = useState(() => {
    const saved = localStorage.getItem("dispatchLogs");
    return saved ? JSON.parse(saved) : [];
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [fleetData, setFleetData] = useState({});
  const [activeBinId, setActiveBinId] = useState(null);
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("binHistory");
    return saved ? JSON.parse(saved) : {};
  });

  const [showRoute, setShowRoute] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [isRouting, setIsRouting] = useState(false);
  const [isFullMap, setIsFullMap] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLanding(true);
    }
  }, [isLoggedIn]);

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
                localStorage.setItem("binHistory", JSON.stringify(newHist));
                return newHist;
             });

             // Auto Dispatch Logic
             setDispatchLogs(prev => {
                let newLogs = [...prev];
                let changed = false;
                
                Object.values(data).forEach(bin => {
                   if (bin.Fill_Level >= 95) {
                      // Check if already dispatched recently (1 minute cooldown for simulation)
                      const today = new Date().toLocaleDateString();
                      const alreadyDispatched = newLogs.some(log => {
                          if (log.binId !== bin.Bin_ID) return false;
                          if (!log.timestamp) return false; // Ignore old logs without timestamps
                          return (Date.now() - log.timestamp) < 60000; // 60 seconds cooldown
                      });
                      
                      if (!alreadyDispatched) {
                         newLogs.unshift({
                            id: Date.now() + Math.random(),
                            binId: bin.Bin_ID,
                            truckNo: `MH-12-SW-${Math.floor(100 + Math.random() * 900)}`,
                            date: today,
                            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                            timestamp: Date.now()
                         });
                         changed = true;
                      }
                   }
                });
                
                if (changed) {
                   localStorage.setItem("dispatchLogs", JSON.stringify(newLogs));
                   return newLogs;
                }
                return prev;
             });
          }
        }
      } catch (err) {
        console.error("Failed to fetch API", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handlePingDevice = async () => {
    try { await fetch('/api/trigger'); } catch (err) {}
  };

  const handleLidToggle = async (binId, nextLidStatus) => {
    const bin = fleetData[binId];
    if (!bin) return;
    
    const updatedBin = {
      ...bin,
      Lid_Status: nextLidStatus,
      Timestamp: new Date().toISOString()
    };
    
    // Update local state immediately for snappy UI
    setFleetData(prev => ({
      ...prev,
      [binId]: updatedBin
    }));
    
    try {
      const response = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Bin_ID: binId,
          Fill_Level: bin.Fill_Level,
          Methane_PPM: bin.Methane_PPM,
          Temperature: bin.Temperature,
          Battery_Level: bin.Battery_Level,
          Humidity: bin.Humidity,
          Lid_Status: nextLidStatus,
          Solar_Charge: bin.Solar_Charge
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFleetData(prev => ({
            ...prev,
            [binId]: result.data
          }));
        }
      }
    } catch (err) {
      console.error("Failed to sync lid toggle", err);
    }
  };

  const handleDispatchTruck = async (binId) => {
    const bin = fleetData[binId];
    if (!bin) return;

    const updatedBin = {
      ...bin,
      Fill_Level: 0,
      Methane_PPM: 50,
      Status: "Empty",
      Timestamp: new Date().toISOString()
    };

    setFleetData(prev => ({
      ...prev,
      [binId]: updatedBin
    }));

    setDispatchLogs(prev => {
      const today = new Date().toLocaleDateString();
      const newLog = {
        id: Date.now() + Math.random(),
        binId: binId,
        truckNo: `MH-12-SW-${Math.floor(100 + Math.random() * 900)}`,
        date: today,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        timestamp: Date.now()
      };
      const updated = [newLog, ...prev];
      localStorage.setItem("dispatchLogs", JSON.stringify(updated));
      return updated;
    });

    try {
      const response = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Bin_ID: binId,
          Fill_Level: 0,
          Methane_PPM: 50,
          Temperature: bin.Temperature,
          Battery_Level: bin.Battery_Level,
          Humidity: bin.Humidity,
          Lid_Status: bin.Lid_Status,
          Solar_Charge: bin.Solar_Charge
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFleetData(prev => ({
            ...prev,
            [binId]: result.data
          }));
        }
      }
    } catch (err) {
      console.error("Failed to sync dispatch telemetry", err);
    }
  };

  const calculatePrediction = (historyList) => {
    if (!historyList || historyList.length < 3) return "Analyzing rate...";
    
    const points = [...historyList].slice(-6); // last 6 points
    let deltas = [];
    for (let i = 1; i < points.length; i++) {
      deltas.push(points[i].level - points[i - 1].level);
    }
    
    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    
    if (avgDelta <= 0) {
      return "Steady Capacity";
    }
    
    const currentLevel = points[points.length - 1].level;
    const remainingLevel = 95 - currentLevel;
    if (remainingLevel <= 0) {
      return "Overflowing!";
    }
    
    const secondsRemaining = (remainingLevel / avgDelta) * 10;
    const minutesRemaining = Math.ceil(secondsRemaining / 60);
    
    if (minutesRemaining > 120) {
      return `Steady (~${Math.round(minutesRemaining / 60)} hrs)`;
    }
    return `${minutesRemaining} min left`;
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

  const toggleRoute = async () => {
    const binsNeedingPickup = Object.values(fleetData).filter(b => b.Fill_Level > 80 || b.Status === "Critical Full");
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
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
         setRouteCoords(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
      } else {
         setRouteCoords(points);
      }
    } catch (err) {
      setRouteCoords(points);
    }
    setIsRouting(false);
    setShowRoute(true);
  };

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        { element: '#tour-bins', popover: { title: 'Smart Bins', description: 'These are your active IoT bins. Select one to view its live fill level and odor data in the dashboard.', side: "right", align: 'start' }},
        { element: '#tour-reports', popover: { title: 'Dispatch Reports', description: 'View the history of all automatically dispatched garbage trucks and download full CSV reports.', side: "right", align: 'start' }},
        { element: '#tour-route', popover: { title: 'Optimize Truck Route', description: 'Automatically calculates the shortest driving path using OpenStreetMap to pick up only the full bins.', side: "right", align: 'start' }},
        { element: '#tour-fullmap', popover: { title: 'Full Screen Map', description: 'Expand the map to get a larger view of your fleet locations and calculated truck routes.', side: "left", align: 'start' }}
      ]
    });
    driverObj.drive();
  };

  if (showLanding && !isLoggedIn) {
    return <LandingScreen onStart={() => setShowLanding(false)} />;
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen 
         handleLogin={handleLogin}
         username={username} setUsername={setUsername}
         password={password} setPassword={setPassword}
         loginError={loginError}
         onBack={() => setShowLanding(true)}
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

  const binsNeedingPickup = Object.values(fleetData).filter(b => b.Fill_Level > 80 || b.Status === "Critical Full");

  return (
    <div className="app-layout">
      <Sidebar 
        setIsLoggedIn={setIsLoggedIn}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="dashboard-container">
        <DashboardHeader 
          handlePingDevice={handlePingDevice}
          statusClass={statusClass}
          getStatusMeaning={getStatusMeaning}
          activeBin={activeBin}
          handleLidToggle={handleLidToggle}
          projection={calculatePrediction(activeHistory)}
          fleetData={fleetData}
          setActiveBinId={setActiveBinId}
        />

        {currentView === 'reports' ? (
          <DispatchReport dispatchLogs={dispatchLogs} />
        ) : currentView === 'simulator' ? (
          <HardwareSimulator 
             fleetData={fleetData}
             activeBinId={activeBinId}
             setActiveBinId={setActiveBinId}
             setFleetData={setFleetData}
             getStatusMeaning={getStatusMeaning}
          />
        ) : currentView === 'segregation' ? (
          <WasteSegregation />
        ) : currentView === 'separation' ? (
          <BinSeparation 
             fleetData={fleetData}
             setActiveBinId={setActiveBinId}
             setCurrentView={setCurrentView}
             getStatusMeaning={getStatusMeaning}
             onDispatchTruck={handleDispatchTruck}
             toggleRoute={toggleRoute}
             showRoute={showRoute}
          />
        ) : isFullMap ? (
          <MapSection 
             activeBin={activeBin}
             fleetData={fleetData}
             showRoute={showRoute}
             routeCoords={routeCoords}
             greenIcon={greenIcon}
             redIcon={redIcon}
             orangeIcon={orangeIcon}
             getStatusMeaning={getStatusMeaning}
             isFullMap={isFullMap}
             setIsFullMap={setIsFullMap}
             setActiveBinId={setActiveBinId}
          />
        ) : (
          <>
            <StatCards activeBin={activeBin} />

            <div className="grid-charts">
              <ChartSection 
                 activeHistory={activeHistory} 
                 handleDownloadPdf={handleDownloadPdf} 
                 chartRef={chartRef} 
              />

              <MapSection 
                 activeBin={activeBin}
                 fleetData={fleetData}
                 showRoute={showRoute}
                 routeCoords={routeCoords}
                 greenIcon={greenIcon}
                 redIcon={redIcon}
                 orangeIcon={orangeIcon}
                 getStatusMeaning={getStatusMeaning}
                 isFullMap={isFullMap}
                 setIsFullMap={setIsFullMap}
                 setActiveBinId={setActiveBinId}
              />
            </div>
          </>
        )}
      </main>

      <button className="help-fab" onClick={startTour} title="Start Guided Tour">
        <HelpCircle size={30} />
      </button>
    </div>
  );
}

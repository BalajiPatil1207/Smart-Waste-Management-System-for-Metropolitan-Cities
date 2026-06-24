import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, RefreshCw, Wifi, WifiOff, Database, Thermometer, Battery, Wind, Disc, Eye, Sun } from 'lucide-react';

export default function HardwareSimulator({
    fleetData,
    activeBinId,
    setActiveBinId,
    setFleetData,
    getStatusMeaning
}) {
    const [selectedBin, setSelectedBin] = useState(activeBinId || 'BIN001');
    const [distance, setDistance] = useState(25); // 2cm to 40cm
    const [gasPpm, setGasPpm] = useState(120); // 50 to 500 PPM
    const [temperature, setTemperature] = useState(28); // 20 to 50 C
    const [humidity, setHumidity] = useState(55); // 20% to 90%
    const [battery, setBattery] = useState(85); // 0 to 100%
    const [wifiRssi, setWifiRssi] = useState(-55); // -100 to -30 dBm
    const [solarLux, setSolarLux] = useState(0); // 0 to 1000 Lux

    const [lidStatus, setLidStatus] = useState('CLOSED'); // 'CLOSED', 'OPEN'
    const [pirMotion, setPirMotion] = useState(false);
    const [autoSync, setAutoSync] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'online', 'offline'
    const [syncing, setSyncing] = useState(false);
    const [logs, setLogs] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const syncTimeoutRef = useRef(null);
    const pirTimeoutRef = useRef(null);

    // Derived states
    const fillLevel = Math.max(0, Math.min(100, Math.round(((40 - distance) / 36) * 100)));
    const solarVoltage = Math.round((solarLux / 1000) * 5 * 100) / 100; // 0 to 5V
    const isCharging = solarLux > 100 && battery < 100;
    const buzzerActive = fillLevel >= 95 || gasPpm > 350;

    // LED status lights
    const ledGreen = fillLevel <= 50;
    const ledYellow = fillLevel > 50 && fillLevel <= 80;
    const ledRed = fillLevel > 80;
    const ledBlue = gasPpm > 350 || battery < 20 || lidStatus === 'OPEN';

    // Synchronize slider changes with fleetData on selectedBin change
    useEffect(() => {
        if (fleetData && fleetData[selectedBin]) {
            const binInfo = fleetData[selectedBin];
            const fill = binInfo.Fill_Level !== undefined ? binInfo.Fill_Level : 0;
            const calcDist = Math.max(2, Math.min(40, Math.round(40 - (fill / 100 * 36))));
            
            setDistance(calcDist);
            setGasPpm(binInfo.Methane_PPM !== undefined ? binInfo.Methane_PPM : 120);
            setTemperature(binInfo.Temperature !== undefined ? binInfo.Temperature : 28);
            setBattery(binInfo.Battery_Level !== undefined ? binInfo.Battery_Level : 85);
            setHumidity(binInfo.Humidity !== undefined ? binInfo.Humidity : 55);
            setLidStatus(binInfo.Lid_Status || 'CLOSED');
            setSolarLux(binInfo.Solar_Charge ? Math.round((binInfo.Solar_Charge / 5) * 1000) : 0);
        }
    }, [selectedBin, fleetData]);

    // Test connection on mount
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const res = await fetch('/api/bins');
                if (res.ok) {
                    setConnectionStatus('online');
                    addLog("Wi-Fi System: connected to AP metropolitan-mesh-net.");
                    addLog("HTTP Client: Node-RED server link active.");
                } else {
                    setConnectionStatus('offline');
                    addLog("Wi-Fi System: Local AP connected. Node-RED server link offline.");
                }
            } catch (err) {
                setConnectionStatus('offline');
                addLog("Wi-Fi System: Local AP connected. Node-RED server link offline.");
            }
        };
        checkConnection();
    }, []);

    // Simulating Solar Charge / Battery Drain cycle
    useEffect(() => {
        const interval = setInterval(() => {
            if (isCharging) {
                setBattery(prev => {
                    const next = Math.min(100, prev + 1);
                    if (next === 100) addLog("[Power Manager] LiPo Battery fully charged (100%).");
                    else if (next % 5 === 0) addLog(`[Power Manager] Solar charging active: ${solarVoltage}V. Battery: ${next}%`);
                    return next;
                });
            } else if (battery > 5) {
                const drainChance = buzzerActive || lidStatus === 'OPEN' ? 0.35 : 0.05;
                if (Math.random() < drainChance) {
                    setBattery(prev => {
                        const next = Math.max(0, prev - 1);
                        if (next === 20) addLog("[ALERT] Low battery warning (20%). Connect solar power.");
                        return next;
                    });
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isCharging, solarVoltage, battery, buzzerActive, lidStatus]);

    // Monitor critical alerts for buzzer logging
    useEffect(() => {
        if (buzzerActive) {
            const alarmType = fillLevel >= 95 ? "BIN FULL" : "TOXIC GAS METHANE";
            addLog(`[BUZZER ALARM] GPIO25 HIGH: ${alarmType} alert active! Beeping Piezo...`);
        }
    }, [buzzerActive, fillLevel, gasPpm]);

    // Audio oscillator beep loop
    useEffect(() => {
        if (!buzzerActive || isMuted) return;

        let audioCtx;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API not supported", e);
            return;
        }

        const playBeep = () => {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(2400, audioCtx.currentTime); // 2.4kHz typical piezo buzzer frequency
            
            gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
        };

        playBeep();
        const interval = setInterval(playBeep, 1500);

        return () => {
            clearInterval(interval);
            if (audioCtx) {
                audioCtx.close();
            }
        };
    }, [buzzerActive, isMuted]);

    const addLog = (message) => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLogs(prev => [`[${time}] ${message}`, ...prev].slice(0, 7));
    };

    // Telemetry Sync sender
    const sendTelemetry = async (forcedValues = null) => {
        setSyncing(true);
        const payload = {
            Bin_ID: selectedBin,
            Fill_Level: forcedValues ? forcedValues.fill : fillLevel,
            Methane_PPM: forcedValues ? forcedValues.gas : gasPpm,
            Temperature: forcedValues ? forcedValues.temp : temperature,
            Battery_Level: forcedValues ? forcedValues.bat : battery,
            Humidity: forcedValues ? forcedValues.hum : humidity,
            Lid_Status: forcedValues ? forcedValues.lid : lidStatus,
            Solar_Charge: forcedValues ? forcedValues.solar : solarVoltage
        };

        let calculatedStatus = "Normal";
        if (payload.Fill_Level >= 95) calculatedStatus = "Critical Full";
        else if (payload.Methane_PPM > 350) calculatedStatus = "Toxic Odor";
        else if (payload.Battery_Level < 20) calculatedStatus = "Low Battery";
        else if (payload.Fill_Level > 50) calculatedStatus = "Moderate";
        else calculatedStatus = "Empty";

        if (setFleetData) {
            setFleetData(prev => {
                const currentBin = prev[selectedBin] || {};
                const updatedBin = {
                    ...currentBin,
                    ...payload,
                    Status: calculatedStatus,
                    Timestamp: new Date().toISOString()
                };
                return { ...prev, [selectedBin]: updatedBin };
            });
        }

        try {
            const response = await fetch('/api/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setConnectionStatus('online');
                addLog(`[HTTP POST] Live packet sync successful. Status: ${calculatedStatus}`);
            } else {
                setConnectionStatus('offline');
                addLog(`[Local Core] Telemetry synced locally (Node-RED returned HTTP ${response.status})`);
            }
        } catch (err) {
            setConnectionStatus('offline');
            addLog(`[Local Core] Telemetry synced locally (Server unreachable)`);
        } finally {
            setSyncing(false);
        }
    };

    // Auto-sync debouncer
    useEffect(() => {
        if (!autoSync) return;
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

        syncTimeoutRef.current = setTimeout(() => {
            sendTelemetry();
        }, 500);

        return () => clearTimeout(syncTimeoutRef.current);
    }, [distance, gasPpm, temperature, humidity, battery, selectedBin, autoSync, lidStatus, solarLux]);

    // Handle PIR proximity Hand Wave
    const triggerPirMotion = () => {
        if (lidStatus === 'OPEN' || pirMotion) return;

        setPirMotion(true);
        setLidStatus('OPEN');
        addLog("[PIR HC-SR501] motion detected! Interrupt G15 HIGH.");
        addLog("[SG90 Servo] PWM signal G13 sent. Rotating shaft to 90°...");

        // Auto close after 4 seconds
        if (pirTimeoutRef.current) clearTimeout(pirTimeoutRef.current);
        pirTimeoutRef.current = setTimeout(() => {
            setLidStatus('CLOSED');
            setPirMotion(false);
            addLog("[Timer Interrupt] Lid timeout reached. Closing lid.");
            addLog("[SG90 Servo] Rotating shaft back to 0°...");
        }, 4000);
    };

    const handleReset = () => {
        setDistance(38);
        setGasPpm(75);
        setTemperature(25);
        setHumidity(50);
        setBattery(100);
        setSolarLux(0);
        setLidStatus('CLOSED');
        setPirMotion(false);
        addLog("[RST Button] Hardware restarted. ESP32 Bootloader v1.2 loaded.");
        
        setTimeout(() => {
            sendTelemetry({
                fill: 5,
                gas: 75,
                temp: 25,
                bat: 100,
                hum: 50,
                lid: 'CLOSED',
                solar: 0
            });
        }, 100);
    };

    // Derived Wi-Fi signal details
    const getWifiBars = () => {
        if (wifiRssi <= -90) return 0;
        if (wifiRssi <= -80) return 1;
        if (wifiRssi <= -70) return 2;
        if (wifiRssi <= -60) return 3;
        return 4;
    };

    const wifiBars = getWifiBars();

    return (
        <div className="simulator-view pop-in">
            <div className="header" style={{ marginBottom: '1.2rem', paddingBottom: '0.6rem' }}>
                <h1 style={{ fontSize: '1.8rem' }}><Cpu size={28} color="#38bdf8" /> Virtual IoT Smart City Node Simulator</h1>
                <div className="header-actions">
                    <span className={`status-badge ${connectionStatus === 'online' ? 'status-normal' : 'status-critical'}`} style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        {connectionStatus === 'online' ? <Wifi size={14} /> : <WifiOff size={14} />}
                        {connectionStatus === 'online' ? 'Node-RED: Live Link' : 'Node-RED: Offline (Demo Mode)'}
                    </span>
                    <button className="ping-btn" onClick={() => sendTelemetry()} disabled={syncing} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Synchronize Node
                    </button>
                </div>
            </div>

            <div className="simulator-grid">
                
                {/* Visual PCB Canvas */}
                <div className={`glass-panel pcb-card ${isFullScreen ? 'fullscreen' : ''}`}>
                    <div className="pcb-title-bar">
                        <h3>Advanced ESP32 Smart Bin PCB Workbench</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="bin-tag" style={{ background: 'rgba(167, 139, 250, 0.15)', borderColor: '#a78bfa', color: '#a78bfa' }}>
                                {selectedBin} Telemetry Node
                            </span>
                            <button 
                                onClick={() => setIsFullScreen(prev => !prev)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    background: 'rgba(56, 189, 248, 0.1)',
                                    border: '1px solid #38bdf8',
                                    borderRadius: '6px',
                                    color: '#38bdf8',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                {isFullScreen ? '🗗 Minimize' : '🗖 Maximize'}
                            </button>
                        </div>
                    </div>

                    <div className="pcb-container" style={{ padding: '1.5rem 0.5rem' }}>
                        {/* Strictly fixed dimensions for accurate SVG path alignment */}
                        <div className="pcb-circuit-board" style={{ width: '600px', height: '500px', padding: '1.2rem', position: 'relative' }}>
                            
                            {/* SVG Wires (Drawn between exact coordinate nodes on components) */}
                            <svg className="pcb-wires-svg" viewBox="0 0 600 500" style={{ position: 'absolute', top: 0, left: 0, width: '600px', height: '500px', pointerEvents: 'none', zIndex: 10 }}>
                                <defs>
                                    <linearGradient id="wire-red" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#ef4444" />
                                    </linearGradient>
                                    <linearGradient id="wire-black" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#4b5563" /><stop offset="100%" stopColor="#111827" />
                                    </linearGradient>
                                </defs>

                                {/* --- GND CONNECTIONS (Black wires routed to GND pins on left/right headers) --- */}
                                <path d="M 50 110 C 20 160, 120 350, 368 329" stroke="url(#wire-black)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* LCD GND -> R-GND */}
                                <path d="M 410 110 C 440 140, 390 350, 368 329" stroke="url(#wire-black)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* OLED GND -> R-GND */}
                                <path d="M 140 190 C 160 190, 200 197, 232 197" stroke="url(#wire-black)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* US GND -> L-GND */}
                                <path d="M 140 270 C 160 270, 190 210, 232 197" stroke="url(#wire-black)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* PIR GND -> L-GND */}
                                <path d="M 460 175 C 480 190, 420 320, 368 329" stroke="url(#wire-black)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* MQ135 GND -> R-GND */}
                                <path d="M 460 260 C 430 260, 310 210, 232 197" stroke="url(#wire-black)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* DHT11 GND -> L-GND */}
                                <path d="M 460 405 C 430 405, 390 350, 368 329" stroke="url(#wire-black)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* Servo GND -> R-GND */}
                                <path d="M 340 415 C 350 430, 375 360, 368 329" stroke="url(#wire-black)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* Buzzer GND -> R-GND */}
                                <path d="M 140 420 C 170 440, 200 240, 232 197" stroke="url(#wire-black)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* Solar GND -> L-GND */}

                                {/* --- VCC CONNECTIONS (Red wires routed to 5V/3V3 power sources) --- */}
                                <path d="M 60 110 C 40 140, 150 150, 368 185" stroke="url(#wire-red)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* LCD VCC -> R-5V */}
                                <path d="M 420 110 C 430 130, 300 170, 232 185" stroke="url(#wire-red)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* OLED VCC -> L-3V3 */}
                                <path d="M 140 160 C 180 160, 280 175, 368 185" stroke="url(#wire-red)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* US VCC -> R-5V */}
                                <path d="M 140 250 C 160 250, 180 195, 232 185" stroke="url(#wire-red)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* PIR VCC -> L-3V3 */}
                                <path d="M 460 165 C 430 165, 390 180, 368 185" stroke="url(#wire-red)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* MQ135 VCC -> R-5V */}
                                <path d="M 460 240 C 430 240, 310 195, 232 185" stroke="url(#wire-red)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* DHT11 VCC -> L-3V3 */}
                                <path d="M 460 415 C 440 370, 380 200, 368 185" stroke="url(#wire-red)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* Servo VCC -> R-5V */}
                                <path d="M 140 410 C 160 410, 200 350, 232 329" stroke="url(#wire-red)" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* Solar VCC -> L-VP (ADC Read) */}

                                {/* --- I2C SDA & SCL SHARED BUS LINES (Green & Yellow) --- */}
                                <path d="M 70 110 C 50 150, 100 280, 368 305" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* LCD SDA -> R-G21 */}
                                <path d="M 80 110 C 60 160, 110 290, 368 317" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* LCD SCL -> R-G22 */}
                                <path d="M 440 110 C 470 140, 390 280, 368 305" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.85" /> {/* OLED SDA -> R-G21 */}
                                <path d="M 430 110 C 460 150, 380 290, 368 317" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.85" /> {/* OLED SCL -> R-G22 */}

                                {/* --- SENSOR DATA LINES (Various colors) --- */}
                                <path d="M 140 170 C 170 170, 190 250, 232 269" stroke="#8b5cf6" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* US Trig -> L-G5 */}
                                <path d="M 140 180 C 170 180, 190 270, 232 281" stroke="#cbd5e1" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* US Echo -> L-G18 */}
                                <path d="M 140 260 C 170 260, 180 220, 232 209" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* PIR OUT -> L-G15 */}
                                <path d="M 460 195 C 410 195, 300 290, 232 305" stroke="#eab308" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* MQ135 AO -> L-G34 */}
                                <path d="M 460 250 C 430 250, 400 260, 368 269" stroke="#f97316" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* DHT11 DATA -> R-G33 */}
                                <path d="M 460 425 C 410 450, 280 340, 232 317" stroke="#f97316" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* Servo PWM -> L-VN */}
                                <path d="M 320 415 C 310 440, 380 320, 368 257" stroke="#ec4899" strokeWidth="1.5" fill="none" opacity="0.85"/> {/* Buzzer + -> R-G25 */}

                                {/* --- STATUS LED LINES --- */}
                                <path d="M 175 410 C 150 350, 320 230, 368 209" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.75"/> {/* Green LED -> R-G12 */}
                                <path d="M 200 410 C 180 365, 330 240, 368 221" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.75"/> {/* Yellow LED -> R-G14 */}
                                <path d="M 225 410 C 210 380, 340 250, 368 233" stroke="#ef4444" strokeWidth="1.5" fill="none" opacity="0.75"/> {/* Red LED -> R-G27 */}
                                <path d="M 250 410 C 240 395, 350 260, 368 245" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.75"/> {/* Blue LED -> R-G26 */}
                            </svg>

                            {/* [Component 1] 16x2 I2C LCD character display */}
                            <div className="hw-lcd-display" style={{ position: 'absolute', left: '30px', top: '25px', width: '250px', height: '85px', padding: '6px 8px' }}>
                                <div className="hw-lcd-screen" style={{ fontSize: '0.95rem', padding: '6px' }}>
                                    <div className="hw-lcd-line">BIN:{selectedBin} {fillLevel.toString().padStart(3, ' ')}%F</div>
                                    <div className="hw-lcd-line" style={{ marginTop: '1px' }}>LID:{lidStatus.padEnd(6, ' ')} T:{temperature}°C</div>
                                </div>
                                <div className="hw-lcd-brand">16x02 LCD Shield</div>
                            </div>

                            {/* [Component 2] SSD1306 OLED graphic Screen */}
                            <div className="hw-oled-display" style={{ position: 'absolute', left: '390px', top: '25px', width: '180px', height: '85px', padding: '4px' }}>
                                <div className="oled-screen-inner">
                                    <div className="oled-top-status">
                                        <span className="oled-wifi-icon">
                                            {wifiBars === 0 ? <WifiOff size={10} color="#f87171" /> : <Wifi size={10} />}
                                            <span style={{ fontSize: '0.5rem', marginLeft: '2px' }}>{wifiRssi}dBm</span>
                                        </span>
                                        <span className="oled-power-icon">
                                            {isCharging ? <Zap size={8} className="charging-bolt" /> : null}
                                            <span style={{ fontSize: '0.5rem' }}>{battery}%</span>
                                        </span>
                                    </div>
                                    <div className="oled-graphic-content">
                                        <div className="oled-bin-graphics">
                                            <div className="oled-bin-rim"></div>
                                            <div className="oled-bin-body">
                                                <div className="oled-bin-level" style={{ height: `${fillLevel}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="oled-text-stats">
                                            <div>GAS: {gasPpm} PPM</div>
                                            <div>HUM: {humidity}% RH</div>
                                            <div>SLR: {solarVoltage}V</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="hw-oled-brand">0.96" SSD1306 OLED</div>
                            </div>

                            {/* [Component 3] HC-SR04 Ultrasonic Sensor */}
                            <div className="hw-ultrasonic-module" style={{ position: 'absolute', left: '20px', top: '140px', width: '120px', height: '65px', padding: '6px' }}>
                                <div className="ultrasonic-cylinder left-cyl" style={{ width: '36px', height: '36px' }}>
                                    <span className="cyl-mesh" style={{ fontSize: '0.6rem' }}>T</span>
                                </div>
                                <div className="ultrasonic-cylinder right-cyl" style={{ width: '36px', height: '36px' }}>
                                    <span className="cyl-mesh" style={{ fontSize: '0.6rem' }}>R</span>
                                </div>
                                <div className="ultrasonic-label" style={{ fontSize: '0.45rem' }}>HC-SR04</div>
                            </div>

                            {/* [Component 4] HC-SR501 PIR motion sensor */}
                            <div className="hw-pir-module" style={{ position: 'absolute', left: '20px', top: '225px', width: '120px', height: '75px', padding: '6px' }}>
                                <div className="pir-fresnel-dome" onClick={triggerPirMotion} title="Click to wave hand and detect motion">
                                    <div className={`pir-detector-eye ${pirMotion ? 'pulsing' : ''}`}></div>
                                    <Eye size={12} className="pir-icon-label" />
                                </div>
                                <button className="pir-wave-btn" onClick={triggerPirMotion}>
                                    Wave Hand
                                </button>
                            </div>

                            {/* [Component 5] ESP32 Core module board */}
                            <div className="hw-esp32-board" style={{ position: 'absolute', left: '220px', top: '140px', width: '160px', height: '210px', padding: '10px' }}>
                                <div className="esp32-antenna" style={{ width: '60px', height: '22px' }}></div>
                                <div className="esp32-metal-shield" style={{ width: '70px', height: '75px' }}>
                                    <div className="shield-logo" style={{ fontSize: '0.9rem' }}>ESP32</div>
                                    <div className="shield-sub" style={{ fontSize: '0.55rem' }}>WROOM-32E</div>
                                </div>
                                <div className="esp32-leds" style={{ marginTop: '6px' }}>
                                    <div className="esp32-led active" style={{ width: '5px', height: '5px' }} title="PWR (Red)"></div>
                                    <div className={`esp32-led builtin-led ${syncing ? 'flashing' : ''}`} style={{ width: '5px', height: '5px' }} title="TX/RX (Blue)"></div>
                                </div>
                                <div className="esp32-chip-labels" style={{ fontSize: '0.45rem', marginTop: '6px' }}>CORE NodeMCU v3</div>
                                <button className="esp32-button boot-btn" onClick={handleReset} style={{ bottom: '8px', left: '8px' }}>RST</button>
                                <button className="esp32-button en-btn" onClick={() => sendTelemetry()} style={{ bottom: '8px', right: '8px' }}>TX</button>
                            </div>

                            {/* [Component 6] MQ-135 Gas Sensor */}
                            <div className="hw-gas-module" style={{ position: 'absolute', left: '460px', top: '140px', width: '80px', height: '80px' }}>
                                <div className="gas-mesh-cap" style={{ width: '54px', height: '54px' }}>
                                    <div className="mesh-inner" style={{ width: '42px', height: '42px' }}></div>
                                </div>
                                <div className="gas-label" style={{ fontSize: '0.45rem', bottom: '6px' }}>MQ-135</div>
                            </div>

                            {/* [Component 7] DHT11 Temp & Humidity Sensor */}
                            <div className="hw-dht11-module" style={{ position: 'absolute', left: '460px', top: '225px', width: '80px', height: '55px', padding: '4px' }}>
                                <div className="dht11-grill">
                                    <div className="dht11-holes"></div>
                                </div>
                                <span className="dht-label">DHT11</span>
                            </div>

                            {/* [Component 8] Mini Solar Charging panel */}
                            <div className="hw-solar-panel" style={{ position: 'absolute', left: '20px', top: '375px', width: '120px', height: '80px', padding: '4px' }}>
                                <div className="solar-grid-silicon">
                                    <div className="solar-cell"></div>
                                    <div className="solar-cell"></div>
                                    <div className="solar-cell"></div>
                                    <div className="solar-cell"></div>
                                </div>
                                <span className="solar-label"><Sun size={10} style={{ marginRight: '2px' }} />Solar PV Panel</span>
                            </div>

                            {/* [Component 9] 4 Status LEDs */}
                            <div className="pcb-leds-row" style={{ position: 'absolute', left: '160px', top: '395px', width: '110px', height: '45px' }}>
                                <div className="led-container">
                                    <div className={`hw-led led-green ${ledGreen ? 'glowing' : ''}`} style={{ width: '16px', height: '16px' }}>
                                        <div className="led-glow" style={{ width: '5px', height: '5px' }}></div>
                                    </div>
                                    <span className="led-label" style={{ fontSize: '0.55rem' }}>E</span>
                                </div>
                                <div className="led-container">
                                    <div className={`hw-led led-yellow ${ledYellow ? 'glowing' : ''}`} style={{ width: '16px', height: '16px' }}>
                                        <div className="led-glow" style={{ width: '5px', height: '5px' }}></div>
                                    </div>
                                    <span className="led-label" style={{ fontSize: '0.55rem' }}>M</span>
                                </div>
                                <div className="led-container">
                                    <div className={`hw-led led-red ${ledRed ? 'glowing' : ''}`} style={{ width: '16px', height: '16px' }}>
                                        <div className="led-glow" style={{ width: '5px', height: '5px' }}></div>
                                    </div>
                                    <span className="led-label" style={{ fontSize: '0.55rem' }}>F</span>
                                </div>
                                <div className="led-container">
                                    <div className={`hw-led led-blue ${ledBlue ? 'glowing' : ''}`} style={{ width: '16px', height: '16px' }}>
                                        <div className="led-glow" style={{ width: '5px', height: '5px' }}></div>
                                    </div>
                                    <span className="led-label" style={{ fontSize: '0.55rem' }}>ALT</span>
                                </div>
                            </div>

                            {/* [Component 10] Active Piezo Buzzer alarm */}
                            <div className="hw-buzzer-module" style={{ position: 'absolute', left: '300px', top: '370px', width: '60px', height: '85px' }}>
                                <div className={`buzzer-capsule ${buzzerActive ? 'beeping' : ''}`}>
                                    <div className="buzzer-hole"></div>
                                    {buzzerActive && (
                                        <div className="soundwaves-container">
                                            <div className="wave wave-1"></div>
                                            <div className="wave wave-2"></div>
                                        </div>
                                    )}
                                </div>
                                <span className="buzzer-label">Buzzer</span>
                            </div>

                            {/* Audio Speaker Mute/Unmute Toggle */}
                            <button 
                                onClick={() => setIsMuted(prev => !prev)}
                                style={{
                                    position: 'absolute',
                                    left: '370px',
                                    top: '370px',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '1px solid rgba(56, 189, 248, 0.4)',
                                    background: isMuted ? 'rgba(30, 41, 59, 0.8)' : 'rgba(56, 189, 248, 0.2)',
                                    color: isMuted ? '#94a3b8' : '#38bdf8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    zIndex: 100,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                    transition: 'all 0.2s',
                                }}
                                title={isMuted ? "Unmute Alarm Sound" : "Mute Alarm Sound"}
                            >
                                {isMuted ? '🔇' : '🔊'}
                            </button>

                            {/* [Component 11] SG90 Servo Motor (Lid Action) */}
                            <div className="hw-servo-module" style={{ position: 'absolute', left: '460px', top: '375px', width: '120px', height: '80px' }}>
                                <div className="servo-body">
                                    <div className="servo-label">SG-90</div>
                                    <div className="servo-gear-connector">
                                        <div className="servo-arm" style={{ transform: `rotate(${lidStatus === 'OPEN' ? 90 : 0}deg)` }}>
                                            <div className="servo-horn"></div>
                                        </div>
                                    </div>
                                </div>
                                <span className="servo-tag">Lid Servo Motor</span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Right Panel: Controls and Diagnostics */}
                <div className="simulator-controls-panel">
                    
                    <div className="glass-panel controls-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Control Knobs & Trimpots</h3>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={autoSync} 
                                    onChange={(e) => setAutoSync(e.target.checked)} 
                                    style={{ accentColor: '#38bdf8' }}
                                />
                                Auto-Sync
                            </label>
                        </div>

                        {/* Select Node */}
                        <div className="control-group" style={{ marginBottom: '0.8rem' }}>
                            <label className="control-label">Target IoT Device Node</label>
                            <select 
                                className="simulator-select"
                                value={selectedBin} 
                                onChange={(e) => {
                                    setSelectedBin(e.target.value);
                                    if (setActiveBinId) setActiveBinId(e.target.value);
                                }}
                                style={{ padding: '0.6rem' }}
                            >
                                <option value="BIN001">BIN001 (Metropolitan Depot Central)</option>
                                <option value="BIN002">BIN002 (Metropolitan Tech Hub East)</option>
                                <option value="BIN003">BIN003 (Metropolitan Residential South)</option>
                            </select>
                        </div>

                        {/* Knobs List */}
                        <div className="sliders-list" style={{ gap: '0.8rem' }}>
                            
                            {/* Ultrasonic obstacle */}
                            <div className="slider-item">
                                <div className="slider-header">
                                    <span className="slider-title"><Disc size={14} color="#c084fc"/> Ultrasonic Obstacle (Distance)</span>
                                    <span className="slider-value">{distance} cm ({fillLevel}% Full)</span>
                                </div>
                                <input 
                                    type="range" min="2" max="40" 
                                    value={distance} 
                                    onChange={(e) => setDistance(parseInt(e.target.value))}
                                    className="custom-range"
                                />
                                <div className="range-labels">
                                    <span>2cm (Full)</span>
                                    <span>40cm (Empty)</span>
                                </div>
                            </div>

                            {/* Gas PPM */}
                            <div className="slider-item">
                                <div className="slider-header">
                                    <span className="slider-title"><Wind size={14} color="#fbbf24"/> Odor / Methane Gas Concentration</span>
                                    <span className="slider-value" style={{ color: gasPpm > 350 ? '#f87171' : 'inherit' }}>{gasPpm} PPM</span>
                                </div>
                                <input 
                                    type="range" min="50" max="500" 
                                    value={gasPpm} 
                                    onChange={(e) => setGasPpm(parseInt(e.target.value))}
                                    className="custom-range range-yellow"
                                />
                                <div className="range-labels">
                                    <span>50 PPM (Clean)</span>
                                    <span>500 PPM (Hazardous)</span>
                                </div>
                            </div>

                            {/* Temp & Humid grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="slider-item">
                                    <div className="slider-header">
                                        <span className="slider-title"><Thermometer size={14} color="#f87171"/> Temp</span>
                                        <span className="slider-value">{temperature}°C</span>
                                    </div>
                                    <input 
                                        type="range" min="20" max="50" 
                                        value={temperature} 
                                        onChange={(e) => setTemperature(parseInt(e.target.value))}
                                        className="custom-range range-red"
                                    />
                                </div>

                                <div className="slider-item">
                                    <div className="slider-header">
                                        <span className="slider-title"><Wind size={14} color="#38bdf8"/> Humid</span>
                                        <span className="slider-value">{humidity}%</span>
                                    </div>
                                    <input 
                                        type="range" min="20" max="90" 
                                        value={humidity} 
                                        onChange={(e) => setHumidity(parseInt(e.target.value))}
                                        className="custom-range range-blue"
                                    />
                                </div>
                            </div>

                            {/* Solar Power Panel Intensity */}
                            <div className="slider-item">
                                <div className="slider-header">
                                    <span className="slider-title"><Sun size={14} color="#fbbf24"/> Solar PV Panel Intensity (Lux)</span>
                                    <span className="slider-value">{solarLux} Lux ({solarVoltage}V)</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1000" 
                                    value={solarLux} 
                                    onChange={(e) => setSolarLux(parseInt(e.target.value))}
                                    className="custom-range range-yellow"
                                />
                                <div className="range-labels">
                                    <span>0 Lux (Dark)</span>
                                    <span>1000 Lux (Bright Solar Input)</span>
                                </div>
                            </div>

                            {/* Wi-Fi Signal strength trimpot */}
                            <div className="slider-item">
                                <div className="slider-header">
                                    <span className="slider-title"><Wifi size={14} color="#a78bfa"/> Wi-Fi Signal RSSI</span>
                                    <span className="slider-value" style={{ color: wifiRssi <= -85 ? '#f87171' : 'inherit' }}>{wifiRssi} dBm</span>
                                </div>
                                <input 
                                    type="range" min="-100" max="-30" 
                                    value={wifiRssi} 
                                    onChange={(e) => setWifiRssi(parseInt(e.target.value))}
                                    className="custom-range"
                                />
                                <div className="range-labels">
                                    <span>-100 dBm (Disconnected)</span>
                                    <span>-30 dBm (Excellent)</span>
                                </div>
                            </div>

                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                            <button className="simulator-action-btn action-reset" onClick={handleReset} style={{ padding: '0.6rem' }}>
                                System Reboot
                            </button>
                            <button className="simulator-action-btn action-alert" onClick={triggerPirMotion} style={{ padding: '0.6rem' }}>
                                PIR Motion Sensor Wave
                            </button>
                        </div>
                    </div>

                    {/* Console Diagnostics */}
                    <div className="glass-panel console-card" style={{ padding: '0.8rem !important' }}>
                        <div className="console-header" style={{ marginBottom: '0.5rem' }}>
                            <Database size={14} color="#38bdf8"/>
                            <h4>Virtual ESP32 UART Serial Log (115200 baud)</h4>
                        </div>
                        <div className="console-display" style={{ height: '110px' }}>
                            {logs.length === 0 ? (
                                <div className="console-line empty-line">ESP32-S3 serial port active. Ready.</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={`console-line ${log.includes('[HTTP') || log.includes('Wi-Fi') ? 'console-success' : log.includes('ALARM') || log.includes('ALERT') ? 'console-warning' : ''}`}>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

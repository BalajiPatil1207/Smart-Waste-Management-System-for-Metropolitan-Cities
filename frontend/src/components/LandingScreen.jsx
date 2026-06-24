import React, { useEffect, useState, useRef } from 'react';
import { Leaf, ArrowRight, Cpu, Gamepad2, Map, Truck, Sparkles, RefreshCw, User, Mail, Link, ExternalLink, X, Phone } from 'lucide-react';
import CountUp from 'react-countup';

const CountUpComponent = typeof CountUp === 'function' ? CountUp : (CountUp?.default || 'span');

export default function LandingScreen({ onStart }) {
  const [loaded, setLoaded] = useState(false);
  const [showContactCard, setShowContactCard] = useState(false);
  const canvasRef = useRef(null);

  // Live node states for interactive smart city ecosystem preview
  const [nodes, setNodes] = useState([
    { id: 'BIN-001', name: 'Node BIN-001', top: '28%', left: '26%', level: 92, status: 'Critical Full', color: '#ef4444', x: 104, y: 70 },
    { id: 'BIN-002', name: 'Node BIN-002', top: '65%', left: '50%', level: 45, status: 'Moderate', color: '#fbbf24', x: 200, y: 162.5 },
    { id: 'BIN-003', name: 'Node BIN-003', top: '25%', left: '74%', level: 12, status: 'Empty', color: '#10b981', x: 296, y: 62.5 },
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState('BIN-001');

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  // Web Audio API Sound Synthesizer Helper
  const playSynthesizedChime = (freqs, type = 'sine', duration = 0.15) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((freq, idx) => {
        const timeOffset = idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
        
        gain.gain.setValueAtTime(0.06, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + duration);
      });
    } catch (e) {
      console.warn("Audio Context blocked by browser autoplay policy");
    }
  };

  // IoT smart grid particle network constellation animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Spawn green & cyan glowing sensor nodes
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 0.8,
        color: Math.random() > 0.45 ? 'rgba(16, 185, 129, 0.22)' : 'rgba(56, 189, 248, 0.22)'
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connect nodes close to each other with faint gridlines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.07 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Render and update positions
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSelectNode = (nodeId) => {
    setSelectedNodeId(nodeId);
    // Play hi-tech sonar tone beep
    playSynthesizedChime([600], 'sine', 0.12);
  };

  const handleSimulatePickup = () => {
    // Empty the selected bin node
    setNodes(prevNodes => 
      prevNodes.map(node => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            level: 5,
            status: 'Empty',
            color: '#10b981'
          };
        }
        return node;
      })
    );
    // Play optimistic pickup chords
    playSynthesizedChime([523.25, 659.25, 783.99], 'triangle', 0.3);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="landing-page">
      {/* Dynamic Background Mesh & Canvas Layer */}
      <canvas id="landing-canvas" ref={canvasRef}></canvas>
      <div className="landing-overlay"></div>
      
      {/* Vertical flex scroll container */}
      <div className="landing-scroll-wrapper">
        <div className={`landing-grid-content ${loaded ? 'fade-in-up' : ''}`}>
          
          {/* Left Side: Dynamic App Introduction */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Glowing Brand Tagline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                className="pulsing-ring-halo"
                style={{ 
                  display: 'inline-flex', 
                  padding: '0.8rem', 
                  background: 'rgba(16, 185, 129, 0.12)', 
                  borderRadius: '50%', 
                  border: '1.5px solid rgba(16, 185, 129, 0.4)'
                }}
              >
                <Leaf size={28} color="#10b981" />
              </div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '2px', fontWeight: '850', color: '#10b981', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> METRO SMART INFRA
              </span>
            </div>

            {/* Heading with Professional English Subtitles */}
            <div className="brand-title">
              <h1 className="gradient-text">EcoSmart Metropolis</h1>
              
              <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#38bdf8', marginTop: '0.8rem', letterSpacing: '0.5px' }}>
                Autonomous Solid Waste Infrastructure & Telemetry Grid
              </p>
              <p style={{ fontSize: '0.95rem', marginTop: '0.5rem', color: '#94a3b8', maxWidth: '580px', lineHeight: '1.6' }}>
                A next-generation centralized command console coordinating municipal sanitation networks. 
                Features AI route optimization, live-wire ESP32 board simulations, and dynamic environmental analytics.
              </p>
            </div>

            {/* Statistics Highlights Dashboard Counter */}
            <div className="landing-stats-card">
              <div className="landing-stat-item">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', textTransform: 'uppercase', color: '#10b981', fontWeight: '800' }}>
                  <span className="pulse-dot" style={{ width: '8px', height: '8px', background: '#10b981' }}></span> Live Network
                </span>
                <span className="landing-stat-val" style={{ color: '#10b981', fontSize: '1.2rem', marginTop: '4px' }}>Active</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }}></div>
              <div className="landing-stat-item">
                <span className="landing-stat-lbl">Tons Cleared</span>
                <span className="landing-stat-val">
                  <CountUpComponent end={1842} duration={2.5} separator="," />+
                </span>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }}></div>
              <div className="landing-stat-item">
                <span className="landing-stat-lbl">Routing Efficiency</span>
                <span className="landing-stat-val">
                  <CountUpComponent end={42} duration={2.2} />% Save
                </span>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }}></div>
              <div className="landing-stat-item">
                <span className="landing-stat-lbl">Network Latency</span>
                <span className="landing-stat-val" style={{ color: '#38bdf8' }}>
                  <CountUpComponent end={1.2} decimals={1} duration={1.5} />s
                </span>
              </div>
            </div>

            {/* Start CTA Button */}
            <div>
              <button 
                onClick={onStart} 
                className="login-btn glow-effect" 
                style={{ 
                  fontSize: '1.1rem', 
                  padding: '0.9rem 2.8rem', 
                  borderRadius: '50px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(6, 182, 212, 0.45)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.35)';
                }}
              >
                Initialize System Dashboard <ArrowRight size={20} />
              </button>
            </div>

          </div>

          {/* Right Side: Interactive Smart City Live Preview Widget */}
          <div>
            <div className="landing-preview-panel">
              
              <div className="landing-preview-header">
                <div className="landing-preview-title">
                  <span className="pulse-dot" style={{ width: '8px', height: '8px', background: '#38bdf8' }}></span>
                  Eco-Pulse Smart Grid (Ecosystem Map)
                </div>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Click Nodes to Select
                </span>
              </div>

              {/* Smart City Simulation Grid Container */}
              <div className="landing-preview-map-area">
                <div className="preview-grid-bg"></div>

                {/* Path Routing Loop Drawing */}
                <svg className="preview-route-svg" viewBox="0 0 400 250">
                  {/* Depot Marker */}
                  <circle cx="60" cy="187.5" r="7" fill="#38bdf8" opacity="0.3" />
                  <circle cx="60" cy="187.5" r="4" fill="#38bdf8" />
                  
                  {/* Path Lines connecting Depot -> Node1 -> Node2 -> Node3 -> Depot */}
                  <path 
                    d="M 60 187.5 L 104 70 L 200 162.5 L 296 62.5 Z" 
                    className="preview-route-line" 
                  />
                </svg>

                {/* Animated Garbage Truck travelling along optimized route */}
                <div 
                  className="preview-route-truck"
                  style={{
                    offsetPath: `path('M 60 187.5 L 104 70 L 200 162.5 L 296 62.5 Z')`,
                    animation: 'moveTruck 16s linear infinite'
                  }}
                >
                  <div style={{ background: '#1e293b', border: '1.5px solid #38bdf8', padding: '6px', borderRadius: '50%', boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)' }}>
                    <Truck size={12} color="#38bdf8" />
                  </div>
                </div>

                {/* Depot Label */}
                <div style={{ position: 'absolute', top: '197px', left: '38px', fontSize: '0.55rem', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', background: 'rgba(15,23,42,0.85)', padding: '2px 4px', borderRadius: '3px' }}>
                  Central Depot
                </div>

                {/* Telemetry Bin Nodes */}
                {nodes.map(node => (
                  <div
                    key={node.id}
                    className={`preview-node ${selectedNodeId === node.id ? 'active' : ''}`}
                    style={{ top: node.top, left: node.left }}
                    onClick={() => handleSelectNode(node.id)}
                  >
                    <div 
                      className="preview-node-dot" 
                      style={{ color: node.color }}
                    ></div>
                    <div className={`preview-node-label ${selectedNodeId === node.id ? 'active' : ''}`}>
                      {node.id} ({node.level}%)
                    </div>
                  </div>
                ))}

                {/* Mini Volumetric 3D Cylinder Visualizer in Corner */}
                <div className="preview-bin-wrapper">
                  <div className="preview-bin-title">{selectedNode.id} Level</div>
                  
                  <div className="mini-cylinder-container">
                    <div className="mini-cylinder-glass"></div>
                    <div 
                      className={`mini-cylinder-fill ${
                        selectedNode.level > 80 ? 'red' : selectedNode.level > 40 ? 'yellow' : 'green'
                      }`}
                      style={{ height: `${selectedNode.level * 0.95}%` }}
                    ></div>
                  </div>

                  <div className="preview-bin-level">
                    {selectedNode.level}%
                  </div>

                  {/* Simulate Dump/Pickup Trigger Button */}
                  {selectedNode.level > 30 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulatePickup();
                      }}
                      style={{
                        marginTop: '6px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.5rem',
                        fontWeight: '800',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                        textTransform: 'uppercase'
                      }}
                    >
                      <RefreshCw size={7} /> Empty
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Feature Grid Below Content */}
        <div 
          className={`landing-feature-grid ${loaded ? 'fade-in-up' : ''}`}
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '0 1rem 2rem',
            marginTop: '1.5rem',
            width: '100%'
          }}
        >
          <div className="landing-feature-card">
            <h4><Cpu size={18} color="#38bdf8" /> Virtual IoT Workbench</h4>
            <p>
              Interactive ESP32 NodeMCU workbench with graphics OLED screen, characters LCD, motion triggers, and real-time solar charging trimpots.
            </p>
          </div>

          <div className="landing-feature-card">
            <h4><Map size={18} color="#10b981" /> AI Route Optimization</h4>
            <p>
              Optimal dispatch routing using OSRM algorithms. Traverses optimized paths with live-animated truck mapping along city coordinates.
            </p>
          </div>

          <div className="landing-feature-card">
            <h4><Gamepad2 size={18} color="#fbbf24" /> Waste Segregation Hub</h4>
            <p>
              Gamified sorting workspace with browser sound chime feedback. Support sorting household waste into Wet, Dry, E-Waste, and Hazardous.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ 
          marginTop: '3rem', 
          width: '100%', 
          maxWidth: '1200px', 
          borderTop: '1px solid rgba(255,255,255,0.06)', 
          padding: '1.5rem 1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          color: '#64748b', 
          fontSize: '0.825rem', 
          zIndex: 2 
        }}>
          <span>© 2026 EcoSmart Metropolis. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            System Developer: <strong style={{ color: '#94a3b8' }}>Balaji Patil</strong>
          </span>
        </footer>
      </div>

      {/* Floating Developer Contact Button */}
      <div 
        className="floating-contact-btn"
        onClick={() => setShowContactCard(true)}
      >
        <span className="contact-btn-pulse"></span>
        <span className="contact-btn-text">Balaji Patil</span>
        <div className="contact-btn-icon">
          <User size={16} color="#10b981" />
        </div>
      </div>

      {/* Interactive Contact Card Modal */}
      {showContactCard && (
        <div className="contact-card-overlay" onClick={() => setShowContactCard(false)}>
          <div className="contact-card premium-shadow pop-in" onClick={(e) => e.stopPropagation()}>
            <button className="contact-card-close" onClick={() => setShowContactCard(false)}>
              <X size={16} />
            </button>
            <div className="contact-card-avatar">
              <User size={32} color="#10b981" />
            </div>
            <h3>Balaji Patil</h3>
            <span className="contact-card-title">IoT Telemetry & Systems Architect</span>
            <div style={{ width: '40px', height: '3px', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '2px', margin: '0.8rem auto 1.5rem' }}></div>
            
            {/* Social Icons row with redirects */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '1rem 0 1.5rem' }}>
              <a 
                href="mailto:patilbalaji2004@gmail.com" 
                className="contact-social-btn mail" 
                title="Email: patilbalaji2004@gmail.com"
              >
                <Mail size={22} />
              </a>
              <a 
                href="https://www.linkedin.com/in/balaji-patil-73b288320/" 
                target="_blank" 
                rel="noreferrer" 
                className="contact-social-btn" 
                title="LinkedIn Profile"
              >
                <ExternalLink size={22} />
              </a>
              <a 
                href="tel:7498586267" 
                className="contact-social-btn phone" 
                title="Call: 7498586267"
              >
                <Phone size={22} />
              </a>
            </div>

            <div className="contact-card-badge">
              Project Architect & Developer
            </div>
          </div>
        </div>
      )}

      {/* CSS custom support inside component for offset-path routing fallback */}
      <style>{`
        @keyframes moveTruck {
          0% {
            offset-distance: 0%;
          }
          100% {
            offset-distance: 100%;
          }
        }
      `}</style>
    </div>
  );
}

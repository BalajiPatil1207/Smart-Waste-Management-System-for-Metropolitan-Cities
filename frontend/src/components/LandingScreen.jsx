import React, { useEffect, useState } from 'react';
import { Leaf, ArrowRight, Zap, ShieldCheck, Map } from 'lucide-react';

export default function LandingScreen({ onStart }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  return (
    <div className="landing-page">
      <div className="landing-overlay"></div>
      
      <div className={`landing-content ${loaded ? 'fade-in-up' : ''}`} style={{ maxWidth: '800px', textAlign: 'center', padding: '3rem' }}>
        
        <div className="brand-title" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1.5rem', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', border: '1px solid rgba(52, 211, 153, 0.3)', boxShadow: '0 0 30px rgba(52, 211, 153, 0.2)' }}>
             <Leaf size={72} color="#34d399" className="floating-icon" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '4.5rem', letterSpacing: '-1px' }}>EcoSmart Metropolis</h1>
          <p style={{ fontSize: '1.3rem', marginTop: '1rem', color: '#e2e8f0', maxWidth: '600px', margin: '1rem auto' }}>
             The Next-Generation Autonomous Waste Management System powered by AI and real-time IoT Telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
           <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '50px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Zap size={20} color="#fbbf24" /> <span>Real-Time Analytics</span>
           </div>
           <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '50px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Map size={20} color="#38bdf8" /> <span>AI Route Optimization</span>
           </div>
           <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '50px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ShieldCheck size={20} color="#34d399" /> <span>Automated Dispatch</span>
           </div>
        </div>

        <button 
          onClick={onStart} 
          className="login-btn glow-effect" 
          style={{ 
            fontSize: '1.4rem', 
            padding: '1.2rem 3rem', 
            borderRadius: '50px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '15px',
            background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Initialize System <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}

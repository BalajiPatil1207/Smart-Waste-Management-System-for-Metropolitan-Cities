import React, { useEffect, useState } from 'react';
import { Lock, User, Key, Leaf } from 'lucide-react';

export default function LoginScreen({ handleLogin, username, setUsername, password, setPassword, loginError }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setLoaded(true), 100);
  }, []);

  return (
    <div className="landing-page">
      {/* Background Image is set in CSS */}
      <div className="landing-overlay"></div>
      
      <div className={`landing-content ${loaded ? 'fade-in-up' : ''}`}>
        <div className="brand-title">
          <Leaf size={48} color="#34d399" className="floating-icon" />
          <h1 className="gradient-text">EcoSmart Metropolis</h1>
          <p>Next-Generation Autonomous Waste Management</p>
        </div>

        <div className="glass-panel login-box premium-shadow">
          <h2><Lock size={24} color="#38bdf8"/> System Portal</h2>
          <p className="subtitle">Secure access to the centralized command dashboard</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <User size={20} color="#94a3b8" />
              <input 
                 type="text" placeholder="Username" 
                 value={username} onChange={e => setUsername(e.target.value)} required 
              />
            </div>
            <div className="input-group">
              <Key size={20} color="#94a3b8" />
              <input 
                 type="password" placeholder="Password" 
                 value={password} onChange={e => setPassword(e.target.value)} required 
              />
            </div>
            {loginError && <div className="error-msg pop-in">{loginError}</div>}
            
            <button type="submit" className="login-btn glow-effect">
              Authenticate & Enter
            </button>
          </form>

          <div className="test-creds">
            <span>Demo Credentials:</span> <strong>admin</strong> / <strong>password123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

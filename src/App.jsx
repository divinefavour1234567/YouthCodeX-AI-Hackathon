import React, { useState, useContext } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ApiKeyModal from "./components/ApiKeyModal";
import Dashboard from "./views/Dashboard";
import Roadmap from "./views/Roadmap";
import Interview from "./views/Interview";
import Resume from "./views/Resume";
import Rpg from "./views/Rpg";
import ParticleBackground from "./components/ParticleBackground";
import { AppContext } from "./context/AppContext";
import { playSuccessSound } from "./services/sound";

export default function App() {
  const [currentView, setView] = useState("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { 
    showLevelUpAlert, 
    setShowLevelUpAlert, 
    lastLeveledUpTo, 
    progress 
  } = useContext(AppContext);

  // Render view conditionally based on sidebar selection
  const renderActiveView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard setView={setView} />;
      case "roadmap":
        return <Roadmap />;
      case "interview":
        return <Interview />;
      case "resume":
        return <Resume />;
      case "rpg":
        return <Rpg />;
      default:
        return <Dashboard setView={setView} />;
    }
  };

  return (
    <div className="app-container">
      {/* Background Particle Canvas */}
      <ParticleBackground />

      {/* Background Glowing Spheres */}
      <div className="blur-bg-sphere sphere-1"></div>
      <div className="blur-bg-sphere sphere-2"></div>
      <div className="blur-bg-sphere sphere-3"></div>

      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setView={setView} />

      {/* Main Core View Area */}
      <div className="main-content">
        {/* Sticky Header with settings launch toggle and API indicators */}
        <Header currentView={currentView} onOpenSettings={() => setIsSettingsOpen(true)} />
        
        {/* Dynamic view container body */}
        <div className="content-body">
          {renderActiveView()}
        </div>
      </div>

      {/* Global settings configurations modal */}
      <ApiKeyModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Level Up Cosmic Celebration Modal */}
      {showLevelUpAlert && (
        <div className="level-up-modal-backdrop animate-fade">
          <div className="level-up-modal-content glass-card pulse-glow-cyan animate-zoom">
            <div className="level-up-sparkles">✨ 🎉 ✨</div>
            <h1 className="level-up-title animate-pulse">LEVEL UP!</h1>
            
            <div className="level-up-badge">
              <div className="level-number">{lastLeveledUpTo}</div>
            </div>

            <h3 className="rank-name text-cyan">{progress.rank}</h3>
            
            <p className="congrats-text">
              You reached the rank of <strong>{progress.rank}</strong>! Your access permissions have been upgraded.
            </p>

            <div className="unlocked-features-box">
              <span className="unlocked-header">🔓 NEW ACCESS GRANTED:</span>
              <ul className="unlocked-list">
                {lastLeveledUpTo >= 2 && <li>• Resume ATS Compatibility Scanner</li>}
                {lastLeveledUpTo >= 2 && <li>• Nigeria Cost-of-Living Rent Calculator</li>}
                {lastLeveledUpTo >= 3 && <li>• AI Salary Negotiation Sandbox (Tier 1 & 2 Bosses)</li>}
                {lastLeveledUpTo >= 4 && <li>• Interactive 3D Perspective Network Tree Map</li>}
                {lastLeveledUpTo >= 5 && <li>• Dynamic Day-in-the-Life RPG career scenarios</li>}
                {lastLeveledUpTo >= 6 && <li>• Premium Mentor Match Marketplace (Hard Mode)</li>}
              </ul>
            </div>

            <button 
              className="btn btn-cyan btn-level-up-continue mt-4" 
              onClick={() => {
                playSuccessSound();
                setShowLevelUpAlert(false);
              }}
            >
              Resume Career Quest
            </button>
          </div>
          <style>{`
            .level-up-modal-backdrop {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(4, 5, 15, 0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              backdrop-filter: blur(8px);
            }
            .level-up-modal-content {
              max-width: 440px;
              width: 90%;
              text-align: center;
              padding: 2rem !important;
              background: rgba(10, 14, 38, 0.95) !important;
              border: 2px solid var(--accent-secondary) !important;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 1rem;
              box-shadow: 0 0 30px rgba(0, 217, 255, 0.25) !important;
            }
            .level-up-sparkles {
              font-size: 1.5rem;
              letter-spacing: 0.3em;
            }
            .level-up-title {
              font-family: var(--font-sans);
              font-size: 2.25rem;
              font-weight: 900;
              background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin: 0;
              letter-spacing: 0.05em;
            }
            .level-up-badge {
              width: 70px;
              height: 70px;
              border-radius: 50%;
              background: radial-gradient(circle, var(--accent-secondary) 0%, rgba(99, 102, 241, 0.2) 100%);
              border: 3px solid var(--accent-secondary);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 20px var(--accent-secondary);
              margin: 0.25rem 0;
            }
            .level-number {
              font-family: var(--font-sans);
              font-size: 1.75rem;
              font-weight: 900;
              color: white;
            }
            .rank-name {
              font-size: 1.25rem;
              font-weight: 800;
              margin: 0;
            }
            .congrats-text {
              font-size: 0.85rem;
              color: var(--text-secondary);
              line-height: 1.5;
            }
            .unlocked-features-box {
              width: 100%;
              background: rgba(0, 0, 0, 0.4);
              border: 1px solid var(--glass-border);
              border-radius: 8px;
              padding: 0.75rem 1rem;
              text-align: left;
            }
            .unlocked-header {
              font-size: 0.7rem;
              font-weight: 700;
              color: var(--accent-lime);
              letter-spacing: 0.05em;
              display: block;
              margin-bottom: 0.4rem;
            }
            .unlocked-list {
              list-style: none;
              padding: 0;
              margin: 0;
              display: flex;
              flex-direction: column;
              gap: 0.2rem;
              font-size: 0.75rem;
              color: var(--text-primary);
            }
            .btn-level-up-continue {
              padding: 0.6rem 1.5rem;
              font-weight: 700;
              font-size: 0.85rem;
              box-shadow: 0 0 10px rgba(0, 217, 255, 0.2);
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

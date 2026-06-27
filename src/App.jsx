import React, { useState, useContext, useEffect } from "react";
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
import confetti from 'canvas-confetti';

export default function App() {
  const [currentView, setView] = useState("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { 
    showLevelUpAlert, 
    setShowLevelUpAlert, 
    lastLeveledUpTo, 
    progress 
  } = useContext(AppContext);

  // Confetti on level up
  useEffect(() => {
    if (showLevelUpAlert) {
      confetti({
        particleCount: 200,
        spread: 80,
        origin: { y: 0.6 }
      });
      playSuccessSound();
    }
  }, [showLevelUpAlert]);

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
      <ParticleBackground />
      <div className="blur-bg-sphere sphere-1"></div>
      <div className="blur-bg-sphere sphere-2"></div>
      <div className="blur-bg-sphere sphere-3"></div>

      <Sidebar currentView={currentView} setView={setView} />

      <div className="main-content">
        <Header currentView={currentView} onOpenSettings={() => setIsSettingsOpen(true)} />
        
        <div className="content-body">
          {renderActiveView()}
        </div>
      </div>

      <ApiKeyModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Enhanced Level Up Modal */}
      {showLevelUpAlert && (
        <div className="level-up-modal-backdrop">
          <div className="level-up-modal-content glass-card">
            <div className="level-up-sparkles">✨🎉✨</div>
            <h1 className="level-up-title">LEVEL UP!</h1>
            
            <div className="level-up-badge">
              <div className="level-number">{lastLeveledUpTo}</div>
            </div>

            <h3 className="rank-name">{progress.rank}</h3>
            
            <p>Congratulations Pathfinder! You've unlocked new career tools.</p>

            <button 
              className="btn btn-cyan"
              onClick={() => setShowLevelUpAlert(false)}
            >
              Continue the Quest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
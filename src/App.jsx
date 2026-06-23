import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ApiKeyModal from "./components/ApiKeyModal";
import Dashboard from "./views/Dashboard";
import Roadmap from "./views/Roadmap";
import Interview from "./views/Interview";
import Resume from "./views/Resume";
import Rpg from "./views/Rpg";
import ParticleBackground from "./components/ParticleBackground";

export default function App() {
  const [currentView, setView] = useState("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    </div>
  );
}

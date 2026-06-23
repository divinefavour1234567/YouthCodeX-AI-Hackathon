import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Settings, CheckCircle2, AlertTriangle } from "lucide-react";
import { playHoverSound } from "../services/sound";

export default function Header({ currentView, onOpenSettings }) {
  const { apiKey } = useContext(AppContext);

  const getPageDetails = () => {
    switch (currentView) {
      case "dashboard":
        return {
          title: "Career Hub",
          subtitle: "Welcome back! Chart your progress and practice key career tasks."
        };
      case "roadmap":
        return {
          title: "Career Explorer",
          subtitle: "Explore popular paths, learn milestones, and track required skills."
        };
      case "interview":
        return {
          title: "Interview Sandbox",
          subtitle: "Simulate a live technical or behavior interview with real-time feedback."
        };
      case "resume":
        return {
          title: "Resume Critique",
          subtitle: "Analyze your resume compatibility against dynamic job descriptions."
        };
      case "rpg":
        return {
          title: "Day-in-the-Life RPG",
          subtitle: "Experience workplace roleplaying scenarios and learn dynamic decision-making."
        };
      default:
        return { title: "PathFinder AI", subtitle: "Your career companion." };
    }
  };

  const { title, subtitle } = getPageDetails();
  const isKeyActive = apiKey && apiKey.trim().length > 20;

  return (
    <header className="app-header glass-header">
      <div className="header-titles">
        <h1 className="gradient-text">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>

      <div className="header-actions">
        <button 
          className={`api-status-pill ${isKeyActive ? "active" : "demo"}`}
          onClick={() => {
            playHoverSound();
            onOpenSettings();
          }}
          onMouseEnter={playHoverSound}
          title={isKeyActive ? "Gemini API key configured." : "Using pre-configured high-fidelity simulation. Click to configure API Key."}
        >
          {isKeyActive ? (
            <>
              <CheckCircle2 size={14} className="status-icon" />
              <span>Gemini Active</span>
            </>
          ) : (
            <>
              <AlertTriangle size={14} className="status-icon alert" />
              <span>Demo Mode</span>
            </>
          )}
        </button>

        <button 
          className="btn-icon-settings"
          onClick={() => {
            playHoverSound();
            onOpenSettings();
          }}
          onMouseEnter={playHoverSound}
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          height: var(--header-height);
          border-bottom: 1px solid var(--glass-border);
          background: rgba(8, 9, 13, 0.8);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .header-titles h1 {
          font-size: 1.5rem;
          margin-bottom: 0.2rem;
        }

        .header-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .api-status-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          background: transparent;
        }

        .api-status-pill.active {
          background: rgba(16, 185, 129, 0.08);
          color: var(--accent-success);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .api-status-pill.active:hover {
          background: rgba(16, 185, 129, 0.15);
        }

        .api-status-pill.demo {
          background: rgba(245, 158, 11, 0.08);
          color: var(--accent-warning);
          border-color: rgba(245, 158, 11, 0.2);
        }

        .api-status-pill.demo:hover {
          background: rgba(245, 158, 11, 0.15);
        }

        .status-icon {
          flex-shrink: 0;
        }

        .status-icon.alert {
          animation: pulse 2s infinite;
        }

        .btn-icon-settings {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-icon-settings:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
          transform: rotate(30deg);
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @media (max-width: 576px) {
          .header-subtitle {
            display: none;
          }
          .app-header {
            padding: 1rem;
          }
        }
      `}</style>
    </header>
  );
}

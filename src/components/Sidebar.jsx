import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { 
  Compass, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Gamepad2, 
  Trophy, 
  Award,
  Bot
} from "lucide-react";
import { playHoverSound } from "../services/sound";

export default function Sidebar({ currentView, setView }) {
  const { progress } = useContext(AppContext);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Compass },
    { id: "roadmap", label: "Career Explorer", icon: Briefcase },
    { id: "interview", label: "Interview Sandbox", icon: MessageSquare },
    { id: "resume", label: "Resume Critique", icon: FileText },
    { id: "rpg", label: "Day-in-the-Life RPG", icon: Gamepad2 },
  ];

  // Calculate experience percentage for current rank level (assuming 300 EXP milestones)
  const nextLevelExp = progress.expPoints >= 1000 ? 1000 : progress.expPoints >= 600 ? 1000 : progress.expPoints >= 300 ? 600 : 300;
  const prevLevelExp = progress.expPoints >= 1000 ? 1000 : progress.expPoints >= 600 ? 600 : progress.expPoints >= 300 ? 300 : 0;
  const levelProgressPercent = nextLevelExp === prevLevelExp 
    ? 100 
    : Math.min(100, Math.floor(((progress.expPoints - prevLevelExp) / (nextLevelExp - prevLevelExp)) * 100));

  return (
    <aside className="sidebar glass-sidebar">
      <div className="sidebar-brand">
        <Award className="brand-icon pulse-glow" />
        <span className="brand-text">PathFinder <span className="neon-text">AI</span></span>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`menu-item ${isActive ? "active" : ""}`}
              onClick={() => {
                playHoverSound();
                setView(item.id);
              }}
              onMouseEnter={playHoverSound}
            >
              <Icon size={20} className="menu-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-summary glass-card">
          <div className="user-rank-header">
            <Trophy size={16} className="rank-icon" />
            <span className="rank-label">{progress.rank}</span>
          </div>
          <div className="xp-container">
            <div className="xp-text">
              <span>{progress.expPoints} XP</span>
              <span className="xp-next">{nextLevelExp} XP</span>
            </div>
            <div className="xp-bar-bg">
              <div 
                className="xp-bar-fill" 
                style={{ width: `${levelProgressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: rgba(10, 11, 16, 0.9);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          z-index: 100;
        }
        
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.5rem 1.5rem 0.5rem;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 1.5rem;
        }

        .brand-icon {
          color: var(--accent-secondary);
          width: 28px;
          height: 28px;
        }

        .brand-text {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .neon-text {
          color: var(--accent-primary);
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-grow: 1;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 500;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: all 0.2s ease;
        }

        .menu-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .menu-item.active {
          color: white;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%);
          border-left: 3px solid var(--accent-primary);
          padding-left: calc(1rem - 3px);
        }

        .menu-icon {
          color: var(--text-muted);
          transition: color 0.2s ease;
        }

        .menu-item.active .menu-icon,
        .menu-item:hover .menu-icon {
          color: var(--accent-secondary);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1rem;
        }

        .user-profile-summary {
          padding: 1rem !important;
          background: var(--bg-secondary) !important;
        }

        .user-rank-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .rank-icon {
          color: var(--accent-warning);
        }

        .rank-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .xp-container {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .xp-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .xp-next {
          color: var(--text-muted);
        }

        .xp-bar-bg {
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 99px;
          overflow: hidden;
        }

        .xp-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 99px;
          transition: width 0.4s ease-out;
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none; /* We can add a mobile drawer toggle if needed */
          }
        }
      `}</style>
    </aside>
  );
}

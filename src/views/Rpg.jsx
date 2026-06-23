import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { RPG_SCENARIOS } from "../data/mockData";
import { 
  Gamepad2, 
  ArrowRight,
  Award
} from "lucide-react";
import { playHoverSound, playErrorSound } from "../services/sound";

// Interactive Typewriter Text Effect for retro-modern RPG narratives
const TypewriterText = ({ text, speed = 12, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    if (!text) return;

    let index = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

export default function Rpg() {
  const { progress, saveRpgCompletion } = useContext(AppContext);
  const isLocked = progress.level < 5;

  useEffect(() => {
    if (isLocked) {
      playErrorSound();
    }
  }, [isLocked]);

  if (isLocked) {
    return (
      <div className="lockscreen-overlay glass-card">
        <div className="lock-content">
          <div className="lock-icon-wrapper pulse-red">🔒</div>
          <h3>System Restricted: Level 5 Required</h3>
          <p>Accessing the Day-in-the-Life RPG scenarios requires the rank of <strong>Lead Principal</strong>.</p>
          
          <div className="progress-container">
            <div className="progress-text">
              <span>Your XP: {progress.expPoints}</span>
              <span>Required: 1,500 XP</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, (progress.expPoints / 1500) * 100)}%` }}></div>
            </div>
          </div>
          
          <p className="hint text-muted">Complete Milestones or practice Mock Interviews to gain XP!</p>
        </div>
        <style>{`
          .lockscreen-overlay {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 480px;
            margin: 2rem auto;
            max-width: 600px;
            text-align: center;
            padding: 3rem !important;
            background: rgba(10, 14, 39, 0.8) !important;
            border-color: rgba(255, 0, 110, 0.25) !important;
            box-shadow: 0 0 30px rgba(255, 0, 110, 0.1);
          }
          .lock-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            width: 100%;
          }
          .lock-icon-wrapper {
            font-size: 3rem;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255, 0, 110, 0.1);
            border: 2px solid var(--accent-pink);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px var(--accent-pink);
          }
          .pulse-red {
            animation: pulseRed 2s infinite;
          }
          @keyframes pulseRed {
            0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(255, 0, 110, 0.5); }
            50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(255, 0, 110, 0.8); }
          }
          .lock-content h3 {
            font-size: 1.6rem;
            color: var(--text-primary);
          }
          .lock-content p {
            font-size: 0.9rem;
            color: var(--text-muted);
            max-width: 400px;
          }
          .progress-container {
            width: 100%;
            max-width: 320px;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .progress-text {
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-secondary);
          }
          .progress-bar-bg {
            height: 10px;
            background: var(--bg-tertiary);
            border-radius: 99px;
            overflow: hidden;
            border: 1px solid var(--glass-border);
          }
          .progress-bar-fill {
            height: 100%;
            background: var(--accent-pink);
            border-radius: 99px;
            box-shadow: 0 0 8px var(--accent-pink);
          }
        `}</style>
      </div>
    );
  }
  
  // UI stages: 'setup' | 'story' | 'finish'
  const [stage, setStage] = useState("setup");
  const [selectedRole, setSelectedRole] = useState("software-engineer");
  
  // Game Session States
  const [stepIndex, setStepIndex] = useState(0);
  const [stats, setStats] = useState({ stress: 10, teamwork: 50, progress: 10 });
  const [selectedChoiceFeedback, setSelectedChoiceFeedback] = useState(null);
  
  // Typewriter completion trigger (hides buttons until text is fully typed!)
  const [typewriterDone, setTypewriterDone] = useState(false);

  const activeScenario = RPG_SCENARIOS[selectedRole];
  const activeStep = activeScenario?.steps[stepIndex];

  // Start the RPG simulation game
  const startGame = () => {
    setStats({ stress: 10, teamwork: 50, progress: 10 });
    setStepIndex(0);
    setSelectedChoiceFeedback(null);
    setTypewriterDone(false);
    setStage("story");
  };

  // Handle choice submission
  const makeChoice = (choice) => {
    setTypewriterDone(false);
    setSelectedChoiceFeedback(choice);
    
    // Apply state updates (capped within 0 - 100)
    setStats((prev) => ({
      stress: Math.max(0, Math.min(100, prev.stress + (choice.effects.stress || 0))),
      teamwork: Math.max(0, Math.min(100, prev.teamwork + (choice.effects.teamwork || 0))),
      progress: Math.max(0, Math.min(100, prev.progress + (choice.effects.progress || 0)))
    }));
  };

  // Advance to next chapter
  const advanceStory = () => {
    setSelectedChoiceFeedback(null);
    setTypewriterDone(false);
    
    if (activeStep && activeStep.nextStep === "finish") {
      setStage("finish");
      saveRpgCompletion(selectedRole);
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="rpg-view">
      {stage === "setup" && (
        <div className="setup-card glass-card">
          <div className="setup-header">
            <Gamepad2 className="setup-logo pulse-glow" />
            <h3>Day-in-the-Life RPG</h3>
            <p>Step into the shoes of a tech professional. Navigate high-pressure situations, coordinate with stakeholders, and see if you have what it takes to succeed!</p>
          </div>

          <div className="role-selector-grid">
            {Object.keys(RPG_SCENARIOS).map((roleKey) => {
              const scenario = RPG_SCENARIOS[roleKey];
              const isSelected = selectedRole === roleKey;
              return (
                <button
                  key={roleKey}
                  className={`role-select-card glass-card ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    playHoverSound();
                    setSelectedRole(roleKey);
                  }}
                >
                  <span className="role-icon">
                    {roleKey === "software-engineer" ? "💻" : "🎨"}
                  </span>
                  <h4>{scenario.roleName}</h4>
                  <p>{scenario.company}</p>
                </button>
              );
            })}
          </div>

          <button className="btn btn-primary btn-start-game" onClick={() => { playHoverSound(); startGame(); }}>
            Enter Simulator
          </button>
        </div>
      )}

      {stage === "story" && activeScenario && activeStep && (
        <div className="gameplay-container">
          
          {/* Left Side: Stats Indicator Panel */}
          <div className="game-stats-panel glass-card">
            <h4>Live Status Metrics</h4>
            
            <div className="stat-meter-group">
              <div className="meter-label">
                <span>Anxiety / Stress</span>
                <span className={`meter-val ${stats.stress > 60 ? "text-danger" : ""}`}>{stats.stress}%</span>
              </div>
              <div className="meter-bg">
                <div 
                  className="meter-fill stress-color" 
                  style={{ width: `${stats.stress}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-meter-group">
              <div className="meter-label">
                <span>Collaboration / Teamwork</span>
                <span className="meter-val">{stats.teamwork}%</span>
              </div>
              <div className="meter-bg">
                <div 
                  className="meter-fill teamwork-color" 
                  style={{ width: `${stats.teamwork}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-meter-group">
              <div className="meter-label">
                <span>Project Progress</span>
                <span className="meter-val">{stats.progress}%</span>
              </div>
              <div className="meter-bg">
                <div 
                  className="meter-fill progress-color" 
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right Side: Dialog and choices box */}
          <div className="dialog-panel-card glass-card">
            <div className="dialog-header">
              <span className="location-tag">{activeScenario.company}</span>
              <h5>{activeStep.title}</h5>
            </div>

            {/* If choice has not been made yet, show prompt */}
            {!selectedChoiceFeedback ? (
              <div className="dialog-body">
                {/* Typewriter story narrative */}
                <p className="scene-text">
                  <TypewriterText 
                    text={activeStep.text} 
                    onComplete={() => setTypewriterDone(true)} 
                  />
                </p>
                
                {/* Reveal choices with transition scale fade */}
                <div className={`choices-list ${typewriterDone ? "reveal" : "hidden"}`}>
                  {activeStep.choices.map((choice, i) => (
                    <button
                      key={i}
                      className="choice-btn glass-card"
                      onClick={() => {
                        playHoverSound();
                        makeChoice(choice);
                      }}
                    >
                      <span className="choice-number">{i + 1}</span>
                      <p className="choice-text">{choice.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* If choice has been made, show resolution screen */
              <div className="dialog-resolution animate-fade">
                <div className="choice-summary-box">
                  <span className="summary-lbl">YOUR DECISION</span>
                  <p>"{selectedChoiceFeedback.text}"</p>
                </div>

                <div className="feedback-result-box">
                  <span className="summary-lbl">CONSEQUENCES</span>
                  <p className="resolution-text">
                    <TypewriterText 
                      text={selectedChoiceFeedback.resultText}
                      onComplete={() => setTypewriterDone(true)}
                    />
                  </p>
                </div>

                <div className={`resolution-action-block ${typewriterDone ? "reveal" : "hidden"}`}>
                  <div className="stat-adjustments-row">
                    {Object.entries(selectedChoiceFeedback.effects).map(([stat, val]) => {
                      const isPositive = val >= 0;
                      return (
                        <div key={stat} className={`adjust-pill ${isPositive ? "pos" : "neg"}`}>
                          {stat === "stress" ? "Stress" : stat === "teamwork" ? "Teamwork" : "Progress"}: {isPositive ? `+${val}` : val}%
                        </div>
                      );
                    })}
                  </div>

                  <button className="btn btn-cyan btn-next-stage" onClick={() => { playHoverSound(); advanceStory(); }}>
                    <span>Continue Scenario</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {stage === "finish" && activeScenario && (
        <div className="finish-report glass-card">
          <Award className="finish-logo pulse-glow" />
          <span className="badge badge-success">Scenario Complete</span>
          <h3>Simulation Summary</h3>
          <p>You survived your day as an associate at <strong>{activeScenario.company}</strong>! You earned <strong>+200 EXP</strong>.</p>
          
          <div className="finish-stats-grid grid-3">
            <div className="finish-stat-box glass-card">
              <span className="finish-lbl">Final Stress</span>
              <span className="finish-val">{stats.stress}%</span>
              <span className="finish-comment">
                {stats.stress > 65 ? "Burnout risk: high." : stats.stress > 35 ? "Sustainable work pace." : "Very calm under fire!"}
              </span>
            </div>

            <div className="finish-stat-box glass-card">
              <span className="finish-lbl">Final Teamwork</span>
              <span className="finish-val">{stats.teamwork}%</span>
              <span className="finish-comment">
                {stats.teamwork >= 75 ? "Exceptional collaborator!" : stats.teamwork >= 50 ? "Solid team player." : "Needs to pair more."}
              </span>
            </div>

            <div className="finish-stat-box glass-card">
              <span className="finish-lbl">Project Progress</span>
              <span className="finish-val">{stats.progress}%</span>
              <span className="finish-comment">
                {stats.progress >= 60 ? "Shipped successfully!" : stats.progress >= 30 ? "Delayed but stable." : "Missed launch window."}
              </span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => setStage("setup")}>
            Try Another Simulator Role
          </button>
        </div>
      )}

      <style>{`
        .rpg-view {
          display: flex;
          flex-direction: column;
        }

        .gameplay-container {
          display: grid;
          grid-template-columns: 0.7fr 1.3fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 992px) {
          .gameplay-container {
            grid-template-columns: 1fr;
          }
        }

        .game-stats-panel {
          background: var(--bg-secondary) !important;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .game-stats-panel h4 {
          font-size: 1rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
        }

        .stat-meter-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .meter-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .meter-val {
          color: var(--text-primary);
        }

        .meter-bg {
          height: 10px;
          background: var(--bg-tertiary);
          border-radius: 99px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.03);
        }

        .meter-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.4s ease-out;
        }

        .meter-fill.stress-color {
          background: linear-gradient(90deg, var(--accent-warning), var(--accent-danger));
        }

        .meter-fill.teamwork-color {
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-primary));
        }

        .meter-fill.progress-color {
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        }

        /* Dialog Panel card styling */
        .dialog-panel-card {
          min-height: 380px;
          display: flex;
          flex-direction: column;
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 1.25rem;
        }

        .location-tag {
          font-size: 0.7rem;
          font-weight: 800;
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent-primary);
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .dialog-header h5 {
          font-size: 1rem;
        }

        .scene-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          min-height: 50px;
        }

        /* Choices reveal transitions */
        .choices-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .choices-list.hidden {
          opacity: 0;
          transform: translateY(10px);
          pointer-events: none;
        }

        .choices-list.reveal {
          opacity: 1;
          transform: translateY(0);
        }

        .choice-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.25rem !important;
          background: rgba(255,255,255,0.01) !important;
          border: 1px solid var(--glass-border) !important;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          width: 100%;
        }

        .choice-btn:hover {
          background: rgba(99, 102, 241, 0.04) !important;
          border-color: var(--accent-primary) !important;
          transform: translateX(6px);
          box-shadow: var(--glow-primary);
        }

        .choice-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-secondary);
        }

        .choice-text {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .choice-btn:hover .choice-text {
          color: var(--text-primary);
        }

        /* Choice resolution screen styles */
        .dialog-resolution {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .choice-summary-box, .feedback-result-box {
          background: rgba(255,255,255,0.01);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          padding: 0.85rem 1.25rem;
        }

        .summary-lbl {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.25rem;
          letter-spacing: 0.05em;
        }

        .choice-summary-box p {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          font-style: italic;
        }

        .resolution-text {
          font-size: 0.9rem;
          line-height: 1.55;
          color: var(--text-primary);
          min-height: 40px;
        }

        .resolution-action-block {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: opacity 0.5s ease;
        }

        .resolution-action-block.hidden {
          opacity: 0;
          pointer-events: none;
        }

        .resolution-action-block.reveal {
          opacity: 1;
        }

        .stat-adjustments-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .adjust-pill {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          border: 1px solid transparent;
        }

        .adjust-pill.pos {
          background: rgba(16, 185, 129, 0.08);
          color: var(--accent-success);
          border-color: rgba(16, 185, 129, 0.15);
        }

        .adjust-pill.neg {
          background: rgba(239, 68, 68, 0.08);
          color: var(--accent-danger);
          border-color: rgba(239, 68, 68, 0.15);
        }

        .btn-next-stage {
          align-self: flex-end;
          margin-top: 0.5rem;
        }

        /* Finish view styling */
        .finish-report {
          text-align: center;
          max-width: 700px;
          margin: 2rem auto;
          padding: 3rem !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .finish-logo {
          width: 50px;
          height: 50px;
          color: var(--accent-warning);
        }

        .finish-report h3 {
          font-size: 1.6rem;
        }

        .finish-stats-grid {
          width: 100%;
          margin: 1rem 0;
        }

        .finish-stat-box {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: center;
          padding: 1.25rem !important;
          background: rgba(255,255,255,0.01) !important;
        }

        .finish-lbl {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .finish-val {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .finish-comment {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-secondary);
        }
      `}</style>
    </div>
  );
}

import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { CAREER_PATHS } from "../data/mockData";
import { generateCustomRoadmap } from "../services/gemini";
import { 
  DollarSign, 
  TrendingUp, 
  BookOpen, 
  ExternalLink,
  Calculator,
  Brain,
  Sparkles,
  RefreshCw,
  GitCommit
} from "lucide-react";

export default function Roadmap() {
  const { apiKey, progress, toggleMilestone } = useContext(AppContext);
  const [selectedId, setSelectedId] = useState(CAREER_PATHS[0].id);
  
  // Left Canvas mode: 'tree' | 'custom'
  const [canvasMode, setCanvasMode] = useState("tree");

  // Right details panel tab: 'milestones' | 'wealth'
  const [detailsTab, setDetailsTab] = useState("milestones");

  // Wealth simulator states
  const [housingPct, setHousingPct] = useState(30);
  const [essentialsPct, setEssentialsPct] = useState(25);
  const [savingsPct, setSavingsPct] = useState(20);

  // Dynamic AI Roadmap Generator inputs & states
  const [userSkillsInput, setUserSkillsInput] = useState("");
  const [targetCareerInput, setTargetCareerInput] = useState("");
  const [customRoadmap, setCustomRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState("");

  const selectedCareer = CAREER_PATHS.find((c) => c.id === selectedId) || CAREER_PATHS[0];

  // Helper to draw connection lines between SVG nodes
  const renderConnectionLines = () => {
    const lines = [];
    CAREER_PATHS.forEach((career) => {
      if (career.connections) {
        career.connections.forEach((targetId) => {
          const target = CAREER_PATHS.find((c) => c.id === targetId);
          if (target) {
            lines.push(
              <line
                key={`${career.id}-${targetId}`}
                x1={career.coordinates.x}
                y1={career.coordinates.y}
                x2={target.coordinates.x}
                y2={target.coordinates.y}
                className="roadmap-link-line"
              />
            );
          }
        });
      }
    });
    return lines;
  };

  // Helper to calculate milestone status for a career path
  const getCareerProgress = (career) => {
    const total = career.milestones.length;
    const completed = career.milestones.filter(m => 
      progress.completedMilestones.includes(m.id)
    ).length;
    return { completed, total, percent: total === 0 ? 0 : Math.floor((completed / total) * 100) };
  };

  // Parse average salary range
  const calculateNetMonthly = (salaryStr) => {
    const cleaned = salaryStr.replace(/[^0-9-]/g, "");
    const parts = cleaned.split("-");
    if (parts.length === 2) {
      const low = parseInt(parts[0]);
      const high = parseInt(parts[1]);
      const avg = (low + high) / 2;
      const netMonthly = Math.round((avg * 0.75) / 12);
      return netMonthly;
    }
    return 6000;
  };

  const netMonthlyPay = calculateNetMonthly(selectedCareer.salary);
  const funPct = Math.max(0, 100 - (housingPct + essentialsPct + savingsPct));

  // Actual dollar allocations
  const housingAmt = Math.round((netMonthlyPay * housingPct) / 100);
  const essentialsAmt = Math.round((netMonthlyPay * essentialsPct) / 100);
  const savingsAmt = Math.round((netMonthlyPay * savingsPct) / 100);
  const funAmt = Math.round((netMonthlyPay * funPct) / 100);

  // Generate Custom Dynamic Roadmap via Gemini API
  const handleGenerateCustomRoadmap = async (e) => {
    e.preventDefault();
    if (!userSkillsInput.trim() || !targetCareerInput.trim()) return;

    setRoadmapLoading(true);
    setRoadmapError("");
    setCustomRoadmap(null);

    try {
      const generatedPath = await generateCustomRoadmap(
        apiKey,
        userSkillsInput.trim(),
        targetCareerInput.trim()
      );
      setCustomRoadmap(generatedPath);
    } catch (err) {
      console.error(err);
      setRoadmapError(err.message || "Failed to generate custom path.");
    } finally {
      setRoadmapLoading(false);
    }
  };

  const loadSkillsSample = () => {
    setUserSkillsInput("Basic HTML, CSS, writing blog posts, video editing on Premiere.");
    setTargetCareerInput("Lead UX/UI Designer");
  };

  return (
    <div className="roadmap-view">
      <div className="roadmap-layout">
        
        {/* Left Side: SVG Interactive Canvas or Dynamic AI Generator */}
        <div className="roadmap-canvas-container glass-card">
          <div className="canvas-header-row">
            <div className="canvas-header-titles">
              <h4>Career Mapping Canvas</h4>
              <p>Switch between the structural Career Tree or synthesize a custom AI path.</p>
            </div>
            
            <div className="canvas-mode-controls">
              <button 
                type="button" 
                className={`mode-btn ${canvasMode === "tree" ? "active" : ""}`}
                onClick={() => setCanvasMode("tree")}
              >
                Career Tree
              </button>
              <button 
                type="button" 
                className={`mode-btn ${canvasMode === "custom" ? "active" : ""}`}
                onClick={() => setCanvasMode("custom")}
              >
                <Sparkles size={14} />
                <span>AI Gap Builder</span>
              </button>
            </div>
          </div>
          
          {canvasMode === "tree" ? (
            <div className="canvas-viewport animate-fade">
              <svg viewBox="0 0 700 450" className="roadmap-svg">
                <defs>
                  <filter id="shadow-glow-node" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Render links */}
                {renderConnectionLines()}

                {/* Render nodes */}
                {CAREER_PATHS.map((career) => {
                  const isSelected = career.id === selectedId;
                  const { percent } = getCareerProgress(career);
                  const isNodeCompleted = percent === 100;
                  
                  return (
                    <g 
                      key={career.id} 
                      transform={`translate(${career.coordinates.x}, ${career.coordinates.y})`}
                      className={`roadmap-node-group ${isSelected ? "selected" : ""} ${isNodeCompleted ? "completed" : ""}`}
                      onClick={() => setSelectedId(career.id)}
                    >
                      {isSelected && (
                        <circle 
                          r="32" 
                          fill="none" 
                          stroke="var(--accent-primary)" 
                          strokeWidth="2" 
                          className="pulse-glow-ring"
                        />
                      )}
                      
                      <circle 
                        r="24" 
                        className="roadmap-node-circle"
                      />

                      <circle
                        r="24"
                        fill="none"
                        stroke={isNodeCompleted ? "var(--accent-success)" : "var(--accent-secondary)"}
                        strokeWidth="3"
                        strokeDasharray="150"
                        strokeDashoffset={150 - (150 * percent) / 100}
                        className="roadmap-node-progress-border"
                      />

                      <text 
                        y="42" 
                        textAnchor="middle" 
                        className="roadmap-node-text"
                      >
                        {career.title.split(" ")[0]}..
                      </text>

                      <text 
                        y="5" 
                        textAnchor="middle" 
                        className="roadmap-node-symbol"
                      >
                        {career.category === "Technology" ? "💻" : career.category === "Creative" ? "🎨" : "📊"}
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              <div className="canvas-legend">
                <div className="legend-item"><span className="legend-dot tech"></span> Technology</div>
                <div className="legend-item"><span className="legend-dot creative"></span> Creative</div>
                <div className="legend-item"><span className="legend-dot finance"></span> Data & Finance</div>
              </div>
            </div>
          ) : (
            /* Custom AI Gap Builder Panel */
            <div className="custom-ai-path-panel animate-fade">
              <div className="custom-path-form-box">
                <div className="card-header-with-actions">
                  <h5>Synthesize Custom Roadmap</h5>
                  <button type="button" className="btn-sample-load" onClick={loadSkillsSample}>
                    Load Sample Goals
                  </button>
                </div>

                <form onSubmit={handleGenerateCustomRoadmap} className="custom-path-form">
                  <div className="input-group-row">
                    <div className="input-group">
                      <label className="input-label">Current Skills & Knowledge</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Python basics, writing, Excel..."
                        value={userSkillsInput}
                        onChange={(e) => setUserSkillsInput(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Target Dream Career</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. AI Product Manager, ML Specialist..."
                        value={targetCareerInput}
                        onChange={(e) => setTargetCareerInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-cyan btn-generate-path"
                    disabled={roadmapLoading || !userSkillsInput.trim() || !targetCareerInput.trim()}
                  >
                    {roadmapLoading ? (
                      <>
                        <RefreshCw className="loading-spinner-mini" />
                        <span>Analyzing Gap...</span>
                      </>
                    ) : (
                      <>
                        <Brain size={16} />
                        <span>Synthesize AI Bridging Pathway</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Dynamic Timeline Output */}
              <div className="custom-path-results">
                {roadmapLoading ? (
                  <div className="timeline-loading-box">
                    <RefreshCw className="loading-spinner" />
                    <h5>Analyzing skill intersections and structuring milestones...</h5>
                  </div>
                ) : roadmapError ? (
                  <div className="timeline-error-box">
                    <AlertCircle className="error-icon" />
                    <p>{roadmapError}</p>
                  </div>
                ) : customRoadmap ? (
                  <div className="custom-timeline-vertical">
                    {customRoadmap.map((step, idx) => (
                      <div key={idx} className="timeline-node-card glass-card">
                        <div className="node-marker-row">
                          <div className="node-marker-badge">STEP {idx + 1}</div>
                          {idx < customRoadmap.length - 1 && <div className="vertical-connecting-line"></div>}
                        </div>
                        <div className="node-content-text">
                          <h6>{step.label}</h6>
                          <p>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="timeline-empty-box">
                    <GitCommit size={36} className="empty-timeline-icon" />
                    <p>Your custom-tailored learning timeline will generate here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Sidebar detailing the selected career */}
        <div className="career-details-panel glass-card">
          <div className="career-header-details">
            <span className="badge badge-indigo">{selectedCareer.category}</span>
            <h3>{selectedCareer.title}</h3>
            <p className="career-desc">{selectedCareer.description}</p>
          </div>

          <div className="stats-mini-row">
            <div className="stat-mini">
              <DollarSign size={16} className="stat-mini-icon text-cyan" />
              <div>
                <span className="mini-lbl">Est. Salary</span>
                <span className="mini-val">{selectedCareer.salary}</span>
              </div>
            </div>
            <div className="stat-mini">
              <TrendingUp size={16} className="stat-mini-icon text-indigo" />
              <div>
                <span className="mini-lbl">Growth</span>
                <span className="mini-val">{selectedCareer.growth}</span>
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="roadmap-tab-nav">
            <button 
              className={`roadmap-tab-btn ${detailsTab === "milestones" ? "active" : ""}`}
              onClick={() => setDetailsTab("milestones")}
            >
              <BookOpen size={14} />
              <span>Milestones & Study</span>
            </button>
            <button 
              className={`roadmap-tab-btn ${detailsTab === "wealth" ? "active" : ""}`}
              onClick={() => setDetailsTab("wealth")}
            >
              <Calculator size={14} />
              <span>Wealth & Budget</span>
            </button>
          </div>

          {detailsTab === "milestones" ? (
            <>
              <div className="details-section">
                <h4>Learning Milestones <span className="section-sub">(+50 EXP each)</span></h4>
                <div className="milestone-list">
                  {selectedCareer.milestones.map((milestone) => {
                    const isCompleted = progress.completedMilestones.includes(milestone.id);
                    return (
                      <label 
                        key={milestone.id} 
                        className={`milestone-row ${isCompleted ? "completed" : ""}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isCompleted}
                          onChange={() => toggleMilestone(milestone.id)}
                          className="milestone-checkbox"
                        />
                        <div className="milestone-text">
                          <span className="milestone-lbl">{milestone.label}</span>
                          <span className="milestone-desc">{milestone.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="details-section">
                <h4>Recommended Resources</h4>
                <div className="resource-list">
                  {selectedCareer.resources.map((res, i) => (
                    <a 
                      key={i} 
                      href={res.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="resource-card"
                    >
                      <div className="res-icon">
                        <BookOpen size={16} />
                      </div>
                      <div className="res-info">
                        <span className="res-title">{res.name}</span>
                        <span className="res-type">{res.type}</span>
                      </div>
                      <ExternalLink size={14} className="res-arrow" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Wealth & Budget Simulator Tab View */
            <div className="details-section wealth-sim-section">
              <div className="net-pay-banner glass-card">
                <span className="net-pay-lbl">EST. MONTHLY NET PAY</span>
                <h3>${netMonthlyPay.toLocaleString()}/mo</h3>
                <p>Calculated after standard tax brackets based on average career earnings.</p>
              </div>

              <div className="budget-sliders">
                <div className="slider-group">
                  <div className="slider-label">
                    <span>Housing (Rent/Mortgage)</span>
                    <span>{housingPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="45"
                    value={housingPct}
                    onChange={(e) => setHousingPct(parseInt(e.target.value))}
                    className="budget-slider-input"
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-label">
                    <span>Food & Essentials</span>
                    <span>{essentialsPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="35"
                    value={essentialsPct}
                    onChange={(e) => setEssentialsPct(parseInt(e.target.value))}
                    className="budget-slider-input"
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-label">
                    <span>Savings & Investments</span>
                    <span>{savingsPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={savingsPct}
                    onChange={(e) => setSavingsPct(parseInt(e.target.value))}
                    className="budget-slider-input"
                  />
                </div>
              </div>

              <div className="budget-chart-section">
                <h5>Visual Asset Allocation</h5>
                <div className="stacked-bar-container">
                  <svg width="100%" height="22" className="stacked-bar-svg">
                    <rect x="0" width={`${housingPct}%`} height="22" fill="var(--accent-primary)" />
                    <rect x={`${housingPct}%`} width={`${essentialsPct}%`} height="22" fill="var(--accent-secondary)" />
                    <rect x={`${housingPct + essentialsPct}%`} width={`${savingsPct}%`} height="22" fill="var(--accent-success)" />
                    <rect x={`${housingPct + essentialsPct + savingsPct}%`} width={`${funPct}%`} height="22" fill="var(--accent-purple)" />
                  </svg>
                </div>
                
                <div className="budget-details-legend">
                  <div className="legend-pill housing">
                    <span className="dot"></span>
                    <span>Housing: ${housingAmt.toLocaleString()} ({housingPct}%)</span>
                  </div>
                  <div className="legend-pill essentials">
                    <span className="dot"></span>
                    <span>Essentials: ${essentialsAmt.toLocaleString()} ({essentialsPct}%)</span>
                  </div>
                  <div className="legend-pill savings">
                    <span className="dot"></span>
                    <span>Savings: ${savingsAmt.toLocaleString()} ({savingsPct}%)</span>
                  </div>
                  <div className="legend-pill fun">
                    <span className="dot"></span>
                    <span>Discretionary: ${funAmt.toLocaleString()} ({funPct}%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .roadmap-view {
          display: flex;
          flex-direction: column;
        }

        .roadmap-layout {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .roadmap-layout {
            grid-template-columns: 1fr;
          }
        }

        .roadmap-canvas-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .canvas-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.75rem;
          gap: 1rem;
        }

        .canvas-header-titles h4 {
          font-size: 1.2rem;
          margin-bottom: 0.2rem;
        }

        .canvas-header-titles p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .canvas-mode-controls {
          display: flex;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          padding: 0.25rem;
        }

        .mode-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          padding: 0.45rem 0.85rem;
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .mode-btn.active {
          color: var(--text-primary);
          background: var(--bg-primary);
          box-shadow: var(--shadow-sm);
        }

        .canvas-viewport {
          position: relative;
          background: rgba(4, 5, 8, 0.4);
          border-radius: var(--border-radius-md);
          border: 1px solid var(--glass-border);
          overflow: hidden;
          padding: 1rem;
        }

        .roadmap-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .roadmap-link-line {
          stroke: var(--glass-border-hover);
          stroke-width: 2.5;
          stroke-dasharray: 6 4;
          animation: flowDash 30s linear infinite;
        }

        @keyframes flowDash {
          to { stroke-dashoffset: -100; }
        }

        .roadmap-node-group {
          cursor: pointer;
        }

        .roadmap-node-circle {
          fill: var(--bg-tertiary);
          stroke: var(--glass-border);
          stroke-width: 2.5;
          transition: all 0.3s ease;
        }

        .roadmap-node-group:hover .roadmap-node-circle {
          fill: var(--bg-secondary);
          stroke: var(--accent-primary);
          filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
        }

        .roadmap-node-group.selected .roadmap-node-circle {
          fill: var(--bg-secondary);
          stroke: var(--accent-primary);
        }

        .roadmap-node-progress-border {
          transform: rotate(-90deg);
          transform-origin: 0 0;
          transition: stroke-dashoffset 0.4s ease;
        }

        .roadmap-node-text {
          fill: var(--text-secondary);
          font-size: 11px;
          font-weight: 700;
          pointer-events: none;
          letter-spacing: -0.01em;
          transition: fill 0.2s ease;
        }

        .roadmap-node-group.selected .roadmap-node-text,
        .roadmap-node-group:hover .roadmap-node-text {
          fill: var(--text-primary);
        }

        .roadmap-node-symbol {
          font-size: 18px;
          pointer-events: none;
        }

        .pulse-glow-ring {
          animation: pulseRing 2s infinite ease-out;
          transform-origin: 0 0;
        }

        @keyframes pulseRing {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.15); opacity: 0; }
        }

        .canvas-legend {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--glass-border);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.tech { background: var(--accent-primary); }
        .legend-dot.creative { background: var(--accent-purple); }
        .legend-dot.finance { background: var(--accent-secondary); }

        /* Dynamic AI Path generator styles */
        .custom-ai-path-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .custom-path-form-box {
          border-bottom: 1px dashed var(--glass-border);
          padding-bottom: 1.25rem;
        }

        .card-header-with-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .btn-sample-load {
          background: transparent;
          border: 1px dashed var(--accent-secondary);
          color: var(--accent-secondary);
          padding: 0.3rem 0.65rem;
          font-size: 0.75rem;
          font-family: var(--font-sans);
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-sample-load:hover {
          background: rgba(6, 182, 212, 0.08);
          border-style: solid;
        }

        .custom-path-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 576px) {
          .input-group-row {
            grid-template-columns: 1fr;
          }
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .input-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .btn-generate-path {
          width: 100%;
        }

        /* Vertical Custom Timeline */
        .custom-path-results {
          min-height: 200px;
          display: flex;
          flex-direction: column;
        }

        .timeline-empty-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          gap: 0.75rem;
          padding: 3rem;
          text-align: center;
        }

        .empty-timeline-icon {
          color: var(--text-muted);
        }

        .timeline-loading-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem;
          text-align: center;
        }

        .custom-timeline-vertical {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-left: 0.5rem;
        }

        .timeline-node-card {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          padding: 1.25rem !important;
          background: rgba(255, 255, 255, 0.01) !important;
          border-color: var(--glass-border) !important;
          position: relative;
        }

        .timeline-node-card:hover {
          border-color: var(--accent-secondary) !important;
          box-shadow: var(--glow-secondary) !important;
        }

        .node-marker-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex-shrink: 0;
          height: 100%;
        }

        .node-marker-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--bg-primary);
          background: var(--accent-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          letter-spacing: 0.02em;
          box-shadow: var(--glow-secondary);
        }

        .vertical-connecting-line {
          width: 2px;
          background: linear-gradient(180deg, var(--accent-secondary), var(--glass-border));
          position: absolute;
          top: 24px;
          bottom: -40px;
        }

        .node-content-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .node-content-text h6 {
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .node-content-text p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        /* Right Panel styling */
        .career-details-panel {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: var(--bg-secondary) !important;
        }

        .career-header-details h3 {
          font-size: 1.4rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .career-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .stats-mini-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .stat-mini {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-tertiary);
          padding: 0.65rem 0.85rem;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--glass-border);
        }

        .mini-lbl {
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-muted);
          display: block;
        }

        .mini-val {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .roadmap-tab-nav {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
        }

        .roadmap-tab-btn {
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 0.5rem 0.75rem;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.8rem;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .roadmap-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.02);
        }

        .roadmap-tab-btn.active {
          color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.15);
        }

        .details-section h4 {
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-sub {
          font-size: 0.75rem;
          color: var(--accent-secondary);
          font-weight: 600;
        }

        .milestone-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .milestone-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .milestone-row:hover {
          border-color: var(--glass-border-hover);
          background: rgba(255, 255, 255, 0.02);
        }

        .milestone-row.completed {
          border-color: rgba(16, 185, 129, 0.2);
          background: rgba(16, 185, 129, 0.03);
        }

        .milestone-checkbox {
          accent-color: var(--accent-success);
          width: 16px;
          height: 16px;
          margin-top: 0.2rem;
          cursor: pointer;
        }

        .milestone-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .milestone-lbl {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .milestone-row.completed .milestone-lbl {
          color: var(--accent-success);
          text-decoration: line-through;
        }

        .milestone-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .resource-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .resource-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }

        .resource-card:hover {
          border-color: var(--accent-secondary);
          transform: translateY(-1px);
        }

        .res-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-sm);
          background: rgba(6, 182, 212, 0.1);
          color: var(--accent-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .res-info {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .res-title {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .res-type {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }

        .res-arrow {
          color: var(--text-muted);
        }

        .wealth-sim-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          animation: fadeIn 0.3s ease-out;
        }

        .net-pay-banner {
          padding: 1rem !important;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%) !important;
          border-color: rgba(6, 182, 212, 0.15) !important;
          text-align: center;
        }

        .net-pay-lbl {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--accent-secondary);
          letter-spacing: 0.05em;
        }

        .net-pay-banner h3 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin: 0.15rem 0;
        }

        .net-pay-banner p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .budget-sliders {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .slider-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .budget-slider-input {
          width: 100%;
          accent-color: var(--accent-primary);
          cursor: pointer;
        }

        .budget-chart-section h5 {
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }

        .stacked-bar-container {
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 1rem;
          box-shadow: var(--shadow-sm);
        }

        .stacked-bar-svg rect {
          transition: width 0.3s ease, x 0.3s ease;
        }

        .budget-details-legend {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .legend-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .legend-pill .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-pill.housing .dot { background: var(--accent-primary); }
        .legend-pill.essentials .dot { background: var(--accent-secondary); }
        .legend-pill.savings .dot { background: var(--accent-success); }
        .legend-pill.fun .dot { background: var(--accent-purple); }

        /* Animation class trigger helper */
        .animate-fade {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

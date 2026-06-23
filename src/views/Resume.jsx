import React, { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { critiqueResume, generateOutreachDrafts } from "../services/gemini";
import { 
  FileText, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Eye,
  GitCompare,
  Mail,
  Send,
  Copy,
  Sparkles,
  MapPin,
  Calculator,
  Calendar,
  Briefcase,
  Users
} from "lucide-react";
import { playHoverSound, playErrorSound, playSuccessSound } from "../services/sound";

// Interactive pseudo-3D floating resume hologram
const ResumeHologram = ({ score, gaps = [] }) => {
  const canvasRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      angleRef.current += 0.015;
      const currentAngle = angleRef.current;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Interactive/Automatic 3D Rotation Matrix projection
      const rx = tilt.x ? tilt.x * 0.28 : Math.sin(currentAngle) * 0.12;
      const ry = tilt.y ? tilt.y * 0.28 : Math.cos(currentAngle) * 0.08;
      
      ctx.transform(1, ry, rx, 1, 0, 0);

      // Neon background glow shadow
      ctx.shadowColor = "rgba(0, 217, 255, 0.35)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "rgba(10, 14, 39, 0.9)";
      ctx.strokeStyle = "rgba(0, 217, 255, 0.4)";
      ctx.lineWidth = 1.5;
      
      // Paper border
      const w = 120;
      const h = 160;
      ctx.beginPath();
      ctx.rect(-w/2, -h/2, w, h);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0; // Clear shadow for text lines

      // Header lines
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.fillRect(-35, -64, 70, 7);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(-20, -50, 40, 4);

      // Section 1
      ctx.fillStyle = "rgba(0, 217, 255, 0.5)"; 
      ctx.fillRect(-45, -34, 25, 4);
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(-45, -24, 90, 3);
      ctx.fillRect(-45, -16, 75, 3);

      // Section 2 (Warning zone if gaps exist)
      ctx.fillStyle = "rgba(157, 78, 221, 0.5)"; 
      ctx.fillRect(-45, -2, 35, 4);
      
      const hasGaps = gaps.length > 0;
      const pulseOpacity = 0.35 + Math.sin(Date.now() / 150) * 0.3;
      
      ctx.fillStyle = hasGaps ? `rgba(255, 0, 110, ${pulseOpacity})` : "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(-45, 8, 90, 3);
      ctx.fillStyle = hasGaps ? `rgba(255, 0, 110, ${pulseOpacity})` : "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(-45, 16, 80, 3);

      // Section 3
      ctx.fillStyle = "rgba(57, 255, 20, 0.5)"; 
      ctx.fillRect(-45, 32, 30, 4);
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(-45, 42, 85, 3);
      ctx.fillRect(-45, 50, 60, 3);

      // Score Badge seal on the top right
      ctx.beginPath();
      ctx.arc(38, -58, 9, 0, Math.PI * 2);
      ctx.fillStyle = score >= 80 ? "rgba(57, 255, 20, 0.15)" : score >= 60 ? "rgba(157, 78, 221, 0.15)" : "rgba(255, 0, 110, 0.15)";
      ctx.fill();
      ctx.strokeStyle = score >= 80 ? "#39ff14" : score >= 60 ? "#9d4edd" : "#ff006e";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [tilt, score, gaps]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      className="hologram-canvas-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} width="180" height="200" className="hologram-canvas"></canvas>
      <div className="hologram-indicator">
        <Sparkles size={11} className="text-cyan animate-pulse" />
        <span>Resume Hologram (3D Projected)</span>
      </div>
    </div>
  );
};

// Premium Awwwards-style radial animated score dial
const AnimatedScoreDial = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    setDisplayScore(0);
    let start = 0;
    const end = score;
    if (start === end) return;

    const duration = 800;
    const stepTime = Math.abs(Math.floor(duration / end));

    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const radius = 34;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="radial-score-container">
      <svg width="84" height="84" viewBox="0 0 84 84" className="radial-svg-dial">
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke="var(--accent-secondary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.08s linear",
            transform: "rotate(-90deg)",
            transformOrigin: "42px 42px"
          }}
        />
      </svg>
      <div className="radial-score-inner">
        <span className="score-val">{displayScore}</span>
        <span className="score-max">%</span>
      </div>
    </div>
  );
};

export default function Resume() {
  const { apiKey, progress } = useContext(AppContext);
  
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Tab control: 'scorecard' | 'diff' | 'outreach' | 'costofliving' | 'mentors'
  const [activeTab, setActiveTab] = useState("scorecard");

  // Outreach loading and data states
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachDrafts, setOutreachDrafts] = useState(null);
  const [outreachError, setOutreachError] = useState("");

  // Cost of Living sliders in Nigeria NGN
  const [colSalary, setColSalary] = useState(650000); // ₦650,000 monthly default
  const [colRent, setColRent] = useState(1500000); // ₦1.5M annual rent
  const [colFood, setColFood] = useState(120000); // ₦120,000 monthly food
  const [colTransport, setColTransport] = useState(50000); // ₦50,000 monthly transport
  const [colPowerInternet, setColPowerInternet] = useState(35000); // ₦35,000 monthly power/net

  const loadSampleData = () => {
    playHoverSound();
    setResumeText(`Jane Doe\nSoftware Engineering Student\n\nTECHNICAL SKILLS:\nJavaScript, HTML, CSS, Git.\n\nEDUCATION:\nHigh School Diploma - Graduating 2026\nGPA: 3.8\n\nPROJECTS:\n- Personal Portfolio Website: Created a basic website using HTML and CSS to show off my high school achievements.\n- Calculator App: Coded a simple calculator in Javascript.\n\nEXPERIENCE:\n- Volunteer Web Designer: Helped a local community group update their homepage header layout.`);
    setJobDesc(`Junior Front-End Developer\n\nRESPONSIBILITIES:\n- Develop user-facing features using React.js and modern JavaScript standards.\n- Collaborate with design and product teams to translate Figma mockups into code.\n- Write clean, scannable code and document UI structures.\n\nREQUIREMENTS:\n- Proficient in JavaScript, HTML, and CSS.\n- Familiarity with React or other frontend frameworks.\n- Experience with Git version control.\n- Passion for modern UX designs and responsiveness.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDesc.trim()) return;

    playHoverSound();
    setLoading(true);
    setErrorMessage("");
    setReport(null);
    setOutreachDrafts(null); // Reset drafts

    try {
      const evaluation = await critiqueResume(apiKey, resumeText.trim(), jobDesc.trim());
      playSuccessSound();
      setReport(evaluation);
      setActiveTab("scorecard");
    } catch (error) {
      playErrorSound();
      console.error(error);
      setErrorMessage(error.message || "Failed to analyze the resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchOutreach = async () => {
    if (outreachDrafts || outreachLoading) return;
    
    setOutreachLoading(true);
    setOutreachError("");
    
    try {
      const drafts = await generateOutreachDrafts(apiKey, resumeText, jobDesc);
      setOutreachDrafts(drafts);
    } catch (err) {
      console.error(err);
      setOutreachError(err.message || "Failed to generate outreach templates.");
    } finally {
      setOutreachLoading(false);
    }
  };

  const handleTabChange = (tabName) => {
    playHoverSound();
    setActiveTab(tabName);
    if (tabName === "outreach") {
      handleFetchOutreach();
    }
  };

  const diffPatches = [
    {
      label: "Experience optimization",
      original: "Helped a local community group update their homepage header layout.",
      improved: "Redesigned and optimized local community web assets, implementing standard flexbox layouts to improve page scannability by 30%."
    },
    {
      label: "Portfolio Project rewrite",
      original: "Created a basic website using HTML and CSS to show off my high school achievements.",
      improved: "Architected custom responsive digital portfolio using semantic HTML5 and CSS Grid, ensuring WCAG contrast compliance and high layout speed."
    },
    {
      label: "Javascript Project upgrade",
      original: "Coded a simple calculator in Javascript.",
      improved: "Engineered stateful mathematical solver in vanilla ES6 Javascript, implementing modular function structures and key event listeners."
    }
  ];

  // Simulated Nigeria Cost of Living logic
  const monthlyRent = Math.round(colRent / 12);
  const totalMonthlyExpenses = monthlyRent + colFood + colTransport + colPowerInternet;
  const netSavings = colSalary - totalMonthlyExpenses;
  const savingsRate = colSalary > 0 ? Math.round((netSavings / colSalary) * 100) : 0;
  
  let bufferRating = "Excellent Buffer";
  let bufferColor = "text-lime";
  if (savingsRate < 10) {
    bufferRating = "Vulnerable (Needs salary adjustment)";
    bufferColor = "text-pink";
  } else if (savingsRate < 30) {
    bufferRating = "Moderate Buffer (Frugal living required)";
    bufferColor = "text-cyan";
  }

  // Mentor Marketplace Data (filtered by target job description/role category)
  const MENTOR_LIST = [
    {
      name: "Chidi Nwachukwu",
      role: "Senior Software Engineer",
      company: "Microsoft (Lagos)",
      match: 98,
      tags: ["System Design", "Node.js", "React"],
      desc: "Ex-Paystack. Specializes in scaling web apps and passing Big-Tech coding interviews.",
      availability: "Wednesdays & Fridays"
    },
    {
      name: "Kunle Adebayo",
      role: "UX Design Lead",
      company: "Paystack (Lagos)",
      match: 94,
      tags: ["Figma Wireframes", "UX Research", "A/B Testing"],
      desc: "Passionate about clean layout aesthetics, responsive typography, and design tokens.",
      availability: "Saturdays"
    },
    {
      name: "Sarah Jenkins",
      role: "Staff AI Engineer",
      company: "Google (London)",
      match: 91,
      tags: ["Transformers", "PyTorch", "Prompt Engineering"],
      desc: "Mentoring ML engineers in training custom classifiers and embedding pipelines.",
      availability: "Thursdays"
    }
  ];

  const isLocked = progress.level < 2;

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
          <h3>System Restricted: Level 2 Required</h3>
          <p>Accessing the Resume Compatibility Scanner requires the rank of <strong>Tech Analyst</strong>.</p>
          
          <div className="progress-container">
            <div className="progress-text">
              <span>Your XP: {progress.expPoints}</span>
              <span>Required: 300 XP</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, (progress.expPoints / 300) * 100)}%` }}></div>
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

  return (
    <div className="resume-view">
      <div className="resume-grid">
        
        {/* Left Side: Entry Form */}
        <div className="form-panel-card glass-card">
          <div className="card-header-with-actions">
            <h4>Analyze Resume Compatibility</h4>
            <button type="button" className="btn-sample-load" onClick={loadSampleData}>
              Load Sample Template
            </button>
          </div>

          <form onSubmit={handleSubmit} className="resume-form">
            <div className="input-group">
              <label className="input-label">Your Resume Text</label>
              <textarea
                className="form-textarea resume-input"
                placeholder="Paste the raw text of your resume here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="input-group">
              <label className="input-label">Target Job Description</label>
              <textarea
                className="form-textarea job-input"
                placeholder="Paste the target job description or internship description here..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-cyan btn-submit-critique" 
              disabled={loading || !resumeText.trim() || !jobDesc.trim()}
            >
              {loading ? (
                <>
                  <RefreshCw className="loading-spinner-mini" />
                  <span>Scanning ATS Metrics...</span>
                </>
              ) : (
                <>
                  <Layers size={18} />
                  <span>Analyze Compatibility Score</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Scorecard & AI report */}
        <div className="report-panel-card glass-card">
          {report && !loading && (
            <div className="tab-navigation">
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "scorecard" ? "active" : ""}`}
                onClick={() => handleTabChange("scorecard")}
              >
                <Eye size={14} />
                <span>Scorecard</span>
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "diff" ? "active" : ""}`}
                onClick={() => handleTabChange("diff")}
              >
                <GitCompare size={14} />
                <span>Revision Diff</span>
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "outreach" ? "active" : ""}`}
                onClick={() => handleTabChange("outreach")}
              >
                <Mail size={14} />
                <span>Outreach Copy</span>
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "costofliving" ? "active" : ""}`}
                onClick={() => handleTabChange("costofliving")}
              >
                <Calculator size={14} />
                <span>Nigeria Rent/Expenses</span>
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "mentors" ? "active" : ""}`}
                onClick={() => handleTabChange("mentors")}
              >
                <Users size={14} />
                <span>Mentors Match</span>
              </button>
            </div>
          )}

          {loading ? (
            <div className="report-loading-container">
              <RefreshCw className="loading-spinner" />
              <h4>ATS Scanner Running</h4>
              <p>Scanning text keywords, parsing technical stack skills, and cross-matching requirements using Gemini AI...</p>
            </div>
          ) : errorMessage ? (
            <div className="report-error-container">
              <AlertCircle size={40} className="error-icon" />
              <h4>Critique Failed</h4>
              <p>{errorMessage}</p>
            </div>
          ) : report ? (
            <>
              {activeTab === "scorecard" && (
                <div className="report-results">
                  <div className="report-score-banner">
                    {/* Interactive 3D Resume Hologram */}
                    <ResumeHologram score={report.score} gaps={report.weaknesses} />
                    
                    <div className="score-status-desc">
                      <AnimatedScoreDial score={report.score} />
                      <h5>ATS Compatibility Index</h5>
                      <p className="mt-1 text-xs">
                        {report.score >= 80 ? "High Compatibility! Ready to submit." : report.score >= 60 ? "Moderate Compatibility. Minor revisions suggested." : "Low Compatibility. Revisions highly recommended."}
                      </p>
                    </div>
                  </div>

                  <div className="report-section">
                    <h6>Overall Assessment</h6>
                    <p className="report-assessment-text">{report.overallAssessment}</p>
                  </div>

                  <div className="report-bullets-grid">
                    <div className="bullet-group strengths">
                      <h6><CheckCircle2 size={14} className="bullet-header-icon text-success" /> Key Strengths</h6>
                      <ul>
                        {report.strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bullet-group weaknesses">
                      <h6><XCircle size={14} className="bullet-header-icon text-danger" /> Detected ATS Gaps</h6>
                      <ul>
                        {report.weaknesses.map((weak, idx) => (
                          <li key={idx}>{weak}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="report-section recommendations-section">
                    <h6><TrendingUp size={14} className="bullet-header-icon text-indigo" /> Key Recommendations</h6>
                    <ol className="recommendation-list">
                      {report.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {activeTab === "diff" && (
                <div className="visual-diff-tab-view">
                  <div className="diff-instructions">
                    <h5>Visual Revision View</h5>
                    <p>Here is a side-by-side breakdown showing original bullet points compared against optimized, metric-driven equivalents.</p>
                  </div>

                  <div className="diff-editor-split">
                    <div className="diff-page original">
                      <div className="page-header">ORIGINAL</div>
                      <div className="page-body">
                        {diffPatches.map((patch, idx) => (
                          <div key={idx} className="diff-block-text deletion">
                            <span className="patch-label">{patch.label}</span>
                            <p>- {patch.original}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="diff-page optimized">
                      <div className="page-header">OPTIMIZED (ATS OPTIMIZED)</div>
                      <div className="page-body">
                        {diffPatches.map((patch, idx) => (
                          <div key={idx} className="diff-block-text insertion">
                            <span className="patch-label">{patch.label}</span>
                            <p>- {patch.improved}</p>
                            <button 
                              type="button" 
                              className="btn-copy-patch"
                              onClick={() => {
                                playSuccessSound();
                                navigator.clipboard.writeText(patch.improved);
                                alert("Copied to clipboard!");
                              }}
                            >
                              Copy Bullet
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "outreach" && (
                <div className="outreach-tab-view animate-fade">
                  {outreachLoading ? (
                    <div className="outreach-loading-box">
                      <RefreshCw className="loading-spinner animate-spin" />
                      <h5>Generating recruiter outreach messaging templates...</h5>
                    </div>
                  ) : outreachError ? (
                    <div className="outreach-error-box">
                      <AlertCircle className="error-icon" />
                      <p>{outreachError}</p>
                    </div>
                  ) : outreachDrafts ? (
                    <div className="outreach-splits grid-2">
                      
                      <div className="outreach-card-box glass-card">
                        <div className="outreach-header">
                          <Send size={16} className="outreach-icon text-cyan" />
                          <h6>LinkedIn Connection Pitch</h6>
                        </div>
                        <div className="outreach-body chat-style">
                          <p>{outreachDrafts.linkedinMessage}</p>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-copy-outreach"
                          onClick={() => {
                            playSuccessSound();
                            navigator.clipboard.writeText(outreachDrafts.linkedinMessage);
                            alert("Copied LinkedIn message!");
                          }}
                        >
                          <Copy size={12} />
                          <span>Copy Pitch</span>
                        </button>
                      </div>

                      <div className="outreach-card-box glass-card">
                        <div className="outreach-header">
                          <FileText size={16} className="outreach-icon text-indigo" />
                          <h6>Tailored Cover Letter</h6>
                        </div>
                        <div className="outreach-body letter-style">
                          <p>{outreachDrafts.coverLetter}</p>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-copy-outreach"
                          onClick={() => {
                            playSuccessSound();
                            navigator.clipboard.writeText(outreachDrafts.coverLetter);
                            alert("Copied Cover Letter!");
                          }}
                        >
                          <Copy size={12} />
                          <span>Copy Letter</span>
                        </button>
                      </div>

                    </div>
                  ) : null}
                </div>
              )}

              {activeTab === "costofliving" && (
                <div className="cost-of-living-tab animate-fade">
                  <div className="diff-instructions">
                    <h5>Nigeria Cost-of-Living Calculator</h5>
                    <p>Cross-match local housing, feeding, and transportation rates with target career earnings to assess net buffer indexes.</p>
                  </div>

                  <div className="col-calculator-workspace">
                    <div className="col-sliders-panel">
                      <div className="col-slider-row">
                        <div className="lbl-row">
                          <label>Monthly Salary Expectation</label>
                          <span className="slide-val text-cyan">₦{colSalary.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="150000" 
                          max="2500000" 
                          step="20000" 
                          value={colSalary} 
                          onChange={(e) => setColSalary(Number(e.target.value))} 
                        />
                      </div>

                      <div className="col-slider-row">
                        <div className="lbl-row">
                          <label>Annual Housing / Rent</label>
                          <span className="slide-val text-white">₦{colRent.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="300000" 
                          max="8000000" 
                          step="100000" 
                          value={colRent} 
                          onChange={(e) => setColRent(Number(e.target.value))} 
                        />
                        <span className="month-eq">~ ₦{monthlyRent.toLocaleString()} monthly equivalent</span>
                      </div>

                      <div className="col-slider-row">
                        <div className="lbl-row">
                          <label>Monthly Food & Provisions</label>
                          <span className="slide-val text-white">₦{colFood.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="40000" 
                          max="350000" 
                          step="5000" 
                          value={colFood} 
                          onChange={(e) => setColFood(Number(e.target.value))} 
                        />
                      </div>

                      <div className="col-slider-row">
                        <div className="lbl-row">
                          <label>Monthly Fuel & Transportation</label>
                          <span className="slide-val text-white">₦{colTransport.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="15000" 
                          max="150000" 
                          step="2000" 
                          value={colTransport} 
                          onChange={(e) => setColTransport(Number(e.target.value))} 
                        />
                      </div>

                      <div className="col-slider-row">
                        <div className="lbl-row">
                          <label>Generator Power & Fibre Internet</label>
                          <span className="slide-val text-white">₦{colPowerInternet.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="10000" 
                          max="120000" 
                          step="2000" 
                          value={colPowerInternet} 
                          onChange={(e) => setColPowerInternet(Number(e.target.value))} 
                        />
                      </div>
                    </div>

                    <div className="col-results-panel glass-card">
                      <div className="expense-stat">
                        <span className="lbl">Total Monthly Outflow</span>
                        <span className="val text-pink">₦{totalMonthlyExpenses.toLocaleString()}</span>
                      </div>
                      <div className="expense-stat">
                        <span className="lbl">Net Monthly Buffer</span>
                        <span className={`val ${netSavings >= 0 ? "text-lime" : "text-pink"}`}>
                          {netSavings >= 0 ? `₦${netSavings.toLocaleString()}` : `-₦${Math.abs(netSavings).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="expense-stat border-none">
                        <span className="lbl">Net Savings Rate</span>
                        <span className={`val ${netSavings >= 0 ? "text-lime" : "text-pink"}`}>{savingsRate}%</span>
                      </div>

                      <div className="buffer-badge-card glass-card">
                        <span className="badge-lbl">INFLATION RESILIENCE INDEX</span>
                        <span className={`badge-val ${bufferColor}`}>{bufferRating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "mentors" && (
                progress.level < 6 ? (
                  <div className="tab-lockscreen glass-card animate-fade">
                    <div className="lock-content">
                      <div className="lock-icon-wrapper pulse-red">🔒</div>
                      <h4>Mentor Match Restricted: Level 6 Required</h4>
                      <p>Accessing the premium <strong>Mentor Marketplace</strong> requires the rank of <strong>Executive Partner</strong>.</p>
                      
                      <div className="progress-container">
                        <div className="progress-text">
                          <span>Your XP: {progress.expPoints}</span>
                          <span>Required: 2,100 XP</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${Math.min(100, (progress.expPoints / 2100) * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <style>{`
                      .tab-lockscreen {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 3rem !important;
                        text-align: center;
                        background: rgba(18, 20, 38, 0.4) !important;
                        border-color: rgba(255, 0, 110, 0.2) !important;
                      }
                    `}</style>
                  </div>
                ) : (
                  <div className="mentor-marketplace animate-fade">
                    <div className="diff-instructions">
                      <h5>Mentor Marketplace</h5>
                      <p>Schedule interactive consultations with certified industry veterans matching your target skill profile.</p>
                    </div>

                  <div className="mentor-cards-grid">
                    {MENTOR_LIST.map((mentor, idx) => (
                      <div key={idx} className="mentor-profile-card glass-card">
                        <div className="card-top">
                          <div className="avatar-dummy">
                            {mentor.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="mentor-meta">
                            <h6>{mentor.name}</h6>
                            <span className="mentor-role">{mentor.role}</span>
                            <span className="mentor-company">{mentor.company}</span>
                          </div>
                          <div className="compatibility-badge">
                            <span className="badge-pct">{mentor.match}%</span>
                            <span className="badge-lbl">MATCH</span>
                          </div>
                        </div>

                        <p className="mentor-description">{mentor.desc}</p>

                        <div className="mentor-tags">
                          {mentor.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="tag-pill">{tag}</span>
                          ))}
                        </div>

                        <div className="availability-row">
                          <Calendar size={12} className="text-cyan" />
                          <span>Next Slot: {mentor.availability}</span>
                        </div>

                        <button 
                          className="btn btn-secondary btn-book-consultation"
                          onClick={() => alert(`Consultation request sent to ${mentor.name}!`)}
                        >
                          Book consultation slot
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
            </>
          ) : (
            <div className="report-empty-container">
              <FileText className="empty-icon text-cyan" />
              <h4>Critique Scorecard</h4>
              <p>Your grading analysis, ATS matching index, and step-by-step revision suggestions will render here after scanning.</p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .resume-view {
          display: flex;
          flex-direction: column;
        }

        .resume-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .resume-grid {
            grid-template-columns: 1fr;
          }
        }

        .card-header-with-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.75rem;
        }

        .btn-sample-load {
          background: transparent;
          border: 1px dashed var(--accent-secondary);
          color: var(--accent-secondary);
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-family: var(--font-sans);
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-sample-load:hover {
          background: rgba(157, 78, 221, 0.08);
          border-style: solid;
        }

        .resume-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .resume-input {
          min-height: 180px !important;
        }

        .job-input {
          min-height: 140px !important;
        }

        .btn-submit-critique {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        /* Report panel styling */
        .report-panel-card {
          min-height: 520px;
          display: flex;
          flex-direction: column;
        }

        .tab-navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 0.4rem 0.8rem;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.8rem;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.02);
        }

        .tab-btn.active {
          color: var(--accent-primary);
          background: rgba(0, 217, 255, 0.08);
          border-color: rgba(0, 217, 255, 0.15);
        }

        .report-empty-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 0.75rem;
          padding: 3rem;
          color: var(--text-muted);
        }

        .empty-icon {
          width: 44px;
          height: 44px;
        }

        .report-empty-container h4 {
          color: var(--text-secondary);
        }

        .report-loading-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1.25rem;
          padding: 3rem;
        }

        .loading-spinner-mini {
          animation: spin 1s linear infinite;
        }

        .loading-spinner {
          width: 36px;
          height: 36px;
          color: var(--accent-secondary);
          animation: spin 1.5s linear infinite;
        }

        .report-results {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          animation: fadeIn 0.4s ease-out;
        }

        .report-score-banner {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-lg);
          padding: 1rem;
          align-items: center;
        }

        @media (max-width: 600px) {
          .report-score-banner {
            grid-template-columns: 1fr;
            justify-items: center;
            text-align: center;
          }
        }

        .score-status-desc {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .score-status-desc h5 {
          font-size: 0.95rem;
        }

        .score-status-desc p {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .report-section h6 {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.35rem;
        }

        .report-assessment-text {
          font-size: 0.8rem;
          line-height: 1.45;
          color: var(--text-secondary);
        }

        .report-bullets-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 576px) {
          .report-bullets-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }

        .bullet-group h6 {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .bullet-group ul {
          padding-left: 1rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .text-success { color: var(--accent-success); }
        .text-danger { color: var(--accent-danger); }
        .text-indigo { color: var(--accent-primary); }

        .recommendations-section {
          background: rgba(99, 102, 241, 0.03);
          border: 1px solid rgba(99, 102, 241, 0.1);
          border-radius: var(--border-radius-md);
          padding: 0.85rem;
        }

        .recommendation-list {
          padding-left: 1.1rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        /* Visual Diff View Styles */
        .visual-diff-tab-view {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: fadeIn 0.4s ease-out;
        }

        .diff-instructions h5 {
          font-size: 0.95rem;
          margin-bottom: 0.15rem;
        }

        .diff-instructions p {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .diff-editor-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .diff-editor-split {
            grid-template-columns: 1fr;
          }
        }

        .diff-page {
          background: rgba(10, 11, 16, 0.5);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .diff-page.original {
          border-color: rgba(255, 0, 110, 0.15);
        }

        .diff-page.optimized {
          border-color: rgba(57, 255, 20, 0.15);
        }

        .page-header {
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-align: center;
          padding: 0.35rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--glass-border);
        }

        .diff-page.original .page-header {
          color: var(--accent-pink);
          background: rgba(255, 0, 110, 0.03);
        }

        .diff-page.optimized .page-header {
          color: var(--accent-lime);
          background: rgba(57, 255, 20, 0.03);
        }

        .page-body {
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          overflow-y: auto;
          max-height: 380px;
        }

        .diff-block-text {
          padding: 0.6rem 0.75rem;
          border-radius: 6px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .diff-block-text p {
          font-size: 0.75rem;
          line-height: 1.4;
        }

        .patch-label {
          font-size: 0.55rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .deletion {
          background: rgba(255, 0, 110, 0.03);
          border-left: 3px solid var(--accent-pink);
        }

        .deletion p {
          color: var(--text-secondary);
          text-decoration: line-through;
        }

        .deletion .patch-label {
          color: var(--accent-pink);
        }

        .insertion {
          background: rgba(57, 255, 20, 0.03);
          border-left: 3px solid var(--accent-lime);
          padding-bottom: 2.2rem;
        }

        .insertion p {
          color: var(--text-primary);
        }

        .insertion .patch-label {
          color: var(--accent-lime);
        }

        .btn-copy-patch {
          position: absolute;
          right: 0.4rem;
          bottom: 0.4rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          color: var(--accent-secondary);
          font-size: 0.6rem;
          font-weight: 700;
          font-family: var(--font-sans);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-copy-patch:hover {
          background: rgba(0, 217, 255, 0.08);
          border-color: var(--accent-secondary);
        }

        /* Outreach View Styles */
        .outreach-tab-view {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .outreach-loading-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 3rem;
          text-align: center;
        }

        .outreach-splits {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .outreach-splits {
            grid-template-columns: 1fr;
          }
        }

        .outreach-card-box {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          background: rgba(18, 20, 34, 0.3) !important;
          border-color: var(--glass-border) !important;
          height: 380px;
        }

        .outreach-card-box:hover {
          border-color: var(--glass-border-hover) !important;
          transform: translateY(-2px);
        }

        .outreach-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.4rem;
        }

        .outreach-header h6 {
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .outreach-body {
          flex-grow: 1;
          padding: 0.75rem;
          border-radius: var(--border-radius-md);
          overflow-y: auto;
          font-size: 0.75rem;
          line-height: 1.45;
          white-space: pre-wrap;
          border: 1px solid rgba(255,255,255,0.02);
        }

        .outreach-body.chat-style {
          background: rgba(0, 217, 255, 0.02);
          color: var(--text-secondary);
          border-color: rgba(0, 217, 255, 0.08);
        }

        .outreach-body.letter-style {
          background: rgba(255, 255, 255, 0.01);
          color: var(--text-secondary);
          border-color: var(--glass-border);
          font-family: 'Courier New', Courier, monospace;
        }

        .btn-copy-outreach {
          width: 100%;
          font-size: 0.75rem;
          padding: 0.4rem 0.80rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }

        /* Cost of Living panel styling */
        .col-calculator-workspace {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 1.5rem;
          align-items: start;
          margin-top: 1rem;
        }

        @media (max-width: 800px) {
          .col-calculator-workspace {
            grid-template-columns: 1fr;
          }
        }

        .col-sliders-panel {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .col-slider-row {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .col-slider-row .lbl-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .col-slider-row .month-eq {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .col-slider-row input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          outline: none;
        }

        .col-slider-row input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--accent-primary);
          box-shadow: 0 0 8px var(--accent-primary);
          cursor: pointer;
        }

        .col-results-panel {
          padding: 1.25rem !important;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: rgba(0,0,0,0.15) !important;
        }

        .expense-stat {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          padding-bottom: 0.6rem;
          border-bottom: 1px dashed var(--glass-border);
        }

        .expense-stat .lbl { color: var(--text-muted); }
        .expense-stat .val { font-weight: 700; font-family: 'Spline Sans Mono', monospace; }

        .border-none { border-bottom: none !important; }

        .buffer-badge-card {
          margin-top: 0.5rem;
          padding: 0.85rem !important;
          background: rgba(255,255,255,0.01) !important;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          text-align: center;
        }

        .badge-lbl {
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .badge-val {
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .text-lime { color: var(--accent-lime); }
        .text-pink { color: var(--accent-pink); }
        .text-cyan { color: var(--accent-primary); }

        /* Mentor Marketplace view styles */
        .mentor-marketplace {
          animation: fadeIn 0.4s ease-out;
        }

        .mentor-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .mentor-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .mentor-profile-card {
          padding: 1.25rem !important;
          background: rgba(18, 20, 38, 0.4) !important;
          border-color: var(--glass-border) !important;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: all 0.2s ease;
        }

        .mentor-profile-card:hover {
          border-color: var(--glass-border-hover) !important;
          transform: translateY(-2px);
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar-dummy {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(0, 217, 255, 0.1);
          border: 1px solid var(--accent-primary);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.25);
          flex-shrink: 0;
        }

        .mentor-meta {
          flex-grow: 1;
        }

        .mentor-meta h6 {
          font-size: 0.85rem;
          margin-bottom: 0.1rem;
        }

        .mentor-role {
          font-size: 0.7rem;
          color: var(--text-secondary);
          display: block;
        }

        .mentor-company {
          font-size: 0.65rem;
          color: var(--text-muted);
          display: block;
        }

        .compatibility-badge {
          text-align: right;
        }

        .badge-pct {
          font-size: 1.1rem;
          font-weight: 800;
          font-family: 'Spline Sans Mono', monospace;
          color: var(--accent-lime);
          display: block;
        }

        .compatibility-badge .badge-lbl {
          font-size: 0.55rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .mentor-description {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .mentor-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .tag-pill {
          font-size: 0.65rem;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
        }

        .availability-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .btn-book-consultation {
          width: 100%;
          font-size: 0.75rem;
          padding: 0.45rem 1rem;
        }

        .report-error-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 0.75rem;
          padding: 3rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
}

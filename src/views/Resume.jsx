import React, { useState, useContext, useEffect } from "react";
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
  Copy
} from "lucide-react";

// Premium Awwwards-style radial animated score dial
const AnimatedScoreDial = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    setDisplayScore(0);
    let start = 0;
    const end = score;
    if (start === end) return;

    const duration = 1000; // 1 second animation duration
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
        {/* Background track */}
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        {/* Animated outer bar */}
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
      <style>{`
        .radial-score-container {
          position: relative;
          width: 84px;
          height: 84px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .radial-svg-dial {
          transform: rotate(0deg);
        }

        .radial-score-inner {
          position: absolute;
          display: flex;
          align-items: baseline;
          justify-content: center;
          font-family: var(--font-sans);
        }

        .radial-score-inner .score-val {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .radial-score-inner .score-max {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-left: 0.05rem;
        }
      `}</style>
    </div>
  );
};

export default function Resume() {
  const { apiKey } = useContext(AppContext);
  
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Tab control: 'scorecard' | 'diff' | 'outreach'
  const [activeTab, setActiveTab] = useState("scorecard");

  // Outreach loading and data states
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachDrafts, setOutreachDrafts] = useState(null);
  const [outreachError, setOutreachError] = useState("");

  // Sample data templates
  const loadSampleData = () => {
    setResumeText(`Jane Doe\nSoftware Engineering Student\n\nTECHNICAL SKILLS:\nJavaScript, HTML, CSS, Git.\n\nEDUCATION:\nHigh School Diploma - Graduating 2026\nGPA: 3.8\n\nPROJECTS:\n- Personal Portfolio Website: Created a basic website using HTML and CSS to show off my high school achievements.\n- Calculator App: Coded a simple calculator in Javascript.\n\nEXPERIENCE:\n- Volunteer Web Designer: Helped a local community group update their homepage header layout.`);
    setJobDesc(`Junior Front-End Developer\n\nRESPONSIBILITIES:\n- Develop user-facing features using React.js and modern JavaScript standards.\n- Collaborate with design and product teams to translate Figma mockups into code.\n- Write clean, scannable code and document UI structures.\n\nREQUIREMENTS:\n- Proficient in JavaScript, HTML, and CSS.\n- Familiarity with React or other frontend frameworks.\n- Experience with Git version control.\n- Passion for modern UX designs and responsiveness.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDesc.trim()) return;

    setLoading(true);
    setErrorMessage("");
    setReport(null);
    setOutreachDrafts(null); // Reset drafts

    try {
      const evaluation = await critiqueResume(apiKey, resumeText.trim(), jobDesc.trim());
      setReport(evaluation);
      setActiveTab("scorecard");
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to analyze the resume.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Outreach assets
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
    setActiveTab(tabName);
    if (tabName === "outreach") {
      handleFetchOutreach();
    }
  };

  // Pre-configured visual diff patches
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

  return (
    <div className="resume-view">
      <div className="resume-grid grid-2">
        
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
              className="btn btn-primary btn-submit-critique" 
              disabled={loading || !resumeText.trim() || !jobDesc.trim()}
            >
              {loading ? (
                <>
                  <RefreshCw className="loading-spinner-mini" />
                  <span>Analyzing Resume...</span>
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
                <span>Scorecard Analysis</span>
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "diff" ? "active" : ""}`}
                onClick={() => handleTabChange("diff")}
              >
                <GitCompare size={14} />
                <span>Visual Editor Diff</span>
              </button>
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "outreach" ? "active" : ""}`}
                onClick={() => handleTabChange("outreach")}
              >
                <Mail size={14} />
                <span>Outreach Copywriter</span>
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
            activeTab === "scorecard" ? (
              <div className="report-results">
                <div className="report-score-banner">
                  {/* Animated Radial Score Dial */}
                  <AnimatedScoreDial score={report.score} />
                  
                  <div className="score-status-desc">
                    <h5>ATS Match Score</h5>
                    <p>{report.score >= 80 ? "High Compatibility! Ready to submit." : report.score >= 60 ? "Moderate Compatibility. Minor revisions suggested." : "Low Compatibility. Revisions highly recommended."}</p>
                  </div>
                </div>

                <div className="report-section">
                  <h6>Overall Assessment</h6>
                  <p className="report-assessment-text">{report.overallAssessment}</p>
                </div>

                <div className="report-bullets-grid">
                  <div className="bullet-group strengths">
                    <h6><CheckCircle2 size={14} className="bullet-header-icon text-success" /> Strengths</h6>
                    <ul>
                      {report.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bullet-group weaknesses">
                    <h6><XCircle size={14} className="bullet-header-icon text-danger" /> Gaps & Weaknesses</h6>
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
            ) : activeTab === "diff" ? (
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
            ) : (
              /* Outreach Assets tab view */
              <div className="outreach-tab-view animate-fade">
                {outreachLoading ? (
                  <div className="outreach-loading-box">
                    <RefreshCw className="loading-spinner" />
                    <h5>Generating recruiter messaging templates and cover letter matches...</h5>
                  </div>
                ) : outreachError ? (
                  <div className="outreach-error-box">
                    <AlertCircle className="error-icon" />
                    <p>{outreachError}</p>
                  </div>
                ) : outreachDrafts ? (
                  <div className="outreach-splits grid-2">
                    
                    {/* LinkedIn Message card */}
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
                          navigator.clipboard.writeText(outreachDrafts.linkedinMessage);
                          alert("Copied LinkedIn message!");
                        }}
                      >
                        <Copy size={12} />
                        <span>Copy Pitch</span>
                      </button>
                    </div>

                    {/* Cover Letter card */}
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
            )
          ) : (
            <div className="report-empty-container">
              <FileText className="empty-icon" />
              <h4>Analysis Scorecard</h4>
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
          grid-template-columns: 0.8fr 1.2fr;
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
          margin-bottom: 1.5rem;
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
          background: rgba(6, 182, 212, 0.08);
          border-style: solid;
        }

        .resume-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .resume-input {
          min-height: 160px !important;
        }

        .job-input {
          min-height: 120px !important;
        }

        .btn-submit-critique {
          width: 100%;
        }

        /* Report panel styling */
        .report-panel-card {
          min-height: 520px;
          display: flex;
          flex-direction: column;
        }

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.75rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.85rem;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.02);
        }

        .tab-btn.active {
          color: var(--accent-secondary);
          background: rgba(6, 182, 212, 0.08);
          border-color: rgba(6, 182, 212, 0.15);
        }

        .report-empty-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1rem;
          padding: 3rem;
          color: var(--text-muted);
        }

        .empty-icon {
          width: 48px;
          height: 48px;
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
          margin-right: 0.25rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          color: var(--accent-secondary);
          animation: spin 1.5s linear infinite;
        }

        .report-results {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: fadeIn 0.4s ease-out;
        }

        .report-score-banner {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-lg);
          padding: 1rem 1.25rem;
        }

        .score-status-desc h5 {
          font-size: 1rem;
        }

        .score-status-desc p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .report-section h6 {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
        }

        .report-assessment-text {
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .report-bullets-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 576px) {
          .report-bullets-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        .bullet-group h6 {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .bullet-group ul {
          padding-left: 1.1rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .text-success { color: var(--accent-success); }
        .text-danger { color: var(--accent-danger); }
        .text-indigo { color: var(--accent-primary); }

        .recommendations-section {
          background: rgba(99, 102, 241, 0.03);
          border: 1px solid rgba(99, 102, 241, 0.1);
          border-radius: var(--border-radius-md);
          padding: 1rem;
        }

        .recommendation-list {
          padding-left: 1.2rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .recommendation-list li::marker {
          color: var(--accent-primary);
          font-weight: 700;
        }

        /* Visual Diff View Styles */
        .visual-diff-tab-view {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          animation: fadeIn 0.4s ease-out;
        }

        .diff-instructions h5 {
          font-size: 1rem;
          margin-bottom: 0.15rem;
        }

        .diff-instructions p {
          font-size: 0.8rem;
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
          border-color: rgba(239, 68, 68, 0.15);
        }

        .diff-page.optimized {
          border-color: rgba(16, 185, 129, 0.15);
        }

        .page-header {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-align: center;
          padding: 0.4rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--glass-border);
        }

        .diff-page.original .page-header {
          color: var(--accent-danger);
          background: rgba(239, 68, 68, 0.03);
        }

        .diff-page.optimized .page-header {
          color: var(--accent-success);
          background: rgba(16, 185, 129, 0.03);
        }

        .page-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          max-height: 380px;
        }

        .diff-block-text {
          padding: 0.75rem;
          border-radius: 6px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .diff-block-text p {
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .patch-label {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .deletion {
          background: rgba(239, 68, 68, 0.04);
          border-left: 3px solid var(--accent-danger);
        }

        .deletion p {
          color: var(--text-secondary);
          text-decoration: line-through;
        }

        .deletion .patch-label {
          color: var(--accent-danger);
        }

        .insertion {
          background: rgba(16, 185, 129, 0.04);
          border-left: 3px solid var(--accent-success);
          padding-bottom: 2.25rem;
        }

        .insertion p {
          color: var(--text-primary);
        }

        .insertion .patch-label {
          color: var(--accent-success);
        }

        .btn-copy-patch {
          position: absolute;
          right: 0.5rem;
          bottom: 0.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          color: var(--accent-secondary);
          font-size: 0.65rem;
          font-weight: 700;
          font-family: var(--font-sans);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-copy-patch:hover {
          background: rgba(6, 182, 212, 0.08);
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
          gap: 1rem;
          padding: 4rem;
          text-align: center;
        }

        .outreach-card-box {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
          gap: 0.5rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
        }

        .outreach-header h6 {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .outreach-body {
          flex-grow: 1;
          padding: 0.85rem;
          border-radius: var(--border-radius-md);
          overflow-y: auto;
          font-size: 0.825rem;
          line-height: 1.5;
          white-space: pre-wrap;
          border: 1px solid rgba(255,255,255,0.02);
        }

        .outreach-body.chat-style {
          background: rgba(6, 182, 212, 0.03);
          color: var(--text-secondary);
          border-color: rgba(6, 182, 212, 0.08);
        }

        .outreach-body.letter-style {
          background: rgba(255, 255, 255, 0.01);
          color: var(--text-secondary);
          border-color: var(--glass-border);
          font-family: 'Courier New', Courier, monospace;
        }

        .btn-copy-outreach {
          width: 100%;
          font-size: 0.8rem;
          padding: 0.5rem 1rem;
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

        .animate-fade {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

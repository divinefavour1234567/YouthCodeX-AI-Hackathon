import React, { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { INTERVIEW_ROLES } from "../data/mockData";
import { evaluateInterviewResponse, negotiateSalaryResponse } from "../services/gemini";
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  Award, 
  AlertCircle,
  Brain,
  Volume2,
  VolumeX,
  TrendingUp,
  UserCheck,
  DollarSign,
  Activity,
  Sparkles,
  ChevronRight,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import SpeechWaveCanvas from "../components/SpeechWaveCanvas";
import Avatar from "../components/Avatar";
import { playHoverSound, playErrorSound, playSuccessSound, playAlarmPulse } from "../services/sound";

const INTERVIEWER_PROFILES = {
  serena: {
    id: "serena",
    name: "Serena",
    title: "Talent Specialist",
    desc: "Empathetic and structured. Focuses on team fit and behavioral scenarios.",
    accent1: "#39ff14", // Lime
    accent2: "#00d9ff", // Cyan
    pitch: 1.25,
    rate: 0.95
  },
  marcus: {
    id: "marcus",
    name: "Marcus",
    title: "Engineering Lead",
    desc: "Direct and analytical. Drills deep into syntax and system architecture.",
    accent1: "#00d9ff", // Cyan
    accent2: "#9d4edd", // Purple
    pitch: 0.95,
    rate: 1.15
  },
  vance: {
    id: "vance",
    name: "Vance",
    title: "VP of Product",
    desc: "Strict and metrics-driven. Challenges business decisions and scalability.",
    accent1: "#ff006e", // Pink
    accent2: "#9d4edd", // Purple
    pitch: 0.75,
    rate: 0.85
  }
};

const NEGOTIATION_PRESETS = {
  "software-engineer": {
    title: "Software Engineer",
    entry: { min: 60000, target: 80000, minNgn: 5000000, targetNgn: 7500000 },
    mid: { min: 110000, target: 140000, minNgn: 12000000, targetNgn: 16000000 },
    executive: { min: 180000, target: 240000, minNgn: 24000000, targetNgn: 35000000 }
  },
  "ai-engineer": {
    title: "AI/ML Engineer",
    entry: { min: 75000, target: 95000, minNgn: 6000000, targetNgn: 9000000 },
    mid: { min: 130000, target: 170000, minNgn: 15000000, targetNgn: 20000000 },
    executive: { min: 210000, target: 280000, minNgn: 30000000, targetNgn: 45000000 }
  },
  "ux-designer": {
    title: "UX/UI Designer",
    entry: { min: 50000, target: 70000, minNgn: 4000000, targetNgn: 6000000 },
    mid: { min: 95000, target: 125000, minNgn: 10000000, targetNgn: 14000000 },
    executive: { min: 150000, target: 210000, minNgn: 20000000, targetNgn: 30000000 }
  }
};

const BOSS_PERSONALITIES = {
  intern: { 
    name: "Alex (HR Intern)", 
    desc: "Receptive and flexible. Great for beginners testing standard local salary scales.", 
    patienceImpact: 0.8,
    requiredLevel: 1,
    minPatience: 100,
    rewardXp: 100,
    color: "#00d9ff",
    title: "HR Coordinator"
  },
  finance: { 
    name: "Scrooge (Frugal Manager)", 
    desc: "Strictly bound by spreadsheet caps. Easily irritated by larger counter-proposals.", 
    patienceImpact: 1.6,
    requiredLevel: 2,
    minPatience: 90,
    rewardXp: 200,
    color: "#9d4edd",
    title: "Finance Lead"
  },
  exec: { 
    name: "Victoria (VP of Product)", 
    desc: "Expects specific skill keywords and concrete deliverables. Demands proof of value.", 
    patienceImpact: 1.3,
    requiredLevel: 3,
    minPatience: 80,
    rewardXp: 350,
    color: "#39ff14",
    title: "VP of Product"
  },
  cfo: { 
    name: "Karen (The Iron CFO - Boss Fight)", 
    desc: "Ultra-strict executive budget boundaries. High stress level triggers, low patience threshold.", 
    patienceImpact: 2.2,
    requiredLevel: 4,
    minPatience: 70,
    rewardXp: 500,
    color: "#ff006e",
    title: "Chief Financial Officer"
  }
};

export default function Interview() {
  const { apiKey, saveInterviewScore, progress, addExperiencePoints } = useContext(AppContext);
  
  // Navigation Tabs: 'interview' | 'negotiation'
  const [activeTab, setActiveTab] = useState("interview");

  // ==========================================
  // STATE 1: MOCK INTERVIEW
  // ==========================================
  const [stage, setStage] = useState("setup"); // 'setup' | 'interview' | 'review'
  const [selectedRole, setSelectedRole] = useState("software-engineer");
  const [selectedInterviewer, setSelectedInterviewer] = useState("marcus");
  
  // Session States
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState("");
  
  // Audio & Voice States
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  
  // Stress / Biometrics Simulation
  const [stressLevel, setStressLevel] = useState(30);
  const [heartRate, setHeartRate] = useState(72);
  const stressTimerRef = useRef(null);

  // Evaluation States
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // ==========================================
  // STATE 2: SALARY NEGOTIATION
  // ==========================================
  const [negStage, setNegStage] = useState("setup"); // 'setup' | 'active' | 'complete'
  const [negRole, setNegRole] = useState("software-engineer");
  const [negDifficulty, setNegDifficulty] = useState("mid");
  const [negBoss, setNegBoss] = useState("intern");
  const [negCurrency, setNegCurrency] = useState("USD");
  
  const [negPatience, setNegPatience] = useState(100);
  const [negRound, setNegRound] = useState(1);
  const [negInitialOffer, setNegInitialOffer] = useState(0);
  const [negCurrentOffer, setNegCurrentOffer] = useState(0);
  const [negCounterOffer, setNegCounterOffer] = useState(0);
  const [negUserMsg, setNegUserMsg] = useState("");
  const [negLog, setNegLog] = useState([]);
  
  const [negVerdict, setNegVerdict] = useState("continue"); // 'continue' | 'accepted' | 'rejected_walkaway'
  const [negEvaluating, setNegEvaluating] = useState(false);
  const [negError, setNegError] = useState("");

  const activeRoleData = INTERVIEW_ROLES[selectedRole];
  const activeInterviewer = INTERVIEWER_PROFILES[selectedInterviewer];

  // Helper: Format Currency
  const formatCurrency = (val, currency) => {
    if (currency === "NGN") {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(val);
    }
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  // Stress & HR dynamic simulation
  useEffect(() => {
    if (stage === "interview") {
      stressTimerRef.current = setInterval(() => {
        // Typing or thinking increases stress slightly
        setStressLevel((prev) => {
          const next = prev + Math.floor(Math.random() * 4) - 1;
          if (next > 70) {
            playAlarmPulse();
          }
          return Math.max(20, Math.min(95, next));
        });
        setHeartRate((prev) => {
          const next = prev + Math.floor(Math.random() * 6) - 2;
          return Math.max(68, Math.min(130, next));
        });
      }, 3000);
    } else {
      if (stressTimerRef.current) clearInterval(stressTimerRef.current);
      setStressLevel(30);
      setHeartRate(72);
    }
    return () => {
      if (stressTimerRef.current) clearInterval(stressTimerRef.current);
    };
  }, [stage]);

  // Speech helper
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    
    if (!voiceEnabled) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en-US") || v.lang.startsWith("en-GB")) || voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Customize based on interviewer personality
    utterance.rate = activeInterviewer.rate;
    utterance.pitch = activeInterviewer.pitch;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Speak when question changes
  useEffect(() => {
    if (stage === "interview" && questions[currentQIndex]) {
      speakText(questions[currentQIndex].question);
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQIndex, questions, stage, voiceEnabled, selectedInterviewer]);

  // Start the interview
  const startInterview = () => {
    const roleQuestions = INTERVIEW_ROLES[selectedRole]?.questions || [];
    setQuestions(roleQuestions);
    setCurrentQIndex(0);
    setAnswers({});
    setEvaluationResults([]);
    setFinalScore(null);
    setErrorMessage("");
    setStage("interview");
  };

  // Submit response and proceed
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setAnswers((prev) => ({
      ...prev,
      [questions[currentQIndex].id]: currentInput.trim()
    }));

    setCurrentInput("");
    
    // Lower stress slightly after submission
    setStressLevel((prev) => Math.max(30, prev - 15));
    
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      evaluateAllAnswers();
    }
  };

  // Evaluate answers using Gemini or Fallback Mock Evaluator
  const evaluateAllAnswers = async () => {
    setEvaluating(true);
    setStage("review");
    setErrorMessage("");
    
    try {
      const results = [];
      let scoreSum = 0;
      const roleQuestions = INTERVIEW_ROLES[selectedRole]?.questions || [];
      
      for (const q of roleQuestions) {
        const candidateAnswer = answers[q.id] || "No answer provided.";
        const evaluation = await evaluateInterviewResponse(
          apiKey, 
          activeRoleData.title, 
          q.question, 
          candidateAnswer
        );
        results.push({
          question: q.question,
          answer: candidateAnswer,
          ideal: q.idealAnswer,
          score: evaluation.score,
          feedback: evaluation.feedback,
          tips: evaluation.tips
        });
        scoreSum += evaluation.score;
      }
      
      const averageScore = Math.round(scoreSum / roleQuestions.length);
      setFinalScore(averageScore);
      setEvaluationResults(results);
      saveInterviewScore(selectedRole, averageScore);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "An unexpected error occurred during grading.");
    } finally {
      setEvaluating(false);
    }
  };

  // ==========================================
  // NEGOTIATION HANDLERS
  // ==========================================
  const startNegotiation = () => {
    const preset = NEGOTIATION_PRESETS[negRole][negDifficulty];
    const initialOfferVal = negCurrency === "NGN" ? preset.minNgn : preset.min;
    
    setNegInitialOffer(initialOfferVal);
    setNegCurrentOffer(initialOfferVal);
    setNegCounterOffer(Math.round(initialOfferVal * 1.15));
    setNegPatience(BOSS_PERSONALITIES[negBoss].minPatience);
    setNegRound(1);
    setNegVerdict("continue");
    setNegError("");
    setNegUserMsg("");
    
    const openingMsg = `Hello! We are absolutely thrilled to offer you the position as our new ${NEGOTIATION_PRESETS[negRole].title}. After reviewing your qualifications, we're pleased to extend a base starting salary of ${formatCurrency(initialOfferVal, negCurrency)}. We'd love to get you on board as soon as possible. What do you think?`;
    
    setNegLog([
      { sender: "boss", text: openingMsg }
    ]);
    setNegStage("active");
  };

  const handleNegotiationSubmit = async (e) => {
    e.preventDefault();
    if (negEvaluating) return;
    
    setNegEvaluating(true);
    setNegError("");
    
    // Add user's counter message to log
    const userLogEntry = {
      sender: "user",
      text: `I'd like to propose a base salary of ${formatCurrency(negCounterOffer, negCurrency)}. ${negUserMsg}`
    };
    
    setNegLog((prev) => [...prev, userLogEntry]);
    
    try {
      const response = await negotiateSalaryResponse(
        apiKey,
        NEGOTIATION_PRESETS[negRole].title,
        negDifficulty,
        negCurrentOffer,
        negCounterOffer,
        negUserMsg,
        negRound,
        negPatience
      );
      
      const pFactor = BOSS_PERSONALITIES[negBoss].patienceImpact;
      const finalPatienceDelta = Math.round(response.patienceDelta * pFactor);
      
      const newPatience = Math.max(0, negPatience + finalPatienceDelta);
      setNegPatience(newPatience);
      setNegCurrentOffer(response.counterOffer);
      setNegRound((prev) => prev + 1);
      
      // Determine final state changes
      let finalVerdict = response.verdict;
      if (newPatience <= 0) {
        finalVerdict = "rejected_walkaway";
      }
      
      setNegVerdict(finalVerdict);
      
      setNegLog((prev) => [
        ...prev,
        { sender: "boss", text: response.bossResponse }
      ]);

      // Read Alex the boss counter message out loud!
      speakText(response.bossResponse);
      
      if (finalVerdict === "accepted") {
        playSuccessSound();
        addExperiencePoints(BOSS_PERSONALITIES[negBoss].rewardXp || 250);
        setNegStage("complete");
      } else if (finalVerdict === "rejected_walkaway") {
        playErrorSound();
        setNegStage("complete");
      } else {
        if (newPatience < 35) {
          playAlarmPulse();
        } else {
          playHoverSound();
        }
      }
      
      // Reset counter offer suggestions and msg
      setNegCounterOffer(Math.round(response.counterOffer * 1.1));
      setNegUserMsg("");
    } catch (err) {
      console.error(err);
      setNegError("Negotiation server error. Please try again.");
    } finally {
      setNegEvaluating(false);
    }
  };

  const acceptCurrentOffer = () => {
    setNegVerdict("accepted");
    setNegLog((prev) => [
      ...prev,
      { sender: "user", text: `I accept your offer of ${formatCurrency(negCurrentOffer, negCurrency)}! Thank you so much.` },
      { sender: "boss", text: `Fantastic! We are absolutely thrilled. I'll send over the formal contract right away. Welcome to the team!` }
    ]);
    setNegStage("complete");
  };

  const walkAwayNegotiation = () => {
    setNegVerdict("rejected_walkaway");
    setNegLog((prev) => [
      ...prev,
      { sender: "user", text: `Unfortunately, I'll have to decline this offer as it does not align with my current expectations. Thank you for your time.` },
      { sender: "boss", text: `Understood. We're sorry we couldn't make it work this time. We wish you the best in your career search.` }
    ]);
    setNegStage("complete");
  };

  return (
    <div className="interview-page-container">
      {/* Dynamic Header Tab Bar */}
      <div className="segmented-tabs glass-card">
        <button 
          className={`tab-btn ${activeTab === "interview" ? "active" : ""}`}
          onClick={() => {
            playHoverSound();
            setActiveTab("interview");
          }}
        >
          <Brain size={16} />
          <span>Holographic Interview Room</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === "negotiation" ? "active" : ""}`}
          onClick={() => {
            if (progress.level < 3) {
              playErrorSound();
            } else {
              playHoverSound();
            }
            setActiveTab("negotiation");
          }}
        >
          <DollarSign size={16} />
          <span>Salary Negotiation Simulator</span>
        </button>
      </div>

      {/* TAB CONTENT 1: INTERVIEW */}
      {activeTab === "interview" && (
        <div className="interview-view">
          {stage === "setup" && (
            <div className="setup-card glass-card">
              <div className="setup-header">
                <Brain className="setup-logo pulse-glow" />
                <h3>Configure Your Interview Sandbox</h3>
                <p>Select your career path and interviewer profile to begin your customized technical evaluation.</p>
              </div>

              <div className="setup-section-title">Select Career Path</div>
              <div className="role-selector-grid">
                {Object.keys(INTERVIEW_ROLES).map((roleKey) => {
                  const role = INTERVIEW_ROLES[roleKey];
                  const isSelected = selectedRole === roleKey;
                  return (
                    <button
                      key={roleKey}
                      className={`role-select-card glass-card ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedRole(roleKey)}
                    >
                      <span className="role-icon">
                        {roleKey === "software-engineer" ? "💻" : roleKey === "ai-engineer" ? "🧠" : "🎨"}
                      </span>
                      <h4>{role.title}</h4>
                      <p>{role.questions.length} Scenario Questions</p>
                    </button>
                  );
                })}
              </div>

              <div className="setup-section-title mt-4">Choose AI Interviewer Persona</div>
              <div className="interviewer-selector-grid">
                {Object.keys(INTERVIEWER_PROFILES).map((key) => {
                  const profile = INTERVIEWER_PROFILES[key];
                  const isSelected = selectedInterviewer === key;
                  return (
                    <button
                      key={key}
                      className={`interviewer-card glass-card ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedInterviewer(key)}
                    >
                      <div className="avatar-preview-mini" style={{ '--accent-primary': profile.accent1, '--accent-secondary': profile.accent2 }}>
                        <div className="glow-dot"></div>
                      </div>
                      <div className="interviewer-info">
                        <h4>{profile.name}</h4>
                        <span className="interviewer-title">{profile.title}</span>
                        <p>{profile.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button className="btn btn-cyan btn-start-interview" onClick={startInterview}>
                Initialize Holographic Room <ChevronRight size={16} />
              </button>
            </div>
          )}

          {stage === "interview" && questions.length > 0 && (
            <div className="holographic-room-layout">
              {/* Left Panel: Sci-Fi Biometrics Overlay */}
              <div className="room-side-panel glass-card">
                <div className="panel-section-title">
                  <Activity size={14} className="text-pink" />
                  <span>BIOMETRIC FEED</span>
                </div>
                
                <div className="biometric-row">
                  <div className="bio-label">HEART RATE</div>
                  <div className="bio-val pulse-text">{heartRate} BPM</div>
                  <div className="bio-sparkline">
                    <div className="sparkline-bar" style={{ height: '40%', animationDelay: '0.1s' }}></div>
                    <div className="sparkline-bar" style={{ height: '60%', animationDelay: '0.2s' }}></div>
                    <div className="sparkline-bar" style={{ height: '50%', animationDelay: '0.3s' }}></div>
                    <div className="sparkline-bar" style={{ height: '70%', animationDelay: '0.4s' }}></div>
                    <div className="sparkline-bar" style={{ height: '80%', animationDelay: '0.5s' }}></div>
                  </div>
                </div>

                <div className="biometric-row">
                  <div className="bio-label">PRESSURE COEFFICIENT</div>
                  <div className="bio-val text-cyan">{stressLevel}%</div>
                  <div className="bio-bar-bg">
                    <div 
                      className={`bio-bar-fill ${stressLevel > 70 ? "high" : stressLevel > 45 ? "medium" : "low"}`} 
                      style={{ width: `${stressLevel}%` }}
                    ></div>
                  </div>
                  <div className="bio-hint text-muted">
                    {stressLevel > 70 ? "Warning: Critical Stress detected. Speak calmly." : "Stabilized. Flow optimal."}
                  </div>
                </div>

                <div className="panel-section-title mt-4">
                  <UserCheck size={14} />
                  <span>SESSION METRICS</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">Role:</span>
                  <span className="metric-val text-cyan">{activeRoleData.title}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">Interviewer:</span>
                  <span className="metric-val text-pink">{activeInterviewer.name} ({activeInterviewer.title})</span>
                </div>
              </div>

              {/* Central Area: 3D Holographic Room Stage */}
              <div className="hologram-main-card glass-card">
                <div className="hologram-stage-wrapper">
                  <div className="perspective-grid-floor"></div>
                  
                  <div className="floating-avatar-platform" style={{ 
                    '--accent-primary': activeInterviewer.accent1, 
                    '--accent-secondary': activeInterviewer.accent2 
                  }}>
                    <Avatar isSpeaking={isSpeaking} />
                    <div className="hologram-beam"></div>
                    <div className="glow-base"></div>
                  </div>
                </div>

                <div className="chat-header">
                  <div className="chat-title-group">
                    <span className="live-tag">HOLOGRAPHIC SCAN</span>
                    <h4>{activeInterviewer.name}</h4>
                  </div>
                  
                  <div className="voice-controls">
                    <button 
                      type="button"
                      className={`btn-voice-toggle ${voiceEnabled ? "voice-active" : ""}`}
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                      title={voiceEnabled ? "Mute Voice Read-Aloud" : "Unmute Voice Read-Aloud"}
                    >
                      {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    
                    <span className="question-counter">
                      Question {currentQIndex + 1} of {questions.length}
                    </span>
                  </div>
                </div>

                <div className="interviewer-bubble glass-card">
                  <div className="bubble-sender-row">
                    <span className="bubble-sender">INCOMING TRANSMISSION</span>
                    <SpeechWaveCanvas isSpeaking={isSpeaking} />
                  </div>
                  <p className="bubble-text">{questions[currentQIndex].question}</p>
                </div>

                <form onSubmit={handleAnswerSubmit} className="chat-input-bar">
                  <textarea
                    className="form-textarea chat-input-field"
                    placeholder="Type your structured STAR response here..."
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    required
                  ></textarea>
                  <button type="submit" className="btn btn-cyan btn-send" disabled={!currentInput.trim()}>
                    <Send size={18} />
                    <span>{currentQIndex === questions.length - 1 ? "Complete" : "Next"}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {stage === "review" && (
            <div className="review-dashboard">
              {evaluating ? (
                <div className="evaluating-card glass-card">
                  <RefreshCw className="loading-spinner" />
                  <h3>Analyzing Response Metrics...</h3>
                  <p>Processing text semantics, structures, and phrasing against ideal schemas via Gemini AI.</p>
                </div>
              ) : errorMessage ? (
                <div className="error-card glass-card">
                  <AlertCircle size={40} className="error-icon" />
                  <h3>Evaluation Encountered a Problem</h3>
                  <p>{errorMessage}</p>
                  <button className="btn btn-cyan" onClick={startInterview}>
                    Retry Practice Session
                  </button>
                </div>
              ) : (
                <div className="review-results-container">
                  <div className="results-header-summary glass-card">
                    {/* SVG 3D Holographic Bar Chart */}
                    <div className="hologram-chart-box">
                      <svg width="150" height="150" viewBox="0 0 150 150" className="poly-chart-svg">
                        <defs>
                          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--accent-primary)" />
                            <stop offset="100%" stopColor="var(--accent-secondary)" />
                          </linearGradient>
                        </defs>
                        {/* Draw pseudo-3D hexagonal radar */}
                        <polygon points="75,20 125,50 125,100 75,130 25,100 25,50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                        <polygon points="75,40 110,60 110,95 75,115 40,95 40,60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        
                        {/* Dynamic Score Polygon based on finalScore */}
                        {(() => {
                          const scale = (finalScore || 70) / 100;
                          const p1 = `${75}, ${75 - 55 * scale}`;
                          const p2 = `${75 + 50 * scale}, ${75 - 25 * scale}`;
                          const p3 = `${75 + 50 * scale}, ${75 + 25 * scale}`;
                          const p4 = `${75}, ${75 + 55 * scale}`;
                          const p5 = `${75 - 50 * scale}, ${75 + 25 * scale}`;
                          const p6 = `${75 - 50 * scale}, ${75 - 25 * scale}`;
                          return <polygon points={`${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`} fill="rgba(0, 217, 255, 0.15)" stroke="var(--accent-primary)" strokeWidth="2" />;
                        })()}
                        <circle cx="75" cy="75" r="3" fill="var(--accent-secondary)" />
                      </svg>
                      <div className="score-badge-val">{finalScore}%</div>
                    </div>

                    <div className="header-review-text">
                      <span className="badge badge-success">Practice Evaluated</span>
                      <h3>Holographic Score & Critique</h3>
                      <p>Congratulations! You gained <strong>+200 XP</strong>. Review the specific AI tips and feedback metrics below to improve your score.</p>
                      <button className="btn btn-secondary btn-restart" onClick={() => setStage("setup")}>
                        Configure New Interview
                      </button>
                    </div>
                  </div>

                  <div className="critique-list">
                    {evaluationResults.map((result, idx) => (
                      <div key={idx} className="critique-card glass-card">
                        <div className="critique-card-header">
                          <h5>Question {idx + 1}: {result.question}</h5>
                          <span className="score-pill">Score: {result.score}/100</span>
                        </div>

                        <div className="critique-section-grid">
                          <div className="critique-col">
                            <h6>Your Response</h6>
                            <p className="txt-box candidate-ans">"{result.answer}"</p>
                            
                            <h6>Ideal Answer Model</h6>
                            <p className="txt-box ideal-ans">{result.ideal}</p>
                          </div>

                          <div className="critique-col">
                            <h6>AI Feedback</h6>
                            <p className="txt-feedback">{result.feedback}</p>

                            <h6>Key Improvement Tips</h6>
                            <ul className="tips-list">
                              {result.tips.map((tip, tIdx) => (
                                <li key={tIdx}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: SALARY NEGOTIATION */}
      {activeTab === "negotiation" && (
        progress.level < 3 ? (
          <div className="setup-card glass-card">
            <div className="lock-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", width: "100%" }}>
              <div className="lock-icon-wrapper pulse-red" style={{
                fontSize: "3rem", width: "80px", height: "80px", borderRadius: "50%",
                background: "rgba(255, 0, 110, 0.1)", border: "2px solid var(--accent-pink)",
                display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px var(--accent-pink)"
              }}>🔒</div>
              <h3>Salary Negotiator Restricted: Level 3 Required</h3>
              <p>Practice negotiations once you reach the rank of <strong>Associate Consultant</strong>.</p>
              
              <div className="progress-container" style={{ width: "100%", maxWidth: "320px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div className="progress-text" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  <span>Your XP: {progress.expPoints}</span>
                  <span>Required: 600 XP</span>
                </div>
                <div className="progress-bar-bg" style={{ height: "10px", background: "var(--bg-tertiary)", borderRadius: "99px", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
                  <div className="progress-bar-fill" style={{ height: "100%", background: "var(--accent-pink)", borderRadius: "99px", boxShadow: "0 0 8px var(--accent-pink)", width: `${Math.min(100, (progress.expPoints / 600) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="negotiation-view">
            {negStage === "setup" && (
              <div className="setup-card glass-card">
                <div className="setup-header">
                  <DollarSign className="setup-logo pulse-glow text-cyan" />
                  <h3>AI Salary Negotiation Simulator</h3>
                  <p>Practice the delicate art of salary discussions. Pitch your value, avoid boss fatigue, and optimize your overall package.</p>
                </div>

              <div className="negotiation-setup-grid">
                <div className="setup-col">
                  <label className="form-label">Career Target</label>
                  <select 
                    className="form-select"
                    value={negRole}
                    onChange={(e) => setNegRole(e.target.value)}
                  >
                    <option value="software-engineer">Software Engineer</option>
                    <option value="ai-engineer">AI/ML Engineer</option>
                    <option value="ux-designer">UX/UI Designer</option>
                  </select>

                  <label className="form-label mt-3">Target Seniority / Tier</label>
                  <div className="tier-selector-group">
                    {["entry", "mid", "executive"].map((tier) => (
                      <button 
                        key={tier}
                        className={`tier-btn ${negDifficulty === tier ? "active" : ""}`}
                        onClick={() => setNegDifficulty(tier)}
                      >
                        {tier.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setup-col">
                  <label className="form-label">Currency Unit</label>
                  <div className="currency-selector-group">
                    <button 
                      className={`curr-btn ${negCurrency === "USD" ? "active" : ""}`}
                      onClick={() => setNegCurrency("USD")}
                    >
                      USD ($)
                    </button>
                    <button 
                      className={`curr-btn ${negCurrency === "NGN" ? "active" : ""}`}
                      onClick={() => setNegCurrency("NGN")}
                    >
                      NGN (₦)
                    </button>
                  </div>

                  <label className="form-label mt-3">Select Opponent Boss Level</label>
                  <div className="boss-cards-grid">
                    {Object.keys(BOSS_PERSONALITIES).map((bKey) => {
                      const boss = BOSS_PERSONALITIES[bKey];
                      const isLocked = progress.level < boss.requiredLevel;
                      const isSelected = negBoss === bKey;
                      
                      return (
                        <div 
                          key={bKey} 
                          className={`boss-select-card glass-card ${isSelected ? "selected" : ""} ${isLocked ? "locked" : ""}`}
                          onClick={() => {
                            if (!isLocked) {
                              playHoverSound();
                              setNegBoss(bKey);
                            } else {
                              playErrorSound();
                            }
                          }}
                        >
                          {isLocked && <div className="boss-card-lock">🔒 Level {boss.requiredLevel} Required</div>}
                          <div className="boss-card-header">
                            <span className="boss-name">{boss.name}</span>
                            <span className="boss-title-tag" style={{ color: boss.color }}>{boss.title}</span>
                          </div>
                          <p className="boss-desc-text">{boss.desc}</p>
                          <div className="boss-stats-row">
                            <span className="stat-pill">Patience: {boss.minPatience}%</span>
                            <span className="stat-pill">Multiplier: x{boss.patienceImpact}</span>
                            <span className="stat-pill reward">+{boss.rewardXp} XP</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button className="btn btn-cyan btn-start-negotiation mt-4" onClick={startNegotiation}>
                Initiate Negotiation Sandbox <ArrowRight size={16} />
              </button>
            </div>
          )}

          {negStage === "active" && (
            <div className="negotiation-workspace">
              {/* Left Bar: Temperament and Thermometer */}
              <div className="neg-left-sidebar glass-card">
                <div className="boss-profile-box">
                  <div className="boss-avatar-wrapper" style={{ '--accent-primary': '#ff006e', '--accent-secondary': '#00d9ff' }}>
                    <Avatar isSpeaking={negEvaluating} />
                  </div>
                  <h4>{BOSS_PERSONALITIES[negBoss].name.split(" ")[0]}</h4>
                  <span className="boss-title">Hiring Manager</span>
                </div>

                {/* Thermometer Patience Scale */}
                <div className="patience-thermometer-section">
                  <span className="patience-label">BOSS PATIENCE: {negPatience}%</span>
                  <div className="thermometer-track">
                    <div 
                      className="thermometer-fill" 
                      style={{ 
                        height: `${negPatience}%`, 
                        background: negPatience > 60 ? "var(--accent-lime)" : negPatience > 30 ? "var(--accent-secondary)" : "var(--accent-pink)" 
                      }}
                    ></div>
                    <div className="thermometer-bulb" style={{
                      background: negPatience > 60 ? "var(--accent-lime)" : negPatience > 30 ? "var(--accent-secondary)" : "var(--accent-pink)" 
                    }}></div>
                  </div>
                  <span className="thermometer-desc">
                    {negPatience > 60 ? "Receptive" : negPatience > 30 ? "Irritated" : "Critical Limit"}
                  </span>
                </div>

                <div className="negotiation-rounds-box mt-4">
                  <div className="round-badge">ROUND {negRound} of 5</div>
                  <p className="text-muted text-xs mt-1">If negotiation runs past Round 5 or patience hits 0%, the offer is rescinded.</p>
                </div>
              </div>

              {/* Main Dialog Arena */}
              <div className="neg-main-arena glass-card">
                <div className="neg-chat-viewport">
                  {negLog.map((log, idx) => (
                    <div key={idx} className={`neg-chat-bubble ${log.sender}`}>
                      <div className="neg-bubble-header">
                        <span>{log.sender === "boss" ? "HIRING MANAGER" : "YOU"}</span>
                      </div>
                      <p>{log.text}</p>
                    </div>
                  ))}
                  {negEvaluating && (
                    <div className="neg-chat-bubble boss loading-bubble">
                      <div className="neg-bubble-header">HIRING MANAGER</div>
                      <RefreshCw size={14} className="spin-icon" />
                      <span>Reviewing budget parameters...</span>
                    </div>
                  )}
                  {negError && (
                    <div className="alert-box-error">
                      <ShieldAlert size={16} />
                      <span>{negError}</span>
                    </div>
                  )}
                </div>

                {/* Counter proposal panel */}
                <form onSubmit={handleNegotiationSubmit} className="proposal-form-panel">
                  <div className="proposal-pricing-row">
                    <div className="pricing-col">
                      <span className="price-lbl">Last Offer</span>
                      <span className="price-val text-white">{formatCurrency(negCurrentOffer, negCurrency)}</span>
                    </div>
                    <div className="pricing-col">
                      <span className="price-lbl">Proposed Counter</span>
                      <span className="price-val text-cyan">{formatCurrency(negCounterOffer, negCurrency)}</span>
                    </div>
                    <div className="slider-control-col">
                      <input 
                        type="range"
                        className="neg-price-slider"
                        min={Math.round(negCurrentOffer * 0.95)}
                        max={Math.round(negCurrentOffer * 1.6)}
                        step={negCurrency === "NGN" ? 100000 : 2000}
                        value={negCounterOffer}
                        onChange={(e) => setNegCounterOffer(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="pitch-textarea-row">
                    <textarea
                      className="form-textarea pitch-input"
                      placeholder="State your justification pitch (e.g. 'I bring 3 years of hands-on React development, and this aligns with current market rates...')"
                      value={negUserMsg}
                      onChange={(e) => setNegUserMsg(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="neg-action-buttons">
                    <button type="button" className="btn btn-secondary" onClick={acceptCurrentOffer} disabled={negEvaluating}>
                      Accept {formatCurrency(negCurrentOffer, negCurrency)}
                    </button>
                    <button type="button" className="btn btn-danger-outline" onClick={walkAwayNegotiation} disabled={negEvaluating}>
                      Walk Away
                    </button>
                    <button type="submit" className="btn btn-cyan" disabled={negEvaluating || !negUserMsg.trim()}>
                      Submit Proposal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {negStage === "complete" && (
            <div className="setup-card glass-card text-center">
              {negVerdict === "accepted" ? (
                <>
                  <CheckCircle size={60} className="text-lime pulse-glow mb-3" />
                  <h2>Deal Finalized!</h2>
                  <p>Congratulations! You reached a mutually beneficial agreement with the hiring manager.</p>
                  
                  <div className="final-deal-card glass-card">
                    <span className="deal-lbl">FINAL CONTRACT SALARY</span>
                    <span className="deal-val">{formatCurrency(negCurrentOffer, negCurrency)}</span>
                    <span className="deal-sub">Compared to initial offer: {formatCurrency(negInitialOffer, negCurrency)}</span>
                  </div>

                  <p className="text-muted mt-2">You gained <strong>+250 XP</strong> and advanced your Salary Negotiation skills.</p>
                </>
              ) : (
                <>
                  <ShieldAlert size={60} className="text-pink pulse-glow mb-3" />
                  <h2>Negotiation Collapsed</h2>
                  <p>The company decided to rescind their offer. The proposed counter-offers exceeded the budget threshold or patience limits.</p>
                  <div className="final-deal-card collapsed glass-card">
                    <span className="deal-lbl">OFFER RESCINDED</span>
                    <span className="deal-val">$0.00</span>
                  </div>
                  <p className="text-muted mt-2">Practice makes perfect. Focus on smaller incremental counter-offers (5-12%) and justify each request with concrete project achievements next time.</p>
                </>
              )}

              <button className="btn btn-cyan mt-4" onClick={() => setNegStage("setup")}>
                Try Another Simulation
              </button>
            </div>
          )}
        </div>
      )
    )}

      <style>{`
        .interview-page-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Segmented tab styling */
        .segmented-tabs {
          display: flex;
          padding: 0.25rem !important;
          border-radius: 30px;
          width: fit-content;
          margin: 0 auto;
          background: rgba(18, 20, 38, 0.8) !important;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.5rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.25s ease;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--accent-primary);
          background: rgba(0, 217, 255, 0.1);
          box-shadow: inset 0 0 8px rgba(0, 217, 255, 0.15);
        }

        /* Setup view cards */
        .setup-card {
          text-align: center;
          padding: 2.5rem !important;
          max-width: 750px;
          margin: 1.5rem auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .setup-logo {
          color: var(--accent-primary);
          width: 48px;
          height: 48px;
          margin-bottom: 0.5rem;
        }

        .setup-section-title {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          text-align: left;
          border-left: 2px solid var(--accent-primary);
          padding-left: 0.5rem;
          margin-top: 1rem;
        }

        .role-selector-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          width: 100%;
        }

        .role-select-card {
          padding: 1.25rem !important;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.02) !important;
        }

        .role-select-card:hover {
          border-color: var(--glass-border-hover);
          transform: translateY(-2px);
        }

        .role-select-card.selected {
          border-color: var(--accent-primary) !important;
          background: rgba(0, 217, 255, 0.08) !important;
          box-shadow: var(--glow-primary);
        }

        .role-icon {
          font-size: 1.8rem;
        }

        .interviewer-selector-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          width: 100%;
        }

        .interviewer-card {
          display: flex;
          gap: 0.75rem;
          padding: 1rem !important;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          background: rgba(255, 255, 255, 0.02) !important;
        }

        .interviewer-card:hover {
          border-color: var(--glass-border-hover);
          transform: translateY(-2px);
        }

        .interviewer-card.selected {
          border-color: var(--accent-secondary) !important;
          background: rgba(157, 78, 221, 0.08) !important;
          box-shadow: 0 0 15px rgba(157, 78, 221, 0.25);
        }

        .avatar-preview-mini {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent-primary);
          position: relative;
          box-shadow: 0 0 10px var(--accent-primary);
          flex-shrink: 0;
          margin-top: 3px;
        }

        .glow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-secondary);
          position: absolute;
          top: 7px;
          left: 7px;
        }

        .interviewer-info h4 {
          font-size: 0.95rem;
          margin-bottom: 0.15rem;
        }

        .interviewer-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .interviewer-info p {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.35;
          margin-top: 0.25rem;
        }

        .btn-start-interview, .btn-start-negotiation {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          margin: 1.5rem auto 0 auto;
          padding: 0.75rem 2rem;
        }

        /* 3D Holographic Room backdrop and grid */
        .holographic-room-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
          width: 100%;
        }

        @media (max-width: 850px) {
          .holographic-room-layout {
            grid-template-columns: 1fr;
          }
        }

        .room-side-panel {
          padding: 1.25rem !important;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .panel-section-title {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.4rem;
        }

        .biometric-row {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .bio-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .bio-val {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'Spline Sans Mono', monospace;
        }

        .pulse-text {
          animation: textPulse 1.5s ease-in-out infinite alternate;
        }

        @keyframes textPulse {
          from { opacity: 0.8; text-shadow: 0 0 4px rgba(255, 0, 110, 0.2); }
          to { opacity: 1; text-shadow: 0 0 10px rgba(255, 0, 110, 0.6); color: var(--accent-pink); }
        }

        .bio-sparkline {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 24px;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          padding: 3px;
        }

        .sparkline-bar {
          flex-grow: 1;
          background: var(--accent-pink);
          border-radius: 1px;
          animation: sparkHeight 1.5s infinite ease-in-out alternate;
        }

        @keyframes sparkHeight {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1); }
        }

        .bio-bar-bg {
          height: 6px;
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
          overflow: hidden;
        }

        .bio-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .bio-bar-fill.low { background: var(--accent-lime); }
        .bio-bar-fill.medium { background: var(--accent-secondary); }
        .bio-bar-fill.high { background: var(--accent-pink); }

        .bio-hint {
          font-size: 0.65rem;
        }

        .metric-box {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          padding: 0.4rem 0;
          border-bottom: 1px dashed rgba(255,255,255,0.04);
        }

        .metric-lbl { color: var(--text-muted); }
        .metric-val { font-weight: 600; }

        /* central arena */
        .hologram-main-card {
          display: flex;
          flex-direction: column;
          height: 520px;
          padding: 0 !important;
          overflow: hidden;
        }

        .hologram-stage-wrapper {
          height: 180px;
          background: radial-gradient(circle at 50% 50%, rgba(20, 24, 52, 0.4) 0%, rgba(10, 14, 39, 0) 70%);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-bottom: 1px solid var(--glass-border);
        }

        .perspective-grid-floor {
          position: absolute;
          bottom: -40px;
          width: 200%;
          height: 160px;
          background-image: 
            linear-gradient(rgba(0, 217, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.08) 1px, transparent 1px);
          background-size: 15px 15px;
          background-position: center;
          transform: perspective(100px) rotateX(65deg);
          animation: scrollGrid 20s linear infinite;
        }

        @keyframes scrollGrid {
          from { background-position-y: 0px; }
          to { background-position-y: 300px; }
        }

        .floating-avatar-platform {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: floatPlatform 3s ease-in-out infinite alternate;
        }

        @keyframes floatPlatform {
          from { transform: translateY(0px); }
          to { transform: translateY(-5px); }
        }

        .hologram-beam {
          position: absolute;
          top: 10px;
          width: 90px;
          height: 110px;
          background: linear-gradient(180deg, rgba(0, 217, 255, 0.1) 0%, transparent 100%);
          clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0.6;
        }

        .glow-base {
          position: absolute;
          bottom: -5px;
          width: 90px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-primary);
          box-shadow: 0 0 15px 3px var(--accent-primary);
          opacity: 0.5;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--glass-border);
        }

        .chat-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .live-tag {
          font-size: 0.6rem;
          background: rgba(255, 0, 110, 0.15);
          color: var(--accent-pink);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .chat-header h4 {
          font-size: 0.95rem;
        }

        .voice-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-voice-toggle {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-voice-toggle.voice-active {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
          background: rgba(0, 217, 255, 0.08);
          box-shadow: var(--glow-primary);
        }

        .question-counter {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .interviewer-bubble {
          margin: 1rem;
          padding: 1rem !important;
          background: rgba(255,255,255,0.01) !important;
        }

        .bubble-sender-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--accent-secondary);
          margin-bottom: 0.4rem;
        }

        .bubble-text {
          font-size: 0.9rem;
          line-height: 1.45;
        }

        .chat-input-bar {
          margin-top: auto;
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid var(--glass-border);
          background: rgba(0,0,0,0.1);
        }

        .chat-input-field {
          min-height: 50px !important;
          flex-grow: 1;
        }

        .btn-send {
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* Score radar and review stage */
        .evaluating-card {
          text-align: center;
          padding: 3rem !important;
          max-width: 400px;
          margin: 3rem auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .loading-spinner {
          width: 36px;
          height: 36px;
          color: var(--accent-primary);
          animation: spin 1.5s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .results-header-summary {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 1.5rem !important;
          background: linear-gradient(135deg, rgba(57, 255, 20, 0.06) 0%, rgba(0, 217, 255, 0.04) 100%) !important;
          border-color: rgba(57, 255, 20, 0.15) !important;
          margin-bottom: 1.5rem;
        }

        .hologram-chart-box {
          width: 150px;
          height: 150px;
          position: relative;
          flex-shrink: 0;
        }

        .score-badge-val {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.4rem;
          font-weight: 800;
          font-family: 'Spline Sans Mono', monospace;
          color: var(--accent-primary);
          text-shadow: 0 0 10px rgba(0,217,255,0.4);
        }

        .poly-chart-svg {
          transform: rotate(-30deg);
        }

        .header-review-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.4rem;
        }

        .critique-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .critique-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dashed var(--glass-border);
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .critique-card-header h5 {
          font-size: 0.95rem;
        }

        .score-pill {
          font-size: 0.75rem;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          background: rgba(157, 78, 221, 0.12);
          border: 1px solid rgba(157, 78, 221, 0.25);
          color: var(--accent-secondary);
        }

        .critique-section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .critique-section-grid {
            grid-template-columns: 1fr;
          }
        }

        .critique-col h6 {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
          margin-top: 0.8rem;
        }

        .critique-col h6:first-of-type { margin-top: 0; }

        .txt-box {
          font-size: 0.8rem;
          padding: 0.6rem 0.8rem;
          border-radius: var(--border-radius-md);
          line-height: 1.4;
        }

        .candidate-ans {
          background: rgba(255,255,255,0.01);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
        }

        .ideal-ans {
          background: rgba(0, 217, 255, 0.02);
          border: 1px solid rgba(0,217,255,0.15);
          color: var(--accent-primary);
        }

        .txt-feedback {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .tips-list {
          padding-left: 1rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        /* Salary Negotiation view styles */
        .negotiation-setup-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          text-align: left;
          width: 100%;
        }

        @media (max-width: 650px) {
          .negotiation-setup-grid {
            grid-template-columns: 1fr;
          }
        }

        .tier-selector-group, .currency-selector-group {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.4rem;
        }

        .tier-btn, .curr-btn {
          flex-grow: 1;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          cursor: pointer;
          border-radius: var(--border-radius-md);
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .tier-btn:hover, .curr-btn:hover {
          border-color: var(--glass-border-hover);
        }

        .tier-btn.active, .curr-btn.active {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: rgba(0, 217, 255, 0.08);
        }

        .personality-subtext {
          font-size: 0.7rem;
          display: block;
          margin-top: 0.25rem;
        }

        .negotiation-workspace {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 1.5rem;
          align-items: stretch;
        }

        @media (max-width: 800px) {
          .negotiation-workspace {
            grid-template-columns: 1fr;
          }
        }

        .neg-left-sidebar {
          padding: 1.25rem !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .boss-profile-box {
          text-align: center;
        }

        .boss-avatar-wrapper {
          width: 100px;
          height: 100px;
          margin: 0 auto 0.5rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .boss-title {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          display: block;
        }

        .patience-thermometer-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .patience-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .thermometer-track {
          width: 14px;
          height: 140px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .thermometer-fill {
          width: 100%;
          border-radius: 10px;
          transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .thermometer-bulb {
          position: absolute;
          bottom: -8px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid var(--glass-border);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .thermometer-desc {
          font-size: 0.7rem;
          font-weight: 600;
        }

        .negotiation-rounds-box {
          text-align: center;
          background: rgba(0,0,0,0.15);
          padding: 0.6rem;
          border-radius: 6px;
          width: 100%;
        }

        .round-badge {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent-primary);
          font-family: 'Spline Sans Mono', monospace;
        }

        .neg-main-arena {
          display: flex;
          flex-direction: column;
          height: 520px;
          padding: 0 !important;
          overflow: hidden;
        }

        .neg-chat-viewport {
          flex-grow: 1;
          padding: 1.25rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(0,0,0,0.15);
        }

        .neg-chat-bubble {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .neg-chat-bubble.boss {
          align-self: flex-start;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-bottom-left-radius: 3px;
        }

        .neg-chat-bubble.user {
          align-self: flex-end;
          background: rgba(0, 217, 255, 0.06);
          border: 1px solid rgba(0, 217, 255, 0.15);
          border-bottom-right-radius: 3px;
          color: var(--text-primary);
        }

        .neg-bubble-header {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .neg-chat-bubble.boss .neg-bubble-header { color: var(--accent-secondary); }
        .neg-chat-bubble.user .neg-bubble-header { color: var(--accent-primary); }

        .loading-bubble {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
        }

        .spin-icon {
          animation: spin 1.2s linear infinite;
        }

        .proposal-form-panel {
          padding: 1.25rem;
          background: rgba(0,0,0,0.25);
          border-top: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .proposal-pricing-row {
          display: grid;
          grid-template-columns: 140px 140px 1fr;
          gap: 1rem;
          align-items: center;
        }

        @media (max-width: 650px) {
          .proposal-pricing-row {
            grid-template-columns: 1fr;
          }
        }

        .pricing-col {
          display: flex;
          flex-direction: column;
        }

        .price-lbl {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .price-val {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'Spline Sans Mono', monospace;
        }

        .neg-price-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          outline: none;
        }

        .neg-price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent-primary);
          box-shadow: 0 0 8px var(--accent-primary);
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        .neg-price-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .pitch-input {
          min-height: 44px !important;
          font-size: 0.8rem;
        }

        .neg-action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .btn-danger-outline {
          background: transparent;
          border: 1px solid rgba(255, 0, 110, 0.4);
          color: var(--accent-pink);
        }

        .btn-danger-outline:hover {
          background: rgba(255, 0, 110, 0.08);
          border-color: var(--accent-pink);
        }

        .final-deal-card {
          margin: 1.5rem auto 0 auto;
          max-width: 320px;
          padding: 1.25rem !important;
          background: linear-gradient(135deg, rgba(57, 255, 20, 0.08) 0%, transparent 100%) !important;
          border-color: rgba(57, 255, 20, 0.25) !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          border-radius: 12px;
        }

        .final-deal-card.collapsed {
          background: linear-gradient(135deg, rgba(255, 0, 110, 0.08) 0%, transparent 100%) !important;
          border-color: rgba(255, 0, 110, 0.25) !important;
        }

        .deal-lbl {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .deal-val {
          font-size: 1.6rem;
          font-weight: 800;
          font-family: 'Spline Sans Mono', monospace;
          color: var(--accent-lime);
        }

        .final-deal-card.collapsed .deal-val {
          color: var(--accent-pink);
        }

        .deal-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .alert-box-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 0, 110, 0.1);
          border: 1px solid rgba(255, 0, 110, 0.25);
          color: var(--accent-pink);
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
        }

        /* Boss selection cards */
        .boss-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
          text-align: left;
        }
        .boss-select-card {
          position: relative;
          padding: 0.85rem !important;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--glass-border);
          background: rgba(18, 20, 38, 0.4) !important;
          border-radius: var(--border-radius-md);
        }
        .boss-select-card:hover:not(.locked) {
          border-color: var(--accent-secondary);
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.15);
          transform: translateY(-2px);
        }
        .boss-select-card.selected {
          border-color: var(--accent-secondary) !important;
          background: rgba(0, 217, 255, 0.05) !important;
          box-shadow: 0 0 15px rgba(0, 217, 255, 0.2) !important;
        }
        .boss-select-card.locked {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(10, 10, 10, 0.6) !important;
          border-color: rgba(255, 0, 110, 0.15) !important;
        }
        .boss-card-lock {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: var(--accent-pink);
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          box-shadow: 0 0 5px var(--accent-pink);
        }
        .boss-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .boss-name {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        .boss-title-tag {
          font-size: 0.7rem;
          font-weight: 800;
          font-family: var(--font-mono);
          text-transform: uppercase;
        }
        .boss-desc-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          line-height: 1.35;
        }
        .boss-stats-row {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .stat-pill {
          font-size: 0.65rem;
          font-weight: 600;
          background: rgba(0, 0, 0, 0.3);
          color: var(--text-secondary);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          border: 1px solid var(--glass-border);
        }
        .stat-pill.reward {
          background: rgba(57, 255, 20, 0.1);
          color: var(--accent-lime);
          border-color: rgba(57, 255, 20, 0.2);
        }
      `}</style>
    </div>
  );
}

import React, { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { INTERVIEW_ROLES } from "../data/mockData";
import { evaluateInterviewResponse } from "../services/gemini";
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  Award, 
  AlertCircle,
  Brain,
  Volume2,
  VolumeX
} from "lucide-react";
import SpeechWaveCanvas from "../components/SpeechWaveCanvas";

export default function Interview() {
  const { apiKey, saveInterviewScore } = useContext(AppContext);
  
  // UI States: 'setup' | 'interview' | 'review'
  const [stage, setStage] = useState("setup");
  const [selectedRole, setSelectedRole] = useState("software-engineer");
  
  // Session States
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState("");
  
  // Audio & Voice States
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  
  // Evaluation & Loading States
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const activeRoleData = INTERVIEW_ROLES[selectedRole];

  // Speech helper
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    
    if (!voiceEnabled) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find an English voice (preferably a higher-quality native voice if available)
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en-US") || v.lang.startsWith("en-GB")) || voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Speak when question changes or voice toggle changes
  useEffect(() => {
    if (stage === "interview" && questions[currentQIndex]) {
      speakText(questions[currentQIndex].question);
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQIndex, questions, stage, voiceEnabled]);

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

    // Cancel speech when user submits
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setAnswers((prev) => ({
      ...prev,
      [questions[currentQIndex].id]: currentInput.trim()
    }));

    setCurrentInput("");
    
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

  return (
    <div className="interview-view">
      {stage === "setup" && (
        <div className="setup-card glass-card">
          <div className="setup-header">
            <Brain className="setup-logo pulse-glow" />
            <h3>Configure Your Interview Sandbox</h3>
            <p>Practice responding to standard technical and behavioral queries. Select your path below to begin.</p>
          </div>

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

          <button className="btn btn-primary btn-start-interview" onClick={startInterview}>
            Start Practice Interview
          </button>
        </div>
      )}

      {stage === "interview" && questions.length > 0 && (
        <div className="chat-interface-card glass-card">
          <div className="chat-header">
            <div className="chat-title-group">
              <span className="live-tag">LIVE SESSION</span>
              <h4>{activeRoleData.title} Sandbox</h4>
            </div>
            
            <div className="voice-controls">
              {/* Voice toggle button */}
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

          <div className="chat-viewport">
            <div className="chat-bubble interviewer">
              <div className="bubble-sender-row">
                <span className="bubble-sender">AI INTERVIEWER</span>
                
                {/* Siri-style Voice Waveform Canvas */}
                <SpeechWaveCanvas isSpeaking={isSpeaking} />
              </div>
              <p className="bubble-text">{questions[currentQIndex].question}</p>
            </div>

            {currentQIndex > 0 && (
              <div className="scroll-history-info">
                <CheckCircle size={14} className="history-icon" />
                <span>Saved responses for previous questions.</span>
              </div>
            )}
          </div>

          <form onSubmit={handleAnswerSubmit} className="chat-input-bar">
            <textarea
              className="form-textarea chat-input-field"
              placeholder="Type your structured response here..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              required
            ></textarea>
            <button type="submit" className="btn btn-cyan btn-send" disabled={!currentInput.trim()}>
              <Send size={18} />
              <span>{currentQIndex === questions.length - 1 ? "Finish" : "Submit"}</span>
            </button>
          </form>
        </div>
      )}

      {stage === "review" && (
        <div className="review-dashboard">
          {evaluating ? (
            <div className="evaluating-card glass-card">
              <RefreshCw className="loading-spinner" />
              <h3>Grading Interview Answers...</h3>
              <p>Analyzing context, phrasing, and relevance against ideal criteria using Gemini AI.</p>
            </div>
          ) : errorMessage ? (
            <div className="error-card glass-card">
              <AlertCircle size={40} className="error-icon" />
              <h3>Evaluation Encountered a Problem</h3>
              <p>{errorMessage}</p>
              <button className="btn btn-primary" onClick={startInterview}>
                Retry Interview
              </button>
            </div>
          ) : (
            <div className="review-results-container">
              <div className="results-header-summary glass-card">
                <div className="score-ring-container">
                  <div className="score-ring">
                    <span className="score-num">{finalScore}%</span>
                    <span className="score-lbl">OVERALL</span>
                  </div>
                </div>
                <div className="header-review-text">
                  <span className="badge badge-success">Practice Complete</span>
                  <h3>Grading & Analysis Report</h3>
                  <p>Congratulations! You gained <strong>+150 XP</strong> for completing this practice session. Review your question-by-question evaluations below to optimize your delivery.</p>
                  <button className="btn btn-secondary btn-restart" onClick={() => setStage("setup")}>
                    Try Another Role
                  </button>
                </div>
              </div>

              <div className="critique-list">
                {evaluationResults.map((result, idx) => (
                  <div key={idx} className="critique-card glass-card">
                    <div className="critique-card-header">
                      <h5>Question {idx + 1}: {result.question}</h5>
                      <span className="badge badge-indigo">Score: {result.score}/100</span>
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

      <style>{`
        .interview-view {
          display: flex;
          flex-direction: column;
        }

        .setup-card {
          text-align: center;
          padding: 3rem !important;
          max-width: 800px;
          margin: 2rem auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .setup-logo {
          color: var(--accent-secondary);
          width: 50px;
          height: 50px;
          margin-bottom: 0.5rem;
        }

        .setup-header h3 {
          font-size: 1.6rem;
          margin-bottom: 0.5rem;
        }

        .setup-header p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .role-selector-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          width: 100%;
        }

        @media (max-width: 768px) {
          .role-selector-grid {
            grid-template-columns: 1fr;
          }
        }

        .role-select-card {
          padding: 1.5rem !important;
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
          background: rgba(99, 102, 241, 0.08) !important;
          box-shadow: var(--glow-primary);
        }

        .role-icon {
          font-size: 2rem;
        }

        .role-select-card h4 {
          font-size: 1rem;
        }

        .role-select-card p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .btn-start-interview {
          width: 250px;
        }

        /* Chat interface styling */
        .chat-interface-card {
          max-width: 800px;
          margin: 1rem auto;
          display: flex;
          flex-direction: column;
          height: 480px;
          padding: 0 !important;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.02);
        }

        .chat-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .live-tag {
          font-size: 0.65rem;
          background: rgba(239, 68, 68, 0.15);
          color: var(--accent-danger);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
          letter-spacing: 0.05em;
          animation: pulse 2s infinite;
        }

        .chat-header h4 {
          font-size: 1.1rem;
        }

        .voice-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-voice-toggle {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-voice-toggle:hover {
          color: var(--text-primary);
          border-color: var(--accent-secondary);
        }

        .btn-voice-toggle.voice-active {
          color: var(--accent-secondary);
          border-color: var(--accent-secondary);
          background: rgba(6, 182, 212, 0.08);
          box-shadow: var(--glow-secondary);
        }

        .question-counter {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .chat-viewport {
          flex-grow: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: rgba(4, 5, 8, 0.2);
        }

        .chat-bubble {
          max-width: 85%;
          padding: 1rem 1.25rem;
          border-radius: var(--border-radius-lg);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .chat-bubble.interviewer {
          align-self: flex-start;
          background: var(--bg-tertiary);
          border-bottom-left-radius: 4px;
          border: 1px solid var(--glass-border);
        }

        .bubble-sender-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .bubble-sender {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-secondary);
          letter-spacing: 0.05em;
        }

        /* Voice Waveform animation styling */
        .speech-wave {
          display: flex;
          align-items: center;
          gap: 2.5px;
          height: 14px;
        }

        .wave-bar {
          width: 2px;
          background: var(--accent-secondary);
          border-radius: 1px;
          height: 4px;
          transition: height 0.15s ease;
        }

        .speech-wave.speaking .bar-1 { animation: pulseBar 0.8s infinite ease-in-out alternate; }
        .speech-wave.speaking .bar-2 { animation: pulseBar 0.6s infinite ease-in-out alternate 0.15s; }
        .speech-wave.speaking .bar-3 { animation: pulseBar 0.9s infinite ease-in-out alternate 0.3s; }
        .speech-wave.speaking .bar-4 { animation: pulseBar 0.7s infinite ease-in-out alternate 0.1s; }

        @keyframes pulseBar {
          from { height: 4px; }
          to { height: 16px; }
        }

        .bubble-text {
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--text-primary);
        }

        .scroll-history-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: auto;
        }

        .history-icon {
          color: var(--accent-success);
        }

        .chat-input-bar {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.01);
        }

        .chat-input-field {
          min-height: 60px !important;
          flex-grow: 1;
        }

        .btn-send {
          height: auto;
          align-self: stretch;
          padding: 0 1.5rem;
        }

        /* Review stage styling */
        .evaluating-card {
          text-align: center;
          padding: 4rem !important;
          max-width: 500px;
          margin: 4rem auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          color: var(--accent-primary);
          animation: spin 1.5s linear infinite;
        }

        .results-header-summary {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2rem !important;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%) !important;
          border-color: rgba(16, 185, 129, 0.2) !important;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .results-header-summary {
            flex-direction: column;
            text-align: center;
          }
        }

        .score-ring-container {
          flex-shrink: 0;
        }

        .score-ring {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 4px solid var(--accent-success);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
          background: var(--bg-primary);
        }

        .score-num {
          font-size: 1.85rem;
          font-weight: 800;
          line-height: 1;
          color: var(--accent-success);
        }

        .score-lbl {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-top: 0.15rem;
        }

        .header-review-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .header-review-text {
            align-items: center;
          }
        }

        .header-review-text h3 {
          font-size: 1.5rem;
        }

        .header-review-text p {
          font-size: 0.9rem;
        }

        .btn-restart {
          margin-top: 0.5rem;
        }

        .critique-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .critique-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 1rem;
        }

        .critique-card-header h5 {
          font-size: 1.05rem;
          color: var(--text-primary);
          max-width: 80%;
        }

        .critique-section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .critique-section-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        .critique-col h6 {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }

        .critique-col h6:first-of-type {
          margin-top: 0;
        }

        .txt-box {
          font-size: 0.85rem;
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius-md);
          line-height: 1.5;
        }

        .candidate-ans {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
        }

        .ideal-ans {
          background: rgba(6, 182, 212, 0.03);
          border: 1px solid rgba(6, 182, 212, 0.15);
          color: var(--accent-secondary);
        }

        .txt-feedback {
          font-size: 0.85rem;
          line-height: 1.55;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .tips-list {
          padding-left: 1.25rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .tips-list li::marker {
          color: var(--accent-primary);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-card {
          text-align: center;
          padding: 3rem !important;
          max-width: 500px;
          margin: 4rem auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .error-icon {
          color: var(--accent-danger);
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

import React, { useContext, useState, useEffect, useRef } from "react";
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
  GitCommit,
  GitCompare,
  Layers,
  Award
} from "lucide-react";
import { playHoverSound, playErrorSound, playSuccessSound } from "../services/sound";

// Holographic 3D Skill Radar Chart Canvas
const HolographicSkillRadarCanvas = ({ skills = [] }) => {
  const canvasRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hoveredIdx, setHoveredIdx] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = 460;
      canvas.height = 300;
    };
    resize();

    // Map skills to stats and courses
    const skillData = skills.map((skill, idx) => {
      const required = [85, 75, 90, 80, 70, 85][idx % 6];
      const current = [40, 75, 50, 80, 35, 85][idx % 6];
      const courseTemplates = {
        react: "React Hooks Mastery",
        javascript: "Modern JS Algorithms",
        git: "Interactive Git branch strategy",
        api: "REST & GraphQL design pattern",
        python: "Python ML systems",
        pytorch: "Deep PyTorch transformers",
        figma: "Design Tokens & Spline 3D",
        wireframe: "UI Wireframes & UX research",
        scale: "High load architecture",
        cloud: "AWS Cloud architecture",
        databases: "PostgreSQL scaling",
        testing: "Unit & Integration test suites"
      };
      
      const skillLower = skill.toLowerCase();
      const matchedKey = Object.keys(courseTemplates).find((k) => skillLower.includes(k)) || "javascript";
      const courseName = courseTemplates[matchedKey];

      return {
        name: skill,
        required,
        current,
        hasGap: current < required,
        courseName
      };
    });

    const numAxes = skillData.length;
    const center = { x: 230, y: 150 };
    const maxRadius = 100;

    // Floating particles for active effects
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * maxRadius,
        speed: Math.random() * 0.005 + 0.002,
        size: Math.random() * 1.5 + 0.5,
        color: i % 2 === 0 ? "rgba(0, 217, 255, 0.4)" : "rgba(157, 78, 221, 0.4)"
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      // Background ambient space
      ctx.fillStyle = "rgba(10, 11, 22, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(center.x, center.y);

      // Apply 3D perspective tilt
      const rx = tilt.x * 0.18;
      const ry = tilt.y * 0.12;
      ctx.transform(1, ry, rx, 1, 0, 0);

      // 1. Draw concentrics rings (polygons)
      const numRings = 4;
      ctx.lineWidth = 1;
      for (let r = 1; r <= numRings; r++) {
        const currentRadius = (maxRadius / numRings) * r;
        ctx.strokeStyle = `rgba(157, 78, 221, ${0.05 + (r / numRings) * 0.05})`;
        ctx.beginPath();
        for (let i = 0; i < numAxes; i++) {
          const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
          const x = Math.cos(angle) * currentRadius;
          const y = Math.sin(angle) * currentRadius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 2. Draw lines from center to vertices
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * maxRadius, Math.sin(angle) * maxRadius);
      }
      ctx.stroke();

      // 3. Draw Target Required Skill Polygon (Cyan)
      ctx.shadowBlur = 6;
      ctx.shadowColor = "#00d9ff";
      ctx.strokeStyle = "rgba(0, 217, 255, 0.6)";
      ctx.fillStyle = "rgba(0, 217, 255, 0.08)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const radius = (skillData[i].required / 100) * maxRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Draw Current User Skill Polygon (Purple)
      ctx.shadowColor = "#9d4edd";
      ctx.strokeStyle = "rgba(157, 78, 221, 0.8)";
      ctx.fillStyle = "rgba(157, 78, 221, 0.18)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const radius = (skillData[i].current / 100) * maxRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // 5. Draw vertices and Gaps highlights
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const requiredRad = (skillData[i].required / 100) * maxRadius;
        const currentRad = (skillData[i].current / 100) * maxRadius;

        const rx = Math.cos(angle) * currentRad;
        const ry = Math.sin(angle) * currentRad;

        // Draw regular vertex node
        ctx.fillStyle = "#9d4edd";
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI * 2);
        ctx.fill();

        // If there's a gap, draw a glowing alert ring
        if (skillData[i].hasGap) {
          const gapRadius = 5 + Math.sin(now * 0.008 + i) * 1.5;
          ctx.strokeStyle = "rgba(255, 0, 110, 0.85)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(rx, ry, gapRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Float course text tags drifting around gaps
          const driftDist = requiredRad + 22 + Math.sin(now * 0.0015 + i) * 6;
          const tx = Math.cos(angle + 0.08) * driftDist;
          const ty = Math.sin(angle + 0.08) * driftDist;

          ctx.fillStyle = "rgba(0, 217, 255, 0.85)";
          ctx.font = "bold 8.5px var(--font-mono), monospace";
          ctx.fillText(`📚 ${skillData[i].courseName}`, tx - 30, ty);
          
          // Draw connecting dashed line
          ctx.strokeStyle = "rgba(0, 217, 255, 0.25)";
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.setLineDash([]); // reset
        }

        // Draw skill label
        const lblDist = maxRadius + 14;
        const lx = Math.cos(angle) * lblDist;
        const ly = Math.sin(angle) * lblDist;
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.font = "bold 8.5px var(--font-sans), sans-serif";
        ctx.textAlign = lx > 5 ? "left" : lx < -5 ? "right" : "center";
        ctx.fillText(skillData[i].name.toUpperCase(), lx, ly + 3);
      }

      // 6. Draw floating particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const px = Math.cos(p.angle) * p.radius;
        const py = Math.sin(p.angle) * p.radius;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7. Render hovered HUD details
      if (hoveredIdx >= 0 && hoveredIdx < numAxes) {
        const item = skillData[hoveredIdx];
        ctx.restore(); // Exit 3D context transform to draw HUD flat on top
        
        ctx.fillStyle = "rgba(8, 10, 29, 0.95)";
        ctx.strokeStyle = "rgba(0, 217, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(10, 10, 200, 52, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.font = "bold 9.5px var(--font-sans)";
        ctx.fillText(item.name.toUpperCase(), 18, 25);

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "9px var(--font-sans)";
        ctx.fillText(`Your Level: ${item.current}%`, 18, 38);
        ctx.fillText(`Required: ${item.required}%`, 18, 50);

        if (item.hasGap) {
          ctx.fillStyle = "var(--accent-pink)";
          ctx.font = "bold 8.5px var(--font-sans)";
          ctx.fillText(`GAP DETECTED (-${item.required - item.current}%)`, 120, 38);
        } else {
          ctx.fillStyle = "var(--accent-lime)";
          ctx.font = "bold 8.5px var(--font-sans)";
          ctx.fillText("COMPETENT", 120, 38);
        }
        
        ctx.save(); // restore context state
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [tilt, skills, hoveredIdx]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTilt({ x, y });

    // Simple mathematical lookup to determine if mouse is near any axis index
    const cx = 230;
    const cy = 150;
    const mouseX = e.clientX - rect.left - cx;
    const mouseY = e.clientY - rect.top - cy;
    const dist = Math.sqrt(mouseX * mouseX + mouseY * mouseY);

    if (dist < 130) {
      let angle = Math.atan2(mouseY, mouseX) + Math.PI / 2;
      if (angle < 0) angle += Math.PI * 2;
      const step = Math.PI * 2 / skills.length;
      const sector = Math.round(angle / step) % skills.length;
      setHoveredIdx(sector);
    } else {
      setHoveredIdx(-1);
    }
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHoveredIdx(-1);
  };

  return (
    <div 
      className="radar-canvas-container glass-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
        background: "rgba(10, 12, 28, 0.6)"
      }}
    >
      <canvas ref={canvasRef} className="radar-canvas" style={{ display: "block", cursor: "crosshair" }} />
      <div className="radar-legend-row" style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          <div style={{ width: "10px", height: "10px", background: "rgba(0, 217, 255, 0.4)", border: "1px solid #00d9ff", borderRadius: "2px" }}></div>
          <span>Required Level</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          <div style={{ width: "10px", height: "10px", background: "rgba(157, 78, 221, 0.4)", border: "1px solid #9d4edd", borderRadius: "2px" }}></div>
          <span>Your Capabilities</span>
        </div>
      </div>
    </div>
  );
};

export default function Roadmap() {
  const { apiKey, progress, toggleMilestone } = useContext(AppContext);
  const [selectedId, setSelectedId] = useState(CAREER_PATHS[0].id);
  
  // Left Canvas mode: 'tree' | 'custom'
  const [canvasMode, setCanvasMode] = useState("tree");

  // Right details panel tab: 'milestones' | 'wealth' | 'radar' | 'timeline'
  const [detailsTab, setDetailsTab] = useState("milestones");

  // Drag rotation states for 3D perspective network tree
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(0);
  const isDraggingRef = useRef(false);
  const startMouseRef = useRef({ x: 0, y: 0 });

  // Wealth simulator states
  const [housingPct, setHousingPct] = useState(30);
  const [essentialsPct, setEssentialsPct] = useState(25);
  const [savingsPct, setSavingsPct] = useState(20);

  // Dynamic AI Roadmap states
  const [userSkillsInput, setUserSkillsInput] = useState("");
  const [targetCareerInput, setTargetCareerInput] = useState("");
  const [customRoadmap, setCustomRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState("");

  const selectedCareer = CAREER_PATHS.find((c) => c.id === selectedId) || CAREER_PATHS[0];

  // Rotate a point in 3D
  const rotate3D = (x, y, z, angleY, angleX) => {
    // Rotate around Y
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    let x1 = x * cosY - z * sinY;
    let z1 = z * cosY + x * sinY;

    // Rotate around X
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    let y2 = y * cosX - z1 * sinX;
    let z2 = z1 * cosX + y * sinX;

    return { x: x1, y: y2, z: z2 };
  };

  // Drag interaction handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startMouseRef.current.x;
    const dy = e.clientY - startMouseRef.current.y;
    
    setRotY((prev) => prev + dx * 0.005);
    setRotX((prev) => Math.max(-0.6, Math.min(0.6, prev + dy * 0.005)));
    
    startMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Project 3D nodes to 2D
  const getProjectedNodes = () => {
    const fov = 350;
    const cx = 350;
    const cy = 225;

    return CAREER_PATHS.map((career) => {
      // Base positions centered around (0,0,0)
      const basePos = {
        x: career.coordinates.x - 350,
        y: career.coordinates.y - 225,
        z: career.id === "software-engineer" ? -40 : career.id === "ai-engineer" ? 40 : 0
      };

      const rotated = rotate3D(basePos.x, basePos.y, basePos.z, rotY, rotX);
      const scale = fov / (fov + rotated.z);
      
      return {
        ...career,
        projX: cx + rotated.x * scale,
        projY: cy + rotated.y * scale,
        projScale: scale,
        projZ: rotated.z
      };
    });
  };

  const projectedNodes = getProjectedNodes();

  const getCareerProgress = (career) => {
    const total = career.milestones.length;
    const completed = career.milestones.filter(m => 
      progress.completedMilestones.includes(m.id)
    ).length;
    return { completed, total, percent: total === 0 ? 0 : Math.floor((completed / total) * 100) };
  };

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

  const housingAmt = Math.round((netMonthlyPay * housingPct) / 100);
  const essentialsAmt = Math.round((netMonthlyPay * essentialsPct) / 100);
  const savingsAmt = Math.round((netMonthlyPay * savingsPct) / 100);
  const funAmt = Math.round((netMonthlyPay * funPct) / 100);

  const handleGenerateCustomRoadmap = async (e) => {
    e.preventDefault();
    if (!userSkillsInput.trim() || !targetCareerInput.trim()) return;

    playHoverSound();
    setRoadmapLoading(true);
    setRoadmapError("");
    setCustomRoadmap(null);

    try {
      const generatedPath = await generateCustomRoadmap(
        apiKey,
        userSkillsInput.trim(),
        targetCareerInput.trim()
      );
      playSuccessSound();
      setCustomRoadmap(generatedPath);
    } catch (err) {
      playErrorSound();
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

  const isLocked = progress.level < 4;

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
          <h3>System Restricted: Level 4 Required</h3>
          <p>Accessing the 3D Career Explorer Universe requires the rank of <strong>Senior Specialist</strong>.</p>
          
          <div className="progress-container">
            <div className="progress-text">
              <span>Your XP: {progress.expPoints}</span>
              <span>Required: 1,000 XP</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, (progress.expPoints / 1000) * 100)}%` }}></div>
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
    <div className="roadmap-view">
      <div className="roadmap-layout">
        
        {/* Left Side: Drag-rotatable 3D node Canvas */}
        <div className="roadmap-canvas-container glass-card">
          <div className="canvas-header-row">
            <div className="canvas-header-titles">
              <h4>Career Explorer Universe</h4>
              <p>Drag the map canvas to rotate the career path nodes in 3D. Click nodes to select.</p>
            </div>
            
            <div className="canvas-mode-controls">
              <button 
                type="button" 
                className={`mode-btn ${canvasMode === "tree" ? "active" : ""}`}
                onClick={() => setCanvasMode("tree")}
              >
                3D Explorer Map
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
            <div 
              className="canvas-viewport animate-fade"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDraggingRef.current ? "grabbing" : "grab" }}
            >
              <svg viewBox="0 0 700 450" className="roadmap-svg">
                {/* Render lines in 3D */}
                {projectedNodes.map((career) => {
                  if (career.connections) {
                    return career.connections.map((targetId) => {
                      const target = projectedNodes.find((c) => c.id === targetId);
                      if (target) {
                        return (
                          <g key={`${career.id}-${targetId}`}>
                            <line
                              x1={career.projX}
                              y1={career.projY}
                              x2={target.projX}
                              y2={target.projY}
                              stroke="var(--glass-border-hover)"
                              strokeWidth={1.5 * ((career.projScale + target.projScale) / 2)}
                              strokeDasharray="6 4"
                              className="roadmap-link-line"
                            />
                            {/* Animated data stream dot moving along line */}
                            <circle r="2" fill="var(--accent-secondary)">
                              <animateMotion
                                dur="4s"
                                repeatCount="indefinite"
                                path={`M ${career.projX} ${career.projY} L ${target.projX} ${target.projY}`}
                              />
                            </circle>
                          </g>
                        );
                      }
                      return null;
                    });
                  }
                  return null;
                })}

                {/* Render nodes sorted by depth */}
                {[...projectedNodes]
                  .sort((a, b) => b.projZ - a.projZ)
                  .map((career) => {
                    const isSelected = career.id === selectedId;
                    const { percent } = getCareerProgress(career);
                    const isNodeCompleted = percent === 100;
                    const scaleRadius = 24 * career.projScale;

                    return (
                      <g 
                        key={career.id} 
                        transform={`translate(${career.projX}, ${career.projY})`}
                        className={`roadmap-node-group ${isSelected ? "selected" : ""} ${isNodeCompleted ? "completed" : ""}`}
                        onClick={() => setSelectedId(career.id)}
                      >
                        {isSelected && (
                          <circle 
                            r={scaleRadius + 8} 
                            fill="none" 
                            stroke="var(--accent-primary)" 
                            strokeWidth="1.5" 
                            className="pulse-glow-ring"
                          />
                        )}
                        
                        <circle 
                          r={scaleRadius} 
                          className="roadmap-node-circle"
                          style={{
                            strokeWidth: 2 * career.projScale,
                          }}
                        />

                        <circle
                          r={scaleRadius}
                          fill="none"
                          stroke={isNodeCompleted ? "var(--accent-success)" : "var(--accent-secondary)"}
                          strokeWidth={2.5 * career.projScale}
                          strokeDasharray={scaleRadius * 6.28}
                          strokeDashoffset={scaleRadius * 6.28 - (scaleRadius * 6.28 * percent) / 100}
                          className="roadmap-node-progress-border"
                        />

                        <text 
                          y={scaleRadius + 16} 
                          textAnchor="middle" 
                          className="roadmap-node-text"
                          style={{ fontSize: `${Math.max(9, 11 * career.projScale)}px` }}
                        >
                          {career.title}
                        </text>

                        <text 
                          y="5" 
                          textAnchor="middle" 
                          className="roadmap-node-symbol"
                          style={{ fontSize: `${Math.max(12, 18 * career.projScale)}px` }}
                        >
                          {career.category === "Technology" ? "💻" : career.category === "Creative" ? "🎨" : "📊"}
                        </text>
                      </g>
                    );
                  })}
              </svg>
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

        {/* Right Side: Details panel */}
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

          {/* Expanded Tab Selector (Added Radar and Timeline) */}
          <div className="roadmap-tab-nav grid-layout-tabs">
            <button 
              className={`roadmap-tab-btn ${detailsTab === "milestones" ? "active" : ""}`}
              onClick={() => { playHoverSound(); setDetailsTab("milestones"); }}
            >
              <span>Study</span>
            </button>
            <button 
              className={`roadmap-tab-btn ${detailsTab === "wealth" ? "active" : ""}`}
              onClick={() => { playHoverSound(); setDetailsTab("wealth"); }}
            >
              <span>Budget</span>
            </button>
            <button 
              className={`roadmap-tab-btn ${detailsTab === "radar" ? "active" : ""}`}
              onClick={() => { playHoverSound(); setDetailsTab("radar"); }}
            >
              <span>Radar</span>
            </button>
            <button 
              className={`roadmap-tab-btn ${detailsTab === "timeline" ? "active" : ""}`}
              onClick={() => { playHoverSound(); setDetailsTab("timeline"); }}
            >
              <span>Timeline</span>
            </button>
          </div>

          {detailsTab === "milestones" && (
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
          )}

          {detailsTab === "wealth" && (
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

          {/* Interactive Skill Radar (Tab 3) */}
          {detailsTab === "radar" && (
            <div className="details-section radar-matrix-view animate-fade">
              <h5>Interactive 3D Skill Radar</h5>
              <p className="tab-desc">Holographic 3D projection of your capabilities compared against target job parameters.</p>
              
              <HolographicSkillRadarCanvas skills={selectedCareer.skills} />
            </div>
          )}

          {/* Career Timeline (Tab 4) */}
          {detailsTab === "timeline" && (
            <div className="details-section timeline-growth-view animate-fade">
              <h5>Salary Growth & Roadmaps</h5>
              
              <div className="salary-curve-graph">
                <span className="growth-lbl">Salary Curve (5 ➔ 20 Years)</span>
                {/* Visual salary curves */}
                <svg width="100%" height="60" className="svg-curve">
                  <path
                    d="M 10,50 Q 80,35 150,25 T 290,10"
                    fill="none"
                    stroke="var(--accent-success)"
                    strokeWidth="2"
                  />
                  <circle cx="10" cy="50" r="3" fill="var(--accent-success)" />
                  <circle cx="150" cy="25" r="3" fill="var(--accent-success)" />
                  <circle cx="290" cy="10" r="3" fill="var(--accent-success)" />
                </svg>
                <div className="curve-milestones-text">
                  <span>Entry: $90k</span>
                  <span>Mid: $125k</span>
                  <span>Senior: $180k+</span>
                </div>
              </div>

              <div className="milestone-draggable-timeline">
                <div className="timeline-drag-node">
                  <span className="drag-year">Year 1 - Associate</span>
                  <p>Obtain junior framework and tooling benchmarks.</p>
                </div>
                <div className="timeline-drag-node">
                  <span className="drag-year">Year 5 - Senior</span>
                  <p>Lead microservice migrations and mentor interns.</p>
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
          stroke-width: 1.5;
          stroke-dasharray: 6 4;
        }

        .roadmap-node-group {
          cursor: pointer;
        }

        .roadmap-node-circle {
          fill: var(--bg-tertiary);
          stroke: var(--glass-border);
          stroke-width: 2;
          transition: all 0.3s ease;
        }

        .roadmap-node-group:hover .roadmap-node-circle {
          fill: var(--bg-secondary);
          stroke: var(--accent-secondary);
          filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.4));
        }

        .roadmap-node-group.selected .roadmap-node-circle {
          fill: var(--bg-secondary);
          stroke: var(--accent-secondary);
        }

        .roadmap-node-progress-border {
          transform: rotate(-90deg);
          transform-origin: 0 0;
          transition: stroke-dashoffset 0.4s ease;
        }

        .roadmap-node-text {
          fill: var(--text-secondary);
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

        .legend-dot.tech { background: var(--accent-secondary); }
        .legend-dot.creative { background: var(--accent-primary); }
        .legend-dot.finance { background: var(--accent-success); }

        /* AI path builder styles */
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
          background: rgba(0, 217, 255, 0.08);
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
          box-shadow: var(--glow-primary) !important;
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
          box-shadow: var(--glow-primary);
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

        /* Right Details Panel tab grids */
        .roadmap-tab-nav.grid-layout-tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.25rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
        }

        .roadmap-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 0.45rem 0.25rem;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.725rem;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .roadmap-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.02);
        }

        .roadmap-tab-btn.active {
          color: var(--accent-secondary);
          background: rgba(0, 217, 255, 0.08);
          border-color: rgba(0, 217, 255, 0.15);
        }

        /* Skill Radar hexagonal matrix */
        .hex-radar-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .hex-cell {
          background: rgba(18, 20, 38, 0.5);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          padding: 0.85rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .hex-cell.acquired {
          border-color: rgba(57, 255, 20, 0.2);
          background: rgba(57, 255, 20, 0.03);
        }

        .hex-cell.gap {
          border-color: rgba(255, 0, 110, 0.2);
          background: rgba(255, 0, 110, 0.03);
        }

        .hex-title {
          font-size: 0.75rem;
          font-weight: 700;
          display: block;
          margin-bottom: 0.25rem;
        }

        .hex-cell.acquired .hex-title { color: var(--accent-success); }
        .hex-cell.gap .hex-title { color: var(--accent-danger); }

        .hex-status {
          font-size: 0.6rem;
          font-weight: 800;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }

        .hex-cell.acquired .hex-status { background: rgba(57, 255, 20, 0.15); color: var(--accent-success); }
        .hex-cell.gap .hex-status { background: rgba(255, 0, 110, 0.15); color: var(--accent-danger); }

        .recommended-radar-courses {
          margin-top: 1.25rem;
        }

        .recommended-radar-courses h6 {
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .mini-course-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .course-chip {
          font-size: 0.75rem;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          background: rgba(0, 217, 255, 0.08);
          border: 1px solid rgba(0, 217, 255, 0.15);
          color: var(--accent-secondary);
        }

        /* Draggable Career timeline styles */
        .salary-curve-graph {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          padding: 0.75rem;
          margin-top: 1rem;
        }

        .growth-lbl {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
        }

        .svg-curve {
          overflow: visible;
          width: 100%;
        }

        .curve-milestones-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .milestone-draggable-timeline {
          margin-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .timeline-drag-node {
          background: var(--bg-tertiary);
          border-left: 3px solid var(--accent-secondary);
          padding: 0.75rem;
          border-radius: var(--border-radius-sm);
        }

        .drag-year {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-secondary);
          display: block;
          margin-bottom: 0.15rem;
        }

        .timeline-drag-node p {
          font-size: 0.75rem;
          line-height: 1.4;
        }

        /* Right Panel core styling */
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
          border-color: rgba(57, 255, 20, 0.2);
          background: rgba(57, 255, 20, 0.03);
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
          background: rgba(0, 217, 255, 0.1);
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
          background: linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(157, 78, 221, 0.05) 100%) !important;
          border-color: rgba(0, 217, 255, 0.15) !important;
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
          accent-color: var(--accent-secondary);
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

        .animate-fade {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

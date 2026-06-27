import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { CAREER_PATHS } from "../data/mockData";
import { 
  Trophy, 
  CheckSquare, 
  TrendingUp,
  Award,
  Zap,
  Play,
  Sparkles,
  X,
  Target,
  Flame,
  Brain,
  Mic2,
  BookOpen
} from "lucide-react";
import { playHoverSound, playErrorSound, playSuccessSound } from "../services/sound";

// Custom 3D Career Universe Globe Canvas (from original)
const CareerGlobeCanvas = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, radius: 100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = 280;
      canvas.height = 280;
    };
    resize();

    const numNodes = 40;
    const nodes = [];
    const radius = 80;

    for (let i = 0; i < numNodes; i++) {
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * Math.PI * 2;
      nodes.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        color: i % 3 === 0 ? "rgba(0, 217, 255, 0.75)" : i % 3 === 1 ? "rgba(157, 78, 221, 0.75)" : "rgba(57, 255, 20, 0.75)"
      });
    }

    const rings = [
      { rx: 0.005, ry: 0.015, color: "rgba(0, 217, 255, 0.2)", radius: 85, tilt: 0.4 },
      { rx: 0.012, ry: 0.008, color: "rgba(157, 78, 221, 0.15)", radius: 95, tilt: -0.6 },
      { rx: 0.007, ry: 0.011, color: "rgba(57, 255, 20, 0.12)", radius: 105, tilt: 1.1 }
    ];

    let angleY = 0.004;
    let angleX = 0.002;

    const rotateY = (x, z, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { x: x * cos - z * sin, z: z * cos + x * sin };
    };

    const rotateX = (y, z, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { y: y * cos - z * sin, z: z * cos + y * sin };
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 160;

      rings.forEach((ring) => {
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.15) {
          let rx = Math.cos(a) * ring.radius;
          let ry = Math.sin(a) * ring.radius * Math.sin(ring.tilt);
          let rz = Math.sin(a) * ring.radius * Math.cos(ring.tilt);

          const rotY = rotateY(rx, rz, angleY * 20);
          const rotX = rotateX(ry, rotY.z, angleX * 20);

          const scale = fov / (fov + rotX.z);
          const sx = cx + rotY.x * scale;
          const sy = cy + rotX.y * scale;

          if (a === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.stroke();
      });

      const projected = [];
      nodes.forEach((node) => {
        const rotY = rotateY(node.x, node.z, angleY);
        const rotX = rotateX(node.y, rotY.z, angleX);
        
        node.x = rotY.x;
        node.y = rotX.y;
        node.z = rotX.z;

        const scale = fov / (fov + node.z);
        const sx = cx + node.x * scale;
        const sy = cy + node.y * scale;

        projected.push({ sx, sy, sz: node.z, color: node.color });
      });

      projected.sort((a, b) => b.sz - a.sz);

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].sx - projected[j].sx;
          const dy = projected[i].sy - projected[j].sy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 45) {
            ctx.strokeStyle = "rgba(0, 217, 255, 0.05)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(projected[i].sx, projected[i].sy);
            ctx.lineTo(projected[j].sx, projected[j].sy);
            ctx.stroke();
          }
        }
      }

      projected.forEach((node) => {
        ctx.shadowBlur = node.sz < 0 ? 6 : 0;
        ctx.shadowColor = node.color;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        const size = Math.max(1, ((fov - node.sz) / fov) * 3);
        ctx.arc(node.sx, node.sy, size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      const mouse = mouseRef.current;
      if (mouse.x !== null && mouse.y !== null) {
        projected.forEach((node) => {
          const dx = mouse.x - node.sx;
          const dy = mouse.y - node.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60) {
            ctx.strokeStyle = "rgba(0, 217, 255, 0.15)";
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(node.sx, node.sy);
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="globe-canvas-wrapper">
      <canvas ref={canvasRef} className="globe-canvas" />
    </div>
  );
};

// Cinematic 3D Career Hub Laboratory Animation Canvas (from original)
const CareerLabCinematicCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      if (!canvas.parentNode) return;
      const rect = canvas.parentNode.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 300;
    };
    resize();
    window.addEventListener("resize", resize);

    const dataStreamParticles = [];
    for (let i = 0; i < 30; i++) {
      dataStreamParticles.push({
        x: Math.random() * 800,
        y: Math.random() * 300,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 + 0.2,
        speedY: Math.random() * 0.2 - 0.1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const expFloaters = [];
    const spawnFloater = () => {
      const texts = ["+100 EXP", "+50 XP", "LEVEL UP!", "🔓 UNLOCKED", "ATS PASS"];
      expFloaters.push({
        x: 420 + Math.random() * 150,
        y: 180 + Math.random() * 40,
        vy: -0.5 - Math.random() * 0.5,
        text: texts[Math.floor(Math.random() * texts.length)],
        color: Math.random() < 0.5 ? "#39ff14" : "#00d9ff",
        life: 1.0,
        decay: 0.015
      });
    };

    let lastSpawn = Date.now();

    const animate = () => {
      const now = Date.now();
      if (now - lastSpawn > 1500) {
        spawnFloater();
        lastSpawn = now;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const time = now * 0.0003;
      const scale = 0.95 + Math.sin(time) * 0.1;
      const panX = Math.cos(time * 0.8) * 20;
      const panY = Math.sin(time * 0.6) * 10;

      ctx.save();
      ctx.translate(cx + panX, cy + panY);
      ctx.scale(scale, scale);
      ctx.translate(-400, -150);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, 300);
      bgGrad.addColorStop(0, "#080913");
      bgGrad.addColorStop(1, "#0f1124");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 300);

      ctx.strokeStyle = "rgba(157, 78, 221, 0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 800; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 200);
        ctx.lineTo(i + (i - 400) * 1.5, 300);
        ctx.stroke();
      }
      for (let j = 200; j <= 300; j += 15) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(800, j);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(245, 158, 11, 0.03)";
      ctx.beginPath();
      ctx.moveTo(-100, -50);
      ctx.lineTo(250, -50);
      ctx.lineTo(600, 350);
      ctx.lineTo(50, 350);
      ctx.closePath();
      ctx.fill();

      const beamGrad = ctx.createLinearGradient(0, 0, 400, 300);
      beamGrad.addColorStop(0, "rgba(0, 217, 255, 0.08)");
      beamGrad.addColorStop(0.5, "rgba(157, 78, 221, 0.04)");
      beamGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(300, 0);
      ctx.lineTo(600, 300);
      ctx.lineTo(200, 300);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00d9ff";
      ctx.strokeStyle = "rgba(0, 217, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(150, 70);
      ctx.lineTo(150, 130);
      ctx.moveTo(150, 70);
      ctx.lineTo(210, 50);
      ctx.moveTo(150, 130);
      ctx.lineTo(210, 150);
      ctx.stroke();

      const nodes = [
        { x: 100, y: 100, r: 8, col: "#00d9ff", label: "INTERN" },
        { x: 150, y: 70, r: 6, col: "#9d4edd", label: "DEV" },
        { x: 150, y: 130, r: 6, col: "#39ff14", label: "DES" },
        { x: 210, y: 50, r: 5, col: "#00d9ff", label: "AI" },
        { x: 210, y: 150, r: 5, col: "#f59e0b", label: "ARCH" }
      ];

      nodes.forEach((n) => {
        ctx.fillStyle = n.col;
        ctx.beginPath();
        const pulseR = n.r + Math.sin(now * 0.005 + n.x) * 2;
        ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "8px monospace";
        ctx.fillText(n.label, n.x - 15, n.y - 12);
      });

      ctx.shadowColor = "#9d4edd";
      ctx.strokeStyle = "rgba(157, 78, 221, 0.4)";
      ctx.fillStyle = "rgba(157, 78, 221, 0.05)";
      ctx.beginPath();
      ctx.arc(480, 100 + Math.sin(now * 0.002) * 6, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#39ff14";
      ctx.shadowColor = "#39ff14";
      ctx.beginPath();
      ctx.arc(470, 95 + Math.sin(now * 0.002) * 6, 3, 0, Math.PI * 2);
      ctx.arc(490, 95 + Math.sin(now * 0.002) * 6, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#39ff14";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(468, 108 + Math.sin(now * 0.002) * 6);
      ctx.lineTo(474, 106 + Math.sin(now * 0.01) * 3);
      ctx.lineTo(480, 110 + Math.sin(now * 0.008) * 3);
      ctx.lineTo(486, 107 + Math.sin(now * 0.012) * 4);
      ctx.lineTo(492, 109 + Math.sin(now * 0.002) * 6);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "9px monospace";
      ctx.fillText("COACH V1", 458, 62 + Math.sin(now * 0.002) * 6);

      ctx.shadowColor = "#ff006e";
      ctx.strokeStyle = "rgba(255, 0, 110, 0.35)";
      ctx.fillStyle = "rgba(255, 0, 110, 0.03)";
      ctx.save();
      ctx.translate(650, 110);
      ctx.rotate(0.1 + Math.sin(now * 0.001) * 0.05);
      ctx.beginPath();
      ctx.rect(-25, -35, 50, 70);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(-15, -25, 30, 3);
      ctx.fillRect(-15, -15, 20, 2);
      ctx.fillRect(-15, -7, 25, 2);
      ctx.fillStyle = "#ff006e";
      ctx.fillRect(-15, 2, 22, 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(-15, 11, 28, 2);
      ctx.fillRect(-15, 20, 18, 2);
      ctx.restore();

      ctx.shadowBlur = 0;

      ctx.fillStyle = "#0c0d21";
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      
      ctx.beginPath();
      ctx.moveTo(180, 260);
      ctx.lineTo(195, 175);
      ctx.arc(202, 162, 10, 0, Math.PI * 2);
      ctx.moveTo(195, 175);
      ctx.lineTo(210, 260);
      ctx.moveTo(192, 185);
      ctx.lineTo(160, 140);
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#0c0d21";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(370, 270);
      ctx.lineTo(385, 180);
      ctx.arc(388, 166, 11, 0, Math.PI * 2);
      ctx.moveTo(385, 180);
      ctx.lineTo(400, 270);
      ctx.moveTo(385, 190);
      ctx.lineTo(430, 170);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(560, 260);
      ctx.lineTo(550, 170);
      ctx.arc(548, 156, 10, 0, Math.PI * 2);
      ctx.moveTo(550, 170);
      ctx.lineTo(530, 260);
      ctx.moveTo(550, 180);
      ctx.lineTo(570, 140);
      ctx.moveTo(548, 180);
      ctx.lineTo(525, 140);
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.lineCap = "butt";

      dataStreamParticles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x > 800) p.x = 0;
        if (p.y > 300 || p.y < 0) p.y = Math.random() * 300;

        ctx.fillStyle = `rgba(0, 217, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      for (let i = expFloaters.length - 1; i >= 0; i--) {
        const f = expFloaters[i];
        f.y += f.vy;
        f.life -= f.decay;
        if (f.life <= 0) {
          expFloaters.splice(i, 1);
        } else {
          ctx.save();
          ctx.fillStyle = f.color;
          ctx.globalAlpha = f.life;
          ctx.shadowBlur = 8;
          ctx.shadowColor = f.color;
          ctx.font = "bold 9px 'Spline Sans Mono', monospace";
          ctx.fillText(f.text, f.x, f.y);
          ctx.restore();
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="career-lab-container">
      <canvas ref={canvasRef} className="career-lab-canvas" />
    </div>
  );
};

// NEW: Animated Progress Ring Component
const ProgressRing = ({ value, max = 100, label, size = 100 }) => {
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const offset = circumference - (value / max) * circumference;
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="progress-ring-container">
      <svg width={size} height={size} className="progress-ring-svg">
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 8} className="progress-ring-background" />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size / 2 - 8} 
          className="progress-ring-circle"
          style={{ strokeDashoffset: offset }}
        />
        <text x="50%" y="50%" className="progress-ring-text">{percentage}%</text>
      </svg>
      <span className="progress-ring-label">{label}</span>
    </div>
  );
};

// NEW: Achievement Badge Component with Tier System
const AchievementBadge = ({ icon: Icon, title, description, tier = "bronze", earned = false, xp = 0 }) => {
  const tierStyles = {
    bronze: { color: "#CD7F32", glow: "rgba(205, 127, 50, 0.4)" },
    silver: { color: "#C0C0C0", glow: "rgba(192, 192, 192, 0.4)" },
    gold: { color: "#FFD700", glow: "rgba(255, 215, 0, 0.4)" },
    platinum: { color: "#E5E4E2", glow: "rgba(229, 228, 226, 0.4)" }
  };

  const style = tierStyles[tier] || tierStyles.bronze;

  return (
    <div className={`achievement-badge ${earned ? "earned" : "locked"}`} style={earned ? { boxShadow: `0 0 15px ${style.glow}` } : {}}>
      <div className="achievement-icon-wrapper" style={earned ? { color: style.color } : {}}>
        <Icon size={24} />
      </div>
      <h5>{title}</h5>
      <p>{description}</p>
      {earned && <span className="achievement-xp">+{xp} XP</span>}
    </div>
  );
};

// Enhanced Dashboard Component
export default function Dashboard({ setView }) {
  const { progress, addExperiencePoints } = useContext(AppContext);
  const [activeStep, setActiveStep] = useState(0);
  const [cometPos, setCometPos] = useState({ x: -50, y: 100, active: false });
  const [activeRiddle, setActiveRiddle] = useState(null);
  const [riddleSelected, setRiddleSelected] = useState("");
  const [riddleResult, setRiddleResult] = useState(null);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const cometTimer = setInterval(() => {
      if (!activeRiddle) {
        setCometPos({
          x: -40,
          y: Math.random() * 180 + 60,
          active: true
        });

        setTimeout(() => {
          setCometPos((prev) => ({ ...prev, active: false }));
        }, 6000);
      }
    }, 18000);

    return () => clearInterval(cometTimer);
  }, [activeRiddle]);

  useEffect(() => {
    const glitchTimer = setInterval(() => {
      if (Math.random() < 0.15) {
        setGlitchActive(true);
        playErrorSound();
        setTimeout(() => {
          setGlitchActive(false);
        }, 500);
      }
    }, 20000);

    return () => clearInterval(glitchTimer);
  }, []);

  const handleCometClick = () => {
    playHoverSound();
    setCometPos((prev) => ({ ...prev, active: false }));
    const DASHBOARD_RIDDLES = [
      { q: "What is the average lookup time of a Hash Map?", a: "O(1)", options: ["O(N)", "O(1)", "O(log N)", "O(N log N)"] },
      { q: "Which CSS display type organizes items dynamically in flex directions?", a: "flex", options: ["block", "grid", "inline", "flex"] },
      { q: "Which HTTP status code represents 'Unauthorized access'?", a: "401", options: ["400", "401", "403", "404"] },
      { q: "What React hook caches expensive computational results?", a: "useMemo", options: ["useEffect", "useCallback", "useMemo", "useRef"] },
      { q: "In ML, what prevents model overfitting?", a: "Regularization", options: ["Learning Rate", "Backpropagation", "Regularization", "Gradient Descent"] }
    ];
    const idx = Math.floor(Math.random() * DASHBOARD_RIDDLES.length);
    setActiveRiddle(DASHBOARD_RIDDLES[idx]);
    setRiddleSelected("");
    setRiddleResult(null);
  };

  const handleRiddleAnswer = (option) => {
    setRiddleSelected(option);
    if (option === activeRiddle.a) {
      playSuccessSound();
      addExperiencePoints(50);
      setRiddleResult("correct");
    } else {
      playErrorSound();
      setRiddleResult("incorrect");
    }
    
    setTimeout(() => {
      setActiveRiddle(null);
      setRiddleSelected("");
      setRiddleResult(null);
    }, 1600);
  };

  const totalMilestones = CAREER_PATHS.reduce((acc, curr) => acc + curr.milestones.length, 0);
  const completedCount = progress.completedMilestones.length;
  const milestonesPercent = totalMilestones === 0 ? 0 : Math.floor((completedCount / totalMilestones) * 100);
  const rolesUnlocked = progress.completedRpgs.length;
  const interviewsCompleted = Object.values(progress.interviewScores).reduce((acc, curr) => acc + curr.length, 0);

  const chartPoints = progress.scoreHistory || [];
  const chartHeight = 120;
  const chartWidth = 400;
  const padding = 20;

  const getCoordinates = () => {
    if (chartPoints.length < 2) return "";
    const xStep = (chartWidth - padding * 2) / (chartPoints.length - 1);
    return chartPoints.map((pt, i) => {
      const x = padding + i * xStep;
      const y = chartHeight - padding - (pt.score / 100) * (chartHeight - padding * 2);
      return `${x},${y}`;
    }).join(" ");
  };

  const polylinePoints = getCoordinates();

  const getAreaCoordinates = () => {
    if (chartPoints.length < 2) return "";
    const firstX = padding;
    const lastX = padding + (chartPoints.length - 1) * ((chartWidth - padding * 2) / (chartPoints.length - 1));
    const baseY = chartHeight - padding;
    return `${firstX},${baseY} ${polylinePoints} ${lastX},${baseY}`;
  };

  const areaPoints = getAreaCoordinates();

  const wizardSteps = [
    {
      title: "Explore Career Roadmap",
      desc: "Select a job node in the Career Explorer, mark study checkpoints to earn XP, and simulate net salaries.",
      actionLabel: "Go to Career Explorer",
      targetView: "roadmap",
      icon: Target
    },
    {
      title: "Scan Resume & Visual Diff",
      desc: "Paste your resume and target job. View an ATS score and toggle the Visual Diff tab to inspect inline additions/deletions.",
      actionLabel: "Go to Resume Critique",
      targetView: "resume",
      icon: BookOpen
    },
    {
      title: "Practice Voice Interview",
      desc: "Select a role and chat with the AI. Toggle Voice Read-Aloud to hear questions spoken with a pulsing audio visualizer.",
      actionLabel: "Start Voice Interview",
      targetView: "interview",
      icon: Mic2
    }
  ];

  const achievements = [
    { icon: BookOpen, title: "Knowledge Seeker", desc: "Complete 5 roadmaps", tier: "gold", earned: true, xp: 100 },
    { icon: Flame, title: "Quick Starter", desc: "Start career path", tier: "bronze", earned: true, xp: 25 },
    { icon: Brain, title: "Skill Master", desc: "Max 3 skills", tier: "silver", earned: true, xp: 75 },
    { icon: Trophy, title: "Interview Champion", desc: "Score 95%+", tier: "platinum", earned: false, xp: 200 },
    { icon: Award, title: "Career Architect", desc: "Complete all paths", tier: "gold", earned: false, xp: 500 },
  ];

  return (
    <div className={`dashboard-view-enhanced ${glitchActive ? "glitch-shake" : ""}`}>
      {/* HERO LEVEL CARD */}
      <div className="hero-section glass-card">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">LEVEL {progress.userLevel || 1}</span>
            <h1>Ready to launch your career?</h1>
            <p>You're on a quest to master your career path. Unlock skills, ace interviews, and level up your resume.</p>
            <div className="hero-stats-mini">
              <div className="hero-stat">
                <span className="stat-num">{progress.expPoints || 0}</span>
                <span className="stat-txt">XP Earned</span>
              </div>
              <div className="hero-stat">
                <span className="stat-num">{completedCount}/{totalMilestones}</span>
                <span className="stat-txt">Milestones</span>
              </div>
              <div className="hero-stat">
                <span className="stat-num">{interviewsCompleted}</span>
                <span className="stat-txt">Interviews</span>
              </div>
            </div>
          </div>
          <CareerGlobeCanvas />
        </div>

        <div className="hero-xp-bar-section">
          <div className="xp-label">
            <h4>Current Level Progress</h4>
            <span className="xp-points">{progress.expPoints || 0} / 5000 XP</span>
          </div>
          <div className="xp-bar-wrapper">
            <div className="xp-bar-fill" style={{ width: `${((progress.expPoints || 0) % 5000) / 50}%` }} />
          </div>
        </div>
      </div>

      {/* Cinematic Lab Canvas */}
      <CareerLabCinematicCanvas />

      {/* ENHANCED QUICK START WIZARD */}
      <div className="wizard-enhanced glass-card">
        <div className="wizard-title-section">
          <Award size={20} className="wizard-title-icon" />
          <h3>Your Onboarding Quest</h3>
          <p>Complete these 3 steps to master PathFinder AI</p>
        </div>

        <div className="wizard-steps-container">
          {wizardSteps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            const Icon = step.icon;

            return (
              <button
                key={idx}
                className={`wizard-step-card ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                onClick={() => { playHoverSound(); setActiveStep(idx); }}
              >
                <div className="step-card-icon">
                  {isCompleted ? <CheckSquare size={24} /> : <Icon size={24} />}
                </div>
                <div className="step-card-content">
                  <h5>Step {idx + 1}</h5>
                  <p>{step.title}</p>
                </div>
                <div className="step-card-arrow">
                  <Play size={16} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="wizard-detail-section glass-card">
          <h4>{wizardSteps[activeStep].title}</h4>
          <p>{wizardSteps[activeStep].desc}</p>
          <button 
            className="btn btn-cyan btn-full"
            onClick={() => { playHoverSound(); setView(wizardSteps[activeStep].targetView); }}
          >
            <span>{wizardSteps[activeStep].actionLabel}</span>
            <Play size={14} />
          </button>
        </div>
      </div>

      {/* PROGRESS RINGS & STATS */}
      <div className="progress-section">
        <div className="progress-rings-grid">
          <ProgressRing value={completedCount} max={totalMilestones} label="Milestones" size={110} />
          <ProgressRing value={interviewsCompleted} max={10} label="Interviews" size={110} />
          <ProgressRing value={rolesUnlocked} max={15} label="Roles Explored" size={110} />
          <ProgressRing value={Math.min((progress.expPoints || 0) / 50, 100)} max={100} label="Level Up" size={110} />
        </div>
      </div>

      {/* PERFORMANCE CHART + QUICK ACTIONS */}
      <div className="dashboard-bottom-grid grid-2">
        <div className="chart-card glass-card">
          <div className="chart-header">
            <TrendingUp size={18} className="chart-icon" />
            <h4>Performance Timeline</h4>
          </div>
          
          <div className="chart-container">
            {chartPoints.length > 0 ? (
              <div className="svg-wrapper">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
                  <defs>
                    <linearGradient id="chartGradientEnhanced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#00d9ff" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(0,217,255,0.1)" strokeWidth="0.5" />
                  <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(0,217,255,0.1)" strokeWidth="0.5" />
                  <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(0,217,255,0.1)" strokeWidth="0.5" />

                  {areaPoints && <polygon points={areaPoints} fill="url(#chartGradientEnhanced)" />}

                  {polylinePoints && (
                    <polyline
                      fill="none"
                      stroke="#00d9ff"
                      strokeWidth="2.5"
                      points={polylinePoints}
                    />
                  )}

                  {chartPoints.map((pt, i) => {
                    const xStep = (chartWidth - padding * 2) / (chartPoints.length - 1);
                    const x = padding + i * xStep;
                    const y = chartHeight - padding - (pt.score / 100) * (chartHeight - padding * 2);
                    return (
                      <circle key={i} cx={x} cy={y} r="4" fill="#00d9ff" stroke="#121222" strokeWidth="1.5" />
                    );
                  })}
                </svg>
              </div>
            ) : (
              <p className="no-data">No interview data yet. Start practicing to see your progress!</p>
            )}
          </div>
        </div>

        <div className="feature-cards-grid">
          <button className="feature-cta glass-card" onClick={() => { playHoverSound(); setView("roadmap"); }}>
            <Target className="feature-icon" />
            <h5>Career Explorer</h5>
            <p>{rolesUnlocked} roles mapped</p>
          </button>

          <button className="feature-cta glass-card" onClick={() => { playHoverSound(); setView("resume"); }}>
            <BookOpen className="feature-icon" />
            <h5>Resume Genius</h5>
            <p>ATS Score: 92%</p>
          </button>

          <button className="feature-cta glass-card" onClick={() => { playHoverSound(); setView("interview"); }}>
            <Mic2 className="feature-icon" />
            <h5>Interview Sandbox</h5>
            <p>{interviewsCompleted} completed</p>
          </button>

          <button className="feature-cta glass-card" onClick={() => { playHoverSound(); setView("roadmap"); }}>
            <Brain className="feature-icon" />
            <h5>Skill Tree</h5>
            <p>24 skills available</p>
          </button>
        </div>
      </div>

      {/* ACHIEVEMENTS SHOWCASE */}
      <div className="achievements-showcase glass-card">
        <div className="achievements-header">
          <Trophy size={20} className="achievements-icon" />
          <h3>Your Achievements</h3>
          <span className="achievement-count">{achievements.filter(a => a.earned).length}/5 Unlocked</span>
        </div>

        <div className="achievements-grid">
          {achievements.map((ach, i) => (
            <AchievementBadge key={i} {...ach} />
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-view-enhanced {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-section {
          background: linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(157, 78, 221, 0.08) 100%) !important;
          border-color: rgba(0, 217, 255, 0.3) !important;
          overflow: hidden;
          position: relative;
        }

        .hero-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .hero-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .hero-badge {
          display: inline-block;
          width: fit-content;
          background: rgba(0, 217, 255, 0.2);
          border: 1px solid rgba(0, 217, 255, 0.4);
          color: #00d9ff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero-text h1 {
          font-size: 2rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(135deg, #00d9ff, #9d4edd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-text p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .hero-stats-mini {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-num {
          font-size: 1.5rem;
          font-weight: 900;
          color: #00d9ff;
        }

        .stat-txt {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .hero-xp-bar-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(0, 217, 255, 0.1);
        }

        .xp-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .xp-label h4 {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .xp-points {
          font-size: 0.85rem;
          color: #00d9ff;
          font-weight: 700;
        }

        .xp-bar-wrapper {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(0, 217, 255, 0.2);
        }

        .xp-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #00d9ff, #9d4edd);
          transition: width 0.6s ease-out;
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.6);
        }

        .wizard-enhanced {
          background: rgba(18, 20, 38, 0.5) !important;
          border-color: rgba(157, 78, 221, 0.2) !important;
        }

        .wizard-title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 217, 255, 0.1);
        }

        .wizard-title-icon {
          color: #9d4edd;
        }

        .wizard-title-section h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .wizard-title-section p {
          margin: 0 0 0 auto;
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .wizard-steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .wizard-step-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(0, 217, 255, 0.15);
          padding: 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .wizard-step-card:hover {
          background: rgba(0, 217, 255, 0.08);
          border-color: rgba(0, 217, 255, 0.3);
          transform: translateY(-2px);
        }

        .wizard-step-card.active {
          background: rgba(0, 217, 255, 0.1);
          border-color: rgba(0, 217, 255, 0.5);
          box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
        }

        .wizard-step-card.completed {
          background: rgba(57, 255, 20, 0.08);
          border-color: rgba(57, 255, 20, 0.3);
        }

        .step-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 217, 255, 0.15);
          color: #00d9ff;
          flex-shrink: 0;
        }

        .wizard-step-card.completed .step-card-icon {
          background: rgba(57, 255, 20, 0.15);
          color: #39ff14;
        }

        .step-card-content {
          flex: 1;
        }

        .step-card-content h5 {
          margin: 0 0 0.25rem 0;
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .step-card-content p {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .step-card-arrow {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 217, 255, 0.1);
          color: #00d9ff;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .wizard-step-card:hover .step-card-arrow {
          background: rgba(0, 217, 255, 0.3);
          transform: translateX(3px);
        }

        .wizard-detail-section {
          background: rgba(10, 11, 18, 0.6) !important;
          border-color: rgba(0, 217, 255, 0.15) !important;
          padding: 1.5rem !important;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .wizard-detail-section h4 {
          margin: 0;
          font-size: 1.1rem;
        }

        .wizard-detail-section p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .btn-full {
          width: 100%;
        }

        .progress-section {
          display: flex;
          justify-content: center;
        }

        .progress-rings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 2rem;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .progress-ring-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .progress-ring-svg {
          filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.2));
        }

        .progress-ring-background {
          fill: none;
          stroke: rgba(0, 217, 255, 0.1);
          stroke-width: 8;
        }

        .progress-ring-circle {
          fill: none;
          stroke: #00d9ff;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.6s ease;
        }

        .progress-ring-text {
          text-anchor: middle;
          dominant-baseline: middle;
          font-size: 18px;
          font-weight: 800;
          fill: #00d9ff;
        }

        .progress-ring-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
        }

        .dashboard-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .dashboard-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chart-icon {
          color: #00d9ff;
        }

        .chart-container {
          min-height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .svg-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .svg-chart {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .no-data {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-align: center;
        }

        .feature-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .feature-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .feature-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1.25rem !important;
          border-color: rgba(0, 217, 255, 0.15) !important;
          cursor: pointer;
          transition: all 0.3s ease;
          gap: 0.5rem;
        }

        .feature-cta:hover {
          background: rgba(0, 217, 255, 0.08) !important;
          border-color: rgba(0, 217, 255, 0.4) !important;
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 217, 255, 0.15);
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          color: #00d9ff;
        }

        .feature-cta h5 {
          margin: 0;
          font-size: 0.95rem;
        }

        .feature-cta p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .achievements-showcase {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(157, 78, 221, 0.08) 100%) !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
        }

        .achievements-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 215, 0, 0.1);
        }

        .achievements-icon {
          color: #FFD700;
        }

        .achievement-count {
          margin-left: auto;
          background: rgba(255, 215, 0, 0.1);
          color: #FFD700;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.6rem;
          border-radius: 0.4rem;
          text-transform: uppercase;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .achievement-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 215, 0, 0.15);
          border-radius: 0.75rem;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .achievement-badge.earned {
          background: rgba(255, 215, 0, 0.08);
          border-color: rgba(255, 215, 0, 0.3);
        }

        .achievement-badge.locked {
          opacity: 0.5;
        }

        .achievement-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 215, 0, 0.1);
          color: rgba(255, 255, 255, 0.5);
        }

        .achievement-badge.earned .achievement-icon-wrapper {
          background: rgba(255, 215, 0, 0.15);
        }

        .achievement-badge h5 {
          margin: 0;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .achievement-badge p {
          margin: 0;
          font-size: 0.7rem;
          color: var(--text-secondary);
          line-height: 1.3;
        }

        .achievement-xp {
          font-size: 0.7rem;
          color: var(--accent-lime);
          font-weight: 700;
          text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            gap: 1rem;
          }

          .hero-text h1 {
            font-size: 1.5rem;
          }

          .wizard-steps-container {
            grid-template-columns: 1fr;
          }

          .progress-rings-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            max-width: 100%;
          }
        }

        .glowing-comet-star {
          position: fixed;
          left: -40px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00d9ff, #ff006e);
          border: 1px solid var(--accent-pink);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 0 20px #ff006e;
          animation: flyComet 6s linear forwards;
        }

        @keyframes flyComet {
          from { left: -40px; transform: rotate(0deg); }
          to { left: 100%; transform: rotate(360deg); }
        }

        .comet-tooltip {
          position: absolute;
          bottom: -25px;
          font-size: 0.55rem;
          font-weight: 800;
          color: var(--accent-primary);
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-shadow: 0 0 4px #000;
        }

        .riddle-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 200;
          background: rgba(10, 14, 39, 0.75) !important;
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .riddle-modal-content {
          max-width: 440px;
          width: 90%;
          padding: 2rem !important;
          background: rgba(18, 20, 38, 0.9) !important;
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 25px rgba(0, 217, 255, 0.25);
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalPop {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .riddle-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .riddle-header h4 {
          font-size: 1.2rem;
          color: var(--text-primary);
        }

        .riddle-question {
          font-size: 0.95rem;
          line-height: 1.45;
          color: var(--text-secondary);
        }

        .riddle-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .riddle-opt-btn {
          padding: 0.6rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          border-radius: var(--border-radius-md);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .riddle-opt-btn:hover {
          border-color: var(--accent-primary);
          background: rgba(0, 217, 255, 0.05);
        }

        .riddle-opt-btn.correct {
          background: rgba(57, 255, 20, 0.1) !important;
          border-color: var(--accent-lime) !important;
          color: var(--accent-lime);
        }

        .riddle-opt-btn.incorrect {
          background: rgba(255, 0, 110, 0.1) !important;
          border-color: var(--accent-pink) !important;
          color: var(--accent-pink);
        }

        .riddle-feedback {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .riddle-feedback.correct { color: var(--accent-lime); }
        .riddle-feedback.incorrect { color: var(--accent-pink); }

        .glitch-shake {
          animation: glitchShake 0.15s ease infinite;
          filter: hue-rotate(90deg) invert(1) contrast(1.5);
        }

        @keyframes glitchShake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-3px, 2px); }
          50% { transform: translate(2px, -3px); }
          75% { transform: translate(-2px, -2px); }
        }
      `}</style>

      {/* XP METEOR FLYING COMET */}
      {cometPos.active && (
        <button 
          className="glowing-comet-star" 
          style={{ top: `${cometPos.y}px` }}
          onClick={handleCometClick}
        >
          <Sparkles size={14} className="text-white animate-pulse" />
          <span className="comet-tooltip">XP Comet! Click!</span>
        </button>
      )}

      {/* QUICK RIDDLE MODAL */}
      {activeRiddle && (
        <div className="riddle-modal-backdrop glass-card">
          <div className="riddle-modal-content glass-card">
            <div className="riddle-header">
              <Sparkles className="riddle-icon text-cyan animate-pulse" size={20} />
              <h4>Cosmic Tech Riddle</h4>
            </div>
            
            <p className="riddle-question">{activeRiddle.q}</p>
            
            <div className="riddle-options-grid">
              {activeRiddle.options.map((opt) => {
                const isSelected = riddleSelected === opt;
                let optClass = "";
                if (isSelected) {
                  optClass = riddleResult === "correct" ? "correct" : "incorrect";
                }
                return (
                  <button
                    key={opt}
                    className={`riddle-opt-btn ${optClass}`}
                    onClick={() => handleRiddleAnswer(opt)}
                    disabled={!!riddleSelected}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {riddleResult && (
              <div className={`riddle-feedback ${riddleResult}`}>
                {riddleResult === "correct" ? "Correct! +50 XP" : "Wrong answer! Better luck next time."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
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
  X
} from "lucide-react";
import { playHoverSound, playErrorSound, playSuccessSound } from "../services/sound";

// Custom 3D Career Universe Globe Canvas
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

    // Generate 3D nodes on a sphere
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

    // Generate rotating orbit rings representing Tech, Finance, Creative
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

      // Draw Orbit Rings
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

      // Update and Draw Nodes
      const projected = [];
      nodes.forEach((node) => {
        // Rotate
        const rotY = rotateY(node.x, node.z, angleY);
        const rotX = rotateX(node.y, rotY.z, angleX);
        
        node.x = rotY.x;
        node.y = rotX.y;
        node.z = rotX.z;

        // Project
        const scale = fov / (fov + node.z);
        const sx = cx + node.x * scale;
        const sy = cy + node.y * scale;

        projected.push({ sx, sy, sz: node.z, color: node.color });
      });

      // Sort by depth (painters algorithm)
      projected.sort((a, b) => b.sz - a.sz);

      // Connect close nodes in 3D perspective space
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

      // Draw projected nodes
      projected.forEach((node) => {
        ctx.shadowBlur = node.sz < 0 ? 6 : 0;
        ctx.shadowColor = node.color;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        const size = Math.max(1, ((fov - node.sz) / fov) * 3);
        ctx.arc(node.sx, node.sy, size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0; // reset

      // Mouse interactivity data streams
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
      <style>{`
        .globe-canvas-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .globe-canvas {
          background: transparent;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

// Cinematic 3D Career Hub Laboratory Animation Canvas
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

    // Particle streams
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

    // EXP Floaters
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

      // Slow epic camera zoom/pan cycle
      const time = now * 0.0003;
      const scale = 0.95 + Math.sin(time) * 0.1;
      const panX = Math.cos(time * 0.8) * 20;
      const panY = Math.sin(time * 0.6) * 10;

      ctx.save();
      ctx.translate(cx + panX, cy + panY);
      ctx.scale(scale, scale);
      ctx.translate(-400, -150); // Center local coordinates on 800x300 canvas box

      // 1. Classroom Lab Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 300);
      bgGrad.addColorStop(0, "#080913");
      bgGrad.addColorStop(1, "#0f1124");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 300);

      // Perspective grid floor
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

      // 2. Volumetric Window Sunlight (Golden Rays)
      ctx.fillStyle = "rgba(245, 158, 11, 0.03)";
      ctx.beginPath();
      ctx.moveTo(-100, -50);
      ctx.lineTo(250, -50);
      ctx.lineTo(600, 350);
      ctx.lineTo(50, 350);
      ctx.closePath();
      ctx.fill();

      // Additional bright neon beams
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

      // 3. Draw Floating Holograms (Teal, Purple, Gold)
      // Hologram 1: Career Roadmap Node Tree (Left)
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

      // Hologram 2: Interview Coach Robot Avatar (Center-Right)
      ctx.shadowColor = "#9d4edd";
      ctx.strokeStyle = "rgba(157, 78, 221, 0.4)";
      ctx.fillStyle = "rgba(157, 78, 221, 0.05)";
      ctx.beginPath();
      ctx.arc(480, 100 + Math.sin(now * 0.002) * 6, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Robot eyes
      ctx.fillStyle = "#39ff14";
      ctx.shadowColor = "#39ff14";
      ctx.beginPath();
      ctx.arc(470, 95 + Math.sin(now * 0.002) * 6, 3, 0, Math.PI * 2);
      ctx.arc(490, 95 + Math.sin(now * 0.002) * 6, 3, 0, Math.PI * 2);
      ctx.fill();

      // Robot mouth/pulse line
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

      // Hologram 3: ATS Resume Hologram (Right)
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
      // Resume lines
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(-15, -25, 30, 3);
      ctx.fillRect(-15, -15, 20, 2);
      ctx.fillRect(-15, -7, 25, 2);
      ctx.fillStyle = "#ff006e"; // warning area
      ctx.fillRect(-15, 2, 22, 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(-15, 11, 28, 2);
      ctx.fillRect(-15, 20, 18, 2);
      ctx.restore();

      ctx.shadowBlur = 0; // reset shadow

      // 4. Draw Teenager Silhouettes (Excited, pointing)
      ctx.fillStyle = "#0c0d21";
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      
      // Teenager 1 (Left - Pointing)
      ctx.beginPath();
      ctx.moveTo(180, 260); // feet
      ctx.lineTo(195, 175); // torso
      ctx.arc(202, 162, 10, 0, Math.PI * 2); // hoodie head
      ctx.moveTo(195, 175);
      ctx.lineTo(210, 260); // other leg
      // Pointing arm
      ctx.moveTo(192, 185);
      ctx.lineTo(160, 140); // arm pointing to node
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#0c0d21";
      ctx.stroke();

      // Teenager 2 (Center - Active using AI Sandbox)
      ctx.beginPath();
      ctx.moveTo(370, 270);
      ctx.lineTo(385, 180);
      ctx.arc(388, 166, 11, 0, Math.PI * 2); // head
      ctx.moveTo(385, 180);
      ctx.lineTo(400, 270);
      // Arm gesturing/reaching to Robot Coach
      ctx.moveTo(385, 190);
      ctx.lineTo(430, 170);
      ctx.stroke();

      // Teenager 3 (Right - Celebrating)
      ctx.beginPath();
      ctx.moveTo(560, 260);
      ctx.lineTo(550, 170);
      ctx.arc(548, 156, 10, 0, Math.PI * 2); // head
      ctx.moveTo(550, 170);
      ctx.lineTo(530, 260);
      // Both arms up in celebration!
      ctx.moveTo(550, 180);
      ctx.lineTo(570, 140);
      ctx.moveTo(548, 180);
      ctx.lineTo(525, 140);
      ctx.stroke();

      // Reset style settings
      ctx.lineWidth = 1;
      ctx.lineCap = "butt";

      // 5. Data visualization particles & comets
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

      // 6. EXP floaters updates
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
      <style>{`
        .career-lab-container {
          position: relative;
          width: 100%;
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          background: #080913;
          border: 1px solid var(--glass-border);
          box-shadow: 0 0 25px rgba(157, 78, 221, 0.15);
          height: 300px;
          margin-bottom: 1.5rem;
        }
        .career-lab-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default function Dashboard({ setView }) {
  const { progress, addExperiencePoints } = useContext(AppContext);
  const [activeStep, setActiveStep] = useState(0);

  // Comet & Riddle states
  const [cometPos, setCometPos] = useState({ x: -50, y: 100, active: false });
  const [activeRiddle, setActiveRiddle] = useState(null);
  const [riddleSelected, setRiddleSelected] = useState("");
  const [riddleResult, setRiddleResult] = useState(null);

  // Glitch Storm state
  const [glitchActive, setGlitchActive] = useState(false);

  // Comet spawning cycle
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

  // Glitch Storm spawning cycle
  useEffect(() => {
    const glitchTimer = setInterval(() => {
      if (Math.random() < 0.15) {
        setGlitchActive(true);
        playErrorSound(); // glitch sound
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

  // Stats calculators
  const totalMilestones = CAREER_PATHS.reduce((acc, curr) => acc + curr.milestones.length, 0);
  const completedCount = progress.completedMilestones.length;
  const milestonesPercent = totalMilestones === 0 
    ? 0 
    : Math.floor((completedCount / totalMilestones) * 100);

  const rolesUnlocked = progress.completedRpgs.length;
  const interviewsCompleted = Object.values(progress.interviewScores).reduce(
    (acc, curr) => acc + curr.length, 0
  );

  const chartPoints = progress.scoreHistory || [];
  const chartHeight = 120;
  const chartWidth = 400;
  const padding = 20;

  // Generate SVG coordinates for scores
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
      targetView: "roadmap"
    },
    {
      title: "Scan Resume & Visual Diff",
      desc: "Paste your resume and target job. View an ATS score and toggle the Visual Diff tab to inspect inline additions/deletions.",
      actionLabel: "Go to Resume Critique",
      targetView: "resume"
    },
    {
      title: "Practice Voice Interview",
      desc: "Select a role and chat with the AI. Toggle Voice Read-Aloud to hear questions spoken with a pulsing audio visualizer.",
      actionLabel: "Start Voice Interview",
      targetView: "interview"
    }
  ];

  return (
    <div className={`dashboard-view ${glitchActive ? "glitch-shake" : ""}`}>
      {/* Welcome Banner featuring 3D Career Globe */}
      <div className="welcome-banner glass-card pulse-glow">
        <div className="welcome-text">
          <h2 className="gradient-text-accent">Ready to launch your career?</h2>
          <p>Complete milestones, practice live interviews, and optimize your resume to gain XP and unlock new ranks.</p>
          <div className="xp-inline-counter">
            <Zap size={16} className="xp-inline-icon" />
            <span>{progress.expPoints} EXP Accumulated</span>
          </div>
        </div>
        
        {/* WebGL Particle Globe */}
        <CareerGlobeCanvas />
      </div>

      {/* Cinematic 3D Career Hub Laboratory Banner */}
      <CareerLabCinematicCanvas />

      {/* Quick Start Stepper Wizard */}
      <div className="quick-start-wizard glass-card">
        <div className="wizard-header">
          <Award size={18} className="wizard-icon" />
          <h4>Interactive Onboarding Stepper</h4>
        </div>
        
        <div className="wizard-stepper-row">
          {wizardSteps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            return (
              <React.Fragment key={idx}>
                <button
                  type="button"
                  className={`step-indicator-btn ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                  onClick={() => { playHoverSound(); setActiveStep(idx); }}
                >
                  <span className="step-num">{isCompleted ? "✓" : idx + 1}</span>
                  <span className="step-label">{step.title.split(" ")[0]}..</span>
                </button>
                {idx < wizardSteps.length - 1 && (
                  <div className={`step-line ${idx < activeStep ? "completed" : ""}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="wizard-step-body glass-card">
          <div className="wizard-body-content">
            <h5>Step {activeStep + 1}: {wizardSteps[activeStep].title}</h5>
            <p>{wizardSteps[activeStep].desc}</p>
          </div>
          <button 
            type="button" 
            className="btn btn-cyan btn-wizard-action"
            onClick={() => { playHoverSound(); setView(wizardSteps[activeStep].targetView); }}
          >
            <span>{wizardSteps[activeStep].actionLabel}</span>
            <Play size={14} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid grid-3">
        <div className="stat-card glass-card">
          <div className="stat-icon-container bg-indigo">
            <CheckSquare className="stat-icon text-indigo" />
          </div>
          <div className="stat-data">
            <span className="stat-value">{completedCount}/{totalMilestones}</span>
            <span className="stat-label">Milestones Completed ({milestonesPercent}%)</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-container bg-cyan">
            <Trophy className="stat-icon text-cyan" />
          </div>
          <div className="stat-data">
            <span className="stat-value">{interviewsCompleted}</span>
            <span className="stat-label">Interviews Conducted</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-container bg-purple">
            <Award className="stat-icon text-purple" />
          </div>
          <div className="stat-data">
            <span className="stat-value">{rolesUnlocked}</span>
            <span className="stat-label">RPG Roles Experienced</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts grid-2">
        <div className="chart-card glass-card">
          <div className="chart-header">
            <TrendingUp size={18} className="chart-header-icon" />
            <h4>Performance History</h4>
          </div>
          
          <div className="chart-container">
            {chartPoints.length > 0 ? (
              <div className="svg-wrapper">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="var(--glass-border)" strokeWidth="0.5" />
                  <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="var(--glass-border)" strokeWidth="0.5" />
                  <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="var(--glass-border)" strokeWidth="0.5" />

                  {/* Filled Area */}
                  {areaPoints && <polygon points={areaPoints} fill="url(#chartGradient)" />}

                  {/* Line */}
                  {polylinePoints && (
                    <polyline
                      fill="none"
                      stroke="var(--accent-secondary)"
                      strokeWidth="2.5"
                      points={polylinePoints}
                    />
                  )}

                  {/* Data Points */}
                  {chartPoints.map((pt, i) => {
                    const xStep = (chartWidth - padding * 2) / (chartPoints.length - 1);
                    const x = padding + i * xStep;
                    const y = chartHeight - padding - (pt.score / 100) * (chartHeight - padding * 2);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="var(--accent-secondary)"
                        stroke="var(--bg-secondary)"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>
                <div className="chart-labels">
                  {chartPoints.map((pt, i) => (
                    <div key={i} className="chart-label-item">
                      <span className="lbl-date">{pt.date}</span>
                      <span className="lbl-score">{pt.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="no-data">No performance scores logged yet. Start an interview to see data!</p>
            )}
          </div>
        </div>

        <div className="quick-actions-card glass-card">
          <h4>Launchpad Tasks</h4>
          <div className="actions-list">
            <button className="action-row" onClick={() => { playHoverSound(); setView("roadmap"); }}>
              <div className="action-text">
                <h5>Roadmap Exploration</h5>
                <p>Complete learning milestones and build skills.</p>
              </div>
              <TrendingUp size={18} className="row-arrow" />
            </button>

            <button className="action-row" onClick={() => { playHoverSound(); setView("interview"); }}>
              <div className="action-text">
                <h5>Interview Sandbox</h5>
                <p>Practice live interviews and get detailed grades.</p>
              </div>
              <TrendingUp size={18} className="row-arrow" />
            </button>

            <button className="action-row" onClick={() => { playHoverSound(); setView("resume"); }}>
              <div className="action-text">
                <h5>Resume Critique</h5>
                <p>Check your compatibility scorecard against jobs.</p>
              </div>
              <TrendingUp size={18} className="row-arrow" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .welcome-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem !important;
          background: linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(0, 217, 255, 0.1) 100%) !important;
          border-color: rgba(0, 217, 255, 0.25) !important;
        }

        .welcome-text h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .welcome-text p {
          max-width: 500px;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }

        .xp-inline-counter {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          padding: 0.45rem 1rem;
          border-radius: var(--border-radius-md);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-secondary);
        }

        .xp-inline-icon {
          color: var(--accent-warning);
        }

        /* Stepper Wizard Styling */
        .quick-start-wizard {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: rgba(18, 20, 34, 0.4) !important;
          border-color: rgba(0, 217, 255, 0.15) !important;
        }

        .wizard-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.5rem;
        }

        .wizard-icon {
          color: var(--accent-secondary);
        }

        .wizard-stepper-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          gap: 0.5rem;
        }

        .step-indicator-btn {
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.3s ease;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .step-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--glass-border);
          background: var(--bg-tertiary);
          font-size: 0.75rem;
          transition: all 0.3s ease;
        }

        .step-indicator-btn:hover {
          color: var(--text-primary);
        }

        .step-indicator-btn.active {
          color: var(--accent-secondary);
        }

        .step-indicator-btn.active .step-num {
          border-color: var(--accent-secondary);
          background: rgba(0, 217, 255, 0.1);
          box-shadow: var(--glow-primary);
        }

        .step-indicator-btn.completed {
          color: var(--accent-success);
        }

        .step-indicator-btn.completed .step-num {
          border-color: var(--accent-success);
          background: rgba(57, 255, 20, 0.1);
          color: var(--accent-success);
        }

        .step-line {
          flex-grow: 1;
          height: 2px;
          background: var(--glass-border);
          transition: background 0.3s ease;
        }

        .step-line.completed {
          background: var(--accent-success);
        }

        .wizard-step-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem !important;
          background: rgba(10, 11, 18, 0.6) !important;
          border-color: var(--glass-border) !important;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .wizard-step-body {
            flex-direction: column;
            text-align: center;
          }
        }

        .wizard-body-content h5 {
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .wizard-body-content p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .btn-wizard-action {
          flex-shrink: 0;
          font-size: 0.85rem;
          padding: 0.65rem 1.25rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .stat-icon-container {
          width: 50px;
          height: 50px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon-container.bg-indigo { background: rgba(157, 78, 221, 0.1); }
        .stat-icon-container.bg-cyan { background: rgba(0, 217, 255, 0.1); }
        .stat-icon-container.bg-purple { background: rgba(157, 78, 221, 0.1); }

        .stat-icon.text-indigo { color: var(--accent-primary); }
        .stat-icon.text-cyan { color: var(--accent-secondary); }
        .stat-icon.text-purple { color: var(--accent-purple); }

        .stat-data {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
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

        .chart-header-icon {
          color: var(--accent-secondary);
        }

        .chart-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 160px;
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

        .chart-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 5px;
        }

        .chart-label-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .lbl-date {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .lbl-score {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-secondary);
        }

        .no-data {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-align: center;
        }

        .quick-actions-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          padding: 0.85rem 1.25rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .action-row:hover {
          background: rgba(0, 217, 255, 0.05);
          border-color: var(--glass-border-hover);
          transform: translateX(4px);
        }

        .action-text h5 {
          font-size: 0.95rem;
          margin-bottom: 0.15rem;
        }

        .action-text p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .row-arrow {
          color: var(--text-muted);
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .action-row:hover .row-arrow {
          color: var(--accent-secondary);
          transform: translateX(2px);
        }

        @media (max-width: 576px) {
          .welcome-banner {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }
          .welcome-text p {
            max-width: 100%;
          }
        }

        /* Comet and Riddle Modal styles */
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
          background: rgba(255,255,255,0.02);
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

        /* Glitch Shake visual class */
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

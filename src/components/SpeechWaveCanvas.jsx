import React, { useEffect, useRef } from "react";

export default function SpeechWaveCanvas({ isSpeaking }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let phase = 0;

    const width = 160;
    const height = 40;
    canvas.width = width;
    canvas.height = height;

    const drawWave = (color, amplitude, frequency, phaseShift, lineWidth) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      
      for (let x = 0; x < width; x++) {
        // Normalize x between 0 and 1
        const normX = x / width;
        // Sine envelope to clamp wave amplitude at boundaries (Awwwards design trick)
        const envelope = Math.sin(normX * Math.PI);
        
        const y = 
          height / 2 + 
          Math.sin(x * frequency + phase + phaseShift) * amplitude * envelope;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Increment phase to move wave forward
      phase += isSpeaking ? 0.12 : 0.02;

      // Base configurations
      const baseAmp = isSpeaking ? 14 : 1.5;
      
      // Siri-style multiple overlapping waves with varying phase and frequency offsets
      ctx.shadowBlur = isSpeaking ? 8 : 0;
      ctx.shadowColor = "rgba(6, 182, 212, 0.4)";
      drawWave("rgba(6, 182, 212, 0.55)", baseAmp, 0.08, 0, 1.8);
      
      ctx.shadowColor = "rgba(99, 102, 241, 0.4)";
      drawWave("rgba(99, 102, 241, 0.45)", baseAmp * 0.7, 0.12, Math.PI * 0.4, 1.5);
      
      ctx.shadowColor = "rgba(168, 85, 247, 0.3)";
      drawWave("rgba(168, 85, 247, 0.35)", baseAmp * 0.4, 0.05, Math.PI * 0.8, 1.2);

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "160px",
        height: "40px",
        opacity: isSpeaking ? 1 : 0.4,
        transition: "opacity 0.3s ease",
      }}
    />
  );
}

import React, { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Track mouse position
    const mouse = { x: null, y: null, radius: 150 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Setup canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles
    const particleArray = [];
    const numberOfParticles = Math.min(80, Math.floor((canvas.width * canvas.height) / 18000));

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.color = "rgba(99, 102, 241, 0.25)"; // Electric Indigo tint
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce on boundaries
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

        // Mouse interaction (slight pull)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x += forceDirectionX * force * 0.3;
            this.y += forceDirectionY * force * 0.3;
          }
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < numberOfParticles; i++) {
      particleArray.push(new Particle());
    }

    // Connect particles with lines
    const connect = () => {
      for (let a = 0; a < particleArray.length; a++) {
        for (let b = a; b < particleArray.length; b++) {
          const dx = particleArray[a].x - particleArray[b].x;
          const dy = particleArray[a].y - particleArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            // Calculate opacity based on distance
            const opacity = (1 - distance / 100) * 0.08;
            ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`; // Cyan connector lines
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particleArray[a].x, particleArray[a].y);
            ctx.lineTo(particleArray[b].x, particleArray[b].y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update & Draw particles
      particleArray.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      connect();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Clean up listeners
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -2,
        pointerEvents: "none",
      }}
    />
  );
}

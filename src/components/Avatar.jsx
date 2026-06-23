import React from "react";

export default function Avatar({ isSpeaking }) {
  return (
    <div className={`avatar-container ${isSpeaking ? "talking" : "idle"}`}>
      <svg width="120" height="120" viewBox="0 0 120 120" className="avatar-svg">
        <defs>
          <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0, 217, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(10, 14, 39, 0.6)" />
          </radialGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Floating Ring Outer */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="1"
          strokeDasharray="12 8"
          className="outer-ring"
        />

        {/* Secondary Inner Ring */}
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke="var(--accent-secondary)"
          strokeWidth="0.5"
          className="inner-ring"
        />

        {/* Robot Head Body */}
        <rect
          x="35"
          y="35"
          width="50"
          height="50"
          rx="12"
          fill="url(#faceGlow)"
          stroke="var(--glass-border)"
          strokeWidth="1.5"
          className="head-body"
        />

        {/* Side Ear Antennas */}
        <rect x="28" y="48" width="7" height="14" rx="2" fill="var(--accent-primary)" className="left-ear" />
        <rect x="85" y="48" width="7" height="14" rx="2" fill="var(--accent-primary)" className="right-ear" />

        {/* Glowing Eyes */}
        <circle cx="48" cy="54" r="4" fill="var(--accent-secondary)" filter="url(#neonGlow)" className="bot-eye left" />
        <circle cx="72" cy="54" r="4" fill="var(--accent-secondary)" filter="url(#neonGlow)" className="bot-eye right" />

        {/* Mouth Frequency Indicator */}
        {isSpeaking ? (
          <path
            d="M 46 68 Q 53 74 60 68 Q 67 74 74 68"
            fill="none"
            stroke="var(--accent-secondary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="bot-mouth-talking"
          />
        ) : (
          <line
            x1="48"
            y1="68"
            x2="72"
            y2="68"
            stroke="var(--glass-border-hover)"
            strokeWidth="2"
            strokeLinecap="round"
            className="bot-mouth-idle"
          />
        )}

        {/* Forehead Core Chip */}
        <rect x="56" y="39" width="8" height="6" rx="1" fill="var(--accent-secondary)" filter="url(#neonGlow)" />
      </svg>

      <style>{`
        .avatar-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          position: relative;
        }

        .avatar-svg {
          overflow: visible;
        }

        /* Outer ring rotation */
        .outer-ring {
          transform-origin: 60px 60px;
          animation: rotateRing 15s linear infinite;
        }

        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Idle breathing hover */
        .head-body {
          animation: floatHead 3s ease-in-out infinite alternate;
          transform-origin: 60px 60px;
        }

        @keyframes floatHead {
          from { transform: translateY(0px); }
          to { transform: translateY(-3px); }
        }

        /* Blinking eyes */
        .bot-eye {
          transform-origin: 60px 54px;
          animation: eyeBlink 4s infinite;
        }

        @keyframes eyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }

        /* Mouth speaking vibration */
        .bot-mouth-talking {
          animation: mouthVibrate 0.25s infinite alternate;
          transform-origin: 60px 68px;
        }

        @keyframes mouthVibrate {
          from { transform: scaleY(0.8); }
          to { transform: scaleY(1.5); }
        }

        /* Side antennas pulses */
        .left-ear, .right-ear {
          animation: pulseEars 2s infinite ease-in-out alternate;
        }

        @keyframes pulseEars {
          from { opacity: 0.6; fill: var(--accent-primary); }
          to { opacity: 1; fill: var(--accent-secondary); }
        }
      `}</style>
    </div>
  );
}

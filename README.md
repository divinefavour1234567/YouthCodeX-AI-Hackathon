# 🚀 PathFinder AI — The Ultimate Gamified Career Navigator

> **YouthCodeX AI Hackathon 2026 Submission**  
> *Target Category: Track 04 — Career Planning & Guidance*  
> *Target Awards: Best Original Idea, Best User Experience, Best Application within Category*

---

## 💡 The Mission & Problem Statement

Career planning for youth is fundamentally fragmented. Students face two primary hurdles: **indecision** ("What career fits me?") and **unpreparedness** ("How do I build skills, tailor my resume, and pass interviews?"). 

**PathFinder AI** solves this by consolidating the entire career-launch pipeline into a unified, gamified ecosystem. By bridging Track 04 (Career Guidance) with Track 01 (Financial Budgeting) and Track 03 (Accessibility/neurodivergence study aids), it helps students:
1.  **Explore** careers via interactive visual skill nodes.
2.  **Synthesize** dynamic, gap-bridging study roadmaps.
3.  **Calculate** net earnings, loan amortizations, and simulate budgets.
4.  **Critique** resumes using ATS parser scorecard visual diffs.
5.  **Rehearse** mock interviews using an Apple Siri-style voice interface.
6.  **Roleplay** real workplace scenarios in a text-based RPG.

---

## 🛠️ The Tech Stack

*   **Frontend**: React (Vite) for state transitions and modular component views.
*   **Styling**: Premium custom CSS variables establishing a unified, glassmorphic dark-neon design system.
*   **AI Integration**: Direct client-side SDK integration with the **Google Gemini API** (`@google/generative-ai`) featuring a robust mock-fallback engine when in demo mode.
*   **Visualizations**: Custom high-performance HTML5 Canvas rendering for Siri wave animations and mouse-reactive particle background grids.

---

## 🏆 Key Features & Visual Highlights

### 1. Interactive Career Tree & Wealth Simulator
*   **Duolingo-style Skill Tree**: Click nodes to explore salaries, growth, and recommended resources. Complete checkpoints to gain XP and level up.
*   **Stacked SVG Budget Bar**: Parses average career earnings and calculates estimated monthly net pay (after tax). Dynamic sliders let users allocate funds (housing, savings, essentials) and watch budget percentages animate in real-time.

### 2. Gap-Bridging AI Roadmap Generator
*   **Tailored Timelines**: Enter your current skills (e.g. *"I know Excel and basic Photoshop"*) and target career. Gemini analyzes the gap and builds a custom 4-step bridging vertical timeline.

### 3. Voice Interview Sandbox & Waveform Canvas
*   **Speech Synthesis (TTS)**: The AI interviewer reads questions aloud.
*   **Siri Wave Visualizer**: An HTML5 Canvas plots three overlapping translucent Bezier curves that pulse when the voice is active and flatline when silent.
*   **Evaluation Scorecard**: Generates an overall percentage grade, critique, and improvement tips.

### 4. Side-by-Side ATS Resume Diff & Outreach Writer
*   **Visual Editor Diff**: Strikeout red highlights show deletions, and green highlights show ATS-optimized metric-driven insertions. Click copy buttons to patch your resume.
*   **Outreach Copier**: Lazy-loads a tailored cover letter and a LinkedIn connection pitch message to copy instantly.

### 5. Day-in-the-Life RPG
*   **branching Scenarios**: Act out Monday standups or Friday production outages.
*   **Live Metrics**: Tracks stress, teamwork, and project progress gauges. Dialogues render letter-by-letter using a custom typewriter effect.

---

## ⚙️ Quick Start Installation

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/)

### Setup Instructions
1.  **Clone the workspace** and navigate to the project directory:
    ```bash
    cd YouthCodeX_AI_Hackathon_
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Launch the development server**:
    ```bash
    npm run dev
    ```
4.  **Open in your browser**:
    Navigate to the local port displayed in your terminal (usually `http://localhost:5173/`).
5.  **Enter your API Key**:
    Click the **Demo Mode** pill or the settings gear icon in the header to enter your Google Gemini API Key. (You can also leave it blank to test all features immediately using our high-fidelity fallback generators).

---

## 🎨 Design Philosophy & Animation Tokens

PathFinder AI implements design patterns inspired by Vercel, Linear, and Stripe:
*   **Floating Neon Spheres**: CSS-blurred radial spheres float slowly in the background (`@keyframes floatAround`) creating depth.
*   **Stripe Canvas Grid**: Particle networks connect based on proximity and follow cursor movements.
*   **Micro-Interactions**: Custom scale factors (`transform: scale(1.02) translateY(-2px)`) on card hovers and focus transitions.

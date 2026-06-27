import { GoogleGenerativeAI } from "@google/generative-ai";

const isKeyValid = (key) => {
  return key && typeof key === "string" && key.trim().length > 20;
};

/**
 * Evaluates a single mock interview response.
 */
export const evaluateInterviewResponse = async (apiKey, role, question, answer) => {
  if (!isKeyValid(apiKey)) {
    await new Promise((r) => setTimeout(r, 1000));
    const score = Math.min(65 + Math.floor(answer.length / 8), 98);
    const feedback = answer.length < 30 
      ? "Your answer is a bit too brief. In a professional interview, try using the STAR method (Situation, Task, Action, Result) to structure your response. Expand more on the specific technologies you used and the direct outcomes."
      : "Excellent detail! You clearly explained your reasoning and demonstrated technical awareness. To improve further, make sure to explicitly highlight teamwork, what you learned, and how you measured success.";
    const tips = [
      "Use quantitative results if possible (e.g. 'improved performance by 20%').",
      "Keep eye contact and maintain a structured flow.",
      "Directly connect your skills back to the job description."
    ];
    return { score, feedback, tips };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are an expert interviewer recruiting for a ${role} role. 
      Analyze the candidate's answer to this interview question.
      
      Question: "${question}"
      Candidate's Answer: "${answer}"
      
      Provide a constructive critique in JSON format containing these exact keys:
      {
        "score": (a number between 0 and 100 representing performance),
        "feedback": "A detailed paragraph evaluating the answer and showing what was good and what was lacking.",
        "tips": ["tip 1", "tip 2", "tip 3"]
      }
      Do not include any markdown formatting, code blocks, or extra text. Output ONLY raw JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with Gemini. Please verify your API Key.");
  }
};

/**
 * Critiques a candidate resume against a target job description.
 */
export const critiqueResume = async (apiKey, resumeText, jobDescription) => {
  if (!isKeyValid(apiKey)) {
    await new Promise((r) => setTimeout(r, 1200));
    const score = resumeText.toLowerCase().includes("react") || resumeText.toLowerCase().includes("python") ? 82 : 68;
    return {
      score,
      overallAssessment: "The resume shows solid core foundations, but is missing critical optimization for the specified role. It needs more action verbs and impact metrics.",
      strengths: [
        "Good list of technical stack keywords.",
        "Clean description of educational background.",
        "Clear contact information and layout layout."
      ],
      weaknesses: [
        "Lacks measurable achievements and metrics (e.g. percentages, values).",
        "Responsibilities are written as lists of tasks instead of active accomplishments.",
        "Formatting could be made more scannable for Applicant Tracking Systems (ATS)."
      ],
      recommendations: [
        "Rewrite description bullets using the X-Y-Z formula (Accomplished [X], as measured by [Y], by doing [Z]).",
        "Add a dedicated 'Projects' section highlighting real-world applications.",
        "Tailor the summary section to directly reference key terms in the target job description: " + jobDescription.substring(0, 40) + "..."
      ]
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are an expert HR Specialist and ATS Optimizer. 
      Critique this candidate's resume text against the target job description.
      
      Resume:
      """
      ${resumeText}
      """
      
      Job Description:
      """
      ${jobDescription}
      """
      
      Provide your review in JSON format containing these exact keys:
      {
        "score": (ATS compatibility score between 0 and 100),
        "overallAssessment": "A summary of how compatible the resume is with the job description.",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "recommendations": ["actionable advice 1", "actionable advice 2", "actionable advice 3"]
      }
      Do not include any markdown formatting, code blocks, or extra text. Output ONLY raw JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with Gemini. Please verify your API Key.");
  }
};

/**
 * Dynamically generates a custom career gap-bridging roadmap.
 */
export const generateCustomRoadmap = async (apiKey, currentSkills, targetCareer) => {
  if (!isKeyValid(apiKey)) {
    await new Promise((r) => setTimeout(r, 1200));
    
    // High-quality simulated personalized roadmap matching inputs
    return [
      {
        label: "Master Core Prerequisites",
        desc: `Level up your foundation in: ${currentSkills}. Focus on structuring object-oriented logic and clean documentation.`
      },
      {
        label: `Transition to ${targetCareer} Tooling`,
        desc: `Learn the essential software suites, frameworks, and APIs required specifically for professional ${targetCareer} work.`
      },
      {
        label: "Build Portfolio Applications",
        desc: "Build 2 distinct, fully deployed projects integrating APIs. Document your code on GitHub and record 2-minute video demonstrations."
      },
      {
        label: "Conduct Technical Simulation & Apply",
        desc: "Practice behavioral mock interviews and run ATS checks against real junior postings to secure your first role."
      }
    ];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are a Professional Career Advisor. 
      Help a student transition from their current skills to their target career.
      
      Current Skills: "${currentSkills}"
      Target Career: "${targetCareer}"
      
      Generate a customized, logical 4-step learning roadmap to bridge this gap.
      Provide the roadmap in JSON format as a flat array of exactly 4 objects containing these keys:
      [
        { "label": "Milestone Title", "desc": "Actionable description of what to learn and build in this phase" },
        ...
      ]
      Do not include any markdown formatting, code blocks, or extra text. Output ONLY raw JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate custom roadmap. Check your API Key.");
  }
};

/**
 * Generates LinkedIn outreach templates and Cover Letters.
 */
export const generateOutreachDrafts = async (apiKey, resumeText, jobDescription) => {
  if (!isKeyValid(apiKey)) {
    await new Promise((r) => setTimeout(r, 1000));
    
    return {
      linkedinMessage: "Hi [Recruiter Name],\n\nI recently came across the junior role opening at your firm. With my background in software engineering, project compilation, and responsive web design, I've built active web prototypes that match your requirements. I'd love to connect and share my portfolio. Thanks!\n\nBest,\nJane Doe",
      coverLetter: "Dear Hiring Team,\n\nI am writing to express my strong interest in the junior position. My technical projects, including a stateful arithmetic application and a custom portfolio site, demonstrate my hands-on problem-solving abilities. I am eager to apply my frontend capabilities and collaborate with your engineers to build high-performance products.\n\nSincerely,\nJane Doe"
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are an expert Copywriter and Career Coach. 
      Generate tailored job application assets using the candidate's resume and target job description.
      
      Resume:
      """
      ${resumeText}
      """
      
      Job Description:
      """
      ${jobDescription}
      """
      
      Provide your assets in JSON format containing these exact keys:
      {
        "linkedinMessage": "A professional 3-paragraph outreach message to send to a recruiter on LinkedIn (under 150 words).",
        "coverLetter": "A formal, high-impact Cover Letter expressing enthusiasm and matching key achievements from the resume to the job description requirements."
      }
      Do not include any markdown formatting, code blocks, or extra text. Output ONLY raw JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to write outreach drafts. Check your API Key.");
  }
};

/**
 * Simulates one turn of a salary negotiation with a virtual hiring manager using real market benchmarks.
 */
export const negotiateSalaryResponse = async (apiKey, role, difficulty, lastOffer, userCounterOffer, userMessage, round, patience) => {
  const BENCHMARKS = {
    "Junior Software Engineer": {
      entry: { min: 60000, max: 90000, minNgn: 4000000, maxNgn: 7000000, keywords: ["react", "javascript", "git", "api"] },
      mid: { min: 100000, max: 140000, minNgn: 8000000, maxNgn: 15000000, keywords: ["system design", "databases", "testing", "ci/cd"] },
      executive: { min: 160000, max: 250000, minNgn: 18000000, maxNgn: 30000000, keywords: ["architecture", "scale", "security", "cloud", "team lead"] }
    },
    "Associate AI Engineer": {
      entry: { min: 70000, max: 105000, minNgn: 5000000, maxNgn: 9000000, keywords: ["python", "numpy", "pandas", "data science"] },
      mid: { min: 120000, max: 180000, minNgn: 10000000, maxNgn: 18000000, keywords: ["pytorch", "tensorflow", "nlp", "transformers", "metrics"] },
      executive: { min: 200000, max: 320000, minNgn: 22000000, maxNgn: 40000000, keywords: ["llm", "fine-tuning", "mlops", "deployment", "pipeline", "strategy"] }
    },
    "Junior UX/UI Designer": {
      entry: { min: 50000, max: 75000, minNgn: 3000000, maxNgn: 6000000, keywords: ["figma", "wireframe", "typography", "colors"] },
      mid: { min: 85000, max: 120000, minNgn: 7000000, maxNgn: 12000000, keywords: ["ux research", "user flow", "prototyping", "design system"] },
      executive: { min: 140000, max: 210000, minNgn: 15000000, maxNgn: 25000000, keywords: ["strategy", "leadership", "analytics", "usability test", "tokens"] }
    }
  };

  // Safe fallback lookup
  const roleKey = BENCHMARKS[role] ? role : Object.keys(BENCHMARKS).find(k => k.toLowerCase().includes(role.toLowerCase())) || "Junior Software Engineer";
  const bounds = BENCHMARKS[roleKey][difficulty] || BENCHMARKS[roleKey]["mid"];

  const currency = Number(lastOffer) > 1000000 ? "NGN" : "USD";
  const minLimit = currency === "NGN" ? bounds.minNgn : bounds.min;
  const maxLimit = currency === "NGN" ? bounds.maxNgn : bounds.max;
  const requiredKeywords = bounds.keywords;

  if (!isKeyValid(apiKey)) {
    await new Promise((r) => setTimeout(r, 1000));
    
    const counter = Number(userCounterOffer) || lastOffer;
    const msg = (userMessage || "").toLowerCase();
    
    // 1. Minimum pitch length validator
    if (msg.length < 15) {
      return {
        bossResponse: `I cannot evaluate this offer without a professional justification. Please explain your key skills and achievements before proposing adjustments.`,
        counterOffer: lastOffer,
        patienceDelta: -25,
        verdict: patience - 25 <= 0 ? "rejected_walkaway" : "continue"
      };
    }

    // 2. Keyword matching count
    const matchedCount = requiredKeywords.filter(kw => msg.includes(kw)).length;
    
    let bossResponse = "";
    let counterOffer = lastOffer;
    let patienceDelta = -12;
    let verdict = "continue";

    // 3. Logic based on counter pricing relative to benchmarks
    if (counter <= lastOffer) {
      bossResponse = "Excellent. I'm glad we are on the same page. Let's finalize the paperwork!";
      counterOffer = counter;
      patienceDelta = +10;
      verdict = "accepted";
    } else if (counter > maxLimit) {
      // Trying to exceed the market budget cap
      if (matchedCount < 2) {
        bossResponse = `That is far beyond our target budget for a ${difficulty}-level position. You haven't referenced critical requirements like ${requiredKeywords.slice(0,2).join(" or ")} to justify this rate.`;
        patienceDelta = -35;
        counterOffer = Math.round(lastOffer * 1.02);
      } else {
        bossResponse = `While you make a good point mentioning ${requiredKeywords.filter(kw => msg.includes(kw)).join(" and ")}, your demand exceeds our hard ceiling. I can meet you at our maximum budget boundary of ${currency === "NGN" ? "₦" : "$"}${maxLimit.toLocaleString()}.`;
        counterOffer = maxLimit;
        patienceDelta = -15;
      }
    } else {
      // Proposing counter within standard bounds
      if (matchedCount === 0) {
        bossResponse = `We have budgeted this role carefully. Your requested salary of ${currency === "NGN" ? "₦" : "$"}${counter.toLocaleString()} is possible, but you haven't mentioned core skills like ${requiredKeywords.join(", ")} to support it. Let's stick closer to our initial offer.`;
        patienceDelta = -20;
        counterOffer = Math.round(lastOffer * 1.03);
      } else {
        // Successful compromise
        const matchRatio = matchedCount / requiredKeywords.length;
        const increaseRange = counter - lastOffer;
        const offerBonus = Math.round(increaseRange * (0.3 + matchRatio * 0.5));
        
        counterOffer = lastOffer + offerBonus;
        patienceDelta = -5;
        
        if (Math.abs(counter - counterOffer) < (currency === "NGN" ? 150000 : 2000)) {
          bossResponse = `That is a reasonable proposal given your credentials in ${requiredKeywords.filter(kw => msg.includes(kw)).join(", ")}. Let's lock it in at ${currency === "NGN" ? "₦" : "$"}${counter.toLocaleString()}!`;
          counterOffer = counter;
          patienceDelta = +5;
          verdict = "accepted";
        } else {
          bossResponse = `I see your point regarding your experience in ${requiredKeywords.filter(kw => msg.includes(kw)).join(", ")}. Let's compromise at ${currency === "NGN" ? "₦" : "$"}${counterOffer.toLocaleString()}. How does that sound?`;
        }
      }
    }

    if (round >= 5 && verdict === "continue") {
      verdict = "rejected_walkaway";
      bossResponse = `We have gone back and forth but unfortunately, we cannot align. I must rescind our offer. Good luck with your search.`;
    }

    return {
      bossResponse,
      counterOffer,
      patienceDelta,
      verdict
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are acting as a strict but reasonable Hiring Manager named "Alex" negotiating salary for a ${roleKey} position.
      Current parameters:
      - Job Difficulty / Seniority: ${difficulty}
      - Local Market Budget Bounds (in ${currency}): Min: ${minLimit}, Max: ${maxLimit}.
      - Expected Skill Keywords for this level: ${requiredKeywords.join(", ")}.
      
      Candidates proposals:
      - Initial / Last Offer: ${lastOffer}
      - Candidate's Counter-Offer: ${userCounterOffer}
      - Candidate's Argument: "${userMessage}"
      - Current Negotiation Round: ${round} of 5
      - Boss's current Patience Level: ${patience}% (0% means you rescind the offer immediately).
      
      Verify candidate's pitch:
      - If candidate demands a salary above the Median (${Math.round((minLimit+maxLimit)/2)}) or above Max budget, they MUST mention at least 2 of the expected skill keywords.
      - If their argument is generic (less than 15 chars, empty metrics, begging, or asking without skill justifications), reduce patience by 25-35%, make a minimal counter-offer, and express disappointment in their unskillful/incompetent approach.
      - If they do match expected skills, meet them halfway (increase offer) and reduce patience slightly (-5%).
      - If they match skills and counter-offer is very close, accept it (verdict = "accepted").
      - If round >= 5 or patience hits 0%, set verdict to "rejected_walkaway" and rescind the offer.
      
      Respond strictly in JSON format with these exact keys:
      {
        "bossResponse": "your spoken response as the hiring manager criticizing or accepting their terms based on benchmarks",
        "counterOffer": (the new counter-offer salary you propose as a number),
        "patienceDelta": (a positive or negative number showing change in patience, e.g. -15),
        "verdict": "continue" | "accepted" | "rejected_walkaway"
      }
      Do not include any markdown formatting, code blocks, or extra text. Output ONLY raw JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to simulate salary negotiation. Check your API Key.");
  }
};

/**
 * Simulates a conversation turn with the AI Career Advisor.
 */
export const chatWithCareerAdvisor = async (apiKey, userProfile, message, history = []) => {
  if (!isKeyValid(apiKey)) {
    await new Promise((r) => setTimeout(r, 1000));
    
    const msg = message.toLowerCase();
    let reply = "";
    
    if (history.length === 0) {
      reply = `Hello ${userProfile.name || "friend"}! Welcome to PathFinder AI. I see you are based in ${userProfile.location || "Nigeria"} and interested in transitioning from '${userProfile.currentField}' into '${userProfile.targetRoles}'. To get started, what specific sub-skills or languages (e.g., Python, Figma, React) do you want to learn first?`;
    } else if (msg.includes("python") || msg.includes("react") || msg.includes("figma") || msg.includes("javascript")) {
      reply = `Great choice! Focusing on skills like those aligns well with hiring targets at top African firms like Paystack and Moniepoint. Do you have any previous project experience with these, or are you starting completely from scratch?`;
    } else if (msg.includes("scratch") || msg.includes("no") || msg.includes("beginner")) {
      reply = `Starting from scratch is perfect. We can map out a modular learning path. How many hours a week can you realistically dedicate to studying and building side projects?`;
    } else {
      reply = `That is very helpful context. I have gathered enough details to structure a solid timeline. Feel free to ask any other questions, or click 'Generate Career Roadmap' below to compile your customized 90-day learning path!`;
    }
    
    return reply;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are PathFinder AI, an expert career advisor specializing in the African and Nigerian tech ecosystems.
      
      User Profile:
      - Name: ${userProfile.name}
      - Current Field/Skills: ${userProfile.currentField}
      - Location: ${userProfile.location}
      - Target Interests/Roles: ${userProfile.targetRoles}
      
      Your guidelines:
      1. Help the user clarify their career goals, learn relevant tech stacks, and prepare for local roles.
      2. Suggest concrete next steps and reference real African/Nigerian firms like Paystack, Flutterwave, Moniepoint, MTN, PiggyVest, or local banks.
      3. Ask 1-2 clarifying questions per response to keep the conversation engaging.
      4. Keep your responses encouraging, brief, and under 3 paragraphs (less than 150 words).
      
      Conversation History:
      ${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
      USER: ${message}
      ASSISTANT:
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with Career Coach. Verify your API Key.");
  }
};

/**
 * Generates a structured 90-day learning roadmap from conversation history.
 */
export const generateAdvisorRoadmap = async (apiKey, userProfile, history = []) => {
  if (!isKeyValid(apiKey)) {
    await new Promise((r) => setTimeout(r, 1500));
    
    // High-fidelity simulated roadmap customized with profile inputs
    return {
      roadmap_90day: {
        phase_1: {
          duration: "Days 1-30",
          focus: "Core Fundamentals & Setup",
          actions: [
            `Acquire foundational skills in ${userProfile.currentField || "HTML/CSS & JavaScript"}`,
            "Create a GitHub profile and configure a clean README repository",
            "Build 3 responsive landing pages and push them live to Netlify/Vercel"
          ],
          resources: ["freeCodeCamp Web Responsive Course", "MDN Web Docs"]
        },
        phase_2: {
          duration: "Days 31-60",
          focus: "Advanced Frameworks & APIs",
          actions: [
            `Transition to frameworks matching ${userProfile.targetRoles || "Frontend/AI Engineer"} requirements`,
            "Build an API-driven dashboard app consuming public JSON REST endpoints",
            "Read Paystack developer sandbox documentation for payment integration practice"
          ],
          resources: ["React Official Documentation", "JavaScript Info", "Paystack Dev API Docs"]
        },
        phase_3: {
          duration: "Days 61-90",
          focus: "ATS Optimization & Interviews",
          actions: [
            "Critique your draft resume in Pathfinder's ATS scorecard tracker",
            "Conduct 3 mock voice interviews to practice behavioral and technical concepts",
            "Apply to junior internship positions at Moniepoint, Flutterwave, or local tech startups"
          ],
          resources: ["Pathfinder Mock Interview Sandbox", "LinkedIn Jobs Board"]
        }
      },
      target_roles: [
        {
            title: `Junior ${userProfile.targetRoles || "Software Engineer"}`,
            companies_in_nigeria: ["Paystack", "Flutterwave", "Moniepoint", "Kuda Bank"],
            salary_range_ngn: "₦350,000 - ₦600,000 / month",
            key_requirements: ["JavaScript/Python", "Git", "API Integrations", "Figma"],
            years_to_reach: "3 months"
        }
    ],
    skill_priorities: ["Foundational Code Logic", "Git Version Control", "REST APIs"],
    salary_expectations: {
        entry_level: "₦4.2M - ₦7.2M / year",
        senior_level: "₦18M - ₦30M / year"
    }
};
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Analyze this career conversation history between a candidate and their career coach, and compile a structured 90-day learning roadmap.
      
      User Profile:
      - Current Field/Skills: ${userProfile.currentField}
      - Location: ${userProfile.location}
      - Target Interests/Roles: ${userProfile.targetRoles}
      
      Conversation History:
      ${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
      
      Generate a JSON roadmap in this EXACT format:
      {
        "roadmap_90day": {
          "phase_1": {
            "duration": "Days 1-30",
            "focus": "Learning Focus",
            "actions": ["Action 1", "Action 2", "Action 3"],
            "resources": ["Resource 1", "Resource 2"]
          },
          "phase_2": {
            "duration": "Days 31-60",
            "focus": "Learning Focus",
            "actions": ["Action 1", "Action 2", "Action 3"],
            "resources": ["Resource 1", "Resource 2"]
          },
          "phase_3": {
            "duration": "Days 61-90",
            "focus": "Learning Focus",
            "actions": ["Action 1", "Action 2", "Action 3"],
            "resources": ["Resource 1", "Resource 2"]
          }
        },
        "target_roles": [
          {
            "title": "Role Title",
            "companies_in_nigeria": ["Company 1", "Company 2"],
            "salary_range_ngn": "₦X - ₦Y per month",
            "key_requirements": ["Skill 1", "Skill 2"],
            "years_to_reach": "X months"
          }
        ],
        "skill_priorities": ["Skill 1", "Skill 2"],
        "salary_expectations": {
          "entry_level": "₦X million",
          "mid_level": "₦Y million",
          "senior_level": "₦Z million"
        }
      }
      
      Do not include any markdown formatting, code blocks, or extra text. Output ONLY raw JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate career roadmap. Verify your API Key.");
  }
};


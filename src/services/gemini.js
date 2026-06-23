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

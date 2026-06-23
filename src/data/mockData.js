export const CAREER_PATHS = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "Technology",
    salary: "$90,000 - $160,000",
    growth: "+22% (Very Fast)",
    description: "Builds, tests, and maintains software applications and systems. Translates user requirements into functional, high-performance code.",
    skills: ["JavaScript/TypeScript", "React/Node.js", "Data Structures & Algorithms", "System Design", "Git & CI/CD"],
    education: "Bachelor's in Computer Science, Bootcamps, or Self-Taught with Portfolio.",
    resources: [
      { name: "MDN Web Docs", type: "Docs", url: "https://developer.mozilla.org" },
      { name: "freeCodeCamp", type: "Course", url: "https://www.freecodecamp.org" },
      { name: "LeetCode", type: "Practice", url: "https://leetcode.com" }
    ],
    milestones: [
      { id: "se-1", label: "Programming Basics", desc: "Learn JS, HTML, CSS syntax and logic." },
      { id: "se-2", label: "Data Structures", desc: "Understand arrays, lists, maps, and space/time complexity." },
      { id: "se-3", label: "Frontend Frameworks", desc: "Build modular UIs using React or Vue." },
      { id: "se-4", label: "Backend & Databases", desc: "Design REST APIs, work with SQL/NoSQL databases." },
      { id: "se-5", label: "System Design", desc: "Learn scaling, load balancing, and caching strategies." }
    ],
    coordinates: { x: 150, y: 250 },
    connections: ["ai-engineer", "data-analyst", "product-manager"]
  },
  {
    id: "ai-engineer",
    title: "AI/ML Engineer",
    category: "Technology",
    salary: "$120,000 - $210,000",
    growth: "+35% (Explosive)",
    description: "Develops machine learning models, neural networks, and integrates AI capabilities (like Gemini) into production applications.",
    skills: ["Python", "PyTorch/TensorFlow", "Linear Algebra & Calculus", "NLP & LLM Fine-tuning", "Data Pipeline (ETL)"],
    education: "Master's or Ph.D. in Computer Science/AI, or strong specialization courses.",
    resources: [
      { name: "DeepLearning.AI", type: "Course", url: "https://www.deeplearning.ai" },
      { name: "Kaggle", type: "Competition", url: "https://www.kaggle.com" },
      { name: "Google AI Edge", type: "Docs", url: "https://ai.google.dev" }
    ],
    milestones: [
      { id: "ai-1", label: "Mathematical Foundation", desc: "Master probability, statistics, and linear algebra." },
      { id: "ai-2", label: "Python & Data Science", desc: "Learn NumPy, Pandas, Scikit-learn." },
      { id: "ai-3", label: "Deep Learning Foundations", desc: "Build neural networks, understand CNNs/RNNs." },
      { id: "ai-4", label: "Transformers & LLMs", desc: "Work with attention mechanisms and prompt engineering." },
      { id: "ai-5", label: "MLOps & Deployment", desc: "Deploy models as APIs, monitor performance and drift." }
    ],
    coordinates: { x: 150, y: 80 },
    connections: []
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Data & Finance",
    salary: "$70,000 - $115,000",
    growth: "+25% (Fast)",
    description: "Translates numbers into business insights. Cleans raw data, runs statistical analyses, and designs interactive dashboards.",
    skills: ["SQL", "Python/R", "Tableau/PowerBI", "Statistical Modeling", "Business Communication"],
    education: "Degrees in Statistics, Finance, Mathematics, or Data Analytics bootcamps.",
    resources: [
      { name: "Google Data Analytics Certificate", type: "Course", url: "https://grow.google/certificates/data-analytics" },
      { name: "Mode Analytics SQL Tutorial", type: "Tutorial", url: "https://mode.com/sql-tutorial" }
    ],
    milestones: [
      { id: "da-1", label: "SQL Mastery", desc: "Learn joins, aggregations, and subqueries." },
      { id: "da-2", label: "Excel Advanced", desc: "Master pivot tables, VLOOKUPs, and macros." },
      { id: "da-3", label: "Visualizations", desc: "Learn to build dashboards in Tableau or PowerBI." },
      { id: "da-4", label: "Data Cleaning", desc: "Use Pandas to handle null values, duplicates, and formats." }
    ],
    coordinates: { x: 350, y: 350 },
    connections: ["financial-analyst"]
  },
  {
    id: "financial-analyst",
    title: "Financial Analyst",
    category: "Data & Finance",
    salary: "$80,000 - $135,000",
    growth: "+8% (Average)",
    description: "Analyzes financial performance, builds forecasting models, conducts market research, and helps companies make strategic financial choices.",
    skills: ["Corporate Finance", "Financial Modeling (Excel)", "Valuation Techniques", "Market Analysis", "Accounting Standards"],
    education: "Bachelor's in Finance, Economics, or Accounting. CFA charter is highly valued.",
    resources: [
      { name: "Investopedia", type: "Reference", url: "https://www.investopedia.com" },
      { name: "Wall Street Prep", type: "Course", url: "https://www.wallstreetprep.com" }
    ],
    milestones: [
      { id: "fa-1", label: "Accounting Foundations", desc: "Understand income statements, balance sheets, and cash flows." },
      { id: "fa-2", label: "Financial Modeling", desc: "Build dynamic DCF and LBO models in Excel." },
      { id: "fa-3", label: "Macroeconomics", desc: "Analyze interest rates, inflation, and global markets." },
      { id: "fa-4", label: "CFA Level I Prep", desc: "Study ethics, quantitative methods, and asset classes." }
    ],
    coordinates: { x: 550, y: 350 },
    connections: []
  },
  {
    id: "ux-designer",
    title: "UX/UI Designer",
    category: "Creative",
    salary: "$75,000 - $130,000",
    growth: "+16% (Fast)",
    description: "Designs the look, feel, and usability of digital products. Creates user journeys, wireframes, prototypes, and conducts usability testing.",
    skills: ["Figma", "User Research", "Wireframing & Prototyping", "Information Architecture", "Visual Design Principles"],
    education: "Bachelor's in Design, Human-Computer Interaction (HCI), or portfolio-driven self-study.",
    resources: [
      { name: "UX Collective", type: "Blog", url: "https://uxdesign.cc" },
      { name: "Figma Academy", type: "Tutorial", url: "https://www.figma.com/education" },
      { name: "Laws of UX", type: "Reference", url: "https://lawsofux.com" }
    ],
    milestones: [
      { id: "ux-1", label: "Design Fundamentals", desc: "Study layout, typography, grids, and color theory." },
      { id: "ux-2", label: "Figma & Tooling", desc: "Master components, auto-layout, and prototyping triggers." },
      { id: "ux-3", label: "User Research", desc: "Run interviews, synthesize personas, and map journeys." },
      { id: "ux-4", label: "Interaction Design", desc: "Build wireframes, task flows, and micro-interactions." },
      { id: "ux-5", label: "Usability Testing", desc: "Test prototypes with real users and iterate based on pain points." }
    ],
    coordinates: { x: 350, y: 150 },
    connections: ["product-manager"]
  },
  {
    id: "product-manager",
    title: "Product Manager",
    category: "Management",
    salary: "$95,000 - $165,000",
    growth: "+20% (Fast)",
    description: "The 'mini-CEO' of a product. Bridges the gap between tech, design, and business to define the product vision, strategy, and roadmap.",
    skills: ["Product Strategy", "Agile & Scrum", "A/B Testing & Metrics", "Stakeholder Communication", "User Empathy"],
    education: "Mixed backgrounds (Tech, Business, or Design). MBA or specialized training help.",
    resources: [
      { name: "Product School", type: "Resources", url: "https://productschool.com" },
      { name: "Mind the Product", type: "Community", url: "https://www.mindtheproduct.com" }
    ],
    milestones: [
      { id: "pm-1", label: "Market Research", desc: "Identify customer pain points, perform competitor audits." },
      { id: "pm-2", label: "Product Analytics", desc: "Learn key metrics: churn, LTV, CAC, retention." },
      { id: "pm-3", label: "Agile Methodologies", desc: "Master ticket creation, sprint planning, and backlog grooming." },
      { id: "pm-4", label: "Roadmapping & Prioritization", desc: "Apply frameworks like RICE or MoSCoW to prioritize features." },
      { id: "pm-5", label: "Go-to-Market (GTM)", desc: "Coordinate launches with marketing, sales, and customer success." }
    ],
    coordinates: { x: 550, y: 150 },
    connections: []
  }
];

export const INTERVIEW_ROLES = {
  "software-engineer": {
    title: "Junior Software Engineer",
    questions: [
      {
        id: 1,
        question: "Explain the difference between 'let', 'const', and 'var' in JavaScript. When should you use each?",
        idealAnswer: "'var' is function-scoped and can be hoisted, leading to potential bugs. 'let' and 'const' are block-scoped. 'const' prevents reassignment of the variable identifier, though objects assigned to it can still be mutated. You should default to 'const', and use 'let' only if you expect the variable to be reassigned."
      },
      {
        id: 2,
        question: "What is a REST API? What are the HTTP methods associated with it and their purposes?",
        idealAnswer: "REST (Representational State Transfer) is an architectural style for design web APIs. It uses standard HTTP methods: GET to retrieve data, POST to create data, PUT/PATCH to update data, and DELETE to remove data. They are designed to be stateless and resource-oriented."
      },
      {
        id: 3,
        question: "Describe a time you encountered a difficult bug. What was your process for debugging and resolving it?",
        idealAnswer: "A structured answer should explain the situation, the debugging methods (console logs, browser debugger, isolating variables), finding the root cause (e.g. an asynchronous race condition), writing a patch, and implementing tests to prevent regressions."
      }
    ]
  },
  "ai-engineer": {
    title: "Associate AI Engineer",
    questions: [
      {
        id: 1,
        question: "What is overfitting in Machine Learning, and what are some common techniques to prevent it?",
        idealAnswer: "Overfitting happens when a model learns noise in the training data and performs poorly on unseen data. To prevent it, you can use: regularization (L1/L2), dropout layers in neural networks, cross-validation, early stopping, or gathering more training data."
      },
      {
        id: 2,
        question: "Explain what prompt engineering is and describe a technique like Few-Shot Prompting.",
        idealAnswer: "Prompt engineering is the practice of structuring inputs to LLMs to elicit specific, high-quality responses. Few-Shot Prompting involves providing the model with a few examples of desired input-output pairs in the prompt, giving it a pattern to emulate for new inputs."
      },
      {
        id: 3,
        question: "What are transformers? Why are they so significant in modern AI/NLP?",
        idealAnswer: "Transformers are neural network architectures introduced in 2017 that rely on 'self-attention' mechanisms. They process entire sequences in parallel (unlike sequential RNNs), enabling massive scalability and training efficiency, which laid the foundation for modern LLMs like Gemini."
      }
    ]
  },
  "ux-designer": {
    title: "Junior UX/UI Designer",
    questions: [
      {
        id: 1,
        question: "What is the difference between UX and UI? How do you balance aesthetics with functionality?",
        idealAnswer: "UX (User Experience) focuses on the overall feel, structure, and ease of use of a product, while UI (User Interface) focuses on visual aesthetics, colors, typography, and interactive layouts. Balancing them means prioritizing accessibility, usability, and task completion, then using beautiful typography, spacing, and micro-interactions to elevate the visual appeal without creating friction."
      },
      {
        id: 2,
        question: "Describe your design process. How do you go from a vague feature request to a high-fidelity prototype?",
        idealAnswer: "A standard process follows Design Thinking: Research (user interviews, competitive analysis), Define (personas, problem statement), Ideate (sketches, user flows), Prototype (wireframes, Figma mockups), and Test (usability reviews with users, iterating based on feedback)."
      },
      {
        id: 3,
        question: "How do you ensure your designs are accessible (WCAG compliant)?",
        idealAnswer: "I verify contrast ratios (aiming for AA or AAA compliance for text), design for keyboard navigation, ensure touch targets are large enough (minimum 44x44 pixels), support screen-reader readable text, and avoid using color as the sole indicator of information or actions."
      }
    ]
  }
};

export const RPG_SCENARIOS = {
  "software-engineer": {
    roleName: "Junior Software Engineer",
    company: "DevSync (SaaS Startup)",
    intro: "You just landed your first job at DevSync, a fast-growing tech startup. It's 9:00 AM on your first official Monday, and you're sitting in front of your monitor. The slack notifications are already popping off.",
    steps: [
      {
        id: "standup",
        title: "The Morning Standup",
        text: "It's time for the daily standup. Yesterday, you spent all day trying to fix a database connection bug, but you couldn't figure it out. The tech lead looks at you: 'Hey! Any updates on the DB connection issue?' What do you say?",
        choices: [
          {
            text: "Admit you're blocked: 'I spent all day on it but got stuck. I'd love to pair program with someone for 15 minutes to debug.'",
            resultText: "The tech lead nods approvingly. 'Thanks for raising it early. Sarah, can you hop on a huddle with them after this?' Sarah helps you solve it in 10 minutes. You learned how to inspect network sockets!",
            effects: { stress: +10, teamwork: +25, progress: +20 }
          },
          {
            text: "Bluff your way through: 'Yeah, I'm making great progress! Should be done by lunchtime.'",
            resultText: "Lunchtime comes and goes. You are panicking. The tech lead asks for a PR at 2 PM, and you have nothing to show. Your stress skyrockets, and your team's trust decreases.",
            effects: { stress: +40, teamwork: -15, progress: +0 }
          },
          {
            text: "Deflect attention: 'Well, the documentation was really outdated, so I spent my time rewriting parts of it instead of debugging.'",
            resultText: "The tech lead raises an eyebrow. 'Outdated docs are bad, but the connection bug is blocking our release. Let's stay focused on the sprint goal.' You look a bit disorganized.",
            effects: { stress: +20, teamwork: +0, progress: +5 }
          }
        ],
        nextStep: "production_bug"
      },
      {
        id: "production_bug",
        title: "The Production Fire",
        text: "It's 4:30 PM on a Friday. You just pushed your first feature live! Five minutes later, the Slack channel alerts blow up. The homepage is rendering a 500 error code for all guest users. Oh no! What is your immediate response?",
        choices: [
          {
            text: "Revert the change immediately: 'I am rolling back my commit now, then I'll investigate on my local branch.'",
            resultText: "Perfect decision. Pushing 'revert' takes 60 seconds. The site is back online. The team praises your quick, ego-less action. You can debug calmly now.",
            effects: { stress: +15, teamwork: +30, progress: +30 }
          },
          {
            text: "Try to hotfix it live: Make quick edits directly in the production config console to see if it works.",
            resultText: "Oh dear. You made a typo in the config, making the error even worse and locking out the admin panel. Seniors have to get involved to fix it. Big headache.",
            effects: { stress: +50, teamwork: -20, progress: -10 }
          },
          {
            text: "Freeze: Close your laptop, hope it's a transient server issue, and leave for the weekend.",
            resultText: "Unacceptable! The outage persists for hours, affecting user traffic. On Monday, you are called into a meeting with your manager. Your career stands on thin ice.",
            effects: { stress: +80, teamwork: -50, progress: -30 }
          }
        ],
        nextStep: "finish"
      }
    ]
  },
  "ux-designer": {
    roleName: "UX/UI Designer",
    company: "FlowStudio (Design Agency)",
    intro: "Welcome to FlowStudio! You're hired to improve the mobile check-out flow for a major e-commerce client. The client wants to increase purchase conversion rates, which have dropped by 12% last quarter.",
    steps: [
      {
        id: "standup",
        title: "The Kickoff Research",
        text: "The client demands that you immediately start drawing high-fidelity screens in Figma because 'we need developers writing code next week'. However, you haven't done any user research. What do you do?",
        choices: [
          {
            text: "Push back politely: Explain that without quick user interviews or analyzing drop-off analytics, we might build the wrong screens. Propose a rapid 2-day research sprint.",
            resultText: "The client is hesitant but respects your professional expertise. You analyze analytics and discover users are dropping off because the mandatory password field has complex rules. You saved them from rebuilding the wrong pages!",
            effects: { stress: +15, teamwork: +20, progress: +25 }
          },
          {
            text: "Comply: Start designing beautiful cards and layouts immediately, making assumptions about user problems.",
            resultText: "You spend all week designing gorgeous interfaces. But after launch, the conversion rate doesn't budge—turns out users were dropping off because of hidden shipping fees on the payment page, not layout styling. Double work!",
            effects: { stress: +35, teamwork: -10, progress: +5 }
          }
        ],
        nextStep: "critique"
      },
      {
        id: "critique",
        title: "The Design Critique",
        text: "You present your wireframes to the engineering lead. He complains: 'This layout has floating 3D layers and complex micro-animations. It will take my team three months to build! We only have two weeks.' How do you adapt?",
        choices: [
          {
            text: "Collaborate: 'Let's sit down and review the design. What are the key technical bottlenecks? We can simplify the visual animations while keeping the core usability improvements.'",
            resultText: "Awesome teamwork. You identify that the interactive 3D slider was the bottleneck. You swap it for a clean, tabbed filter system. The developers can build it in 3 days, and users still get a smooth experience.",
            effects: { stress: +10, teamwork: +30, progress: +35 }
          },
          {
            text: "Defend your design: 'This design represents modern UX principles. Simplifying it compromises the creative brand integrity. Your dev team needs to level up.'",
            resultText: "A frosty relationship ensues. The engineers refuse to build it, complaining to the PM. The project stalls, and you have to redo it anyway under stressful time constraints.",
            effects: { stress: +45, teamwork: -25, progress: -5 }
          }
        ],
        nextStep: "finish"
      }
    ]
  }
};

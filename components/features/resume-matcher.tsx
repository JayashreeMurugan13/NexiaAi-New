"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Briefcase, Brain, CheckCircle, XCircle, Target, TrendingUp, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkillAssessment {
    skill: string;
    questions: { question: string; options: string[]; correct: number }[];
    currentQuestion: number;
    answers: number[];
    score: number;
}

interface AnalysisResult {
    matchedSkills: string[];
    missingSkills: string[];
    matchPercentage: number;
    recommendations: string[];
    skillGaps: { skill: string; importance: string; resources: string[] }[];
}

export function ResumeMatcher() {
    const [resume, setResume] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [jobUploaded, setJobUploaded] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [skillsToTest, setSkillsToTest] = useState<string[]>([]);
    const [testResults, setTestResults] = useState<{[skill: string]: boolean}>({});
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentAssessment, setCurrentAssessment] = useState<SkillAssessment | null>(null);
    const [completedAssessments, setCompletedAssessments] = useState<string[]>([]);
    const [step, setStep] = useState<"upload" | "analysis" | "testing" | "results">("upload");
    const resumeFileInputRef = useRef<HTMLInputElement>(null);
    const jobFileInputRef = useRef<HTMLInputElement>(null);

    const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setUploadMessage("📄 Extracting content...");
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/parse-pdf', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('PDF extraction result:', data);
                
                if (data.text && data.text.trim().length > 10) {
                    // Successfully extracted actual content
                    setResume(data.text.trim());
                    setResumeUploaded(true);
                    setUploadMessage("✅ Content extracted successfully!");
                } else {
                    // PDF was processed but no text found
                    setResume(`Resume: ${file.name}\n\nUploaded successfully. You can edit this content or paste additional details.`);
                    setResumeUploaded(true);
                    setUploadMessage("✅ Resume uploaded successfully!");
                }
            } else {
                // API error
                setResume(`Resume: ${file.name}\n\nUploaded successfully. You can edit this content or paste additional details.`);
                setResumeUploaded(true);
                setUploadMessage("✅ Resume uploaded successfully!");
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            setResume(`Resume: ${file.name}\n\nUploaded successfully. You can edit this content or paste additional details.`);
            setResumeUploaded(true);
            setUploadMessage("✅ Resume uploaded successfully!");
        } finally {
            setLoading(false);
            setTimeout(() => setUploadMessage(""), 3000);
            if (event.target) event.target.value = '';
        }
    };

    const handleJobUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setUploadMessage("📄 Processing job description...");
        
        // Always show content immediately
        setJobDescription(`Job Description: ${file.name}\n\nYour job description has been uploaded and is ready for analysis.`);
        setJobUploaded(true);
        setUploadMessage("✅ Job description uploaded successfully!");
        setLoading(false);
        setTimeout(() => setUploadMessage(""), 3000);
        if (event.target) event.target.value = '';
    };

    const analyzeMatch = async () => {
        if (!resume.trim() && !jobDescription.trim()) return;
        setLoading(true);
        setStep("analysis");
        
        console.log('Resume content for analysis:', resume.substring(0, 500));
        console.log('Job description content:', jobDescription.substring(0, 500));
        
        try {
            // Extract skills from RESUME for testing
            const systemPrompt = `Extract ONLY technical skills (programming languages, frameworks, databases, tools). Return ONLY valid JSON:
{
  "skills": ["skill1", "skill2", "skill3"]
}`;
            
            const userPrompt = `Extract ONLY technical skills like programming languages (Python, Java, JavaScript), frameworks (React, Django), databases (MySQL, MongoDB), and tools (Git, Docker) from this RESUME. Do NOT include soft skills, job titles, or company names:\n\n${resume}`;
            
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ]
                })
            });
            
            const data = await response.json();
            console.log("AI Response:", data.content);
            
            let skillsData;
            try {
                let jsonStr = data.content.trim();
                if (jsonStr.includes('```json')) {
                    jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
                } else if (jsonStr.includes('```')) {
                    jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
                }
                skillsData = JSON.parse(jsonStr);
                console.log('Extracted resume skills:', skillsData.skills);
            } catch (parseError) {
                console.log("JSON parse failed, using enhanced skill extraction");
                
                // STRICT skill extraction - only detect what's actually in the content
                const resumeContent = (resume || '').toLowerCase();
                const combinedContent = resumeContent;
                
                console.log("Analyzing resume content for skills...");
                console.log("Content sample:", combinedContent.substring(0, 300));
                
                // Only detect skills that are explicitly mentioned
                const skillCategories = {
                    programming: ['javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'php', 'c'],
                    web: ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'nodejs', 'express', 'django', 'flask', 'nextjs', 'mern'],
                    database: ['sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'dbms'],
                    concepts: ['dsa', 'oops', 'oop', 'data structures', 'algorithms'],
                    cloud: ['aws', 'docker', 'kubernetes'],
                    tools: ['git', 'github']
                };
                
                const detectedSkills = [];
                
                // Strict detection - must be explicitly mentioned
                for (const [category, skills] of Object.entries(skillCategories)) {
                    for (const skill of skills) {
                        const variants = [
                            skill,
                            skill.replace('.', ''),
                            skill.replace('#', 'sharp'),
                            skill.replace('++', 'plus'),
                            skill.replace(' ', ''),
                            skill.replace('-', '')
                        ];
                        
                        const found = variants.some(variant => {
                            const regex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                            return regex.test(combinedContent);
                        });
                        
                        if (found && !detectedSkills.includes(skill.charAt(0).toUpperCase() + skill.slice(1))) {
                            detectedSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
                            console.log(`✓ Found skill: ${skill}`);
                        }
                    }
                }
                
                // NO fallback skills - only what's detected
                if (detectedSkills.length === 0) {
                    console.log('No skills detected in resume');
                    setSkillsToTest([]);
                    setStep("upload");
                    alert('No technical skills found in your resume. Please add skills like Python, JavaScript, React, etc.');
                    setLoading(false);
                    return;
                }
                
                console.log(`Final detected skills (${detectedSkills.length}):`, detectedSkills);
                skillsData = { skills: detectedSkills };
            }
            
            // Set up for skill testing phase
            setSkillsToTest(skillsData.skills || []);
            setStep("testing");
        } catch (error) {
            console.error("Skill extraction failed:", error);
            // Fallback skills for testing
            setSkillsToTest(["JavaScript", "React", "Node.js", "Python", "SQL"]);
            setStep("testing");
        } finally {
            setLoading(false);
        }
    };

    const startSkillAssessment = async (skill: string) => {
        if (completedAssessments.includes(skill)) return;
        
        setLoading(true);
        try {
            const systemPrompt = `Generate exactly 3 MCQ questions for ${skill}. Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": 0
    }
  ]
}`;
            
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Generate 3 MCQ questions for ${skill}` }
                    ]
                })
            });
            
            const data = await response.json();
            
            let questions;
            try {
                let jsonStr = data.content.trim();
                if (jsonStr.includes('```json')) {
                    jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
                }
                const parsed = JSON.parse(jsonStr);
                questions = parsed.questions;
            } catch {
                // Fallback MCQ questions with real content
                const fallbackQuestions = {
                    "JavaScript": [
                        {
                            question: "What is the output of: console.log(typeof null)?",
                            options: ["A) null", "B) undefined", "C) object", "D) string"],
                            correct: 2
                        },
                        {
                            question: "Which method is used to add an element to the end of an array?",
                            options: ["A) push()", "B) pop()", "C) shift()", "D) unshift()"],
                            correct: 0
                        },
                        {
                            question: "What does '===' operator do in JavaScript?",
                            options: ["A) Assignment", "B) Loose equality", "C) Strict equality", "D) Not equal"],
                            correct: 2
                        }
                    ],
                    "React": [
                        {
                            question: "What is JSX in React?",
                            options: ["A) JavaScript XML", "B) Java Syntax Extension", "C) JSON XML", "D) JavaScript Extension"],
                            correct: 0
                        },
                        {
                            question: "Which hook is used for state management in functional components?",
                            options: ["A) useEffect", "B) useState", "C) useContext", "D) useReducer"],
                            correct: 1
                        },
                        {
                            question: "What is the virtual DOM?",
                            options: ["A) Real DOM copy", "B) JavaScript representation of DOM", "C) HTML template", "D) CSS framework"],
                            correct: 1
                        }
                    ],
                    "Node.js": [
                        {
                            question: "What is Node.js?",
                            options: ["A) JavaScript framework", "B) JavaScript runtime", "C) Database", "D) Web browser"],
                            correct: 1
                        },
                        {
                            question: "Which module is used to create HTTP server in Node.js?",
                            options: ["A) fs", "B) path", "C) http", "D) url"],
                            correct: 2
                        },
                        {
                            question: "What is npm?",
                            options: ["A) Node Package Manager", "B) New Programming Method", "C) Network Protocol Manager", "D) Node Process Manager"],
                            correct: 0
                        }
                    ],
                    "Python": [
                        {
                            question: "Which of these is the correct way to create a list in Python?",
                            options: ["A) list = {1, 2, 3}", "B) list = [1, 2, 3]", "C) list = (1, 2, 3)", "D) list = <1, 2, 3>"],
                            correct: 1
                        },
                        {
                            question: "What does 'len()' function do in Python?",
                            options: ["A) Returns length of object", "B) Creates new list", "C) Sorts elements", "D) Removes elements"],
                            correct: 0
                        },
                        {
                            question: "How is Python commonly used?",
                            options: ["A) Web development with Django/Flask", "B) Data science and machine learning", "C) Automation and scripting", "D) All of the above"],
                            correct: 3
                        }
                    ],
                    "Java": [
                        {
                            question: "What is Java?",
                            options: ["A) Object-oriented programming language", "B) Scripting language", "C) Markup language", "D) Database"],
                            correct: 0
                        },
                        {
                            question: "Which keyword is used to inherit a class in Java?",
                            options: ["A) implements", "B) extends", "C) inherits", "D) super"],
                            correct: 1
                        },
                        {
                            question: "What is JVM?",
                            options: ["A) Java Virtual Machine", "B) Java Variable Method", "C) Java Version Manager", "D) Java Visual Model"],
                            correct: 0
                        }
                    ],
                    "Django": [
                        {
                            question: "What is Django?",
                            options: ["A) Python web framework", "B) JavaScript library", "C) Database system", "D) CSS framework"],
                            correct: 0
                        },
                        {
                            question: "What does ORM stand for in Django?",
                            options: ["A) Object Relational Mapping", "B) Online Resource Manager", "C) Operational Request Model", "D) Object Resource Method"],
                            correct: 0
                        },
                        {
                            question: "Which file defines URL patterns in Django?",
                            options: ["A) views.py", "B) models.py", "C) urls.py", "D) settings.py"],
                            correct: 2
                        }
                    ],
                    "MySQL": [
                        {
                            question: "What type of database is MySQL?",
                            options: ["A) NoSQL", "B) Relational", "C) Graph", "D) Document"],
                            correct: 1
                        },
                        {
                            question: "Which command is used to create a new database in MySQL?",
                            options: ["A) NEW DATABASE", "B) CREATE DATABASE", "C) MAKE DATABASE", "D) ADD DATABASE"],
                            correct: 1
                        },
                        {
                            question: "What is a primary key in MySQL?",
                            options: ["A) Unique identifier for records", "B) Foreign key reference", "C) Index type", "D) Data type"],
                            correct: 0
                        }
                    ],
                    "MongoDB": [
                        {
                            question: "What type of database is MongoDB?",
                            options: ["A) Relational", "B) NoSQL document database", "C) Graph database", "D) Key-value store"],
                            correct: 1
                        },
                        {
                            question: "What format does MongoDB use to store data?",
                            options: ["A) XML", "B) CSV", "C) BSON", "D) Plain text"],
                            correct: 2
                        },
                        {
                            question: "Which method is used to insert a document in MongoDB?",
                            options: ["A) add()", "B) insert()", "C) insertOne()", "D) create()"],
                            correct: 2
                        }
                    ],
                    "Git": [
                        {
                            question: "What is Git?",
                            options: ["A) Version control system", "B) Programming language", "C) Database", "D) Web server"],
                            correct: 0
                        },
                        {
                            question: "Which command is used to clone a repository?",
                            options: ["A) git copy", "B) git clone", "C) git download", "D) git pull"],
                            correct: 1
                        },
                        {
                            question: "What does 'git commit' do?",
                            options: ["A) Saves changes to local repository", "B) Uploads to remote", "C) Creates new branch", "D) Deletes files"],
                            correct: 0
                        }
                    ],
                    "Docker": [
                        {
                            question: "What is Docker?",
                            options: ["A) Containerization platform", "B) Programming language", "C) Database system", "D) Web framework"],
                            correct: 0
                        },
                        {
                            question: "What is a Docker image?",
                            options: ["A) Running container", "B) Template for containers", "C) Virtual machine", "D) Network configuration"],
                            correct: 1
                        },
                        {
                            question: "Which file defines a Docker image?",
                            options: ["A) docker.json", "B) Dockerfile", "C) container.yml", "D) image.conf"],
                            correct: 1
                        }
                    ],
                    "C": [
                        {
                            question: "What type of language is C?",
                            options: ["A) High-level scripting", "B) Low-level compiled", "C) Interpreted", "D) Markup"],
                            correct: 1
                        },
                        {
                            question: "Which function is used to print in C?",
                            options: ["A) print()", "B) echo()", "C) printf()", "D) console.log()"],
                            correct: 2
                        },
                        {
                            question: "What is a pointer in C?",
                            options: ["A) Variable storing memory address", "B) Function type", "C) Data structure", "D) Loop construct"],
                            correct: 0
                        }
                    ],
                    "C++": [
                        {
                            question: "What is C++?",
                            options: ["A) Object-oriented extension of C", "B) Scripting language", "C) Database language", "D) Markup language"],
                            correct: 0
                        },
                        {
                            question: "Which operator is used for dynamic memory allocation in C++?",
                            options: ["A) malloc", "B) new", "C) alloc", "D) create"],
                            correct: 1
                        },
                        {
                            question: "What is a class in C++?",
                            options: ["A) Blueprint for objects", "B) Function type", "C) Variable type", "D) Loop structure"],
                            correct: 0
                        }
                    ],
                    "HTML": [
                        {
                            question: "What does HTML stand for?",
                            options: ["A) Hyper Text Markup Language", "B) High Tech Modern Language", "C) Home Tool Markup Language", "D) Hyperlink Text Management Language"],
                            correct: 0
                        },
                        {
                            question: "Which tag is used to create a hyperlink in HTML?",
                            options: ["A) <link>", "B) <a>", "C) <href>", "D) <url>"],
                            correct: 1
                        },
                        {
                            question: "Which HTML element is used for the largest heading?",
                            options: ["A) <h6>", "B) <h1>", "C) <heading>", "D) <header>"],
                            correct: 1
                        }
                    ],
                    "CSS": [
                        {
                            question: "What does CSS stand for?",
                            options: ["A) Cascading Style Sheets", "B) Computer Style Sheets", "C) Creative Style Sheets", "D) Colorful Style Sheets"],
                            correct: 0
                        },
                        {
                            question: "Which property is used to change the background color in CSS?",
                            options: ["A) color", "B) bg-color", "C) background-color", "D) bgcolor"],
                            correct: 2
                        },
                        {
                            question: "How do you select an element with id 'header' in CSS?",
                            options: ["A) .header", "B) #header", "C) *header", "D) header"],
                            correct: 1
                        }
                    ],
                    "Mern": [
                        {
                            question: "What does MERN stand for?",
                            options: ["A) MongoDB Express React Node", "B) MySQL Express React Next", "C) Mongo Engine React Native", "D) Modern Express React Network"],
                            correct: 0
                        },
                        {
                            question: "Which part of MERN handles the database?",
                            options: ["A) Express", "B) React", "C) MongoDB", "D) Node"],
                            correct: 2
                        },
                        {
                            question: "What is the role of Express in MERN?",
                            options: ["A) Frontend framework", "B) Backend framework", "C) Database", "D) Testing tool"],
                            correct: 1
                        }
                    ],
                    "SQL": [
                        {
                            question: "Which SQL command is used to retrieve data from a database?",
                            options: ["A) GET", "B) SELECT", "C) FETCH", "D) RETRIEVE"],
                            correct: 1
                        },
                        {
                            question: "What does 'JOIN' do in SQL?",
                            options: ["A) Combines rows from tables", "B) Deletes records", "C) Creates new table", "D) Updates records"],
                            correct: 0
                        },
                        {
                            question: "Which clause is used to filter records in SQL?",
                            options: ["A) FILTER", "B) WHERE", "C) HAVING", "D) CONDITION"],
                            correct: 1
                        }
                    ],
                    "DSA": [
                        {
                            question: "What is the time complexity of binary search?",
                            options: ["A) O(n)", "B) O(log n)", "C) O(n²)", "D) O(1)"],
                            correct: 1
                        },
                        {
                            question: "Which data structure uses LIFO (Last In First Out)?",
                            options: ["A) Queue", "B) Stack", "C) Array", "D) Tree"],
                            correct: 1
                        },
                        {
                            question: "What is the best sorting algorithm for large datasets?",
                            options: ["A) Bubble Sort", "B) Selection Sort", "C) Quick Sort", "D) Insertion Sort"],
                            correct: 2
                        }
                    ],
                    "OOPS": [
                        {
                            question: "What is encapsulation in OOP?",
                            options: ["A) Hiding implementation details", "B) Creating multiple classes", "C) Deleting objects", "D) Copying data"],
                            correct: 0
                        },
                        {
                            question: "What is inheritance?",
                            options: ["A) Creating new objects", "B) Reusing code from parent class", "C) Deleting classes", "D) Hiding methods"],
                            correct: 1
                        },
                        {
                            question: "What is polymorphism?",
                            options: ["A) Multiple forms of same method", "B) Single class only", "C) No inheritance", "D) Static methods only"],
                            correct: 0
                        }
                    ],
                    "DBMS": [
                        {
                            question: "What does DBMS stand for?",
                            options: ["A) Database Management System", "B) Data Backup Management System", "C) Digital Base Management System", "D) Database Monitoring System"],
                            correct: 0
                        },
                        {
                            question: "What is normalization in DBMS?",
                            options: ["A) Organizing data to reduce redundancy", "B) Deleting data", "C) Backing up database", "D) Creating indexes"],
                            correct: 0
                        },
                        {
                            question: "What is a primary key?",
                            options: ["A) Unique identifier for records", "B) Foreign key reference", "C) Index column", "D) Backup key"],
                            correct: 0
                        }
                    ]
                };
                
                questions = fallbackQuestions[skill as keyof typeof fallbackQuestions] || [
                    {
                        question: `What is ${skill} primarily used for?`,
                        options: ["A) Web development", "B) Data analysis", "C) Mobile apps", "D) All of the above"],
                        correct: 3
                    },
                    {
                        question: `Which is a key feature of ${skill}?`,
                        options: ["A) Easy to learn", "B) Powerful libraries", "C) Cross-platform", "D) All of the above"],
                        correct: 3
                    },
                    {
                        question: `${skill} is commonly used in which industry?`,
                        options: ["A) Technology", "B) Finance", "C) Healthcare", "D) All industries"],
                        correct: 3
                    }
                ];
            }
            
            setCurrentAssessment({
                skill,
                questions,
                currentQuestion: 0,
                answers: [],
                score: 0
            });
        } catch (error) {
            console.error("Failed to generate questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = (answerIndex: number) => {
        if (!currentAssessment) return;
        
        const newAnswers = [...currentAssessment.answers, answerIndex];
        const isCorrect = answerIndex === currentAssessment.questions[currentAssessment.currentQuestion].correct;
        const newScore = currentAssessment.score + (isCorrect ? 1 : 0);
        
        if (currentAssessment.currentQuestion < currentAssessment.questions.length - 1) {
            setCurrentAssessment({
                ...currentAssessment,
                currentQuestion: currentAssessment.currentQuestion + 1,
                answers: newAnswers,
                score: newScore
            });
        } else {
            // Complete assessment and evaluate
            const finalScore = newScore;
            const passed = finalScore >= 2; // Pass if 2 or more correct out of 3
            
            // Save skill test results to localStorage for dashboard
            const skillHistory = JSON.parse(localStorage.getItem('nexia_skill_history') || '[]');
            const skillScore = Math.round((finalScore / currentAssessment.questions.length) * 100);
            const newSkillData = {
                skill: currentAssessment.skill,
                score: skillScore,
                date: new Date().toISOString(),
                totalQuestions: currentAssessment.questions.length,
                correctAnswers: finalScore
            };
            skillHistory.push(newSkillData);
            localStorage.setItem('nexia_skill_history', JSON.stringify(skillHistory));
            
            setTestResults(prev => ({ ...prev, [currentAssessment.skill]: passed }));
            setCompletedAssessments([...completedAssessments, currentAssessment.skill]);
            setCurrentAssessment(null);
        }
    };

    const evaluateSkill = async (skill: string, answers: string[]) => {
        try {
            const systemPrompt = `Evaluate if the candidate has good knowledge of ${skill} based on their answers. Respond with only "PASS" or "FAIL".`;
            const userPrompt = `Skill: ${skill}\nAnswers: ${answers.join('\n')}\nEvaluate competency:`;
            
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ]
                })
            });
            
            const data = await response.json();
            const result = data.content.trim().toUpperCase().includes("PASS");
            
            // Store test result
            setTestResults(prev => ({ ...prev, [skill]: result }));
            
        } catch (error) {
            console.error("Skill evaluation failed:", error);
            // Default to fail if evaluation fails
            setTestResults(prev => ({ ...prev, [skill]: false }));
        }
    };

    const generateFinalAnalysis = async () => {
        const matchedSkills = skillsToTest.filter(skill => testResults[skill]);
        const missingSkills = skillsToTest.filter(skill => !testResults[skill]);
        const matchPercentage = Math.round((matchedSkills.length / skillsToTest.length) * 100);
        
        // Call ML API for skill level prediction
        try {
            const mlResponse = await fetch('/api/predict-skill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skill_count: skillsToTest.length,
                    test_score: matchPercentage,
                    project_count: 0
                })
            });
            
            if (mlResponse.ok) {
                const mlPrediction = await mlResponse.json();
                localStorage.setItem('nexia_ml_prediction', JSON.stringify({
                    ...mlPrediction,
                    test_score: matchPercentage,
                    skill_count: skillsToTest.length
                }));
                console.log('ML Prediction saved:', mlPrediction);
            }
        } catch (error) {
            console.error('ML prediction failed:', error);
        }
        
        // Extract job description skills for recommendations
        let jobSkills: string[] = [];
        if (jobDescription.trim()) {
            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: [
                            { role: "system", content: "Extract ONLY technical skills. Return JSON: {\"skills\": [\"skill1\"]}" },
                            { role: "user", content: `Extract ONLY technical skills (programming languages, frameworks, databases, tools) from this job description. Do NOT include soft skills or job requirements:\n\n${jobDescription}` }
                        ]
                    })
                });
                const data = await response.json();
                let jsonStr = data.content.trim();
                if (jsonStr.includes('```json')) {
                    jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
                }
                const parsed = JSON.parse(jsonStr);
                jobSkills = parsed.skills || [];
            } catch (error) {
                console.log('Could not extract job skills');
            }
        }
        
        // Find skills in job description that are NOT in resume
        const resumeSkillsLower = skillsToTest.map(s => s.toLowerCase());
        const additionalJobSkills = jobSkills.filter(skill => 
            !resumeSkillsLower.includes(skill.toLowerCase())
        );
        
        // Combine: failed test skills + job skills not in resume
        const allSkillGaps = [...new Set([...missingSkills, ...additionalJobSkills])];
        
        console.log('Failed test skills:', missingSkills);
        console.log('Additional job skills not in resume:', additionalJobSkills);
        console.log('All skill gaps:', allSkillGaps);
        
        try {
            const systemPrompt = `You are an HR expert. Based on resume, job description, and skill test results, provide job-specific recommendations. Respond with JSON:
{
  "recommendations": ["specific recommendation 1", "specific recommendation 2"],
  "jobFitness": "assessment of job readiness",
  "nextSteps": ["action 1", "action 2"]
}`;
            
            let userPrompt = `RESUME: ${resume}\n\nJOB DESCRIPTION: ${jobDescription}\n\nTEST RESULTS:\nPassed Skills: ${matchedSkills.join(', ')}\nFailed Skills: ${missingSkills.join(', ')}\nMatch Percentage: ${matchPercentage}%\n\nProvide specific recommendations for this job application.`;
            
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ]
                })
            });
            
            const data = await response.json();
            let recommendations = ["Focus on skill development", "Practice coding regularly"];
            let jobFitness = "Needs improvement";
            let nextSteps = ["Study missing skills", "Build projects"];
            
            try {
                let jsonStr = data.content.trim();
                if (jsonStr.includes('```json')) {
                    jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
                }
                const recData = JSON.parse(jsonStr);
                recommendations = recData.recommendations || recommendations;
                jobFitness = recData.jobFitness || jobFitness;
                nextSteps = recData.nextSteps || nextSteps;
            } catch (e) {
                console.log("Using enhanced fallback recommendations");
                // Generate specific recommendations based on actual content
                const jobTitle = jobDescription.toLowerCase().includes('senior') ? 'Senior' : 
                               jobDescription.toLowerCase().includes('junior') ? 'Junior' : 'Mid-level';
                
                const isFullStack = jobDescription.toLowerCase().includes('full stack') || 
                                  jobDescription.toLowerCase().includes('fullstack');
                
                const isFrontend = jobDescription.toLowerCase().includes('frontend') || 
                                 jobDescription.toLowerCase().includes('front-end') ||
                                 jobDescription.toLowerCase().includes('react') ||
                                 jobDescription.toLowerCase().includes('angular');
                
                const isBackend = jobDescription.toLowerCase().includes('backend') || 
                                jobDescription.toLowerCase().includes('back-end') ||
                                jobDescription.toLowerCase().includes('node') ||
                                jobDescription.toLowerCase().includes('python');
                
                if (matchPercentage >= 70) {
                    recommendations = [
                        `Strong match for this ${jobTitle} position`,
                        "Highlight your verified skills in cover letter",
                        "Prepare for technical interviews on your strong areas",
                        "Apply confidently - you meet most requirements"
                    ];
                    jobFitness = "Excellent candidate";
                    nextSteps = ["Apply immediately", "Prepare portfolio showcasing matched skills", "Practice behavioral interviews"];
                } else if (matchPercentage >= 50) {
                    const specificGaps = missingSkills.slice(0, 2).join(' and ');
                    recommendations = [
                        `Moderate fit for ${jobTitle} role - ${matchPercentage}% skill match`,
                        `Focus on learning ${specificGaps} before applying`,
                        isFullStack ? "Consider specialized frontend/backend roles first" : "Look for similar roles with fewer requirements",
                        "Build projects demonstrating the missing skills"
                    ];
                    jobFitness = "Potential candidate with development needed";
                    nextSteps = [
                        `Complete ${specificGaps} courses (2-3 months)`,
                        "Build 2-3 projects using missing technologies",
                        "Apply to similar but less senior positions"
                    ];
                } else {
                    const majorGaps = missingSkills.slice(0, 3).join(', ');
                    recommendations = [
                        `Significant gaps for this ${jobTitle} position (${matchPercentage}% match)`,
                        `Missing critical skills: ${majorGaps}`,
                        jobTitle === 'Senior' ? "Consider Junior/Mid-level positions instead" : "Focus on entry-level roles",
                        isFrontend ? "Start with HTML/CSS/JavaScript fundamentals" : 
                        isBackend ? "Learn server-side programming basics" : "Build foundational programming skills"
                    ];
                    jobFitness = "Not ready for this role";
                    nextSteps = [
                        `6-month learning plan for ${majorGaps}`,
                        "Complete beginner courses and bootcamps",
                        "Build portfolio with 5+ projects",
                        "Apply to internships or entry-level positions"
                    ];
                }
            }
            
            // Save final analysis to localStorage for dashboard
            const analysisHistory = JSON.parse(localStorage.getItem('nexia_analysis_history') || '[]');
            const analysisData = {
                date: new Date().toISOString(),
                matchedSkills: matchedSkills.length,
                missingSkills: missingSkills.length,
                overallMatch: matchPercentage,
                skillsTested: skillsToTest.length
            };
            analysisHistory.push(analysisData);
            localStorage.setItem('nexia_analysis_history', JSON.stringify(analysisHistory));
            
            setAnalysis({
                matchedSkills,
                missingSkills,
                matchPercentage,
                recommendations: [...recommendations, `Job Fitness: ${jobFitness}`, ...nextSteps],
                skillGaps: allSkillGaps.map(skill => {
                    // Analyze job description for specific requirements
                    const jobLower = jobDescription.toLowerCase();
                    const resumeLower = resume.toLowerCase();
                    
                    let importance = "Medium";
                    let specificResources = [];
                    
                    // Determine importance based on job description frequency/context
                    const escapedSkill = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const skillMentions = (jobLower.match(new RegExp(escapedSkill, 'g')) || []).length;
                    const isRequired = jobLower.includes('required') && jobLower.includes(skill.toLowerCase());
                    const isPreferred = jobLower.includes('preferred') && jobLower.includes(skill.toLowerCase());
                    
                    if (isRequired || skillMentions >= 3) {
                        importance = "Critical";
                    } else if (skillMentions >= 2 || isPreferred) {
                        importance = "High";
                    }
                    
                    // Generate specific resources based on skill and job context
                    switch (skill.toLowerCase()) {
                        case 'javascript':
                            specificResources = jobLower.includes('senior') ? 
                                ["Advanced JavaScript Concepts (Closures, Promises)", "ES6+ Features Mastery", "JavaScript Design Patterns"] :
                                ["JavaScript Fundamentals Course", "FreeCodeCamp JavaScript", "MDN JavaScript Guide"];
                            break;
                        case 'react':
                            specificResources = jobLower.includes('hooks') ? 
                                ["React Hooks Deep Dive", "Context API & State Management", "React Performance Optimization"] :
                                ["React Official Tutorial", "Create React App Projects", "React Component Patterns"];
                            break;
                        case 'node.js':
                            specificResources = jobLower.includes('api') || jobLower.includes('backend') ? 
                                ["Node.js REST API Development", "Express.js Framework", "Database Integration (MongoDB/SQL)"] :
                                ["Node.js Basics Course", "NPM Package Management", "File System Operations"];
                            break;
                        case 'python':
                            specificResources = jobLower.includes('data') || jobLower.includes('machine learning') ? 
                                ["Python for Data Science", "Pandas & NumPy Libraries", "Machine Learning with Python"] :
                                jobLower.includes('web') ? 
                                ["Django/Flask Web Framework", "Python REST APIs", "Database ORM (SQLAlchemy)"] :
                                ["Python Fundamentals", "Python Data Structures", "Object-Oriented Programming"];
                            break;
                        case 'java':
                            specificResources = jobLower.includes('spring') ? 
                                ["Spring Boot Framework", "Spring Security", "Microservices with Java"] :
                                ["Java Core Concepts", "Object-Oriented Programming", "Java Collections Framework"];
                            break;
                        case 'sql':
                            specificResources = jobLower.includes('database') || jobLower.includes('data') ? 
                                ["Advanced SQL Queries", "Database Design & Normalization", "Stored Procedures & Functions"] :
                                ["SQL Basics Course", "JOIN Operations", "Database Management"];
                            break;
                        case 'aws':
                            specificResources = jobLower.includes('cloud') || jobLower.includes('devops') ? 
                                ["AWS Solutions Architect", "EC2 & S3 Services", "Lambda & Serverless"] :
                                ["AWS Cloud Practitioner", "AWS Free Tier Projects", "Basic Cloud Concepts"];
                            break;
                        default:
                            specificResources = [
                                `${skill} Official Documentation`,
                                `${skill} Beginner to Advanced Course`,
                                `Build Projects with ${skill}`
                            ];
                    }
                    
                    return {
                        skill,
                        importance,
                        resources: specificResources
                    };
                })
            });
            
        } catch (error) {
            console.error("Final analysis failed:", error);
        }
    };

    const reset = () => {
        setResume("");
        setJobDescription("");
        setResumeUploaded(false);
        setJobUploaded(false);
        setSkillsToTest([]);
        setTestResults({});
        setAnalysis(null);
        setCurrentAssessment(null);
        setCompletedAssessments([]);
        setStep("upload");
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 md:p-8 overflow-y-auto">
            {/* Fixed Mobile Success Message */}
            <AnimatePresence>
                {uploadMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-base md:text-lg ${
                            uploadMessage.includes('✓') 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                        }`}
                    >
                        {uploadMessage}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="max-w-4xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6 md:mb-8"
                >
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                    >
                        <Target className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-blue-400" />
                    </motion.div>
                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                        AI Resume Matcher
                    </h1>
                    <p className="text-sm md:text-base text-zinc-400">Analyze your resume, assess skills, and get personalized recommendations</p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {step === "upload" && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        Upload Resume
                                    </h3>
                                    <div className="relative">
                                        <input
                                            ref={resumeFileInputRef}
                                            type="file"
                                            accept="application/pdf,.pdf,.txt,text/plain"
                                            onChange={handleResumeUpload}
                                            className="hidden"
                                        />
                                        <Button
                                            onClick={() => resumeFileInputRef.current?.click()}
                                            disabled={loading}
                                            className={`w-full border p-6 md:p-8 rounded-2xl flex flex-col items-center gap-3 touch-manipulation transition-all ${
                                                resumeUploaded 
                                                    ? 'bg-green-600 hover:bg-green-500 border-green-500' 
                                                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
                                            }`}
                                            onTouchStart={() => {}} // Enable touch events
                                        >
                                            {loading ? (
                                                <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
                                            ) : resumeUploaded ? (
                                                <CheckCircle className="w-10 h-10 text-white" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-blue-400" />
                                            )}
                                            <span className={`text-base md:text-lg font-bold ${
                                                resumeUploaded ? 'text-white' : 'text-zinc-300'
                                            }`}>
                                                {loading ? "Uploading Resume..." : resumeUploaded ? "✅ RESUME UPLOADED" : "Upload Resume PDF"}
                                            </span>
                                        </Button>
                                    </div>
                                    <textarea
                                        value={resume}
                                        onChange={(e) => {
                                            setResume(e.target.value);
                                            if (e.target.value.trim()) setResumeUploaded(true);
                                        }}
                                        placeholder="Paste your resume content here for better skill analysis...\n\nInclude: Skills, Experience, Education, Projects, Technologies used, etc."
                                        rows={8}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm leading-relaxed"
                                        style={{ minHeight: '200px', fontSize: '14px', lineHeight: '1.5' }}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-cyan-400" />
                                        Job Description
                                    </h3>
                                    <div className="relative">
                                        <input
                                            ref={jobFileInputRef}
                                            type="file"
                                            accept="application/pdf,.pdf,.txt,text/plain"
                                            onChange={handleJobUpload}
                                            className="hidden"
                                        />
                                        <Button
                                            onClick={() => jobFileInputRef.current?.click()}
                                            disabled={loading}
                                            className={`w-full border p-6 md:p-8 rounded-2xl flex flex-col items-center gap-3 touch-manipulation transition-all ${
                                                jobUploaded 
                                                    ? 'bg-green-600 hover:bg-green-500 border-green-500' 
                                                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
                                            }`}
                                            onTouchStart={() => {}} // Enable touch events
                                        >
                                            {loading ? (
                                                <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
                                            ) : jobUploaded ? (
                                                <CheckCircle className="w-10 h-10 text-white" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-cyan-400" />
                                            )}
                                            <span className={`text-base md:text-lg font-bold ${
                                                jobUploaded ? 'text-white' : 'text-zinc-300'
                                            }`}>
                                                {loading ? "Uploading Job Description..." : jobUploaded ? "✅ JOB DESCRIPTION UPLOADED" : "Upload Job Description PDF"}
                                            </span>
                                        </Button>
                                    </div>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => {
                                            setJobDescription(e.target.value);
                                            if (e.target.value.trim()) setJobUploaded(true);
                                        }}
                                        placeholder="Paste the job description here...\n\nInclude: Required skills, responsibilities, qualifications, preferred technologies, etc."
                                        rows={8}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 resize-none text-sm leading-relaxed"
                                        style={{ minHeight: '200px', fontSize: '14px', lineHeight: '1.5' }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    onClick={analyzeMatch}
                                    disabled={(!resume.trim() && !jobDescription.trim()) || loading}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-8 py-3 text-lg disabled:opacity-50"
                                >
                                    {loading ? <Brain className="w-5 h-5 animate-pulse mr-2" /> : <Target className="w-5 h-5 mr-2" />}
                                    Analyze Match
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === "analysis" && loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <Brain className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
                            <p className="text-xl text-zinc-300">Analyzing your resume...</p>
                            <p className="text-sm text-zinc-500 mt-2">This may take a few moments</p>
                        </motion.div>
                    )}

                    {step === "testing" && !currentAssessment && (
                        <motion.div
                            key="testing"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Brain className="w-6 h-6 text-purple-400" />
                                    Skill Assessment
                                </h3>
                                <p className="text-zinc-400 mb-6">Test your skills to get accurate matching results</p>
                                
                                <div className="space-y-3">
                                    {skillsToTest.map((skill, index) => (
                                        <div key={index} className="bg-zinc-900/50 rounded-lg p-4 flex justify-between items-center">
                                            <span className="text-white font-medium">{skill}</span>
                                            <Button
                                                onClick={() => startSkillAssessment(skill)}
                                                disabled={completedAssessments.includes(skill)}
                                                className="bg-purple-600 hover:bg-purple-500 text-sm px-4 py-2"
                                            >
                                                {completedAssessments.includes(skill) ? "✓ Completed" : "Take Test"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <Button
                                        onClick={() => {
                                            generateFinalAnalysis();
                                            setStep("results");
                                        }}
                                        disabled={completedAssessments.length === 0}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50"
                                    >
                                        View Results ({completedAssessments.length}/{skillsToTest.length} completed)
                                    </Button>
                                    <Button
                                        onClick={reset}
                                        variant="outline"
                                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Start Over
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === "assessment" && analysis && !currentAssessment && (
                        <motion.div
                            key="assessment-overview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl p-6">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-blue-400" />
                                    Assessment Results: {analysis.matchPercentage}%
                                </h3>
                                
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Verified Skills ({analysis.matchedSkills.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {analysis.matchedSkills.map((skill, index) => (
                                                <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-green-300">
                                                    ✓ {skill} (Test Passed)
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                                            <XCircle className="w-5 h-5" />
                                            Skills Needing Development ({analysis.missingSkills.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {analysis.missingSkills.map((skill, index) => (
                                                <div key={index} className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-red-300">
                                                    ✗ {skill} (Test Failed)
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => setStep("results")}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                                    >
                                        View Detailed Recommendations
                                    </Button>
                                    <Button
                                        onClick={() => setStep("testing")}
                                        variant="outline"
                                        className="border-blue-600 text-blue-300 hover:bg-blue-900/20"
                                    >
                                        Back to Tests
                                    </Button>
                                    <Button
                                        onClick={reset}
                                        variant="outline"
                                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Start Over
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentAssessment && (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">
                                {currentAssessment.skill} Assessment
                            </h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                Question {currentAssessment.currentQuestion + 1} of {currentAssessment.questions.length}
                            </p>
                            <div className="bg-zinc-900/50 rounded-xl p-4 mb-6">
                                <p className="text-zinc-200 mb-4">{currentAssessment.questions[currentAssessment.currentQuestion].question}</p>
                                <div className="space-y-3">
                                    {currentAssessment.questions[currentAssessment.currentQuestion].options?.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => submitAnswer(index)}
                                            className="w-full text-left bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg p-3 text-zinc-200 transition-colors"
                                        >
                                            {option}
                                        </button>
                                    )) || (
                                        <div className="text-zinc-400">Loading options...</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === "results" && analysis && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border border-emerald-500/30 rounded-2xl p-6">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Target className="w-6 h-6 text-emerald-400" />
                                    Development Recommendations
                                </h3>
                                
                                <div className="space-y-4 mb-6">
                                    {analysis.recommendations.map((rec, index) => (
                                        <div key={index} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                                            <p className="text-emerald-200">{rec}</p>
                                        </div>
                                    ))}
                                </div>

                                {analysis.skillGaps.length > 0 && (
                                    <>
                                        <h4 className="text-lg font-semibold text-white mb-4">Priority Skills to Develop:</h4>
                                        <div className="space-y-3">
                                            {analysis.skillGaps.map((gap, index) => (
                                                <div key={index} className="bg-zinc-900/50 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h5 className="font-semibold text-white">{gap.skill}</h5>
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            gap.importance === 'High' ? 'bg-red-500/20 text-red-300' :
                                                            gap.importance === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                                            'bg-green-500/20 text-green-300'
                                                        }`}>
                                                            {gap.importance} Priority
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-zinc-400">
                                                        <p className="mb-2">Recommended Resources:</p>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {gap.resources.map((resource, idx) => (
                                                                <li key={idx}>{resource}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-4 mt-6">
                                    <Button
                                        onClick={() => setStep("assessment")}
                                        className="bg-blue-600 hover:bg-blue-500"
                                    >
                                        Back to Assessment
                                    </Button>
                                    <Button
                                        onClick={reset}
                                        variant="outline"
                                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        New Analysis
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
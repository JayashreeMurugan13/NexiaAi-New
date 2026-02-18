"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Clock, ExternalLink, Star, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobRecommendation {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    matchScore: number;
    skills: string[];
    description: string;
    posted: string;
    url: string;
}

export function JobRecommendations() {
    const [jobs, setJobs] = useState<JobRecommendation[]>([]);
    const [userSkills, setUserSkills] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("all");
    const [showIndiaDropdown, setShowIndiaDropdown] = useState(false);

    useEffect(() => {
        // Load user skills from Resume Matcher history
        const skillHistory = JSON.parse(localStorage.getItem('nexia_skill_history') || '[]');
        const skills = skillHistory.map((s: any) => s.skill);
        setUserSkills(skills);
        
        if (skills.length > 0) {
            generateJobRecommendations(skills);
        }
    }, []);

    const generateJobRecommendations = async (skills: string[]) => {
        setLoading(true);
        
        try {
            // Fetch real jobs from API
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    skills,
                    location: 'remote'
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.jobs && data.jobs.length > 0) {
                setJobs(data.jobs);
            } else {
                // Use enhanced realistic job data
                setJobs(generateEnhancedMockJobs(skills));
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            // Use enhanced realistic job data
            setJobs(generateEnhancedMockJobs(skills));
        } finally {
            setLoading(false);
        }
    };
    
    const generateEnhancedMockJobs = (skills: string[]) => {
        const jobTemplates = [
            {
                title: "Frontend Developer",
                company: "TechCorp Solutions",
                location: "San Francisco, CA",
                salary: "$85,000 - $120,000",
                type: "Full-time",
                skills: ["JavaScript", "React", "HTML", "CSS"],
                description: "Build responsive web applications using modern JavaScript frameworks. Work with a dynamic team on cutting-edge projects.",
                url: "https://www.indeed.com/jobs?q=frontend+developer&l=San+Francisco%2C+CA"
            },
            {
                title: "Full Stack Engineer",
                company: "StartupXYZ Inc",
                location: "New York, NY",
                salary: "$90,000 - $130,000",
                type: "Full-time",
                skills: ["JavaScript", "React", "Node.js", "Python"],
                description: "Join our growing startup as a Full Stack Engineer. Work on both frontend and backend systems using modern technologies.",
                url: "https://www.linkedin.com/jobs/search/?keywords=full%20stack%20engineer&location=New%20York%2C%20NY"
            },
            {
                title: "Python Developer",
                company: "DataTech Analytics",
                location: "Austin, TX",
                salary: "$80,000 - $115,000",
                type: "Full-time",
                skills: ["Python", "SQL", "Django"],
                description: "Develop data processing applications and APIs using Python. Experience with Django and database management required.",
                url: "https://www.glassdoor.com/Job/python-developer-jobs-SRCH_KO0,16.htm"
            },
            {
                title: "React Developer",
                company: "Digital Innovations LLC",
                location: "Remote",
                salary: "$75,000 - $105,000",
                type: "Full-time",
                skills: ["React", "JavaScript", "TypeScript"],
                description: "Remote React Developer position. Build modern web applications with React and TypeScript. Flexible work environment.",
                url: "https://remoteok.io/remote-react-jobs"
            },
            {
                title: "Software Engineer",
                company: "Enterprise Solutions Corp",
                location: "Seattle, WA",
                salary: "$95,000 - $140,000",
                type: "Full-time",
                skills: ["JavaScript", "Python", "AWS"],
                description: "Build scalable enterprise applications using cloud technologies. Experience with AWS and modern programming languages.",
                url: "https://www.indeed.com/jobs?q=software+engineer&l=Seattle%2C+WA"
            },
            {
                title: "Web Developer",
                company: "Creative Digital Agency",
                location: "Los Angeles, CA",
                salary: "$65,000 - $90,000",
                type: "Contract",
                skills: ["HTML", "CSS", "JavaScript"],
                description: "Create beautiful, responsive websites for clients. Work with designers and project managers in a creative environment.",
                url: "https://www.linkedin.com/jobs/search/?keywords=web%20developer&location=Los%20Angeles%2C%20CA"
            },
            {
                title: "Node.js Developer",
                company: "CloudTech Systems",
                location: "Denver, CO",
                salary: "$85,000 - $120,000",
                type: "Full-time",
                skills: ["Node.js", "JavaScript", "MongoDB"],
                description: "Backend development using Node.js and MongoDB. Build APIs and microservices for cloud-based applications.",
                url: "https://www.glassdoor.com/Job/nodejs-developer-jobs-SRCH_KO0,16.htm"
            },
            {
                title: "JavaScript Engineer",
                company: "InnovateTech Partners",
                location: "Boston, MA",
                salary: "$88,000 - $125,000",
                type: "Full-time",
                skills: ["JavaScript", "Vue.js", "Node.js"],
                description: "JavaScript Engineer role focusing on modern web development. Experience with Vue.js and Node.js preferred.",
                url: "https://www.indeed.com/jobs?q=javascript+engineer&l=Boston%2C+MA"
            },
            {
                title: "Full Stack Developer",
                company: "TechMahindra",
                location: "Bangalore, India",
                salary: "₹8,00,000 - ₹15,00,000",
                type: "Full-time",
                skills: ["JavaScript", "React", "Node.js", "MongoDB"],
                description: "Join our Bangalore team as a Full Stack Developer. Work on enterprise applications using MERN stack.",
                url: "https://www.naukri.com/jobs-in-bangalore-full-stack-developer"
            },
            {
                title: "React Developer",
                company: "Infosys Limited",
                location: "Coimbatore, India",
                salary: "₹6,00,000 - ₹12,00,000",
                type: "Full-time",
                skills: ["React", "JavaScript", "TypeScript", "Redux"],
                description: "React Developer position in Coimbatore. Build modern web applications for global clients using React ecosystem.",
                url: "https://www.naukri.com/jobs-in-coimbatore-react-developer"
            },
            {
                title: "Frontend Developer",
                company: "Zoho Corporation",
                location: "Coimbatore, India",
                salary: "₹5,50,000 - ₹10,00,000",
                type: "Full-time",
                skills: ["JavaScript", "React", "HTML", "CSS"],
                description: "Frontend Developer at Zoho Coimbatore. Build user interfaces for our suite of business applications.",
                url: "https://www.naukri.com/jobs-in-coimbatore-frontend-developer"
            },
            {
                title: "Software Engineer",
                company: "Wipro Technologies",
                location: "Hyderabad, India",
                salary: "₹7,50,000 - ₹14,00,000",
                type: "Full-time",
                skills: ["Java", "Python", "JavaScript", "AWS"],
                description: "Software Engineer role in Hyderabad. Work on cloud-native applications and microservices architecture.",
                url: "https://www.naukri.com/jobs-in-hyderabad-software-engineer"
            },
            {
                title: "Python Developer",
                company: "Accenture India",
                location: "Chennai, India",
                salary: "₹6,50,000 - ₹11,50,000",
                type: "Full-time",
                skills: ["Python", "Django", "SQL", "AWS"],
                description: "Python Developer role in Chennai. Develop scalable web applications and data processing systems.",
                url: "https://www.naukri.com/jobs-in-chennai-python-developer"
            },
            {
                title: "Full Stack Developer",
                company: "HCL Technologies",
                location: "Mumbai, India",
                salary: "₹8,50,000 - ₹16,00,000",
                type: "Full-time",
                skills: ["JavaScript", "Angular", "Node.js", "SQL"],
                description: "Full Stack Developer position in Mumbai. Work on enterprise web applications using Angular and Node.js.",
                url: "https://www.naukri.com/jobs-in-mumbai-full-stack-developer"
            },
            {
                title: "React Developer",
                company: "Cognizant",
                location: "Pune, India",
                salary: "₹7,00,000 - ₹13,00,000",
                type: "Full-time",
                skills: ["React", "JavaScript", "Redux", "TypeScript"],
                description: "React Developer role in Pune. Build modern web applications for global clients using React ecosystem.",
                url: "https://www.naukri.com/jobs-in-pune-react-developer"
            },
            {
                title: "Java Developer",
                company: "Capgemini India",
                location: "Delhi, India",
                salary: "₹8,00,000 - ₹15,50,000",
                type: "Full-time",
                skills: ["Java", "Spring Boot", "MySQL", "AWS"],
                description: "Java Developer position in Delhi NCR. Develop enterprise applications using Spring Boot and cloud technologies.",
                url: "https://www.naukri.com/jobs-in-delhi-java-developer"
            },
            {
                title: "Frontend Developer",
                company: "Mindtree Limited",
                location: "Madurai, India",
                salary: "₹5,00,000 - ₹9,50,000",
                type: "Full-time",
                skills: ["JavaScript", "Vue.js", "HTML", "CSS"],
                description: "Frontend Developer opportunity in Madurai. Create responsive web interfaces using Vue.js and modern CSS.",
                url: "https://www.naukri.com/jobs-in-madurai-frontend-developer"
            }
        ];
        
        // Filter and score jobs based on user skills
        return jobTemplates.map((job, i) => {
            const matchingSkills = job.skills.filter(skill => 
                skills.some(userSkill => 
                    userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(userSkill.toLowerCase())
                )
            );
            const matchScore = Math.round((matchingSkills.length / job.skills.length) * 100);
            
            return {
                id: `job-${i}`,
                ...job,
                matchScore,
                posted: `${Math.floor(Math.random() * 7) + 1} days ago`
            };
        }).sort((a, b) => b.matchScore - a.matchScore);
    };

    const filteredJobs = jobs.filter(job => {
        // Job type filter
        let passesTypeFilter = true;
        if (filter === "high-match") passesTypeFilter = job.matchScore >= 75;
        else if (filter === "remote") passesTypeFilter = job.location.toLowerCase().includes("remote");
        else if (filter !== "all") passesTypeFilter = job.type.toLowerCase() === filter;
        
        // Location filter
        let passesLocationFilter = true;
        const indianCities = ["bangalore", "coimbatore", "hyderabad", "chennai", "mumbai", "delhi", "pune", "kolkata", "ahmedabad", "jaipur", "lucknow", "kochi", "indore", "bhubaneswar", "thiruvananthapuram", "madurai", "salem", "tiruchirappalli", "erode", "vellore"];
        
        if (indianCities.includes(locationFilter)) {
            passesLocationFilter = job.location.toLowerCase().includes(locationFilter);
        } else if (locationFilter === "us") {
            passesLocationFilter = job.location.includes("CA") || job.location.includes("NY") || 
                                 job.location.includes("WA") || job.location.includes("TX") ||
                                 job.location.includes("MA") || job.location.includes("CO");
        } else if (locationFilter === "remote") {
            passesLocationFilter = job.location.toLowerCase().includes("remote");
        }
        
        return passesTypeFilter && passesLocationFilter;
    });

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-2">
                        Job Recommendations
                    </h1>
                    <p className="text-zinc-400">AI-powered job matching based on your skills</p>
                </motion.div>

                {/* Filters */}
                <div className="space-y-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-zinc-400 text-sm font-medium">Job Type:</span>
                        {[
                            { key: "all", label: "All Jobs" },
                            { key: "high-match", label: "High Match" },
                            { key: "remote", label: "Remote" },
                            { key: "full-time", label: "Full-time" },
                            { key: "contract", label: "Contract" }
                        ].map((filterOption) => (
                            <Button
                                key={filterOption.key}
                                onClick={() => setFilter(filterOption.key)}
                                variant={filter === filterOption.key ? "default" : "outline"}
                                size="sm"
                                className={filter === filterOption.key ? 
                                    "bg-blue-600 hover:bg-blue-500" : 
                                    "border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                }
                            >
                                {filterOption.label}
                            </Button>
                        ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 relative">
                        <span className="text-zinc-400 text-sm font-medium">Location:</span>
                        {[
                            { key: "all", label: "All Locations" },
                            { key: "us", label: "United States" },
                            { key: "remote", label: "Remote Only" }
                        ].map((locationOption) => (
                            <Button
                                key={locationOption.key}
                                onClick={() => {
                                    setLocationFilter(locationOption.key);
                                    setShowIndiaDropdown(false);
                                }}
                                variant={locationFilter === locationOption.key ? "default" : "outline"}
                                size="sm"
                                className={locationFilter === locationOption.key ? 
                                    "bg-green-600 hover:bg-green-500" : 
                                    "border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                }
                            >
                                {locationOption.label}
                            </Button>
                        ))}
                        
                        {/* India Dropdown */}
                        <div className="relative">
                            <Button
                                onClick={() => setShowIndiaDropdown(!showIndiaDropdown)}
                                variant={locationFilter.includes("india") || ["bangalore", "coimbatore", "hyderabad", "chennai", "mumbai", "delhi", "pune", "kolkata", "ahmedabad", "jaipur", "lucknow", "kochi", "indore", "bhubaneswar", "thiruvananthapuram", "madurai", "salem", "tiruchirappalli", "erode", "vellore"].includes(locationFilter) ? "default" : "outline"}
                                size="sm"
                                className={locationFilter.includes("india") || ["bangalore", "coimbatore", "hyderabad", "chennai", "mumbai", "delhi", "pune", "kolkata", "ahmedabad", "jaipur", "lucknow", "kochi", "indore", "bhubaneswar", "thiruvananthapuram", "madurai", "salem", "tiruchirappalli", "erode", "vellore"].includes(locationFilter) ? 
                                    "bg-green-600 hover:bg-green-500" : 
                                    "border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                }
                            >
                                India ▼
                            </Button>
                            
                            {showIndiaDropdown && (
                                <div className="absolute top-full left-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-10 min-w-48 max-h-64 overflow-y-auto">
                                    <div className="p-2">
                                        <div className="text-xs text-zinc-500 font-semibold mb-2 px-2">MAJOR TECH HUBS</div>
                                        {[
                                            { key: "bangalore", label: "Bangalore" },
                                            { key: "hyderabad", label: "Hyderabad" },
                                            { key: "chennai", label: "Chennai" },
                                            { key: "mumbai", label: "Mumbai" },
                                            { key: "delhi", label: "Delhi NCR" },
                                            { key: "pune", label: "Pune" }
                                        ].map((city) => (
                                            <button
                                                key={city.key}
                                                onClick={() => {
                                                    setLocationFilter(city.key);
                                                    setShowIndiaDropdown(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-zinc-800 ${
                                                    locationFilter === city.key ? 'bg-green-600 text-white' : 'text-zinc-300'
                                                }`}
                                            >
                                                {city.label}
                                            </button>
                                        ))}
                                        
                                        <div className="text-xs text-zinc-500 font-semibold mb-2 px-2 mt-3">TAMIL NADU</div>
                                        {[
                                            { key: "coimbatore", label: "Coimbatore" },
                                            { key: "madurai", label: "Madurai" },
                                            { key: "salem", label: "Salem" },
                                            { key: "tiruchirappalli", label: "Tiruchirappalli" },
                                            { key: "erode", label: "Erode" },
                                            { key: "vellore", label: "Vellore" },
                                            { key: "thiruvananthapuram", label: "Thiruvananthapuram" }
                                        ].map((city) => (
                                            <button
                                                key={city.key}
                                                onClick={() => {
                                                    setLocationFilter(city.key);
                                                    setShowIndiaDropdown(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-zinc-800 ${
                                                    locationFilter === city.key ? 'bg-green-600 text-white' : 'text-zinc-300'
                                                }`}
                                            >
                                                {city.label}
                                            </button>
                                        ))}
                                        
                                        <div className="text-xs text-zinc-500 font-semibold mb-2 px-2 mt-3">OTHER CITIES</div>
                                        {[
                                            { key: "kolkata", label: "Kolkata" },
                                            { key: "ahmedabad", label: "Ahmedabad" },
                                            { key: "jaipur", label: "Jaipur" },
                                            { key: "lucknow", label: "Lucknow" },
                                            { key: "kochi", label: "Kochi" },
                                            { key: "indore", label: "Indore" },
                                            { key: "bhubaneswar", label: "Bhubaneswar" }
                                        ].map((city) => (
                                            <button
                                                key={city.key}
                                                onClick={() => {
                                                    setLocationFilter(city.key);
                                                    setShowIndiaDropdown(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-zinc-800 ${
                                                    locationFilter === city.key ? 'bg-green-600 text-white' : 'text-zinc-300'
                                                }`}
                                            >
                                                {city.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
                        <p className="text-xl text-zinc-300">Finding perfect job matches...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map((job, index) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-1">{job.title}</h3>
                                        <p className="text-zinc-400">{job.company}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            job.matchScore >= 80 ? 'bg-green-500/20 text-green-400' :
                                            job.matchScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                            {job.matchScore}% Match
                                        </div>
                                        <Star className="w-4 h-4 text-yellow-400" />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <MapPin className="w-4 h-4" />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <DollarSign className="w-4 h-4" />
                                        <span>{job.salary}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Clock className="w-4 h-4" />
                                        <span>{job.posted}</span>
                                    </div>
                                </div>

                                <p className="text-zinc-300 mb-4">{job.description}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.skills.map((skill, skillIndex) => {
                                        const isMatched = userSkills.some(userSkill => 
                                            userSkill.toLowerCase().includes(skill.toLowerCase())
                                        );
                                        return (
                                            <span
                                                key={skillIndex}
                                                className={`px-3 py-1 rounded-full text-sm ${
                                                    isMatched 
                                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                                        : 'bg-zinc-800 text-zinc-400'
                                                }`}
                                            >
                                                {skill}
                                            </span>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-3">
                                    <Button 
                                        className="bg-blue-600 hover:bg-blue-500"
                                        onClick={() => {
                                            // Track job application click
                                            const jobClicks = JSON.parse(localStorage.getItem('nexia_job_clicks') || '[]');
                                            jobClicks.push({
                                                jobId: job.id,
                                                title: job.title,
                                                company: job.company,
                                                clickedAt: new Date().toISOString()
                                            });
                                            localStorage.setItem('nexia_job_clicks', JSON.stringify(jobClicks));
                                            
                                            // Open job in new tab
                                            window.open(job.url, '_blank');
                                        }}
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Apply Now
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                                        onClick={() => {
                                            // Save job to localStorage
                                            const savedJobs = JSON.parse(localStorage.getItem('nexia_saved_jobs') || '[]');
                                            const isAlreadySaved = savedJobs.some((saved: any) => saved.id === job.id);
                                            
                                            if (!isAlreadySaved) {
                                                savedJobs.push({
                                                    ...job,
                                                    savedAt: new Date().toISOString()
                                                });
                                                localStorage.setItem('nexia_saved_jobs', JSON.stringify(savedJobs));
                                                alert('Job saved successfully!');
                                            } else {
                                                alert('Job already saved!');
                                            }
                                        }}
                                    >
                                        Save Job
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredJobs.length === 0 && (
                    <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 mx-auto mb-4 text-zinc-500" />
                        <p className="text-xl text-zinc-400">No jobs found matching your criteria</p>
                        <p className="text-zinc-500">Try adjusting your filters or complete skill assessments</p>
                    </div>
                )}
            </div>
        </div>
    );
}
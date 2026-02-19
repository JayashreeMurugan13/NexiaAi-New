import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { skills, location = 'remote' } = await request.json();
        
        console.log('Job API called with skills:', skills, 'location:', location);
        
        // Use multiple job APIs for real job data
        const [remoteOKJobs, jSearchJobs, adzunaJobs, naukriJobs, linkedInJobs] = await Promise.all([
            fetchFromRemoteOK(skills),
            fetchFromJSearch(skills, location),
            fetchFromAdzuna(skills, location),
            fetchFromNaukri(skills, location),
            fetchFromLinkedIn(skills, location)
        ]);
        
        console.log('RemoteOK jobs:', remoteOKJobs.length);
        console.log('JSearch jobs:', jSearchJobs.length);
        console.log('Adzuna jobs:', adzunaJobs.length);
        console.log('Naukri jobs:', naukriJobs.length);
        console.log('LinkedIn jobs:', linkedInJobs.length);
        
        const jobs = [remoteOKJobs, jSearchJobs, adzunaJobs, naukriJobs, linkedInJobs];
        
        // Combine and deduplicate results - prioritize real jobs
        const allJobs = jobs.flat().filter(job => job && job.source && job.title && job.company);
        console.log('Total real jobs found:', allJobs.length);
        console.log('Job sources:', [...new Set(allJobs.map(job => job.source))]);
        
        const uniqueJobs = removeDuplicates(allJobs);
        
        // Calculate match scores based on user skills
        const jobsWithScores = uniqueJobs.map(job => ({
            ...job,
            matchScore: calculateMatchScore(job.skills || [], skills)
        })).sort((a, b) => b.matchScore - a.matchScore);
        
        console.log('Jobs with scores:', jobsWithScores.length);
        
        return NextResponse.json({ 
            jobs: jobsWithScores.slice(0, 20), // Return top 20 matches
            success: true 
        });
        
    } catch (error) {
        console.error('Job fetch error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch jobs',
            jobs: []
        }, { status: 500 });
    }
}

async function fetchFromRemoteOK(skills: string[]) {
    try {
        const response = await fetch(`https://remoteok.io/api`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        const jobs = Array.isArray(data) ? data.slice(1, 21) : [];
        
        return jobs.map((job: any) => ({
            id: `remoteok-${job.id}`,
            title: cleanHtmlContent(job.position || job.title),
            company: cleanHtmlContent(job.company),
            location: 'Remote',
            salary: job.salary || 'Competitive',
            type: 'Remote',
            skills: job.tags || extractCleanSkills(job.description, skills),
            description: cleanHtmlContent(job.description)?.substring(0, 200) + '...' || 'Remote opportunity',
            posted: job.date ? new Date(job.date * 1000).toLocaleDateString() : 'Recent',
            url: job.url || job.apply_url || `https://remoteok.io/remote-jobs/${job.slug || job.id}`,
            source: 'RemoteOK'
        })).filter(job => job.title && job.company);
    } catch (error) {
        console.error('RemoteOK API error:', error);
        return [];
    }
}

async function fetchFromJSearch(skills: string[], location: string) {
    try {
        const query = skills.join(' OR ');
        const searchLocation = location.toLowerCase().includes('india') ? 'India' : location;
        
        const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=IN`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_TOKEN || 'demo-key',
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data.data?.slice(0, 10).map((job: any) => ({
            id: `jsearch-${job.job_id}`,
            title: cleanHtmlContent(job.job_title),
            company: cleanHtmlContent(job.employer_name),
            location: job.job_city || searchLocation,
            salary: job.job_salary || 'Competitive',
            type: job.job_employment_type || 'Full-time',
            skills: extractCleanSkills(job.job_description, skills),
            description: cleanHtmlContent(job.job_description)?.substring(0, 200) + '...' || '',
            posted: job.job_posted_at_datetime_utc || new Date().toISOString(),
            url: job.job_apply_link || job.job_google_link || `https://www.google.com/search?q=${encodeURIComponent(job.job_title + ' ' + job.employer_name)}`,
            source: 'JSearch'
        })) || [];
    } catch (error) {
        console.error('JSearch API error:', error);
        return [];
    }
}

async function fetchFromAdzuna(skills: string[], location: string) {
    try {
        const query = skills.join(' ');
        const appId = process.env.ADZUNA_APP_ID || 'demo';
        const appKey = process.env.ADZUNA_APP_TOKEN || 'demo';
        
        const response = await fetch(
            `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}&results_per_page=10`
        );
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data.results?.map((job: any) => ({
            id: `adzuna-${job.id}`,
            title: cleanHtmlContent(job.title),
            company: cleanHtmlContent(job.company.display_name),
            location: job.location.display_name,
            salary: job.salary_min && job.salary_max ? 
                `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}` : 
                'Competitive',
            type: job.contract_type || 'Full-time',
            skills: extractCleanSkills(job.description, skills),
            description: cleanHtmlContent(job.description)?.substring(0, 200) + '...' || '',
            posted: job.created,
            url: job.redirect_url || `https://www.adzuna.com/details/${job.id}`,
            source: 'Adzuna'
        })) || [];
    } catch (error) {
        console.error('Adzuna API error:', error);
        return [];
    }
}

function generateIndianMockJobs(skills: string[]) {
    const indianJobTemplates = [
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
        }
    ];
    
    return indianJobTemplates.map((job, i) => {
        const matchingSkills = job.skills.filter(skill => 
            skills.some(userSkill => 
                userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(userSkill.toLowerCase())
            )
        );
        const matchScore = Math.round((matchingSkills.length / job.skills.length) * 100);
        
        return {
            id: `indian-job-${i}`,
            ...job,
            matchScore,
            posted: `${Math.floor(Math.random() * 7) + 1} days ago`,
            source: 'Naukri.com'
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
}

function generateMockJobs(skills: string[]) {
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
        }
    ];
    
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
            posted: `${Math.floor(Math.random() * 7) + 1} days ago`,
            source: 'Job Board'
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
}

function cleanHtmlContent(text: string): string {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
}

function extractCleanSkills(description: string, userSkills: string[]): string[] {
    if (!description) return [];
    
    const cleanDesc = cleanHtmlContent(description).toLowerCase();
    const allSkills = ['javascript', 'typescript', 'react', 'node', 'python', 'java', 'sql', 'html', 'css', 'aws', 'docker', 'git', 'mongodb', 'express', 'angular', 'vue', 'php', 'c++', 'c#', 'ruby', 'go', 'kotlin', 'swift', 'django', 'flask', 'spring', 'mysql', 'postgresql', 'redis', 'kubernetes', 'devops', 'linux', 'ui', 'ux', 'design', 'figma', 'photoshop'];
    
    return allSkills.filter(skill => cleanDesc.includes(skill));
}

function calculateMatchScore(jobSkills: string[], userSkills: string[]) {
    if (!jobSkills.length) return 50;
    
    const matches = jobSkills.filter(skill => 
        userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
        )
    );
    
    return Math.round((matches.length / jobSkills.length) * 100);
}

function removeDuplicates(jobs: any[]) {
    const seen = new Set();
    return jobs.filter(job => {
        const key = `${job.title}-${job.company}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function fetchFromNaukri(skills: string[], location: string) {
    try {
        // Using RapidAPI's Naukri scraper
        const query = skills.join(' ');
        const response = await fetch(`https://naukri-jobs-scraper.p.rapidapi.com/jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&limit=10`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_TOKEN || 'demo-key',
                'X-RapidAPI-Host': 'naukri-jobs-scraper.p.rapidapi.com'
            }
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data.jobs?.slice(0, 10).map((job: any) => ({
            id: `naukri-${job.id || Math.random()}`,
            title: job.title,
            company: job.company,
            location: job.location || 'India',
            salary: job.salary || 'Not specified',
            type: job.jobType || 'Full-time',
            skills: extractSkillsFromDescription(job.description, skills),
            description: job.description?.substring(0, 200) + '...' || '',
            posted: job.postedDate || new Date().toISOString(),
            url: job.jobUrl || `https://www.naukri.com/jobs-in-${location.toLowerCase()}-${skills[0].toLowerCase()}`,
            source: 'Naukri'
        })) || [];
    } catch (error) {
        console.error('Naukri API error:', error);
        return [];
    }
}

async function fetchFromLinkedIn(skills: string[], location: string) {
    try {
        // Using RapidAPI's LinkedIn Jobs API
        const query = skills.join(' ');
        const response = await fetch(`https://linkedin-jobs-search.p.rapidapi.com/jobs?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&datePosted=anyTime&sort=mostRelevant`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_TOKEN || 'demo-key',
                'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com'
            }
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data.data?.slice(0, 10).map((job: any) => ({
            id: `linkedin-${job.jobId || Math.random()}`,
            title: job.title,
            company: job.company,
            location: job.location || location,
            salary: job.salary || 'Not specified',
            type: job.type || 'Full-time',
            skills: extractSkillsFromDescription(job.description, skills),
            description: job.description?.substring(0, 200) + '...' || '',
            posted: job.postedTime || new Date().toISOString(),
            url: job.jobUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
            source: 'LinkedIn'
        })) || [];
    } catch (error) {
        console.error('LinkedIn API error:', error);
        return [];
    }
}
/**
 * Intelligent Job Matching Service
 * Target: 80% match accuracy
 */

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
}

export interface JobMatch {
  job: Job;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  score_breakdown: {
    skill_match: number;
    experience_match: number;
    location_match: number;
  };
}

/**
 * Calculate job match score
 */
export function calculateJobMatch(
  userSkills: string[],
  userExperience: string,
  userLocation: string,
  job: Job
): JobMatch {
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const requiredSkillsLower = job.required_skills.map(s => s.toLowerCase());
  const preferredSkillsLower = job.preferred_skills.map(s => s.toLowerCase());
  
  // Skill matching
  const matchedRequired = requiredSkillsLower.filter(s => 
    userSkillsLower.some(us => us.includes(s) || s.includes(us))
  );
  const matchedPreferred = preferredSkillsLower.filter(s => 
    userSkillsLower.some(us => us.includes(s) || s.includes(us))
  );
  
  const requiredScore = requiredSkillsLower.length > 0 
    ? (matchedRequired.length / requiredSkillsLower.length) * 100 
    : 100;
  const preferredScore = preferredSkillsLower.length > 0 
    ? (matchedPreferred.length / preferredSkillsLower.length) * 100 
    : 0;
  
  const skillMatch = (requiredScore * 0.7) + (preferredScore * 0.3);
  
  // Experience matching
  const experienceMatch = matchExperienceLevel(userExperience, job.experience_level);
  
  // Location matching
  const locationMatch = matchLocation(userLocation, job.location);
  
  // Overall score (weighted)
  const matchPercentage = Math.round(
    (skillMatch * 0.6) + (experienceMatch * 0.25) + (locationMatch * 0.15)
  );
  
  const allMatched = [...matchedRequired, ...matchedPreferred];
  const allRequired = [...requiredSkillsLower, ...preferredSkillsLower];
  const missing = allRequired.filter(s => !allMatched.includes(s));
  
  return {
    job,
    match_percentage: matchPercentage,
    matched_skills: allMatched,
    missing_skills: missing,
    score_breakdown: {
      skill_match: Math.round(skillMatch),
      experience_match: Math.round(experienceMatch),
      location_match: Math.round(locationMatch),
    },
  };
}

function matchExperienceLevel(userLevel: string, jobLevel: string): number {
  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const userIdx = levels.indexOf(userLevel.toLowerCase());
  const jobIdx = levels.indexOf(jobLevel.toLowerCase());
  
  if (userIdx === -1 || jobIdx === -1) return 50;
  
  const diff = Math.abs(userIdx - jobIdx);
  return Math.max(0, 100 - (diff * 25));
}

function matchLocation(userLoc: string, jobLoc: string): number {
  if (!userLoc || !jobLoc) return 50;
  if (jobLoc.toLowerCase().includes('remote')) return 100;
  if (userLoc.toLowerCase() === jobLoc.toLowerCase()) return 100;
  if (userLoc.toLowerCase().includes(jobLoc.toLowerCase()) || 
      jobLoc.toLowerCase().includes(userLoc.toLowerCase())) return 75;
  return 25;
}

/**
 * Rank jobs by match score
 */
export function rankJobs(matches: JobMatch[]): JobMatch[] {
  return matches.sort((a, b) => b.match_percentage - a.match_percentage);
}

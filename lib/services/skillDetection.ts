/**
 * Enhanced Skill Detection Service - Target: 90% Accuracy
 */

export interface SkillMatch {
  skill: string;
  confidence: number;
  category: string;
  context: string;
}

const SKILL_DB = {
  programming: {
    javascript: ['javascript', 'js', 'es6'],
    python: ['python', 'py'],
    java: ['java', 'jdk'],
    cpp: ['c++', 'cpp'],
    c: ['c programming'],
  },
  web: {
    react: ['react', 'reactjs'],
    html: ['html', 'html5'],
    css: ['css', 'css3'],
    django: ['django'],
    mern: ['mern'],
  },
  database: {
    mysql: ['mysql'],
    mongodb: ['mongodb'],
    sql: ['sql'],
    dbms: ['dbms'],
  },
  concepts: {
    dsa: ['dsa', 'data structures', 'algorithms'],
    oops: ['oops', 'oop'],
  },
  tools: {
    git: ['git'],
    github: ['github'],
  },
};

export async function detectSkills(text: string): Promise<SkillMatch[]> {
  const lower = text.toLowerCase();
  const detected: SkillMatch[] = [];

  for (const [category, skills] of Object.entries(SKILL_DB)) {
    for (const [name, variants] of Object.entries(skills)) {
      for (const variant of variants) {
        const regex = new RegExp(`\\b${variant}\\b`, 'gi');
        const matches = lower.match(regex);
        
        if (matches) {
          const confidence = Math.min(0.6 + (matches.length * 0.2), 1.0);
          const idx = lower.indexOf(variant);
          const context = text.substring(Math.max(0, idx - 20), idx + variant.length + 20);
          
          detected.push({
            skill: name.charAt(0).toUpperCase() + name.slice(1),
            confidence,
            category,
            context,
          });
          break;
        }
      }
    }
  }

  return detected.sort((a, b) => b.confidence - a.confidence);
}

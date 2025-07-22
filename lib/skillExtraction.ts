// Common skills database - in a real app, this could be from a database or external API
const SKILL_KEYWORDS = {
  programming: [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
    'node.js', 'nodejs', 'express', 'next.js', 'nextjs', 'html', 'css',
    'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd'
  ],
  frameworks: [
    'spring', 'django', 'flask', 'laravel', 'rails', 'jquery', 'bootstrap',
    'tailwind', 'materialui', 'chakra', 'styled-components'
  ],
  databases: [
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
    'oracle', 'mariadb', 'cassandra', 'dynamodb'
  ],
  tools: [
    'vscode', 'intellij', 'eclipse', 'postman', 'figma', 'sketch',
    'photoshop', 'illustrator', 'jira', 'confluence', 'slack', 'teams'
  ],
  softSkills: [
    'communication', 'leadership', 'teamwork', 'problem solving', 'analytical',
    'creative', 'adaptable', 'time management', 'project management',
    'agile', 'scrum', 'kanban'
  ],
  certifications: [
    'aws certified', 'azure certified', 'google cloud', 'scrum master',
    'pmp', 'cissp', 'comptia', 'cisco', 'microsoft certified'
  ]
};

// Simple word tokenizer function
function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s\.\,\;\:\!\?\-\(\)]+/).filter(word => word.length > 0);
}

export function extractSkills(text: string): string[] {
  const cleanedText = text.toLowerCase().replace(/[^\w\s\.\-]/g, ' ');
  const tokens = tokenize(cleanedText);
  const foundSkills = new Set<string>();

  // Extract all skill categories
  Object.values(SKILL_KEYWORDS).forEach(skillCategory => {
    skillCategory.forEach(skill => {
      const skillWords = skill.split(/[\s\.-]/);
      
      if (skillWords.length === 1) {
        // Single word skill
        if (tokens.includes(skill) || cleanedText.includes(skill)) {
          foundSkills.add(skill);
        }
      } else {
        // Multi-word skill
        if (cleanedText.includes(skill)) {
          foundSkills.add(skill);
        }
      }
    });
  });

  // Extract years of experience patterns
  const experienceRegex = /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi;
  const experienceMatches = cleanedText.match(experienceRegex);
  if (experienceMatches) {
    experienceMatches.forEach(match => {
      foundSkills.add(`experience: ${match.toLowerCase()}`);
    });
  }

  return Array.from(foundSkills);
}

export function categorizeSkills(skills: string[]): { [category: string]: string[] } {
  const categorized: { [category: string]: string[] } = {
    programming: [],
    frameworks: [],
    databases: [],
    tools: [],
    softSkills: [],
    certifications: [],
    other: []
  };

  skills.forEach(skill => {
    let categorized_flag = false;
    
    Object.entries(SKILL_KEYWORDS).forEach(([category, keywords]) => {
      if (keywords.includes(skill) && !categorized_flag) {
        categorized[category].push(skill);
        categorized_flag = true;
      }
    });

    if (!categorized_flag) {
      categorized.other.push(skill);
    }
  });

  return categorized;
}
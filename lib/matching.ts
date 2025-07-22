import { PorterStemmer, WordTokenizer } from 'natural';
const cosineSimilarity = require('cosine-similarity');

const tokenizer = new WordTokenizer();

export function calculateCosineSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenizer.tokenize(text1.toLowerCase()) || [];
  const tokens2 = tokenizer.tokenize(text2.toLowerCase()) || [];
  
  // Create vocabulary from both texts
  const vocabulary = Array.from(new Set([...tokens1, ...tokens2]));
  
  // Create vectors
  const vector1 = vocabulary.map(word => tokens1.filter(token => token === word).length);
  const vector2 = vocabulary.map(word => tokens2.filter(token => token === word).length);
  
  if (vector1.every(val => val === 0) || vector2.every(val => val === 0)) {
    return 0;
  }
  
  return cosineSimilarity(vector1, vector2);
}

export function calculateSkillMatch(candidateSkills: string[], jobRequiredSkills: string[]): {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
} {
  const candidateSkillsNormalized = candidateSkills.map(skill => skill.toLowerCase().trim());
  const jobSkillsNormalized = jobRequiredSkills.map(skill => skill.toLowerCase().trim());
  
  const matchedSkills = candidateSkillsNormalized.filter(skill =>
    jobSkillsNormalized.some(jobSkill => 
      jobSkill.includes(skill) || skill.includes(jobSkill) || skill === jobSkill
    )
  );
  
  const missingSkills = jobSkillsNormalized.filter(jobSkill =>
    !candidateSkillsNormalized.some(candidateSkill =>
      candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill) || candidateSkill === jobSkill
    )
  );
  
  const matchPercentage = jobRequiredSkills.length > 0 
    ? (matchedSkills.length / jobRequiredSkills.length) * 100 
    : 0;
  
  return {
    matchedSkills,
    missingSkills,
    matchPercentage: Math.round(matchPercentage * 100) / 100
  };
}

export function calculateOverallScore(
  textSimilarity: number,
  skillMatchPercentage: number,
  weights = { textSimilarity: 0.4, skillMatch: 0.6 }
): number {
  const score = (textSimilarity * weights.textSimilarity + skillMatchPercentage * weights.skillMatch / 100);
  return Math.round(score * 100);
}
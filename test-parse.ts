import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function testResumeExtraction(resume: any) {
  console.log('Testing resume:', resume.id);
  console.log('File:', resume.fileName);
  console.log('Path:', resume.filePath);
  console.log('Current extractedText length:', resume.extractedText?.length || 0);

  if (!fs.existsSync(resume.filePath)) {
    console.log('ERROR: File not found');
    return;
  }

  console.log('\nCalling FastAPI scoring...');
  const response = await fetch('http://localhost:8000/api/v1/scoring/score-by-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resume_id: resume.id,
      job_description: 'Looking for a Full Stack Developer with React, Node.js, TypeScript, Python. 3+ years experience.',
      job_id: null  // Use null instead of invalid test ID
    })
  });

  if (!response.ok) {
    console.log('ERROR:', await response.text());
    return;
  }

  const result = await response.json();
  console.log('\n=== SCORING ===');
  console.log('Score:', result.result.overall_score);
  console.log('Matched:', result.result.detailed_analysis.matched_skills);
  console.log('Missing:', result.result.detailed_analysis.missing_skills);
  console.log('Recommendation:', result.result.recommendation);

  // Wait a bit for database update
  await new Promise(resolve => setTimeout(resolve, 1000));

  const updated = await prisma.resume.findUnique({ where: { id: resume.id } });
  console.log('\n=== EXTRACTION ===');
  console.log('Text length:', updated?.extractedText?.length || 0);
  if (updated?.extractedText && updated.extractedText.length > 0) {
    console.log('✅ Text extracted successfully!');
    console.log('Preview:', updated.extractedText.substring(0, 300));
  } else {
    console.log('❌ No text extracted');
  }
}

async function main() {
  try {
    const resumes = await prisma.resume.findMany({
      where: { fileName: { contains: 'Mehdi_Ali_Web_Dev' } },
      take: 1
    });

    if (resumes.length === 0) {
      console.log('Resume not found. Available resumes:');
      const all = await prisma.resume.findMany({ select: { fileName: true, filePath: true }, take: 5 });
      all.forEach(r => console.log(`  - ${r.fileName}`));
      
      if (all.length > 0 && all[0].filePath && fs.existsSync(all[0].filePath)) {
        console.log('\nUsing first available resume...');
        await testResumeExtraction(all[0]);
      }
    } else {
      await testResumeExtraction(resumes[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function testParsing() {
  try {
    // Find the resume in database
    const resume = await prisma.resume.findFirst({
      where: {
        OR: [
          { fileName: { contains: 'Mehdi_Ali_Web_Dev' } },
          { filePath: { contains: '1769877905795' } }
        ]
      }
    });

    if (!resume) {
      console.log('Resume not found in database. Looking for all resumes...');
      const allResumes = await prisma.resume.findMany({
        select: { id: true, fileName: true, filePath: true },
        take: 10
      });
      console.log('Available resumes:', allResumes);
      
      // Try to use the first one that exists
      for (const r of allResumes) {
        if (r.filePath && fs.existsSync(r.filePath)) {
          console.log('\nUsing resume:', r.fileName);
          await testResumeExtraction(r);
          return;
        }
      }
      console.log('No resumes with valid file paths found');
      return;
    }

    await testResumeExtraction(resume);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testResumeExtraction(resume: any) {
  console.log('Found resume:', resume.id);
  console.log('File path:', resume.filePath);
  console.log('Current extractedText length:', resume.extractedText?.length || 0);

  // Check if file exists
  if (!fs.existsSync(resume.filePath)) {
    console.log('ERROR: File not found at path:', resume.filePath);
    return;
  }

  // Test the scoring endpoint which will trigger extraction
  console.log('\nCalling FastAPI scoring endpoint...');
  const response = await fetch('http://localhost:8000/api/v1/scoring/score-by-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resume_id: resume.id,
      job_description: 'Looking for a Full Stack Developer with experience in React, Node.js, TypeScript, and Python. Must have 3+ years of experience building web applications.',
      job_id: 'test-job-id'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.log('ERROR from FastAPI:', error);
    return;
  }

  const result = await response.json();
  console.log('\n=== SCORING RESULT ===');
  console.log('Score:', result.result.overall_score);
  console.log('Matched Skills:', result.result.detailed_analysis.matched_skills);
  console.log('Missing Skills:', result.result.detailed_analysis.missing_skills);
  console.log('Strengths:', result.result.detailed_analysis.strengths);
  console.log('Recommendation:', result.result.recommendation);

  // Check if text was extracted
  const updatedResume = await prisma.resume.findUnique({
    where: { id: resume.id }
  });

  console.log('\n=== EXTRACTION RESULT ===');
  console.log('Extracted text length:', updatedResume?.extractedText?.length || 0);
  console.log('First 500 characters:');
  console.log(updatedResume?.extractedText?.substring(0, 500) || 'No text extracted');
}

testParsing();

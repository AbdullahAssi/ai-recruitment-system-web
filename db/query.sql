-- First, let's see what IDs we have from the seeded data
-- Run this to get actual IDs:
SELECT r.id as resume_id,
    r."candidateId",
    c.name as candidate_name,
    j.id as job_id,
    j.title as job_title,
    a.id as application_id
FROM resumes r
    JOIN candidates c ON r."candidateId" = c.id
    LEFT JOIN applications a ON a."candidateId" = c.id
    LEFT JOIN jobs j ON a."jobId" = j.id
LIMIT 5;
-- Now insert a CV score using actual seeded data
-- This query selects the first available resume, job, and application WITHOUT existing CV score
INSERT INTO public.cv_scores (
        id,
        score,
        explanation,
        "applicationId",
        "jobId",
        requirements,
        "resumeId",
        "scoredAt",
        "skillsMatch"
    )
SELECT 'cvs_' || gen_random_uuid()::text,
    -- Generate unique ID
    75,
    -- Score
    'Strong candidate with excellent potential. Demonstrates good technical skills and cultural fit.',
    a.id,
    -- Get actual application ID from seeded data
    j.id,
    -- Get actual job ID from seeded data
    jsonb_build_object(
        'experienceMatch',
        true,
        'educationMatch',
        true,
        'requiredSkills',
        jsonb_build_array('JavaScript', 'React', 'Node.js')
    ),
    r.id,
    -- Get actual resume ID from seeded data
    NOW(),
    jsonb_build_object(
        'summary',
        'Strong background in full-stack development with excellent React and Node.js skills. Shows great potential for senior roles with additional experience in system architecture.',
        'aiAnalysis',
        jsonb_build_object(
            'strengths',
            jsonb_build_array(
                'Strong background in full-stack development',
                'Excellent React and Node.js proficiency',
                'Good problem-solving abilities'
            ),
            'weaknesses',
            jsonb_build_array(
                'Limited experience with system architecture',
                'Could benefit from more DevOps knowledge'
            ),
            'key_matches',
            jsonb_build_array(
                'React expertise matches job requirements',
                'Node.js experience aligns perfectly',
                'Full-stack background is ideal'
            ),
            'missing_requirements',
            jsonb_build_array(
                'Advanced system architecture experience',
                'Leadership experience in large teams'
            )
        ),
        'scores',
        jsonb_build_object(
            'overall',
            75,
            'skills',
            18,
            'experience',
            15,
            'education',
            12,
            'fit',
            30
        ),
        'recommendation',
        'SHORTLIST',
        'totalResumeSkills',
        5,
        'overallSkillScore',
        85.5
    )
FROM resumes r
    JOIN candidates c ON r."candidateId" = c.id
    JOIN applications a ON a."candidateId" = c.id
    JOIN jobs j ON a."jobId" = j.id
WHERE c.email = 'john.doe@example.com' -- Using seeded candidate
    AND j.title = 'Senior Full Stack Developer' -- Using seeded job
    AND NOT EXISTS (
        SELECT 1
        FROM cv_scores cs
        WHERE cs."applicationId" = a.id
    ) -- Only insert if no CV score exists for this application
LIMIT 1;
-- Or insert multiple CV scores for all applications without scores
INSERT INTO public.cv_scores (
        id,
        score,
        explanation,
        "applicationId",
        "jobId",
        requirements,
        "resumeId",
        "scoredAt",
        "skillsMatch"
    )
SELECT 'cvs_' || gen_random_uuid()::text,
    (60 + (random() * 30))::int,
    -- Random score between 60-90
    'AI analysis completed. Candidate shows ' || CASE
        WHEN (random() * 100) > 70 THEN 'excellent'
        WHEN (random() * 100) > 40 THEN 'good'
        ELSE 'moderate'
    END || ' fit for this position.',
    a.id,
    j.id,
    jsonb_build_object(
        'experienceMatch',
        true,
        'educationMatch',
        true
    ),
    r.id,
    NOW(),
    jsonb_build_object(
        'summary',
        'Candidate evaluation shows strong technical background with areas for growth.',
        'aiAnalysis',
        jsonb_build_object(
            'strengths',
            jsonb_build_array(
                'Strong technical foundation',
                'Good communication skills',
                'Relevant industry experience'
            ),
            'weaknesses',
            jsonb_build_array(
                'Could improve in advanced topics',
                'Limited leadership experience'
            ),
            'key_matches',
            jsonb_build_array(
                'Core technical skills align well',
                'Experience level matches requirements'
            ),
            'missing_requirements',
            jsonb_build_array(
                'Advanced certifications would be beneficial'
            )
        ),
        'scores',
        jsonb_build_object(
            'overall',
            (60 + (random() * 30))::int,
            'skills',
            (10 + (random() * 15))::int,
            'experience',
            (10 + (random() * 15))::int,
            'education',
            (8 + (random() * 12))::int,
            'fit',
            (20 + (random() * 20))::int
        ),
        'recommendation',
        CASE
            WHEN random() > 0.6 THEN 'SHORTLIST'
            WHEN random() > 0.3 THEN 'CONSIDER'
            ELSE 'REVIEW'
        END,
        'totalResumeSkills',
        (3 + (random() * 7))::int,
        'overallSkillScore',
        (60 + (random() * 40))::numeric(5, 1)
    )
FROM applications a
    JOIN jobs j ON a."jobId" = j.id
    JOIN candidates c ON a."candidateId" = c.id
    JOIN resumes r ON r."candidateId" = c.id
WHERE NOT EXISTS (
        SELECT 1
        FROM cv_scores cs
        WHERE cs."applicationId" = a.id
    )
LIMIT 10;
SELECT cv.id,
    cv.score,
    cv."skillsMatch"->>'summary' as summary,
    cv."skillsMatch"->'scores' as scores,
    cv."skillsMatch"->'aiAnalysis'->'strengths' as strengths,
    c.name as candidate_name,
    j.title as job_title
FROM cv_scores cv
    JOIN resumes r ON cv."resumeId" = r.id
    JOIN candidates c ON r."candidateId" = c.id
    LEFT JOIN jobs j ON cv."jobId" = j.id
ORDER BY cv."scoredAt" DESC;
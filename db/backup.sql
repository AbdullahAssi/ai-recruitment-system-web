--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.4
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it
ALTER SCHEMA public OWNER TO neondb_owner;
--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';
--
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'PENDING',
    'REVIEWED',
    'SHORTLISTED',
    'REJECTED'
);
ALTER TYPE public."ApplicationStatus" OWNER TO neondb_owner;
--
-- Name: EmailStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."EmailStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED',
    'BOUNCED'
);
ALTER TYPE public."EmailStatus" OWNER TO neondb_owner;
--
-- Name: EmailType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."EmailType" AS ENUM (
    'APPLICATION_RECEIVED',
    'INTERVIEW_INVITE',
    'APPLICATION_UNDER_REVIEW',
    'APPLICATION_SHORTLISTED',
    'APPLICATION_REJECTED',
    'JOB_OFFER',
    'FOLLOW_UP',
    'CUSTOM'
);
ALTER TYPE public."EmailType" OWNER TO neondb_owner;
--
-- Name: SkillLevel; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."SkillLevel" AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED',
    'EXPERT'
);
ALTER TYPE public."SkillLevel" OWNER TO neondb_owner;
SET default_tablespace = '';
SET default_table_access_method = heap;
--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);
ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;
--
-- Name: applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.applications (
    id text NOT NULL,
    "candidateId" text NOT NULL,
    "jobId" text NOT NULL,
    score double precision,
    status public."ApplicationStatus" DEFAULT 'PENDING'::public."ApplicationStatus" NOT NULL,
    "appliedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.applications OWNER TO neondb_owner;
--
-- Name: candidate_skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.candidate_skills (
    "candidateId" text NOT NULL,
    "skillId" text NOT NULL,
    level public."SkillLevel" DEFAULT 'INTERMEDIATE'::public."SkillLevel" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.candidate_skills OWNER TO neondb_owner;
--
-- Name: candidates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.candidates (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    experience integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE public.candidates OWNER TO neondb_owner;
--
-- Name: cv_scores; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cv_scores (
    id text NOT NULL,
    score integer,
    explanation text,
    "applicationId" text,
    "jobId" text,
    requirements jsonb,
    "resumeId" text NOT NULL,
    "scoredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "skillsMatch" jsonb
);
ALTER TABLE public.cv_scores OWNER TO neondb_owner;
--
-- Name: email_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_history (
    id text NOT NULL,
    "candidateId" text NOT NULL,
    "jobId" text,
    "templateId" text,
    subject text NOT NULL,
    body text NOT NULL,
    recipient text NOT NULL,
    status public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "errorMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.email_history OWNER TO neondb_owner;
--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_templates (
    id text NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    type public."EmailType" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
ALTER TABLE public.email_templates OWNER TO neondb_owner;
--
-- Name: job_skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.job_skills (
    id text NOT NULL,
    "jobId" text NOT NULL,
    "skillName" text NOT NULL,
    required boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.job_skills OWNER TO neondb_owner;
--
-- Name: jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.jobs (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    location text,
    requirements text,
    "isActive" boolean DEFAULT true NOT NULL,
    "postedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    company text
);
ALTER TABLE public.jobs OWNER TO neondb_owner;
--
-- Name: resumes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.resumes (
    id text NOT NULL,
    "candidateId" text NOT NULL,
    "filePath" text NOT NULL,
    "fileName" text NOT NULL,
    "extractedText" text,
    "uploadDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    certifications_json text,
    email text,
    experience_json text,
    filename text,
    github text,
    linkedin text,
    name text,
    projects_json text,
    skills_json text,
    education_level text,
    experience_years integer,
    phone text,
    summary text
);
ALTER TABLE public.resumes OWNER TO neondb_owner;
--
-- Name: skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.skills (
    id text NOT NULL,
    "skillName" text NOT NULL,
    category text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.skills OWNER TO neondb_owner;
--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

-- COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
-- Migration data removed - you may need to run migrations manually after restore
-- bbb0f4d3-5e23-49ad-a613-d2b8b61ce0dc	1180a3dd7d7bb1ebad109d2376d876acfb115704e21b90724e743d0833517328	2025-07-27 06:00:23.466108+00	20250722135214_init	\N	\N	2025-07-27 06:00:22.647589+00	1
-- 46ba4b7f-e9a6-4969-bb67-6c1cd13fc2af	2c29d1a3a9f0d8ecca3aaa5ed1ce5e31d9c8a8c8eaa6375aa78a740edbca576a	2025-07-27 06:00:24.315178+00	20250723100411_add_email_communication_system	\N	\N	2025-07-27 06:00:23.770441+00	1
-- 5081a5dd-0cd9-43f9-83af-74ffa105faea	342414fc4efff659ddaf371b009f2a125614ab84766223419f1a9e781657265a	2025-07-27 06:00:25.124172+00	20250726183002_add_enhanced_resume_and_cv_score	\N	\N	2025-07-27 06:00:24.589484+00	1
-- a793796b-4dea-4956-932b-ea1248123775	abb72b1696d7e8822b04540e22b3beec231af9fc7fbf8339d87fcd1965a4e952	2025-07-29 11:46:01.999406+00	20250729114600_add_resume_fields	\N	\N	2025-07-29 11:46:01.448242+00	1
-- f7cc2690-59d4-4432-adc0-e57d18dc4be2	dbf51c7d64111b4a695a6ab91115e1590f9d94c755c33ed9d45efb2542e21f54	2025-07-29 11:50:49.893594+00	20250729115046_add_job_company_field	\N	\N	2025-07-29 11:50:47.798384+00	1
-- a9ad8846-4ec9-4a1a-9565-532308211b36	dced739289209c6a5533bacee5ddbdec855f6ba56f052023585068f66578198a	2025-07-31 09:27:46.491577+00	20250731092631_update_scoring_system	\N	\N	2025-07-31 09:27:45.064377+00	1
-- \.
--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.applications (
    id,
    "candidateId",
    "jobId",
    score,
    status,
    "appliedAt"
)
FROM stdin;
cmdla5xv6000andyoh5tt2cwe cmdla5lkn0006ndyojh1dww38 cmdla2k450000ndyofwmhuh6a 0 PENDING 2025 -07 -27 06 :10 :43.507 cmdldgs6k000cndwksxijepd3 cmdldghj80008ndwkvuvzsgls cmdldabmw0005ndwkzqkxy4nq 0 PENDING 2025 -07 -27 07 :43 :08.204 cmdleb7cs000hndwkpy6ccyne cmdleaxua000dndwki03of22c cmdlcfcei0002ndwkij1yxb49 0 PENDING 2025 -07 -27 08 :06 :47.549 cmdleiqt0000jndwkqoyxqb0m cmdleaxua000dndwki03of22c cmdldabmw0005ndwkzqkxy4nq 0 PENDING 2025 -07 -27 08 :12 :39.348 cmdlkmi7o0004ndj0isxf8dd0 cmdlkma7k0000ndj0tecwrtjc cmdldabmw0005ndwkzqkxy4nq 0 PENDING 2025 -07 -27 11 :03 :32.532 cmdll1xid0006ndj07etyb4kd cmdlkma7k0000ndj0tecwrtjc cmdlcfcei0002ndwkij1yxb49 0 PENDING 2025 -07 -27 11 :15 :32.197 cmdllpsp80008ndj0l6c7uvlu cmdldghj80008ndwkvuvzsgls cmdlcfcei0002ndwkij1yxb49 90 PENDING 2025 -07 -27 11 :34 :05.708 cmdlw5ct90004nd30x1sxolzw cmdlw4v8h0000nd30yjskw1bl cmdlcfcei0002ndwkij1yxb49 0 PENDING 2025 -07 -27 16 :26 :07.774 cmdlycfni000bnd30z33h8f1u cmdlybnx40007nd30jra3dvj5 cmdla2k450000ndyofwmhuh6a 0 PENDING 2025 -07 -27 17 :27 :37.278 cmdofju5y0004nd3ck6500lp6 cmdof76sf0000nd3c0jyzj36v cmdlcfcei0002ndwkij1yxb49 0 PENDING 2025 -07 -29 11 :04 :48.485 cmdoimcn30001nd88t9lekzvh cmdogtbg7000dnd3c3tnkhuku cmdlcfcei0002ndwkij1yxb49 0 SHORTLISTED 2025 -07 -29 12 :30 :44.602 cmdlcfqna0004ndwkvic5xomn cmdla5lkn0006ndyojh1dww38 cmdlcfcei0002ndwkij1yxb49 0 SHORTLISTED 2025 -07 -27 07 :14 :19.942 cmdr7rt7b0001ndi03mxw5iyv cmdoqu9dz0000ndowx4ll2sak cmdlcfcei0002ndwkij1yxb49 0 PENDING 2025 -07 -31 09 :50 :22.098 cmdr8enpf0005ndi0c7wrhkrv cmdoqu9dz0000ndowx4ll2sak cmdla2k450000ndyofwmhuh6a 50 PENDING 2025 -07 -31 10 :08 :08.067 cmdr7xcb50003ndi0wc4hjwh2 cmdoqu9dz0000ndowx4ll2sak cmdldabmw0005ndwkzqkxy4nq 50 PENDING 2025 -07 -31 09 :54 :40.145 cmdre847n000bndi0i17ip9p4 cmdre6xbd0007ndi0268s6mcw cmdre54l20006ndi0zj66tmqn 75 REVIEWED 2025 -07 -31 12 :51 :00.563 cmdrevpld000dndi0la6khl8f cmdre6xbd0007ndi0268s6mcw cmdla2k450000ndyofwmhuh6a 50 PENDING 2025 -07 -31 13 :09 :21.361 cmdrke4hl000fndi0i4s0edli cmdre6xbd0007ndi0268s6mcw cmdlcfcei0002ndwkij1yxb49 45 PENDING 2025 -07 -31 15 :43 :38.553 cmdrl2o3g000hndi0eewe5mwc cmdre6xbd0007ndi0268s6mcw cmdldabmw0005ndwkzqkxy4nq 60 PENDING 2025 -07 -31 16 :02 :43.708 cmdldb6x80007ndwka3xh97nz cmdla5lkn0006ndyojh1dww38 cmdldabmw0005ndwkzqkxy4nq 0 REVIEWED 2025 -07 -27 07 :38 :47.37 \.--
-- Data for Name: candidate_skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.candidate_skills ("candidateId", "skillId", level, "createdAt")
FROM stdin;
\.--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.candidates (
    id,
    name,
    email,
    experience,
    "createdAt",
    "updatedAt"
)
FROM stdin;
ddd88897-ad37-463c-9026-f29b37d3a9fd MOEEZ AHMAD moeezch7860 @gmail.com 0 2025 -07 -27 06 :14 :35.904 2025 -07 -27 06 :14 :35.904 61188303 - 06da - 499a - a519 - 88371d907052 John Doe john.doe @example.com 0 2025 -07 -27 06 :58 :16.233 2025 -07 -27 06 :58 :16.233 cmdla5lkn0006ndyojh1dww38 Abdullah Zafar pakabdullah225 @gmail.com 5 2025 -07 -27 06 :10 :27.576 2025 -07 -27 07 :11 :54.29 cmdldghj80008ndwkvuvzsgls Abdullah mabdullahf22 @nutech.edu.pk 4 2025 -07 -27 07 :42 :54.402 2025 -07 -27 07 :42 :54.402 cmdleaxua000dndwki03of22c Sultan mehmood sultan.pkk @gmail.com 1 2025 -07 -27 08 :06 :35.219 2025 -07 -27 08 :06 :35.219 cmdlkma7k0000ndj0tecwrtjc Moeez Ahmad moeez @gmail.com 1 2025 -07 -27 11 :03 :22.16 2025 -07 -27 11 :03 :22.16 cmdllts470009ndj0xx8h3q61 Mehdi Hassan mehdi @gmail.com 1 2025 -07 -27 11 :37 :11.575 2025 -07 -27 11 :37 :11.575 cmdlw4v8h0000nd30yjskw1bl Test Abdullahzafar @gmail.com 2 2025 -07 -27 16 :25 :44.993 2025 -07 -27 16 :25 :44.993 cfmppkqyucgsghb5trywikgjk Unknown candidate_cv @example.com 0 2025 -07 -27 16 :34 :43.284 2025 -07 -27 16 :35 :43.036 cq5ic83p53wx9kdghik0ky450 Abdullah Zafar m.abdullah @cymaxtech.com 0 2025 -07 -27 16 :19 :58.182 2025 -07 -27 16 :36 :29.93 cmdlybnx40007nd30jra3dvj5 Sanaullah Saeed sanaullahsaeed193 @gmail.com 5 2025 -07 -27 17 :27 :01.336 2025 -07 -27 17 :27 :01.336 cmdof76sf0000nd3c0jyzj36v Shehryar Haider shehryar.haider @cymaxtech.com 1 2025 -07 -29 10 :54 :58.334 2025 -07 -29 10 :54 :58.334 cmdofmy7v0007nd3c9vor8y10 Eman Munir emanchaudhry05 @gmail.com 2 2025 -07 -29 11 :07 :13.723 2025 -07 -29 11 :07 :13.723 cmdofw2pp0000nd80fo1mujrj eman chaudhary eman.munir @cymaxtech.com 2 2025 -07 -29 11 :14 :19.453 2025 -07 -29 11 :14 :19.453 cmdog474s000and3c1zoiefsa Abdul Qadir abdul.qadir @cymaxtech.com 10 2025 -07 -29 11 :20 :38.428 2025 -07 -29 11 :20 :38.428 cmdogtbg7000dnd3c3tnkhuku Babar Islam babar.islam @cymaxtech.com 20 2025 -07 -29 11 :40 :10.423 2025 -07 -29 11 :40 :10.423 cmdoqu9dz0000ndowx4ll2sak Mehdi Ali mehdikhanofficial @gmail.com 2 2025 -07 -29 16 :20 :50.567 2025 -07 -29 16 :20 :50.567 cmdre6xbd0007ndi0268s6mcw Sarah Malik sarah.malik.hr @gmail.com 2 2025 -07 -31 12 :50 :04.968 2025 -07 -31 12 :50 :04.968 \.--
-- Data for Name: cv_scores; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cv_scores (
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
FROM stdin;
cmdla5lkn0006ndyojh1dww38 90 The candidate 's resume aligns well with the job description as they have extensive experience in developing web applications using React and Node.js. They have also led a team of developers and worked on projects involving similar technologies. The candidate' s skills
and experiences make them a strong fit for the Senior Full Stack Developer position.\ N \ N \ N cmdlccmlg0001ndwkfq864u9x 2025 -07 -27 06 :59 :51.045 \ N ckts60hbkqkagtihhijjss1c3 50 { "strengths": ["Unable to parse detailed analysis"],
"weaknesses": ["Response parsing failed"],
"key_matches": [],
"missing_requirements": [] } \ N \ N { } cmdoqu9uz0002ndowbcf14x9d 2025 -07 -31 10 :06 :07.057 { } c9heud38v1b3ibab0gp5xtsgv 50 { "strengths": ["Unable to parse detailed analysis"],
"weaknesses": ["Response parsing failed"],
"key_matches": [],
"missing_requirements": [] } \ N \ N { } cmdoqu9uz0002ndowbcf14x9d 2025 -07 -31 10 :08 :28.848 { } cvt6l6vergo59l5ecfk4k9utw 50 { "overall_score": 50,
"skills_score": 12,
"experience_score": 12,
"education_score": 10,
"fit_score": 16,
"detailed_analysis": { "strengths": ["Unable to parse detailed analysis"],
"weaknesses": ["Response parsing failed"],
"key_matches": [],
"missing_requirements": [] },
"recommendation": "CONSIDER",
"summary": "Scoring completed but detailed analysis unavailable due to response parsing error",
"raw_response": "" } \ N \ N { } cmdoqu9uz0002ndowbcf14x9d 2025 -07 -31 10 :32 :39.838 { } cvs_aa45c845e8f14fa39896 50 The candidate 's resume aligns well with the job description as they have extensive experience in developing web applications using React and Node.js. They have also led a team of developers and worked on projects involving similar technologies. The candidate' s skills
and experiences make them a strong fit for the Senior Full Stack Developer position.\ n cmdr8enpf0005ndi0c7wrhkrv cmdla2k450000ndyofwmhuh6a { "company": null,
"jobTitle": "Senior React Developer",
"location": "Islamabad",
"requiredSkills": [],
"preferredSkills": [] } cmdoqu9uz0002ndowbcf14x9d 2025 -07 -31 10 :08 :29.81 { "requiredScore": 100,
"preferredScore": 100,
"totalJobSkills": 0,
"matchedRequired": [],
"missingRequired": [],
"matchedPreferred": [],
"overallSkillScore": 100.0,
"totalResumeSkills": 5 } cfpebhixtjr9osyg56tiypd91 50 { "overall_score": 50,
"skills_score": 12,
"experience_score": 12,
"education_score": 10,
"fit_score": 16,
"detailed_analysis": { "strengths": ["Unable to parse detailed analysis"],
"weaknesses": ["Response parsing failed"],
"key_matches": [],
"missing_requirements": [] },
"recommendation": "CONSIDER",
"summary": "Scoring completed but detailed analysis unavailable due to response parsing error",
"raw_response": "" } \ N \ N { } cmdoqu9uz0002ndowbcf14x9d 2025 -07 -31 11 :44 :19.899 { } cvs_eafae0f9055540cab2a9 50 Scoring completed but detailed analysis unavailable due to response parsing error cmdr7xcb50003ndi0wc4hjwh2 cmdldabmw0005ndwkzqkxy4nq { "company": null,
"jobTitle": "AI intern",
"location": "islamabad",
"requiredSkills": [],
"preferredSkills": [] } cmdoqu9uz0002ndowbcf14x9d 2025 -07 -31 11 :44 :21.88 { "requiredScore": 100,
"preferredScore": 100,
"totalJobSkills": 0,
"matchedRequired": [],
"missingRequired": [],
"matchedPreferred": [],
"overallSkillScore": 100.0,
"totalResumeSkills": 5 } c2rfssczx3vk4o292zmud8na6 50 { "overall_score": 50,
"skills_score": 12,
"experience_score": 12,
"education_score": 10,
"fit_score": 16,
"detailed_analysis": { "strengths": ["Unable to parse detailed analysis"],
"weaknesses": ["Response parsing failed"],
"key_matches": [],
"missing_requirements": [] },
"recommendation": "CONSIDER",
"summary": "Scoring completed but detailed analysis unavailable due to response parsing error",
"raw_response": "" } \ N \ N { } cmdre6xhh0009ndi06c3pfv50 2025 -07 -31 13 :09 :33.304 { } cvs_e201b7c28eb64b2d9f00 50 Scoring completed but detailed analysis unavailable due to response parsing error cmdrevpld000dndi0la6khl8f cmdla2k450000ndyofwmhuh6a { "company": null,
"jobTitle": "Senior React Developer",
"location": "Islamabad",
"requiredSkills": [],
"preferredSkills": [] } cmdre6xhh0009ndi06c3pfv50 2025 -07 -31 13 :09 :34.328 { "requiredScore": 100,
"preferredScore": 100,
"totalJobSkills": 0,
"matchedRequired": [],
"missingRequired": [],
"matchedPreferred": [],
"overallSkillScore": 100.0,
"totalResumeSkills": 5 } cnmrvti491etsjj2xpv4uq0tu 45 { "overall_score": 45,
"skills_score": 5,
"experience_score": 10,
"education_score": 0,
"fit_score": 30,
"detailed_analysis": { "strengths": ["Experience in HR and talent acquisition", "Certifications in AI and talent acquisition"],
"weaknesses": ["Lack of technical skills in machine learning, deep learning, NLP, and computer vision", "No relevant degree in Computer Science or Engineering"],
"key_matches": [],
"missing_requirements": ["Technical skills in machine learning, deep learning, NLP, and computer vision", "Proficiency in Python, Java, and R", "Knowledge of AI frameworks like TensorFlow or PyTorch", "Degree in Computer Science, Engineering, or related field"] },
"recommendation": "CONSIDER",
"summary": "Sarah Malik shows strengths in HR and talent acquisition but lacks the technical skills and educational background required for the AI Engineer role. Consider additional training or upskilling to bridge the gap.",
"raw_response": "" } \ N \ N { } cmdre6xhh0009ndi06c3pfv50 2025 -07 -31 15 :43 :50.819 { } cvs_c502a705157d406298ec 45 Sarah Malik shows strengths in HR
and talent acquisition but lacks the technical skills
and educational background required for the AI Engineer role.Consider additional training
or upskilling to bridge the gap.cmdrke4hl000fndi0i4s0edli cmdlcfcei0002ndwkij1yxb49 { "company": null,
"jobTitle": "AI Engineer",
"location": "islamabad",
"requiredSkills": [],
"preferredSkills": [] } cmdre6xhh0009ndi06c3pfv50 2025 -07 -31 15 :43 :52.055 { "requiredScore": 100,
"preferredScore": 100,
"totalJobSkills": 0,
"matchedRequired": [],
"missingRequired": [],
"matchedPreferred": [],
"overallSkillScore": 100.0,
"totalResumeSkills": 5 } cvs_b38a93fa0d1249268492 60 { "summary": "Sarah Malik shows a strong background in AI recruitment tools and HR analytics, but lacks the technical skills and direct experience in developing AI solutions. With further training and hands-on experience, she could be a good fit for the AI intern role.",
"aiAnalysis": { "strengths": ["Strong background in AI recruitment tools and HR analytics", "Certifications in AI and talent acquisition"],
"weaknesses": ["Limited technical skills in machine learning, deep learning, NLP, and computer vision", "No direct experience in developing AI solutions"],
"key_matches": ["AI in Recruitment - Coursera certification shows interest in AI", "Experience in HR specialist roles"],
"missing_requirements": ["Lack of technical skills in machine learning, deep learning, NLP, and computer vision", "No direct experience with AI frameworks like TensorFlow or PyTorch"] },
"scores": { "overall": 60,
"skills": 10,
"experience": 15,
"education": 10,
"fit": 25 },
"recommendation": "CONSIDER" } cmdrl2o3g000hndi0eewe5mwc cmdldabmw0005ndwkzqkxy4nq { "company": null,
"jobTitle": "AI intern",
"location": "islamabad",
"requiredSkills": [],
"preferredSkills": [] } cmdre6xhh0009ndi06c3pfv50 2025 -07 -31 16 :02 :57.757 { "requiredScore": 100,
"preferredScore": 100,
"totalJobSkills": 0,
"matchedRequired": [],
"missingRequired": [],
"matchedPreferred": [],
"overallSkillScore": 100.0,
"totalResumeSkills": 5 } \.--
-- Data for Name: email_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_history (
    id,
    "candidateId",
    "jobId",
    "templateId",
    subject,
    body,
    recipient,
    status,
    "sentAt",
    "errorMessage",
    "createdAt"
)
FROM stdin;
cmdrs0v5a0001ndr0yj80qqt7 cmdoqu9dz0000ndowx4ll2sak cmdldabmw0005ndwkzqkxy4nq cmdla501g0003ndyogsuk6zj6 Congratulations ! You 've been shortlisted - AI intern	<html>\n        <body>\n          <h2>Congratulations!</h2>\n          <p>Dear Mehdi Ali ,</p>\n          <p>We' re excited to inform you that you have been shortlisted for the < strong > AI intern < / strong > position at Your Company.< / p > \ n < p > We were impressed with your qualifications
and experience.< / p > \ n < p > Our team will be in touch with you shortly to schedule the next round of interviews.< / p > \ n < p > Please keep an eye on your email
and phone for further communication.< / p > \ n < br > \ n < p > Best regards,
< br > Your Company Hiring Team < / p > \ n < / body > \ n < / html > mehdikhanofficial @gmail.com FAILED \ N connect ECONNREFUSED 52.98.61.40 :587 2025 -07 -31 19 :17 :16.841 \.--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_templates (
    id,
    name,
    subject,
    body,
    type,
    "isActive",
    "createdAt",
    "updatedAt"
)
FROM stdin;
cmdla4zvi0002ndyoedoy293r Application Under Review Your application is under review - { { jobTitle } } < html > \ n < body > \ n < h2 > Application Status
Update < / h2 > \ n < p > Dear { { candidateName } },
    < / p > \ n < p > Thank you for your interest in the < strong > { { jobTitle } } < / strong > position at { { companyName } }.< / p > \ n < p > We 're pleased to inform you that your application is currently under review by our hiring team.</p>\n          <p>We will contact you with the next steps in the process soon.</p>\n          <br>\n          <p>Best regards,<br>{{companyName}} Hiring Team</p>\n        </body>\n      </html>	APPLICATION_UNDER_REVIEW	t	2025-07-27 06:09:59.454	2025-07-27 06:09:59.454
cmdla501g0003ndyogsuk6zj6	Application Shortlisted	Congratulations! You' ve been shortlisted - { { jobTitle } } < html > \ n < body > \ n < h2 > Congratulations !< / h2 > \ n < p > Dear { { candidateName } },
    < / p > \ n < p > We 're excited to inform you that you have been shortlisted for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>\n          <p>We were impressed with your qualifications and experience.</p>\n          <p>Our team will be in touch with you shortly to schedule the next round of interviews.</p>\n          <p>Please keep an eye on your email and phone for further communication.</p>\n          <br>\n          <p>Best regards,<br>{{companyName}} Hiring Team</p>\n        </body>\n      </html>	APPLICATION_SHORTLISTED	t	2025-07-27 06:09:59.669	2025-07-27 06:09:59.669
cmdla507b0004ndyoqrqkqomp	Application Rejected	Thank you for your interest - {{jobTitle}}	<html>\n        <body>\n          <h2>Thank you for your application</h2>\n          <p>Dear {{candidateName}},</p>\n          <p>Thank you for your interest in the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>\n          <p>After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.</p>\n          <p>We encourage you to apply for future positions that match your skills and experience.</p>\n          <p>Thank you again for considering {{companyName}} as your potential employer.</p>\n          <br>\n          <p>Best regards,<br>{{companyName}} Hiring Team</p>\n        </body>\n      </html>	APPLICATION_REJECTED	t	2025-07-27 06:09:59.88	2025-07-27 06:09:59.88
cmdla4zjd0001ndyozpme12ie	Application Received for	Thank you for your application - {{jobTitle}}	<html>\n        <body>\n          <h2>Thank you for your application!</h2>\n          <p>Dear {{candidateName}},</p>\n          <p>We have received your application for the position of <strong>{{jobTitle}}</strong> at {{companyName}}.</p>\n          <p>Our team will review your application and get back to you within 5-7 business days.</p>\n          <p>If you have any questions, please don' t hesitate to contact us.< / p > \ n < br > \ n < p > Best regards,
    < br > { { companyName } } Hiring Team < / p > \ n < / body > \ n < / html > APPLICATION_RECEIVED t 2025 -07 -27 06 :09 :59.017 2025 -08 -06 05 :37 :07.526 cmdla50d90005ndyorhsg8txf Interview Invitation Interview Invitation - { { jobTitle } } at { { companyName } } < html > \ n < body > \ n < h2 > Interview Invitation < / h2 > \ n < p > Dear { { candidateName } },
    < / p > \ n < p > We are pleased to invite you for an interview for the < strong > { { jobTitle } } < / strong > position at { { companyName } }.< / p > \ n < p > Based on your application
    and qualifications,
    we believe you would be a great fit for our team.< / p > \ n < p > Please reply to this email with your availability for the coming week,
    and we will schedule a convenient time for the interview.< / p > \ n < p > The interview will cover: < / p > \ n < ul > \ n < li > Discussion about your experience
    and skills < / li > \ n < li > Overview of the role
    and responsibilities < / li > \ n < li > Company culture
    and team dynamics < / li > \ n < li > Q & A session < / li > \ n < / ul > \ n < p > We look forward to hearing
from you.< / p > \ n < br > \ n < p > Best regards,
    < br > { { companyName } } Hiring Team < / p > \ n < / body > \ n < / html > INTERVIEW_INVITE t 2025 -07 -27 06 :10 :00.093 2025 -08 -06 05 :39 :36.356 \.--
-- Data for Name: job_skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
    --

    COPY public.job_skills (id, "jobId", "skillName", required, "createdAt")
FROM stdin;
\.--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.jobs (
    id,
    title,
    description,
    location,
    requirements,
    "isActive",
    "postedDate",
    "createdAt",
    "updatedAt",
    company
)
FROM stdin;
cmdla2k450000ndyofwmhuh6a Senior React Developer We are looking for a great JavaScript developer who is proficient with React.js.Your primary focus will be on developing user interface components
and implementing them following well - known React.js workflows (
    such as Flux
    or Redux
).You will ensure that these components
and the overall application are robust
and easy to maintain.You will coordinate with the rest of the team working on different layers of the infrastructure.Therefore,
a commitment to collaborative problem solving,
sophisticated design,
and quality product is important.Islamabad Developing new user - facing features using React.js \ n \ nBuilding reusable components
and front -
end libraries for future use \ n \ nTranslating designs
and wireframes into high quality code \ n \ nOptimizing components for maximum performance across a vast array of web - capable devices
and browsers t 2025 -07 -27 06 :08 :05.715 2025 -07 -27 06 :08 :05.715 2025 -07 -27 06 :08 :05.715 \ N cmdlcfcei0002ndwkij1yxb49 AI Engineer We are seeking an AI Engineer to
join our dynamic team
and contribute to the development
and enhancement of our AI - driven platforms.The ideal candidate will possess deep technical expertise in machine learning
and artificial intelligence,
with a proven track record of developing scalable AI solutions.\ n \ nYour role will involve everything
from data analysis
    and model building to integration
    and deployment,
    ensuring our AI initiatives drive substantial business impact.islamabad Degree in Computer Science,
    Engineering,
    or related field \ nExperience with machine learning,
    deep learning,
    NLP,
    and computer vision \ nProficiency in Python,
    Java,
    and R \ nStrong knowledge of AI frameworks such as TensorFlow
    or PyTorch \ nExcellent problem - solving skills
    and ability to work in a team environment t 2025 -07 -27 07 :14 :01.348 2025 -07 -27 07 :14 :01.348 2025 -07 -27 07 :14 :01.348 \ N cmdldabmw0005ndwkzqkxy4nq AI intern We are seeking an AI Engineer to
    join our dynamic team
    and contribute to the development
    and enhancement of our AI - driven platforms.The ideal candidate will possess deep technical expertise in machine learning
    and artificial intelligence,
    with a proven track record of developing scalable AI solutions.islamabad Degree in Computer Science,
    Engineering,
    or related field \ nExperience with machine learning,
    deep learning,
    NLP,
    and computer vision \ nProficiency in Python,
    Java,
    and R \ nStrong knowledge of AI frameworks such as TensorFlow
    or PyTorch \ nExcellent problem - solving skills
    and ability to work in a team environment t 2025 -07 -27 07 :38 :06.721 2025 -07 -27 07 :38 :06.721 2025 -07 -27 07 :38 :06.721 \ N cmdre54l20006ndi0zj66tmqn AI - Powered Talent Acquisition Specialist We are seeking an AI - Powered Talent Acquisition Specialist to
    join our growing HR technology team.This role requires expertise in using AI - driven recruitment platforms,
    resume screening tools,
    and predictive hiring analytics.You will collaborate closely with hiring managers to streamline the hiring process
    and ensure the best talent acquisition practices using modern tools
    and insights.islamabad Key Responsibilities: \ n \ nLeverage AI - based systems to source
    and screen resumes.\ n \ nConduct structured interviews with the help of AI analysis tools.\ n \ nProvide data - driven hiring recommendations to departments.\ n \ nTrain teams on using recruitment AI features efficiently.\ n \ nContinuously improve the accuracy of AI recommendation models based on outcomes.\ n \ nRequirements: \ n \ nBachelor ’ s degree in Human Resources,
    Computer Science,
    or a related field.\ n \ n2 + years of experience in recruitment,
    HR tech,
    or AI - enhanced hiring.\ n \ nExperience with AI platforms (
        e.g.,
        HireVue,
        Pymetrics,
        or equivalent
    ).\ n \ nFamiliarity with resume parsing tools
    and NLP - based match scoring.\ n \ nStrong analytical
    and communication skills.t 2025 -07 -31 12 :48 :40.956 2025 -07 -31 12 :48 :40.956 2025 -07 -31 12 :48 :40.956 \ N \.--
-- Data for Name: resumes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
    --

    COPY public.resumes (
        id,
        "candidateId",
        "filePath",
        "fileName",
        "extractedText",
        "uploadDate",
        certifications_json,
        email,
        experience_json,
        filename,
        github,
        linkedin,
        name,
        projects_json,
        skills_json,
        education_level,
        experience_years,
        phone,
        summary
    )
FROM stdin;
cmdla5lqo0008ndyozvnmen4j cmdla5lkn0006ndyojh1dww38 D: \ \ cv - jd \ \ uploads \ \ 1753596627141 - SRS.docx SRS.docx 2025 -07 -27 06 :10 :27.791 \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N 0b43e649-d93f-494a-9104-820c8449fc7e ddd88897-ad37-463c-9026-f29b37d3a9fd data / MOEEZAHMAD --Resume.pdf_extracted_text.txt	MOEEZAHMAD--Resume.pdf_extracted_text.txt	\N	2025-07-27 06:14:35.904	["Machine Learning with Python - IBM", "The Nuts and Bolts of Machine Learning - Google", "Introduction to Python - Coursera Project Network", "Get Started with Python - Google", "Foundations of Data Science - Google", "Foundations: Data, Data, Everywhere - Google", "Introduction to FastAPI framework - Duke University", "Introduction to frontend development - Meta"]	moeezch7860@gmail.com	[]	MOEEZAHMAD--Resume.pdf_extracted_text.txt	https://github.com/MoeezAhmad10		MOEEZ AHMAD	[{"Name": "Health Chatbot Using LangChain", "Date": "", "Description": "Developed a health-focused chatbot using Streamlit for the UI, integrating LangChain and OpenAI to answer user queries based on verified medical documents related to brain tumor, lung, and kidney diseases. Implemented PDF parsing and FAISS vector search for efficient document retrieval, ensuring context-aware, accurate GPT responses with a focus on safety and reliability."}, {"Name": "Diabetes Prediction Using Machine Learning", "Date": "", "Description": "Developed an end-to-end machine learning pipeline to predict diabetes using the Kaggle Diabetes dataset. Performed data cleaning, exploratory data analysis, feature engineering, model selection, and evaluation. Achieved high accuracy using a Random Forest classifier."}, {"Name": "Clothing Classification using ANN", "Date": "", "Description": "Developed a clothing classification model using Convolutional Neural Networks (CNN) on the Fashion-MNIST dataset. Trained the model to accurately predict apparel categories, leveraging deep learning for image-based classification."}, {"Name": "SmartSpeller \\u2014 Context-Aware Spelling Corrector", "Date": "", "Description": "Built SmartSpeller, an intelligent spelling correction tool using Python and Streamlit. Utilized a large text corpus with unigram and bigram language models for word frequency analysis and context-correction. Combined edit distance with contextual probabilities to accurately correct isolated words and improve suggestions based on the previous word, enhancing real-world usability."}, {"Name": "An NLP-based Emotion-Aware Conversational Agent", "Date": "", "Description": "EmotiSense chatbot uses a BERT-based emotion classification model to detect user emotions and generates context-aware, emphathetic responses through dialoGBT, enhancing human like interaction. It tracks user-specific chat history and includes an admin secured feature to view or clear records, ensuring both personalization and privacy in sensitive applications."}]	{"Languages": ["Python", "C++", "Java", "SQL"], "Frameworks": ["TensorFlow", "PyTorch", "Keras", "LangChain", "FastAPI"], "Libraries": ["Scikit-learn", "Pandas", "Numpy", "Matplotlib", "Seaborn", "Pickel", "NLTK", "OpenCV"], "Tools": ["Power BI", "Tableau", "VS Code", "Visual Studio", "Collab", "Jupyter Notebook", "Anaconda", "Open AI", "Git-GitHub"], "Core Concepts": [], "Other Skills": ["Communication", "Team Work"]}	\N	\N	\N	\N
5d49ef0a-7fec-4849-a097-2de6aa8d5c1f 61188303 - 06da - 499a - a519 - 88371d907052 data / sample_resume.txt sample_resume.txt \ N 2025 -07 -27 06 :58 :16.233 ["AWS Certified Developer Associate (2023)", "Google Cloud Professional Developer (2022)", "MongoDB Certified Developer (2021)"] john.doe @example.com [{"Position": "Senior Software Engineer", "Company": "TechCorp Inc.", "Location": "", "Duration": "2022 - Present", "duration_in_months": 0, "Responsibilities": "- Developed and maintained web applications using React and Node.js\\n- Implemented RESTful APIs serving 10,000+ daily active users\\n- Optimized database queries reducing response time by 40%\\n- Led a team of 3 junior developers on key projects"}, {"Position": "Software Engineer", "Company": "StartupXYZ", "Location": "", "Duration": "2020 - 2022", "duration_in_months": 24, "Responsibilities": "- Built responsive web applications using React and TypeScript\\n- Integrated third-party APIs and payment systems\\n- Collaborated with design team to implement pixel-perfect UIs\\n- Participated in code reviews and agile development processes"}, {"Position": "Junior Developer", "Company": "WebSolutions", "Location": "", "Duration": "2019 - 2020", "duration_in_months": 12, "Responsibilities": "- Assisted in frontend development using JavaScript and React\\n- Fixed bugs and implemented small features\\n- Learned version control and deployment processes"}] sample_resume.txt https: // github.com / johndoe https: // linkedin.com / in / johndoe John Doe [{"Name": "E-Commerce Platform", "Date": "2023", "Description": "- Built full-stack e-commerce solution using Next.js and PostgreSQL\\n- Implemented user authentication, payment processing, and admin dashboard\\n- Technologies: Next.js, TypeScript, Prisma, Stripe, Tailwind CSS"}, {"Name": "Task Management App", "Date": "2022", "Description": "- Developed collaborative task management application\\n- Features: real-time updates, team collaboration, file attachments\\n- Technologies: React, Node.js, Socket.io, MongoDB"}] { "Languages": ["JavaScript", "TypeScript", "Python", "Java"],
"Frameworks": ["React", "Next.js", "Vue.js"],
"Libraries": ["HTML5", "CSS3", "Tailwind CSS"],
"Tools": ["Git", "Docker", "AWS", "Vercel", "Prisma"],
"Core Concepts": [],
"Other Skills": [] } \ N \ N \ N \ N cmdlccmlg0001ndwkfq864u9x cmdla5lkn0006ndyojh1dww38 D: \ \ cv - jd \ \ uploads \ \ 1753600313964 - cv.docx cv.docx 2025 -07 -27 07 :11 :54.723 \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N cmdldghp2000andwkffdnl57v cmdldghj80008ndwkvuvzsgls D: \ \ cv - jd \ \ uploads \ \ 1753602174058 - cv.docx cv.docx 2025 -07 -27 07 :42 :54.614 \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N cmdleay0d000fndwk4mn6ow9n cmdleaxua000dndwki03of22c D: \ \ cv - jd \ \ uploads \ \ 1753603594882 - cv.docx cv.docx Processing failed 2025 -07 -27 08 :06 :35.436 \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N cmdlkmaiz0002ndj0lgkefpqh cmdlkma7k0000ndj0tecwrtjc D: \ \ cv - jd \ \ uploads \ \ 1753614201449 - cv.docx cv.docx Processing failed 2025 -07 -27 11 :03 :22.564 \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N cmdlltscf000bndj0071d2khu cmdllts470009ndj0xx8h3q61 D: \ \ cv - jd \ \ uploads \ \ 1753616231249 - cv.docx cv.docx Processing failed 2025 -07 -27 11 :37 :11.871 \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N \ N cmdlw4vhu0002nd30f7jocgb1 cmdlw4v8h0000nd30yjskw1bl D: \ \ cv - jd \ \ uploads \ \ 1753633542911 - cv.docx cv.docx Abdullah Zafar \ n + 92 3049846835 | m.abdullah @cymaxtech.com | github.com / abdullahassi \ n \ n \ nSUMMARY \ nAs an Artificial Intelligence student,
I am passionate about applying machine learning
and data science to solve complex problems.\ nWith practical experience in deep learning,
neural networks,
and AI technologies,
I seek an entry - level position to contribute to \ ninnovative
and impactful AI projects.\ n \ n SKILLS \ n Languages: Python,
C + +,
Java,
SQL \ n Frameworks: TensorFlow,
PyTorch,
Keras,
LangChain,
FastAPI \ n Libraries: Scikit - learn,
Pandas,
Numpy,
Matplotlib,
Seaborn,
Pickel,
NLTK,
OpenCV \ nOTHER TOOLS: Power BI,
Tableau,
VS Code,
Visual Studio,
Collab,
Jupyter Notebook,
Anaconda,
Open AI,
Git - GitHub \ nSoft Skills: Communication,
Team Work \ n \ n PROJECTS \ nHealth Chatbot Using LangChain \ n • Developed a health - focused chatbot using Streamlit for the UI,
integrating LangChain
and OpenAI to answer user queries based on \ nverified medical documents related to brain tumor,
lung,
and kidney diseases.\ n • Implemented PDF parsing
and FAISS vector search for efficient document retrieval,
ensuring context - aware,
accurate GPT \ nresponses with a focus on safety
and reliability.\ nDiabetes Prediction Using Machine Learning \ n • Developed an
end - to -
end machine learning pipeline to predict diabetes using the Kaggle Diabetes dataset.\ n • Performed data cleaning,
exploratory data analysis,
feature engineering,
model selection,
and evaluation.\ n • Achieved high accuracy using a Random Forest classifier.\ nClothing Classification using ANN \ n • Developed a clothing classification model using Convolutional Neural Networks (CNN) on the Fashion - MNIST dataset.\ n • Trained the model to accurately predict apparel categories,
leveraging deep learning for image - based classification.\ nSmartSpeller — Context - Aware Spelling Corrector \ n • Built SmartSpeller,
an intelligent spelling correction tool using Python
and Streamlit.\ n • Utilized a large text corpus with unigram
and bigram language models for word frequency analysis
and context - correction.\ n • Combined edit distance with contextual probabilities to accurately correct isolated words
and improve suggestions based on \ nthe previous word,
enhancing real - world usability.\ nAn NLP - based Emotion - Aware Conversational Agent \ n • EmotiSense chatbot uses a BERT - based emotion classification model to detect user emotions
and generates context - \ naware,
emphathetic responses through dialoGBT,
enhancing human like interaction.\ n • It tracks user - specific chat history
and includes an admin secured feature to view
or clear records,
ensuring both \ npersonalization
and privacy in sensitive applications.\ n EDUCATION \ n2022 - Present National University of Technology NUTECH \ n Islamabad,
Pakistan \ nBS Artificial Intelligence – 6th Semester \ n \ n 2020 – 2022 Punjab Group of Colleges for Boys Pakpattan,
Pakistan \ n FSC (Pre - Engineering) \ n \ nCertifications \ nMachine Learning with Python – IBM \ nThe Nuts
and Bolts of Machine Learning – Google \ nIntroduction to Python – Coursera Project Network \ nGet Started with Python – Google \ nFoundations of Data Science – Google \ nFoundations: Data,
Data,
Everywhere – Google \ nIntroduction to FastAPI framework – Duke University \ nIntroduction to frontend development – Meta 2025 -07 -27 16 :25 :45.33 \ N \ N \ N \ N \ N \ N \ N \ N [] \ N \ N \ N \ N c55mv6ae4fzqqgx8vv8yz4egp cq5ic83p53wx9kdghik0ky450 cv.docx cv.docx Abdullah Zafar \ n + 92 3049846835 | m.abdullah @cymaxtech.com | github.com / abdullahassi \ n \ n \ nSUMMARY \ nAs an Artificial Intelligence student,
I am passionate about applying machine learning
and data science to solve complex problems.\ nWith practical experience in deep learning,
neural networks,
and AI technologies,
I seek an entry - level position to contribute to \ ninnovative
and impactful AI projects.\ n \ n SKILLS \ n Languages: Python,
C + +,
Java,
SQL \ n Frameworks: TensorFlow,
PyTorch,
Keras,
LangChain,
FastAPI \ n Libraries: Scikit - learn,
Pandas,
Numpy,
Matplotlib,
Seaborn,
Pickel,
NLTK,
OpenCV \ nOTHER TOOLS: Power BI,
Tableau,
VS Code,
Visual Studio,
Collab,
Jupyter Notebook,
Anaconda,
Open AI,
Git - GitHub \ nSoft Skills: Communication,
Team Work \ n \ n PROJECTS \ nHealth Chatbot Using LangChain \ n • Developed a health - focused chatbot using Streamlit for the UI,
integrating LangChain
and OpenAI to answer user queries based on \ nverified medical documents related to brain tumor,
lung,
and kidney diseases.\ n • Implemented PDF parsing
and FAISS vector search for efficient document retrieval,
ensuring context - aware,
accurate GPT \ nresponses with a focus on safety
and reliability.\ nDiabetes Prediction Using Machine Learning \ n • Developed an
end - to -
end machine learning pipeline to predict diabetes using the Kaggle Diabetes dataset.\ n • Performed data cleaning,
exploratory data analysis,
feature engineering,
model selection,
and evaluation.\ n • Achieved high accuracy using a Random Forest classifier.\ nClothing Classification using ANN \ n • Developed a clothing classification model using Convolutional Neural Networks (CNN) on the Fashion - MNIST dataset.\ n • Trained the model to accurately predict apparel categories,
leveraging deep learning for image - based classification.\ nSmartSpeller — Context - Aware Spelling Corrector \ n • Built SmartSpeller,
an intelligent spelling correction tool using Python
and Streamlit.\ n • Utilized a large text corpus with unigram
and bigram language models for word frequency analysis
and context - correction.\ n • Combined edit distance with contextual probabilities to accurately correct isolated words
and improve suggestions based on \ nthe previous word,
enhancing real - world usability.\ nAn NLP - based Emotion - Aware Conversational Agent \ n • EmotiSense chatbot uses a BERT - based emotion classification model to detect user emotions
and generates context - \ naware,
emphathetic responses through dialoGBT,
enhancing human like interaction.\ n • It tracks user - specific chat history
and includes an admin secured feature to view
or clear records,
ensuring both \ npersonalization
and privacy in sensitive applications.\ n EDUCATION \ n2022 - Present National University of Technology NUTECH \ n Islamabad,
Pakistan \ nBS Artificial Intelligence – 6th Semester \ n \ n 2020 – 2022 Punjab Group of Colleges for Boys Pakpattan,
Pakistan \ n FSC (Pre - Engineering) \ n \ nCertifications \ nMachine Learning with Python – IBM \ nThe Nuts
and Bolts of Machine Learning – Google \ nIntroduction to Python – Coursera Project Network \ nGet Started with Python – Google \ nFoundations of Data Science – Google \ nFoundations: Data,
Data,
Everywhere – Google \ nIntroduction to FastAPI framework – Duke University \ nIntroduction to frontend development – Meta 2025 -07 -27 16 :36 :29.93 ["Machine Learning with Python - IBM", "The Nuts and Bolts of Machine Learning - Google", "Introduction to Python - Coursera Project Network", "Get Started with Python - Google", "Foundations of Data Science - Google", "Foundations: Data, Data, Everywhere - Google", "Introduction to FastAPI framework - Duke University", "Introduction to frontend development - Meta"] m.abdullah @cymaxtech.com [null] \ N github.com / abdullahassi \ N Abdullah Zafar ["Health Chatbot Using LangChain: Developed a health-focused chatbot using LangChain and OpenAI for medical queries.", "Diabetes Prediction Using Machine Learning: Developed a machine learning pipeline for diabetes prediction.", "Clothing Classification using ANN: Developed a clothing classification model using CNN.", "SmartSpeller \\u2014 Context-Aware Spelling Corrector: Built an intelligent spelling correction tool using Python and Streamlit.", "An NLP-based Emotion-Aware Conversational Agent: Developed EmotiSense chatbot for emotion detection."] ["Python", "C++", "Java", "SQL", "TensorFlow", "PyTorch", "Keras", "LangChain", "FastAPI", "Scikit-learn", "Pandas", "Numpy", "Matplotlib", "Seaborn", "Pickel", "NLTK", "OpenCV", "Power BI", "Tableau", "VS Code", "Visual Studio", "Collab", "Jupyter Notebook", "Anaconda", "Open AI", "Git-GitHub", "Communication", "Team Work"] \ N \ N \ N \ N cmdlybo7z0009nd30pkbnuu65 cmdlybnx40007nd30jra3dvj5 D: \ \ cv - jd \ \ uploads \ \ 1753637218836 - cv.docx cv.docx Sanaullah Saeed \ n + 92 3049846835 | sanaullah.saeed @cymaxtech.com | github.com / sanaullah \ n \ n \ nSUMMARY \ nAs an Artificial Intelligence student,
I am passionate about applying machine learning
and data science to solve complex problems.\ nWith practical experience in deep learning,
neural networks,
and AI technologies,
I seek an entry - level position to contribute to \ ninnovative
and impactful AI projects.\ n \ n SKILLS \ n Languages: Python,
php,
Javascript,
Java,
SQL \ n Frameworks: Laravel,
PyTorch,
Keras,
LangChain,
FastAPI \ n Libraries: Scikit - learn,
Pandas,
Numpy,
Matplotlib,
Seaborn,
Pickel,
NLTK,
OpenCV \ nOTHER TOOLS: Power BI,
Tableau,
VS Code,
Visual Studio,
Collab,
Jupyter Notebook,
Anaconda,
Open AI,
Git - GitHub \ nSoft Skills: Communication,
Team Work \ n \ n PROJECTS \ nHealth Chatbot Using LangChain \ n • Developed a health - focused chatbot using Streamlit for the UI,
integrating LangChain
and OpenAI to answer user queries based on \ nverified medical documents related to brain tumor,
lung,
and kidney diseases.\ n • Implemented PDF parsing
and FAISS vector search for efficient document retrieval,
ensuring context - aware,
accurate GPT \ nresponses with a focus on safety
and reliability.\ nDiabetes Prediction Using Machine Learning \ n • Developed an
end - to -
end machine learning pipeline to predict diabetes using the Kaggle Diabetes dataset.\ n • Performed data cleaning,
exploratory data analysis,
feature engineering,
model selection,
and evaluation.\ n • Achieved high accuracy using a Random Forest classifier.\ nClothing Classification using ANN \ n • Developed a clothing classification model using Convolutional Neural Networks (CNN) on the Fashion - MNIST dataset.\ n • Trained the model to accurately predict apparel categories,
leveraging deep learning for image - based classification.\ nSmartSpeller — Context - Aware Spelling Corrector \ n • Built SmartSpeller,
an intelligent spelling correction tool using Python
and Streamlit.\ n • Utilized a large text corpus with unigram
and bigram language models for word frequency analysis
and context - correction.\ n • Combined edit distance with contextual probabilities to accurately correct isolated words
and improve suggestions based on \ nthe previous word,
enhancing real - world usability.\ nAn NLP - based Emotion - Aware Conversational Agent \ n • EmotiSense chatbot uses a BERT - based emotion classification model to detect user emotions
and generates context - \ naware,
emphathetic responses through dialoGBT,
enhancing human like interaction.\ n • It tracks user - specific chat history
and includes an admin secured feature to view
or clear records,
ensuring both \ npersonalization
and privacy in sensitive applications.\ n EDUCATION \ n2022 - Present National University of Technology NUTECH \ n Islamabad,
Pakistan \ nBS Artificial Intelligence – 6th Semester \ n \ n 2020 – 2022 Punjab Group of Colleges for Boys Pakpattan,
Pakistan \ n FSC (Pre - Engineering) \ n \ nCertifications \ nMachine Learning with Python – IBM \ nThe Nuts
and Bolts of Machine Learning – Google \ nIntroduction to Python – Coursera Project Network \ nGet Started with Python – Google \ nFoundations of Data Science – Google \ nFoundations: Data,
Data,
Everywhere – Google \ nIntroduction to FastAPI framework – Duke University \ nIntroduction to frontend development – Meta 2025 -07 -27 17 :27 :01.725 [] \ N [] \ N \ N \ N Unknown [] [] \ N \ N \ N \ N cmdof76yk0002nd3c9olkgs4i cmdof76sf0000nd3c0jyzj36v D: \ \ cv - jd \ \ uploads \ \ 1753786496843 - shehryar.docx shehryar.docx Shehryar Haider \ n + 92 3049846835 | shehryar.haider @cymaxtech.com | github.com / sherry \ n \ n \ nSUMMARY \ nAs an Markerting Executive,
I am passionate about applying machine learning
and data science to solve complex problems.\ nWith practical experience in deep learning,
neural networks,
and AI technologies,
I seek an entry - level position to contribute to \ ninnovative
and impactful AI projects.\ n \ n SKILLS \ n Languages: Python,
php,
Javascript,
Java,
SQL \ n Frameworks: Laravel,
PyTorch,
Keras,
LangChain,
FastAPI \ n Libraries: Scikit - learn,
Pandas,
Numpy,
Matplotlib,
Seaborn,
Pickel,
NLTK,
OpenCV \ nOTHER TOOLS: Power BI,
Tableau,
VS Code,
Visual Studio,
Collab,
Jupyter Notebook,
Anaconda,
Open AI,
Git - GitHub \ nSoft Skills: Communication,
Team Work \ n \ n PROJECTS \ nHealth Chatbot Using LangChain \ n • Developed a health - focused chatbot using Streamlit for the UI,
integrating LangChain
and OpenAI to answer user queries based on \ nverified medical documents related to brain tumor,
lung,
and kidney diseases.\ n • Implemented PDF parsing
and FAISS vector search for efficient document retrieval,
ensuring context - aware,
accurate GPT \ nresponses with a focus on safety
and reliability.\ nDiabetes Prediction Using Machine Learning \ n • Developed an
end - to -
end machine learning pipeline to predict diabetes using the Kaggle Diabetes dataset.\ n • Performed data cleaning,
exploratory data analysis,
feature engineering,
model selection,
and evaluation.\ n • Achieved high accuracy using a Random Forest classifier.\ nClothing Classification using ANN \ n • Developed a clothing classification model using Convolutional Neural Networks (CNN) on the Fashion - MNIST dataset.\ n • Trained the model to accurately predict apparel categories,
leveraging deep learning for image - based classification.\ nSmartSpeller — Context - Aware Spelling Corrector \ n • Built SmartSpeller,
an intelligent spelling correction tool using Python
and Streamlit.\ n • Utilized a large text corpus with unigram
and bigram language models for word frequency analysis
and context - correction.\ n • Combined edit distance with contextual probabilities to accurately correct isolated words
and improve suggestions based on \ nthe previous word,
enhancing real - world usability.\ nAn NLP - based Emotion - Aware Conversational Agent \ n • EmotiSense chatbot uses a BERT - based emotion classification model to detect user emotions
and generates context - \ naware,
emphathetic responses through dialoGBT,
enhancing human like interaction.\ n • It tracks user - specific chat history
and includes an admin secured feature to view
or clear records,
ensuring both \ npersonalization
and privacy in sensitive applications.\ n EDUCATION \ n2022 - Present National University of Technology NUTECH \ n Islamabad,
Pakistan \ nBS Artificial Intelligence – 6th Semester \ n \ n 2020 – 2022 Punjab Group of Colleges for Boys Pakpattan,
Pakistan \ n FSC (Pre - Engineering) \ n \ nCertifications \ nMachine Learning with Python – IBM \ nThe Nuts
and Bolts of Machine Learning – Google \ nIntroduction to Python – Coursera Project Network \ nGet Started with Python – Google \ nFoundations of Data Science – Google \ nFoundations: Data,
Data,
Everywhere – Google \ nIntroduction to FastAPI framework – Duke University \ nIntroduction to frontend development – Meta 2025 -07 -29 10 :54 :58.556 [] \ N [] \ N \ N \ N Unknown [] [] \ N \ N \ N \ N cmdofmygb0009nd3cag4p5ms6 cmdofmy7v0007nd3c9vor8y10 D: \ \ cv - jd \ \ uploads \ \ 1753787233344 - eman2.docx eman2.docx Eman Munir \ n + 92 3049846835 | Eman.Munir @cymaxtech.com | github.com / eman \ n \ n \ nSUMMARY \ nAs an Cyber Security Assistant,
I am passionate about applying machine learning
and data science to solve complex problems.\ nWith practical experience in deep learning,
neural networks,
and AI technologies,
I seek an entry - level position to contribute to \ ninnovative
and impactful AI projects.\ n \ n SKILLS \ n Languages: Python,
php,
Javascript,
Java,
SQL \ n Frameworks: Laravel,
PyTorch,
Keras,
LangChain,
FastAPI \ n Libraries: Scikit - learn,
Pandas,
Numpy,
Matplotlib,
Seaborn,
Pickel,
NLTK,
OpenCV \ nOTHER TOOLS: Power BI,
Tableau,
VS Code,
Visual Studio,
Collab,
Jupyter Notebook,
Anaconda,
Open AI,
Git - GitHub \ nSoft Skills: Communication,
Team Work \ n \ n PROJECTS \ nHealth Chatbot Using LangChain \ n • Developed a health - focused chatbot using Streamlit for the UI,
integrating LangChain
and OpenAI to answer user queries based on \ nverified medical documents related to brain tumor,
lung,
and kidney diseases.\ n • Implemented PDF parsing
and FAISS vector search for efficient document retrieval,
ensuring context - aware,
accurate GPT \ nresponses with a focus on safety
and reliability.\ nDiabetes Prediction Using Machine Learning \ n • Developed an
end - to -
end machine learning pipeline to predict diabetes using the Kaggle Diabetes dataset.\ n • Performed data cleaning,
exploratory data analysis,
feature engineering,
model selection,
and evaluation.\ n • Achieved high accuracy using a Random Forest classifier.\ nClothing Classification using ANN \ n • Developed a clothing classification model using Convolutional Neural Networks (CNN) on the Fashion - MNIST dataset.\ n • Trained the model to accurately predict apparel categories,
leveraging deep learning for image - based classification.\ nSmartSpeller — Context - Aware Spelling Corrector \ n • Built SmartSpeller,
an intelligent spelling correction tool using Python
and Streamlit.\ n • Utilized a large text corpus with unigram
and bigram language models for word frequency analysis
and context - correction.\ n • Combined edit distance with contextual probabilities to accurately correct isolated words
and improve suggestions based on \ nthe previous word,
enhancing real - world usability.\ nAn NLP - based Emotion - Aware Conversational Agent \ n • EmotiSense chatbot uses a BERT - based emotion classification model to detect user emotions
and generates context - \ naware,
emphathetic responses through dialoGBT,
enhancing human like interaction.\ n • It tracks user - specific chat history
and includes an admin secured feature to view
or clear records,
ensuring both \ npersonalization
and privacy in sensitive applications.\ n EDUCATION \ n2022 - Present National University of Technology NUTECH \ n Islamabad,
Pakistan \ nBS Artificial Intelligence – 6th Semester \ n \ n 2020 – 2022 Punjab Group of Colleges for Boys Pakpattan,
Pakistan \ n FSC (Pre - Engineering) \ n \ nCertifications \ nMachine Learning with Python – IBM \ nThe Nuts
and Bolts of Machine Learning – Google \ nIntroduction to Python – Coursera Project Network \ nGet Started with Python – Google \ nFoundations of Data Science – Google \ nFoundations: Data,
Data,
Everywhere – Google \ nIntroduction to FastAPI framework – Duke University \ nIntroduction to frontend development – Meta 2025 -07 -29 11 :07 :14.027 [] \ N [] \ N \ N \ N Unknown [] [] \ N \ N \ N \ N cmdofw2wm0002nd80bsboux79 cmdofw2pp0000nd80fo1mujrj D: \ \ cv - jd \ \ uploads \ \ 1753787659076 - eman2.docx eman2.docx Eman Munir \ n + 92 3049846835 | Eman.Munir @cymaxtech.com | github.com / eman \ n \ n \ nSUMMARY \ nAs an Cyber Security Assistant,
I am passionate about applying machine learning
and data science to solve complex problems.\ nWith practical experience in deep learning,
neural networks,
and AI technologies,
I seek an entry - level position to contribute to \ ninnovative
and impactful AI projects.\ n \ n SKILLS \ n Languages: Python,
php,
Javascript,
Java,
SQL \ n Frameworks: Laravel,
PyTorch,
Keras,
LangChain,
FastAPI \ n Libraries: Scikit - learn,
Pandas,
Numpy,
Matplotlib,
Seaborn,
Pickel,
NLTK,
OpenCV \ nOTHER TOOLS: Power BI,
Tableau,
VS Code,
Visual Studio,
Collab,
Jupyter Notebook,
Anaconda,
Open AI,
Git - GitHub \ nSoft Skills: Communication,
Team Work \ n \ n PROJECTS \ nHealth Chatbot Using LangChain \ n • Developed a health - focused chatbot using Streamlit for the UI,
integrating LangChain
and OpenAI to answer user queries based on \ nverified medical documents related to brain tumor,
lung,
and kidney diseases.\ n • Implemented PDF parsing
and FAISS vector search for efficient document retrieval,
ensuring context - aware,
accurate GPT \ nresponses with a focus on safety
and reliability.\ nDiabetes Prediction Using Machine Learning \ n • Developed an
end - to -
end machine learning pipeline to predict diabetes using the Kaggle Diabetes dataset.\ n • Performed data cleaning,
exploratory data analysis,
feature engineering,
model selection,
and evaluation.\ n • Achieved high accuracy using a Random Forest classifier.\ nClothing Classification using ANN \ n • Developed a clothing classification model using Convolutional Neural Networks (CNN) on the Fashion - MNIST dataset.\ n • Trained the model to accurately predict apparel categories,
leveraging deep learning for image - based classification.\ nSmartSpeller — Context - Aware Spelling Corrector \ n • Built SmartSpeller,
an intelligent spelling correction tool using Python
and Streamlit.\ n • Utilized a large text corpus with unigram
and bigram language models for word frequency analysis
and context - correction.\ n • Combined edit distance with contextual probabilities to accurately correct isolated words
and improve suggestions based on \ nthe previous word,
enhancing real - world usability.\ nAn NLP - based Emotion - Aware Conversational Agent \ n • EmotiSense chatbot uses a BERT - based emotion classification model to detect user emotions
and generates context - \ naware,
emphathetic responses through dialoGBT,
enhancing human like interaction.\ n • It tracks user - specific chat history
and includes an admin secured feature to view
or clear records,
ensuring both \ npersonalization
and privacy in sensitive applications.\ n EDUCATION \ n2022 - Present National University of Technology NUTECH \ n Islamabad,
Pakistan \ nBS Artificial Intelligence – 6th Semester \ n \ n 2020 – 2022 Punjab Group of Colleges for Boys Pakpattan,
Pakistan \ n FSC (Pre - Engineering) \ n \ nCertifications \ nMachine Learning with Python – IBM \ nThe Nuts
and Bolts of Machine Learning – Google \ nIntroduction to Python – Coursera Project Network \ nGet Started with Python – Google \ nFoundations of Data Science – Google \ nFoundations: Data,
Data,
Everywhere – Google \ nIntroduction to FastAPI framework – Duke University \ nIntroduction to frontend development – Meta 2025 -07 -29 11 :14 :19.702 [] \ N [] \ N \ N \ N Unknown [] [] \ N \ N \ N \ N cmdog47b4000cnd3cqna6waln cmdog474s000and3c1zoiefsa D: \ \ cv - jd \ \ uploads \ \ 1753788036915 - abdulqadir.docx abdulqadir.docx Shehryar Haider \ n + 92 3049846835 | shehryar.haider @cymaxtech.com | github.com / sherry \ n \ n \ nSUMMARY \ nAs an Markerting Executive,
I am passionate about applying machine learning
and data science to solve complex problems.\ nWith practical experience in deep learning,
neural networks,
and AI technologies,
I seek an entry - level position to contribute to \ ninnovative
and impactful AI projects.\ n \ n SKILLS \ n Languages: Python,
php,
Javascript,
Java,
SQL \ n Frameworks: Laravel,
PyTorch,
Keras,
LangChain,
FastAPI \ n Libraries: Scikit - learn,
Pandas,
Numpy,
Matplotlib,
Seaborn,
Pickel,
NLTK,
OpenCV \ nOTHER TOOLS: Power BI,
Tableau,
VS Code,
Visual Studio,
Collab,
Jupyter Notebook,
Anaconda,
Open AI,
Git - GitHub \ nSoft Skills: Communication,
Team Work \ n \ n PROJECTS \ nHealth Chatbot Using LangChain \ n • Developed a health - focused chatbot using Streamlit for the UI,
integrating LangChain
and OpenAI to answer user queries based on \ nverified medical documents related to brain tumor,
lung,
and kidney diseases.\ n • Implemented PDF parsing
and FAISS vector search for efficient document retrieval,
ensuring context - aware,
accurate GPT \ nresponses with a focus on safety
and reliability.\ nDiabetes Prediction Using Machine Learning \ n • Developed an
end - to -
end machine learning pipeline to predict diabetes using the Kaggle Diabetes dataset.\ n • Performed data cleaning,
exploratory data analysis,
feature engineering,
model selection,
and evaluation.\ n • Achieved high accuracy using a Random Forest classifier.\ nClothing Classification using ANN \ n • Developed a clothing classification model using Convolutional Neural Networks (CNN) on the Fashion - MNIST dataset.\ n • Trained the model to accurately predict apparel categories,
leveraging deep learning for image - based classification.\ nSmartSpeller — Context - Aware Spelling Corrector \ n • Built SmartSpeller,
an intelligent spelling correction tool using Python
and Streamlit.\ n • Utilized a large text corpus with unigram
and bigram language models for word frequency analysis
and context - correction.\ n • Combined edit distance with contextual probabilities to accurately correct isolated words
and improve suggestions based on \ nthe previous word,
enhancing real - world usability.\ nAn NLP - based Emotion - Aware Conversational Agent \ n • EmotiSense chatbot uses a BERT - based emotion classification model to detect user emotions
and generates context - \ naware,
emphathetic responses through dialoGBT,
enhancing human like interaction.\ n • It tracks user - specific chat history
and includes an admin secured feature to view
or clear records,
ensuring both \ npersonalization
and privacy in sensitive applications.\ n EDUCATION \ n2022 - Present National University of Technology NUTECH \ n Islamabad,
Pakistan \ nBS Artificial Intelligence – 6th Semester \ n \ n 2020 – 2022 Punjab Group of Colleges for Boys Pakpattan,
Pakistan \ n FSC (Pre - Engineering) \ n \ nCertifications \ nMachine Learning with Python – IBM \ nThe Nuts
and Bolts of Machine Learning – Google \ nIntroduction to Python – Coursera Project Network \ nGet Started with Python – Google \ nFoundations of Data Science – Google \ nFoundations: Data,
Data,
Everywhere – Google \ nIntroduction to FastAPI framework – Duke University \ nIntroduction to frontend development – Meta 2025 -07 -29 11 :20 :38.656 ["Machine Learning with Python - IBM", "The Nuts and Bolts of Machine Learning - Google", "Introduction to Python - Coursera Project Network", "Get Started with Python - Google", "Foundations of Data Science - Google", "Foundations: Data, Data, Everywhere - Google", "Introduction to FastAPI framework - Duke University", "Introduction to frontend development - Meta"] shehryar.haider @cymaxtech.com [null] \ N github.com / sherry \ N Shehryar Haider ["Health Chatbot Using LangChain: Developed a health-focused chatbot using LangChain and OpenAI for answering medical queries.", "Diabetes Prediction Using Machine Learning: Developed an ML pipeline for diabetes prediction using Kaggle dataset.", "Clothing Classification using ANN: Developed a clothing classification model using CNN on Fashion-MNIST dataset.", "SmartSpeller \\u2014 Context-Aware Spelling Corrector: Built an intelligent spelling correction tool using Python and Streamlit.", "An NLP-based Emotion-Aware Conversational Agent: EmotiSense chatbot using BERT for emotion classification and empathetic responses."] ["Python", "PHP", "Javascript", "Java", "SQL", "Laravel", "PyTorch", "Keras", "LangChain", "FastAPI", "Scikit-learn", "Pandas", "Numpy", "Matplotlib", "Seaborn", "Pickel", "NLTK", "OpenCV", "Power BI", "Tableau", "VS Code", "Visual Studio", "Collab", "Jupyter Notebook", "Anaconda", "Open AI", "Git-GitHub"] \ N \ N \ N \ N cmdogtbpg000fnd3cpjt2rh8o cmdogtbg7000dnd3c3tnkhuku D: \ \ cv - jd \ \ uploads \ \ 1753789208212 - babar.docx babar.docx Babar Islam \ n + 92 3049846835 | babar.islam @cymaxtech.com | github.com / babar \ n \ n \ nSUMMARY \ nAs an SEO Specilist I am passionate about applying machine learning
and data science to solve complex problems.\ nWith practical experience in deep learning,
neural networks,
and AI technologies,
I seek an entry - level position to contribute to \ ninnovative
and impactful AI projects.\ n \ n SKILLS \ n Languages: Python,
php,
Javascript,
Java,
SQL \ n Frameworks: Laravel,
PyTorch,
Keras,
LangChain,
FastAPI \ n Libraries: Scikit - learn,
Pandas,
Numpy,
Matplotlib,
Seaborn,
Pickel,
NLTK,
OpenCV \ nOTHER TOOLS: Power BI,
Tableau,
VS Code,
Visual Studio,
Collab,
Jupyter Notebook,
Anaconda,
Open AI,
Git - GitHub \ nSoft Skills: Communication,
Team Work \ n \ n PROJECTS \ nHealth Chatbot Using LangChain \ n • Developed a health - focused chatbot using Streamlit for the UI,
integrating LangChain
and OpenAI to answer user queries based on \ nverified medical documents related to brain tumor,
lung,
and kidney diseases.\ n • Implemented PDF parsing
and FAISS vector search for efficient document retrieval,
ensuring context - aware,
accurate GPT \ nresponses with a focus on safety
and reliability.\ nDiabetes Prediction Using Machine Learning \ n • Developed an
end - to -
end machine learning pipeline to predict diabetes using the Kaggle Diabetes dataset.\ n • Performed data cleaning,
exploratory data analysis,
feature engineering,
model selection,
and evaluation.\ n • Achieved high accuracy using a Random Forest classifier.\ nClothing Classification using ANN \ n • Developed a clothing classification model using Convolutional Neural Networks (CNN) on the Fashion - MNIST dataset.\ n • Trained the model to accurately predict apparel categories,
leveraging deep learning for image - based classification.\ nSmartSpeller — Context - Aware Spelling Corrector \ n • Built SmartSpeller,
an intelligent spelling correction tool using Python
and Streamlit.\ n • Utilized a large text corpus with unigram
and bigram language models for word frequency analysis
and context - correction.\ n • Combined edit distance with contextual probabilities to accurately correct isolated words
and improve suggestions based on \ nthe previous word,
enhancing real - world usability.\ nAn NLP - based Emotion - Aware Conversational Agent \ n • EmotiSense chatbot uses a BERT - based emotion classification model to detect user emotions
and generates context - \ naware,
emphathetic responses through dialoGBT,
enhancing human like interaction.\ n • It tracks user - specific chat history
and includes an admin secured feature to view
or clear records,
ensuring both \ npersonalization
and privacy in sensitive applications.\ n EDUCATION \ n2022 - Present National University of Technology NUTECH \ n Islamabad,
Pakistan \ nBS Artificial Intelligence – 6th Semester \ n \ n 2020 – 2022 Punjab Group of Colleges for Boys Pakpattan,
Pakistan \ n FSC (Pre - Engineering) \ n \ nCertifications \ nMachine Learning with Python – IBM \ nThe Nuts
and Bolts of Machine Learning – Google \ nIntroduction to Python – Coursera Project Network \ nGet Started with Python – Google \ nFoundations of Data Science – Google \ nFoundations: Data,
Data,
Everywhere – Google \ nIntroduction to FastAPI framework – Duke University \ nIntroduction to frontend development – Meta 2025 -07 -29 11 :40 :10.756 ["Machine Learning with Python - IBM", "The Nuts and Bolts of Machine Learning - Google", "Introduction to Python - Coursera Project Network", "Get Started with Python - Google", "Foundations of Data Science - Google", "Foundations: Data, Data, Everywhere - Google", "Introduction to FastAPI framework - Duke University", "Introduction to frontend development - Meta"] babar.islam @cymaxtech.com [null] \ N github.com / babar \ N Babar Islam ["Health Chatbot Using LangChain: Developed a health-focused chatbot using LangChain and OpenAI for medical queries.", "Diabetes Prediction Using Machine Learning: Developed a pipeline to predict diabetes using the Kaggle Diabetes dataset.", "Clothing Classification using ANN: Developed a clothing classification model using CNN on the Fashion-MNIST dataset.", "SmartSpeller \\u2014 Context-Aware Spelling Corrector: Built an intelligent spelling correction tool using Python and Streamlit.", "An NLP-based Emotion-Aware Conversational Agent: EmotiSense chatbot using BERT-based emotion classification model for empathetic responses."] ["Python", "PHP", "Javascript", "Java", "SQL", "Laravel", "PyTorch", "Keras", "LangChain", "FastAPI", "Scikit-learn", "Pandas", "Numpy", "Matplotlib", "Seaborn", "Pickel", "NLTK", "OpenCV"] Bachelor 's	0	+92 3049846835	Passionate SEO Specialist with expertise in machine learning and data science, seeking entry-level position in AI projects.
cmdoqu9uz0002ndowbcf14x9d	cmdoqu9dz0000ndowx4ll2sak	D:\\cv-jd\\uploads\\1753806047987-Mehdi_Ali_Resume - CERN.docx	Mehdi_Ali_Resume - CERN.docx	Muhammad Mehdi Ali\nFull-Stack Developer | Former GDSC Web Dev Lead\t\tEmail: mehdikhanofficial@gmail.com\nLinkedIn: www.linkedin.com/in/mehdikhan55\t\tPortfolio: mehdiali.vercel.app\nGitHub: github.com/mehdikhan55\t\tMobile: (+92) 313 2297998\n\nEDUCATION\nNational University of Technology                                                                                                                    Islamabad, Pakistan\nBachelor of Computer Science - CGPA: 3.57                                                                           \tExpected 2026\n\nSKILLS SUMMARY\nLanguages:\tJavaScript, Typescript, Python, Java, C++\nFrameworks:\tNext.js, React.js, Express.js, Flask, Tailwind CSS\nLibraries:\tContext API, Redux/RTK, ShadCN, Framer Motion, Pandas, Numpy, Matplotlib, Scikit-learn\nAI & Automation:\tLangChain, ML, OpenAI API, Agentic AI, AI Agent, n8n, Make.com\nDatabases:\tMongoDB, SQL, MySQL, PostgreSQL \nTools:\tGit, Github, Mongoose, Firebase, Appwrite, Postman, Prisma, C-Panel, WordPress, WooCommerce, Trello\nSoft Skills:        \tProblem Solving, TeamWork, Adaptability, Troubleshooting, Effective Communication\n\nWORK EXPERIENCE\nFull Stack Developer | Hexler Tech (SMC-PVT) LTD                                      \t              September 2024 - Present\nDeveloped and maintained several web applications utilizing Next.js and MERN Stack, improving performance and reliability.\nOptimized existing applications, leading to a 30% improvement in user experience and application speed.\nBuilt and deployed role-based portals and management systems including portals for Hexler Tech and NSTP.\nTranslated Figma designs into responsive React components, ensuring seamless frontend-backend integration.\nCollaborated with teams to design and implement new features, delivering high-quality, business-aligned solutions.\nReact Native Intern | Hamsan Tech (SMC-PVT) LTD           \t June 2023 - August 2023\nGained hands-on experience in React Native by developing mobile applications for real-world use cases.\nContributed to debugging, feature development, and code reviews while implementing best practices to uphold code quality.\n\nPROJECTS\nAI Voice Agent | Appointment Scheduler for Dental Clinic | (voxa-ai-solutions.vercel.app)                                                             \nBuilt an AI voice agent using VAPI and Make.com for automated appointment scheduling via natural voice interactions.\nSolved the problem of manual call handling by automating appointment booking and calendar management.\nIntegrated Google Calendar via Make.com scenarios for real-time scheduling, slot suggestions, and double-booking prevention.\nImproved operational efficiency by reducing staff workload, minimizing booking errors, and providing 24/7 availability.\nPrisma Care | Patients and Appointments Management | (prismacare.vercel.app)                                                                 \t\nBuilt a responsive healthcare application empowers patients to easily register and book appointments.\nImplemented administrative controls for appointment scheduling, confirmation, and cancellation.\nIntegrated Twilio for SMS notifications and Sentry for application monitoring to ensure seamless user experience.\nTechnologies used: Next.js, Appwrite, Typescript, ShadCN, Tailwind CSS and Twilio.\nSvivax | AI-Powered Video Generation Platform | (svivax.vercel.com)                    \t\nBuilt an AI platform that converts text prompts into videos with multiple style options (Realistic, Vintage, Cartoonish).\nDeveloped responsive interface with advanced animations using Framer Motion, Three.js, and GSAP for enhanced UX. \nImplemented complete video generation workflow with real-time progress tracking and download functionality using Next.js.\nDream Football (Ground Booking & Club Management System)\t \nBuilt a MERN platform for ground booking, team, league, and match management, including handling challenges and requests.\nDeveloped an admin panel for operational oversight and financial reporting. \nIntegrated secure authentication, role-based access, and responsive UI.\n\nLEADERSHIP & VOLUNTEERING\nWeb Development Lead                                                                                                                                                     2023-2024\nGoogle Developer Student Clubs (GDSC), NUTECH                                                                           \t\n\nCERTIFICATIONS\nMeta Front-End Developer (Professional Certification) by Meta \nReact Native (Professional Certification) \nBusiness English: Marketing and Sales by Arizona State University \nPrompt Engineering for ChatGPT by Vanderbilt University	2025-07-29 16:20:51.179	["Meta Front-End Developer", "React Native", "Business English: Marketing and Sales", "Prompt Engineering for ChatGPT"]	mehdikhanofficial@gmail.com	["Hexler Tech (SMC-PVT) LTD: Full Stack Developer", "Hamsan Tech (SMC-PVT) LTD: React Native Intern"]	\N	github.com/mehdikhan55	www.linkedin.com/in/mehdikhan55	Muhammad Mehdi Ali	["AI Voice Agent: Automated appointment scheduling using AI voice agent", "Prisma Care: Healthcare application for patients and appointments management"]	["JavaScript", "React.js", "Next.js", "MongoDB", "Git"]	Bachelor' s 2 (+ 92) 313 2297998 Full - Stack Developer with expertise in JavaScript,
React.js,
and MongoDB.Experienced in developing web applications
and AI solutions.cmdre6xhh0009ndi06c3pfv50 cmdre6xbd0007ndi0268s6mcw D: \ \ cv - jd \ \ uploads \ \ 1753966204622 - Sarah_Malik_CV.docx Sarah_Malik_CV.docx Sarah Malik \ nEmail: sarah.malik.hr @gmail.com \ nPhone: + 92 -312 -1234567 \ nLinkedIn: linkedin.com / in / sarahmalik - hr \ nLocation: Lahore,
Pakistan \ nProfessional Summary \ nInnovative
and data - driven HR specialist with 3 + years of experience in talent acquisition using AI
and analytics tools.Skilled in enhancing recruitment workflows,
improving hiring accuracy through AI tools,
and training hiring managers on digital transformation practices in HR.\ nExperience \ nHR Specialist – TechHire Solutions \ nMar 2022 – Present \ n - Used AI tools to automate resume screening,
reducing manual hours by 50 %. \ n - Implemented predictive hiring analysis,
improving hiring quality by 30 %. \ n - Integrated third - party recruitment AI tools (e.g., X0PA AI, Fetcher).\ nTalent Acquisition Assistant – HRWorks Pvt Ltd \ nJan 2020 – Feb 2022 \ n - Collaborated with teams on smart job postings using NLP suggestions.\ n - Conducted initial candidate interviews using AI - enhanced scoring sheets.\ n - Monitored
and analyzed recruitment KPIs with dashboards.\ nEducation \ nBachelor ’ s in Human Resource Management – University of the Punjab (2019) \ nSkills \ n • AI Recruitment Tools (HireVue, X0PA, Zoho Recruit) \ n • Resume Screening & ATS Tools \ n • HR Analytics & Dashboarding \ n • Interview Automation \ n • Predictive Hiring Models \ nCertifications \ n • AI in Recruitment – Coursera (2023) \ n • Strategic Talent Acquisition – LinkedIn Learning (2022) 2025 -07 -31 12 :50 :05.189 ["AI in Recruitment - Coursera (2023)", "Strategic Talent Acquisition - LinkedIn Learning (2022)"] sarah.malik.hr @gmail.com ["TechHire Solutions: HR Specialist", "HRWorks Pvt Ltd: Talent Acquisition Assistant"] \ N \ N linkedin.com / in / sarahmalik - hr Sarah Malik null ["AI Recruitment Tools", "Resume Screening & ATS Tools", "HR Analytics & Dashboarding", "Interview Automation", "Predictive Hiring Models"] Bachelor 's	3	+92-312-1234567	Innovative and data-driven HR specialist with 3+ years of experience in talent acquisition using AI and analytics tools.
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.skills (id, "skillName", category, "createdAt") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: candidate_skills candidate_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidate_skills
    ADD CONSTRAINT candidate_skills_pkey PRIMARY KEY ("candidateId", "skillId");


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: cv_scores cv_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_scores
    ADD CONSTRAINT cv_scores_pkey PRIMARY KEY (id);


--
-- Name: email_history email_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_history
    ADD CONSTRAINT email_history_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: job_skills job_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: resumes resumes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_pkey PRIMARY KEY (id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: applications_candidateId_jobId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "applications_candidateId_jobId_key" ON public.applications USING btree ("candidateId", "jobId");


--
-- Name: candidates_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX candidates_email_key ON public.candidates USING btree (email);


--
-- Name: cv_scores_applicationId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "cv_scores_applicationId_key" ON public.cv_scores USING btree ("applicationId");


--
-- Name: email_templates_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX email_templates_name_key ON public.email_templates USING btree (name);


--
-- Name: skills_skillName_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "skills_skillName_key" ON public.skills USING btree ("skillName");


--
-- Name: applications applications_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public.candidates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications applications_jobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: candidate_skills candidate_skills_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidate_skills
    ADD CONSTRAINT "candidate_skills_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public.candidates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: candidate_skills candidate_skills_skillId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidate_skills
    ADD CONSTRAINT "candidate_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cv_scores cv_scores_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_scores
    ADD CONSTRAINT "cv_scores_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cv_scores cv_scores_jobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_scores
    ADD CONSTRAINT "cv_scores_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cv_scores cv_scores_resumeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_scores
    ADD CONSTRAINT "cv_scores_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES public.resumes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_history email_history_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_history
    ADD CONSTRAINT "email_history_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public.candidates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_history email_history_jobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_history
    ADD CONSTRAINT "email_history_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: email_history email_history_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_history
    ADD CONSTRAINT "email_history_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.email_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: job_skills job_skills_jobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT "job_skills_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: resumes resumes_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT "resumes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public.candidates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--
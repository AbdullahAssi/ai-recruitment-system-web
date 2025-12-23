-- Data-only restore script
-- Run this AFTER: npx prisma migrate deploy

-- Disable triggers for faster import
SET session_replication_role = replica;

BEGIN;


-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

-- Data for Name: candidate_skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

-- Data for Name: cv_scores; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

-- Data for Name: email_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

-- Data for Name: job_skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
    --

-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

-- Data for Name: resumes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
    --
--

-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--
COPY public.skills (id, "skillName", category, "createdAt") FROM stdin;
\.

COMMIT;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Analyze tables for optimal query performance
ANALYZE;

-- Update sequence values to avoid conflicts
SELECT setval(pg_get_serial_sequence('public.email_templates', 'id'), COALESCE(MAX(id), 1)) FROM public.email_templates;
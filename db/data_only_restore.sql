-- Data-only restore script
-- Run this AFTER running: npx prisma migrate deploy
-- This file contains only data insertions, no schema changes
-- Disable triggers temporarily for faster import
SET session_replication_role = replica;
-- Clear existing data (optional - comment out if you want to keep existing data)
TRUNCATE TABLE public.cv_scores CASCADE;
TRUNCATE TABLE public.applications CASCADE;
TRUNCATE TABLE public.email_history CASCADE;
TRUNCATE TABLE public.job_skills CASCADE;
TRUNCATE TABLE public.candidate_skills CASCADE;
TRUNCATE TABLE public.resumes CASCADE;
TRUNCATE TABLE public.candidates CASCADE;
TRUNCATE TABLE public.jobs CASCADE;
TRUNCATE TABLE public.email_templates CASCADE;
TRUNCATE TABLE public.skills CASCADE;
-- Data for Name: applications
COPY public.applications (
    id,
    "candidateId",
    "jobId",
    score,
    status,
    "appliedAt"
)
FROM stdin;
cmdla5xv6000andyoh5tt2cwe cmdla5lkn0006ndyojh1dww38 cmdla2k450000ndyofwmhuh6a 0 PENDING 2025 -07 -27 06 :10 :43.507 cmdldgs6k000cndwksxijepd3 cmdldghj80008ndwkvuvzsgls cmdldabmw0005ndwkzqkxy4nq 0 PENDING 2025 -07 -27 07 :43 :08.204 cmdleb7cs000hndwkpy6ccyne cmdleaxua000dndwki03of22c cmdlcfcei0002ndwkij1yxb49 0 PENDING 2025 -07 -27 08 :06 :47.549 cmdleiqt0000jndwkqoyxqb0m cmdleaxua000dndwki03of22c cmdldabmw0005ndwkzqkxy4nq 0 PENDING 2025 -07 -27 08 :12 :39.348 cmdlkmi7o0004ndj0isxf8dd0 cmdlkma7k0000ndj0tecwrtjc cmdldabmw0005ndwkzqkxy4nq 0 PENDING 2025 -07 -27 11 :03 :32.532 cmdll1xid0006ndj07etyb4kd cmdlkma7k0000ndj0tecwrtjc cmdlcfcei0002ndwkij1yxb49 0 PENDING 2025 -07 -27 11 :15 :32.197 cmdllpsp80008ndj0l6c7uvlu cmdldghj80008ndwkvuvzsgls cmdlcfcei0002ndwkij1yxb49 90 PENDING 2025 -07 -27 11 :34 :05.708 cmdlw5ct90004nd30x1sxolzw cmdlw4v8h0000nd30yjskw1bl cmdlcfcei0002ndwkij1yxb49 0 PENDING 2025 -07 -27 16 :26 :07.774 cmdlycfni000bnd30z33h8f1u cmdlybnx40007nd30jra3dvj5 cmdla2k450000ndyofwmhuh6a 0 PENDING 2025 -07 -27 17 :27 :37.278 cmdofju5y0004nd3ck6500lp6 cmdof76sf0000nd3c0jyzj36v cmdlcfcei0002ndwkij1yxb49 0 PENDING 2025 -07 -29 11 :04 :48.485 cmdoimcn30001nd88t9lekzvh cmdogtbg7000dnd3c3tnkhuku cmdlcfcei0002ndwkij1yxb49 0 SHORTLISTED 2025 -07 -29 12 :30 :44.602 cmdlcfqna0004ndwkvic5xomn cmdla5lkn0006ndyojh1dww38 cmdlcfcei0002ndwkij1yxb49 0 SHORTLISTED 2025 -07 -27 07 :14 :19.942 cmdr7rt7b0001ndi03mxw5iyv cmdoqu9dz0000ndowx4ll2sak cmdlcfcei0002ndwkij1yxb49 0 PENDING 2025 -07 -31 09 :50 :22.098 cmdr8enpf0005ndi0c7wrhkrv cmdoqu9dz0000ndowx4ll2sak cmdla2k450000ndyofwmhuh6a 50 PENDING 2025 -07 -31 10 :08 :08.067 cmdr7xcb50003ndi0wc4hjwh2 cmdoqu9dz0000ndowx4ll2sak cmdldabmw0005ndwkzqkxy4nq 50 PENDING 2025 -07 -31 09 :54 :40.145 cmdre847n000bndi0i17ip9p4 cmdre6xbd0007ndi0268s6mcw cmdre54l20006ndi0zj66tmqn 75 REVIEWED 2025 -07 -31 12 :51 :00.563 cmdrevpld000dndi0la6khl8f cmdre6xbd0007ndi0268s6mcw cmdla2k450000ndyofwmhuh6a 50 PENDING 2025 -07 -31 13 :09 :21.361 cmdrke4hl000fndi0i4s0edli cmdre6xbd0007ndi0268s6mcw cmdlcfcei0002ndwkij1yxb49 45 PENDING 2025 -07 -31 15 :43 :38.553 cmdrl2o3g000hndi0eewe5mwc cmdre6xbd0007ndi0268s6mcw cmdldabmw0005ndwkzqkxy4nq 60 PENDING 2025 -07 -31 16 :02 :43.708 cmdldb6x80007ndwka3xh97nz cmdla5lkn0006ndyojh1dww38 cmdldabmw0005ndwkzqkxy4nq 0 REVIEWED 2025 -07 -27 07 :38 :47.37 \.-- Data for Name: candidate_skills
COPY public.candidate_skills ("candidateId", "skillId", level, "createdAt")
FROM stdin;
\.-- Re-enable triggers
SET session_replication_role = DEFAULT;
-- Refresh sequences to avoid ID conflicts
SELECT setval(
        pg_get_serial_sequence('public.email_templates', 'id'),
        COALESCE(MAX(id), 1)
    )
FROM public.email_templates;
ANALYZE;
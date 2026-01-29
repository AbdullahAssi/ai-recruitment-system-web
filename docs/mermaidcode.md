sequenceDiagram
    actor HR as HR User
    participant Browser
    participant AuthAPI as Auth API
    participant HRLayout as HR Layout
    participant CompanySetup as Company Setup Page
    participant CompanyAPI as Company API
    participant HRProfileAPI as HR Profile API
    participant JobsPage as HR Jobs Page
    participant CandidatesPage as HR Candidates Page
    participant AnalyticsPage as HR Analytics Page
    participant JobsAPI as Jobs API
    participant CandidatesAPI as Candidates API
    participant AnalyticsAPI as Analytics API
    participant DB as Database

    Note over HR,DB: HR Registration & Login Flow
    HR->>Browser: Register as HR
    Browser->>AuthAPI: POST /api/auth/register (role: HR)
    AuthAPI->>DB: Create User + HRProfile (companyId: null)
    DB-->>AuthAPI: User & HRProfile Created
    AuthAPI-->>Browser: Registration Success
    Browser-->>HR: Redirect to Login

    HR->>Browser: Login
    Browser->>AuthAPI: POST /api/auth/login
    AuthAPI->>DB: Verify credentials
    DB-->>AuthAPI: User authenticated
    AuthAPI-->>Browser: Login Success (JWT token)
    Browser-->>HR: Redirect to /hr

    Note over HR,DB: Company Setup Check
    HR->>Browser: Access HR Portal (/hr)
    Browser->>HRLayout: Load HR Layout
    HRLayout->>HRProfileAPI: GET /api/hr/profile/{userId}
    HRProfileAPI->>DB: Fetch HRProfile
    DB-->>HRProfileAPI: HRProfile (companyId: null)
    HRProfileAPI-->>HRLayout: Profile with no company
    HRLayout-->>Browser: Redirect to /hr/company/setup
    Browser->>CompanySetup: Show Company Setup Page
    CompanySetup-->>HR: Display Company Form

    Note over HR,DB: Company Creation
    HR->>CompanySetup: Fill company details
    CompanySetup->>CompanyAPI: POST /api/company (name, description, etc.)
    CompanyAPI->>DB: Create Company
    DB-->>CompanyAPI: Company Created (companyId)
    CompanyAPI-->>CompanySetup: Company created successfully

    Note over HR,DB: Link HR Profile to Company
    CompanySetup->>HRProfileAPI: PATCH /api/hr/profile/{userId} (companyId)
    HRProfileAPI->>DB: Update HRProfile.companyId
    DB-->>HRProfileAPI: HRProfile Updated
    HRProfileAPI-->>CompanySetup: Profile linked to company
    CompanySetup-->>Browser: Redirect to /hr
    Browser-->>HR: Show HR Dashboard

    Note over HR,DB: HR Accessing Jobs (Company-Specific)
    HR->>Browser: Navigate to Jobs
    Browser->>JobsPage: Load Jobs Page
    JobsPage->>HRProfileAPI: GET /api/hr/profile/{userId}
    HRProfileAPI->>DB: Fetch HRProfile
    DB-->>HRProfileAPI: HRProfile (companyId)
    HRProfileAPI-->>JobsPage: CompanyId retrieved
    JobsPage->>JobsAPI: GET /api/jobs?companyId={companyId}&includeInactive=true
    JobsAPI->>DB: Fetch Jobs WHERE companyId = {companyId}
    DB-->>JobsAPI: Company-specific jobs
    JobsAPI-->>JobsPage: Filtered jobs list
    JobsPage-->>HR: Display only company's jobs

    Note over HR,DB: HR Creating Job (Auto-linked to Company)
    HR->>JobsPage: Create New Job
    JobsPage->>JobsAPI: POST /api/jobs (title, description, userId)
    JobsAPI->>HRProfileAPI: GET HRProfile by userId
    HRProfileAPI->>DB: Fetch companyId
    DB-->>HRProfileAPI: CompanyId
    HRProfileAPI-->>JobsAPI: CompanyId
    JobsAPI->>DB: Create Job WITH companyId
    DB-->>JobsAPI: Job created
    JobsAPI-->>JobsPage: Job created successfully
    JobsPage-->>HR: Job posted

    Note over HR,DB: HR Viewing Candidates (Company-Specific)
    HR->>Browser: Navigate to Candidates
    Browser->>CandidatesPage: Load Candidates Page
    CandidatesPage->>HRProfileAPI: GET /api/hr/profile/{userId}
    HRProfileAPI->>DB: Fetch HRProfile
    DB-->>HRProfileAPI: HRProfile (companyId)
    HRProfileAPI-->>CandidatesPage: CompanyId retrieved
    CandidatesPage->>CandidatesAPI: GET /api/candidates?companyId={companyId}
    CandidatesAPI->>DB: Fetch Candidates WHERE applications.job.companyId = {companyId}
    DB-->>CandidatesAPI: Candidates who applied to company jobs
    CandidatesAPI-->>CandidatesPage: Filtered candidates
    CandidatesPage-->>HR: Display only relevant candidates

    Note over HR,DB: HR Viewing Analytics (Company-Specific)
    HR->>Browser: Navigate to Analytics
    Browser->>AnalyticsPage: Load Analytics Page
    AnalyticsPage->>HRProfileAPI: GET /api/hr/profile/{userId}
    HRProfileAPI->>DB: Fetch HRProfile
    DB-->>HRProfileAPI: HRProfile (companyId)
    HRProfileAPI-->>AnalyticsPage: CompanyId retrieved
    AnalyticsPage->>AnalyticsAPI: GET /api/analytics?companyId={companyId}
    AnalyticsAPI->>DB: Calculate analytics WHERE companyId = {companyId}
    DB-->>AnalyticsAPI: Company-specific metrics
    AnalyticsAPI-->>AnalyticsPage: Filtered analytics data
    AnalyticsPage-->>HR: Display company analytics

    Note over HR,DB: Candidate View (Public Jobs with Company Info)
    actor Candidate as Candidate
    Candidate->>Browser: Browse Jobs
    Browser->>JobsAPI: GET /api/jobs (no companyId filter)
    JobsAPI->>DB: Fetch all active jobs WITH companyInfo
    DB-->>JobsAPI: Jobs with company details
    JobsAPI-->>Browser: Jobs list with company info
    Browser-->>Candidate: Display jobs with company logos/details



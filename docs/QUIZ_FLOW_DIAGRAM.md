# 📊 Quiz Module - Flow Diagrams

## Complete Quiz Flow (Mermaid)

### Main Application to Quiz Flow

```mermaid
flowchart TD
    Start([Candidate Browses Jobs]) --> Apply[Candidate Clicks Apply]
    Apply --> CheckResume{Has Resume?}

    CheckResume -->|Yes| SelectResume[Select Resume]
    CheckResume -->|No| UploadResume[Upload Resume]

    SelectResume --> SubmitApp[Submit Application]
    UploadResume --> SubmitApp

    SubmitApp --> CreateApp[POST /api/applications]
    CreateApp --> SaveApp[(Save Application<br/>Status: PENDING)]
    SaveApp --> RunScoring[AI Score Resume<br/>FastAPI]
    RunScoring --> UpdateScore[(Update Application<br/>with Score)]
    UpdateScore --> ReturnResponse[Return Response<br/>with redirectTo]

    ReturnResponse --> Redirect[Redirect to<br/>/candidate/quiz/:appId]

    Redirect --> QuizPage[Quiz Page Loads]
    QuizPage --> GenerateQuiz[POST /api/quiz/generate]

    GenerateQuiz --> FetchData[Fetch Application,<br/>Job, Resume Data]
    FetchData --> CheckExisting{Quiz Attempt<br/>Exists?}

    CheckExisting -->|Yes| Error1[Return Error:<br/>Already Generated]
    CheckExisting -->|No| GetQuiz[Get/Create Quiz<br/>for Job]

    GetQuiz --> PrepareData[Prepare Resume Data<br/>for AI]
    PrepareData --> CallFastAPI1[FastAPI:<br/>POST /quiz/generate]

    CallFastAPI1 --> GenerateQuestions[OpenAI Generates<br/>5 Questions]
    GenerateQuestions --> CreateAttempt[(Create QuizAttempt<br/>Store Questions)]
    CreateAttempt --> UpdateStatus1[(Update Application<br/>Status: QUIZ_PENDING)]

    UpdateStatus1 --> ReturnQuiz[Return Quiz Data<br/>to Frontend]
    ReturnQuiz --> DisplayQuiz[Display Quiz Interface]

    DisplayQuiz --> StartTimer[Start 30min Timer]
    StartTimer --> ShowQuestion[Show Question 1/5]

    ShowQuestion --> CandidateAnswer[Candidate Selects Answer]
    CandidateAnswer --> AutoSave[PATCH /api/quiz/:id<br/>Auto-save Answer]
    AutoSave --> SaveProgress[(Save Progress)]

    SaveProgress --> CheckNav{Next or<br/>Previous?}
    CheckNav -->|Previous| ShowPrev[Show Previous Question]
    CheckNav -->|Next| CheckLast{Last Question?}

    ShowPrev --> CandidateAnswer
    CheckLast -->|No| ShowNext[Show Next Question]
    CheckLast -->|Yes| ShowSubmit[Show Submit Button]

    ShowNext --> CandidateAnswer

    ShowSubmit --> CheckAnswered{All Questions<br/>Answered?}
    CheckAnswered -->|No| ShowWarning[Show Warning Dialog]
    CheckAnswered -->|Yes| EnableSubmit[Enable Submit Button]

    ShowWarning --> ConfirmSubmit{Confirm<br/>Submit?}
    ConfirmSubmit -->|No| ShowQuestion
    ConfirmSubmit -->|Yes| SubmitQuiz

    EnableSubmit --> ClickSubmit[Candidate Clicks Submit]
    ClickSubmit --> SubmitQuiz[POST /api/quiz/submit]

    StartTimer --> CheckTime{Time<br/>Remaining?}
    CheckTime -->|< 5 min| ShowWarning1[Show Yellow Warning]
    CheckTime -->|< 1 min| ShowWarning2[Show Red Warning]
    CheckTime -->|0 min| TimeUp[Show Time Up Dialog]

    ShowWarning1 --> CheckTime
    ShowWarning2 --> CheckTime
    TimeUp --> AutoSubmit[Auto-submit After 5s]
    AutoSubmit --> SubmitQuiz

    SubmitQuiz --> ValidateSubmit{Quiz Attempt<br/>Valid?}
    ValidateSubmit -->|No| Error2[Return Error]
    ValidateSubmit -->|Yes| CallFastAPI2[FastAPI:<br/>POST /quiz/submit]

    CallFastAPI2 --> GradeQuiz[Grade Answers<br/>Calculate Score]
    GradeQuiz --> CheckPass{Score >=<br/>Passing?}

    CheckPass -->|Yes| MarkPassed[Set passed = true]
    CheckPass -->|No| MarkFailed[Set passed = false]

    MarkPassed --> UpdateAttempt
    MarkFailed --> UpdateAttempt

    UpdateAttempt[(Update QuizAttempt<br/>score, passed, completedAt)]
    UpdateAttempt --> UpdateStatus2[(Update Application<br/>Status: QUIZ_COMPLETED)]
    UpdateStatus2 --> ReturnResults[Return Detailed Results]

    ReturnResults --> DisplayResults[Display Results Page]
    DisplayResults --> ShowScore[Show Overall Score]
    ShowScore --> ShowBreakdown[Show Question Breakdown]
    ShowBreakdown --> ShowExplanations[Show Explanations]
    ShowExplanations --> ShowActions[Show Action Buttons]

    ShowActions --> CandidateChoice{Candidate<br/>Chooses?}
    CandidateChoice -->|Dashboard| Dashboard[Go to Dashboard]
    CandidateChoice -->|Browse Jobs| BrowseJobs[Browse More Jobs]

    Dashboard --> End1([End])
    BrowseJobs --> End2([End])
    Error1 --> End3([End])
    Error2 --> End4([End])

    style Start fill:#e1f5e1
    style End1 fill:#ffe1e1
    style End2 fill:#ffe1e1
    style End3 fill:#ffe1e1
    style End4 fill:#ffe1e1
    style DisplayResults fill:#fff4e1
    style SubmitQuiz fill:#e1f0ff
    style CallFastAPI1 fill:#f0e1ff
    style CallFastAPI2 fill:#f0e1ff
```

### HR View Quiz Results Flow

```mermaid
flowchart TD
    HRStart([HR Logs In]) --> HRDash[Navigate to HR Dashboard]
    HRDash --> ViewApps[View Applications List]

    ViewApps --> ShowList[Display Applications<br/>with Quiz Status Badges]
    ShowList --> CheckStatus{Quiz Status?}

    CheckStatus -->|Completed| BadgeGreen[🟢 Completed Badge]
    CheckStatus -->|Pending| BadgeYellow[🟡 Pending Badge]
    CheckStatus -->|Not Started| BadgeGray[⚪ Not Started Badge]

    BadgeGreen --> ClickApp
    BadgeYellow --> ClickApp
    BadgeGray --> ClickApp

    ClickApp[HR Clicks Application] --> FetchAppData[GET /api/applications/:id/quiz]
    FetchAppData --> LoadData[(Fetch Application<br/>with QuizAttempt)]
    LoadData --> DisplayAppDetails[Display Application Details]

    DisplayAppDetails --> HasQuiz{Quiz<br/>Completed?}
    HasQuiz -->|No| ShowPending[Show Quiz Pending Message]
    HasQuiz -->|Yes| ShowQuizResults[Display Quiz Results Section]

    ShowQuizResults --> ShowStats[Show Score, Pass/Fail,<br/>Time Spent]
    ShowStats --> ShowQuestions[Show Question Breakdown]
    ShowQuestions --> ShowAnswers[Show Candidate Answers<br/>vs Correct Answers]
    ShowAnswers --> ShowCategory[Show Question Categories]

    ShowCategory --> HRActions{HR Action?}
    HRActions -->|Review Next| ViewApps
    HRActions -->|Shortlist| Shortlist[Update Status:<br/>SHORTLISTED]
    HRActions -->|Reject| Reject[Update Status:<br/>REJECTED]

    ShowPending --> HREnd1([End])
    Shortlist --> HREnd2([End])
    Reject --> HREnd3([End])

    style HRStart fill:#e1f5e1
    style HREnd1 fill:#ffe1e1
    style HREnd2 fill:#ffe1e1
    style HREnd3 fill:#ffe1e1
    style ShowQuizResults fill:#fff4e1
```

### Database State Flow

```mermaid
stateDiagram-v2
    [*] --> ApplicationCreated: Candidate Applies

    ApplicationCreated --> QuizPending: Quiz Generated
    note right of QuizPending
        Application.status = QUIZ_PENDING
        Application.quizRequired = true
        Application.quizCompleted = false
        QuizAttempt created
    end note

    QuizPending --> QuizInProgress: Candidate Taking Quiz
    note right of QuizInProgress
        QuizAttempt.answers updated
        Auto-save on each answer
        Timer running
    end note

    QuizInProgress --> QuizCompleted: Quiz Submitted
    note right of QuizCompleted
        Application.status = QUIZ_COMPLETED
        Application.quizCompleted = true
        QuizAttempt.completedAt set
        QuizAttempt.score calculated
        QuizAttempt.passed set
    end note

    QuizCompleted --> Reviewed: HR Reviews
    Reviewed --> Shortlisted: HR Approves
    Reviewed --> Rejected: HR Rejects

    Shortlisted --> [*]
    Rejected --> [*]
```

### API Interaction Sequence

```mermaid
sequenceDiagram
    participant C as Candidate Browser
    participant N as Next.js API
    participant DB as PostgreSQL
    participant F as FastAPI
    participant AI as OpenAI

    Note over C,AI: Application Submission
    C->>N: POST /api/applications
    N->>DB: Create Application (PENDING)
    DB-->>N: Application Created
    N->>F: POST /scoring/score-by-id
    F->>AI: Score Resume
    AI-->>F: Score Result
    F-->>N: Score Data
    N->>DB: Update Application with Score
    N-->>C: Response with redirectTo

    Note over C,AI: Quiz Generation
    C->>N: Navigate to /candidate/quiz/:appId
    C->>N: POST /api/quiz/generate
    N->>DB: Check Existing Quiz Attempt
    DB-->>N: No Existing Attempt
    N->>DB: Get/Create Quiz for Job
    DB-->>N: Quiz Record
    N->>F: POST /quiz/generate
    F->>AI: Generate Questions
    AI-->>F: 5 Questions with Options
    F-->>N: Quiz Questions
    N->>DB: Create QuizAttempt
    N->>DB: Update App (QUIZ_PENDING)
    N-->>C: Quiz Data & Questions

    Note over C,AI: Taking Quiz
    loop Every Answer
        C->>N: PATCH /api/quiz/:id
        N->>DB: Update Answers (Auto-save)
        DB-->>N: Saved
        N-->>C: Success
    end

    Note over C,AI: Quiz Submission
    C->>N: POST /api/quiz/submit
    N->>DB: Get QuizAttempt
    DB-->>N: Quiz Data
    N->>F: POST /quiz/submit
    F->>F: Grade Answers
    F-->>N: Results (score, correct count)
    N->>DB: Update QuizAttempt (score, passed)
    N->>DB: Update App (QUIZ_COMPLETED)
    N-->>C: Detailed Results

    Note over C,AI: HR Views Results
    C->>N: GET /api/applications/:id/quiz
    N->>DB: Get App with QuizAttempt
    DB-->>N: Complete Data
    N-->>C: Display Quiz Results
```

### Component Interaction Diagram

```mermaid
graph TB
    subgraph "Quiz Assessment Page"
        QP[QuizAssessmentPage<br/>Main Container]
        QT[QuizTimer<br/>Countdown]
        QPS[QuizProgress<br/>Visual Tracker]
        QC[QuizCard<br/>Question Display]
        QN[QuizNavigation<br/>Controls]
        QR[QuizResults<br/>Results Display]
    end

    subgraph "API Routes"
        GEN[/api/quiz/generate]
        SUB[/api/quiz/submit]
        GET[/api/quiz/:id]
        APPQ[/api/applications/:id/quiz]
    end

    subgraph "Database"
        APP[(Application)]
        QA[(QuizAttempt)]
        QZ[(Quiz)]
        CAND[(Candidate)]
    end

    subgraph "FastAPI Services"
        QGEN[Quiz Generation Service]
        QSUB[Quiz Submission Service]
    end

    QP --> QT
    QP --> QPS
    QP --> QC
    QP --> QN
    QP --> QR

    QP -.->|POST| GEN
    GEN --> QGEN
    QGEN --> QZ
    QGEN --> APP
    QGEN --> QA

    QP -.->|PATCH Auto-save| GET
    GET --> QA

    QP -.->|POST| SUB
    SUB --> QSUB
    QSUB --> QA
    QSUB --> APP

    APPQ --> APP
    APPQ --> QA
    APPQ --> CAND

    style QP fill:#e1f0ff
    style GEN fill:#fff4e1
    style SUB fill:#fff4e1
    style QGEN fill:#f0e1ff
    style QSUB fill:#f0e1ff
```

### Timer and Auto-Submit Logic

```mermaid
flowchart TD
    TimerStart[Timer Starts<br/>30:00] --> Countdown{Time<br/>Check}

    Countdown -->|> 5 min| Normal[Green Display<br/>No Warning]
    Countdown -->|<= 5 min| Warning1[Yellow Display<br/>5 min Warning]
    Countdown -->|<= 1 min| Warning2[Red Display<br/>1 min Warning]
    Countdown -->|0:00| TimeUp[Time Up!]

    Normal --> Continue1{Continue?}
    Warning1 --> Continue2{Continue?}
    Warning2 --> Continue3{Continue?}

    Continue1 -->|Yes| Countdown
    Continue2 -->|Yes| Countdown
    Continue3 -->|Yes| Countdown

    Continue1 -->|Submit| ManualSubmit[Manual Submit]
    Continue2 -->|Submit| ManualSubmit
    Continue3 -->|Submit| ManualSubmit

    TimeUp --> ShowDialog[Show Time Up Dialog]
    ShowDialog --> Wait5s[Wait 5 Seconds]
    Wait5s --> AutoSubmit[Auto Submit Quiz]

    ShowDialog --> SubmitNow{Click Submit<br/>Now?}
    SubmitNow -->|Yes| ManualSubmit

    ManualSubmit --> SubmitAPI[POST /api/quiz/submit]
    AutoSubmit --> SubmitAPI

    SubmitAPI --> Results[Show Results]

    style TimeUp fill:#ffcccc
    style AutoSubmit fill:#ffcccc
    style Results fill:#ccffcc
```

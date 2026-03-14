# Career Copilot Architecture

## 1. Overview
- Goal & users
  - Goal: Provide Indian freshers and early-career PM/BA candidates an AI-powered assistant for resume optimization, JD matching, and interview preparation.
  - Users: students, early-career professionals, campus hires, bootcamp graduates, first-time interviewers aiming for product/analytics/project roles.

- Key features
  - Resume analyzer: ATS scoring, strengths/weaknesses, bullets rewrite for target roles.
  - Job Description matcher: gap analysis, keyword alignment, copy-paste resume updates.
  - Mock interview engine: generate questions, collect answers, AI feedback, improvement tips.
  - File upload (PDF/DOC) via client-side parser.
  - Fully client-side privacy-first mode with user’s own Groq API key.

## 2. Current State
- Tech stack
  - Frontend: static HTML (`index.html`), ES modules JS (`src/app.js` + components), vanilla CSS with design token architecture.
  - AI API: third-party Groq LLM API from client browser (`src/api/groq.js`).
  - Storage: LocalStorage wrapper for API key + history (`src/utils/storage.js`).
  - No dedicated backend server; no own APIs, no DB, no auth.
  - Deployment target: static hosting (Vercel, GitHub Pages, any static site).

- Folder structure (tree format)
```
Career-Copilot/
├── assets/
├── docs/
│   └── architecture.md
├── src/
│   ├── app.js
│   ├── config.js
│   ├── api/groq.js
│   ├── components/fileUpload.js
│   ├── components/modal.js
│   ├── components/progressBar.js
│   ├── components/feedback.js
│   ├── styles/variables.css
│   ├── styles/base.css
│   ├── styles/components.css
│   ├── styles/layout.css
│   └── utils/
│       ├── pdfParser.js
│       ├── markdown.js
│       └── storage.js
├── index.html
├── README.md
├── ROADMAP.md
├── CONTRIBUTING.md
├── LICENSE
└── vercel.json
```

- Data flow
  1. User opens `index.html`; UI loads JS modules from `src/`.
  2. User sets Groq API key or uses persisted key from LocalStorage.
  3. User uploads resume (`pdfParser.js`) or pastes text; parsed text keeps in client state.
  4. User triggers feature (analyze/match/interview).
  5. `app.js` calls `api/groq.js`, which calls `CONFIG.GROQ_ENDPOINT` with the user API key.
  6. AI response (text) is parsed via `utils/markdown.js` and shown in DOM.
  7. Session history is optionally saved in `utils/storage.js` locally.
  8. No server-side persistence (GDPR-friendly, but limited for analytics/monetization).

- Scale limitations now
  - Client-only model: no multi-user state, rate-limited to each user’s Groq API key.
  - No backend enforcement of quota, caching or batching; each request hits Groq directly.
  - High latency / high cost risk for heavy usage (GPT-like token bills per user).
  - Security: API key stored in LocalStorage, XSS risk if code injection exists.
  - Offline support limited to front-end code; no centralized error logging/metrics.
  - No RBAC, no user accounts, no persistent profile tracking.

## 3. Large-Scale Roadmap (1M+ users target)
- Frontend upgrades (React/Vite etc.)
  - Migrate to React + Vite for fast dev loops and scale.
  - Componentize screens: ResumeWizard, JDMatcher, InterviewPlayground, UserProfile.
  - Add TypeScript for strong types, static analysis, and safe refactors.
  - Add dark mode and responsive design with CSS-in-JS or Tailwind.
  - Client-side routing (`react-router`) for deep linking to features.

- Backend (FastAPI + auth/DB)
  - Add FastAPI service for feature orchestration, user profile, usage logging.
  - Implement OAuth + email/password + passwordless login.
  - API endpoints: `/analysis`, `/jd-match`, `/interview/question`, `/interview/feedback`, `/history`, `/me`.
  - Move AI calls server-side to hide API keys and enforce budget.

- AI integration (local models for parsing/interviews)
  - Start with hosted API (Groq, OpenAI, Anthropic), then hybrid local model deploy (e.g., GGML, LLM-Serve, Ollama) for low-cost inference.
  - Separate roles:
    - `model-resume` for resume multi-pass scoring.
    - `model-jd` for semantic match and keyword extraction.
    - `model-interview` for Q/A evaluation and hints.
  - Add prompt orchestration + versioning for faster iteration.

- Scaling: Caching (Redis), queue (Celery/RabbitMQ), deploy (Vercel free → Railway/Render)
  - Caching:
    - Redis for repeated prompts or resume+JD hashes.
    - Memorystore for session tokens and throttles.
  - Queue:
    - Celery/RabbitMQ (or Redis Queue) for async batch tasks: long-run analysis, report generation, email recommendations.
  - Deploy:
    - Start: Vercel for frontend, Railway/Render for API + workers.
    - Move to Kubernetes (EKS/GKE) for 1M+ requests/day: autoscale, canaries, canary releases.

- Security: OWASP top 10, sanitization, rate limiting
  - Input validation/sanitization on server and in UI (avoid JS-injection through pasted content).
  - Rate limit APIs per user/IP, use token bucket and strict fail states.
  - Use CSP headers, SameSite cookies, https-only, XSS/CSRF protections.
  - Secure storage of credentials (hashed passwords, JWT + refresh flows).
  - Log auditing and monitoring (Sentry, Prometheus, Grafana).

- DB schema ideas
  - table `users`: id, email, hashed_password, role, created_at, updated_at.
  - table `resumes`: id, user_id, source (upload/text), provenance, text_hash, created_at.
  - table `job_descriptions`: id, user_id, title, content, created_at.
  - table `analysis_results`: id, user_id, resume_id, jd_id, type (resume/jd/interview), score, result_json, created_at.
  - table `interviews`: id, user_id, question, answer, eval_score, feedback_text, created_at.
  - table `api_keys`: id, user_id, provider, key_hash, usage_limits.

- Future: APIs, user accounts, progress tracking
  - Public REST API for integrations (CLI, Notion, Slack bot).
  - Per-user progress dashboards: interview badges, applied roles, weekly goal streaks.
  - Marketplace for templates (resume bullets, JD patterns).
  - Admin panel for content curation and prompt improvements.

## 4. Diagram
- Mermaid code for current + proposed high-level architecture

```mermaid
flowchart LR
  subgraph client [Static Web App (current)]
    Browser["Browser / Single Page UI"]
    subgraph source
      index[index.html]
      app[app.js + components]
    end
    Browser -->|UI events| app
    app -->|Groq calls| GroqAPI["Groq API (3rd party)"]
    app -->|LocalStorage| LocalStorage
    app -->|PDF parse| PDFParser["pdfParser.js"]
  end

  subgraph current_backend [None]
    NoBackend["No backend server currently"]
  end

  GroqAPI -->|response| app
  LocalStorage -->|persist key/history| app

  %% proposed architecture
  subgraph proposed [Large-scale architecture (1M+)]
    Browser2["React/Vite frontend"]
    API["FastAPI backend"]
    DB["PostgreSQL + Redis"]
    Worker["Celery/RabbitMQ (AI preprocessing) "]
    Model["LLM cluster or hosting (Groq/OpenAI/local)"]
  end

  Browser2 -->|JWT / REST| API
  API -->|store/retrieve| DB
  API -->|async tasks| Worker
  Worker -->|calls| Model
  API -->|sync calls (small)| Model
  DB -->|cache| Redis
  Model -->|AI response| API
  API -->|response| Browser2
```

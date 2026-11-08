# RepoGuide

RepoGuide turns a public GitHub repo URL into a guided tour: a summary, an interactive map of the main modules, plain-English explanations, and a "start here" reading order.

## About me
I'm a 3rd-year CS student learning as I build. After each change, explain what you did and why in simple terms. Prefer simple, readable code over clever code.

## Stack
- Next.js (App Router), TypeScript, Tailwind CSS
- GitHub REST API, token in GITHUB_TOKEN
- Gemini API via Google's official Gen AI SDK, key in GEMINI_API_KEY. All AI calls go through one function in lib/analyze.ts
- React Flow (@xyflow/react) for the map
- Deployed on Vercel

## Rules
- API keys are used only in server code (route handlers under app/api). Never in client components, never logged, never committed.
- GitHub logic lives in lib/github.ts, file selection in lib/select-files.ts, AI logic in lib/analyze.ts.
- One component per file in components/. Keep files small.
- Every API route returns a clear error for: invalid URL, repo not found or private, rate limit hit, repo too large.
- Run `npm run lint` and `npm run build` before saying a task is done.

## Commands
- npm run dev: start locally at localhost:3000
- npm run build: production build, must pass before committing
- npm run lint: check code style
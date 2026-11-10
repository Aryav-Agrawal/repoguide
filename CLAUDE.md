@AGENTS.md

## Design rules (UI redesign)
- Keep the existing design: colours, fonts, spacing, layout and icons. Never swap fonts, themes or the palette unless I ask.
- Add effects on top of the existing design. Change only what the current step asks for.
- Use the frontend-design skill for UI work.
- Libraries: motion (import from "motion/react"), gsap + @gsap/react for scroll animations, lenis on the home page only, @react-three/fiber + drei + postprocessing for the hero graph only, and Magic UI, Aceternity (free) and React Bits components through the shadcn registries. No other animation libraries.
- Every heavy effect (3D, WebGL, smooth scroll, parallax) checks useCanRunHeavyEffects() and shows a still image or a simple fade when it returns false.
- 3D and WebGL components are client components loaded with next/dynamic and ssr: false, and pause when off-screen.
- The React Flow map never gets moving backgrounds, parallax, smooth scroll or continuous animation.
- Animated text keeps the real text in the page for screen readers.
- After each step, npm run build must pass, and the page is checked at desktop and phone width.

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
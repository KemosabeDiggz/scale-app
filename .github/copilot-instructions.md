# S.C.A.L.E. — instructions for Copilot

## What this project is
S.C.A.L.E. is a workflow-automation app for small local service businesses
(missed-call text-back, contacts, booking, workflows). This one project holds
both the public website and the app.

- `public/welcome.html` — the marketing website (landing page). Logged-out
  visitors to `/` are sent here. Its "Start free" buttons go to `/register`
  and "Log in" goes to `/login`.
- `src/` — the React app (Vite + Tailwind + shadcn/ui). Routes are in
  `src/App.jsx`; pages are in `src/pages/`.
- `base44/` — the Base44 backend: entities (data tables), functions and
  workflows.

Brand: navy `#0B203C` and orange `#FF6A00`; fonts Inter and Space Grotesk.

## How to run it
Use the Base44 CLI, not `npm run dev` on its own:

    base44 login   # once per computer
    base44 link    # once per copy of the project
    base44 dev     # starts backend + frontend (usually http://localhost:5173)

`npm run build` checks that the app compiles.

## How to work with the owner
- The owner is not a programmer. Explain things in plain, simple words and
  give one step at a time.
- Ask before deleting files or making big changes.
- Pricing is on hold: do not fill in or quote prices (leave `$XX` as is).
- Never send texts, calls or emails to real people. Missed-call features stay
  in demo mode.

## Saving work (Git + GitHub)
The project is on GitHub at https://github.com/KemosabeDiggz/scale-app
(branch `main`). When asked to "save", "commit" or "commit and push":

1. `git status` to see what changed.
2. `git add` the changed files. Never add `.env` files, API keys, passwords,
   `node_modules/` or `dist/`.
3. `git commit -m "<short, clear description of what changed>"`
4. `git push`

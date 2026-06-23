# AI Rebuild Prompt

Use this prompt with another coding AI if you want it to recreate Daybook Studio on another laptop.

```text
Build a dependency-free static web app called Daybook Studio using only HTML, CSS, and vanilla JavaScript.

Goal:
Create a local-first personal note taker and day planner for a UX designer. The app should feel like a real workspace, not a landing page or dummy mockup.

Core product:
- One screen app with three main areas on desktop:
  - Notes list and search
  - Active note editor
  - Daily planner
- Responsive stacked layout on mobile.
- No backend, no account, no external APIs, no analytics, no framework required.
- Persist everything in browser localStorage.
- Add optional Supabase sync that can be enabled with a config file. If Supabase is not configured, the app must continue working local-only.
- Include GitHub Pages branch deployment guidance and basic PWA support so the app can be opened on mobile and added to the home screen.

Notes:
- Notes have id, title, type, tags, body, color, createdAt, updatedAt.
- Note types: Quick note, Meeting, Research, Critique, Decision, Idea.
- Render note types as selectable chips, not a dropdown.
- Note list supports search across title, type, tags, and body.
- Note editor autosaves on input.
- Add an explicit Save button even though autosave is active.
- Color selection should use circular color buttons, with the selected state shown by an outer border/ring.
- Add editor toolbar buttons for bullet list, numbered list, markdown link, and markdown image URL insertion.

Daily planner:
- The planner is date-based, not just "today".
- Provide Prev, Today, Next, and date picker controls.
- Each day stores:
  - focus
  - tasks
  - morning block
  - midday block
  - afternoon block
  - evening block
  - reflection
- Tasks belong to a selected date and have id, text, period, priority, done, date, createdAt.
- Task period options: Morning, Midday, Afternoon, Evening.
- Task priority options: High, Medium, Low.
- The task input should be full-width and roomy. Do not squeeze it into a tight row with all controls.
- Show task progress like "2 of 5 done".

Growth:
- Add a Growth section for longer thinking.
- Growth items have id, title, kind, status, note, createdAt, updatedAt.
- Growth kind options: short, long, learn, rendered as Short term, Long term, Learning.
- Growth status options: Active, Next, Done.
- Let the user add short-term goals, long-term goals, and things they want to learn.
- Each growth item can store a small note, change status, become a task for the selected day, open/create a note with the same title, or be deleted.
- Growth items must be included in localStorage, Supabase sync, and markdown export.

Quick capture:
- Add a quick capture area in the notes side panel.
- It should let the user quickly save a thought without deciding where it belongs.
- Saved captures can later become a note, a task, or a growth item.
- Captures can be deleted.

Wikilinks:
- Support [[Note title]] links inside note bodies and task text.
- Show existing-note chips in the editor so the user can insert [[Note title]] links without typing them manually.
- Add a toolbar command for creating a manual [[wikilink]].
- Clicking a wikilink opens an existing note with that title, or creates it if missing.
- Show outgoing links from the active note.
- Show backlinks into the active note from:
  - other notes that link to it
  - tasks that link to it
  - growth items that link to it
- Backlinks from tasks should show the task text and task date.
- Backlinks from growth items should show the growth item title and kind.

Export:
- Add a button to export markdown for the selected day and all notes.
- Export should include selected day focus, tasks, time blocks, reflection, growth items, then notes.

Supabase sync:
- Include a `supabase-config.js` file with a Supabase URL and anon public key placeholder.
- Include a `supabase-schema.sql` file.
- Use one table named `daybook_documents` with one JSON document per authenticated user.
- Enable Row Level Security so users can only select, insert, update, and delete their own row.
- The browser app should use only the anon/publishable key, never the service role key.
- Add email/password sign-in, sign-up, sign-out, sync status, and manual Sync controls.
- Pass the current app URL as `emailRedirectTo` during sign-up so email confirmations return to the app instead of Supabase's default Site URL.
- Show auth redirect errors from the URL hash in the sync status, then clean the hash from the address bar.
- On a new device with no local data, pull the cloud document after login.
- On local edits, continue saving to localStorage and queue a cloud sync when signed in.

Mobile/deployment:
- Make the static app publishable directly from the repository root with GitHub Pages branch publishing.
- Document the required Pages settings: Deploy from a branch, `main`, `/(root)`.
- Use relative paths such as `./index.html`, `./styles.css`, and `./service-worker.js` so the app works under a project URL like `/note-app/`.
- Include a `manifest.webmanifest`, an app icon, and a service worker that caches only same-origin app-shell files.
- Do not cache Supabase API requests in the service worker.

Design:
- Calm, utilitarian, polished workspace for a UX designer.
- No marketing hero page.
- Use responsive panels with restrained color.
- Notes and daily planner side panels should be resizable by dragging handles.
- Notes and daily planner side panels should also be collapsible.
- Light and dark theme toggle.
- Avoid cramped controls and text overflow.
- Make mobile layout stack cleanly without horizontal scrolling.

Initial seed data:
- Include two sample notes:
  - Portfolio critique notes
  - Research debrief template
- Include sample UX-oriented tasks and daily blocks so the first run feels understandable.
- Include sample growth items for one short-term goal and one learning topic.

Recommended file structure:
- index.html
- styles.css
- app.js
- supabase-config.js
- supabase-schema.sql
- manifest.webmanifest
- service-worker.js
- icons/icon.svg
- README.md
- PRODUCT_PLAN.md

Verification:
- Run a static server locally.
- Test note create/delete, explicit save, task add/remove/check, growth add/status/task/note/delete, date switching, wikilink create/open, task and growth backlinks, export, local-only fallback when Supabase is not configured, light/dark theme, and mobile layout.
```

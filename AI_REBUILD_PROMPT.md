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

Quick capture:
- Add a quick capture area in the notes side panel.
- It should let the user quickly save a thought without deciding where it belongs.
- Saved captures can later become either a note or a task.
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
- Backlinks from tasks should show the task text and task date.

Export:
- Add a button to export markdown for the selected day and all notes.
- Export should include selected day focus, tasks, time blocks, reflection, then notes.

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

Recommended file structure:
- index.html
- styles.css
- app.js
- README.md
- PRODUCT_PLAN.md

Verification:
- Run a static server locally.
- Test note create/delete, explicit save, task add/remove/check, date switching, wikilink create/open, task backlinks, export, light/dark theme, and mobile layout.
```

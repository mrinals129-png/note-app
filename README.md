# Daybook Studio

A local-first personal note taker and day planner built as a dependency-free static web app.

Daybook Studio is designed for a UX designer who wants one calm workspace for notes, daily planning, task capture, reflection, and lightweight knowledge linking.

## Features

- Notes with title, type, tags, color, search, and autosave.
- Quick capture inbox for thoughts that can become notes or tasks later.
- Daily planner with focus, dated tasks, morning/midday/afternoon/evening blocks, and reflection.
- Previous day, today, next day, and date picker navigation.
- `[[wikilinks]]` inside notes and tasks.
- Note-link chips for inserting `[[wikilinks]]` without typing them manually.
- Backlinks from notes and tasks into the active note.
- Resizable and collapsible side panels.
- Chip-based note categories and circular color selection.
- Editor toolbar for bullets, numbered lists, markdown links, and image embeds.
- Light/dark theme.
- Markdown export for the selected day and all notes.
- Browser-only persistence through `localStorage`.

## Run Locally

Open the folder in a terminal and run:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

You can also serve it with any static server. There is no build step.

## Files

- `index.html` - app structure
- `styles.css` - responsive UI and theme styles
- `app.js` - state, autosave, planner, tasks, wikilinks, backlinks, export
- `PRODUCT_PLAN.md` - product intent and roadmap
- `AI_REBUILD_PROMPT.md` - prompt/spec for another AI to recreate the app

## Data And Privacy

The app stores data only in the browser using `localStorage` under:

```text
daybook-studio-data-v1
daybook-studio-theme
```

No backend, account, sync, analytics, or external services are used.

## Copy To Another Laptop

Use one of these options:

1. Copy this folder to the other laptop.
2. Push this repo to a private Git remote and clone it there.
3. Give `AI_REBUILD_PROMPT.md` to another AI and ask it to recreate the app.

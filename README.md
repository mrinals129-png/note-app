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
- Optional Supabase sync with email/password sign-in.
- GitHub Pages branch deployment and basic installable PWA support.

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

## Mobile Access

The repo is a static app with `index.html` at the repository root, so the simplest GitHub Pages setup is branch publishing.

In GitHub, open Settings > Pages and choose:

```text
Source: Deploy from a branch
Branch: main
Folder: /(root)
```

Click Save. After GitHub finishes publishing, the app URL should be:

```text
https://mrinals129-png.github.io/note-app/
```

On your phone, open the Pages URL, sign in with the same Supabase account, sync, and use the browser's Add to Home Screen option.

## Supabase Sync

This repo is already connected to your Supabase project with the browser-safe publishable key in `supabase-config.js`:

```text
https://kcucslwbltzqymvtotwn.supabase.co
```

The database schema has also been applied to the project. To use sync on a laptop or phone:

1. Serve the app with a static server.
2. Open the app URL in the browser.
3. Sign up or sign in with email/password.
4. Use Sync to push or pull your daybook data.

Supabase Auth URL configuration should use:

```text
Site URL: https://mrinals129-png.github.io/note-app/
Redirect URL: https://mrinals129-png.github.io/note-app/**
Redirect URL: http://127.0.0.1:4173/**
Redirect URL: http://localhost:4173/**
```

If you ever create a fresh Supabase project, run the SQL in `supabase-schema.sql` first, then replace the URL and publishable key in `supabase-config.js`.

Do not paste the service role key into this app. The browser app should only use the anon/publishable key with Row Level Security enabled.

## Files

- `index.html` - app structure
- `styles.css` - responsive UI and theme styles
- `app.js` - state, autosave, planner, tasks, wikilinks, backlinks, export
- `supabase-config.js` - Supabase URL and browser-safe publishable key
- `supabase-schema.sql` - database table and Row Level Security policies
- `PRODUCT_PLAN.md` - product intent and roadmap
- `AI_REBUILD_PROMPT.md` - prompt/spec for another AI to recreate the app

## Data And Privacy

The app stores data only in the browser using `localStorage` under:

```text
daybook-studio-data-v1
daybook-studio-theme
```

Without signing in, the app stays local-only in the browser. No analytics are used.

When you sign in and sync, Daybook Studio stores one encrypted-in-transit JSON document per signed-in Supabase user in `public.daybook_documents`. Row Level Security policies restrict each user to their own row.

## Copy To Another Laptop

Use one of these options:

1. Copy this folder to the other laptop.
2. Push this repo to a private Git remote and clone it there.
3. Give `AI_REBUILD_PROMPT.md` to another AI and ask it to recreate the app.

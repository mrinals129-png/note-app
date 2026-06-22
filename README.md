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

## Supabase Sync Setup

Your project URL is already configured in `supabase-config.js`:

```text
https://kcucslwbltzqymvtotwn.supabase.co
```

To enable sync:

1. Open the Supabase SQL Editor for your project.
2. Run the SQL in `supabase-schema.sql`.
3. Go to Project Settings > Data API.
4. Copy the `anon` / publishable public key.
5. Replace `PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE` in `supabase-config.js`.
6. Reload the app, sign up or sign in, then use Sync.

Do not paste the service role key into this app. The browser app should only use the anon/publishable key with Row Level Security enabled.

## Files

- `index.html` - app structure
- `styles.css` - responsive UI and theme styles
- `app.js` - state, autosave, planner, tasks, wikilinks, backlinks, export
- `supabase-config.js` - Supabase URL and anon public key placeholder
- `supabase-schema.sql` - database table and Row Level Security policies
- `PRODUCT_PLAN.md` - product intent and roadmap
- `AI_REBUILD_PROMPT.md` - prompt/spec for another AI to recreate the app

## Data And Privacy

The app stores data only in the browser using `localStorage` under:

```text
daybook-studio-data-v1
daybook-studio-theme
```

By default, no backend, account, sync, analytics, or external services are used.

When Supabase sync is configured, Daybook Studio stores one encrypted-in-transit JSON document per signed-in Supabase user in `public.daybook_documents`. Row Level Security policies restrict each user to their own row.

## Copy To Another Laptop

Use one of these options:

1. Copy this folder to the other laptop.
2. Push this repo to a private Git remote and clone it there.
3. Give `AI_REBUILD_PROMPT.md` to another AI and ask it to recreate the app.

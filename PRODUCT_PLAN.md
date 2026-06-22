# Daybook Studio Product Plan

## Research Notes

- Google Keep points to quick capture, checklists, labels, color, search, and simple visual scanning as useful basics for everyday notes.
- Obsidian points to local files, markdown-oriented writing, search, links, and personal ownership as the bigger long-term direction.
- Notion points to flexible pages, tasks, databases, and templates, but its setup weight is too much for the first version.
- GitHub searches for small open-source note apps repeatedly surfaced the same practical v1: localStorage persistence, markdown-ish text areas, a list of notes, search, and simple task planning.

References:

- https://github.com/search?q=notes+app+react+markdown+localstorage&type=repositories&s=stars&o=desc
- https://github.com/search?q=note+taking+app+react+typescript+local+first&type=repositories&s=stars&o=desc
- https://github.com/search?q=todo+notes+planner+react&type=repositories&s=stars&o=desc
- https://en.wikipedia.org/wiki/Google_Keep
- https://en.wikipedia.org/wiki/Obsidian_(software)
- https://en.wikipedia.org/wiki/Notion_(productivity_software)

## Target User

A UX designer who needs one calm workspace for daily notes, critique notes, research observations, decisions, and the small plan that keeps the day moving.

## V1 Jobs

1. Capture a note quickly without setup.
2. Find old notes through search, tags, and type.
3. Plan today with one focus, a small task list, and four time blocks.
4. Revisit previous days with their own tasks, time blocks, and reflections.
5. Keep the data local and exportable.
6. Optionally sync notes and day planning across laptop and phone.

## V1 Scope

- Local-first static web app.
- Notes with title, type, tags, body, color, and updated time.
- Search across title, type, tags, and body.
- Daily focus, dated tasks, time blocks, and reflection.
- Day history through previous, next, today, and date picker controls.
- Basic `[[wikilinks]]` in notes and tasks that open existing notes or create missing linked notes.
- Existing-note link chips that insert `[[wikilinks]]` into the active note.
- Backlinks from both notes and tasks into the active note.
- Quick capture inbox for thoughts that can later become notes or tasks.
- Resizable and collapsible notes and daily-plan side panels.
- Chip-based note categories and circular color selection.
- Editor toolbar for bullets, numbered lists, markdown links, and image embeds.
- Light and dark themes.
- Markdown export for the selected day and all notes.
- Optional Supabase sync using one per-user JSON document and Row Level Security.

## Later Ideas

- Richer markdown rendering and inline image previews.
- Project spaces.
- Pinning and archive.
- Import from markdown.
- Weekly review.
- Calendar view.
- Separate entity tables for notes, tasks, captures, and assets if collaboration or advanced querying becomes important.

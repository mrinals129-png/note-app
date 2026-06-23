const STORE_KEY = "daybook-studio-data-v1";
const THEME_KEY = "daybook-studio-theme";
const LAYOUT_KEY = "daybook-studio-layout";
const SYNC_TABLE = "daybook_documents";

const colors = ["teal", "green", "gold", "coral", "indigo", "lavender"];
const noteTypes = ["Quick note", "Meeting", "Research", "Critique", "Decision", "Idea"];
const dayBlocks = ["morning", "midday", "afternoon", "evening"];
let hasStoredData = Boolean(localStorage.getItem(STORE_KEY));
let data = loadData();
let selectedNoteId = data.notes[0]?.id || "";
let selectedDayKey = dateKey();
let searchQuery = "";
let saveTimer = 0;
let layoutState = loadLayoutState();
let supabaseClient = null;
let authUser = null;
let syncTimer = 0;
let syncInFlight = false;
let syncPending = false;

const els = {
  todayLabel: document.querySelector("#todayLabel"),
  saveStatus: document.querySelector("#saveStatus"),
  syncStatus: document.querySelector("#syncStatus"),
  syncDot: document.querySelector("#syncDot"),
  authForm: document.querySelector("#authForm"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  signUpBtn: document.querySelector("#signUpBtn"),
  signOutBtn: document.querySelector("#signOutBtn"),
  syncNowBtn: document.querySelector("#syncNowBtn"),
  syncActions: document.querySelector("#syncActions"),
  accountLabel: document.querySelector("#accountLabel"),
  exportBtn: document.querySelector("#exportBtn"),
  themeToggle: document.querySelector("#themeToggle"),
  noteCount: document.querySelector("#noteCount"),
  newNoteBtn: document.querySelector("#newNoteBtn"),
  collapseNotesBtn: document.querySelector("#collapseNotesBtn"),
  collapseDayBtn: document.querySelector("#collapseDayBtn"),
  workspace: document.querySelector("#workspace"),
  resizeHandles: document.querySelectorAll(".resize-handle"),
  quickCaptureForm: document.querySelector("#quickCaptureForm"),
  captureInput: document.querySelector("#captureInput"),
  captureList: document.querySelector("#captureList"),
  captureCount: document.querySelector("#captureCount"),
  noteList: document.querySelector("#noteList"),
  searchInput: document.querySelector("#searchInput"),
  noteTitle: document.querySelector("#noteTitle"),
  noteTypeChips: document.querySelector("#noteTypeChips"),
  noteTags: document.querySelector("#noteTags"),
  noteBody: document.querySelector("#noteBody"),
  noteUpdated: document.querySelector("#noteUpdated"),
  saveNoteBtn: document.querySelector("#saveNoteBtn"),
  deleteNoteBtn: document.querySelector("#deleteNoteBtn"),
  colorSwatches: document.querySelector("#colorSwatches"),
  noteLinkSuggestions: document.querySelector("#noteLinkSuggestions"),
  editorToolbar: document.querySelector(".editor-toolbar"),
  wikilinkPanel: document.querySelector("#wikilinkPanel"),
  dayHeading: document.querySelector("#dayHeading"),
  dayDateInput: document.querySelector("#dayDateInput"),
  prevDayBtn: document.querySelector("#prevDayBtn"),
  nextDayBtn: document.querySelector("#nextDayBtn"),
  todayDayBtn: document.querySelector("#todayDayBtn"),
  taskProgress: document.querySelector("#taskProgress"),
  focusInput: document.querySelector("#focusInput"),
  taskForm: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  taskPeriod: document.querySelector("#taskPeriod"),
  taskPriority: document.querySelector("#taskPriority"),
  taskList: document.querySelector("#taskList"),
  timeBlocks: document.querySelector("#timeBlocks"),
  reflectionInput: document.querySelector("#reflectionInput")
};

function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadLayoutState() {
  const fallback = {
    notesWidth: 320,
    dayWidth: 380,
    notesCollapsed: false,
    dayCollapsed: false
  };
  const stored = localStorage.getItem(LAYOUT_KEY);
  if (!stored) {
    return fallback;
  }

  try {
    return { ...fallback, ...JSON.parse(stored) };
  } catch {
    return fallback;
  }
}

function persistLayout() {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layoutState));
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function keyToDate(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function shiftDay(key, amount) {
  const date = keyToDate(key);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

function formatDateLabel(key) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(keyToDate(key));
}

function emptyDay() {
  return {
    focus: "",
    blocks: { morning: "", midday: "", afternoon: "", evening: "" },
    reflection: ""
  };
}

function dayData(key = selectedDayKey, create = true) {
  if (!data.daily[key]) {
    if (!create) {
      return emptyDay();
    }
    data.daily[key] = emptyDay();
  }
  return data.daily[key];
}

function loadData() {
  const stored = localStorage.getItem(STORE_KEY);
  if (!stored) {
    return seedData();
  }

  try {
    const parsed = JSON.parse(stored);
    return normalizeData(parsed);
  } catch {
    return seedData();
  }
}

function normalizeData(value) {
  const safe = value && typeof value === "object" ? value : {};
  const normalized = {
    notes: Array.isArray(safe.notes) ? safe.notes : [],
    tasks: Array.isArray(safe.tasks) ? safe.tasks : [],
    daily: safe.daily && typeof safe.daily === "object" ? safe.daily : {},
    quickCaptures: Array.isArray(safe.quickCaptures) ? safe.quickCaptures : [],
    meta: safe.meta && typeof safe.meta === "object" ? safe.meta : {}
  };

  if (normalized.notes.length === 0) {
    normalized.notes = seedData().notes;
  }

  normalized.notes = normalized.notes.map((note) => ({
    id: note.id || createId(),
    title: note.title || "Untitled note",
    type: note.type || "Quick note",
    tags: Array.isArray(note.tags) ? note.tags : [],
    body: note.body || "",
    color: colors.includes(note.color) ? note.color : "teal",
    createdAt: note.createdAt || new Date().toISOString(),
    updatedAt: note.updatedAt || new Date().toISOString()
  }));

  normalized.tasks = normalized.tasks.map((task) => ({
    id: task.id || createId(),
    text: task.text || "Untitled task",
    period: ["Morning", "Midday", "Afternoon", "Evening"].includes(task.period) ? task.period : "Morning",
    priority: ["High", "Medium", "Low"].includes(task.priority) ? task.priority : "Medium",
    done: Boolean(task.done),
    date: task.date || dateKey(),
    createdAt: task.createdAt || new Date().toISOString()
  }));

  normalized.quickCaptures = normalized.quickCaptures.map((capture) => ({
    id: capture.id || createId(),
    text: capture.text || "",
    createdAt: capture.createdAt || new Date().toISOString()
  })).filter((capture) => capture.text.trim());

  Object.entries(normalized.daily).forEach(([key, entry]) => {
    const source = entry && typeof entry === "object" ? entry : {};
    const sourceBlocks = source.blocks && typeof source.blocks === "object" ? source.blocks : {};
    normalized.daily[key] = {
      focus: source.focus || "",
      blocks: {
        morning: sourceBlocks.morning || "",
        midday: sourceBlocks.midday || "",
        afternoon: sourceBlocks.afternoon || "",
        evening: sourceBlocks.evening || ""
      },
      reflection: source.reflection || ""
    };
  });

  normalized.meta = {
    updatedAt: normalized.meta.updatedAt || latestDataTimestamp(normalized)
  };

  return normalized;
}

function latestDataTimestamp(value) {
  const timestamps = [
    ...(value.notes || []).flatMap((note) => [note.createdAt, note.updatedAt]),
    ...(value.tasks || []).map((task) => task.createdAt),
    ...(value.quickCaptures || []).map((capture) => capture.createdAt)
  ].filter(Boolean);

  if (timestamps.length === 0) {
    return new Date().toISOString();
  }

  return timestamps.sort().at(-1);
}

function seedData() {
  const now = new Date().toISOString();
  const key = dateKey();

  return {
    notes: [
      {
        id: createId(),
        title: "Portfolio critique notes",
        type: "Critique",
        tags: ["portfolio", "case-study"],
        body:
          "Context\nReview the case study flow from problem to outcome.\n\nRelated\n[[Research debrief template]]\n\nObservations\n- The opening needs a sharper user problem.\n- Add one before and after comparison.\n- Pull metrics closer to the final screens.\n\nNext steps\n- Rewrite the intro.\n- Capture two visual artifacts from the process.",
        color: "indigo",
        createdAt: now,
        updatedAt: now
      },
      {
        id: createId(),
        title: "Research debrief template",
        type: "Research",
        tags: ["research", "synthesis"],
        body:
          "Goal\n\nParticipants\n\nPatterns\n- \n\nSurprises\n- \n\nDesign opportunities\n- \n\nOpen questions\n- ",
        color: "green",
        createdAt: now,
        updatedAt: now
      }
    ],
    quickCaptures: [],
    tasks: [
      {
        id: createId(),
        text: "Shape one clear design story",
        period: "Morning",
        priority: "High",
        done: false,
        date: key,
        createdAt: now
      },
      {
        id: createId(),
        text: "Review notes before the next critique",
        period: "Afternoon",
        priority: "Medium",
        done: false,
        date: key,
        createdAt: now
      }
    ],
    daily: {
      [key]: {
        focus: "Make the day easier to enter and easier to close.",
        blocks: {
          morning: "Define the story and collect references.",
          midday: "Sketch the flow and list assumptions.",
          afternoon: "Tighten one section and ask for feedback.",
          evening: "Close loops and write tomorrow's first move."
        },
        reflection: ""
      }
    },
    meta: {
      updatedAt: now
    }
  };
}

function persist(options = {}) {
  const shouldTouch = options.touch !== false;
  const shouldSync = options.sync !== false;
  if (shouldTouch) {
    data.meta = { ...(data.meta || {}), updatedAt: new Date().toISOString() };
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  hasStoredData = true;
  els.saveStatus.textContent = "Saving";
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    els.saveStatus.textContent = "Saved";
  }, 300);
  if (shouldSync) {
    queueCloudSync();
  }
}

function supabaseConfig() {
  return window.DAYBOOK_SUPABASE || {};
}

function authRedirectUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function renderAuthRedirectError() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const description = params.get("error_description");

  if (!description) {
    return;
  }

  renderSyncStatus(description, "error");
  window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
}

function isSupabaseConfigured() {
  const config = supabaseConfig();
  return Boolean(
    config.url &&
      config.anonKey &&
      !config.anonKey.includes("PASTE_") &&
      !config.anonKey.includes("YOUR_")
  );
}

function renderSyncStatus(message, tone = "idle") {
  els.syncStatus.textContent = message;
  els.syncDot.classList.toggle("is-ready", tone === "ready");
  els.syncDot.classList.toggle("is-busy", tone === "busy");
  els.syncDot.classList.toggle("is-error", tone === "error");
}

function renderAuthState(message) {
  const configured = isSupabaseConfigured();
  els.authForm.hidden = !configured || Boolean(authUser);
  els.syncActions.hidden = !configured || !authUser;
  els.accountLabel.textContent = authUser?.email || "Not signed in";

  if (!configured) {
    renderSyncStatus("Add Supabase anon key", "error");
    return;
  }

  if (message) {
    return;
  }

  renderSyncStatus(authUser ? "Signed in" : "Sign in to sync", authUser ? "ready" : "idle");
}

function queueCloudSync() {
  if (!supabaseClient || !authUser) {
    return;
  }

  renderSyncStatus("Sync queued", "busy");
  clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    pushToCloud();
  }, 900);
}

function replaceDataFromCloud(remoteData, remoteUpdatedAt) {
  data = normalizeData(remoteData);
  data.meta = { ...(data.meta || {}), updatedAt: remoteUpdatedAt || new Date().toISOString() };
  selectedNoteId = data.notes[0]?.id || "";
  selectedDayKey = selectedDayKey || dateKey();
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  hasStoredData = true;
  render();
}

async function pushToCloud(message = "Synced") {
  if (!supabaseClient || !authUser) {
    return;
  }

  if (syncInFlight) {
    syncPending = true;
    return;
  }

  syncInFlight = true;
  syncPending = false;
  renderSyncStatus("Syncing", "busy");

  const updatedAt = new Date().toISOString();
  data.meta = { ...(data.meta || {}), updatedAt };
  const payloadData = normalizeData(data);

  try {
    const { data: row, error } = await supabaseClient
      .from(SYNC_TABLE)
      .upsert(
        {
          user_id: authUser.id,
          data: payloadData,
          updated_at: updatedAt
        },
        { onConflict: "user_id" }
      )
      .select("updated_at")
      .single();

    if (error) {
      throw error;
    }

    data.meta.updatedAt = row?.updated_at || updatedAt;
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    hasStoredData = true;
    renderSyncStatus(message, "ready");
  } catch (error) {
    renderSyncStatus(error.message || "Sync failed", "error");
  } finally {
    syncInFlight = false;
    if (syncPending) {
      syncPending = false;
      queueCloudSync();
    }
  }
}

async function syncFromCloud() {
  if (!supabaseClient || !authUser) {
    return;
  }

  renderSyncStatus("Checking cloud", "busy");

  try {
    const { data: row, error } = await supabaseClient
      .from(SYNC_TABLE)
      .select("data, updated_at")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!row) {
      await pushToCloud("Cloud copy created");
      return;
    }

    const localUpdatedAt = new Date(data.meta?.updatedAt || 0).getTime();
    const remoteUpdatedAt = new Date(row.updated_at || 0).getTime();

    if (!hasStoredData || remoteUpdatedAt >= localUpdatedAt) {
      replaceDataFromCloud(row.data, row.updated_at);
      renderSyncStatus("Synced from cloud", "ready");
      return;
    }

    await pushToCloud("Synced local changes");
  } catch (error) {
    renderSyncStatus(error.message || "Cloud check failed", "error");
  }
}

async function signIn(event) {
  event.preventDefault();
  if (!supabaseClient) {
    return;
  }

  renderSyncStatus("Signing in", "busy");
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    renderSyncStatus(error.message, "error");
  }
}

async function signUp() {
  if (!supabaseClient) {
    return;
  }

  renderSyncStatus("Creating account", "busy");
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value;
  const { data: authData, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authRedirectUrl()
    }
  });

  if (error) {
    renderSyncStatus(error.message, "error");
    return;
  }

  if (!authData.session) {
    renderSyncStatus("Check email to confirm", "ready");
  }
}

async function signOut() {
  if (!supabaseClient) {
    return;
  }

  renderSyncStatus("Signing out", "busy");
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    renderSyncStatus(error.message, "error");
  }
}

async function initSupabase() {
  renderAuthState();

  if (!isSupabaseConfigured()) {
    return;
  }

  if (!window.supabase?.createClient) {
    renderSyncStatus("Supabase library unavailable", "error");
    return;
  }

  const config = supabaseConfig();
  supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  renderAuthRedirectError();

  const { data: sessionData, error } = await supabaseClient.auth.getSession();
  if (error) {
    renderSyncStatus(error.message, "error");
    return;
  }

  authUser = sessionData.session?.user || null;
  renderAuthState();
  if (authUser) {
    await syncFromCloud();
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    authUser = session?.user || null;
    renderAuthState();
    if (authUser) {
      syncFromCloud();
    } else {
      renderSyncStatus("Signed out", "ready");
    }
  });
}

function currentNote() {
  return data.notes.find((note) => note.id === selectedNoteId) || data.notes[0];
}

function updateNote(patch, options = {}) {
  const note = currentNote();
  if (!note) {
    return;
  }
  Object.assign(note, patch, { updatedAt: new Date().toISOString() });
  selectedNoteId = note.id;
  persist();
  renderNotes();
  if (options.renderEditor) {
    renderEditor();
  } else {
    els.noteUpdated.textContent = relativeDate(note.updatedAt);
  }
}

function setTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  els.themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
  els.themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  localStorage.setItem(THEME_KEY, theme);
}

function renderLayout() {
  els.workspace.style.setProperty("--notes-width", `${layoutState.notesWidth}px`);
  els.workspace.style.setProperty("--day-width", `${layoutState.dayWidth}px`);
  els.workspace.classList.toggle("notes-collapsed", layoutState.notesCollapsed);
  els.workspace.classList.toggle("day-collapsed", layoutState.dayCollapsed);
  document.querySelector(".notes-panel").classList.toggle("is-collapsed", layoutState.notesCollapsed);
  document.querySelector(".day-panel").classList.toggle("is-collapsed", layoutState.dayCollapsed);
  els.collapseNotesBtn.textContent = layoutState.notesCollapsed ? ">" : "<";
  els.collapseDayBtn.textContent = layoutState.dayCollapsed ? "<" : ">";
  els.collapseNotesBtn.setAttribute("aria-label", layoutState.notesCollapsed ? "Expand notes panel" : "Collapse notes panel");
  els.collapseDayBtn.setAttribute("aria-label", layoutState.dayCollapsed ? "Expand daily plan panel" : "Collapse daily plan panel");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function beginResize(event) {
  const target = event.currentTarget.dataset.resize;
  if ((target === "notes" && layoutState.notesCollapsed) || (target === "day" && layoutState.dayCollapsed)) {
    return;
  }

  const handle = event.currentTarget;
  handle.classList.add("is-dragging");
  document.body.classList.add("is-resizing");

  const onMove = (moveEvent) => {
    const bounds = els.workspace.getBoundingClientRect();
    if (target === "notes") {
      layoutState.notesWidth = clamp(moveEvent.clientX - bounds.left, 240, 520);
    } else {
      layoutState.dayWidth = clamp(bounds.right - moveEvent.clientX, 300, 560);
    }
    renderLayout();
  };

  const onUp = () => {
    handle.classList.remove("is-dragging");
    document.body.classList.remove("is-resizing");
    persistLayout();
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

function relativeDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Updated now";
  }
  return `Updated ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function renderNotes() {
  const query = searchQuery.trim().toLowerCase();
  const sorted = [...data.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const filtered = sorted.filter((note) => {
    const haystack = [note.title, note.type, note.body, note.tags.join(" ")].join(" ").toLowerCase();
    return haystack.includes(query);
  });

  els.noteCount.textContent = `${data.notes.length} ${data.notes.length === 1 ? "note" : "notes"}`;
  els.noteList.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No notes match this search.";
    els.noteList.append(empty);
    return;
  }

  filtered.forEach((note) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `note-card${note.id === selectedNoteId ? " is-active" : ""}`;
    button.dataset.noteId = note.id;
    button.dataset.color = note.color;
    button.innerHTML = `
      <strong>${escapeHtml(note.title)}</strong>
      <span>${escapeHtml(note.type)} - ${escapeHtml(note.tags.slice(0, 3).join(", ") || "No tags")}</span>
      <span>${relativeDate(note.updatedAt)}</span>
    `;
    els.noteList.append(button);
  });
}

function renderEditor() {
  const note = currentNote();
  if (!note) {
    return;
  }

  selectedNoteId = note.id;
  els.noteTitle.value = note.title;
  els.noteTags.value = note.tags.join(", ");
  els.noteBody.value = note.body;
  els.noteUpdated.textContent = relativeDate(note.updatedAt);
  renderTypeChips(note);

  els.colorSwatches.innerHTML = "";
  colors.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = `swatch${note.color === color ? " is-selected" : ""}`;
    swatch.dataset.color = color;
    swatch.setAttribute("aria-label", `${color} note color`);
    els.colorSwatches.append(swatch);
  });

  renderNoteLinkSuggestions(note);
  renderWikilinks(note);
}

function renderTypeChips(note) {
  els.noteTypeChips.innerHTML = "";
  noteTypes.forEach((type) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `type-chip${note.type === type ? " is-selected" : ""}`;
    chip.dataset.type = type;
    chip.textContent = type;
    els.noteTypeChips.append(chip);
  });
}

function extractWikilinks(text) {
  const links = new Set();
  const matcher = /\[\[([^\]\n]+)\]\]/g;
  let match = matcher.exec(text);

  while (match) {
    const title = match[1].trim();
    if (title) {
      links.add(title);
    }
    match = matcher.exec(text);
  }

  return [...links];
}

function findNoteByTitle(title) {
  const cleanTitle = title.trim().toLowerCase();
  return data.notes.find((note) => note.title.trim().toLowerCase() === cleanTitle);
}

function renderNoteLinkSuggestions(note) {
  els.noteLinkSuggestions.innerHTML = "";
  const candidates = data.notes
    .filter((candidate) => candidate.id !== note.id)
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (candidates.length === 0) {
    const empty = document.createElement("span");
    empty.className = "panel-meta";
    empty.textContent = "Create another note to link it here.";
    els.noteLinkSuggestions.append(empty);
    return;
  }

  candidates.forEach((candidate) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "note-link-chip";
    chip.dataset.title = candidate.title;
    chip.textContent = candidate.title;
    els.noteLinkSuggestions.append(chip);
  });
}

function normalizeTitle(title) {
  return title.trim().toLowerCase();
}

function renderInlineLinks(text) {
  let output = "";
  const matcher = /\[\[([^\]\n]+)\]\]/g;
  let lastIndex = 0;
  let match = matcher.exec(text);

  while (match) {
    const title = match[1].trim();
    output += escapeHtml(text.slice(lastIndex, match.index));
    output += `<button class="inline-wikilink" type="button" data-title="${escapeHtml(title)}">${escapeHtml(title)}</button>`;
    lastIndex = matcher.lastIndex;
    match = matcher.exec(text);
  }

  return output + escapeHtml(text.slice(lastIndex));
}

function collectBacklinks(note) {
  const targetTitle = normalizeTitle(note.title);
  const noteBacklinks = data.notes
    .filter((candidate) => candidate.id !== note.id)
    .filter((candidate) => extractWikilinks(candidate.body).some((title) => normalizeTitle(title) === targetTitle))
    .map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      source: "Note"
    }));

  const taskBacklinks = data.tasks
    .filter((task) => extractWikilinks(task.text).some((title) => normalizeTitle(title) === targetTitle))
    .map((task) => ({
      id: task.id,
      title: task.text,
      date: task.date,
      source: "Task"
    }));

  return [...noteBacklinks, ...taskBacklinks];
}

function renderWikilinks(note) {
  const links = extractWikilinks(note.body);
  const backlinks = collectBacklinks(note);
  els.wikilinkPanel.innerHTML = "";

  const heading = document.createElement("div");
  heading.className = "wikilink-heading";
  heading.innerHTML = `
    <h3>Links and backlinks</h3>
    <span class="panel-meta">${links.length + backlinks.length} total</span>
  `;
  els.wikilinkPanel.append(heading);

  if (links.length === 0 && backlinks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No links yet. Type [[Note title]] in notes or tasks.";
    els.wikilinkPanel.append(empty);
    return;
  }

  if (links.length > 0) {
    const outgoing = document.createElement("div");
    outgoing.className = "wikilink-section";
    outgoing.innerHTML = `<span class="wikilink-section-title">Outgoing</span>`;
    const list = document.createElement("div");
    list.className = "wikilink-list";

    links.forEach((title) => {
      const existing = findNoteByTitle(title);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "wikilink-chip";
      button.dataset.title = title;
      button.innerHTML = `
        <span>${escapeHtml(title)}</span>
        <small>${existing ? "Open" : "Create"}</small>
      `;
      list.append(button);
    });

    outgoing.append(list);
    els.wikilinkPanel.append(outgoing);
  }

  if (backlinks.length > 0) {
    const incoming = document.createElement("div");
    incoming.className = "wikilink-section";
    incoming.innerHTML = `<span class="wikilink-section-title">Backlinks</span>`;
    const list = document.createElement("div");
    list.className = "wikilink-list";

    backlinks.forEach((backlink) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "backlink-chip";
      button.dataset.noteId = backlink.id || "";
      button.dataset.day = backlink.date || "";
      button.innerHTML = `
        <span>${escapeHtml(backlink.source === "Task" ? backlink.title.replace(/\[\[|\]\]/g, "") : backlink.title)}</span>
        <small>${escapeHtml(backlink.source)}${backlink.date ? ` ${escapeHtml(backlink.date)}` : ""}</small>
      `;
      list.append(button);
    });

    incoming.append(list);
    els.wikilinkPanel.append(incoming);
  }
}

function openLinkedNote(title) {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    return;
  }

  let note = findNoteByTitle(cleanTitle);
  if (!note) {
    const now = new Date().toISOString();
    note = {
      id: createId(),
      title: cleanTitle,
      type: "Quick note",
      tags: ["linked"],
      body: "",
      color: "teal",
      createdAt: now,
      updatedAt: now
    };
    data.notes.unshift(note);
    persist();
  }

  selectedNoteId = note.id;
  searchQuery = "";
  els.searchInput.value = "";
  render();
  els.noteBody.focus();
}

function openBacklink(button) {
  if (button.dataset.noteId) {
    selectedNoteId = button.dataset.noteId;
    render();
    els.noteBody.focus();
    return;
  }

  if (button.dataset.day) {
    selectedDayKey = button.dataset.day;
    renderDay();
    els.taskInput.focus();
  }
}

function selectedDayTasks() {
  return data.tasks.filter((task) => task.date === selectedDayKey);
}

function renderTasks() {
  const tasks = selectedDayTasks().sort((a, b) => {
    if (a.done !== b.done) {
      return Number(a.done) - Number(b.done);
    }
    const priorityScore = { High: 0, Medium: 1, Low: 2 };
    return priorityScore[a.priority] - priorityScore[b.priority];
  });
  const doneCount = tasks.filter((task) => task.done).length;
  els.taskProgress.textContent = `${doneCount} of ${tasks.length} done`;
  els.taskList.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No tasks yet.";
    els.taskList.append(empty);
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement("div");
    item.className = "task-item";
    item.dataset.taskId = task.id;
    item.innerHTML = `
      <input type="checkbox" ${task.done ? "checked" : ""} aria-label="Complete task" />
      <div class="task-copy">
        <div class="task-title ${task.done ? "is-done" : ""}">${renderInlineLinks(task.text)}</div>
        <span class="task-meta">
          <span class="priority" data-priority="${escapeHtml(task.priority)}">${escapeHtml(task.priority)}</span>
          <span>${escapeHtml(task.period)}</span>
        </span>
      </div>
      <button class="remove-task" type="button" aria-label="Remove task">x</button>
    `;
    els.taskList.append(item);
  });
}

function renderQuickCaptures() {
  els.captureCount.textContent = `${data.quickCaptures.length} saved`;
  els.captureList.innerHTML = "";

  if (data.quickCaptures.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state compact-empty";
    empty.textContent = "Nothing waiting.";
    els.captureList.append(empty);
    return;
  }

  data.quickCaptures.forEach((capture) => {
    const item = document.createElement("div");
    item.className = "capture-item";
    item.dataset.captureId = capture.id;
    item.innerHTML = `
      <div class="capture-text">${renderInlineLinks(capture.text)}</div>
      <span class="panel-meta">${relativeDate(capture.createdAt)}</span>
      <div class="capture-actions">
        <button class="button button-secondary" data-action="note" type="button">Note</button>
        <button class="button button-secondary" data-action="task" type="button">Task</button>
        <button class="icon-button" data-action="delete" type="button" aria-label="Delete capture">x</button>
      </div>
    `;
    els.captureList.append(item);
  });
}

function addQuickCapture(event) {
  event.preventDefault();
  const text = els.captureInput.value.trim();
  if (!text) {
    return;
  }

  data.quickCaptures.unshift({
    id: createId(),
    text,
    createdAt: new Date().toISOString()
  });
  els.captureInput.value = "";
  persist();
  renderQuickCaptures();
}

function removeQuickCapture(id) {
  data.quickCaptures = data.quickCaptures.filter((capture) => capture.id !== id);
}

function captureToNote(capture) {
  const now = new Date().toISOString();
  const title = capture.text.split("\n")[0].trim().slice(0, 60) || "Captured thought";
  const note = {
    id: createId(),
    title,
    type: "Quick note",
    tags: ["capture"],
    body: capture.text,
    color: "teal",
    createdAt: now,
    updatedAt: now
  };
  data.notes.unshift(note);
  selectedNoteId = note.id;
  removeQuickCapture(capture.id);
  persist();
  render();
  els.noteBody.focus();
}

function captureToTask(capture) {
  data.tasks.push({
    id: createId(),
    text: capture.text.replace(/\s+/g, " ").trim(),
    period: "Morning",
    priority: "Medium",
    done: false,
    date: selectedDayKey,
    createdAt: new Date().toISOString()
  });
  removeQuickCapture(capture.id);
  persist();
  renderQuickCaptures();
  renderTasks();
  renderWikilinks(currentNote());
}

function renderDay() {
  const day = dayData(selectedDayKey, false);
  const isToday = selectedDayKey === dateKey();
  els.todayLabel.textContent = `Today is ${formatDateLabel(dateKey())}`;
  els.dayHeading.textContent = isToday ? "Today" : formatDateLabel(selectedDayKey);
  els.dayDateInput.value = selectedDayKey;
  els.focusInput.value = day.focus;
  dayBlocks.forEach((block) => {
    const textarea = els.timeBlocks.querySelector(`[data-block="${block}"]`);
    textarea.value = day.blocks[block] || "";
  });
  els.reflectionInput.value = day.reflection;
  renderTasks();
}

function render() {
  renderLayout();
  renderQuickCaptures();
  renderNotes();
  renderEditor();
  renderDay();
}

function createNote() {
  const now = new Date().toISOString();
  const note = {
    id: createId(),
    title: "Untitled note",
    type: "Quick note",
    tags: [],
    body: "",
    color: "teal",
    createdAt: now,
    updatedAt: now
  };
  data.notes.unshift(note);
  selectedNoteId = note.id;
  searchQuery = "";
  els.searchInput.value = "";
  persist();
  render();
  els.noteTitle.focus();
  els.noteTitle.select();
}

function deleteCurrentNote() {
  if (data.notes.length <= 1) {
    updateNote({
      title: "Untitled note",
      type: "Quick note",
      tags: [],
      body: "",
      color: "teal"
    }, { renderEditor: true });
    return;
  }

  const note = currentNote();
  data.notes = data.notes.filter((item) => item.id !== note.id);
  selectedNoteId = data.notes[0].id;
  persist();
  render();
}

function addTask(event) {
  event.preventDefault();
  const text = els.taskInput.value.trim();
  if (!text) {
    return;
  }

  data.tasks.push({
    id: createId(),
    text,
    period: els.taskPeriod.value,
    priority: els.taskPriority.value,
    done: false,
    date: selectedDayKey,
    createdAt: new Date().toISOString()
  });
  els.taskInput.value = "";
  persist();
  renderTasks();
  renderWikilinks(currentNote());
}

function updateDaily(patch) {
  Object.assign(dayData(), patch);
  persist();
}

function saveCurrentNote() {
  const note = currentNote();
  if (!note) {
    return;
  }
  note.body = els.noteBody.value;
  note.updatedAt = new Date().toISOString();
  persist();
  renderNotes();
  renderWikilinks(note);
  els.noteUpdated.textContent = relativeDate(note.updatedAt);
}

function replaceSelection(text, selectStartOffset = text.length, selectEndOffset = text.length) {
  const start = els.noteBody.selectionStart;
  const end = els.noteBody.selectionEnd;
  const value = els.noteBody.value;
  els.noteBody.value = `${value.slice(0, start)}${text}${value.slice(end)}`;
  const cursorStart = start + selectStartOffset;
  const cursorEnd = start + selectEndOffset;
  els.noteBody.focus();
  els.noteBody.setSelectionRange(cursorStart, cursorEnd);
  updateNote({ body: els.noteBody.value });
  renderWikilinks(currentNote());
}

function insertWikilink(title) {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    return;
  }
  replaceSelection(`[[${cleanTitle}]]`);
}

function selectedText() {
  return els.noteBody.value.slice(els.noteBody.selectionStart, els.noteBody.selectionEnd);
}

function formatSelectedLines(prefixFactory) {
  const selected = selectedText();
  if (!selected) {
    const start = els.noteBody.selectionStart;
    const value = els.noteBody.value;
    const needsNewLine = start > 0 && value[start - 1] !== "\n";
    const prefix = `${needsNewLine ? "\n" : ""}${prefixFactory(0)}List item`;
    const itemStart = prefix.indexOf("List item");
    replaceSelection(prefix, itemStart, itemStart + "List item".length);
    return;
  }

  const text = selected;
  const lines = text.split("\n");
  const formatted = lines.map((line, index) => `${prefixFactory(index)}${line.replace(/^[-\d. ]+/, "")}`).join("\n");
  replaceSelection(formatted);
}

function runEditorCommand(command) {
  if (command === "bullet") {
    formatSelectedLines(() => "- ");
    return;
  }

  if (command === "number") {
    formatSelectedLines((index) => `${index + 1}. `);
    return;
  }

  if (command === "wikilink") {
    const title = selectedText() || window.prompt("Note title", currentNote()?.title || "Note title");
    if (!title) {
      return;
    }
    insertWikilink(title);
    return;
  }

  if (command === "link") {
    const label = selectedText() || window.prompt("Link text", "Link text");
    if (!label) {
      return;
    }
    const url = window.prompt("Link URL", "https://");
    if (!url) {
      return;
    }
    replaceSelection(`[${label}](${url})`);
    return;
  }

  if (command === "image") {
    const url = window.prompt("Image URL", "https://");
    if (!url) {
      return;
    }
    const alt = window.prompt("Image description", "Image") || "Image";
    replaceSelection(`![${alt}](${url})`);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function exportMarkdown() {
  const day = dayData(selectedDayKey, false);
  const tasks = selectedDayTasks();
  const lines = [
    `# Daybook Studio export - ${selectedDayKey}`,
    "",
    `## ${formatDateLabel(selectedDayKey)}`,
    "",
    `Focus: ${day.focus || ""}`,
    "",
    "### Tasks",
    ...tasks.map((task) => `- [${task.done ? "x" : " "}] ${task.text} (${task.priority}, ${task.period})`),
    "",
    "### Time blocks",
    ...dayBlocks.flatMap((block) => [
      "",
      `#### ${block[0].toUpperCase()}${block.slice(1)}`,
      day.blocks[block] || ""
    ]),
    "",
    "### Reflection",
    day.reflection || "",
    "",
    "## Notes",
    ""
  ];

  data.notes
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .forEach((note) => {
      lines.push(`### ${note.title}`);
      lines.push(`Type: ${note.type}`);
      lines.push(`Tags: ${note.tags.join(", ")}`);
      lines.push("");
      lines.push(note.body);
      lines.push("");
    });

  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `daybook-studio-${selectedDayKey}.md`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  els.authForm.addEventListener("submit", signIn);
  els.signUpBtn.addEventListener("click", signUp);
  els.signOutBtn.addEventListener("click", signOut);
  els.syncNowBtn.addEventListener("click", syncFromCloud);

  els.themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    setTheme(nextTheme);
  });

  els.exportBtn.addEventListener("click", exportMarkdown);
  els.newNoteBtn.addEventListener("click", createNote);
  els.deleteNoteBtn.addEventListener("click", deleteCurrentNote);
  els.saveNoteBtn.addEventListener("click", saveCurrentNote);
  els.collapseNotesBtn.addEventListener("click", () => {
    layoutState.notesCollapsed = !layoutState.notesCollapsed;
    persistLayout();
    renderLayout();
  });
  els.collapseDayBtn.addEventListener("click", () => {
    layoutState.dayCollapsed = !layoutState.dayCollapsed;
    persistLayout();
    renderLayout();
  });
  els.resizeHandles.forEach((handle) => handle.addEventListener("mousedown", beginResize));
  els.quickCaptureForm.addEventListener("submit", addQuickCapture);
  els.captureList.addEventListener("click", (event) => {
    const link = event.target.closest(".inline-wikilink");
    if (link) {
      openLinkedNote(link.dataset.title);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) {
      return;
    }
    const item = actionButton.closest(".capture-item");
    const capture = data.quickCaptures.find((entry) => entry.id === item.dataset.captureId);
    if (!capture) {
      return;
    }
    if (actionButton.dataset.action === "note") {
      captureToNote(capture);
      return;
    }
    if (actionButton.dataset.action === "task") {
      captureToTask(capture);
      return;
    }
    removeQuickCapture(capture.id);
    persist();
    renderQuickCaptures();
  });

  els.prevDayBtn.addEventListener("click", () => {
    selectedDayKey = shiftDay(selectedDayKey, -1);
    renderDay();
  });

  els.nextDayBtn.addEventListener("click", () => {
    selectedDayKey = shiftDay(selectedDayKey, 1);
    renderDay();
  });

  els.todayDayBtn.addEventListener("click", () => {
    selectedDayKey = dateKey();
    renderDay();
  });

  els.dayDateInput.addEventListener("change", (event) => {
    if (!event.target.value) {
      return;
    }
    selectedDayKey = event.target.value;
    renderDay();
  });

  els.searchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value;
    renderNotes();
  });

  els.noteList.addEventListener("click", (event) => {
    const card = event.target.closest(".note-card");
    if (!card) {
      return;
    }
    selectedNoteId = card.dataset.noteId;
    render();
  });

  els.noteTitle.addEventListener("input", (event) => {
    updateNote({ title: event.target.value || "Untitled note" });
    renderWikilinks(currentNote());
  });
  els.noteTypeChips.addEventListener("click", (event) => {
    const chip = event.target.closest(".type-chip");
    if (!chip) {
      return;
    }
    updateNote({ type: chip.dataset.type }, { renderEditor: true });
  });
  els.noteTags.addEventListener("input", (event) => {
    const tags = event.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    updateNote({ tags });
  });
  els.noteLinkSuggestions.addEventListener("click", (event) => {
    const chip = event.target.closest(".note-link-chip");
    if (!chip) {
      return;
    }
    insertWikilink(chip.dataset.title);
  });
  els.noteBody.addEventListener("input", (event) => {
    updateNote({ body: event.target.value });
    renderWikilinks(currentNote());
  });
  els.editorToolbar.addEventListener("click", (event) => {
    const tool = event.target.closest("[data-command]");
    if (!tool) {
      return;
    }
    runEditorCommand(tool.dataset.command);
  });

  els.colorSwatches.addEventListener("click", (event) => {
    const swatch = event.target.closest(".swatch");
    if (!swatch) {
      return;
    }
    updateNote({ color: swatch.dataset.color }, { renderEditor: true });
  });

  els.wikilinkPanel.addEventListener("click", (event) => {
    const chip = event.target.closest(".wikilink-chip");
    if (chip) {
      openLinkedNote(chip.dataset.title);
      return;
    }

    const backlink = event.target.closest(".backlink-chip");
    if (backlink) {
      openBacklink(backlink);
    }
  });

  els.focusInput.addEventListener("input", (event) => updateDaily({ focus: event.target.value }));
  els.reflectionInput.addEventListener("input", (event) => updateDaily({ reflection: event.target.value }));
  els.timeBlocks.addEventListener("input", (event) => {
    if (!event.target.matches("[data-block]")) {
      return;
    }
    const day = dayData();
    day.blocks[event.target.dataset.block] = event.target.value;
    persist();
  });

  els.taskForm.addEventListener("submit", addTask);
  els.taskList.addEventListener("change", (event) => {
    if (event.target.type !== "checkbox") {
      return;
    }
    const item = event.target.closest(".task-item");
    const task = data.tasks.find((entry) => entry.id === item.dataset.taskId);
    if (!task) {
      return;
    }
    task.done = event.target.checked;
    persist();
    renderTasks();
    renderWikilinks(currentNote());
  });
  els.taskList.addEventListener("click", (event) => {
    const link = event.target.closest(".inline-wikilink");
    if (link) {
      openLinkedNote(link.dataset.title);
      return;
    }

    const remove = event.target.closest(".remove-task");
    if (!remove) {
      return;
    }
    const item = remove.closest(".task-item");
    data.tasks = data.tasks.filter((task) => task.id !== item.dataset.taskId);
    persist();
    renderTasks();
    renderWikilinks(currentNote());
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The app still works normally if offline caching is unavailable.
    });
  });
}

setTheme(localStorage.getItem(THEME_KEY) || "light");
bindEvents();
render();
initSupabase();
registerServiceWorker();

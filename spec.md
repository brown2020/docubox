# spec.md — Docubox Competitive Improvement Spec

> Baseline: CLAUDE.md (2026-02-06)
> Target: competitor-analysis.md (Dropbox)

---

## 1. Table Stakes Gaps

Things Dropbox has that we're missing and **must** add to be taken seriously.

---

### 1.1 File Sharing via Links

**We have now:** Nothing. Files are per-user only. No way to share.

**Dropbox does:** Generate shareable links for any file. Recipients view/download without an account. Optional password protection and expiration.

**What we'll build:**

- **Share button** on every file (table row action + grid card menu). Opens a share popover.
- Clicking "Create link" generates a unique public share token stored in Firestore.
- Share URL format: `/share/{shareToken}` — a public page (no auth required).
- The share page shows: filename, file type icon, file size, upload date, and a **Download** button.
- If the file has a summary, show the summary on the share page (read-only).
- **Copy link** button copies the URL to clipboard with toast confirmation.
- **Disable link** button revokes access (deletes the share token).
- Share links are per-file, not per-folder.

**Firestore changes:**
- Add to file document: `shareToken (string | null)`, `shareEnabled (boolean)`, `shareCreatedAt (Timestamp | null)`
- New top-level collection: `shares/{shareToken}` → `{ userId, fileId, createdAt }` (for efficient public lookup)

**Files affected:** `fileService.ts`, new `src/app/share/[token]/page.tsx`, new share API route or server action, table/grid action menus, new `SharePopover` component.

---

### 1.2 File Preview

**We have now:** Nothing. Users must download files to view them. Parsed text is viewable in the "Show Parsed Data" modal, but original files cannot be previewed.

**Dropbox does:** In-browser preview for 175+ file types.

**What we'll build:**

- **Preview modal** that opens when clicking a filename (instead of just selecting it).
- Supported preview types:
  - **Images** (jpg, png, gif, webp, svg): Render in `<img>` tag with zoom controls.
  - **PDF**: Render using browser's native PDF viewer via `<iframe>` or `<object>` with the Firebase Storage URL.
  - **Text/code** (txt, csv, json, md, xml, html, js, ts, py, etc.): Fetch content and render in a code block with syntax highlighting (reuse existing `codeblock.tsx`).
  - **Video** (mp4, webm): Render in `<video>` tag.
  - **Audio** (mp3, wav, ogg): Render in `<audio>` tag.
  - **Unsupported types**: Show file info + "Download to view" button.
- Modal has: filename header, preview content area, download button, close button.
- Preview loads the file directly from the Firebase Storage `downloadUrl`.

**Files affected:** New `FilePreviewModal` component, `useModalStore` (new modal type), table `FilenameCell` click handler, grid `Card` click handler.

---

### 1.3 Full-Text Search

**We have now:** Client-side filename filtering only. We have parsed document text in Firestore but don't search it.

**Dropbox does:** Full-text search across file names and contents.

**What we'll build:**

- Extend the existing search input to search **both filename and summary text**.
- When a user types in the search box, filter files where:
  - `filename` contains the search term (case-insensitive), OR
  - `summary` contains the search term (case-insensitive)
- This is still client-side filtering since we already have all file data loaded via the real-time Firestore subscription (which includes `summary`).
- Search results highlight which field matched (show "Matched in summary" badge if the filename didn't match but summary did).
- Add a search icon inside the input and a clear button.

**Files affected:** `useFilesList.ts` (expand filter logic), `TableWrapper.tsx` (search UI), column definitions for match indicator.

---

### 1.4 Storage Usage Display

**We have now:** Nothing. Users have no idea how much storage they're using.

**Dropbox does:** Storage quota bar in account settings.

**What we'll build:**

- **Storage usage bar** on the dashboard page, above the file table/grid.
- Shows: `X MB used` calculated from the sum of all file `size` fields (excluding deleted files).
- Compact horizontal bar with a label. No hard quota enforcement for now — just visibility.
- Also show storage used on the profile page.
- File count displayed alongside: `X files · Y MB used`.

**Files affected:** New `StorageUsageBar` component, `useFilesList.ts` or new `useStorageUsage` hook (compute from existing file data), dashboard page, profile page.

---

### 1.5 Breadcrumb Navigation

**We have now:** Only a back button when inside a folder. No path display.

**Dropbox does:** Full breadcrumb trail showing the folder path.

**What we'll build:**

- **Breadcrumb bar** above the file table/grid showing: `Home / Folder A / Subfolder B`
- Each breadcrumb segment is clickable to navigate to that level.
- "Home" (or a home icon) always links to the root level (`folderId = null`).
- Current folder name is shown as non-clickable text (last breadcrumb).
- Breadcrumbs are built by walking up the folder chain using `folderId` references in the loaded `allFiles` array.

**Files affected:** New `Breadcrumbs` component, `useFolderNavigation.ts` (add breadcrumb building logic), `TableWrapper.tsx` (render breadcrumbs).

---

### 1.6 Bulk File Operations

**We have now:** Nothing. Every action is one file at a time.

**Dropbox does:** Select multiple files for move, delete, download.

**What we'll build:**

- **Checkbox column** in table view (first column). Checkbox in grid view (overlay on card).
- **Select all** checkbox in table header.
- When files are selected, a **bulk action bar** appears at the top of the file list:
  - **Delete** — soft-deletes all selected files
  - **Move to folder** — opens a folder picker to move all selected files
  - **Download** — triggers browser download for each selected file
- Selection count shown: `X files selected`
- Clicking away or pressing Escape clears selection.
- Selection state stored in a new `useFileSelectionStore` (repurpose the existing one, which currently duplicates modal data).

**Files affected:** Refactor `useFileSelectionStore`, new `BulkActionBar` component, `DataTable.tsx` (checkbox column), `GridView.tsx` (checkbox overlay), `TableWrapper.tsx` (render bulk bar), `fileService.ts` (bulk operations).

---

## 2. Improvement Opportunities

Things we both have, but Dropbox does better. Our versions need to level up.

---

### 2.1 Sort Options

**We have now:** Sort by timestamp only (asc/desc).

**Dropbox does:** Sort by name, date modified, size, type.

**What we'll build:**

- **Sort dropdown** replacing the current simple toggle. Options:
  - Date modified (default) — ascending/descending
  - Name — A-Z / Z-A
  - Size — smallest/largest first
  - Type — grouped by file extension
- Folders always sort before files regardless of sort option.
- Current sort persists in the URL as a search param (`?sort=name&dir=asc`).

**Files affected:** `TableWrapper.tsx` (sort UI), `useFilesList.ts` (sort logic), column headers (clickable for sort).

---

### 2.2 Tags That Actually Work

**We have now:** Can add tags during rename, but tags aren't searchable, filterable, or displayed prominently.

**Dropbox does:** Poor tagging (one of their biggest complaints). We can beat them here.

**What we'll build:**

- **Tags displayed** as colored pills on each file row (table) and file card (grid).
- **Filter by tag:** Clicking a tag filters the file list to show only files with that tag.
- **Tag filter bar** below the search bar showing active tag filters with remove (x) buttons.
- Tags included in search — searching for a tag name shows files with that tag.
- **Quick-add tag** from the file action menu (without opening rename modal).
- Popular/recent tags shown as suggestions when adding tags.

**Files affected:** `columns.tsx` (tag display), `Card.tsx` (tag display), `useFilesList.ts` (tag filtering), `TableWrapper.tsx` (tag filter bar), `fileService.ts` (add tag action), new `TagFilter` component.

---

### 2.3 Improved Dashboard Layout

**We have now:** Dropzone takes up significant vertical space above the file list. The search/controls bar is functional but basic.

**Dropbox does:** Clean, compact header with upload button. File list takes up most of the viewport.

**What we'll build:**

- **Compact dropzone:** Replace the large dropzone area with a compact `Upload` button in the toolbar. The full-page drag-and-drop detection stays (show a drop overlay when dragging files over the page) but the permanent dropzone area is removed.
- **Unified toolbar:** Single row containing: breadcrumbs | search input | tag filters | sort dropdown | view toggle (table/grid) | upload button | new folder button.
- **More vertical space for files** — the file list should start higher on the page.

**Files affected:** `Dropzone.tsx` (refactor to overlay-only + button), `TableWrapper.tsx` (new toolbar layout), dashboard `page.tsx`.

---

### 2.4 Auto-Parse on Upload

**We have now:** Upload and parse are separate manual steps. User uploads, then must click "Parse" on each file.

**Dropbox does:** Files are immediately searchable and previewable after upload (no manual step).

**What we'll build:**

- After a successful file upload, **automatically trigger parsing** if the user has credits or their own Unstructured API key.
- Show a "Parsing..." status indicator on the file row/card while parsing is in progress.
- If parsing fails or the user has no credits/key, the file is still uploaded — just not parsed. The "Parse" button remains available as a manual fallback.
- User can disable auto-parse in profile settings (add `autoParseEnabled` boolean to profile).

**Firestore changes:** Add `autoParseEnabled (boolean, default: true)` to profile document. Add `parseStatus ("pending" | "parsing" | "parsed" | "failed" | null)` to file document.

**Files affected:** `Dropzone.tsx` (trigger parse after upload), `fileService.ts` (new status field), `ProfileComponent.tsx` (auto-parse toggle), file row/card (status indicator), `useUploadStore` (track parse status).

---

### 2.5 AI Summary Shown Inline

**We have now:** Summaries only visible inside the parsed data modal. No way to see summaries at a glance.

**Dropbox does:** AI summaries shown directly in file previews.

**What we'll build:**

- In the **file preview modal** (new from 1.2), show the AI summary in a collapsible panel below the preview.
- In the **table view**, add an expandable row detail — clicking an expand chevron shows the summary inline below the file row.
- In the **grid view**, show first ~100 chars of summary as a tooltip on hover.
- **Generate summary button** available in the preview modal if no summary exists yet.

**Files affected:** `FilePreviewModal` (summary panel), `DataTable.tsx` (expandable rows), `Card.tsx` (summary tooltip), columns.tsx (expand column).

---

### 2.6 Bug Fixes

**We have now:** Several known bugs documented in CLAUDE.md.

**What we'll fix:**

- `DeleteModal` doesn't close after successful deletion → add `close()` call back
- `ShowParsedDataModal` stale closure → add `unstructuredFileData` to dependency array
- Parsed data signed URLs expire after 24h → generate fresh URLs on demand (or use longer-lived URLs)
- Dead `loginfinish` route → remove or redirect to `/login`
- `useFileSelectionStore` duplication → merge into `useModalStore` or repurpose for bulk selection

**Files affected:** `DeleteModal.tsx`, `ShowParsedDataModal.tsx`, `unstructuredActions.ts`, `loginfinish/page.tsx`, `useFileSelectionStore.ts`.

---

## 3. Differentiators

Things we can do that Dropbox doesn't, or ways we can be meaningfully better.

---

### 3.1 AI-First Experience (Our Core Edge)

**Dropbox:** AI (Dash) is a separate add-on product. Most users don't know it exists. Summarization and Q&A are optional features.

**What we'll build:**

- **AI status badges** on every file showing its intelligence state:
  - 📄 Uploaded (gray) → ⚙️ Parsed (blue) → 🧠 Summarized (green) → 💬 Q&A Ready (purple)
- The badges make the AI pipeline **visible and intuitive**. Users immediately understand what each file "knows."
- With auto-parse (2.4), files progress through the pipeline automatically.
- **One-click "Make Smart"** button that runs the full pipeline: parse → summarize → upload to Ragie. Available on any unparsed file.
- **Smart file indicator** in the file list — files that have been fully processed show a subtle glow/accent.

**Files affected:** New `AIStatusBadge` component, column/card updates, new "Make Smart" action in file menus, `fileService.ts` (pipeline status tracking).

---

### 3.2 Content-Powered Search (Semantic)

**Dropbox:** Filename-based search. Dash adds AI search but it's a separate interface.

**What we'll build (beyond 1.3):**

- **"Ask your files" search mode** — toggle the search bar between "Search files" (filename + summary) and "Ask your files" (semantic AI search).
- In "Ask" mode, the query is sent to Ragie which searches across ALL the user's uploaded documents (not just one file).
- Results show relevant file names with snippet previews of matching content.
- This is our version of Dropbox Dash's universal search — but built into the main UI, not a separate product.
- Only available for files that have been uploaded to Ragie (Q&A Ready status).

**Files affected:** `TableWrapper.tsx` (search mode toggle), new `SemanticSearchResults` component, new server action `searchAllDocuments`, `ragieActions.ts` (cross-document retrieval).

---

### 3.3 Transparent Credit System (Already Exists — Polish It)

**Dropbox:** Hides AI costs in tier pricing. Users don't know what anything costs.

**What we'll improve:**

- **Credit cost shown before every AI action**: "This will use 4 credits. You have 847 remaining." with a confirm/cancel.
- **Credit history** on the profile page: table showing each credit transaction (date, action, file, cost).
- **Low credit warning**: toast notification when credits drop below 50.
- **Credit balance in header**: small credit count always visible next to the user avatar.

**Firestore changes:** New subcollection `users/{userId}/creditHistory/{id}` → `{ action, fileName, cost, balance, timestamp }`.

**Files affected:** New `CreditConfirmation` component (or inline in existing AI action flows), `ProfileComponent.tsx` (credit history), `Header.tsx` (credit badge), `useProfileStore.ts` (low credit warning).

---

### 3.4 Functional Tag System (Beat Dropbox's Weakness)

**Dropbox:** Minimal tagging — #1 user-requested feature they haven't built well.

This is already covered in improvement 2.2. Our tag system with colored pills, filtering, search integration, and quick-add will be materially better than what Dropbox offers. This is a concrete competitive advantage.

---

## 4. Not Doing

Things Dropbox has that we're **intentionally skipping** and why.

---

| Dropbox Feature | Why We're Skipping |
|-----------------|-------------------|
| **Desktop sync app** | We're a web app. Building a desktop sync agent is a massive engineering effort with no payoff for our AI-first positioning. Users access files through the browser. |
| **Mobile native app** | Responsive web is sufficient for now. A PWA is possible later. Native apps require separate codebases and app store maintenance. |
| **Shared folders / team workspaces** | Multi-user collaboration requires a fundamental data model change (from per-user to shared). Not worth the complexity for v1. Sharing via links (1.1) covers the primary use case. |
| **Password-protected / expiring share links** | Nice-to-have but adds complexity. Plain share links ship first; we can add password/expiry later. |
| **File requests** | Niche feature. Not enough value for the implementation cost. |
| **Document scanning (mobile)** | Requires native camera access and CV processing. Out of scope for a web app. |
| **SSO / SAML** | Enterprise feature. Not relevant for our current user base. |
| **Admin console / team management** | Requires multi-tenant architecture. Not building until we have team features. |
| **Offline access** | Service workers + IndexedDB is complex and fragile. Our users are online-first. |
| **Dropbox Transfer (one-time large file delivery)** | Our share links cover most of this use case. A dedicated transfer feature is over-engineering. |
| **Video feedback / annotation** | Niche collaboration feature. Not aligned with our document intelligence focus. |
| **AI writing / content creation** | Dropbox Dash's writing features overlap with ChatGPT, Google Docs AI, etc. Our AI focuses on understanding YOUR documents, not generating new content. |
| **Version history** | Useful but significant storage and data model cost. We have soft delete and restore. Full version history is a future consideration. |
| **Computer backup** | Desktop agent feature. Not applicable to a web app. |

---

## Implementation Priority

1. **Bug fixes (2.6)** — fix what's broken before building new
2. **File preview (1.2)** — biggest UX gap; users need to see their files
3. **File sharing (1.1)** — second biggest gap; required to be competitive
4. **Breadcrumbs (1.5)** — quick win; major navigation improvement
5. **Full-text search (1.3)** — quick win using existing data
6. **Improved dashboard layout (2.3)** — compact toolbar, more space for files
7. **Sort options (2.1)** — quick win; expected feature
8. **Storage usage (1.4)** — quick win; visibility feature
9. **Auto-parse (2.4)** — improves the AI pipeline experience
10. **AI status badges (3.1)** — makes AI features visible and discoverable
11. **Tags that work (2.2)** — competitive advantage over Dropbox
12. **Bulk operations (1.6)** — power user feature
13. **AI summary inline (2.5)** — polishes the AI experience
14. **Credit system polish (3.3)** — trust and transparency
15. **Semantic search (3.2)** — advanced differentiator

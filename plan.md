# Implementation Plan

Batches are ordered: fix what's broken → fill table-stakes gaps → improve existing features → add differentiators. Items that touch the same files are grouped together.

---

## Batch 1: Bug Fixes
**Spec items:** 2.6
**Why first:** Fix existing bugs before building new features on top of them.

| Change | File(s) | Detail |
|--------|---------|--------|
| Delete modal stays open after success | `DeleteModal.tsx` | Add `close()` call after successful deletion toast |
| Stale closure in summary generation | `ShowParsedDataModal.tsx` | Add `unstructuredFileData` to the `useCallback` dependency array for `handleGenerateSummary` |
| Parsed data URLs expire after 24h | `unstructuredActions.ts` | Change `uploadUnstructuredFile` to use public URLs (make storage objects publicly readable) or increase signed URL TTL significantly |
| Dead loginfinish route | `src/app/loginfinish/` | Simplify to just redirect to `/login` (keep route to avoid 404 for old bookmarks) |
| useFileSelectionStore duplication | `useFileSelectionStore.ts` | Clear out the existing fields that duplicate modal data; repurpose for bulk file selection (prep for Batch 7) |

**Firestore changes:** None
**Dependencies:** None

---

## Batch 2: File Preview
**Spec items:** 1.2
**Why second:** Biggest UX gap. Users currently can't see their files without downloading.

| Change | File(s) | Detail |
|--------|---------|--------|
| New preview modal component | New `src/components/FilePreviewModal.tsx` | Modal with: filename header, preview content area (image/PDF/text/video/audio/fallback), download button, close button. Uses `downloadUrl` directly. |
| Add "preview" modal type | `src/zustand/useModalStore.ts` | Add `"preview"` to `ModalType` union. Modal data includes `fileId`, `filename`, `downloadUrl`, `type`, `size`, `summary`. |
| Register in modal provider | `src/components/providers/ModalProvider.tsx` | Lazy-load `FilePreviewModal` |
| Filename click opens preview | `src/components/table/cells/FilenameCell.tsx` | Change click handler: open preview modal instead of just selecting the file. Folders still navigate. |
| Card click opens preview | `src/components/grid/Card.tsx` | Click on card body opens preview. Folder cards still navigate. |
| Preview type detection utility | New `src/utils/filePreview.ts` | `getPreviewType(mimeType, filename)` → `"image" \| "pdf" \| "text" \| "video" \| "audio" \| "unsupported"`. Map of extensions/MIME types to preview type. |
| Text content fetcher | `src/lib/storage.ts` | Add `fetchFileAsText(url)` for text/code preview (fetch + text decode) |

**Firestore changes:** None
**Dependencies:** None

---

## Batch 3: File Sharing via Links
**Spec items:** 1.1
**Why third:** Second biggest gap. Required to compete.

| Change | File(s) | Detail |
|--------|---------|--------|
| Share token generation | `src/services/fileService.ts` | New methods: `createShareLink(userId, fileId)` generates crypto token, writes to file doc + `shares` collection. `disableShareLink(userId, fileId)` clears token + deletes share doc. |
| Share popover component | New `src/components/SharePopover.tsx` | Popover with: "Create link" button (if no link), or display URL + "Copy link" button + "Disable link" button. Shows share status. |
| Share button in file actions | `src/components/table/rows/FileRow.tsx`, `src/components/grid/Card.tsx` | Add Share icon button in action area. Opens `SharePopover`. |
| Public share page | New `src/app/share/[token]/page.tsx` | Server component. Looks up `shares/{token}` → gets `userId` + `fileId` → fetches file doc. Renders: filename, file type icon, size, date, summary (if exists), Download button. Styled with landing-page aesthetic. No auth required. |
| Share lookup server action | New `src/actions/shareActions.ts` | `getSharedFile(token)` — looks up share doc, fetches file data, returns public-safe fields. Uses Admin SDK (no auth needed). |
| FileType schema update | `src/types/filetype.ts` | Add `shareToken`, `shareEnabled`, `shareCreatedAt` to `FileType` |
| Firestore mapping | `src/utils/mapFirestoreDoc.ts` | Map new share fields |

**Firestore changes:**
- File document: add `shareToken (string | null)`, `shareEnabled (boolean)`, `shareCreatedAt (Timestamp | null)`
- New top-level collection: `shares/{shareToken}` → `{ userId, fileId, createdAt }`

**Dependencies:** None

---

## Batch 4: Dashboard Overhaul
**Spec items:** 1.5 (breadcrumbs) + 2.3 (layout) + 1.3 (search) + 2.1 (sort) + 1.4 (storage)
**Why fourth:** These all touch the dashboard toolbar area. Doing them together avoids repeated refactoring of the same layout.

| Change | File(s) | Detail |
|--------|---------|--------|
| Compact dropzone | `src/components/Dropzone.tsx` | Refactor: remove the permanent drop area. Keep global drag-over detection that shows a full-page overlay. Export an `UploadButton` component (icon + "Upload" text) for the toolbar. |
| Breadcrumb component | New `src/components/Breadcrumbs.tsx` | Renders clickable path: Home > Folder A > Subfolder B. Uses `allFiles` to walk the folder chain. |
| Breadcrumb logic | `src/hooks/useFolderNavigation.ts` | New `buildBreadcrumbs(folderId, allFiles)` function returning array of `{id, name}` objects. |
| Full-text search | `src/hooks/useFilesList.ts` | Expand filter: match `filename` OR `summary` (case-insensitive). Return `matchField` per file for UI indicator. |
| Search UI upgrade | `src/components/table/TableWrapper.tsx` | Search input with search icon, clear button. Show "matched in summary" badge on results when filename didn't match. |
| Sort options | `src/hooks/useFilesList.ts` | New sort logic: sort by `name`, `size`, `type`, `timestamp`. Folders always first. |
| Sort dropdown UI | `src/components/table/TableWrapper.tsx` | Dropdown with sort field + direction. Replace current asc/desc toggle. |
| Storage usage component | New `src/components/StorageUsageBar.tsx` | Compact bar: "X files · Y MB used". Computed from file data. |
| Unified toolbar layout | `src/components/table/TableWrapper.tsx` | Single toolbar row: breadcrumbs (left) | search (center) | sort + view toggle + upload + new folder (right). Storage bar below toolbar. |
| Dashboard page simplification | `src/app/dashboard/page.tsx` | Remove standalone `Dropzone` component. Toolbar handles upload button + drag overlay. |

**Firestore changes:** None (all data already available)
**Dependencies:** None (but should come after Batch 1 bug fixes)

---

## Batch 5: AI Pipeline Enhancement
**Spec items:** 2.4 (auto-parse) + 3.1 (AI status badges)
**Why fifth:** Makes the AI features visible and automatic. Core differentiator.

| Change | File(s) | Detail |
|--------|---------|--------|
| AI status badge component | New `src/components/common/AIStatusBadge.tsx` | Renders badge based on file state: Uploaded (gray) → Parsed (blue) → Summarized (green) → Q&A Ready (purple). Uses `isParsed`, `summary`, `isUploadedToRagie` fields. |
| Badge in table | `src/components/table/columns.tsx` | New "AI" column showing `AIStatusBadge` |
| Badge in grid | `src/components/grid/Card.tsx` | Show `AIStatusBadge` on card |
| Parse status field | `src/services/fileService.ts` | Add `parseStatus` field to file creation. New `updateParseStatus(userId, fileId, status)` method. |
| Auto-parse after upload | `src/components/Dropzone.tsx` | After successful upload + Firestore doc creation, check if user has credits or API key. If yes, trigger `parseFile()` automatically. Update parse status throughout. |
| Parse status indicator | Table row + grid card | Show spinner/status text while `parseStatus === "parsing"` |
| Auto-parse profile toggle | `src/components/ProfileComponent.tsx` | Add "Auto-parse uploads" toggle. Saves `autoParseEnabled` to profile. |
| Profile schema update | `src/zustand/useProfileStore.ts` | Add `autoParseEnabled` to `ProfileType` |
| FileType schema update | `src/types/filetype.ts` | Add `parseStatus` field |
| "Make Smart" action | File action menus (table + grid) | New action that runs full pipeline: parse → summarize → upload to Ragie. Shows progress. |

**Firestore changes:**
- File document: add `parseStatus ("pending" | "parsing" | "parsed" | "failed" | null)`
- Profile document: add `autoParseEnabled (boolean, default: true)`

**Dependencies:** None (but benefits from Batch 4 toolbar layout being in place)

---

## Batch 6: Functional Tags
**Spec items:** 2.2
**Why sixth:** Competitive advantage over Dropbox's weak tagging.

| Change | File(s) | Detail |
|--------|---------|--------|
| Tag pills in table | `src/components/table/columns.tsx` | Render tags as small colored pills in a "Tags" column (or inline with filename). Clickable to filter. |
| Tag pills in grid | `src/components/grid/Card.tsx` | Render tags as pills below filename. Clickable to filter. |
| Tag filtering | `src/hooks/useFilesList.ts` | Accept `activeTags: string[]` parameter. Filter files to those containing ALL active tags. |
| Tag filter bar | New `src/components/TagFilterBar.tsx` | Shows active tag filters as removable pills. Appears below toolbar when tags are active. |
| Tags in search | `src/hooks/useFilesList.ts` | Include `tags` array in search matching. |
| Quick-add tag action | File action menus | "Add tag" option opens a small input popover (not the full rename modal). Calls `fileService.addTag()`. |
| Add tag service method | `src/services/fileService.ts` | `addTag(userId, fileId, tag)` — appends to tags array. `removeTag(userId, fileId, tag)` — removes from array. |
| Tag state in toolbar | `src/components/table/TableWrapper.tsx` | Manage `activeTags` state. Pass to `useFilesList` and render `TagFilterBar`. |

**Firestore changes:** None (tags field already exists on file documents)
**Dependencies:** Batch 4 (toolbar layout provides the tag filter area)

---

## Batch 7: Bulk Operations
**Spec items:** 1.6
**Why seventh:** Power user feature. Builds on the stable file list from earlier batches.

| Change | File(s) | Detail |
|--------|---------|--------|
| Repurpose selection store | `src/zustand/useFileSelectionStore.ts` | New shape: `selectedFileIds: Set<string>`, `toggleFile(id)`, `selectAll(ids)`, `clearSelection()`, `isSelected(id)` |
| Checkbox column in table | `src/components/table/columns.tsx`, `DataTable.tsx` | First column: checkbox. Header: select-all checkbox. |
| Checkbox overlay in grid | `src/components/grid/Card.tsx`, `GridView.tsx` | Checkbox in top-left corner of each card, visible on hover or when any file is selected. |
| Bulk action bar | New `src/components/BulkActionBar.tsx` | Appears when `selectedFileIds.size > 0`. Shows count + Delete / Move / Download buttons. |
| Bulk delete | `src/services/fileService.ts` | `bulkSoftDelete(userId, fileIds)` — batch Firestore write to set `deletedAt` on multiple files. |
| Bulk move | `src/services/fileService.ts` | `bulkMoveToFolder(userId, fileIds, folderId)` — batch write to update `folderId`. |
| Bulk download | `BulkActionBar.tsx` | Trigger individual downloads for each selected file (create hidden `<a>` tags and click them). |
| Folder picker for move | New `src/components/FolderPickerModal.tsx` | Simple modal listing available folders. Select one → confirm → bulk move. |
| Keyboard shortcut | `TableWrapper.tsx` | Escape clears selection. |

**Firestore changes:** None
**Dependencies:** Batch 4 (toolbar layout in place)

---

## Batch 8: AI Experience Polish
**Spec items:** 2.5 (inline summaries) + 3.3 (credit transparency)
**Why eighth:** Polishes the AI experience and builds trust with credit transparency.

| Change | File(s) | Detail |
|--------|---------|--------|
| Summary in preview modal | `src/components/FilePreviewModal.tsx` | Collapsible "AI Summary" panel below the preview. "Generate summary" button if none exists. |
| Expandable summary in table | `src/components/table/DataTable.tsx`, `columns.tsx` | Expand chevron on rows that have a summary. Expanding shows summary text below the row. |
| Summary tooltip in grid | `src/components/grid/Card.tsx` | Hover tooltip showing first ~100 chars of summary on cards that have one. |
| Credit balance in header | `src/components/Header.tsx` | Small badge next to user avatar showing credit count. Links to profile. |
| Credit confirmation before AI actions | New `src/components/CreditConfirmation.tsx` | Inline confirmation: "This will use X credits. You have Y remaining." Confirm/Cancel. Used before parse, summarize, Q&A. |
| Credit confirmation integration | `ShowParsedDataModal.tsx`, `chat/index.tsx`, `Dropzone.tsx` (auto-parse) | Wrap AI actions with credit confirmation (skip if using own API keys). |
| Low credit warning | `src/zustand/useProfileStore.ts` | After credit deduction, if credits < 50, show toast warning. |
| Credit history on profile | `src/components/ProfileComponent.tsx` | Table showing recent credit transactions. |
| Credit history logging | `src/utils/useApiAndCreditKeys.ts` | After credit deduction, write to `creditHistory` subcollection. |

**Firestore changes:**
- New subcollection: `users/{userId}/creditHistory/{id}` → `{ action, fileName, cost, balance, timestamp }`

**Dependencies:** Batch 2 (file preview modal), Batch 5 (auto-parse triggers credit flow)

---

## Batch 9: Semantic Search
**Spec items:** 3.2
**Why last:** Advanced differentiator. Depends on having the core experience polished.

| Change | File(s) | Detail |
|--------|---------|--------|
| Search mode toggle | `src/components/table/TableWrapper.tsx` | Toggle between "Search files" and "Ask your files" modes in the search bar. |
| Cross-document retrieval action | New `src/actions/searchActions.ts` | `searchAllDocuments(query, ragieApiKey?)` — calls Ragie retrieval without a specific file filter. Returns chunks with file IDs. |
| Semantic search results component | New `src/components/SemanticSearchResults.tsx` | Displays results: file name + relevance score + content snippet for each matching chunk. Click opens the file's Q&A modal. |
| Ragie cross-doc support | `src/actions/ragieActions.ts` | Modify `retrieveChunks` to optionally omit the file filter (search across all user documents). |
| Search results display | `src/components/table/TableWrapper.tsx` | When in "Ask" mode and results return, show `SemanticSearchResults` instead of the normal file list. |

**Firestore changes:** None
**Dependencies:** Batch 4 (search UI), Batch 5 (files need to be Q&A Ready for semantic search)

---

## Summary

| Batch | Spec Items | Category | Est. Complexity |
|-------|-----------|----------|----------------|
| 1. Bug Fixes | 2.6 | Fix | Small |
| 2. File Preview | 1.2 | Table Stakes | Medium |
| 3. File Sharing | 1.1 | Table Stakes | Medium |
| 4. Dashboard Overhaul | 1.5, 2.3, 1.3, 2.1, 1.4 | Table Stakes + Improvement | Large |
| 5. AI Pipeline | 2.4, 3.1 | Improvement + Differentiator | Medium |
| 6. Tags System | 2.2 | Improvement | Medium |
| 7. Bulk Operations | 1.6 | Table Stakes | Medium |
| 8. AI Polish | 2.5, 3.3 | Improvement + Differentiator | Medium |
| 9. Semantic Search | 3.2 | Differentiator | Medium |

**Total: 9 batches covering all 15 spec items.**

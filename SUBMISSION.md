# Submission Details

## Deliverables Included
- [x] Source Code (Next.js app in `/src`)
- [x] `README.md` (Setup and run instructions)
- [x] `ARCHITECTURE.md` (Architecture and tradeoffs note)
- [x] `AI_WORKFLOW.md` (AI-Native workflow note)
- [x] `SUBMISSION.md` (This file)

## Links
**Live Product URL:**
*(Insert your Vercel/Render deployment link here)*

**Walkthrough Video:**
*(Insert your unlisted YouTube or Loom link here)*

## Project Status

**What is working:**
- Full user login flow using seeded mock accounts.
- Dashboard with separation of Owned vs Shared documents.
- Rich-text document editing with auto-save and manual save.
- Text file upload workflow (converts `.txt` and `.docx` to new editable documents).
- Document sharing via email with backend access control checks.
- Document deletion for owners.

**What is incomplete / Out of scope:**
- Real-time multiplayer collaborative editing (requires WebSockets/CRDTs).
- Full user authentication (OAuth/JWT) with password management.
- Complex nested file parsing (e.g. embedded images in PDFs).

**What I would build next with 2-4 hours:**
- Switch the editor persistence from raw HTML to Tiptap's structured JSON format to allow for more complex block types (like image attachments or embedded tables).
- Implement a debounce wrapper for the auto-save feature to make the network requests more efficient while typing continuously.
- Add a proper database migration script and replace the mock auth with NextAuth + GitHub OAuth.

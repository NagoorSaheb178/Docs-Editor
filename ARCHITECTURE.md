# Architecture & Tradeoffs

## Core Priorities
Given the 4-6 hour timebox and the goal of demonstrating a coherent product slice, the primary engineering priorities were:
1. **Frictionless UI/UX:** Providing a clean, snappy, and intuitive editor experience inspired by Google Docs, relying heavily on Tailwind CSS for layout.
2. **Robust Text Editing:** Using **Tiptap** over a raw `contenteditable` `div`. Tiptap provides a headless, heavily tested rich-text engine that guarantees structured HTML output, which is crucial for saving and rendering documents consistently.
3. **Speed of Delivery:** Leveraging **Next.js App Router** for full-stack API routes and server-side rendering, avoiding the overhead of setting up a separate Express backend.

## Key Tradeoffs & Scope Cuts

### 1. Mock Authentication
**Decision:** Used a lightweight simulated login (`localStorage` mock tokens mapped to seeded DB users) instead of a robust auth provider like NextAuth, Clerk, or JWTs.
**Why:** Implementing secure sessions, OAuth, and password hashing would consume disproportionate time. The mock auth perfectly demonstrates the core product requirement: the ability to distinguish between an "owner" and a "shared user" to enforce access control.

### 2. Manual/Debounced Saving vs. Real-Time Collaboration (CRDTs)
**Decision:** Documents are saved via a debounced REST API `PUT` request rather than WebSockets or WebRTC (e.g., Yjs/Hocuspocus).
**Why:** True real-time multi-player editing requires complex conflict resolution and infrastructure. A standard REST persistence layer fulfills the "save and reopen" requirement while keeping the system testable and reliable.

### 3. File Upload parsing
**Decision:** File uploads support `.txt` and `.docx` files. `.txt` is parsed line-by-line, and `.docx` is processed into HTML using the `mammoth` library.
**Why:** While `.txt` is simple to parse, supporting `.docx` demonstrates the ability to integrate external data streams robustly. The imported HTML maps perfectly onto the Tiptap rich-text structure.

### 4. Database Selection
**Decision:** MongoDB via Mongoose.
**Why:** Document editors generate unstructured or semi-structured HTML data. A NoSQL document store is a natural fit for this data shape, allowing flexible schema updates if we wanted to add block-based JSON storage later (like Tiptap's JSON format) without running painful SQL migrations.

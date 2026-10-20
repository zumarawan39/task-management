# DevFlow — Daily Task Management for Developers

DevFlow is a personal, day-based task board for engineers. Every day gets its own Kanban board; you plan with a fast quick-add bar, track time on tasks, carry unfinished work forward, write an end-of-day review, and get a ready-to-paste standup — with stats to show how your days actually went.

Built with **Next.js 16 (App Router)**, **React 19**, **MongoDB / Mongoose**, **NextAuth v5**, **TanStack Query**, **Tailwind CSS v4**, **dnd-kit**, **Tiptap** and **Recharts**. Installable as a PWA.

---

## Table of contents

- [Features](#features)
  - [Authentication](#1-authentication)
  - [Daily board (Today / Day view)](#2-daily-board-today--day-view)
  - [Quick add syntax](#3-quick-add-syntax)
  - [Task details](#4-task-details)
  - [Time tracking](#5-time-tracking)
  - [Recurring tasks](#6-recurring-tasks)
  - [Carry over unfinished tasks](#7-carry-over-unfinished-tasks)
  - [Filters](#8-filters)
  - [Daily review & standup](#9-daily-review--standup)
  - [Markdown export](#10-markdown-export)
  - [Notes (project discussions)](#11-notes-project-discussions)
  - [Stats](#12-stats)
  - [Search & command palette](#13-search--command-palette)
  - [Settings](#14-settings)
  - [PWA](#15-pwa)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [API reference](#api-reference)

---

## Features

### 1. Authentication
- **Email + password** sign up and sign in (`/login`). Passwords are hashed with bcrypt; minimum 8 characters.
- **GitHub OAuth** ("Continue with GitHub") — shown only when `GITHUB_ID` and `GITHUB_SECRET` are set. A GitHub login is linked to an existing account with the same email, or creates a new one.
- JWT sessions via NextAuth v5.
- Route protection in [src/proxy.ts](src/proxy.ts): signed-out users are redirected to `/login`; signed-in users visiting `/login` go to `/today`. Every API route checks the session and only returns the current user's data.

### 2. Daily board (Today / Day view)
- `/today` shows today's board; `/day/YYYY-MM-DD` shows any other day.
- Move between days with the date navigator or the **← / →** arrow keys (when no task is selected).
- **Keyboard navigation**: **↑ / ↓** select a card within a column, **← / →** move the selection across columns; **E** / **Enter** opens it, **D** marks it done, **Esc** clears the selection.
- Four columns: **To do**, **In progress**, **Blocked**, **Done**.
- **Drag and drop** tasks within and across columns (dnd-kit). Order is stored with fractional indexing, so a move only updates the moved task.
- Moving a task to **Done** stamps `completedAt`; moving it out clears it.
- Each card shows priority, project (with color), tags, estimate vs. tracked time, subtask progress and a timer button.

### 3. Quick add syntax
Type a task in the quick-add bar and use inline tokens — they are parsed out of the title ([src/lib/quickAddParser.ts](src/lib/quickAddParser.ts)):

| Token | Meaning | Examples |
|---|---|---|
| `!priority` | Priority | `!low` `!medium` `!high` `!urgent` or `!l` `!m` `!h` `!u` |
| `#tag` | Tag (multiple allowed, lowercased, max 12) | `#bug #backend` |
| `@project` | Project — matched by name, **created automatically** if it doesn't exist | `@platform` |
| `~time` | Time estimate | `~30m` `~2h` `~1h30m` |

Example:

```
Fix login redirect !h #auth #bug @platform ~45m
```
→ title "Fix login redirect", priority high, tags `auth`, `bug`, project Platform, estimate 45 min.

- **Enter** creates the task; **Shift + Enter** creates it and opens it in the drawer.
- While typing a token, a suggestions menu appears — **↑ / ↓** to pick, **Tab** / **Enter** to accept.
- **Esc** clears the input.

### 4. Task details
Open a task (click it, or select it and press **E**) to edit it in a side drawer:
- Title, status, priority, date, project, tags and time estimate
- **Rich-text notes** (Tiptap editor), sanitized on the server
- **Subtasks** checklist (up to 50) with progress
- **Links** — labelled URLs shown as chips (e.g. PR, ticket, docs; up to 20)
- Recurrence settings
- Delete

### 5. Time tracking
- Start/stop a **timer** on any task. Only one timer runs at a time — starting a new one stops the previous one.
- Every start/stop is saved as a time log; the task's total tracked minutes are kept up to date.
- The **active timer** is shown in the app header so you can stop it from any page.
- Tracked time is compared against the estimate on cards and in Stats.

### 6. Recurring tasks
- Mark a task as recurring with one of three rules: **daily**, **weekdays** (Mon–Fri), or **weekly** (same weekday).
- When you open a future day that matches the rule, a fresh copy is created automatically (status To do, subtasks reset, no time logged). A unique index prevents duplicate copies for the same day.

### 7. Carry over unfinished tasks
- When the previous day has unfinished tasks, a **carry-over banner** offers to move them to the current day.
- Every non-done task moves, keeping its status column, and is marked with `carriedOverFrom` so you can see it slipped.

### 8. Filters
Filter the board by **priority**, **project** and **tag**.

### 9. Daily review & standup
`/review` (or `/review/YYYY-MM-DD`) is the end-of-day reflection:
- **What went well**, **Blockers**, **What I learned**
- **Mood** on a 1–5 scale (press **1**–**5** to pick)
- Day stats saved with the review: tasks planned, completed and minutes tracked
- **Auto-generated standup** in the classic format, ready to copy:
  ```
  Yesterday:
  - <tasks done>

  Today:
  - <next day's open tasks>

  Blockers:
  - <blocked tasks + your blocker notes>
  ```
- **Review reminder**: after the hour set in Settings (default 18:00), a banner reminds you to review the day if you haven't yet.

### 10. Markdown export
From the review page, **Export markdown** downloads the day's tasks and review as a `.md` file (`GET /api/export?date=YYYY-MM-DD`).

### 11. Notes (project discussions)
`/notes` holds meeting/discussion notes grouped by project:
- Pick a project, then create a "tile" with a title and date (e.g. kickoff, API review).
- Write notes for each tile — decisions, owners, next steps. Edit or delete them later.

### 12. Stats
`/stats` shows how your days went, for the last **7** or **30** days:
- Planned vs. completed tasks per day and total minutes tracked
- Daily completion rate
- Time breakdown **by project** and **by tag**
- **Review streak** — consecutive days with a written review
- **Estimate vs. actual** for the tasks with the most tracked time

### 13. Search & command palette
- `/search` — full search across task titles, notes and tags (press **/** to focus).
- **Ctrl/⌘ + K** (or **/** on the board) opens the command palette to jump to any task or page.
- In the palette, **Ctrl/⌘ + Enter** starts the timer on the highlighted task.

### 14. Settings
`/settings`:
- **Theme** — light / dark / system
- **Review reminder hour**
- **Visible columns** — hide board columns you don't use (hidden columns keep their tasks)
- **Projects** — add projects with a color, archive or restore them (archived projects keep their history)
- **Keyboard** — a reference of all shortcuts

Theme, reminder hour and visible columns are stored in your browser; projects are saved to your account.

### 15. PWA
Ships a web manifest, app icons and a service worker, so DevFlow can be installed as an app on desktop and mobile. On small screens the sidebar becomes a bottom navigation bar.

---

## Keyboard shortcuts

| Key | Where | Action |
|---|---|---|
| `Ctrl/⌘ + K` | Anywhere | Open command palette |
| `/` | Board | Open command palette |
| `/` | Search page | Focus the search box |
| `N` | Board | Focus quick add |
| `↑` / `↓` | Board | Select a task within a column |
| `←` / `→` | Board (task selected) | Move the selection to the next column |
| `←` / `→` | Board (nothing selected) | Previous / next day |
| `E` / `Enter` | Board | Open the selected task |
| `D` | Board | Mark the selected task done |
| `Esc` | Board | Close the task drawer / clear the selection |
| `Shift + Enter` | Quick add | Create the task and open it |
| `Ctrl/⌘ + Enter` | Command palette | Start the timer on the highlighted task |
| `1`–`5` | Review | Pick a mood |

Single-key shortcuts are ignored while you are typing in an input.

---

## Getting started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env.local
#    then fill in AUTH_SECRET (e.g. `npx auth secret` or `openssl rand -base64 32`)

# 3. (Optional) seed demo data
npm run seed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:9090](http://localhost:9090).

**Demo account** (after `npm run seed`):
- Email: `engineer@devflow.local`
- Password: `devflow`

> ⚠️ The seed script deletes and recreates all tasks, projects and reviews for the demo user.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/devflow` |
| `AUTH_SECRET` | Yes | Secret used to sign session tokens (`NEXTAUTH_SECRET` is accepted as a fallback) |
| `AUTH_URL` | Yes | App URL, e.g. `http://localhost:9090` (`NEXTAUTH_URL` also supported) |
| `GITHUB_ID` | No | GitHub OAuth app client ID — enables GitHub login |
| `GITHUB_SECRET` | No | GitHub OAuth app client secret |

For GitHub login, set the OAuth app callback URL to `http://localhost:9090/api/auth/callback/github`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server on port 9090 |
| `npm run build` | Production build |
| `npm start` | Run the production build on port 9090 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm test` | Unit tests (quick-add parser, fractional index, recurrence, stats, duration) |
| `npm run seed` | Seed a demo user with projects, tasks and reviews |

---

## Project structure

```
src/
├── app/
│   ├── (app)/            # Signed-in pages: today, day/[date], review, notes, stats, search, settings
│   ├── api/              # REST API route handlers
│   ├── login/            # Sign in / sign up page
│   ├── manifest.ts       # PWA manifest
│   └── icon.tsx          # App icon
├── components/
│   ├── board/            # Board, Column, TaskCard, QuickAdd, Filters, CarryOverBanner
│   ├── task/             # TaskDrawer, NotesEditor, Subtasks
│   ├── layout/           # Shell, Topbar, CommandPalette, ActiveTimer, ReminderBanner
│   ├── review/ notes/ stats/ search/ settings/
│   ├── providers.tsx     # Session, theme and TanStack Query providers
│   └── ui/               # Button, Input, Sheet, Modal, Menu, Tooltip, Badges, Icon primitives
├── hooks/                # useTasks, useTimer, useToday (+ local settings)
├── lib/                  # Services (task, review, discussion), auth, db, validators, parsers, utils
├── models/               # Mongoose models: User, Task, Project, DailyReview, Discussion
└── proxy.ts              # Auth redirect middleware
scripts/
├── seed.ts               # Demo data
└── icons.mjs             # PWA icon generator
```

---

## Data model

| Model | Key fields |
|---|---|
| **User** | `email`, `name`, `passwordHash?`, `githubId?` |
| **Task** | `title`, `notes`, `status` (todo / in_progress / blocked / done), `priority` (low / medium / high / urgent), `date` (YYYY-MM-DD), `order`, `tags[]`, `project`, `estimateMinutes`, `timeLogs[]`, `totalMinutes`, `subtasks[]`, `links[]`, `carriedOverFrom`, `recurring {enabled, rule}`, `recurrenceOf`, `completedAt` |
| **Project** | `name`, `color`, `archived` |
| **DailyReview** | `date`, `wentWell`, `blockers`, `learned`, `mood` (1–5), `standupText`, `stats {planned, completed, minutesTracked}` — one per user per day |
| **Discussion** | `project`, `title`, `date`, `notes` |

All documents are scoped by `userId`.

---

## API reference

All endpoints require a signed-in session (except auth) and return JSON. Dates use `YYYY-MM-DD`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account (`name`, `email`, `password`) |
| * | `/api/auth/[...nextauth]` | NextAuth sign in / out / callbacks |
| GET | `/api/tasks?date=` | Tasks for a day, grouped by status (also creates due recurring copies) |
| POST | `/api/tasks` | Create a task (supports `projectQuery` to find-or-create a project) |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| PATCH | `/api/tasks/reorder` | Save new status/order for dragged tasks |
| POST | `/api/tasks/carry-over` | Move unfinished tasks `{ from, to }` |
| GET | `/api/tasks/search?q=` | Search titles, notes and tags |
| POST | `/api/tasks/:id/timer/start` | Start a timer (stops any other running timer) |
| POST | `/api/tasks/:id/timer/stop` | Stop the timer |
| GET | `/api/timer` | Currently running timer, if any |
| GET / POST | `/api/projects` | List / create projects |
| PATCH | `/api/projects/:id` | Rename, recolor or archive a project |
| GET | `/api/tags` | All tags you have used |
| GET / PUT | `/api/reviews/:date` | Get / save the daily review |
| GET | `/api/stats?from=&to=` | Stats for a date range |
| GET | `/api/export?date=` | Day export as Markdown |
| GET / POST | `/api/notes?project=` | List a project's discussion notes / create one |
| PATCH / DELETE | `/api/notes/:id` | Update / delete a discussion note |

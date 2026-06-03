# Getting Started

**Type:** Tutorial — Set up the development environment and run the project locally for the first time.

> **Current state:** The project uses an in-memory mock data layer, so MySQL is NOT required to start developing. The MySQL instructions below are for when you build the real backend.

---

## Overview

This guide walks you from a blank computer to a running instance of the Stock Management System. It covers cloning the repository (if available), installing dependencies, and running the development server.

**Time to complete (mock data):** 5 minutes.
**Time to complete (with MySQL):** 30–45 minutes (excluding MySQL installation).

---

## Prerequisites

Ensure these are installed before starting:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18.x or 20.x | <https://nodejs.org/en/download/> |
| npm | ships with Node.js | no separate install |
| MySQL | 8.0+ (only if building the backend) | <https://dev.mysql.com/downloads/mysql/> or use XAMPP/WAMP/MAMP |
| Git | latest | <https://git-scm.com/downloads/> |
| VS Code | latest | <https://code.visualstudio.com/> (recommended) |

Verify your installs:

```bash
node --version   # should show v18.x or v20.x
npm --version    # should show 9.x or 10.x
git --version    # any recent version
```

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd stock-mgt
```

If the repository has not been shared yet, start from a blank project instead — see the **Blank-project Quick Start** section below.

Replace `<repository-url>` with the URL your team provides (GitHub, GitLab, etc.).

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json`. The first install may take 1–2 minutes.

---

## Step 3: Run the App (With Mock Data)

No database setup is needed. Just run:

```bash
npm run dev
```

Open `http://localhost:3000` and log in with:

| Field   | Value           |
|---------|-----------------|
| Email   | admin@example.com |
| Password | password       |

---

## Step 3b (Optional): Configure a Real Database

Skip this section if you are only working on the frontend. Follow these steps when you are ready to build the backend.

### 3b.i. Start MySQL

Make sure the MySQL server is running. Common ways to check:

```bash
# Windows (if installed as a service)
net start MySQL80

# macOS (if installed via Homebrew)
brew services start mysql

# Linux
sudo systemctl start mysql
```

Log in with your root account (or an account with CREATE DATABASE privilege):

```bash
mysql -u root -p
```

You will be prompted for the root password.

### 3b.ii. Create the Database

```sql
CREATE DATABASE stock_mgt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Confirm it was created:

```sql
SHOW DATABASES;
```

You should see `stock_mgt` in the output.

### 3b.iii. Import the Schema

Run the SQL statements from `docs/reference/database-schema.md` — see that file for all CREATE TABLE statements.

### 3b.iv. Generate the Default User Password

```bash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('password', 10));"
```

Use the printed hash in your INSERT statement for the `admin` user.

---

## Step 4 (Optional): Configure Environment Variables for Database

Only needed when you are connecting to a real MySQL database. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local        # macOS/Linux/Git Bash
# OR on Windows PowerShell:
Copy-Item .env.example .env.local
```

Edit `.env.local` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=stock_mgt
JWT_SECRET=change-me-to-a-long-random-string-in-production
```

---

## Step 5: Install VS Code Extensions (Recommended)

The following extensions make development easier:

| Extension | Purpose |
|-----------|---------|
| ESLint | Catches code errors as you type |
| Tailwind CSS IntelliSense | Autocompletes Tailwind class names |
| MySQL | Run queries directly from VS Code |

Search for them in the VS Code Extensions panel (Ctrl+Shift+X).

---

## Blank-Project Quick Start

If you are starting from an empty Next.js project instead of cloning the repo, follow these extra steps:

```bash
# 1. Create Next.js project with Tailwind
npx create-next-app@latest stock-mgt --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd stock-mgt

# 2. Install frontend dependencies
npm install lucide-react sonner zod

# 3. (Optional — for backend only)
npm install bcryptjs jsonwebtoken mysql2
npm install -D @types/bcryptjs @types/jsonwebtoken
```

Then copy the source files from the Implementation Guide and continue with **Step 3** above.

---

## Project Structure After Setup

```
stock-mgt/
├── next.config.ts          ← Next.js config
├── package.json
├── src/
│   ├── app/
│   │   ├── login/page.tsx  ← login form
│   │   └── layout.tsx      ← root layout with Toaster
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   └── ConfirmModal.tsx
│   ├── lib/
│   │   ├── types.ts        ← TypeScript interfaces
│   │   ├── schemas.ts      ← Zod validation
│   │   ├── api.ts          ← mock API wrappers
│   │   ├── stock-utils.ts  ← date math, editability
│   │   └── stock-nav.ts    ← sidebar helpers
│   └── data/
│       ├── defaultProducts.ts
│       └── mock-data.ts    ← in-memory mock backend
└── docs/                   ← documentation
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| Port 3000 already in use | Another process is using port 3000 | Run `npm run dev -- -p 3001` |
| `Module not found: ...` | Dependencies not installed | Run `npm install` again |
| Login fails | Wrong email/password | Use `admin@example.com` / `password` |

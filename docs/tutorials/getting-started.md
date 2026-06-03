# Getting Started

**Type:** Tutorial — Set up the development environment and run the project locally for the first time.

---

## Overview

This guide walks you from a blank computer to a running instance of the Stock Management System. It covers cloning the repository (if available), installing dependencies, setting up MySQL, and running the development server.

**Time to complete:** 30–45 minutes (excluding MySQL installation).

---

## Prerequisites

Ensure these are installed before starting:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18.x or 20.x | <https://nodejs.org/en/download/> |
| npm | ships with Node.js | no separate install |
| MySQL | 8.0+ | <https://dev.mysql.com/downloads/mysql/> or use XAMPP/WAMP/MAMP |
| Git | latest | <https://git-scm.com/downloads/> |
| VS Code | latest | <https://code.visualstudio.com/> (recommended) |

Verify your installs:

```bash
node --version   # should show v18.x or v20.x
npm --version    # should show 9.x or 10.x
mysql --version  # should show 8.0.x
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

## Step 3: Configure the Database

### 3a. Start MySQL

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

### 3b. Create the Database

```sql
CREATE DATABASE stock_mgt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Confirm it was created:

```sql
SHOW DATABASES;
```

You should see `stock_mgt` in the output.

### 3c. Import the Schema and Seed Data

Run the SQL migration files from the project root:

```bash
mysql -u root -p stock_mgt < src/lib/migrations/01-create-tables.sql
mysql -u root -p stock_mgt < src/lib/migrations/02-seed-data.sql
```

If migration files don't exist yet, run the SQL statements manually — see the Reference → Database Schema section for all CREATE TABLE statements in one place.

### 3d. Generate the Default User Password

The seed SQL uses a bcrypt hash for the default password. To (re)generate it:

```bash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('password', 10));"
```

Copy the printed hash and replace it in your seed SQL INSERT statement for the `admin` user.

---

## Step 4: Configure Environment Variables

Copy `.env.example` to `.env.local` in the project root:

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

**Important notes:**
- `.env.local` is in `.gitignore`. Never commit it to version control.
- `JWT_SECRET` is used to sign authentication tokens. Use a long, random string in production.

---

## Step 5: Run the Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:3000`.

You should see the login page. Log in with:

| Field   | Value           |
|---------|-----------------|
| Email   | admin@example.com |
| Password | password       |

If you see the login page and can log in, everything is working.

---

## Step 6: Install VS Code Extensions (Recommended)

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

# 2. Install dependencies
npm install bcryptjs jsonwebtoken mysql2 lucide-react sonner zod
npm install -D @types/bcryptjs @types/jsonwebtoken
```

Then continue with **Step 3** (database setup) and **Step 4** (environment) above, and copy the source files from the Implementation Guide.

---

## Project Structure After Setup

```
stock-mgt/
├── .env.local              ← your local credentials (git-ignored)
├── .env.example            ← committed template
├── middleware.ts           ← route protection
├── next.config.ts          ← Next.js config
├── package.json
├── src/
│   ├── app/
│   │   ├── api/            ← backend API routes
│   │   ├── login/page.tsx  ← login form
│   │   └── layout.tsx      ← root layout with Toaster
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   └── ConfirmModal.tsx
│   ├── lib/
│   │   ├── db.ts           ← MySQL connection
│   │   ├── types.ts        ← TypeScript interfaces
│   │   └── api.ts          ← frontend API helpers
│   └── data/
│       └── defaultProducts.ts
└── package-lock.json
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Module not found: mysql2` | Dependencies not installed | Run `npm install` again |
| `ECONNREFUSED` | MySQL not running | Start the MySQL service |
| `ER_ACCESS_DENIED_ERROR` | Wrong DB_USER or DB_PASSWORD in `.env.local` | Correct the credentials |
| `ER_BAD_DB_ERROR` | Database does not exist | Run `CREATE DATABASE stock_mgt;` |
| Port 3000 already in use | Another process is using port 3000 | Run `npm run dev -- -p 3001` |

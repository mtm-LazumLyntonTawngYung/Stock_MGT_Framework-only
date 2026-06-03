# Stock Management System

A Next.js-based stock management application for tracking monthly inventory, purchases, and weekly usage across hierarchical categories.

## Features

- **Stock Management**: Track monthly stock quantities with 1st, 2nd, and 3rd purchase entries
- **Weekly Stock Checks**: Monitor weekly usage across up to 5 weeks per month
- **Category Hierarchy**: Organize items with parent-child category relationships
- **Purchase Tracking**: Record purchase transactions with pricing details
- **User Management**: Admin panel for managing user accounts
- **Authentication**: JWT-based secure login with HTTP-only cookies
- **Read-only Mode**: Previous months are protected from editing (only latest 2 months editable)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, Tailwind CSS, Lucide Icons |
| Backend | Next.js 16 (App Router) |
| Database | MySQL 8.0 |
| Authentication | JWT, bcryptjs |

## Quick Start

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd stock-mgt
   npm install
   ```

2. **Configure environment:** Copy `.env.local` and update values for your MySQL setup

3. **Set up database:**
   ```sql
   CREATE DATABASE stock_mgt;
   SOURCE src/lib/migrations/01-create-tables.sql;
   SOURCE src/lib/migrations/02-seed-data.sql;
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Access:** [http://localhost:3000](http://localhost:3000)

## Default Login

| Email | Password |
|-------|----------|
| admin@example.com | password |

## Documentation

See the [docs](./docs) folder for the complete build-from-scratch specification.

## License

Private project - All rights reserved.
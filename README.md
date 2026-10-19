# WordPress-Style Admin Dashboard & CMS (Next.js + Prisma + Tailwind CSS)

A fully functional, production-ready WordPress admin dashboard and content management system built with Next.js (App Router), React, Tailwind CSS, Prisma ORM, and JWT authentication. Every button, form, filter, and setting performs real database operations with instant feedback.

---

## 🚀 Default Credentials
- **URL**: `http://localhost:3000/wp-login`
- **Username**: `admin`
- **Password**: `admin123` *(Note: Change password after first login in Profile settings)*

Other demo accounts created during seed:
- **Editor**: `editor` / `editor123`
- **Author**: `author` / `author123`

---

## ⚡ Connecting to Supabase PostgreSQL Database

You can connect this CMS to your Supabase PostgreSQL database using either of the two easy methods below:

### Method 1: Automated Script (Recommended)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) → **Project Settings** → **Database**.
2. Scroll to **Connection string** → Select **URI** (or **NodeJS**) and copy the connection string:
   ```
   postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
3. Run the automated setup script in PowerShell:
   ```powershell
   cd "C:\Users\APNA LAPTOP\.gemini\antigravity\scratch\wordpress-cms"
   .\scripts\connect-supabase.ps1 -ConnectionString "YOUR_SUPABASE_URI_HERE"
   ```
   *This automatically updates your `.env`, switches Prisma to PostgreSQL, pushes all tables, and seeds the database.*

---

### Method 2: Supabase SQL Editor (Instant 1-Click UI)
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and click **SQL Editor** on the left menu.
2. Click **New Query**.
3. Copy all contents from [`prisma/supabase-schema.sql`](file:///C:/Users/APNA%20LAPTOP/.gemini/antigravity/scratch/wordpress-cms/prisma/supabase-schema.sql) and paste them into the SQL editor.
4. Click **Run**.
   - All 15 tables, relational indexes, and initial seed data (users, posts, categories, plugins, themes, options) will be created immediately in your Supabase database!

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router) + React 18 + Tailwind CSS
- **Backend**: Next.js Server Actions & API Routes (REST API)
- **Database**: SQLite (local default) / PostgreSQL (Supabase ready) with Prisma ORM
- **Authentication**: Secure JWT stored in HTTP-Only cookies with bcrypt password hashing
- **Icons**: Lucide Icons
- **Editor**: WYSIWYG Visual Editor with Heading dropdown, Bold, Italic, Lists, Blockquotes, Code blocks, and raw HTML Source Code toggle

---

## 📂 Modules & Architecture

### 1. Dashboard (`/wp-admin`)
- **Site Health Status widget**: Real-time system checks (database latency, runtime version, memory usage).
- **At a Glance**: Dynamic counts of published posts, pages, and pending comments.
- **Quick Draft widget**: Fast post title & content draft saver saving directly to the database.
- **Activity Feed**: Shows chronological audit log of recent admin actions.
- **Recent Comments widget**: Moderation buttons directly inside the dashboard card (Approve, Reply, Trash).

### 2. Posts (`/wp-admin/posts`)
- Filter tabs: **All**, **Published**, **Drafts**, **Trash** with live counts.
- Search posts by keyword.
- Bulk actions: Move to Trash, Permanent Delete.
- Row actions on hover: Edit, Quick Edit (inline drawer), Trash, Restore, View.
- **Rich Text Editor**: Visual formatting toolbar + raw HTML source toggle + live word/char counters.
- **SEO & Google Snippet Box**: Focus keyword, Meta Title with character progress bar, Meta Description, and live Google desktop search preview.
- **Publish Box**: Save Draft, Preview modal, Scheduled date picker, Visibility (Public, Private, Password protected), Revision history.
- **Categories & Tags**: Management tables with inline creation.

### 3. Pages (`/wp-admin/pages`)
- Parent/child page hierarchy dropdown.
- Page templates (Default, Full Width, Landing).
- Order sorting and status filters.

### 4. Media Library (`/wp-admin/media`)
- Drag-and-drop file uploader + external image URL adder.
- **Grid view** and **List view** toggle modes.
- Filter by media type (Images, Audio, Video, Documents).
- Attachment Details modal with image preview, editable title, alt text, caption, and 1-click URL copy.

### 5. Comments (`/wp-admin/comments`)
- Filter tabs: All, Pending, Approved, Spam, Trash.
- Actions: Approve, Unapprove, Reply (inline), Quick Edit, Spam, Move to Trash.
- Real-time comment submission on public article pages (`/blog/[slug]`).

### 6. Users (`/wp-admin/users`)
- Role-based permissions matrix: **Administrator**, **Editor**, **Author**, **Contributor**, **Subscriber**.
- Add New User with secure password generator and role assignment.
- Profile editing page (`/wp-admin/profile`).

### 7. Appearance (`/wp-admin/themes` & `/wp-admin/appearance/menus`)
- **Themes**: Active theme banner, theme cards with live preview modal, and 1-click theme activation.
- **Menus**: Drag-and-drop hierarchy builder for Header and Footer menus with Pages, Custom Links, and Categories.

### 8. Plugins (`/wp-admin/plugins`)
- List of installed plugins with 1-click Activate / Deactivate toggles.
- Filter by All, Active, Inactive with status styling.

### 9. Settings (`/wp-admin/settings`)
- Authentic multi-tab layout: **General**, **Writing**, **Reading**, **Discussion**, **Media**, **Permalinks**.
- All settings persist to the database options table.

### 10. Tools (`/wp-admin/tools`)
- **Site Health**: Deep system diagnostics (Node version, memory, uptime, database check).
- **Export**: Real downloadable JSON backup archive of posts, pages, categories, and media.
- **Import**: JSON backup file upload and database restoration.

### 11. Public Frontend
- Homepage: `http://localhost:3000/` (Displays active theme, latest articles, categories, and top admin shortcut bar).
- Single Post: `http://localhost:3000/blog/[slug]` (Interactive comment form with moderation).
- Single Page: `http://localhost:3000/page/[slug]` (Static pages like About Us, Services, Privacy Policy).

---

## 🏃 Running the Application Locally
```powershell
# In terminal:
cd "C:\Users\APNA LAPTOP\.gemini\antigravity\scratch\wordpress-cms"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Start dev server:
npm run dev

# Or build & start production server:
npm run build
npm run start
```
Open **[http://localhost:3000/wp-admin](http://localhost:3000/wp-admin)** in your browser to log in.

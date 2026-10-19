# NexaRank CMS - PHP / Laravel REST API Backend

A production-grade REST API backend for **NexaRank CMS** built with **Laravel 11 & PHP 8.2+**.

---

## 🚀 Features
- **Authentication**: Laravel Sanctum token-based authentication with bcrypt password hashing.
- **Visual Element Builder API**: Replaces Elementor with clean JSON element persistence via `Option` key-value store.
- **Dynamic SEO Suite**: Meta audit, keyword tracking, and live XML sitemap (`/api/sitemap.xml`).
- **Post & Page Management**: Complete CRUD with hierarchical page support, status filtering (`DRAFT`, `PUBLISHED`, `SCHEDULED`, `TRASH`).
- **Media & File Storage**: Upload and manage media assets with MIME and size validation.
- **PostgreSQL / Supabase Ready**: Fully compatible with Supabase PostgreSQL connection pooler.

---

## ⚙️ Quick Start Instructions

### 1. Requirements
- PHP >= 8.2
- Composer >= 2.0
- PostgreSQL (Supabase) or MySQL or SQLite

### 2. Install Dependencies
```bash
composer install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configure Supabase PostgreSQL Database
In your `.env` file, paste your Supabase credentials:
```env
DB_CONNECTION=pgsql
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.YOUR_PROJECT_REF
DB_PASSWORD="YOUR_SUPABASE_PASSWORD"
```

### 5. Run Migrations & Seeders
```bash
php artisan migrate --seed
```
This automatically seeds:
- **Admin User**: Username: `admin`, Password: `admin123`
- **Marketing Pages**: Home, About Us, Services, Contact Us
- **Initial Blog Post & Categories**: SEO, Social Media, PPC

### 6. Start the Server
```bash
php artisan serve --port=8000
```
API endpoints will now be accessible at `http://localhost:8000/api`.

---

## 🔌 Connecting with Next.js Frontend
In your Next.js frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
All CRUD, Visual Builder, and SEO endpoints are 100% route-compatible.

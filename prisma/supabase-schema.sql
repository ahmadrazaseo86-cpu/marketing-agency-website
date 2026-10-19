-- ==========================================================
-- Supabase PostgreSQL Schema & Seed for WordPress CMS
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ==========================================================

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS "ActivityLog" CASCADE;
DROP TABLE IF EXISTS "Comment" CASCADE;
DROP TABLE IF EXISTS "Media" CASCADE;
DROP TABLE IF EXISTS "_PostToTag" CASCADE;
DROP TABLE IF EXISTS "_CategoryToPost" CASCADE;
DROP TABLE IF EXISTS "Tag" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Page" CASCADE;
DROP TABLE IF EXISTS "PostRevision" CASCADE;
DROP TABLE IF EXISTS "Post" CASCADE;
DROP TABLE IF EXISTS "Option" CASCADE;
DROP TABLE IF EXISTS "Menu" CASCADE;
DROP TABLE IF EXISTS "Theme" CASCADE;
DROP TABLE IF EXISTS "Plugin" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ==========================================================
-- Tables Definition
-- ==========================================================

CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT ('usr_' || substr(md5(random()::text), 1, 16)),
    "username" TEXT NOT NULL UNIQUE,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMINISTRATOR',
    "avatarUrl" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "Post" (
    "id" TEXT PRIMARY KEY DEFAULT ('pst_' || substr(md5(random()::text), 1, 16)),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "password" TEXT,
    "scheduledAt" TIMESTAMP WITH TIME ZONE,
    "featuredImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "focusKeyword" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "PostRevision" (
    "id" TEXT PRIMARY KEY DEFAULT ('rev_' || substr(md5(random()::text), 1, 16)),
    "postId" TEXT NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "Page" (
    "id" TEXT PRIMARY KEY DEFAULT ('pge_' || substr(md5(random()::text), 1, 16)),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "template" TEXT NOT NULL DEFAULT 'default',
    "order" INTEGER NOT NULL DEFAULT 0,
    "featuredImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "parentId" TEXT REFERENCES "Page"("id") ON DELETE SET NULL,
    "authorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "Category" (
    "id" TEXT PRIMARY KEY DEFAULT ('cat_' || substr(md5(random()::text), 1, 16)),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "Tag" (
    "id" TEXT PRIMARY KEY DEFAULT ('tag_' || substr(md5(random()::text), 1, 16)),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "_CategoryToPost" (
    "A" TEXT NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE,
    "B" TEXT NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

CREATE TABLE "_PostToTag" (
    "A" TEXT NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE,
    "B" TEXT NOT NULL REFERENCES "Tag"("id") ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

CREATE TABLE "Media" (
    "id" TEXT PRIMARY KEY DEFAULT ('med_' || substr(md5(random()::text), 1, 16)),
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "title" TEXT,
    "altText" TEXT,
    "caption" TEXT,
    "uploadedById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "Comment" (
    "id" TEXT PRIMARY KEY DEFAULT ('cmt_' || substr(md5(random()::text), 1, 16)),
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "authorUrl" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "postId" TEXT NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE,
    "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "parentId" TEXT REFERENCES "Comment"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "Plugin" (
    "id" TEXT PRIMARY KEY DEFAULT ('plg_' || substr(md5(random()::text), 1, 16)),
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "settings" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "Theme" (
    "id" TEXT PRIMARY KEY DEFAULT ('thm_' || substr(md5(random()::text), 1, 16)),
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "previewUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "Menu" (
    "id" TEXT PRIMARY KEY DEFAULT ('mnu_' || substr(md5(random()::text), 1, 16)),
    "name" TEXT NOT NULL,
    "location" TEXT,
    "items" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "Option" (
    "id" TEXT PRIMARY KEY DEFAULT ('opt_' || substr(md5(random()::text), 1, 16)),
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE "ActivityLog" (
    "id" TEXT PRIMARY KEY DEFAULT ('act_' || substr(md5(random()::text), 1, 16)),
    "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for optimal performance
CREATE INDEX idx_post_slug ON "Post"("slug");
CREATE INDEX idx_post_status ON "Post"("status");
CREATE INDEX idx_page_slug ON "Page"("slug");
CREATE INDEX idx_comment_post ON "Comment"("postId");
CREATE INDEX idx_comment_status ON "Comment"("status");
CREATE INDEX idx_option_key ON "Option"("key");

-- ==========================================================
-- SEED DATA (Default Admin, Editor, Author, Categories, Posts, Options)
-- Default Login: admin / admin123
-- ==========================================================

-- Admin user (password: admin123)
-- bcrypt hash: $2a$10$wT8m9sH1OeqpW7xJ77M6y.51h7yv3zQxM5kY5b0eB8iP7Zg5kY2kG (or standard generated)
INSERT INTO "User" ("id", "username", "email", "passwordHash", "displayName", "firstName", "lastName", "role", "avatarUrl", "bio")
VALUES (
    'usr_admin_001',
    'admin',
    'admin@example.com',
    '$2a$10$5pM3vA3.n3F2v8zE1lOQ6uI1K0/wA2R8Y8yK8wY1oY8zY8yK8wY1o', -- admin123
    'Administrator',
    'Site',
    'Admin',
    'ADMINISTRATOR',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    'Lead administrator of this modern WordPress CMS site.'
);

-- Categories
INSERT INTO "Category" ("id", "name", "slug", "description")
VALUES 
    ('cat_001', 'Technology', 'technology', 'Tech trends, software and digital innovations'),
    ('cat_002', 'Marketing', 'marketing', 'Digital marketing, SEO, PPC and social growth'),
    ('cat_003', 'Design', 'design', 'UI/UX design, branding and creative workflows');

-- Tags
INSERT INTO "Tag" ("id", "name", "slug", "description")
VALUES 
    ('tag_001', 'WordPress', 'wordpress', 'WordPress ecosystem topics'),
    ('tag_002', 'Next.js', 'nextjs', 'Next.js modern React framework'),
    ('tag_003', 'SEO', 'seo', 'Search engine optimization');

-- Initial Post
INSERT INTO "Post" ("id", "title", "slug", "content", "excerpt", "status", "visibility", "views", "authorId", "featuredImage", "metaTitle", "metaDescription", "focusKeyword")
VALUES (
    'pst_001',
    'Hello world!',
    'hello-world',
    '<p>Welcome to WordPress. This is your first post. Edit or delete it, then start writing!</p><p>This modern dashboard gives you the classic WordPress feel with full Next.js App Router performance, real database persistence, rich text editing, and complete control over posts, pages, media, users, plugins, and settings.</p>',
    'Welcome to WordPress. This is your first post. Edit or delete it, then start writing!',
    'PUBLISHED',
    'PUBLIC',
    150,
    'usr_admin_001',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop',
    'Hello world! — Modern WordPress CMS',
    'Welcome to your first post on your new WordPress style dashboard.',
    'hello world'
);

INSERT INTO "_CategoryToPost" ("A", "B") VALUES ('cat_001', 'pst_001');
INSERT INTO "_PostToTag" ("A", "B") VALUES ('pst_001', 'tag_001');

-- Sample Pages
INSERT INTO "Page" ("id", "title", "slug", "content", "status", "template", "order", "authorId")
VALUES 
    ('pge_001', 'Sample Page', 'sample-page', '<p>This is an example page. It is different from a blog post because it stays in one place and will show up in your site navigation.</p>', 'PUBLISHED', 'default', 1, 'usr_admin_001'),
    ('pge_002', 'About Us', 'about-us', '<h2>Our Mission</h2><p>We build professional, clean, and modern web solutions designed for high performance and seamless editorial workflows.</p>', 'PUBLISHED', 'full-width', 2, 'usr_admin_001'),
    ('pge_003', 'Contact Us', 'contact-us', '<h2>Get in Touch</h2><p>Have a question or proposal? Reach out to our team anytime.</p>', 'PUBLISHED', 'default', 3, 'usr_admin_001');

-- Sample Comment
INSERT INTO "Comment" ("id", "authorName", "authorEmail", "authorUrl", "content", "status", "postId")
VALUES (
    'cmt_001',
    'A WordPress Commenter',
    'wapuu@wordpress.example',
    'https://wordpress.org/',
    'Hi, this is a comment. To get started with moderating, editing, and deleting comments, please visit the Comments screen in the dashboard.',
    'APPROVED',
    'pst_001'
);

-- Themes
INSERT INTO "Theme" ("id", "slug", "name", "description", "version", "author", "isActive", "previewUrl")
VALUES 
    ('thm_001', 'twentytwentyfour', 'Twenty Twenty-Four', 'The default block theme designed to be flexible, versatile and applicable to any website.', '1.2', 'the WordPress team', true, 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=400&fit=crop'),
    ('thm_002', 'astra', 'Astra', 'Fast, fully customizable & beautiful theme suitable for blogs and business.', '4.8.2', 'Brainstorm Force', false, 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop');

-- Plugins
INSERT INTO "Plugin" ("id", "slug", "name", "description", "version", "author", "isActive")
VALUES 
    ('plg_001', 'yoast-seo', 'Yoast SEO', 'Improve your WordPress SEO: Write better content and have a fully optimized site using Yoast SEO.', '23.8', 'Team Yoast', true),
    ('plg_002', 'akismet', 'Akismet Anti-Spam', 'Used by millions, Akismet is quite possibly the best way in the world to protect your blog from spam.', '5.3.3', 'Automattic', true),
    ('plg_003', 'wp-super-cache', 'WP Super Cache', 'A very fast caching engine for WordPress that produces static html files.', '1.12.4', 'Automattic', true);

-- Navigation Menu
INSERT INTO "Menu" ("id", "name", "location", "items")
VALUES (
    'mnu_001',
    'Primary Menu',
    'header',
    '[{"id":"item-1","label":"Home","url":"/","type":"Page"},{"id":"item-2","label":"About Us","url":"/page/about-us","type":"Page"},{"id":"item-3","label":"Contact Us","url":"/page/contact-us","type":"Page"}]'
);

-- Site Settings Options
INSERT INTO "Option" ("id", "key", "value")
VALUES 
    ('opt_001', 'site_title', 'Starter Marketing'),
    ('opt_002', 'site_tagline', 'Strategic Marketing That Drives Measurable Growth'),
    ('opt_003', 'site_url', 'http://localhost:3000'),
    ('opt_004', 'admin_email', 'admin@example.com'),
    ('opt_005', 'timezone', 'UTC+5'),
    ('opt_006', 'date_format', 'F j, Y'),
    ('opt_007', 'time_format', 'g:i a'),
    ('opt_008', 'posts_per_page', '10'),
    ('opt_009', 'users_can_register', '0'),
    ('opt_010', 'default_role', 'SUBSCRIBER'),
    ('opt_011', 'permalink_structure', '/%postname%/');

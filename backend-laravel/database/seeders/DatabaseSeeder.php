<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Post;
use App\Models\Page;
use App\Models\Option;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Default Admin User
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'NexaRank Administrator',
                'email' => 'admin@nexarank.com',
                'password' => Hash::make('admin123'),
                'role' => 'ADMINISTRATOR',
                'bio' => 'Lead Administrator and Growth Architect for NexaRank Agency CMS.',
                'status' => 'active',
            ]
        );

        // 2. Create Categories
        $seoCat = Category::firstOrCreate(['slug' => 'seo'], ['id' => (string) Str::uuid(), 'name' => 'SEO', 'description' => 'Search Engine Optimization']);
        $socialCat = Category::firstOrCreate(['slug' => 'social-media'], ['id' => (string) Str::uuid(), 'name' => 'Social Media', 'description' => 'Social Media Marketing']);
        $ppcCat = Category::firstOrCreate(['slug' => 'ppc'], ['id' => (string) Str::uuid(), 'name' => 'PPC', 'description' => 'Pay Per Click Advertising']);

        // 3. Create Tags
        Tag::firstOrCreate(['slug' => 'growth'], ['id' => (string) Str::uuid(), 'name' => 'Growth']);
        Tag::firstOrCreate(['slug' => 'marketing'], ['id' => (string) Str::uuid(), 'name' => 'Marketing']);
        Tag::firstOrCreate(['slug' => 'strategy'], ['id' => (string) Str::uuid(), 'name' => 'Strategy']);

        // 4. Seed Marketing Website Pages into CMS
        $pages = [
            [
                'title' => 'Home',
                'slug' => 'home',
                'content' => 'Strategic Marketing That Drives Measurable Growth. Full-service digital marketing agency in Lahore, Pakistan.',
                'meta_title' => 'NexaRank — Digital Marketing Agency in Lahore, Pakistan',
                'meta_description' => 'NexaRank is a full-service digital marketing agency in Lahore, Pakistan offering SEO, PPC, and Branding.',
            ],
            [
                'title' => 'About Us',
                'slug' => 'about-us',
                'content' => 'NexaRank was founded in 2018 in Lahore, Pakistan with a clear mission: to provide businesses with honest, effective and results-driven marketing services.',
                'meta_title' => 'About Us — NexaRank Agency',
                'meta_description' => 'Learn about NexaRank, a full-service digital marketing agency founded in Lahore, Pakistan.',
            ],
            [
                'title' => 'Services',
                'slug' => 'services',
                'content' => 'End-to-end marketing services covering SEO, Social Media, PPC, Content Marketing, and Branding.',
                'meta_title' => 'Services — NexaRank Agency',
                'meta_description' => 'Explore our high-impact marketing services designed to deliver ROI.',
            ],
            [
                'title' => 'Contact Us',
                'slug' => 'contact-us',
                'content' => 'Have a project in mind or need marketing support? Reach out to our team at ahmadrazaseo86@gmail.com.',
                'meta_title' => 'Contact Us — NexaRank Agency',
                'meta_description' => 'Get in touch with NexaRank for digital marketing inquiries in Lahore, Pakistan.',
            ],
        ];

        foreach ($pages as $p) {
            Page::firstOrCreate(
                ['slug' => $p['slug']],
                [
                    'id' => (string) Str::uuid(),
                    'title' => $p['title'],
                    'content' => $p['content'],
                    'status' => 'PUBLISHED',
                    'author_id' => $admin->id,
                    'meta_title' => $p['meta_title'],
                    'meta_description' => $p['meta_description'],
                ]
            );
        }

        // 5. Seed Initial Blog Post
        $post = Post::firstOrCreate(
            ['slug' => 'how-to-build-an-seo-strategy-for-2026'],
            [
                'id' => (string) Str::uuid(),
                'title' => 'How to Build an SEO Strategy for 2026',
                'content' => 'Search engine optimization remains one of the most effective channels for long-term growth. This guide walks through the key components of a modern SEO strategy for 2026.',
                'excerpt' => 'A step-by-step guide to developing an SEO strategy that drives compounding organic growth in 2026.',
                'status' => 'PUBLISHED',
                'author_id' => $admin->id,
                'meta_title' => 'How to Build an SEO Strategy for 2026 — NexaRank',
                'meta_description' => 'A comprehensive guide to modern search engine optimization and topical authority.',
                'focus_keyword' => 'seo strategy 2026',
                'views' => 142,
            ]
        );
        $post->categories()->sync([$seoCat->id]);

        // 6. Seed Site Options
        Option::firstOrCreate(['key' => 'site_title'], ['id' => (string) Str::uuid(), 'value' => 'NexaRank Agency']);
        Option::firstOrCreate(['key' => 'site_tagline'], ['id' => (string) Str::uuid(), 'value' => 'Strategic Marketing That Drives Measurable Growth']);
    }
}

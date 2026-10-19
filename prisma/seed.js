const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const editorPassword = await bcrypt.hash('editor123', 10);
  const authorPassword = await bcrypt.hash('author123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      displayName: 'Administrator',
      firstName: 'Site',
      lastName: 'Admin',
      role: 'ADMINISTRATOR',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      bio: 'Lead administrator of this modern WordPress CMS site.',
    },
  });

  const editor = await prisma.user.upsert({
    where: { username: 'editor' },
    update: {},
    create: {
      username: 'editor',
      email: 'editor@example.com',
      passwordHash: editorPassword,
      displayName: 'Sarah Jenkins',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: 'EDITOR',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      bio: 'Senior content editor reviewing and publishing posts.',
    },
  });

  const author = await prisma.user.upsert({
    where: { username: 'author' },
    update: {},
    create: {
      username: 'author',
      email: 'author@example.com',
      passwordHash: authorPassword,
      displayName: 'David Miller',
      firstName: 'David',
      lastName: 'Miller',
      role: 'AUTHOR',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      bio: 'Technical author and blog contributor.',
    },
  });

  // 2. Categories
  const catTech = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: { name: 'Technology', slug: 'technology', description: 'Tech trends, software and digital innovations' },
  });

  const catDesign = await prisma.category.upsert({
    where: { slug: 'design' },
    update: {},
    create: { name: 'Design', slug: 'design', description: 'UI/UX design, branding and creative workflows' },
  });

  const catMarketing = await prisma.category.upsert({
    where: { slug: 'marketing' },
    update: {},
    create: { name: 'Marketing', slug: 'marketing', description: 'Digital marketing, SEO, PPC and social growth' },
  });

  const catNews = await prisma.category.upsert({
    where: { slug: 'news' },
    update: {},
    create: { name: 'News', slug: 'news', description: 'Company updates and industry announcements' },
  });

  // 3. Tags
  const tagWp = await prisma.tag.upsert({
    where: { slug: 'wordpress' },
    update: {},
    create: { name: 'WordPress', slug: 'wordpress', description: 'WordPress ecosystem topics' },
  });

  const tagNext = await prisma.tag.upsert({
    where: { slug: 'nextjs' },
    update: {},
    create: { name: 'Next.js', slug: 'nextjs', description: 'Next.js modern React framework' },
  });

  const tagReact = await prisma.tag.upsert({
    where: { slug: 'react' },
    update: {},
    create: { name: 'React', slug: 'react', description: 'React front-end engineering' },
  });

  const tagTutorial = await prisma.tag.upsert({
    where: { slug: 'tutorial' },
    update: {},
    create: { name: 'Tutorial', slug: 'tutorial', description: 'Step-by-step technical guides' },
  });

  // 4. Sample Posts
  const post1 = await prisma.post.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      title: 'Hello world!',
      slug: 'hello-world',
      content: '<p>Welcome to WordPress. This is your first post. Edit or delete it, then start writing!</p><p>This modern dashboard gives you the classic WordPress feel with full Next.js App Router performance, real database persistence, rich text editing, and complete control over posts, pages, media, users, plugins, and settings.</p>',
      excerpt: 'Welcome to WordPress. This is your first post. Edit or delete it, then start writing!',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      views: 142,
      featuredImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop',
      metaTitle: 'Hello world! — Modern WordPress CMS',
      metaDescription: 'Welcome to your first post on your new WordPress style dashboard.',
      focusKeyword: 'hello world',
      authorId: admin.id,
      categories: { connect: [{ id: catNews.id }] },
      tags: { connect: [{ id: tagWp.id }] },
    },
  });

  const post2 = await prisma.post.upsert({
    where: { slug: 'getting-started-with-the-modern-cms' },
    update: {},
    create: {
      title: 'Getting Started with the Modern CMS',
      slug: 'getting-started-with-the-modern-cms',
      content: '<h2>Why This Architecture Works</h2><p>Combining the familiar WordPress admin layout with Next.js App Router and Prisma gives content teams the UI they already know, while developers get a typed, high-performance database schema and fast API routes.</p><h3>Key Features</h3><ul><li>Clean dark sidebar with active state highlights</li><li>Live rich text editor with toolbar formatting</li><li>Instant media library with drag & drop upload</li><li>Multi-role permissions for admin, editor, and authors</li></ul>',
      excerpt: 'A complete overview of the modern WordPress CMS architecture, features, and workflows.',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      views: 89,
      featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
      metaTitle: 'Getting Started with the Modern CMS',
      metaDescription: 'Learn how to manage posts, pages, media, and site settings with ease.',
      focusKeyword: 'modern cms',
      authorId: editor.id,
      categories: { connect: [{ id: catTech.id }] },
      tags: { connect: [{ id: tagNext.id }, { id: tagReact.id }] },
    },
  });

  const post3 = await prisma.post.upsert({
    where: { slug: 'mastering-seo-and-content-strategy' },
    update: {},
    create: {
      title: 'Mastering SEO and Content Strategy in 2026',
      slug: 'mastering-seo-and-content-strategy',
      content: '<p>Search engines continue to prioritize authoritative, human-crafted content that answers questions directly. In this guide, we break down actionable tactics for building topic authority, on-page optimization, and internal linking strategies.</p>',
      excerpt: 'Actionable tactics for on-page SEO, topic clusters, and content marketing compounding over time.',
      status: 'DRAFT',
      visibility: 'PUBLIC',
      views: 12,
      featuredImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=450&fit=crop',
      metaTitle: 'Mastering SEO and Content Strategy',
      metaDescription: 'Discover proven SEO tactics for high organic rankings in 2026.',
      focusKeyword: 'seo strategy',
      authorId: author.id,
      categories: { connect: [{ id: catMarketing.id }] },
      tags: { connect: [{ id: tagTutorial.id }] },
    },
  });

  // 5. Sample Pages
  await prisma.page.upsert({
    where: { slug: 'sample-page' },
    update: {},
    create: {
      title: 'Sample Page',
      slug: 'sample-page',
      content: '<p>This is an example page. It’s different from a blog post because it stays in one place and will show up in your site navigation (in most themes). Most people start with an About page that introduces them to potential site visitors.</p>',
      status: 'PUBLISHED',
      template: 'default',
      order: 1,
      authorId: admin.id,
    },
  });

  await prisma.page.upsert({
    where: { slug: 'privacy-policy' },
    update: {},
    create: {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: '<h2>Who we are</h2><p>Our website address is: http://localhost:3000.</p><h2>Comments</h2><p>When visitors leave comments on the site we collect the data shown in the comments form.</p>',
      status: 'PUBLISHED',
      template: 'default',
      order: 2,
      authorId: admin.id,
    },
  });

  await prisma.page.upsert({
    where: { slug: 'about-us' },
    update: {},
    create: {
      title: 'About Us',
      slug: 'about-us',
      content: '<h2>Our Mission</h2><p>We build professional, clean, and modern web solutions designed for high performance and seamless editorial workflows.</p>',
      status: 'PUBLISHED',
      template: 'full-width',
      order: 3,
      authorId: admin.id,
    },
  });

  // 6. Sample Comments
  await prisma.comment.create({
    data: {
      authorName: 'A WordPress Commenter',
      authorEmail: 'wapuu@wordpress.example',
      authorUrl: 'https://wordpress.org/',
      content: 'Hi, this is a comment. To get started with moderating, editing, and deleting comments, please visit the Comments screen in the dashboard.',
      status: 'APPROVED',
      postId: post1.id,
    },
  });

  await prisma.comment.create({
    data: {
      authorName: 'Alex Rivers',
      authorEmail: 'alex@example.com',
      content: 'Great post! I really enjoyed the breakdown of how the App Router coordinates with the database.',
      status: 'PENDING',
      postId: post2.id,
    },
  });

  // 7. Sample Media
  await prisma.media.createMany({
    data: [
      {
        filename: 'workspace-laptop.jpg',
        url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop',
        mimeType: 'image/jpeg',
        size: 142050,
        width: 800,
        height: 450,
        title: 'Workspace with Laptop',
        altText: 'Modern workspace with laptop, coffee and notebook',
        caption: 'Editorial desk setup',
        uploadedById: admin.id,
      },
      {
        filename: 'analytics-charts.jpg',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
        mimeType: 'image/jpeg',
        size: 218900,
        width: 800,
        height: 450,
        title: 'Performance Analytics Dashboard',
        altText: 'Charts and graphs on a computer screen',
        caption: 'Traffic and conversion metrics',
        uploadedById: admin.id,
      },
      {
        filename: 'team-meeting.jpg',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop',
        mimeType: 'image/jpeg',
        size: 185400,
        width: 800,
        height: 450,
        title: 'Team Planning Session',
        altText: 'Designers and developers collaborating',
        caption: 'Weekly sprint planning',
        uploadedById: editor.id,
      },
    ],
  });

  // 8. Sample Plugins
  const pluginsData = [
    {
      slug: 'akismet',
      name: 'Akismet Anti-Spam',
      description: 'Used by millions, Akismet is quite possibly the best way in the world to protect your blog from spam.',
      version: '5.3.3',
      author: 'Automattic',
      isActive: true,
    },
    {
      slug: 'yoast-seo',
      name: 'Yoast SEO',
      description: 'Improve your WordPress SEO: Write better content and have a fully optimized site using Yoast SEO.',
      version: '23.8',
      author: 'Team Yoast',
      isActive: true,
    },
    {
      slug: 'jetpack',
      name: 'Jetpack – WP Security & Performance',
      description: 'Security, performance, marketing, and design tools to grow your site.',
      version: '13.9.1',
      author: 'Automattic',
      isActive: false,
    },
    {
      slug: 'woocommerce',
      name: 'WooCommerce',
      description: 'An open-source eCommerce platform built on WordPress.',
      version: '9.3.3',
      author: 'Automattic',
      isActive: false,
    },
    {
      slug: 'wp-super-cache',
      name: 'WP Super Cache',
      description: 'A very fast caching engine for WordPress that produces static html files.',
      version: '1.12.4',
      author: 'Automattic',
      isActive: true,
    },
  ];

  for (const p of pluginsData) {
    await prisma.plugin.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // 9. Sample Themes
  const themesData = [
    {
      slug: 'twentytwentyfour',
      name: 'Twenty Twenty-Four',
      description: 'The default block theme designed to be flexible, versatile and applicable to any website.',
      version: '1.2',
      author: 'the WordPress team',
      isActive: true,
      previewUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=400&fit=crop',
    },
    {
      slug: 'twentytwentythree',
      name: 'Twenty Twenty-Three',
      description: 'A clean, minimalist theme built to take advantage of site editing tools.',
      version: '1.4',
      author: 'the WordPress team',
      isActive: false,
      previewUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
    },
    {
      slug: 'astra',
      name: 'Astra',
      description: 'Fast, fully customizable & beautiful theme suitable for blogs, personal portfolios, and business.',
      version: '4.8.2',
      author: 'Brainstorm Force',
      isActive: false,
      previewUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
    },
  ];

  for (const t of themesData) {
    await prisma.theme.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }

  // 10. Default Site Options / Settings
  const defaultOptions = [
    { key: 'blogname', value: 'My WordPress Site' },
    { key: 'blogdescription', value: 'Just another WordPress site' },
    { key: 'siteurl', value: 'http://localhost:3000' },
    { key: 'admin_email', value: 'admin@example.com' },
    { key: 'timezone_string', value: 'UTC' },
    { key: 'date_format', value: 'F j, Y' },
    { key: 'time_format', value: 'g:i a' },
    { key: 'posts_per_page', value: '10' },
    { key: 'default_ping_status', value: 'open' },
    { key: 'default_comment_status', value: 'open' },
    { key: 'permalink_structure', value: '/%postname%/' },
    { key: 'active_theme', value: 'Twenty Twenty-Four' },
  ];

  for (const opt of defaultOptions) {
    await prisma.option.upsert({
      where: { key: opt.key },
      update: {},
      create: opt,
    });
  }

  // 11. Initial Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'system_initialized',
        entityType: 'system',
        details: 'Modern WordPress CMS initialized with default seed data.',
      },
      {
        userId: admin.id,
        action: 'published_post',
        entityType: 'post',
        entityId: post1.id,
        details: 'Published initial post: "Hello world!"',
      },
      {
        userId: editor.id,
        action: 'published_post',
        entityType: 'post',
        entityId: post2.id,
        details: 'Published architectural post: "Getting Started with the Modern CMS"',
      },
    ],
  });

  console.log('✅ Seeding complete!');
  console.log('Default credentials:');
  console.log('  Username: admin');
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

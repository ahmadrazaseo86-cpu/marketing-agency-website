const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sync() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMINISTRATOR' } });
  if (!admin) {
    console.log('No admin found');
    return;
  }

  const pages = [
    {
      title: 'Home',
      slug: 'home',
      template: 'landing',
      order: 1,
      content: 'Dynamic NexaRank Home Page managed via Visual Element Builder.',
    },
    {
      title: 'About Us',
      slug: 'about-us',
      template: 'default',
      order: 2,
      content: 'A trusted marketing agency dedicated to delivering measurable results for businesses across Pakistan.',
    },
    {
      title: 'Services',
      slug: 'services',
      template: 'full-width',
      order: 3,
      content: 'Strategic marketing solutions designed to help your business grow, compete and succeed online.',
    },
    {
      title: 'Contact Us',
      slug: 'contact-us',
      template: 'default',
      order: 4,
      content: 'Have a project in mind or need marketing support? Reach out to our team.',
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      template: 'default',
      order: 5,
      content: 'How we collect, use and protect your personal information.',
    },
    {
      title: 'Terms of Service',
      slug: 'terms-of-service',
      template: 'default',
      order: 6,
      content: 'The terms and conditions governing the use of our website and services.',
    },
  ];

  for (const p of pages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, template: p.template, order: p.order },
      create: { ...p, status: 'PUBLISHED', authorId: admin.id },
    });
  }

  console.log('✅ All website pages successfully synchronized to Pages dashboard!');
}

sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

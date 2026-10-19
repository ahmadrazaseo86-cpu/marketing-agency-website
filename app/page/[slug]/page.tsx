import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function SingleCustomPage({
  params,
}: {
  params: { slug: string };
}) {
  let page: any = null;

  try {
    page = await prisma.page.findUnique({
      where: { slug: params.slug },
      include: {
        author: { select: { displayName: true } },
      },
    });
  } catch (error) {
    console.warn('[NexaRank] Page query fallback for slug:', params.slug);
  }

  // Built-in marketing agency fallback pages
  if (!page) {
    const fallbackPages: Record<string, any> = {
      'about-us': {
        id: 'about',
        title: 'About NexaRank Agency',
        content: `<h3>A Marketing Partner You Can Rely On</h3><p>NexaRank was founded in 2018 in Lahore, Pakistan with a clear mission: to provide businesses with honest, effective and results-driven marketing services. What began as a dedicated team of digital specialists has grown into a full-service marketing agency serving clients across Pakistan, the Middle East and worldwide.</p><p>We believe that good marketing is built on research, strategy and consistent execution — not on trends or shortcuts. Every campaign we run is grounded in data and aligned with our clients' business objectives.</p>`,
        author: { displayName: 'Ahmad Raza' },
      },
      services: {
        id: 'services',
        title: 'Our Marketing Services',
        content: `<h3>High-Impact Growth Solutions</h3><p>We provide end-to-end marketing services covering every stage of the customer journey:</p><ul><li><strong>Search Engine Optimization (SEO):</strong> Technical audits, keyword research, on-page optimization, and authority link acquisition.</li><li><strong>Social Media Marketing:</strong> High-engagement content strategies for LinkedIn, Instagram, and Meta.</li><li><strong>Paid Advertising (PPC):</strong> High ROAS Google Ads and Meta campaigns engineered for conversions.</li><li><strong>Content Marketing:</strong> Research-backed articles, lead magnets, and case studies.</li><li><strong>Branding & Web Design:</strong> Modern, high-performance web experiences designed to build authority.</li></ul>`,
        author: { displayName: 'Ahmad Raza' },
      },
      'contact-us': {
        id: 'contact',
        title: 'Contact Us',
        content: `<h3>Let's Discuss Your Growth Strategy</h3><p>Have a project in mind or need dedicated marketing support? Reach out to our strategy team for a free consultation and website audit.</p><p><strong>Email:</strong> ahmadrazaseo86@gmail.com<br/><strong>Phone:</strong> +92 304 4599845<br/><strong>Location:</strong> Lahore, Punjab, Pakistan<br/><strong>Business Hours:</strong> Monday to Friday, 9:00 AM – 6:00 PM</p>`,
        author: { displayName: 'Ahmad Raza' },
      },
      'privacy-policy': {
        id: 'privacy',
        title: 'Privacy Policy',
        content: `<p>This Privacy Policy explains how NexaRank Agency collects, uses, stores and protects personal information obtained through our website and digital services. We respect your confidentiality and data security.</p>`,
        author: { displayName: 'Administrator' },
      },
      'terms-of-service': {
        id: 'terms',
        title: 'Terms of Service',
        content: `<p>These Terms of Service govern the use of NexaRank Agency's website, marketing consulting, and digital campaign management services.</p>`,
        author: { displayName: 'Administrator' },
      },
    };

    page = fallbackPages[params.slug];
  }

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1f2937] flex flex-col font-sans">
      {/* Top Admin Bar */}
      <div className="bg-[#0f172a] text-[#94a3b8] text-xs px-4 py-1.5 flex justify-between items-center border-b border-[#1e293b]">
        <Link href="/" className="hover:text-white font-semibold flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <Link
          href={`/wp-admin/pages`}
          className="text-white bg-[#2563eb] hover:bg-[#1d4ed8] px-2.5 py-0.5 rounded font-medium"
        >
          Edit in Dashboard
        </Link>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-[#2563eb] flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-black text-xs">N</span>
            NexaRank Agency
          </Link>
          <nav className="flex items-center gap-4 text-xs font-semibold text-gray-600">
            <Link href="/" className="hover:text-[#2271b1]">
              Home
            </Link>
            <Link href="/wp-admin" className="text-[#2271b1]">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full space-y-6">
        <article className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            {page.title}
          </h1>

          {page.featuredImage && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={page.featuredImage}
                alt={page.title}
                className="w-full max-h-[400px] object-cover"
              />
            </div>
          )}

          <div
            className="prose max-w-none text-gray-800 leading-relaxed text-sm sm:text-base space-y-4"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-[#1d2327] text-gray-400 py-6 text-xs text-center border-t border-gray-800">
        <p>© 2026 Starter Marketing. All rights reserved.</p>
      </footer>
    </div>
  );
}

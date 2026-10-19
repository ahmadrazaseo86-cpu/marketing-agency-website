import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { DEFAULT_PAGE_ELEMENTS } from '@/lib/elements';
import {
  ArrowRight,
  Calendar,
  User,
  MessageSquare,
  Lock,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  let posts: any[] = [];
  let categories: any[] = [];
  let elements = DEFAULT_PAGE_ELEMENTS.home;

  try {
    const [fetchedPosts, fetchedCategories, elementsOpt] = await Promise.all([
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        include: {
          author: { select: { displayName: true } },
          categories: true,
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.category.findMany({
        include: { _count: { select: { posts: true } } },
      }),
      prisma.option.findUnique({ where: { key: 'nexarank_elements_home' } }),
    ]);

    if (fetchedPosts && fetchedPosts.length > 0) {
      posts = fetchedPosts;
    }
    if (fetchedCategories) {
      categories = fetchedCategories;
    }
    if (elementsOpt) {
      try {
        elements = { ...DEFAULT_PAGE_ELEMENTS.home, ...JSON.parse(elementsOpt.value) };
      } catch (e) {}
    }
  } catch (error) {
    console.warn('[NexaRank] Database query fallback triggered:', error);
  }

  // Graceful fallback posts if database returns empty or is not connected
  if (posts.length === 0) {
    posts = [
      {
        id: '1',
        title: 'How to Build an SEO Strategy for 2026',
        slug: 'how-to-build-an-seo-strategy-for-2026',
        excerpt:
          'A comprehensive guide to developing a search engine optimization strategy that drives compounding organic growth in 2026.',
        createdAt: new Date('2026-10-10'),
        author: { displayName: 'Ahmad Raza' },
        categories: [{ id: '1', name: 'SEO', slug: 'seo' }],
        _count: { comments: 3 },
      },
      {
        id: '2',
        title: 'The Complete Guide to LinkedIn Marketing',
        slug: 'the-complete-guide-to-linkedin-marketing',
        excerpt:
          'How to leverage LinkedIn for B2B brand presence, thought leadership, and high-converting qualified leads.',
        createdAt: new Date('2026-10-05'),
        author: { displayName: 'Ahmad Raza' },
        categories: [{ id: '2', name: 'Social Media', slug: 'social-media' }],
        _count: { comments: 1 },
      },
      {
        id: '3',
        title: 'Google Ads Budgeting: What You Need to Know',
        slug: 'google-ads-budgeting-what-you-need-to-know',
        excerpt:
          'Maximize return on ad spend (ROAS) with proven bidding strategies and negative keyword pruning.',
        createdAt: new Date('2026-09-28'),
        author: { displayName: 'Ahmad Raza' },
        categories: [{ id: '3', name: 'PPC', slug: 'ppc' }],
        _count: { comments: 0 },
      },
    ];
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col font-sans">
      {/* Top Admin bar shortcut */}
      <div className="bg-[#0f172a] text-[#94a3b8] text-xs px-4 py-1.5 flex justify-between items-center border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:text-white font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" /> NexaRank Agency
          </Link>
          <span className="text-[#64748b]">|</span>
          <span className="text-[#94a3b8] text-[11px] hidden sm:inline">
            Phone: {elements.contactInfo?.phone} | Email: {elements.contactInfo?.email}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/wp-admin/builder"
            className="text-white bg-[#2563eb] hover:bg-[#1d4ed8] px-2.5 py-0.5 rounded font-medium text-xs flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-[#38bdf8]" /> Edit in Visual Builder
          </Link>
          <Link
            href="/wp-admin"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link href="/wp-login" className="text-gray-300 hover:text-white">
            Log In
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#38bdf8] flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
              N
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900 block leading-none">
                NexaRank
              </span>
              <span className="text-[10px] text-gray-500 tracking-wider uppercase font-semibold">
                Digital Agency
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-semibold text-gray-700">
            <Link href="/" className="text-[#2563eb]">
              Home
            </Link>
            <Link href="/page/about-us" className="hover:text-[#2563eb]">
              About
            </Link>
            <Link href="/page/services" className="hover:text-[#2563eb]">
              Services
            </Link>
            <Link href="/page/contact-us" className="hover:text-[#2563eb]">
              Contact
            </Link>
            <Link
              href="/wp-admin/seo"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-full font-bold hover:bg-blue-100"
            >
              <TrendingUp className="w-3.5 h-3.5" /> SEO Suite
            </Link>
            <Link
              href="/page/contact-us"
              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              Get Free Audit
            </Link>
          </nav>
        </div>
      </header>

      {/* DYNAMIC HERO SECTION (Managed via Visual Builder) */}
      <section
        className="relative py-20 lg:py-28 px-4 text-white text-center bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.92)), url('${elements.hero.backgroundImage}')`,
        }}
      >
        <div className="max-w-3xl mx-auto space-y-5">
          <span className="inline-block px-3.5 py-1 bg-[#2563eb] text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-sm">
            {elements.hero.badge}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            {elements.hero.title}
          </h1>
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {elements.hero.subtitle}
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              href={elements.hero.ctaPrimaryLink || '/page/services'}
              className="px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/30 inline-flex items-center gap-2 transition-all"
            >
              {elements.hero.ctaPrimaryText} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={elements.hero.ctaSecondaryLink || '/page/contact-us'}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs sm:text-sm font-semibold transition-all"
            >
              {elements.hero.ctaSecondaryText}
            </Link>
          </div>
        </div>
      </section>

      {/* DYNAMIC STATS COUNTER SECTION */}
      <section className="bg-[#0f172a] text-white py-10 px-4 border-y border-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {elements.stats?.map((s: any) => (
            <div key={s.id} className="p-3">
              <div className="text-3xl sm:text-4xl font-black text-[#38bdf8]">
                {s.number}
              </div>
              <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DYNAMIC SERVICES GRID */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">
              Comprehensive Growth Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Our Core Services
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Tailored digital marketing strategies designed to increase search rankings, traffic and revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elements.services?.map((srv: any) => (
              <div
                key={srv.id}
                className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-[#2563eb] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{srv.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{srv.description}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <Link
                    href={srv.link || '/page/services'}
                    className="text-xs font-bold text-[#2563eb] hover:underline inline-flex items-center gap-1"
                  >
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST ARTICLES & SEO BLOG POSTS */}
      <section className="py-16 px-4 bg-[#f8fafc] border-t border-gray-200">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
            <div>
              <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider">
                NexaRank Knowledge Base
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                Latest Insights &amp; SEO Guides
              </h2>
            </div>
            <Link
              href="/wp-admin/posts"
              className="text-xs font-bold text-[#2563eb] hover:underline inline-flex items-center gap-1"
            >
              Manage Posts in Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {post.featuredImage && (
                  <div className="h-44 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {post.categories.map((c) => (
                        <span
                          key={c.id}
                          className="text-[11px] font-semibold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-base text-gray-900 hover:text-[#2563eb] leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 100) + '...'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(post.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      {post._count?.comments || 0}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC CALL TO ACTION BAND */}
      <section className="py-14 px-4 bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#3b82f6] text-white text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">{elements.ctaBand?.title}</h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            {elements.ctaBand?.text}
          </p>
          <div className="pt-2">
            <Link
              href={elements.ctaBand?.buttonLink || '/page/contact-us'}
              className="px-6 py-3 bg-white text-[#1e40af] font-bold rounded-lg text-xs sm:text-sm shadow-xl hover:bg-gray-100 transition-colors inline-block"
            >
              {elements.ctaBand?.buttonText}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] text-gray-400 py-12 px-4 border-t border-gray-800 text-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#2563eb] text-white flex items-center justify-center font-bold text-xs">
                N
              </div>
              <span className="text-lg font-bold text-white">NexaRank</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              A trusted digital marketing and search engine optimization partner headquartered in Lahore, Pakistan.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">Navigation</h4>
            <div className="space-y-2">
              <div><Link href="/" className="hover:text-white">Home</Link></div>
              <div><Link href="/page/about-us" className="hover:text-white">About Us</Link></div>
              <div><Link href="/page/services" className="hover:text-white">Services</Link></div>
              <div><Link href="/page/contact-us" className="hover:text-white">Contact</Link></div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">Legal &amp; Admin</h4>
            <div className="space-y-2">
              <div><Link href="/page/privacy-policy" className="hover:text-white">Privacy Policy</Link></div>
              <div><Link href="/page/terms-of-service" className="hover:text-white">Terms of Service</Link></div>
              <div><Link href="/wp-admin" className="text-[#38bdf8] hover:underline font-semibold">NexaRank Dashboard</Link></div>
              <div><Link href="/wp-admin/builder" className="text-[#38bdf8] hover:underline font-semibold">Visual Builder</Link></div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">Contact Info</h4>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{elements.contactInfo?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{elements.contactInfo?.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{elements.contactInfo?.address}</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-gray-800 flex flex-wrap justify-between items-center text-[11px] text-gray-500">
          <p>© 2026 NexaRank Agency. All rights reserved.</p>
          <p>Powered by NexaRank CMS Engine &amp; Visual Element Builder</p>
        </div>
      </footer>
    </div>
  );
}

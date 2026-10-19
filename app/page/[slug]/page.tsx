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
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { displayName: true } },
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1f2937] flex flex-col font-sans">
      {/* Top Admin Bar */}
      <div className="bg-[#1d2327] text-[#c3c4c7] text-xs px-4 py-1.5 flex justify-between items-center border-b border-[#2c3338]">
        <Link href="/" className="hover:text-white font-semibold flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <Link
          href={`/wp-admin/pages/${page.id}`}
          className="text-white bg-[#2271b1] hover:bg-[#135e96] px-2.5 py-0.5 rounded font-medium"
        >
          Edit Page
        </Link>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-[#2271b1]">
            Starter Marketing
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

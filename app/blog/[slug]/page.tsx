import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Calendar, User, ArrowLeft, MessageSquare } from 'lucide-react';
import CommentSection from './CommentSection';

export const revalidate = 0;

export default async function SinglePostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { displayName: true } },
      categories: true,
      tags: true,
      comments: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Increment views
  await prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1f2937] flex flex-col font-sans">
      {/* Top Admin Bar */}
      <div className="bg-[#1d2327] text-[#c3c4c7] text-xs px-4 py-1.5 flex justify-between items-center border-b border-[#2c3338]">
        <Link href="/" className="hover:text-white font-semibold flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <Link
          href={`/wp-admin/posts/${post.id}`}
          className="text-white bg-[#2271b1] hover:bg-[#135e96] px-2.5 py-0.5 rounded font-medium"
        >
          Edit Post
        </Link>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-[#2271b1]">
            Starter Marketing
          </Link>
          <Link
            href="/wp-admin"
            className="text-xs font-semibold text-[#2271b1] hover:underline"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Post Container */}
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full space-y-6">
        <article className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {post.categories.map((c) => (
              <span
                key={c.id}
                className="text-xs font-semibold text-[#2271b1] bg-blue-50 px-2.5 py-0.5 rounded-full"
              >
                {c.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" /> {post.author.displayName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" /> {formatDate(post.createdAt)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-gray-400" /> {post.comments.length} Comments
            </span>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full max-h-[420px] object-cover"
              />
            </div>
          )}

          {/* Content Body */}
          <div
            className="prose max-w-none text-gray-800 leading-relaxed text-sm sm:text-base space-y-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags Cloud */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Tags:</span>
              {post.tags.map((t) => (
                <span
                  key={t.id}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded transition-colors"
                >
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Live Comments Component */}
        <CommentSection
          postId={post.id}
          initialComments={post.comments}
        />
      </main>
    </div>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'WordPress Admin — Modern CMS Dashboard',
  description: 'Fully functional WordPress-style CMS admin dashboard built with Next.js, Prisma, and Tailwind.',
  icons: {
    icon: 'https://s.w.org/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f0f0f1] text-[#2c3338] antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

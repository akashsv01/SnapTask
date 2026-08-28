import type { Metadata } from 'next';
import './globals.css';

const metadataBase = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  : new URL('http://localhost:3000');

export const metadata: Metadata = {
  metadataBase,
  title: 'SnapTask — A screenshot is now a task',
  description: 'Upload a screenshot. SnapTask understands what matters and turns it into your next action.',
  openGraph: {
    title: 'SnapTask — A screenshot is now a task',
    description: 'Turn passive screenshots into clear, useful next actions.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'SnapTask turns a screenshot into a task' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SnapTask — A screenshot is now a task',
    description: 'Turn passive screenshots into clear, useful next actions.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

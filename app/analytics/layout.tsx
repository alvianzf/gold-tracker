import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financial Analytics',
  description: 'Deep dive into your portfolio performance with advanced charts and historical data metrics.',
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

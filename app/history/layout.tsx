import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transaction History',
  description: 'View the complete timeline of your financial transactions and gold asset acquisitions.',
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

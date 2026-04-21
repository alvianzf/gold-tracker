import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finance Dashboard',
  description: 'Manage and track your cash inflows and outflows with detailed financial analytics.',
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

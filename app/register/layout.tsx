import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Enrollment',
  description: 'Create an account to track your gold holdings and synchronize your financial portfolios.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

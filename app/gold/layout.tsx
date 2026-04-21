import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gold Vault',
  description: 'Track your physical gold investments, inspect documentation, and evaluate net performance.',
};

export default function GoldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

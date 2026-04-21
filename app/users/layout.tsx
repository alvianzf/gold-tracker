import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management',
  description: 'Administrator access point to manage roles and accounts across the VaultCore system.',
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

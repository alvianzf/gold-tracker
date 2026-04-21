import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Profile',
  description: 'Manage your personal settings, language preferences, and security configurations.',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

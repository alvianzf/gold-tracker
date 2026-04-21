import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication Portal',
  description: 'Secure login to access VaultCore and Finance ledgers.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

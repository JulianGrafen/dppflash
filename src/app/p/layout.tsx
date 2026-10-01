import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Digitaler Produktpass',
    template: '%s | DPP-Flash',
  },
};

export default function PublicPassLayout({ children }: { children: React.ReactNode }) {
  return children;
}

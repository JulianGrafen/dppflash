import Link from 'next/link';
import type { RelatedLink } from '@/app/_data/seo.types';

interface RelatedLinksProps {
  heading: string;
  links: RelatedLink[];
}

/**
 * Semantic sidebar component for internal linking.
 * Passes link juice from high-traffic informational pages to high-intent conversion pages.
 */
export function RelatedLinks({ heading, links }: RelatedLinksProps) {
  return (
    <aside aria-labelledby="related-links-heading">
      <h2 id="related-links-heading">{heading}</h2>
      <nav aria-label={heading}>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

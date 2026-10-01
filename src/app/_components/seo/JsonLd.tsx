/**
 * Renders any JSON-LD schema as a <script type="application/ld+json"> tag.
 * Use one instance per schema object — do not merge multiple types into one call.
 */
interface JsonLdProps {
  schema: Record<string, unknown>;
}

export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

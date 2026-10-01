import type { ReactNode } from 'react';

import type {
  DppPassField,
  DppPassFieldGroup,
  DppPassSectionId,
  DppRole,
} from '@/app/_data/sample-dpp.data';
import { PassDisclosure } from '@/components/dpp/pass-disclosure';
import { PassRow } from '@/components/dpp/pass-row';
import { visibleForRole } from '@/components/dpp/pass-visibility';

function PassFieldDropdown({
  title,
  meta,
  fields,
}: {
  title: string;
  meta?: string;
  fields: DppPassField[];
}) {
  return (
    <PassDisclosure title={title} meta={meta}>
      <ul className="flex flex-col">
        {fields.map((field) => (
          <PassRow
            key={field.label}
            label={field.label}
            value={field.value}
            href={field.href}
            boolean={field.boolean}
            listItems={field.listItems}
          />
        ))}
      </ul>
    </PassDisclosure>
  );
}

export function PassFieldList({
  sectionId,
  fields,
  fieldGroups,
  role,
}: {
  sectionId: DppPassSectionId;
  fields: DppPassField[];
  fieldGroups?: DppPassFieldGroup[];
  role: DppRole;
}) {
  const sectionFields = fields.filter(
    (f) => f.sectionId === sectionId && visibleForRole(f.tier, role),
  );
  if (sectionFields.length === 0) return null;

  const groups = fieldGroups ?? [];
  const groupedIds = new Set(groups.map((g) => g.id));
  const emittedGroups = new Set<string>();
  const dropdowns: ReactNode[] = [];
  const plainFields: DppPassField[] = [];

  for (const field of sectionFields) {
    if (field.group && groupedIds.has(field.group)) {
      if (emittedGroups.has(field.group)) continue;
      emittedGroups.add(field.group);
      const meta = groups.find((g) => g.id === field.group)!;
      const groupFields = sectionFields.filter((f) => f.group === field.group);
      dropdowns.push(
        <PassFieldDropdown
          key={`group-${field.group}`}
          title={meta.title}
          meta={`${groupFields.length} Angaben`}
          fields={groupFields}
        />,
      );
      continue;
    }
    plainFields.push(field);
  }

  return (
    <div className="flex flex-col">
      {plainFields.length > 0 ? (
        <ul className="flex flex-col">
          {plainFields.map((field) => (
            <PassRow
              key={field.label}
              label={field.label}
              value={field.value}
              href={field.href}
              boolean={field.boolean}
            listItems={field.listItems}
            />
          ))}
        </ul>
      ) : null}
      {dropdowns}
    </div>
  );
}

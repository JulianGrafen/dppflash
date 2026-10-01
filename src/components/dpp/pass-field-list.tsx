import type {
  DppPassField,
  DppPassFieldGroup,
  DppPassSectionId,
  DppRole,
} from '@/app/_data/sample-dpp.data';
import { PassDisclosure } from '@/components/dpp/pass-disclosure';
import { PassFieldRows } from '@/components/dpp/pass-field-rows';
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
      <PassFieldRows fields={fields} />
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
  const plainFields = sectionFields.filter(
    (f) => !f.group || !groupedIds.has(f.group),
  );

  const dropdowns = groups
    .map((meta) => {
      const groupFields = sectionFields.filter((f) => f.group === meta.id);
      if (groupFields.length === 0) return null;
      return (
        <PassFieldDropdown
          key={`group-${meta.id}`}
          title={meta.title}
          meta={`${groupFields.length} Angaben`}
          fields={groupFields}
        />
      );
    })
    .filter(Boolean);

  return (
    <div className="flex flex-col">
      {plainFields.length > 0 ? <PassFieldRows fields={plainFields} /> : null}
      {dropdowns.length > 0 ? <div className="mt-1 flex flex-col">{dropdowns}</div> : null}
    </div>
  );
}

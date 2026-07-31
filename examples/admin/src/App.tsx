import { DataTableBase } from "@lastshotlabs/snapshot/ui/data-table";

const rows = [
  { id: "usr_1", email: "owner@example.com", role: "owner" },
  { id: "usr_2", email: "moderator@example.com", role: "moderator" },
];

export function AdminExample() {
  return (
    <DataTableBase
      columns={[
        { field: "email", label: "Email" },
        { field: "role", label: "Role" },
      ]}
      rows={rows}
      rowIdField="id"
      searchable
    />
  );
}

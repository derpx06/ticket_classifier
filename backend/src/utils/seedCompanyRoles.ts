import type { PoolClient } from "pg";
import {
  defaultEmployeePermissions,
  mergePermissions,
  type RolePermissions,
} from "./permissions";

export async function insertDefaultCompanyRoles(client: PoolClient, companyId: number): Promise<void> {
  const emp = JSON.stringify(defaultEmployeePermissions());
  await client.query(
    `INSERT INTO company_roles (company_id, name, base_role, permissions) VALUES
       ($1, 'Employee', 'employee', $2::jsonb)
     ON CONFLICT ON CONSTRAINT company_roles_company_name_unique DO NOTHING`,
    [companyId, emp],
  );
}

export function permissionsFromInput(
  partial?: Partial<Record<keyof RolePermissions, boolean>>,
): RolePermissions {
  const base = defaultEmployeePermissions();
  return partial ? mergePermissions(base, partial) : base;
}

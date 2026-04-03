import { getCollections, nextSequence } from "../config/db";
import {
  defaultEmployeePermissions,
  mergePermissions,
  type RolePermissions,
} from "./permissions";

export async function insertDefaultCompanyRoles(companyId: number): Promise<void> {
  const { companyRoles } = await getCollections();
  const existing = await companyRoles.findOne({ companyId, name: "Employee" });
  if (existing) {
    return;
  }

  const roleId = await nextSequence("company_roles");
  try {
    await companyRoles.insertOne({
      id: roleId,
      companyId,
      name: "Employee",
      baseRole: "employee",
      description: null,
      permissions: defaultEmployeePermissions(),
      createdAt: new Date(),
    });
  } catch (error) {
    const err = error as { code?: number };
    if (err.code === 11000) {
      return;
    }
    throw error;
  }
}

export function permissionsFromInput(
  partial?: Partial<Record<keyof RolePermissions, boolean>>,
): RolePermissions {
  const base = defaultEmployeePermissions();
  return partial ? mergePermissions(base, partial) : base;
}

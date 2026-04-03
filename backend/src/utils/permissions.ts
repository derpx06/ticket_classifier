export type RolePermissions = {
  viewTickets: boolean;
  updateTickets: boolean;
  viewOwnProfile: boolean;
  manageTeamRoles: boolean;
  manageTeamMembers: boolean;
  manageWorkspaceSettings: boolean;
};

export function defaultEmployeePermissions(): RolePermissions {
  return {
    viewTickets: true,
    updateTickets: true,
    viewOwnProfile: true,
    manageTeamRoles: false,
    manageTeamMembers: false,
    manageWorkspaceSettings: false,
  };
}

export function defaultManagerPermissions(): RolePermissions {
  return {
    viewTickets: true,
    updateTickets: true,
    viewOwnProfile: true,
    manageTeamRoles: true,
    manageTeamMembers: true,
    manageWorkspaceSettings: false,
  };
}

export function mergePermissions(
  base: RolePermissions,
  partial: Partial<Record<keyof RolePermissions, boolean>>,
): RolePermissions {
  return { ...base, ...partial };
}

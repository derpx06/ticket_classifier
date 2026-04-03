import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { getCollections, nextSequence, type CompanyRoleDoc, type UserDoc } from "../config/db";
import {
  createCompanyRoleSchema,
  createTeamMemberSchema,
  updateCompanyRoleSchema,
  updateTeamMemberSchema,
} from "../schemas/teamSchemas";
import { defaultEmployeePermissions } from "../utils/permissions";

const BCRYPT_ROUNDS = 12;

function sendZodError(res: Response, err: ZodError): void {
  const first = err.issues[0];
  res.status(400).json({
    message: first?.message ?? "Validation failed",
    errors: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  });
}

function mapRoleRow(row: CompanyRoleDoc) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    baseRole: row.baseRole,
    permissions: row.permissions,
    createdAt: row.createdAt,
  };
}

export async function listRoles(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.auth!.companyId;
    const { companyRoles } = await getCollections();
    const rows = await companyRoles.find({ companyId }).sort({ name: 1 }).toArray();
    res.json({ roles: rows.map(mapRoleRow) });
  } catch (e) {
    console.error("listRoles", e);
    res.status(500).json({ message: "Could not load team roles." });
  }
}

export async function createRole(req: Request, res: Response): Promise<void> {
  try {
    const body = createCompanyRoleSchema.parse(req.body);
    const companyId = req.auth!.companyId;
    const { companyRoles } = await getCollections();
    const role: CompanyRoleDoc = {
      id: await nextSequence("company_roles"),
      companyId,
      name: body.name.trim(),
      baseRole: "employee",
      permissions: defaultEmployeePermissions(),
      description: body.description ?? null,
      createdAt: new Date(),
    };

    await companyRoles.insertOne(role);
    res.status(201).json({ role: mapRoleRow(role) });
  } catch (e) {
    if (e instanceof ZodError) {
      sendZodError(res, e);
      return;
    }
    const err = e as { code?: number };
    if (err.code === 11000) {
      res.status(409).json({ message: "A role with this name already exists." });
      return;
    }
    console.error("createRole", e);
    res.status(500).json({ message: "Could not create role." });
  }
}

export async function updateRole(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ message: "Invalid role id." });
      return;
    }
    const body = updateCompanyRoleSchema.parse(req.body);
    const companyId = req.auth!.companyId;
    const { companyRoles } = await getCollections();

    const set: Partial<CompanyRoleDoc> = {};
    if (body.name !== undefined) {
      set.name = body.name.trim();
    }
    if (body.description !== undefined) {
      set.description = body.description;
    }

    const updated = await companyRoles.findOneAndUpdate(
      { id, companyId },
      { $set: set },
      { returnDocument: "after" },
    );

    const role =
      "value" in (updated as Record<string, unknown>)
        ? (updated as { value?: CompanyRoleDoc | null }).value
        : (updated as CompanyRoleDoc | null);

    if (!role) {
      res.status(404).json({ message: "Role not found." });
      return;
    }

    res.json({ role: mapRoleRow(role) });
  } catch (e) {
    if (e instanceof ZodError) {
      sendZodError(res, e);
      return;
    }
    const err = e as { code?: number };
    if (err.code === 11000) {
      res.status(409).json({ message: "A role with this name already exists." });
      return;
    }
    console.error("updateRole", e);
    res.status(500).json({ message: "Could not update role." });
  }
}

export async function deleteRole(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid role id." });
    return;
  }
  const companyId = req.auth!.companyId;
  const { users, companyRoles } = await getCollections();

  const inUse = await users.countDocuments({ companyId, companyRoleId: id });
  if (inUse > 0) {
    res.status(400).json({ message: "Cannot delete a role that is assigned to team members." });
    return;
  }

  const del = await companyRoles.deleteOne({ id, companyId });
  if (del.deletedCount === 0) {
    res.status(404).json({ message: "Role not found." });
    return;
  }
  res.status(204).send();
}

export async function listMembers(req: Request, res: Response): Promise<void> {
  try {
    const companyId = req.auth!.companyId;
    const { users, companyRoles } = await getCollections();
    const [members, roles] = await Promise.all([
      users.find({ companyId }).sort({ fullName: 1 }).toArray(),
      companyRoles
        .find({ companyId }, { projection: { _id: 0, id: 1, name: 1, baseRole: 1 } })
        .toArray(),
    ]);

    const roleById = new Map(roles.map((r) => [r.id, r]));
    res.json({
      members: members.map((row) => {
        const companyRole = row.companyRoleId != null ? roleById.get(row.companyRoleId) : null;
        return {
          id: row.id,
          fullName: row.fullName,
          email: row.email,
          systemRole: row.role,
          companyRole: companyRole
            ? {
                id: companyRole.id,
                name: companyRole.name,
                baseRole: companyRole.baseRole,
              }
            : null,
        };
      }),
    });
  } catch (e) {
    console.error("listMembers", e);
    res.status(500).json({ message: "Could not load team members." });
  }
}

export async function createMember(req: Request, res: Response): Promise<void> {
  try {
    const body = createTeamMemberSchema.parse(req.body);
    const companyId = req.auth!.companyId;
    const emailNorm = body.email.trim().toLowerCase();
    const { users, companyRoles } = await getCollections();

    const role = await companyRoles.findOne({ id: body.companyRoleId, companyId }, { projection: { _id: 1 } });
    if (!role) {
      res.status(400).json({ message: "Invalid team role for this company." });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    const user: UserDoc = {
      id: await nextSequence("users"),
      companyId,
      email: emailNorm,
      passwordHash,
      fullName: body.fullName.trim(),
      role: "employee",
      managerId: null,
      companyRoleId: body.companyRoleId,
      createdAt: new Date(),
    };

    await users.insertOne(user);
    res.status(201).json({
      member: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        systemRole: user.role,
        companyRoleId: user.companyRoleId,
      },
    });
  } catch (e) {
    if (e instanceof ZodError) {
      sendZodError(res, e);
      return;
    }
    const err = e as { code?: number };
    if (err.code === 11000) {
      res.status(409).json({ message: "A user with this email already exists." });
      return;
    }
    console.error("createMember", e);
    res.status(500).json({ message: "Could not add team member." });
  }
}

export async function updateMember(req: Request, res: Response): Promise<void> {
  try {
    const memberId = Number(req.params.id);
    if (!Number.isFinite(memberId)) {
      res.status(400).json({ message: "Invalid member id." });
      return;
    }
    const body = updateTeamMemberSchema.parse(req.body);
    const companyId = req.auth!.companyId;
    const { users, companyRoles } = await getCollections();

    const current = await users.findOne(
      { id: memberId, companyId },
      { projection: { _id: 0, role: 1, companyRoleId: 1 } },
    );
    if (!current) {
      res.status(404).json({ message: "Member not found." });
      return;
    }

    if (current.role === "admin") {
      res.status(400).json({ message: "Organization admins cannot be edited from Teams." });
      return;
    }

    const finalCompanyRoleId = body.companyRoleId ?? current.companyRoleId;
    if (body.companyRoleId !== undefined) {
      const roleExists = await companyRoles.findOne(
        { id: body.companyRoleId, companyId },
        { projection: { _id: 1 } },
      );
      if (!roleExists) {
        res.status(400).json({ message: "Invalid team role." });
        return;
      }
    }

    await users.updateOne(
      { id: memberId, companyId },
      {
        $set: {
          role: "employee",
          companyRoleId: finalCompanyRoleId,
          managerId: null,
        },
      },
    );
    res.json({ success: true });
  } catch (e) {
    if (e instanceof ZodError) {
      sendZodError(res, e);
      return;
    }
    console.error("updateMember", e);
    res.status(500).json({ message: "Could not update member." });
  }
}

export async function deleteMember(req: Request, res: Response): Promise<void> {
  const memberId = Number(req.params.id);
  if (!Number.isFinite(memberId)) {
    res.status(400).json({ message: "Invalid member id." });
    return;
  }
  const companyId = req.auth!.companyId;
  const adminId = req.auth!.userId;
  const { users } = await getCollections();

  if (memberId === adminId) {
    res.status(400).json({ message: "You cannot remove your own account." });
    return;
  }

  const target = await users.findOne(
    { id: memberId, companyId },
    { projection: { _id: 0, role: 1 } },
  );
  if (!target) {
    res.status(404).json({ message: "Member not found." });
    return;
  }

  if (target.role === "admin") {
    const admins = await users.countDocuments({ companyId, role: "admin" });
    if (admins <= 1) {
      res.status(400).json({ message: "Cannot remove the only company administrator." });
      return;
    }
  }

  await users.deleteOne({ id: memberId, companyId });
  res.status(204).send();
}

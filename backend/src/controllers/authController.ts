import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { ZodError } from "zod";
import { getCollections, nextSequence, type UserDoc } from "../config/db";
import { env } from "../config/env";
import { loginSchema, registerSchema } from "../schemas/authSchemas";
import { insertDefaultCompanyRoles } from "../utils/seedCompanyRoles";

const BCRYPT_ROUNDS = 12;

function signToken(userId: number, role: string, companyId: number): string {
  const signOptions = { expiresIn: env.jwtExpiresIn } as SignOptions;
  return jwt.sign({ sub: userId, role, companyId }, env.jwtSecret, signOptions);
}

function sendZodError(res: Response, err: ZodError): void {
  const first = err.issues[0];
  res.status(400).json({
    message: first?.message ?? "Validation failed",
    errors: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  });
}

function buildUserResponse(
  row: UserDoc,
  company: {
    name: string;
    countryCode: string | null;
    about: string | null;
    website: string | null;
    industry: string | null;
    phone: string | null;
  },
  companyRole: { id: number; name: string; baseRole: string; permissions: Record<string, unknown> } | null,
): Record<string, unknown> {
  return {
    id: row.id,
    name: row.fullName,
    email: row.email,
    role: row.role,
    companyId: row.companyId,
    company: {
      name: company.name,
      countryCode: company.countryCode,
      about: company.about,
      website: company.website,
      industry: company.industry,
      phone: company.phone,
    },
    companyRole,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);
    const emailNorm = body.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    const companyDisplayName =
      body.companyName?.trim() || `${body.fullName.trim()}'s Organization`;

    const { companies, users } = await getCollections();

    const existing = await users.findOne({ email: emailNorm }, { projection: { _id: 1 } });
    if (existing) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    const companyId = await nextSequence("companies");
    await companies.insertOne({
      id: companyId,
      name: companyDisplayName,
      countryCode: body.countryCode,
      about: body.companyAbout ?? null,
      website: body.companyWebsite ?? null,
      industry: body.companyIndustry ?? null,
      phone: body.companyPhone ?? null,
      adminUserId: null,
      createdAt: new Date(),
    });

    const userId = await nextSequence("users");
    let userRow: UserDoc;
    try {
      userRow = {
        id: userId,
        companyId,
        email: emailNorm,
        passwordHash,
        fullName: body.fullName.trim(),
        role: "admin",
        managerId: null,
        companyRoleId: null,
        createdAt: new Date(),
      };
      await users.insertOne(userRow);
    } catch (error) {
      await companies.deleteOne({ id: companyId });
      const err = error as { code?: number };
      if (err.code === 11000) {
        res.status(409).json({ message: "An account with this email already exists." });
        return;
      }
      throw error;
    }

    await companies.updateOne(
      { id: companyId },
      {
        $set: { adminUserId: userId },
      },
    );

    await insertDefaultCompanyRoles(companyId);

    const token = signToken(userRow.id, userRow.role, userRow.companyId);
    res.status(201).json({
      token,
      user: buildUserResponse(
        userRow,
        {
          name: companyDisplayName,
          countryCode: body.countryCode,
          about: body.companyAbout ?? null,
          website: body.companyWebsite ?? null,
          industry: body.companyIndustry ?? null,
          phone: body.companyPhone ?? null,
        },
        null,
      ),
    });
  } catch (e) {
    if (e instanceof ZodError) {
      sendZodError(res, e);
      return;
    }
    console.error("register error", e);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const emailNorm = body.email.trim().toLowerCase();
    const { companies, users, companyRoles } = await getCollections();

    const row = await users.findOne({ email: emailNorm });
    if (!row) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const ok = await bcrypt.compare(body.password, row.passwordHash);
    if (!ok) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const company = await companies.findOne({ id: row.companyId });
    if (!company) {
      res.status(500).json({ message: "Company record not found for this user." });
      return;
    }

    const roleDoc =
      row.companyRoleId != null
        ? await companyRoles.findOne({ id: row.companyRoleId, companyId: row.companyId })
        : null;

    const companyRole =
      roleDoc != null
        ? {
            id: roleDoc.id,
            name: roleDoc.name,
            baseRole: roleDoc.baseRole,
            permissions: roleDoc.permissions as Record<string, unknown>,
          }
        : null;

    const token = signToken(row.id, row.role, row.companyId);

    res.json({
      token,
      user: buildUserResponse(
        row,
        {
          name: company.name,
          countryCode: company.countryCode,
          about: company.about,
          website: company.website,
          industry: company.industry,
          phone: company.phone,
        },
        companyRole,
      ),
    });
  } catch (e) {
    if (e instanceof ZodError) {
      sendZodError(res, e);
      return;
    }
    console.error("login error", e);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
}

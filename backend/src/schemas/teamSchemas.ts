import { z } from "zod";

export const createCompanyRoleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(100),
  description: z.string().trim().max(500).optional(),
});

export const updateCompanyRoleSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
});

export const createTeamMemberSchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  email: z.string().trim().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyRoleId: z.coerce.number().int().positive(),
});

export const updateTeamMemberSchema = z
  .object({
    companyRoleId: z.coerce.number().int().positive().optional(),
  })
  .refine((d) => d.companyRoleId !== undefined, {
    message: "Provide at least one field to update",
  });

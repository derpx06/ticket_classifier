import { getCollections, type CompanyRoleDoc } from "../config/db";

type RoleMatch = { id: number; name: string };

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  billing: ["billing", "payment", "invoice", "charge", "refund", "subscription"],
  technical: ["technical", "tech", "engineering", "bug", "error", "issue", "crash", "outage"],
  login: ["login", "signin", "sign in", "password", "reset", "auth", "access"],
  other: ["support", "help", "general", "customer"],
};

const normalize = (value: unknown): string => String(value ?? "").trim().toLowerCase();

const scoreRole = (role: CompanyRoleDoc, keywords: string[], category: string): number => {
  const name = normalize(role.name);
  const description = normalize(role.description);
  const text = `${name} ${description}`.trim();
  if (!text) return 0;

  let score = 0;
  if (category && name === category) score += 4;
  if (category && name.includes(category)) score += 3;
  if (category && description.includes(category)) score += 2;

  keywords.forEach((kw) => {
    if (!kw) return;
    if (name.includes(kw)) score += 2;
    if (description.includes(kw)) score += 1;
  });

  return score;
};

export async function resolveAssignedRole(
  companyId: number,
  category?: string,
  message?: string,
): Promise<RoleMatch | null> {
  const { companyRoles } = await getCollections();
  const roles = await companyRoles.find({ companyId }).sort({ name: 1 }).toArray();
  if (!roles.length) return null;

  const normalizedCategory = normalize(category);
  const messageText = normalize(message);
  const keywords = new Set<string>();
  if (normalizedCategory && CATEGORY_KEYWORDS[normalizedCategory]) {
    CATEGORY_KEYWORDS[normalizedCategory].forEach((kw) => keywords.add(kw));
  }
  messageText.split(/\s+/).forEach((token) => {
    if (token.length >= 4) keywords.add(token);
  });

  let bestRole: CompanyRoleDoc | null = null;
  let bestScore = -1;

  for (const role of roles) {
    const score = scoreRole(role, Array.from(keywords), normalizedCategory);
    if (score > bestScore) {
      bestScore = score;
      bestRole = role;
    }
  }

  const chosen = bestRole ?? roles[0];
  return chosen ? { id: chosen.id, name: chosen.name } : null;
}

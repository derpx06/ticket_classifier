import { MongoClient, type Collection, type Db } from "mongodb";
import { env } from "./env";
import { defaultEmployeePermissions, type RolePermissions } from "../utils/permissions";

type BaseSystemRole = "admin" | "employee" | "manager";
type BaseTeamRole = "employee" | "manager";

export type CompanyDoc = {
  id: number;
  name: string;
  countryCode: string | null;
  about: string | null;
  website: string | null;
  industry: string | null;
  phone: string | null;
  adminUserId: number | null;
  createdAt: Date;
};

export type UserDoc = {
  id: number;
  companyId: number;
  email: string;
  passwordHash: string;
  fullName: string;
  role: BaseSystemRole;
  managerId: number | null;
  companyRoleId: number | null;
  createdAt: Date;
};

export type CompanyRoleDoc = {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
  baseRole: BaseTeamRole;
  permissions: RolePermissions;
  createdAt: Date;
};

export type QuestionDoc = {
  id: number;
  companyId: number;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: Date;
};

export type ApiKeyDoc = {
  id: number;
  companyId: number;
  key: string;
  label: string;
  isActive: boolean;
  createdAt: Date;
};

export type SitemapDoc = {
  companyId: number;
  pages: Array<{ url: string; title: string }>;
  updatedAt: Date;
};



type CounterDoc = {
  _id: string;
  seq: number;
};

let client: MongoClient | null = null;
let db: Db | null = null;
let connectPromise: Promise<void> | null = null;
let indexesReady = false;

function collections(database: Db): {
  companies: Collection<CompanyDoc>;
  users: Collection<UserDoc>;
  companyRoles: Collection<CompanyRoleDoc>;
  questions: Collection<QuestionDoc>;
  counters: Collection<CounterDoc>;
  apiKeys: Collection<ApiKeyDoc>;
  sitemaps: Collection<SitemapDoc>;
} {
  return {
    companies: database.collection<CompanyDoc>("companies"),
    users: database.collection<UserDoc>("users"),
    companyRoles: database.collection<CompanyRoleDoc>("company_roles"),
    questions: database.collection<QuestionDoc>("questions"),
    counters: database.collection<CounterDoc>("counters"),
    apiKeys: database.collection<ApiKeyDoc>("api_keys"),
    sitemaps: database.collection<SitemapDoc>("sitemaps"),
  };
}



async function ensureIndexes(database: Db): Promise<void> {
  if (indexesReady) {
    return;
  }

  const { companies, users, companyRoles, apiKeys, sitemaps } = collections(database);

  await Promise.all([
    companies.createIndex({ id: 1 }, { unique: true }),
    users.createIndex({ id: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { unique: true }),
    users.createIndex({ companyId: 1 }),
    users.createIndex({ companyRoleId: 1 }),
    companyRoles.createIndex({ id: 1 }, { unique: true }),
    companyRoles.createIndex({ companyId: 1, name: 1 }, { unique: true }),
    companyRoles.createIndex({ companyId: 1 }),
    apiKeys.createIndex({ id: 1 }, { unique: true }),
    apiKeys.createIndex({ key: 1 }, { unique: true }),
    apiKeys.createIndex({ companyId: 1 }),
    sitemaps.createIndex({ companyId: 1 }, { unique: true }),
  ]);


  indexesReady = true;
}

export async function connectDb(): Promise<void> {
  if (db) {
    return;
  }
  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    client = new MongoClient(env.mongodbUri);
    await client.connect();
    db = client.db(env.mongodbDbName);
    await ensureIndexes(db);

    const { companyRoles } = collections(db);
    await companyRoles.updateMany(
      { baseRole: "manager" },
      { $set: { baseRole: "employee", permissions: defaultEmployeePermissions() } },
    );
  })();

  try {
    await connectPromise;
  } finally {
    connectPromise = null;
  }
}

export async function getCollections(): Promise<{
  companies: Collection<CompanyDoc>;
  users: Collection<UserDoc>;
  companyRoles: Collection<CompanyRoleDoc>;
  questions: Collection<QuestionDoc>;
  counters: Collection<CounterDoc>;
  apiKeys: Collection<ApiKeyDoc>;
  sitemaps: Collection<SitemapDoc>;
}> {

  await connectDb();
  if (!db) {
    throw new Error("Database is not connected.");
  }
  return collections(db);
}


export async function nextSequence(sequenceName: string): Promise<number> {
  const { counters } = await getCollections();

  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  const seq =
    "value" in (result as Record<string, unknown>)
      ? (result as { value?: CounterDoc | null }).value?.seq
      : (result as CounterDoc | null)?.seq;

  if (typeof seq !== "number") {
    throw new Error(`Failed to allocate sequence number for '${sequenceName}'.`);
  }

  return seq;
}

export const testDbConnection = async (): Promise<void> => {
  await connectDb();
  if (!db) {
    throw new Error("Database is not connected.");
  }
  const response = await db.command({ ping: 1 });
  if (response.ok !== 1) {
    throw new Error("Database ping failed.");
  }
};

export async function closeDbConnection(): Promise<void> {
  if (client) {
    await client.close();
  }
  client = null;
  db = null;
  indexesReady = false;
}

import type { IInvitationStatus, IWorkspaceMemberRole, IWorkspaceMemberWithoutOwner } from "@undb/authz"
import type { RECORD_EVENTS } from "@undb/table"
import type { IWebhookMethod } from "@undb/webhook"
import { sql } from "drizzle-orm"
import { index, integer, primaryKey, sqliteTableCreator, text, unique } from "drizzle-orm/sqlite-core"

const sqliteTable = sqliteTableCreator((name) => `undb_${name}`)

export const tables = sqliteTable(
  "table",
  {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    baseId: text("base_id")
      .notNull()
      .references(() => baseTable.id),

    schema: text("schema", { mode: "json" }).notNull(),
    views: text("views", { mode: "json" }).notNull(),
    forms: text("forms", { mode: "json" }),
    rls: text("rls", { mode: "json" }),

    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    updateAt: text("updated_at")
      .notNull()
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    updatedBy: text("updated_by")
      .notNull()
      .references(() => users.id),
  },
  (table) => {
    return {
      baseIdIdx: index("table_base_id_idx").on(table.baseId),
      uniqueOnName: unique("table_name_unique_idx").on(table.name, table.baseId),
    }
  },
)

export const tableIdMapping = sqliteTable(
  "table_id_mapping",
  {
    tableId: text("table_id")
      .notNull()
      .references(() => tables.id),
    subjectId: text("subject_id").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.tableId, table.subjectId] }),
    }
  },
)

export const rollupIdMapping = sqliteTable(
  "rollup_id_mapping",
  {
    fieldId: text("field_id").notNull(),
    tableId: text("table_id")
      .notNull()
      .references(() => tables.id),
    rollupId: text("rollup_id").notNull(),
    rollupTableId: text("rollup_table_id")
      .notNull()
      .references(() => tables.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.fieldId, table.rollupId] }),
    }
  },
)

export const outbox = sqliteTable("outbox", {
  id: text("id").notNull().primaryKey(),
  payload: text("payload", { mode: "json" }).notNull(),
  meta: text("meta", { mode: "json" }),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
  operatorId: text("operator_id").notNull(),
  name: text("name").notNull(),
})

export const users = sqliteTable(
  "user",
  {
    id: text("id").notNull().primaryKey(),
    username: text("username").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
  },
  (table) => {
    return {
      usernameIdx: index("user_username_idx").on(table.username),
      emailIdx: index("user_email_idx").on(table.email),
    }
  },
)

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
})

export const webhook = sqliteTable(
  "webhook",
  {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    method: text("method").notNull().$type<IWebhookMethod>(),
    enabled: integer("enabled", { mode: "boolean" }).notNull(),
    tableId: text("table_id")
      .notNull()
      .references(() => tables.id),
    headers: text("headers", { mode: "json" }).notNull(),
    condition: text("condition", { mode: "json" }),
    event: text("event").notNull().$type<RECORD_EVENTS>(),
  },
  (table) => {
    return {
      tableIdIdx: index("webhook_table_id_idx").on(table.tableId),
      urlIdx: index("webhook_url_idx").on(table.url),
    }
  },
)

export const audit = sqliteTable(
  "audit",
  {
    id: text("id").notNull().primaryKey(),
    timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
    detail: text("detail", { mode: "json" }),
    op: text("op").notNull().$type<RECORD_EVENTS>(),
    tableId: text("table_id").notNull(),
    recordId: text("record_id").notNull(),
    operatorId: text("operator_id").notNull(),
  },
  (table) => {
    return {
      tableIdIdx: index("audit_table_id_idx").on(table.tableId),
      recordIdIdx: index("audit_record_id_idx").on(table.recordId),
    }
  },
)

export const workspaceMember = sqliteTable("workspace_member", {
  id: text("id").notNull().primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull().$type<IWorkspaceMemberRole>(),
})

export const baseTable = sqliteTable("base", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  updateAt: text("updated_at")
    .notNull()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  updatedBy: text("updated_by")
    .notNull()
    .references(() => users.id),
})

export const shareTable = sqliteTable(
  "share",
  {
    id: text("id").notNull().primaryKey(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull(),
  },
  (table) => {
    return {
      uniqueIdx: unique("share_unique_idx").on(table.targetType, table.targetId),
    }
  },
)

export const invitations = sqliteTable("invitation", {
  id: text("id").notNull().primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().$type<IWorkspaceMemberWithoutOwner>(),
  status: text("status").notNull().$type<IInvitationStatus>(),
  invitedAt: integer("invited_at", { mode: "timestamp_ms" }).notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => users.id),
})

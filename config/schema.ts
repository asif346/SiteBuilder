import { json, text, timestamp } from "drizzle-orm/pg-core";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits:integer().default(3)
});

export const projectTable = pgTable('projects',{
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId:varchar().notNull().unique(),
  createdBy: integer().references(()=>usersTable.id),
  createdAt: timestamp().defaultNow()
});

export const frameTable = pgTable('frames',{
  id:integer().primaryKey().generatedAlwaysAsIdentity(),
  frameId:varchar(),
  designCode:text(),
  projectId: varchar().notNull().references(()=>projectTable.projectId)
});

export const chatTable = pgTable('chats',{
  id:integer().primaryKey().generatedAlwaysAsIdentity(),
  chatMessage:json(),
  frameId:varchar().references(()=>frameTable.frameId),
  createdBy: integer().references(()=>usersTable.id),
  createdAt: timestamp().defaultNow()

})
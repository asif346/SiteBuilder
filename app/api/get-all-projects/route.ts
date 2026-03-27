import { db } from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { chatTable, frameTable, projectTable, usersTable } from "@/config/schema";

export async function GET(req: NextRequest) {
  const user = await currentUser();

  const email = user?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return NextResponse.json([], { status: 401 });
  }

  // ✅ First get user from DB using email
  const dbUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const userId = dbUser[0]?.id;

  if (!userId) {
    return NextResponse.json([], { status: 404 });
  }

  // ✅ Now use userId (integer) instead of email
  const projects = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.createdBy, userId))
    .orderBy(desc(projectTable.id));

  const results: {
    projectId: string;
    frameId: string;
    chats: {
      id: number;
      chatMessage: unknown;
      createdBy: number | null;
      createdAt: Date | null;
    }[];
  }[] = [];

  for (const project of projects) {
    const frames = await db
      .select({ frameId: frameTable.frameId })
      .from(frameTable)
      .where(eq(frameTable.projectId, project.projectId));

    const frameIds = frames.map((f) => f.frameId);

    let chats: {
      id: number;
      chatMessage: unknown;
      createdBy: number | null;
      createdAt: Date | null;
      frameId: string | null;
    }[] = [];

    if (frameIds.length > 0) {
      chats = await db
        .select()
        .from(chatTable)
        //@ts-ignore
        .where(inArray(chatTable.frameId, frameIds));
    }

    for (const frame of frames) {
      results.push({
        projectId: project.projectId ?? "",
        frameId: frame.frameId ?? "",
        chats: chats.filter((c) => c.frameId === frame.frameId),
      });
    }
  }

  return NextResponse.json(results);
}